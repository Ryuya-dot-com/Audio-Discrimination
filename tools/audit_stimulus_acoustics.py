#!/usr/bin/env python3
"""Audit the acoustic invariants of a versioned FLAC stimulus set.

This script is deliberately read-only.  The default ``original`` profile checks
the exact local/offline stimulus set.  The other profiles check separately stored
reconstructions against their declared publication-specific physical profiles.

Dependencies: Python 3, numpy, soundfile.

Level is the published 0--100 scale; filename is Level + 1.

Numerical tolerances (44.1-kHz, 16-bit source):
  * expected frame counts: exact
  * harmonic-carrier fit RMSE: <= 2e-5 full scale
  * equal-harmonic amplitude CV: <= 2e-4
  * pitch F0: <= 0.01 Hz from 330 + 0.3 * Level
  * fitted linear-ramp duration: <= 0.10 ms from its sampled target
  * formant-region harmonic peak: <= 60 Hz from nominal F2
  * formant spectral-centroid step: > 0.5 Hz per Level
  * formant centroid/Level correlation: >= 0.995

The F2 check is necessarily coarse: a 100-Hz harmonic series does not directly
sample a 2-Hz formant continuum.  It verifies the nearest spectral peak and a
strictly increasing formant-region centroid; it does not recover the generating
filter's continuous-valued F2 parameter.
"""

from __future__ import annotations

import argparse
import math
import sys
from dataclasses import dataclass
from pathlib import Path

try:
    import numpy as np
    import soundfile as sf
except ImportError as exc:  # pragma: no cover - depends on the runtime image
    print(f"FAIL: missing required dependency: {exc}", file=sys.stderr)
    raise SystemExit(1) from exc


SAMPLE_RATE = 44_100
CHANNELS = 1
SUBTYPE = "PCM_16"
FORMAT = "FLAC"
LEVELS = range(101)

CARRIER_RMSE_MAX = 2.0e-5
HARMONIC_AMPLITUDE_CV_MAX = 2.0e-4
PITCH_F0_TOLERANCE_HZ = 0.01
PITCH_SEARCH_HALF_WIDTH_HZ = 0.12
RAMP_TOLERANCE_MS = 0.10
FORMANT_F2_PEAK_TOLERANCE_HZ = 60.0
FORMANT_CENTROID_MIN_STEP_HZ = 0.5
FORMANT_CENTROID_MIN_CORRELATION = 0.995


@dataclass(frozen=True)
class TaskSpec:
    key: str
    directory: str
    fixed_frames: int | None


@dataclass(frozen=True)
class ProfileSpec:
    key: str
    task_keys: tuple[str, ...]
    pitch_frames: int
    pitch_fit_window: tuple[float, float]
    standard_ramps_ms: tuple[tuple[str, float], ...]

    def ramp_ms(self, task: str) -> float:
        return dict(self.standard_ramps_ms)[task]


TASK_DIRECTORIES = {
    "pitch": "pitch_discrimination/Stimuli",
    "formant": "formant_discrimination/Stimuli",
    "duration": "duration_discrimination/Stimuli",
    "risetime": "risetime_discrimination/Stimuli",
}

FOUR_TASKS = ("pitch", "formant", "duration", "risetime")

PROFILES = {
    "original": ProfileSpec(
        key="original",
        task_keys=FOUR_TASKS,
        pitch_frames=22_050,
        pitch_fit_window=(0.2, 0.3),
        standard_ramps_ms=(
            ("pitch", 50.0),
            ("formant", 50.0),
            ("duration", 50.0),
            ("risetime", 15.0),
        ),
    ),
    "kachlicka2019": ProfileSpec(
        key="kachlicka2019",
        task_keys=FOUR_TASKS,
        pitch_frames=22_050,
        pitch_fit_window=(0.2, 0.3),
        standard_ramps_ms=(
            ("pitch", 15.0),
            ("formant", 15.0),
            ("duration", 15.0),
            ("risetime", 15.0),
        ),
    ),
    "sun2021": ProfileSpec(
        key="sun2021",
        task_keys=FOUR_TASKS,
        pitch_frames=22_050,
        pitch_fit_window=(0.2, 0.3),
        standard_ramps_ms=(
            ("pitch", 15.0),
            ("formant", 15.0),
            ("duration", 15.0),
            ("risetime", 15.0),
        ),
    ),
    "saito_tierney2024": ProfileSpec(
        key="saito_tierney2024",
        task_keys=("pitch", "formant", "duration"),
        pitch_frames=11_025,
        pitch_fit_window=(0.1, 0.15),
        standard_ramps_ms=(("pitch", 50.0), ("formant", 15.0), ("duration", 50.0)),
    ),
}


