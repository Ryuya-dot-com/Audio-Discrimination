#!/usr/bin/env python3
"""Compare independent Praat reconstruction runs byte-for-byte.

The candidate roots must each contain the three versioned set directories
created by ``tools/reconstruct_stimuli.praat``.  Metadata files are deliberately
excluded: this check compares every generated FLAC with the canonical set and
with every other supplied run.
"""

from __future__ import annotations

import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import sys
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "STIMULUS_CATALOG.json"
CANONICAL_ROOT = ROOT / "stimulus_sets"
GENERATOR_PATH = ROOT / "tools" / "reconstruct_stimuli.praat"


class VerificationError(RuntimeError):
    pass


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def flac_inventory(root: Path, set_ids: list[str]) -> list[Path]:
    paths: list[Path] = []
    for set_id in set_ids:
        set_root = root / set_id
        if not set_root.is_dir():
            raise VerificationError(f"missing set directory: {set_root}")
        paths.extend(path.relative_to(root) for path in set_root.rglob("*.flac"))
    return sorted(paths, key=lambda path: path.as_posix())


def compare_runs(canonical_root: Path, candidate_roots: list[Path]) -> dict[str, Any]:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    set_ids = sorted(set(catalog["bindings"].values()))
    expected = flac_inventory(canonical_root, set_ids)
    expected_set = set(expected)

    if len(expected) != 1111:
        raise VerificationError(
            f"canonical inventory has {len(expected)} FLAC files; expected 1111"
        )

    canonical_hashes = {
        relative: sha256_file(canonical_root / relative) for relative in expected
    }
    for run_number, candidate_root in enumerate(candidate_roots, start=1):
        candidate = flac_inventory(candidate_root, set_ids)
        candidate_set = set(candidate)
        if candidate_set != expected_set:
            missing = sorted(expected_set - candidate_set, key=lambda path: path.as_posix())
            extra = sorted(candidate_set - expected_set, key=lambda path: path.as_posix())
            raise VerificationError(
                f"run_{run_number} inventory mismatch: missing={missing[:5]}, extra={extra[:5]}"
            )
        for relative in expected:
            observed = sha256_file(candidate_root / relative)
            if observed != canonical_hashes[relative]:
                raise VerificationError(
                    f"run_{run_number} differs from canonical: {relative}"
                )

    set_records = {
        set_id: {
            "aggregate_sha256": catalog["sets"][set_id]["aggregate_sha256"],
            "file_count": sum(1 for path in expected if path.parts[0] == set_id),
        }
        for set_id in set_ids
    }
    return {
        "schema_version": 1,
        "verification_date": date.today().isoformat(),
        "result": "passed",
        "comparison": "all_generated_flac_byte_identical_to_canonical",
        "independent_candidate_run_count": len(candidate_roots),
        "candidate_labels": [
            f"independent_praat_run_{index}"
            for index in range(1, len(candidate_roots) + 1)
        ],
        "generated_flac_file_count_per_run": len(expected),
        "generator": {
            "script": "tools/reconstruct_stimuli.praat",
            "script_sha256": sha256_file(GENERATOR_PATH),
        },
        "canonical_sets": set_records,
        "verification_tool": {
            "script": "tools/verify_reconstruction_reproducibility.py",
            "script_sha256": sha256_file(Path(__file__).resolve()),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "candidate_roots",
        nargs="+",
        type=Path,
        help="two or more independently generated output roots",
    )
    parser.add_argument(
        "--canonical-root",
        type=Path,
        default=CANONICAL_ROOT,
        help="canonical stimulus_sets root",
    )
    parser.add_argument(
        "--report",
        type=Path,
        help="optional path for a deterministic JSON evidence record",
    )
    args = parser.parse_args()

    try:
        candidates = [path.resolve() for path in args.candidate_roots]
        if len(candidates) < 2:
            raise VerificationError("at least two independent candidate roots are required")
        if len(set(candidates)) != len(candidates):
            raise VerificationError("candidate roots must be distinct")
        result = compare_runs(args.canonical_root.resolve(), candidates)
        payload = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
        if args.report:
            report = args.report.resolve()
            if not report.is_relative_to(ROOT):
                raise VerificationError("report must be written inside the repository")
            report.write_text(payload, encoding="utf-8")
            print(f"WROTE {report.relative_to(ROOT)}")
        print(
            "Reconstruction reproducibility passed: "
            f"{len(candidates)} independent runs x {result['generated_flac_file_count_per_run']} FLAC"
        )
        return 0
    except (OSError, ValueError, VerificationError, json.JSONDecodeError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
