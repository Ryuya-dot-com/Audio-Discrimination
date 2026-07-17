#!/usr/bin/env python3
"""Strict, dependency-free validator for Audio Discrimination result ZIPs.

The validator intentionally treats a bundle as untrusted input.  It verifies the
container before parsing its contents, then binds the manifest to both CSV files
and checks the identifiers that join those three representations.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import stat
import sys
import unicodedata
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, NoReturn


RESULT_BUNDLE_SCHEMA_VERSION = 2
TRIAL_SCHEMA_VERSION = 10
WIDE_SCHEMA_VERSION = 8

MANIFEST_NAME = "session_manifest.json"
MAX_ARCHIVE_BYTES = 256 * 1024 * 1024
MAX_MEMBER_BYTES = 128 * 1024 * 1024
MAX_MANIFEST_BYTES = 2 * 1024 * 1024

SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")
SUBJECT_ID_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_-]{0,31}$")
SESSION_RUN_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$")
CSV_NAME_PATTERN = re.compile(
    r"^(?P<subject>[A-Za-z][A-Za-z0-9_-]{0,31})_"
    r"(?P<run>[A-Za-z0-9][A-Za-z0-9_-]{0,127})_"
    r"audio_discrimination_(?P<kind>trials|wide)\.csv$"
)
FORMULA_PREFIXES = ("=", "+", "-", "@")
BUILD_ASSET_NAMES = ("index.html", "result_bundle.js", "session_safety.js", "script.js")

EXPECTED_TOP_LEVEL_KEYS = frozenset(
    {
        "result_bundle_schema_version",
        "generated_at_utc",
        "data_classification",
        "automatic_upload_performed",
        "administration_mode",
        "result_return_requires_external_portal_receipt",
        "session",
        "study",
        "implementation",
        "procedure",
        "provenance",
        "files",
    }
)
EXPECTED_SESSION_KEYS = frozenset(
    {
        "subject_id",
        "session_run_id",
        "status",
        "status_reason",
        "started_at_utc",
        "ended_at_utc",
        "completed_at_utc",
        "resume_count",
        "interrupted_presentation_count",
        "visibility_interruption_count",
        "consent_confirmed_at_utc",
        "preflight_completed_at_utc",
        "preflight_audio_passed",
    }
)


class BundleValidationError(ValueError):
    """Raised when a result bundle fails a required integrity check."""


@dataclass(frozen=True)
class ValidationReport:
    archive: Path
    subject_id: str
    session_run_id: str
    status: str
    trial_rows: int
    wide_rows: int
    app_build_sha256: str
    app_script_sha256: str


@dataclass(frozen=True)
class ParsedCsv:
    name: str
    header: tuple[str, ...]
    rows: tuple[dict[str, str], ...]


def _fail(message: str) -> NoReturn:
    raise BundleValidationError(message)


def _require_mapping(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        _fail(f"{label} must be a JSON object")
    return value


def _require_exact_keys(value: dict[str, Any], expected: frozenset[str], label: str) -> None:
    actual = frozenset(value)
    missing = sorted(expected - actual)
    unexpected = sorted(actual - expected)
    if missing or unexpected:
        details: list[str] = []
        if missing:
            details.append(f"missing {', '.join(missing)}")
        if unexpected:
            details.append(f"unexpected {', '.join(unexpected)}")
        _fail(f"{label} has invalid keys ({'; '.join(details)})")


def _reject_json_constant(value: str) -> NoReturn:
    _fail(f"manifest contains non-standard JSON constant {value}")


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            _fail(f"manifest contains duplicate JSON key {key!r}")
        result[key] = value
    return result


def _parse_manifest(raw: bytes) -> dict[str, Any]:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        _fail(f"{MANIFEST_NAME} is not valid UTF-8: {error}")
    if text.startswith("\ufeff"):
        _fail(f"{MANIFEST_NAME} must not contain a UTF-8 BOM")
    try:
        manifest = json.loads(
            text,
            object_pairs_hook=_unique_object,
            parse_constant=_reject_json_constant,
        )
    except BundleValidationError:
        raise
    except (json.JSONDecodeError, RecursionError) as error:
        _fail(f"{MANIFEST_NAME} is not valid JSON: {error}")
    return _require_mapping(manifest, "manifest")


def _safe_member_name(name: str) -> None:
    if not name or len(name) > 1024:
        _fail("ZIP member names must contain between 1 and 1024 characters")
    if unicodedata.normalize("NFC", name) != name:
        _fail(f"ZIP member name is not NFC-normalized: {name!r}")
    if any(ord(character) < 32 or ord(character) == 127 for character in name):
        _fail(f"ZIP member name contains a control character: {name!r}")
    if "/" in name or "\\" in name or name in {".", ".."}:
        _fail(f"unsafe or nested ZIP member name: {name!r}")
    if Path(name).is_absolute() or re.match(r"^[A-Za-z]:", name):
        _fail(f"absolute ZIP member name is forbidden: {name!r}")


def _validate_zip_info(info: zipfile.ZipInfo) -> None:
    _safe_member_name(info.filename)
    if info.is_dir():
        _fail(f"directories are not allowed in a result bundle: {info.filename!r}")
    if info.flag_bits & 0x0001:
        _fail(f"encrypted ZIP members are not allowed: {info.filename!r}")
    if info.flag_bits & ~0x0800:
        _fail(f"ZIP member has unsupported general-purpose flags: {info.filename!r}")
    if info.compress_type != zipfile.ZIP_STORED:
        _fail(f"ZIP member must use the frozen store-only method: {info.filename!r}")
    if info.file_size < 0 or info.file_size > MAX_MEMBER_BYTES:
        _fail(f"ZIP member exceeds the {MAX_MEMBER_BYTES}-byte limit: {info.filename!r}")
    if info.compress_size != info.file_size:
        _fail(f"stored ZIP member has inconsistent sizes: {info.filename!r}")
    if info.extra:
        _fail(f"ZIP member has unexpected extra fields: {info.filename!r}")
    if info.comment:
        _fail(f"ZIP member has an unexpected comment: {info.filename!r}")
    if info.create_system == 3:
        mode = info.external_attr >> 16
        if stat.S_IFMT(mode) == stat.S_IFLNK:
            _fail(f"symbolic links are not allowed in a result bundle: {info.filename!r}")


def _read_member(archive: zipfile.ZipFile, info: zipfile.ZipInfo) -> bytes:
    try:
        with archive.open(info, "r") as source:
            raw = source.read(MAX_MEMBER_BYTES + 1)
            if source.read(1):
                _fail(f"ZIP member exceeds the read limit: {info.filename!r}")
    except (OSError, RuntimeError, zipfile.BadZipFile) as error:
        _fail(f"could not read ZIP member {info.filename!r}: {error}")
    if len(raw) != info.file_size:
        _fail(f"ZIP member length does not match its directory record: {info.filename!r}")
    return raw


def _parse_csv(name: str, raw: bytes) -> ParsedCsv:
    if b"\x00" in raw:
        _fail(f"{name} contains a NUL byte")
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        _fail(f"{name} is not valid UTF-8: {error}")
    try:
        records = list(csv.reader(io.StringIO(text, newline=""), strict=True))
    except csv.Error as error:
        _fail(f"{name} is not valid CSV: {error}")
    if not records or not records[0]:
        _fail(f"{name} has no CSV header")
    header = records[0]
    if any(not field for field in header):
        _fail(f"{name} has a blank header field")
    if len(set(header)) != len(header):
        _fail(f"{name} has duplicate header fields")
    if header[0] != "subject_id":
        _fail(f"{name} must use subject_id as its first column")

    parsed_rows: list[dict[str, str]] = []
    for row_number, values in enumerate(records[1:], start=2):
        if len(values) != len(header):
            _fail(
                f"{name} row {row_number} has {len(values)} fields; "
                f"expected {len(header)}"
            )
        for column, cell in zip(header, values, strict=True):
            if cell.lstrip().startswith(FORMULA_PREFIXES):
                position = "first cell" if column == header[0] else f"cell {column!r}"
                _fail(f"{name} row {row_number} has a formula-bearing {position}")
        parsed_rows.append(dict(zip(header, values, strict=True)))

    return ParsedCsv(name=name, header=tuple(header), rows=tuple(parsed_rows))


def _require_columns(parsed: ParsedCsv, required: frozenset[str]) -> None:
    missing = sorted(required - frozenset(parsed.header))
    if missing:
        _fail(f"{parsed.name} is missing required columns: {', '.join(missing)}")


def _require_sha256(value: Any, label: str) -> str:
    if not isinstance(value, str) or not SHA256_PATTERN.fullmatch(value):
        _fail(f"{label} must be a lowercase hexadecimal SHA-256 digest")
    return value


def _require_same(rows: tuple[dict[str, str], ...], column: str, expected: str, name: str) -> None:
    for row_number, row in enumerate(rows, start=2):
        if row[column] != expected:
            _fail(
                f"{name} row {row_number} {column} does not match the manifest "
                f"({row[column]!r} != {expected!r})"
            )


def _validate_manifest_shape(manifest: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    _require_exact_keys(manifest, EXPECTED_TOP_LEVEL_KEYS, "manifest")
    if manifest["result_bundle_schema_version"] != RESULT_BUNDLE_SCHEMA_VERSION:
        _fail(
            "unsupported result_bundle_schema_version "
            f"{manifest['result_bundle_schema_version']!r}; expected {RESULT_BUNDLE_SCHEMA_VERSION}"
        )
    if manifest["data_classification"] != "pseudonymous_research_data":
        _fail("manifest data_classification is not pseudonymous_research_data")
    if manifest["automatic_upload_performed"] is not False:
        _fail("manifest must state automatic_upload_performed=false")
    administration_mode = manifest["administration_mode"]
    if administration_mode not in {"supervised", "remote_manual_upload"}:
        _fail("manifest.administration_mode must be supervised or remote_manual_upload")
    if not isinstance(manifest["result_return_requires_external_portal_receipt"], bool):
        _fail("result_return_requires_external_portal_receipt must be a JSON boolean")
    expected_portal_receipt = administration_mode == "remote_manual_upload"
    if manifest["result_return_requires_external_portal_receipt"] is not expected_portal_receipt:
        _fail(
            "result_return_requires_external_portal_receipt must be true only for "
            "remote_manual_upload"
        )

    session = _require_mapping(manifest["session"], "manifest.session")
    _require_exact_keys(session, EXPECTED_SESSION_KEYS, "manifest.session")
    implementation = _require_mapping(manifest["implementation"], "manifest.implementation")
    for name in ("study", "procedure", "provenance"):
        _require_mapping(manifest[name], f"manifest.{name}")

    expected_versions = {
        "resultBundleSchemaVersion": RESULT_BUNDLE_SCHEMA_VERSION,
        "trialSchemaVersion": TRIAL_SCHEMA_VERSION,
        "wideSchemaVersion": WIDE_SCHEMA_VERSION,
    }
    for key, expected in expected_versions.items():
        if implementation.get(key) != expected:
            _fail(f"manifest.implementation.{key} must be {expected}")
    return session, implementation


def validate_bundle(path: str | Path) -> ValidationReport:
    """Validate one result ZIP and return its trusted joining identifiers."""

    archive_path = Path(path)
    try:
        archive_size = archive_path.stat().st_size
    except OSError as error:
        _fail(f"could not stat result bundle {archive_path}: {error}")
    if archive_size <= 0 or archive_size > MAX_ARCHIVE_BYTES:
        _fail(f"result bundle size must be between 1 and {MAX_ARCHIVE_BYTES} bytes")

    try:
        archive = zipfile.ZipFile(archive_path, "r")
    except (OSError, zipfile.BadZipFile) as error:
        _fail(f"not a readable ZIP archive: {error}")

    with archive:
        if archive.comment:
            _fail("result ZIP must not contain an archive comment")
        infos = archive.infolist()
        if len(infos) != 3:
            _fail(f"result ZIP must contain exactly 3 members; found {len(infos)}")
        names = [info.filename for info in infos]
        if len(set(names)) != len(names):
            _fail("result ZIP contains duplicate member names")
        for info in infos:
            _validate_zip_info(info)
        if sum(info.file_size for info in infos) > MAX_ARCHIVE_BYTES:
            _fail("uncompressed result ZIP contents exceed the total size limit")
        if MANIFEST_NAME not in names:
            _fail(f"result ZIP is missing {MANIFEST_NAME}")

        by_name = {info.filename: info for info in infos}
        if by_name[MANIFEST_NAME].file_size > MAX_MANIFEST_BYTES:
            _fail(f"{MANIFEST_NAME} exceeds the manifest size limit")
        contents = {name: _read_member(archive, info) for name, info in by_name.items()}

    manifest = _parse_manifest(contents[MANIFEST_NAME])
    session, implementation = _validate_manifest_shape(manifest)

    subject_id = session["subject_id"]
    session_run_id = session["session_run_id"]
    status_value = session["status"]
    status_reason = session["status_reason"]
    if not isinstance(subject_id, str) or not SUBJECT_ID_PATTERN.fullmatch(subject_id):
        _fail("manifest.session.subject_id is invalid")
    if not isinstance(session_run_id, str) or not SESSION_RUN_ID_PATTERN.fullmatch(session_run_id):
        _fail("manifest.session.session_run_id is invalid")
    if status_value not in {"completed", "technical_failure"}:
        _fail("manifest.session.status must be completed or technical_failure")
    if not isinstance(status_reason, str):
        _fail("manifest.session.status_reason must be a string")
    if status_value == "technical_failure" and not status_reason.strip():
        _fail("technical_failure bundles require a non-empty manifest.session.status_reason")
    if status_value == "completed":
        for timestamp_name in ("completed_at_utc", "ended_at_utc"):
            timestamp = session[timestamp_name]
            if not isinstance(timestamp, str) or not timestamp.strip():
                _fail(f"completed bundles require a non-empty manifest.session.{timestamp_name}")

    app_build_sha256 = _require_sha256(
        implementation.get("app_build_sha256"),
        "manifest.implementation.app_build_sha256",
    )
    app_script_sha256 = _require_sha256(
        implementation.get("app_script_sha256"),
        "manifest.implementation.app_script_sha256",
    )
    served_assets = _require_mapping(
        implementation.get("served_asset_sha256"),
        "manifest.implementation.served_asset_sha256",
    )
    if set(served_assets) != set(BUILD_ASSET_NAMES):
        _fail(
            "served_asset_sha256 must contain exactly index.html, result_bundle.js, "
            "session_safety.js, and script.js"
        )
    for asset_name in BUILD_ASSET_NAMES:
        _require_sha256(served_assets[asset_name], f"served_asset_sha256.{asset_name}")
    if served_assets["script.js"] != app_script_sha256:
        _fail("served_asset_sha256.script.js does not match app_script_sha256")
    build_descriptor = "\n".join(
        f"{asset_name}:{served_assets[asset_name]}" for asset_name in BUILD_ASSET_NAMES
    ).encode("utf-8")
    if hashlib.sha256(build_descriptor).hexdigest() != app_build_sha256:
        _fail("app_build_sha256 does not match the served-asset descriptor")

    file_records = manifest["files"]
    if not isinstance(file_records, list) or len(file_records) != 2:
        _fail("manifest.files must contain exactly the trial and wide CSV records")
    manifest_files: dict[str, str] = {}
    kinds: dict[str, str] = {}
    for index, raw_record in enumerate(file_records):
        record = _require_mapping(raw_record, f"manifest.files[{index}]")
        _require_exact_keys(record, frozenset({"name", "media_type", "sha256"}), f"manifest.files[{index}]")
        name = record["name"]
        if not isinstance(name, str):
            _fail(f"manifest.files[{index}].name must be a string")
        _safe_member_name(name)
        if name in manifest_files:
            _fail(f"manifest.files repeats {name!r}")
        match = CSV_NAME_PATTERN.fullmatch(name)
        if not match:
            _fail(f"manifest CSV filename does not follow the frozen naming contract: {name!r}")
        if match.group("subject") != subject_id or match.group("run") != session_run_id:
            _fail(f"manifest CSV filename identifiers do not match manifest.session: {name!r}")
        kind = match.group("kind")
        if kind in kinds:
            _fail(f"manifest.files contains more than one {kind} CSV")
        if record["media_type"] != "text/csv":
            _fail(f"manifest media_type for {name!r} must be text/csv")
        manifest_files[name] = _require_sha256(record["sha256"], f"manifest digest for {name}")
        kinds[kind] = name

    if set(kinds) != {"trials", "wide"}:
        _fail("manifest.files must contain one trials CSV and one wide CSV")
    if set(contents) != {MANIFEST_NAME, *manifest_files}:
        _fail("ZIP members do not exactly match the files declared by the manifest")
    for name, expected_digest in manifest_files.items():
        observed_digest = hashlib.sha256(contents[name]).hexdigest()
        if observed_digest != expected_digest:
            _fail(f"SHA-256 mismatch for {name!r}")

    trial = _parse_csv(kinds["trials"], contents[kinds["trials"]])
    wide = _parse_csv(kinds["wide"], contents[kinds["wide"]])
    trial_columns = frozenset(
        {
            "subject_id",
            "session_run_id",
            "session_final_status",
            "status_reason",
            "app_build_sha256",
            "app_script_sha256",
            "schema_version",
        }
    )
    wide_columns = frozenset(
        {
            "subject_id",
            "session_run_id",
            "session_status",
            "status_reason",
            "app_build_sha256",
            "app_script_sha256",
            "wide_schema_version",
        }
    )
    _require_columns(trial, trial_columns)
    _require_columns(wide, wide_columns)
    if status_value == "completed" and not trial.rows:
        _fail("completed bundles require at least one trial CSV data row")
    if len(wide.rows) != 1:
        _fail(f"wide CSV must contain exactly one data row; found {len(wide.rows)}")

    for column, expected in (
        ("subject_id", subject_id),
        ("session_run_id", session_run_id),
        ("session_final_status", status_value),
        ("status_reason", status_reason),
        ("app_build_sha256", app_build_sha256),
        ("app_script_sha256", app_script_sha256),
        ("schema_version", str(TRIAL_SCHEMA_VERSION)),
    ):
        _require_same(trial.rows, column, expected, trial.name)

    wide_row = wide.rows[0]
    for column, expected in (
        ("subject_id", subject_id),
        ("session_run_id", session_run_id),
        ("session_status", status_value),
        ("status_reason", status_reason),
        ("app_build_sha256", app_build_sha256),
        ("app_script_sha256", app_script_sha256),
        ("wide_schema_version", str(WIDE_SCHEMA_VERSION)),
    ):
        if wide_row[column] != expected:
            _fail(
                f"{wide.name} {column} does not match the manifest "
                f"({wide_row[column]!r} != {expected!r})"
            )

    return ValidationReport(
        archive=archive_path,
        subject_id=subject_id,
        session_run_id=session_run_id,
        status=status_value,
        trial_rows=len(trial.rows),
        wide_rows=len(wide.rows),
        app_build_sha256=app_build_sha256,
        app_script_sha256=app_script_sha256,
    )


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate an Audio Discrimination result ZIP before analysis or ingestion."
    )
    parser.add_argument("bundle", type=Path, help="path to one *_results.zip bundle")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    try:
        report = validate_bundle(args.bundle)
    except BundleValidationError as error:
        print(f"INVALID: {error}", file=sys.stderr)
        return 2
    print(
        "VALID: "
        f"subject={report.subject_id} "
        f"run={report.session_run_id} "
        f"status={report.status} "
        f"trial_rows={report.trial_rows} "
        f"wide_rows={report.wide_rows}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