def tasks_for_profile(profile: ProfileSpec) -> tuple[TaskSpec, ...]:
    tasks: list[TaskSpec] = []
    for key in profile.task_keys:
        if key == "pitch":
            fixed_frames: int | None = profile.pitch_frames
        elif key == "duration":
            fixed_frames = None
        else:
            fixed_frames = 22_050
        tasks.append(TaskSpec(key, TASK_DIRECTORIES[key], fixed_frames))
    return tuple(tasks)


class Audit:
    def __init__(self) -> None:
        self.errors: list[str] = []

    def check(self, condition: bool, message: str) -> None:
        if not condition:
            self.errors.append(message)


def expected_duration_frames(level: int) -> int:
    """Mirror the distributed files' float-multiply-then-truncate convention.

    At Levels 36 and 40, binary floating-point representation puts the product
    infinitesimally below an integer, so those files contain one fewer sample than
    an exact-rational calculation would predict.  Reproducing that convention
    lets the audit check every frame count exactly.
    """

    return int(SAMPLE_RATE * (0.250 + 0.0025 * level))


def sampled_ramp_ms(nominal_ms: float) -> float:
    """Mirror the observed generator convention: ceil(samples), then n/N."""

    samples = math.ceil(SAMPLE_RATE * nominal_ms / 1000.0 - 1.0e-12)
    return samples * 1000.0 / SAMPLE_RATE


def read_mono(path: Path) -> np.ndarray:
    samples, sample_rate = sf.read(path, dtype="float64", always_2d=False)
    if sample_rate != SAMPLE_RATE:
        raise ValueError(f"unexpected sample rate while reading {path}: {sample_rate}")
    if samples.ndim != 1:
        raise ValueError(f"expected mono samples while reading {path}")
    return samples


def harmonic_design(times: np.ndarray, f0_hz: float, harmonics: int) -> np.ndarray:
    columns: list[np.ndarray] = []
    for harmonic in range(1, harmonics + 1):
        phase = 2.0 * np.pi * harmonic * f0_hz * times
        columns.extend((np.sin(phase), np.cos(phase)))
    return np.column_stack(columns)


def fit_harmonics(
    samples: np.ndarray,
    f0_hz: float,
    harmonics: int,
    start_s: float,
    end_s: float,
) -> tuple[np.ndarray, float, np.ndarray]:
    start = round(start_s * SAMPLE_RATE)
    end = round(end_s * SAMPLE_RATE)
    indices = np.arange(start, end)
    times = indices / SAMPLE_RATE
    design = harmonic_design(times, f0_hz, harmonics)
    coefficients = np.linalg.lstsq(design, samples[indices], rcond=None)[0]
    residual = samples[indices] - design @ coefficients
    rmse = float(np.sqrt(np.mean(residual * residual)))
    amplitudes = np.hypot(coefficients[0::2], coefficients[1::2])
    return coefficients, rmse, amplitudes


def synthesize_carrier(
    frame_count: int, f0_hz: float, harmonics: int, coefficients: np.ndarray
) -> np.ndarray:
    times = np.arange(frame_count) / SAMPLE_RATE
    return harmonic_design(times, f0_hz, harmonics) @ coefficients


def harmonic_fit_mse(samples: np.ndarray, times: np.ndarray, f0_hz: float) -> float:
    design = harmonic_design(times, f0_hz, 4)
    coefficients = np.linalg.lstsq(design, samples, rcond=None)[0]
    residual = samples - design @ coefficients
    return float(np.mean(residual * residual))


