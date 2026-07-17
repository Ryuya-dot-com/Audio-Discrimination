#!/usr/bin/env python3
"""Write or verify manifests for the Praat-reconstructed stimulus sets.

Audio transformation is performed only by ``tools/reconstruct_stimuli.praat``.
This script is read-only with respect to audio: it validates inventory, format,
sample-level lineage, endpoints, and clipping, then writes (or verifies) deterministic
JSON manifests, parameter records, checksum lists, and the root stimulus catalog.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from typing import Any

try:
    import numpy as np
    import soundfile as sf
except ImportError as exc:  # pragma: no cover - runtime dependent
    print(f"FAIL: missing required dependency: {exc}", file=sys.stderr)
    raise SystemExit(1) from exc


ROOT = Path(__file__).resolve().parents[1]
PARENT_MANIFEST_PATH = ROOT / "STIMULUS_MANIFEST.json"
GENERATOR_PATH = ROOT / "tools" / "reconstruct_stimuli.praat"
ACOUSTIC_AUDIT_PATH = ROOT / "tools" / "audit_stimulus_acoustics.py"
METADATA_VALIDATOR_PATH = ROOT / "tools" / "manage_reconstructed_stimuli.py"
CATALOG_PATH = ROOT / "STIMULUS_CATALOG.json"
DEFAULT_STIMULUS_ROOT = ROOT / "stimulus_sets"
DEFAULT_PRAAT_BINARY = Path("/Applications/Praat.app/Contents/MacOS/Praat")

SAMPLE_RATE = 44_100
SUBTYPE = "PCM_16"
FORMAT = "FLAC"
FILES_PER_TASK = 101
OLD_RAMP_SAMPLES = 2_205  # 50 ms at 44.1 kHz
NEW_RAMP_SAMPLES = 662  # first plateau sample after nominal 15 ms
SAITO_PITCH_FRAMES = 11_025
SAITO_UNALTERED_PREFIX_FRAMES = 8_820  # 200 ms; offset starts after this
FORMANT_REFERENCE_START_ZERO_BASED = 8_820  # 0.200 s = 20 cycles at 100 Hz
FORMANT_PERIOD_SAMPLES = 441

TASK_ORDER_ALL = (
    "pitch_discrimination",
    "formant_discrimination",
    "duration_discrimination",
    "risetime_discrimination",
)
TASK_TO_PUBLIC_ID = {
    "pitch_discrimination": "pitch",
    "formant_discrimination": "formant",
    "duration_discrimination": "duration",
    "risetime_discrimination": "risetime",
}

FOUR_TASK_REPORTED_PARAMETERS: dict[str, Any] = {
    "pitch_discrimination": {
        "duration_ms": 500.0,
        "carrier": "four_harmonic_complex_equal_amplitude",
        "standard_f0_hz": 330.0,
        "comparison_f0_hz": {"level_1": 330.3, "level_100": 360.0, "step": 0.3},
        "onset_ramp": {"shape": "linear", "duration_ms": 15.0},
        "offset_ramp": {"shape": "linear", "duration_ms": 15.0},
    },
    "formant_discrimination": {
        "duration_ms": 500.0,
        "f0_hz": 100.0,
        "harmonics_through_hz": 3000.0,
        "f1_hz": 500.0,
        "standard_f2_hz": 1500.0,
        "comparison_f2_hz": {"level_1": 1502.0, "level_100": 1700.0, "step": 2.0},
        "f3_hz": 2500.0,
        "onset_ramp": {"shape": "linear", "duration_ms": 15.0},
        "offset_ramp": {"shape": "linear", "duration_ms": 15.0},
    },
    "duration_discrimination": {
        "carrier": "four_harmonic_complex_equal_amplitude",
        "f0_hz": 330.0,
        "standard_duration_ms": 250.0,
        "comparison_duration_ms": {"level_1": 252.5, "level_100": 500.0, "step": 2.5},
        "onset_ramp": {"shape": "linear", "duration_ms": 15.0},
        "offset_ramp": {"shape": "linear", "duration_ms": 15.0},
    },
    "risetime_discrimination": {
        "duration_ms": 500.0,
        "carrier": "four_harmonic_complex_equal_amplitude",
        "f0_hz": 330.0,
        "standard_onset_ramp_ms": 15.0,
        "comparison_onset_ramp_ms": {
            "level_1": 17.85,
            "level_100": 300.0,
            "step": 2.85,
            "note": "The Kachlicka article rounds the lower endpoint to 17.8 ms; the exact Level formula follows the 100-level continuum and is explicit in Sun et al.",
        },
        "offset_ramp": {"shape": "linear", "duration_ms": 15.0},
    },
}

SAITO_TIERNEY_REPORTED_PARAMETERS: dict[str, Any] = {
    "pitch_discrimination": {
        "duration_ms": 250.0,
        "carrier": "four_harmonic_complex_equal_amplitude",
        "standard_f0_hz": 330.0,
        "comparison_f0_hz": {"level_1": 330.3, "level_100": 360.0, "step": 0.3},
        "onset_offset_ramp": "not_reported",
    },
    "formant_discrimination": FOUR_TASK_REPORTED_PARAMETERS["formant_discrimination"],
    "duration_discrimination": {
        "carrier": "same_four_harmonic_complex_as_pitch",
        "f0_hz": 330.0,
        "standard_duration_ms": 250.0,
        "comparison_duration_ms": {"level_1": 252.5, "level_100": 500.0, "step": 2.5},
        "onset_offset_ramp": "not_reported",
    },
}

PROFILES: dict[str, dict[str, Any]] = {
    "kachlicka2019-reconstruction-v1": {
        "protocol_id": "kachlicka2019",
        "acoustic_audit_profile": "kachlicka2019",
        "citation": "Kachlicka, Saito, & Tierney (2019)",
        "source_locator": "Brain and Language, 192, p. 17, section 2.2.2",
        "reported_parameters": FOUR_TASK_REPORTED_PARAMETERS,
        "task_order": TASK_ORDER_ALL,
        "transformations": {
            "pitch_discrimination": "replace_50ms_linear_envelope_with_15ms",
            "formant_discrimination": "tile_steady_100hz_cycle_then_apply_15ms_linear_envelope",
            "duration_discrimination": "replace_50ms_linear_envelope_with_15ms",
            "risetime_discrimination": "identity_pcm_reencode",
        },
        "reported_parameter_claim": (
            "Matches the reported duration/continuum/ramp parameters; it is not an "
            "original-study waveform set."
        ),
        "implementation_decisions": [
            "15 ms is implemented at 44.1 kHz with a 662-sample transition to plateau.",
            "No peak or RMS normalization is applied.",
            "Formant bandwidth, gain, and phase are not supplied by the article; the "
            "steady carrier cycle of the parent distribution is retained.",
            "Duration frame counts are preserved from the parent set; their maximum "
            "deviation from the nominal continuum is one sample (0.022676 ms).",
        ],
    },
    "sun2021-reconstruction-v1": {
        "protocol_id": "sun2021",
        "acoustic_audit_profile": "sun2021",
        "citation": "Sun, Saito, & Tierney (2021)",
        "source_locator": "Studies in Second Language Acquisition, 43, pp. 558–559",
        "reported_parameters": FOUR_TASK_REPORTED_PARAMETERS,
        "task_order": TASK_ORDER_ALL,
        "transformations": {
            "pitch_discrimination": "replace_50ms_linear_envelope_with_15ms",
            "formant_discrimination": "tile_steady_100hz_cycle_then_apply_15ms_linear_envelope",
            "duration_discrimination": "replace_50ms_linear_envelope_with_15ms",
            "risetime_discrimination": "identity_pcm_reencode",
        },
        "reported_parameter_claim": (
            "Matches the reported duration/continuum/ramp parameters; it is not an "
            "original-study waveform set."
        ),
        "implementation_decisions": [
            "15 ms is implemented at 44.1 kHz with a 662-sample transition to plateau.",
            "No peak or RMS normalization is applied.",
            "Formant synthesis parameters are incomplete in the article; the steady "
            "carrier cycle of the parent distribution is retained.",
            "Duration frame counts are preserved from the parent set; their maximum "
            "deviation from the nominal continuum is one sample (0.022676 ms).",
        ],
    },
    "saito-tierney2024-reconstruction-v1": {
        "protocol_id": "saitoTierney2024",
        "acoustic_audit_profile": "saito_tierney2024",
        "citation": "Saito & Tierney (2024; online 2022)",
        "source_locator": "Studies in Second Language Acquisition, 46, pp. 1213–1215",
        "reported_parameters": SAITO_TIERNEY_REPORTED_PARAMETERS,
        "task_order": TASK_ORDER_ALL[:3],
        "transformations": {
            "pitch_discrimination": "crop_to_250ms_and_place_source_50ms_offset_at_new_endpoint",
            "formant_discrimination": "tile_steady_100hz_cycle_then_apply_15ms_linear_envelope",
            "duration_discrimination": "identity_pcm_reencode",
        },
        "reported_parameter_claim": (
            "Matches the reported task durations/continua and the formant ramp; it is "
            "not an original-study waveform set."
        ),
        "implementation_decisions": [
            "Pitch is cropped, not time-stretched; the parent 50 ms linear onset and "
            "offset convention is retained because the article does not report it.",
            "Duration ramp is retained because the article does not report it.",
            "The article text and continuum specify a 330 Hz pitch standard; Table 2 "
            "contains an isolated 300 Hz entry, treated as a typographical error.",
            "Duration frame counts are preserved from the parent set; their maximum "
            "deviation from the nominal continuum is one sample (0.022676 ms).",
            "No peak or RMS normalization is applied.",
            "Rise-time is absent because it was not included in the source main study.",
        ],
    },
}


class VerificationError(RuntimeError):
    pass


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def expected_duration_frames(level: int) -> int:
    return int(SAMPLE_RATE * (0.250 + 0.0025 * level))


def expected_frames(profile_id: str, task_name: str, level: int) -> int:
    if task_name == "pitch_discrimination":
        return SAITO_PITCH_FRAMES if profile_id.startswith("saito-") else 22_050
    if task_name in {"formant_discrimination", "risetime_discrimination"}:
        return 22_050
    if task_name == "duration_discrimination":
        return expected_duration_frames(level)
    raise VerificationError(f"unknown task: {task_name}")


def read_pcm16(path: Path) -> np.ndarray:
    samples, sample_rate = sf.read(
        path, dtype="int16", always_2d=True
    )
    if sample_rate != SAMPLE_RATE or samples.shape[1] != 1:
        raise VerificationError(f"unexpected PCM shape/rate: {path}")
    return samples[:, 0]


def verify_lineage(
    transformation: str,
    parent: np.ndarray,
    reconstructed: np.ndarray,
    path: Path,
) -> str:
    if transformation == "identity_pcm_reencode":
        if not np.array_equal(parent, reconstructed):
            raise VerificationError(f"identity PCM mismatch: {path}")
        return "full_pcm_identical_to_parent"

    if transformation == "replace_50ms_linear_envelope_with_15ms":
        if len(parent) != len(reconstructed):
            raise VerificationError(f"envelope replacement changed length: {path}")
        if not np.array_equal(
            parent[OLD_RAMP_SAMPLES : len(parent) - OLD_RAMP_SAMPLES],
            reconstructed[OLD_RAMP_SAMPLES : len(reconstructed) - OLD_RAMP_SAMPLES],
        ):
            raise VerificationError(f"plateau PCM mismatch: {path}")
        return "plateau_pcm_identical_to_parent"

    if transformation == "tile_steady_100hz_cycle_then_apply_15ms_linear_envelope":
        cycle = parent[
            FORMANT_REFERENCE_START_ZERO_BASED :
            FORMANT_REFERENCE_START_ZERO_BASED + FORMANT_PERIOD_SAMPLES
        ]
        indices = np.arange(len(reconstructed)) % FORMANT_PERIOD_SAMPLES
        expected_carrier = cycle[indices]
        if not np.array_equal(
            reconstructed[NEW_RAMP_SAMPLES : len(reconstructed) - NEW_RAMP_SAMPLES],
            expected_carrier[NEW_RAMP_SAMPLES : len(reconstructed) - NEW_RAMP_SAMPLES],
        ):
            raise VerificationError(f"formant steady-cycle lineage mismatch: {path}")
        return "plateau_is_parent_cycle_at_0.200s_tiled_sample_exact"

    if transformation == "crop_to_250ms_and_place_source_50ms_offset_at_new_endpoint":
        if len(reconstructed) != SAITO_PITCH_FRAMES:
            raise VerificationError(f"Saito pitch frame count mismatch: {path}")
        if not np.array_equal(
            reconstructed[:SAITO_UNALTERED_PREFIX_FRAMES],
            parent[:SAITO_UNALTERED_PREFIX_FRAMES],
        ):
            raise VerificationError(f"Saito pitch preserved-prefix mismatch: {path}")
        return "first_200ms_pcm_identical_to_parent_then_new_50ms_offset"

    raise VerificationError(f"unknown transformation: {transformation}")


def inspect_profile(
    profile_id: str,
    profile: dict[str, Any],
    stimulus_root: Path,
    parent_manifest: dict[str, Any],
    praat_version: str,
    praat_binary_sha256: str,
    generator_sha256: str,
    acoustic_audit_sha256: str,
    metadata_validator_sha256: str,
) -> tuple[dict[str, Any], bytes, bytes]:
    set_root = stimulus_root / profile_id
    task_manifests: dict[str, Any] = {}
    checksum_lines: list[str] = []
    set_digest = hashlib.sha256()
    total_files = 0

    for task_name in profile["task_order"]:
        task_root = set_root / task_name / "Stimuli"
        expected_names = [f"{index}.flac" for index in range(1, FILES_PER_TASK + 1)]
        actual_names = sorted(
            (path.name for path in task_root.glob("*.flac")),
            key=lambda name: int(Path(name).stem),
        )
        if actual_names != expected_names:
            raise VerificationError(
                f"{profile_id}/{task_name}: expected exactly 1.flac through 101.flac"
            )

        task_digest = hashlib.sha256()
        task_peak = 0
        lineage_result = ""
        transformation = profile["transformations"][task_name]

        for level, filename in enumerate(expected_names):
            output_path = task_root / filename
            parent_path = ROOT / task_name / "Stimuli" / filename
            info = sf.info(output_path)
            if (
                info.format != FORMAT
                or info.subtype != SUBTYPE
                or info.samplerate != SAMPLE_RATE
                or info.channels != 1
            ):
                raise VerificationError(f"unexpected audio format: {output_path}")
            if info.frames != expected_frames(profile_id, task_name, level):
                raise VerificationError(
                    f"unexpected frame count {info.frames}: {output_path}"
                )

            reconstructed = read_pcm16(output_path)
            parent = read_pcm16(parent_path)
            if reconstructed[0] != 0 or reconstructed[-1] != 0:
                raise VerificationError(f"nonzero endpoint sample: {output_path}")
            peak = int(np.max(np.abs(reconstructed.astype(np.int32))))
            if peak >= 32_767:
                raise VerificationError(f"possible clipping: {output_path}")
            task_peak = max(task_peak, peak)
            lineage_result = verify_lineage(
                transformation, parent, reconstructed, output_path
            )

            digest_bytes = bytes.fromhex(sha256_file(output_path))
            relative_path = output_path.relative_to(set_root).as_posix()
            task_digest.update(filename.encode("utf-8"))
            task_digest.update(b"\0")
            task_digest.update(digest_bytes)
            set_digest.update(relative_path.encode("utf-8"))
            set_digest.update(b"\0")
            set_digest.update(digest_bytes)
            checksum_lines.append(f"{digest_bytes.hex()}  {relative_path}")
            total_files += 1

        task_manifests[task_name] = {
            "file_count": FILES_PER_TASK,
            "first_file": "1.flac",
            "last_file": "101.flac",
            "max_peak_pcm16": task_peak,
            "max_peak_fraction_full_scale": task_peak / 32_768.0,
            "pcm_lineage_verification": lineage_result,
            "task_sha256": task_digest.hexdigest(),
            "transformation": transformation,
        }

    parameters = {
        "schema_version": 1,
        "stimulus_set_id": profile_id,
        "parent_stimulus_set_id": parent_manifest["stimulus_set_id"],
        "parent_aggregate_sha256": parent_manifest["aggregate_sha256"],
        "generator": {
            "application": "Praat",
            "praat_version": praat_version,
            "praat_binary_sha256": praat_binary_sha256,
            "script": "tools/reconstruct_stimuli.praat",
            "script_sha256": generator_sha256,
        },
        "audio_conventions": {
            "sample_rate_hz": SAMPLE_RATE,
            "channels": 1,
            "encoding": "FLAC PCM_16",
            "normalization": "none",
            "level_mapping": "filename = published Level + 1",
            "linear_ramp_indexing": (
                "sample index distance from the zero-valued endpoint; nominal 15 ms "
                "reaches plateau at sample index 662 (15.011 ms)"
            ),
            "formant_reference_cycle": {
                "source_start_sample_1_based": FORMANT_REFERENCE_START_ZERO_BASED + 1,
                "source_time_s": 0.2,
                "period_samples": FORMANT_PERIOD_SAMPLES,
                "f0_hz": 100,
            },
        },
        "task_transformations": profile["transformations"],
        "reported_target_parameters": profile["reported_parameters"],
        "implementation_decisions": profile["implementation_decisions"],
    }
    parameter_bytes = json_bytes(parameters)
    checksum_bytes = ("\n".join(checksum_lines) + "\n").encode("utf-8")

    manifest = {
        "schema_version": 1,
        "stimulus_set_id": profile_id,
        "stimulus_set_version": 1,
        "kind": "transformed_official_distribution",
        "claim": "reported_parameter_reconstruction_not_original_study_files",
        "reported_parameter_claim": profile["reported_parameter_claim"],
        "target_protocol_id": profile["protocol_id"],
        "target_citation": profile["citation"],
        "target_source_locator": profile["source_locator"],
        "parent": {
            "stimulus_set_id": parent_manifest["stimulus_set_id"],
            "aggregate_sha256": parent_manifest["aggregate_sha256"],
            "manifest": "STIMULUS_MANIFEST.json",
            "official_repository_url": parent_manifest["provenance"]["repository_url"],
            "official_source_archive_sha256": parent_manifest["provenance"][
                "source_archive_sha256"
            ],
        },
        "generator": {
            "application": "Praat",
            "praat_version": praat_version,
            "praat_binary_sha256": praat_binary_sha256,
            "script": "tools/reconstruct_stimuli.praat",
            "script_sha256": generator_sha256,
            "parameters_file": "PARAMETERS.json",
            "parameters_sha256": sha256_bytes(parameter_bytes),
        },
        "audit_date": "2026-07-17",
        "validation_status": "passed",
        "acoustic_audit": {
            "script": "tools/audit_stimulus_acoustics.py",
            "script_sha256": acoustic_audit_sha256,
            "profile": profile["acoustic_audit_profile"],
        },
        "metadata_validation": {
            "script": "tools/manage_reconstructed_stimuli.py",
            "script_sha256": metadata_validator_sha256,
            "checks": [
                "exact_inventory",
                "audio_format_and_frame_count",
                "zero_endpoints_and_no_clipping",
                "sample_level_parent_lineage",
                "file_task_and_set_sha256",
            ],
        },
        "file_count": total_files,
        "aggregate_sha256": set_digest.hexdigest(),
        "aggregate_algorithm": (
            "For tasks in task_order and files in numeric order: SHA-256(relative "
            "POSIX path + NUL + raw 32-byte SHA-256 of file contents)."
        ),
        "checksums_file": "CHECKSUMS.sha256",
        "checksums_sha256": sha256_bytes(checksum_bytes),
        "task_order": list(profile["task_order"]),
        "tasks": task_manifests,
        "common_audio_format": {
            "sample_rate_hz": SAMPLE_RATE,
            "channels": 1,
            "encoding": "FLAC PCM_16",
        },
        "license": None,
        "license_note": (
            "The parent OSF project does not declare a license. Generation and local "
            "research use do not establish permission to redistribute this derivative."
        ),
        "implementation_decisions": profile["implementation_decisions"],
    }
    return manifest, parameter_bytes, checksum_bytes


def praat_identity(praat_binary: Path) -> tuple[str, str]:
    if not praat_binary.is_file():
        raise VerificationError(f"Praat binary not found: {praat_binary}")
    version_result = subprocess.run(
        [str(praat_binary), "--version"],
        check=True,
        capture_output=True,
        text=True,
    )
    version_line = version_result.stdout.strip()
    if not version_line.startswith("Praat "):
        raise VerificationError(f"unexpected Praat version output: {version_line}")
    version = version_line.split()[1]
    return version, sha256_file(praat_binary)


def build_all(
    stimulus_root: Path, praat_binary: Path
) -> tuple[dict[Path, bytes], dict[str, dict[str, Any]]]:
    parent_manifest = json.loads(PARENT_MANIFEST_PATH.read_text(encoding="utf-8"))
    praat_version, praat_binary_sha256 = praat_identity(praat_binary)
    generator_sha256 = sha256_file(GENERATOR_PATH)
    acoustic_audit_sha256 = sha256_file(ACOUSTIC_AUDIT_PATH)
    metadata_validator_sha256 = sha256_file(METADATA_VALIDATOR_PATH)
    artifacts: dict[Path, bytes] = {}
    manifests: dict[str, dict[str, Any]] = {}

    for profile_id, profile in PROFILES.items():
        manifest, parameters, checksums = inspect_profile(
            profile_id,
            profile,
            stimulus_root,
            parent_manifest,
            praat_version,
            praat_binary_sha256,
            generator_sha256,
            acoustic_audit_sha256,
            metadata_validator_sha256,
        )
        set_root = stimulus_root / profile_id
        manifest_bytes = json_bytes(manifest)
        artifacts[set_root / "PARAMETERS.json"] = parameters
        artifacts[set_root / "CHECKSUMS.sha256"] = checksums
        artifacts[set_root / "STIMULUS_MANIFEST.json"] = manifest_bytes
        manifests[profile_id] = manifest

    parent_manifest_bytes = PARENT_MANIFEST_PATH.read_bytes()
    sets: dict[str, Any] = {
        parent_manifest["stimulus_set_id"]: {
            "root": ".",
            "manifest": PARENT_MANIFEST_PATH.name,
            "manifest_sha256": sha256_bytes(parent_manifest_bytes),
            "aggregate_sha256": parent_manifest["aggregate_sha256"],
            "kind": "official_distribution",
            "claim": "official_osf_offline_files_byte_identical",
            "task_ids": [TASK_TO_PUBLIC_ID[task] for task in parent_manifest["task_order"]],
            "validated": True,
        }
    }
    bindings: dict[str, str] = {}
    for profile_id, profile in PROFILES.items():
        manifest_path = stimulus_root / profile_id / "STIMULUS_MANIFEST.json"
        if manifest_path.is_relative_to(ROOT):
            relative_manifest = manifest_path.relative_to(ROOT).as_posix()
            relative_root = (stimulus_root / profile_id).relative_to(ROOT).as_posix()
        else:
            relative_manifest = f"{profile_id}/STIMULUS_MANIFEST.json"
            relative_root = profile_id
        manifest_bytes = artifacts[manifest_path]
        manifest = manifests[profile_id]
        sets[profile_id] = {
            "root": relative_root,
            "manifest": relative_manifest,
            "manifest_sha256": sha256_bytes(manifest_bytes),
            "aggregate_sha256": manifest["aggregate_sha256"],
            "kind": manifest["kind"],
            "claim": manifest["claim"],
            "task_ids": [TASK_TO_PUBLIC_ID[task] for task in profile["task_order"]],
            "validated": True,
        }
        bindings[profile["protocol_id"]] = profile_id

    catalog = {
        "schema_version": 1,
        "audit_date": "2026-07-17",
        "bindings": bindings,
        "sets": sets,
        "policy": {
            "protocol_and_stimulus_set_are_bound": True,
            "allow_independent_stimulus_selection": False,
            "unvalidated_set_behavior": "fail_closed",
        },
    }
    artifacts[CATALOG_PATH] = json_bytes(catalog)
    return artifacts, manifests


def write_artifacts(artifacts: dict[Path, bytes]) -> None:
    for path, contents in artifacts.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(contents)
        print(f"WROTE {path.relative_to(ROOT)}")


def verify_artifacts(artifacts: dict[Path, bytes]) -> None:
    errors: list[str] = []
    for path, expected in artifacts.items():
        if not path.is_file():
            errors.append(f"missing artifact: {path.relative_to(ROOT)}")
        elif path.read_bytes() != expected:
            errors.append(f"artifact mismatch: {path.relative_to(ROOT)}")
    if errors:
        raise VerificationError("\n".join(errors))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("inspect", "write", "verify"))
    parser.add_argument(
        "--stimulus-root",
        type=Path,
        default=DEFAULT_STIMULUS_ROOT,
        help="root containing the three reconstructed set directories",
    )
    parser.add_argument(
        "--praat-binary",
        type=Path,
        default=DEFAULT_PRAAT_BINARY,
        help="Praat binary used for generation",
    )
    args = parser.parse_args()

    try:
        stimulus_root = args.stimulus_root.resolve()
        artifacts, manifests = build_all(stimulus_root, args.praat_binary.resolve())
        if args.command == "write":
            if stimulus_root != DEFAULT_STIMULUS_ROOT.resolve():
                raise VerificationError(
                    "write is allowed only for the repository stimulus_sets directory"
                )
            write_artifacts(artifacts)
        elif args.command == "verify":
            verify_artifacts(artifacts)
        counts = ", ".join(
            f"{profile_id}={manifest['file_count']}"
            for profile_id, manifest in manifests.items()
        )
        print(f"Reconstructed stimulus metadata {args.command} passed: {counts}")
        return 0
    except (OSError, ValueError, VerificationError, subprocess.SubprocessError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
