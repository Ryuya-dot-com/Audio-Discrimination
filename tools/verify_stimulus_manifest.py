#!/usr/bin/env python3
"""Verify the official local FLAC set and, optionally, its source archive.

This tool owns byte/hash verification for the frozen 404-file parent set.  The
publication-specific runtime registry is verified separately by
``tools/verify_runtime_stimulus_registry.py``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys
import zipfile


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "STIMULUS_MANIFEST.json"
CATALOG_PATH = ROOT / "STIMULUS_CATALOG.json"


def file_digest(path: Path) -> bytes:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.digest()


def numeric_flac_files(folder: Path) -> list[Path]:
    files = list(folder.glob("*.flac"))
    try:
        return sorted(files, key=lambda path: int(path.stem))
    except ValueError as error:
        raise ValueError(f"Non-numeric FLAC filename in {folder}") from error


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-archive",
        type=Path,
        help="Optional official OFFLINE AP TESTS.zip to verify byte-for-byte provenance.",
    )
    return parser.parse_args()


def verify_source_archive(
    archive_path: Path, manifest: dict, errors: list[str]
) -> None:
    provenance = manifest["provenance"]
    if not archive_path.is_file():
        errors.append(f"source archive does not exist: {archive_path}")
        return

    archive_sha256 = file_digest(archive_path).hex()
    if archive_sha256 != provenance["source_archive_sha256"]:
        errors.append("source archive SHA-256 mismatch")
        return

    source_root = "OFFLINE AP TESTS/EFL_auditory_battery"
    matched = 0
    with zipfile.ZipFile(archive_path) as archive:
        members = set(archive.namelist())
        for task_id in manifest["task_order"]:
            for index in range(1, 102):
                filename = f"{index}.flac"
                member = f"{source_root}/{task_id}/{filename}"
                if member not in members:
                    errors.append(f"source archive is missing {member}")
                    continue
                local_path = ROOT / task_id / "Stimuli" / filename
                if not local_path.is_file():
                    continue
                source_digest = hashlib.sha256(archive.read(member)).digest()
                local_digest = file_digest(local_path)
                if source_digest != local_digest:
                    errors.append(f"source/local mismatch: {task_id}/{filename}")
                    continue
                matched += 1

    if matched != 404:
        errors.append(f"source provenance match count {matched} != 404")


def verify_catalog_metadata(manifest: dict, errors: list[str]) -> None:
    """Check only the parent-set catalog entry; runtime checks live elsewhere."""

    if not CATALOG_PATH.is_file():
        errors.append(f"catalog does not exist: {CATALOG_PATH}")
        return
    try:
        catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        errors.append(f"cannot read stimulus catalog: {error}")
        return

    set_id = manifest["stimulus_set_id"]
    try:
        entry = catalog["sets"][set_id]
    except (KeyError, TypeError):
        errors.append(f"catalog has no parent-set entry for {set_id}")
        return

    manifest_task_ids = [
        task_id.removesuffix("_discrimination") for task_id in manifest["task_order"]
    ]
    expected = {
        "root": ".",
        "manifest": MANIFEST_PATH.name,
        "manifest_sha256": file_digest(MANIFEST_PATH).hex(),
        "aggregate_sha256": manifest["aggregate_sha256"],
        "task_ids": manifest_task_ids,
        "validated": True,
    }
    for key, expected_value in expected.items():
        if entry.get(key) != expected_value:
            errors.append(f"catalog parent entry {key} does not match manifest")


def main() -> int:
    args = parse_args()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    overall = hashlib.sha256()
    errors: list[str] = []

    for task_id in manifest["task_order"]:
        expected = manifest["tasks"][task_id]
        files = numeric_flac_files(ROOT / task_id / "Stimuli")
        task_digest = hashlib.sha256()

        expected_names = [f"{index}.flac" for index in range(1, 102)]
        actual_names = [path.name for path in files]
        if actual_names != expected_names:
            errors.append(f"{task_id}: expected exactly 1.flac through 101.flac")

        for path in files:
            digest = file_digest(path)
            task_digest.update(path.name.encode("utf-8"))
            task_digest.update(b"\0")
            task_digest.update(digest)

            relative_path = path.relative_to(ROOT).as_posix()
            overall.update(relative_path.encode("utf-8"))
            overall.update(b"\0")
            overall.update(digest)

        if len(files) != expected["file_count"]:
            errors.append(
                f"{task_id}: file count {len(files)} != {expected['file_count']}"
            )
        if task_digest.hexdigest() != expected["task_sha256"]:
            errors.append(f"{task_id}: task SHA-256 mismatch")

    if overall.hexdigest() != manifest["aggregate_sha256"]:
        errors.append("overall stimulus-set SHA-256 mismatch")

    verify_catalog_metadata(manifest, errors)

    if args.source_archive is not None:
        verify_source_archive(args.source_archive, manifest, errors)

    if errors:
        print("Stimulus verification FAILED:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    message = (
        "Stimulus verification passed: "
        f"{manifest['stimulus_set_id']} ({manifest['aggregate_sha256']})"
    )
    if args.source_archive is not None:
        message += "; source provenance 404/404 byte-identical"
    print(message)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