def estimate_pitch_f0(
    samples: np.ndarray,
    expected_hz: float,
    fit_window: tuple[float, float],
) -> float:
    """Variable-projection search in the local basin around the expected F0."""

    indices = np.arange(
        round(fit_window[0] * SAMPLE_RATE), round(fit_window[1] * SAMPLE_RATE)
    )
    times = indices / SAMPLE_RATE
    plateau = samples[indices]
    left = expected_hz - PITCH_SEARCH_HALF_WIDTH_HZ
    right = expected_hz + PITCH_SEARCH_HALF_WIDTH_HZ
    phi = (math.sqrt(5.0) - 1.0) / 2.0
    c = right - phi * (right - left)
    d = left + phi * (right - left)
    fc = harmonic_fit_mse(plateau, times, c)
    fd = harmonic_fit_mse(plateau, times, d)

    for _ in range(18):
        if fc < fd:
            right, d, fd = d, c, fc
            c = right - phi * (right - left)
            fc = harmonic_fit_mse(plateau, times, c)
        else:
            left, c, fc = c, d, fd
            d = left + phi * (right - left)
            fd = harmonic_fit_mse(plateau, times, d)
    return (left + right) / 2.0


def estimate_linear_ramp_ms(
    samples: np.ndarray,
    carrier: np.ndarray,
    nominal_ms: float,
    side: str,
) -> float:
    """Fit x(t) = carrier(t) * t/T over the middle 90% of a ramp."""

    if side == "onset":
        distance_s = np.arange(len(samples)) / SAMPLE_RATE
    elif side == "offset":
        distance_s = (len(samples) - 1 - np.arange(len(samples))) / SAMPLE_RATE
    else:  # pragma: no cover - internal programming error
        raise ValueError(f"unknown ramp side: {side}")

    nominal_s = nominal_ms / 1000.0
    mask = (distance_s >= 0.05 * nominal_s) & (distance_s <= 0.95 * nominal_s)
    predictor = carrier[mask] * distance_s[mask]
    denominator = float(predictor @ predictor)
    if denominator <= 0.0:
        raise ValueError("linear-ramp fit has no usable carrier energy")
    inverse_duration = float(predictor @ samples[mask]) / denominator
    if inverse_duration <= 0.0:
        raise ValueError("linear-ramp fit returned a non-positive duration")
    return 1000.0 / inverse_duration


def amplitude_cv(amplitudes: np.ndarray) -> float:
    return float(np.std(amplitudes) / np.mean(amplitudes))


def validate_inventory(
    root: Path, audit: Audit, profile: ProfileSpec
) -> dict[str, list[Path]]:
    paths_by_task: dict[str, list[Path]] = {}
    expected_names = {f"{index}.flac" for index in range(1, 102)}

    for excluded_task in set(TASK_DIRECTORIES) - set(profile.task_keys):
        excluded_directory = root / TASK_DIRECTORIES[excluded_task]
        excluded_files = sorted(path.name for path in excluded_directory.glob("*.flac"))
        audit.check(
            not excluded_files,
            f"{profile.key}: unexpected {excluded_task} FLAC files: {excluded_files}",
        )

    for task in tasks_for_profile(profile):
        directory = root / task.directory
        actual_names = {path.name for path in directory.glob("*.flac")}
        audit.check(
            actual_names == expected_names,
            f"{task.key}: expected files 1.flac--101.flac exactly; "
            f"missing={sorted(expected_names - actual_names)} "
            f"extra={sorted(actual_names - expected_names)}",
        )
        ordered = [directory / f"{level + 1}.flac" for level in LEVELS]
        paths_by_task[task.key] = ordered

        for level, path in zip(LEVELS, ordered):
            if not path.is_file():
                continue
            info = sf.info(path)
            expected_frames = (
                task.fixed_frames
                if task.fixed_frames is not None
                else expected_duration_frames(level)
            )
            audit.check(info.format == FORMAT, f"{path}: format={info.format}, expected FLAC")
            audit.check(
                info.subtype == SUBTYPE,
                f"{path}: subtype={info.subtype}, expected PCM_16",
            )
            audit.check(
                info.samplerate == SAMPLE_RATE,
                f"{path}: sample_rate={info.samplerate}, expected {SAMPLE_RATE}",
            )
            audit.check(info.channels == CHANNELS, f"{path}: channels={info.channels}, expected 1")
            audit.check(
                info.frames == expected_frames,
                f"{path}: frames={info.frames}, expected {expected_frames}",
            )

    return paths_by_task


