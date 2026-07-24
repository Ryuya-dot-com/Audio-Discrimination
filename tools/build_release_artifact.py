#!/usr/bin/env python3
"""Build a deterministic, provider-independent runtime release artifact."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys
import tempfile
from urllib.parse import unquote, urlsplit
import zipfile


MANIFEST_SCHEMA = "audio-discrimination-release-manifest/v1"
MANIFEST_NAME = "release_manifest.json"
CATALOG_NAME = "STIMULUS_CATALOG.json"
DEPLOYMENT_CONFIG_NAME = "deployment-config.json"
RUNTIME_SOURCE_FILES = (
    "index.html",
    "script.js",
    "session_safety.js",
    "result_bundle.js",
    "deployment_policy.js",
    CATALOG_NAME,
)
BUILD_ASSET_FILES = (
    "index.html",
    "script.js",
    "session_safety.js",
    "result_bundle.js",
    "deployment_policy.js",
    DEPLOYMENT_CONFIG_NAME,
)
LEGACY_TOP_LEVEL_DIRECTORIES = frozenset(
    {
        "pitch_discrimination",
        "formant_discrimination",
        "duration_discrimination",
        "risetime_discrimination",
    }
)
FORBIDDEN_TOP_LEVEL_DIRECTORIES = frozenset(
    {".git", ".github", "docs", "Readings", "tools"}
)
HEX_COMMIT_RE = re.compile(r"[0-9a-f]{40}")
DEPLOYMENT_ID_RE = re.compile(r"[A-Za-z][A-Za-z0-9_.-]{0,63}")
STIMULUS_SET_ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}")
CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]")
DEPLOYMENT_CONFIG_KEYS = frozenset(
    {
        "schema_version",
        "deployment_id",
        "environment",
        "research_session_enabled",
        "researcher_ui_enabled",
        "researcher_origin",
        "participant_origin",
        "public_participant_base_url",
        "allowed_return_url_origins",
        "local_test_sessions_enabled",
    }
)
ZIP_MIN_EPOCH = 315532800  # 1980-01-01T00:00:00Z
ZIP_MAX_EPOCH = 4354819198  # 2107-12-31T23:59:58Z


class ReleaseBuildError(RuntimeError):
    """Raised when a release artifact cannot be built safely."""


def run_git(source_root: Path, *args: str) -> str:
    process = subprocess.run(
        ["git", *args],
        cwd=source_root,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if process.returncode != 0:
        detail = process.stderr.strip() or process.stdout.strip() or "unknown git error"
        raise ReleaseBuildError(f"git {' '.join(args)} failed: {detail}")
    return process.stdout.strip()


def checked_member_name(value: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value or CONTROL_RE.search(value):
        raise ReleaseBuildError(f"Unsafe release member name: {value!r}")
    path = PurePosixPath(value)
    if path.is_absolute() or path.as_posix() != value or any(part in {"", ".", ".."} for part in path.parts):
        raise ReleaseBuildError(f"Unsafe release member name: {value!r}")
    if path.parts[0] in FORBIDDEN_TOP_LEVEL_DIRECTORIES | LEGACY_TOP_LEVEL_DIRECTORIES:
        raise ReleaseBuildError(f"Forbidden release member: {value}")
    if path.suffix.lower() == ".pdf":
        raise ReleaseBuildError(f"PDF files cannot be release members: {value}")
    lower_name = path.name.lower()
    if "_audio_discrimination" in lower_name and path.suffix.lower() in {".csv", ".zip"}:
        raise ReleaseBuildError(f"Participant result files cannot be release members: {value}")
    return value


def load_json(path: Path, label: str) -> dict:
    def reject_constant(value: str) -> None:
        raise ValueError(f"non-standard numeric constant {value}")

    try:
        value = json.loads(
            path.read_text(encoding="utf-8"),
            parse_constant=reject_constant,
        )
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError) as error:
        raise ReleaseBuildError(f"Could not read {label}: {error}") from error
    if not isinstance(value, dict):
        raise ReleaseBuildError(f"{label} must be a JSON object.")
    return value


def canonical_json_bytes(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")


def parsed_https_url(value: object, label: str) -> tuple[object, str]:
    if not isinstance(value, str) or not value or CONTROL_RE.search(value) or any(char.isspace() for char in value):
        raise ReleaseBuildError(f"{label} must be a canonical HTTPS URL.")
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError as error:
        raise ReleaseBuildError(f"{label} must be a canonical HTTPS URL: {error}") from error
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or parsed.query
        or parsed.fragment
    ):
        raise ReleaseBuildError(f"{label} must be a canonical HTTPS URL without credentials, query, or fragment.")
    try:
        parsed.hostname.encode("ascii")
    except UnicodeEncodeError as error:
        raise ReleaseBuildError(f"{label} must use its canonical ASCII hostname.") from error
    host = parsed.hostname.lower()
    display_host = f"[{host}]" if ":" in host else host
    origin = f"https://{display_host}"
    if port not in {None, 443}:
        origin = f"{origin}:{port}"
    canonical_netloc = origin.removeprefix("https://")
    if parsed.netloc != canonical_netloc:
        raise ReleaseBuildError(f"{label} is not canonical (host case or default port differs).")
    return parsed, origin


def exact_https_origin(value: object, label: str) -> str:
    parsed, origin = parsed_https_url(value, label)
    if parsed.path or value != origin:
        raise ReleaseBuildError(f"{label} must be an exact HTTPS origin without a trailing slash or path.")
    return origin


def participant_base_url(value: object, participant_origin: str) -> str:
    parsed, origin = parsed_https_url(value, "public_participant_base_url")
    decoded_segments = unquote(parsed.path).split("/")
    if (
        origin != participant_origin
        or not parsed.path.startswith("/")
        or not parsed.path.endswith("/")
        or "\\" in parsed.path
        or any(segment in {".", ".."} for segment in decoded_segments)
        or value != f"{origin}{parsed.path}"
    ):
        raise ReleaseBuildError(
            "public_participant_base_url must be canonical, end in /, and use participant_origin."
        )
    return value


def validate_deployment_config(config: dict, allow_preview: bool) -> None:
    """Mirror deployment_policy.js and add release-specific production checks."""
    if set(config) != DEPLOYMENT_CONFIG_KEYS:
        missing = sorted(DEPLOYMENT_CONFIG_KEYS - set(config))
        extra = sorted(set(config) - DEPLOYMENT_CONFIG_KEYS)
        raise ReleaseBuildError(
            f"Deployment configuration keys do not match schema 1 (missing={missing}, extra={extra})."
        )
    if config.get("schema_version") != 1:
        raise ReleaseBuildError("Deployment configuration must use schema_version 1.")
    deployment_id = config.get("deployment_id")
    if not isinstance(deployment_id, str) or not DEPLOYMENT_ID_RE.fullmatch(deployment_id):
        raise ReleaseBuildError("Deployment configuration has an invalid deployment_id.")
    environment = config.get("environment")
    if environment not in {"preview", "staging", "production"}:
        raise ReleaseBuildError("Deployment configuration has an invalid environment.")
    for key in ("research_session_enabled", "researcher_ui_enabled", "local_test_sessions_enabled"):
        if type(config.get(key)) is not bool:
            raise ReleaseBuildError(f"Deployment configuration {key} must be boolean.")
    if environment == "preview" and config["research_session_enabled"]:
        raise ReleaseBuildError("A preview deployment cannot enable research sessions.")
    if environment != "production" and not (allow_preview and environment == "preview"):
        raise ReleaseBuildError(
            "Release artifacts require environment=production. "
            "Use --allow-preview-config only for an explicitly labelled preview artifact."
        )
    if environment == "production" and not config["research_session_enabled"]:
        raise ReleaseBuildError("A production release artifact must enable research sessions.")
    if environment == "production" and not config["researcher_ui_enabled"]:
        raise ReleaseBuildError(
            "The current researcher-configured production artifact must enable the researcher UI."
        )
    researcher_origin = exact_https_origin(config.get("researcher_origin"), "researcher_origin")
    participant_origin = exact_https_origin(config.get("participant_origin"), "participant_origin")
    participant_base_url(config.get("public_participant_base_url"), participant_origin)
    return_origins = config.get("allowed_return_url_origins")
    if not isinstance(return_origins, list):
        raise ReleaseBuildError("allowed_return_url_origins must be an array.")
    normalized_return_origins = [
        "*" if value == "*" else exact_https_origin(
            value, f"allowed_return_url_origins[{index}]"
        )
        for index, value in enumerate(return_origins)
    ]
    if len(set(normalized_return_origins)) != len(normalized_return_origins):
        raise ReleaseBuildError("allowed_return_url_origins must not contain duplicates.")
    # Resolve both here so future schema changes remain localized to this validator.
    if not researcher_origin or not participant_origin:  # pragma: no cover - guarded above
        raise ReleaseBuildError("Researcher and participant origins are required.")


def require_clean_commit(source_root: Path, expected_commit: str | None) -> tuple[str, int]:
    try:
        inside_work_tree = run_git(source_root, "rev-parse", "--is-inside-work-tree")
    except (FileNotFoundError, ReleaseBuildError) as error:
        raise ReleaseBuildError(f"Source root is not a Git working tree: {source_root}") from error
    if inside_work_tree != "true":
        raise ReleaseBuildError(f"Source root is not a Git working tree: {source_root}")
    head = run_git(source_root, "rev-parse", "HEAD")
    if not HEX_COMMIT_RE.fullmatch(head):
        raise ReleaseBuildError("Could not resolve HEAD to a full SHA-1 commit ID.")
    if expected_commit is not None:
        normalized = expected_commit.lower()
        if not HEX_COMMIT_RE.fullmatch(normalized):
            raise ReleaseBuildError("--source-commit must be a full 40-character commit ID.")
        if normalized != head:
            raise ReleaseBuildError(f"Source commit mismatch: expected {normalized}, found {head}.")
    status_output = run_git(source_root, "status", "--porcelain=v1", "--untracked-files=all")
    if status_output:
        first_lines = "; ".join(status_output.splitlines()[:5])
        raise ReleaseBuildError(f"Git working tree is not clean: {first_lines}")
    try:
        commit_epoch = int(run_git(source_root, "show", "-s", "--format=%ct", head))
    except ValueError as error:
        raise ReleaseBuildError("Git commit timestamp is invalid.") from error
    return head, commit_epoch


def resolve_epoch(commit_epoch: int) -> tuple[int, str]:
    raw_epoch = os.environ.get("SOURCE_DATE_EPOCH")
    if raw_epoch is None:
        epoch = commit_epoch
        source = "source_commit"
    else:
        try:
            epoch = int(raw_epoch)
        except ValueError as error:
            raise ReleaseBuildError("SOURCE_DATE_EPOCH must be an integer Unix timestamp.") from error
        source = "SOURCE_DATE_EPOCH"
    if epoch < ZIP_MIN_EPOCH or epoch > ZIP_MAX_EPOCH:
        raise ReleaseBuildError("Release timestamp is outside the ZIP-supported UTC range (1980–2107).")
    return epoch, source


def tracked_files(source_root: Path) -> set[str]:
    output = run_git(source_root, "ls-files", "-z")
    return {name for name in output.split("\0") if name}


def add_source_member(
    members: dict[str, bytes],
    source_root: Path,
    tracked: set[str],
    member_name: str,
) -> None:
    name = checked_member_name(member_name)
    if name in members:
        raise ReleaseBuildError(f"Duplicate release member: {name}")
    if name not in tracked:
        raise ReleaseBuildError(f"Runtime source is not tracked by Git: {name}")
    path = source_root.joinpath(*PurePosixPath(name).parts)
    if path.is_symlink() or not path.is_file():
        raise ReleaseBuildError(f"Runtime source must be a regular non-symlink file: {name}")
    try:
        members[name] = path.read_bytes()
    except OSError as error:
        raise ReleaseBuildError(f"Could not read runtime source {name}: {error}") from error


def single_relative_name(value: object, label: str) -> str:
    if not isinstance(value, str):
        raise ReleaseBuildError(f"{label} must be a relative filename.")
    checked_member_name(value)
    path = PurePosixPath(value)
    if len(path.parts) != 1:
        raise ReleaseBuildError(f"{label} must be a single relative filename.")
    return value


def collect_stimulus_members(
    members: dict[str, bytes], source_root: Path, tracked: set[str], catalog: dict
) -> list[str]:
    bindings = catalog.get("bindings")
    sets = catalog.get("sets")
    if not isinstance(bindings, dict) or not bindings:
        raise ReleaseBuildError("Stimulus catalog requires at least one protocol binding.")
    if not isinstance(sets, dict):
        raise ReleaseBuildError("Stimulus catalog requires a sets object.")

    set_ids: list[str] = []
    for protocol_id, raw_set_id in sorted(bindings.items()):
        if not isinstance(protocol_id, str) or not isinstance(raw_set_id, str):
            raise ReleaseBuildError("Stimulus catalog bindings must map strings to strings.")
        if raw_set_id not in set_ids:
            set_ids.append(raw_set_id)

    for set_id in sorted(set_ids):
        if not STIMULUS_SET_ID_RE.fullmatch(set_id):
            raise ReleaseBuildError(f"Unsafe stimulus set ID: {set_id!r}")
        set_entry = sets.get(set_id)
        if not isinstance(set_entry, dict) or set_entry.get("validated") is not True:
            raise ReleaseBuildError(f"Bound stimulus set is missing or unvalidated: {set_id}")
        expected_root = f"stimulus_sets/{set_id}"
        checked_member_name(expected_root)
        if set_entry.get("root") != expected_root:
            raise ReleaseBuildError(
                f"Bound stimulus root must be exactly {expected_root}; got {set_entry.get('root')!r}."
            )
        manifest_name = set_entry.get("manifest")
        expected_manifest = f"{expected_root}/STIMULUS_MANIFEST.json"
        if manifest_name != expected_manifest:
            raise ReleaseBuildError(f"Unexpected stimulus manifest path for {set_id}: {manifest_name!r}")

        manifest_path = source_root / expected_manifest
        manifest = load_json(manifest_path, f"stimulus manifest {set_id}")
        if manifest.get("stimulus_set_id") != set_id:
            raise ReleaseBuildError(f"Stimulus manifest ID does not match catalog set {set_id}.")
        add_source_member(members, source_root, tracked, expected_manifest)

        generator = manifest.get("generator")
        if not isinstance(generator, dict):
            raise ReleaseBuildError(f"Stimulus manifest {set_id} requires generator metadata.")
        parameters_name = single_relative_name(
            generator.get("parameters_file"), f"{set_id} generator.parameters_file"
        )
        checksums_name = single_relative_name(
            manifest.get("checksums_file"), f"{set_id} checksums_file"
        )
        add_source_member(members, source_root, tracked, f"{expected_root}/{parameters_name}")
        add_source_member(members, source_root, tracked, f"{expected_root}/{checksums_name}")

        task_ids = set_entry.get("task_ids")
        manifest_tasks = manifest.get("tasks")
        if not isinstance(task_ids, list) or not task_ids or not isinstance(manifest_tasks, dict):
            raise ReleaseBuildError(f"Stimulus set {set_id} requires catalog and manifest task inventories.")
        if len(task_ids) != len(set(task_ids)):
            raise ReleaseBuildError(f"Stimulus set {set_id} has duplicate task IDs.")
        expected_task_names = {f"{task_id}_discrimination" for task_id in task_ids}
        if set(manifest_tasks) != expected_task_names:
            raise ReleaseBuildError(f"Stimulus task inventory mismatch for {set_id}.")
        for task_name in sorted(expected_task_names):
            task_entry = manifest_tasks[task_name]
            file_count = task_entry.get("file_count") if isinstance(task_entry, dict) else None
            if not isinstance(file_count, int) or isinstance(file_count, bool) or not 1 <= file_count <= 10000:
                raise ReleaseBuildError(f"Invalid file_count for {set_id}/{task_name}.")
            for file_index in range(1, file_count + 1):
                add_source_member(
                    members,
                    source_root,
                    tracked,
                    f"{expected_root}/{task_name}/Stimuli/{file_index}.flac",
                )
    return sorted(set_ids)


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def member_records(members: dict[str, bytes]) -> list[dict[str, object]]:
    return [
        {"path": name, "sha256": sha256_hex(members[name]), "size": len(members[name])}
        for name in sorted(members)
    ]


def aggregate_sha256(records: list[dict[str, object]]) -> str:
    digest = hashlib.sha256()
    for record in records:
        digest.update(str(record["path"]).encode("utf-8"))
        digest.update(b"\0")
        digest.update(bytes.fromhex(str(record["sha256"])))
        digest.update(int(record["size"]).to_bytes(8, "big"))
    return digest.hexdigest()


def zip_info(name: str, epoch: int) -> zipfile.ZipInfo:
    timestamp = dt.datetime.fromtimestamp(epoch, tz=dt.timezone.utc)
    # ZIP timestamps have a two-second resolution.
    date_time = (timestamp.year, timestamp.month, timestamp.day, timestamp.hour, timestamp.minute, timestamp.second // 2 * 2)
    info = zipfile.ZipInfo(filename=name, date_time=date_time)
    info.compress_type = zipfile.ZIP_STORED
    info.create_system = 3
    info.external_attr = (stat.S_IFREG | 0o644) << 16
    info.internal_attr = 0
    return info


def build_release(
    source_root: Path,
    output_path: Path,
    deployment_config_path: Path,
    expected_commit: str | None = None,
    allow_preview_config: bool = False,
) -> dict:
    source_root = source_root.resolve()
    output_path = output_path.resolve()
    deployment_config_path = deployment_config_path.resolve()
    if output_path.exists():
        raise ReleaseBuildError(f"Output already exists; refusing to overwrite it: {output_path}")
    head, commit_epoch = require_clean_commit(source_root, expected_commit)
    epoch, timestamp_source = resolve_epoch(commit_epoch)
    tracked = tracked_files(source_root)

    members: dict[str, bytes] = {}
    for name in RUNTIME_SOURCE_FILES:
        add_source_member(members, source_root, tracked, name)

    try:
        catalog = json.loads(members[CATALOG_NAME].decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError) as error:
        raise ReleaseBuildError(f"Could not read stimulus catalog: {error}") from error
    if not isinstance(catalog, dict):
        raise ReleaseBuildError("Stimulus catalog must be a JSON object.")
    stimulus_set_ids = collect_stimulus_members(members, source_root, tracked, catalog)

    deployment_config = load_json(deployment_config_path, "deployment configuration")
    validate_deployment_config(deployment_config, allow_preview_config)
    members[DEPLOYMENT_CONFIG_NAME] = canonical_json_bytes(deployment_config)

    records = member_records(members)
    aggregate = aggregate_sha256(records)
    build_assets = {
        name: sha256_hex(members[name])
        for name in BUILD_ASSET_FILES
    }
    generated_at = dt.datetime.fromtimestamp(epoch, tz=dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    release_manifest = {
        "aggregate_algorithm": (
            "For payload members in path order: SHA-256(UTF-8 path + NUL + "
            "raw 32-byte member SHA-256 + unsigned 8-byte big-endian size)."
        ),
        "aggregate_sha256": aggregate,
        "build_asset_sha256": build_assets,
        "deployment": {
            "config_sha256": sha256_hex(members[DEPLOYMENT_CONFIG_NAME]),
            "deployment_id": deployment_config["deployment_id"],
            "environment": deployment_config["environment"],
        },
        "generated_at": generated_at,
        "member_count": len(records),
        "members": records,
        "schema": MANIFEST_SCHEMA,
        "schema_version": 1,
        "source_commit": head,
        "source_date_epoch": epoch,
        "stimulus_set_ids": stimulus_set_ids,
        "timestamp_source": timestamp_source,
    }
    members[MANIFEST_NAME] = canonical_json_bytes(release_manifest)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_name: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            prefix=f".{output_path.name}.", suffix=".tmp", dir=output_path.parent, delete=False
        ) as temporary:
            temporary_name = temporary.name
        with zipfile.ZipFile(temporary_name, "w", allowZip64=True) as archive:
            for name in sorted(members):
                archive.writestr(zip_info(name, epoch), members[name])
        os.replace(temporary_name, output_path)
        temporary_name = None
    finally:
        if temporary_name is not None:
            try:
                os.unlink(temporary_name)
            except FileNotFoundError:
                pass
    return release_manifest


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--deployment-config", type=Path, required=True)
    parser.add_argument(
        "--source-commit",
        help="Full commit ID expected at HEAD; mismatches are rejected.",
    )
    parser.add_argument(
        "--allow-preview-config",
        action="store_true",
        help="Allow environment=preview for a deliberately labelled preview artifact.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        manifest = build_release(
            source_root=args.source_root,
            output_path=args.output,
            deployment_config_path=args.deployment_config,
            expected_commit=args.source_commit,
            allow_preview_config=args.allow_preview_config,
        )
    except ReleaseBuildError as error:
        print(f"release build refused: {error}", file=sys.stderr)
        return 2
    print(
        f"built {args.output} from {manifest['source_commit']} "
        f"({manifest['member_count']} payload members, {manifest['aggregate_sha256']})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