def audit_four_harmonic_series(
    audit: Audit,
    paths: list[Path],
    task: str,
    f0_for_level,
    fit_window: tuple[float, float],
) -> tuple[float, float]:
    max_rmse = 0.0
    max_cv = 0.0
    for level, path in zip(LEVELS, paths):
        samples = read_mono(path)
        f0_hz = float(f0_for_level(level))
        _, rmse, amplitudes = fit_harmonics(
            samples, f0_hz, 4, fit_window[0], fit_window[1]
        )
        cv = amplitude_cv(amplitudes)
        max_rmse = max(max_rmse, rmse)
        max_cv = max(max_cv, cv)
        audit.check(
            rmse <= CARRIER_RMSE_MAX,
            f"{task} Level {level}: carrier RMSE {rmse:.3g} > {CARRIER_RMSE_MAX:.3g}",
        )
        audit.check(
            cv <= HARMONIC_AMPLITUDE_CV_MAX,
            f"{task} Level {level}: harmonic amplitude CV {cv:.3g} "
            f"> {HARMONIC_AMPLITUDE_CV_MAX:.3g}",
        )
    return max_rmse, max_cv


def audit_pitch(
    audit: Audit,
    paths: list[Path],
    fit_window: tuple[float, float],
) -> tuple[float, float, float]:
    max_rmse, max_cv = audit_four_harmonic_series(
        audit,
        paths,
        "pitch",
        lambda level: 330.0 + 0.3 * level,
        fit_window,
    )
    max_f0_error = 0.0
    for level, path in zip(LEVELS, paths):
        expected_hz = 330.0 + 0.3 * level
        estimated_hz = estimate_pitch_f0(read_mono(path), expected_hz, fit_window)
        error_hz = abs(estimated_hz - expected_hz)
        max_f0_error = max(max_f0_error, error_hz)
        audit.check(
            error_hz <= PITCH_F0_TOLERANCE_HZ,
            f"pitch Level {level}: F0={estimated_hz:.6f} Hz, "
            f"expected={expected_hz:.6f} +/- {PITCH_F0_TOLERANCE_HZ:.3f} Hz",
        )
    return max_rmse, max_cv, max_f0_error


def audit_formant(audit: Audit, paths: list[Path]) -> tuple[float, float, float]:
    frequencies = np.arange(1, 31) * 100.0
    centroids: list[float] = []
    max_rmse = 0.0
    max_f2_peak_error = 0.0

    for level, path in zip(LEVELS, paths):
        samples = read_mono(path)
        _, rmse, amplitudes = fit_harmonics(samples, 100.0, 30, 0.2, 0.3)
        max_rmse = max(max_rmse, rmse)
        audit.check(
            rmse <= CARRIER_RMSE_MAX,
            f"formant Level {level}: 30-harmonic carrier RMSE {rmse:.3g} "
            f"> {CARRIER_RMSE_MAX:.3g}",
        )

        peaks: list[float] = []
        for low_hz, high_hz in ((300, 800), (1200, 2000), (2200, 2800)):
            mask = (frequencies >= low_hz) & (frequencies <= high_hz)
            peaks.append(float(frequencies[mask][np.argmax(amplitudes[mask])]))
        f1_peak, f2_peak, f3_peak = peaks
        nominal_f2 = 1500.0 + 2.0 * level
        f2_peak_error = abs(f2_peak - nominal_f2)
        max_f2_peak_error = max(max_f2_peak_error, f2_peak_error)
        audit.check(f1_peak == 500.0, f"formant Level {level}: F1-region peak={f1_peak:g} Hz")
        audit.check(f3_peak == 2500.0, f"formant Level {level}: F3-region peak={f3_peak:g} Hz")
        audit.check(
            f2_peak_error <= FORMANT_F2_PEAK_TOLERANCE_HZ,
            f"formant Level {level}: F2-region peak={f2_peak:g} Hz, "
            f"nominal={nominal_f2:g} Hz, error>{FORMANT_F2_PEAK_TOLERANCE_HZ:g} Hz",
        )

        centroid_mask = (frequencies >= 1200.0) & (frequencies <= 1900.0)
        power = amplitudes[centroid_mask] ** 2
        centroid = float(frequencies[centroid_mask] @ power / np.sum(power))
        centroids.append(centroid)

    centroid_steps = np.diff(np.asarray(centroids))
    min_step = float(np.min(centroid_steps))
    correlation = float(np.corrcoef(np.arange(101), np.asarray(centroids))[0, 1])
    audit.check(
        min_step > FORMANT_CENTROID_MIN_STEP_HZ,
        f"formant: minimum centroid step={min_step:.6f} Hz, "
        f"expected > {FORMANT_CENTROID_MIN_STEP_HZ:g} Hz",
    )
    audit.check(
        correlation >= FORMANT_CENTROID_MIN_CORRELATION,
        f"formant: centroid/Level r={correlation:.6f}, "
        f"expected >= {FORMANT_CENTROID_MIN_CORRELATION:g}",
    )
    return max_rmse, max_f2_peak_error, correlation


def audit_rise_times(audit: Audit, paths: list[Path]) -> tuple[float, float, float]:
    max_rmse, max_cv = audit_four_harmonic_series(
        audit, paths, "risetime", lambda _level: 330.0, (0.32, 0.44)
    )
    max_ramp_error_ms = 0.0
    for level, path in zip(LEVELS, paths):
        samples = read_mono(path)
        coefficients, _, _ = fit_harmonics(samples, 330.0, 4, 0.32, 0.44)
        carrier = synthesize_carrier(len(samples), 330.0, 4, coefficients)
        nominal_ms = 15.0 + 2.85 * level
        expected_sampled_ms = sampled_ramp_ms(nominal_ms)
        estimated_ms = estimate_linear_ramp_ms(samples, carrier, nominal_ms, "onset")
        error_ms = abs(estimated_ms - expected_sampled_ms)
        max_ramp_error_ms = max(max_ramp_error_ms, error_ms)
        audit.check(
            error_ms <= RAMP_TOLERANCE_MS,
            f"risetime Level {level}: onset={estimated_ms:.6f} ms, "
            f"sampled target={expected_sampled_ms:.6f} +/- {RAMP_TOLERANCE_MS:.2f} ms",
        )
    return max_rmse, max_cv, max_ramp_error_ms


def audit_standard_ramps(
    audit: Audit,
    paths_by_task: dict[str, list[Path]],
    profile: ProfileSpec,
) -> dict[str, tuple[float, float]]:
    carrier_specifications = {
        "pitch": (330.0, 4, profile.pitch_fit_window),
        "duration": (330.0, 4, (0.1, 0.18)),
        "formant": (100.0, 30, (0.2, 0.3)),
        "risetime": (330.0, 4, (0.32, 0.44)),
    }
    measured: dict[str, tuple[float, float]] = {}
    for task in profile.task_keys:
        base_f0_hz, harmonics, fit_window = carrier_specifications[task]
        for level, path in zip(LEVELS, paths_by_task[task]):
            samples = read_mono(path)
            f0_hz = 330.0 + 0.3 * level if task == "pitch" else base_f0_hz
            coefficients, _, _ = fit_harmonics(
                samples, f0_hz, harmonics, fit_window[0], fit_window[1]
            )
            carrier = synthesize_carrier(
                len(samples), f0_hz, harmonics, coefficients
            )
            onset_nominal_ms = (
                15.0 + 2.85 * level
                if task == "risetime"
                else profile.ramp_ms(task)
            )
            offset_nominal_ms = profile.ramp_ms(task)
            onset_ms = estimate_linear_ramp_ms(
                samples, carrier, onset_nominal_ms, "onset"
            )
            offset_ms = estimate_linear_ramp_ms(
                samples, carrier, offset_nominal_ms, "offset"
            )
            onset_target_ms = sampled_ramp_ms(onset_nominal_ms)
            offset_target_ms = sampled_ramp_ms(offset_nominal_ms)
            audit.check(
                abs(onset_ms - onset_target_ms) <= RAMP_TOLERANCE_MS,
                f"{task} Level {level}: onset={onset_ms:.6f} ms, "
                f"sampled target={onset_target_ms:.6f} +/- {RAMP_TOLERANCE_MS:.2f} ms",
            )
            audit.check(
                abs(offset_ms - offset_target_ms) <= RAMP_TOLERANCE_MS,
                f"{task} Level {level}: offset={offset_ms:.6f} ms, "
                f"sampled target={offset_target_ms:.6f} +/- {RAMP_TOLERANCE_MS:.2f} ms",
            )
            if level == 0:
                measured[task] = (onset_ms, offset_ms)
    return measured


def print_failures(errors: list[str]) -> None:
    print(f"FAIL: acoustic stimulus audit found {len(errors)} error(s).", file=sys.stderr)
    for error in errors[:50]:
        print(f"  - {error}", file=sys.stderr)
    if len(errors) > 50:
        print(f"  - ... {len(errors) - 50} additional error(s)", file=sys.stderr)


def run(root: Path, profile: ProfileSpec) -> int:
    audit = Audit()
    paths_by_task = validate_inventory(root, audit, profile)
    if audit.errors:
        print_failures(audit.errors)
        return 1

    pitch_rmse, pitch_cv, pitch_f0_error = audit_pitch(
        audit, paths_by_task["pitch"], profile.pitch_fit_window
    )
    duration_rmse, duration_cv = audit_four_harmonic_series(
        audit,
        paths_by_task["duration"],
        "duration",
        lambda _level: 330.0,
        (0.1, 0.18),
    )
    formant_rmse, formant_peak_error, formant_correlation = audit_formant(
        audit, paths_by_task["formant"]
    )
    rise_metrics: tuple[float, float, float] | None = None
    if "risetime" in profile.task_keys:
        rise_metrics = audit_rise_times(audit, paths_by_task["risetime"])
    standard_ramps = audit_standard_ramps(audit, paths_by_task, profile)

    if audit.errors:
        print_failures(audit.errors)
        return 1

    ramps = ", ".join(
        f"{task}={values[0]:.3f}/{values[1]:.3f}"
        for task, values in standard_ramps.items()
    )
    file_count = len(profile.task_keys) * len(LEVELS)
    print(f"OK: profile={profile.key}; root={root}")
    print(
        f"OK: {file_count} FLAC; 44.1 kHz, mono, PCM_16; all frame counts exact."
    )
    print(
        "OK: pitch F0 330.0--360.0 Hz in 0.3-Hz steps; "
        f"max error={pitch_f0_error:.6f} Hz, RMSE={pitch_rmse:.3g}, CV={pitch_cv:.3g}."
    )
    print(
        "OK: duration 250.0--500.0 ms in 2.5-ms nominal steps; "
        f"330-Hz carrier RMSE={duration_rmse:.3g}, CV={duration_cv:.3g}."
    )
    print(
        "OK: formant 100-Hz F0/30 harmonics; F1=500 Hz, nominal F2=1500--1700 Hz, "
        f"F3=2500 Hz; max sampled-peak error={formant_peak_error:.1f} Hz, "
        f"centroid r={formant_correlation:.6f}, RMSE={formant_rmse:.3g}."
    )
    if rise_metrics is not None:
        rise_rmse, rise_cv, rise_ramp_error = rise_metrics
        print(
            "OK: rise time 15.0--300.0 ms in 2.85-ms nominal steps; "
            f"max sampled-ramp error={rise_ramp_error:.6f} ms, "
            f"RMSE={rise_rmse:.3g}, CV={rise_cv:.3g}."
        )
    print(f"OK: standard onset/offset ramps (ms): {ramps}.")
    print(
        "TOL: frames exact; carrier RMSE<=2e-5; harmonic CV<=2e-4; "
        "pitch<=0.01 Hz; ramp<=0.10 ms; F2 peak<=60 Hz; centroid step>0.5 Hz/r>=0.995."
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--profile",
        choices=tuple(PROFILES),
        default="original",
        help="physical stimulus profile (default: original)",
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="repository root (default: parent of tools/)",
    )
    args = parser.parse_args()
    try:
        return run(args.root.resolve(), PROFILES[args.profile])
    except Exception as exc:  # make all audit failures machine-detectable
        print(f"FAIL: acoustic stimulus audit aborted: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
