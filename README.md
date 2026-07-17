# Audio Discrimination Battery (Integrated)

The integrated interface can run any subset of four auditory discrimination tasks. It separates researcher setup, participant testing, and researcher results; supports English and Japanese; and exports both trial-level and participant-level wide CSV files. Participants see neutral labels (Listening Task 1–4), while researcher screens and CSV files retain the actual task names.

The four earlier stand-alone task pages remain available, but the source-audited settings, bilingual workflow, stimulus identity fields, and schema described below apply to the integrated `index.html` only. Do not mix stand-alone and integrated output in one study unless their procedural differences are explicitly modeled.

The evidence and implementation decisions are recorded in [PROCEDURE_AUDIT.md](PROCEDURE_AUDIT.md). Read that document before freezing a study protocol.

## Dummy code mapping (for researchers)

- Listening Task 1: Pitch discrimination
- Listening Task 2: Formant discrimination
- Listening Task 3: Duration discrimination
- Listening Task 4: Rise-time discrimination

Actual task names are shown only in researcher setup/results and data files.

## Research workflow

1. Open `index.html` and choose English or Japanese.
2. On **Researcher setup**, select one or more tasks, a study profile (procedure plus its bound stimulus set), and a participant-feedback mode.
3. Lock the settings, enter the participant ID, and confirm the neutral task order. The same ID gives the same relative order for the selected tasks.
4. Hand the device to the participant. Each selected task begins with five practice trials, followed by the main adaptive task.
5. After the participant finishes, open **Researcher results** and download the trial-level and/or wide-format CSV before starting the next participant.

## Source-bound procedures and stimuli

The tasks use transformed up-down logic derived from Levitt (1971). Each source setting binds one audited adaptive procedure to one versioned stimulus set through [STIMULUS_CATALOG.json](STIMULUS_CATALOG.json). Researchers cannot independently combine a procedure with another stimulus set; the UI rejects unsupported task/set requests and stops on missing or unreadable audio. Before data collection, `tools/verify_runtime_stimulus_registry.py` must also pass so that catalog, manifest, registry, and file-hash drift is detected rather than trusted by the browser. This binding improves reproducibility but does not reproduce the source study's complete task order, practice, equipment, participant sample, or testing environment.

| Source setting | Harder after | Step sizes | Stop rule | Scored reversals | Bound stimulus set |
|---|---|---|---|---|---|
| Kachlicka, Saito, & Tierney (2019), **default** | Every third correct response, implemented as three consecutive correct responses | 10 → 5 → 2 → 1 | 70 trials or 8 reversals | R2 onward | `kachlicka2019-reconstruction-v1` |
| Saito & Tierney (2024; online 2022) | Three consecutive correct responses | 10 → 5 → 1 | 70 trials or 8 reversals | R3 onward | `saito-tierney2024-reconstruction-v1` |
| Sun, Saito, & Tierney (2021) | One correct response before the first incorrect response; two consecutive correct responses thereafter | 10 → 5 → 2 → 1 | 70 trials or 8 reversals | R3 onward | `sun2021-reconstruction-v1` |

All settings start at published Level 50. An incorrect response makes the task easier. A reversal is recorded when the intended non-zero staircase direction changes. For Sun et al., the resulting Level after the reduced step is applied is recorded; this reproduces their printed example `50 → 40 → 30 → 35 → 35 → 33 → 33 → 34`, with reversals 1–3 at Levels 35, 33, and 34. Kachlicka et al. and Saito and Tierney do not provide an equally complete computational definition, so those presets retain the presented Level before the next step as an explicit implementation decision. The timing is stored in `reversal_level_timing`.

Kachlicka et al. state that the score uses reversal Levels from the second onward, but do not name the aggregation operation in the article. This implementation uses their arithmetic mean and records `threshold_aggregation = arithmetic_mean`. Saito and Tierney explicitly specify the arithmetic mean from the third reversal onward.

These settings do **not** define or reproduce participant eligibility, hearing-screening criteria, headphones, sound-pressure calibration, testing environment, exclusion rules, or inferential statistics. Those items must be fixed separately in the study protocol, ethics materials, preregistration, and analysis plan.

The Kachlicka and Sun reconstructions contain the same decoded PCM because the two articles report the same physical stimulus profile, but they retain separate set IDs and manifests so that procedure–stimulus provenance remains explicit. The Saito–Tierney main-study profile contains pitch, formant, and duration only; rise-time is not available under that source setting.

## Participant feedback

The main task never displays trial correctness or progress, because such feedback can alter response strategy and comparability with the cited procedures. The researcher can choose:

- **Practice feedback only** (default): correctness during the five practice trials; a neutral completion message after the battery.
- **Detailed completion feedback**: the same practice-only correctness, followed after all selected tasks by estimated thresholds. The UI does not display pass/fail, diagnostic labels, percentiles, or “good/poor” judgments.

The selected feedback mode is recorded in both CSV outputs and should normally remain fixed across participants in the same study condition.

## Data output

### Trial-level CSV

- File name: `<participant-id>_audio_discrimination.csv`
- Battery version: `5.0.0`; CSV schema version: `7`.
- One row per main-task trial.
- `stimulus_step`, `stimulus_requested_step`, `step_before`, `step_after`, `reversal_level`, `mean_reversal_so_far`, and `threshold_estimate` use the published Level 0–100 scale.
- `stimulus_file_index`, `stimulus_requested_file_index`, `file_index_before`, and `file_index_after` preserve local FLAC file numbers 1–101.
- `is_reversal`, `reversal_number`, and `reversal_level` allow the threshold to be reconstructed.
- Source/procedure audit columns include `battery_version`, `protocol_id`, `protocol_version`, `protocol_source_locator`, `protocol_source_audit_status`, `procedure_scope`, source-study task scope, `step_sizes`, `first_scored_reversal`, `threshold_aggregation`, timing fields, practice fields, `task_order_method`, and `ui_language`.
- Stimulus lineage columns identify the protocol binding, catalog, selected set and version, set kind and claim, parameter profile, set/manifest/task digests, transformation, generator identity, source citation, licence status, validation status, parent set, and parent source archive. The common fields include `protocol_stimulus_binding_id`, `stimulus_catalog`, `stimulus_catalog_schema_version`, `stimulus_catalog_sha256`, `stimulus_set_id`, `stimulus_set_version`, `stimulus_set_kind`, `stimulus_claim`, `stimulus_parameter_profile_id`, `stimulus_manifest`, `stimulus_manifest_sha256`, `stimulus_set_sha256`, `stimulus_source_citation`, `stimulus_source_locator`, `stimulus_parent_set_id`, `stimulus_parent_manifest`, `stimulus_parent_set_sha256`, `stimulus_parent_source_locator`, `stimulus_source_archive_sha256`, `stimulus_parent_source_archive_sha256`, `stimulus_provenance_verification`, `stimulus_validation_status`, `stimulus_audit_date`, and `stimulus_standard_file_index`.
- Generator lineage is recorded in `stimulus_generator`, `stimulus_generator_version`, `stimulus_generator_script`, `stimulus_generator_script_sha256`, `stimulus_parameters_file`, and `stimulus_parameters_sha256`. Rights metadata uses `stimulus_license` and `stimulus_license_note`. Trial rows additionally contain `stimulus_task_sha256` and `stimulus_task_transformation`.
- `stimulus_file_index` and the Level fields identify the exact file used within the set; set identity must never be inferred from a file number alone. Schema 7 uses `stimulus_error_policy = fatal_no_substitution`, so `stimulus_substituted` is retained for backward-compatible analysis but is always zero in a successfully recorded trial.
- Final task columns include `termination_reason`, `scored_reversal_count`, `reversal_levels_used`, `threshold_available`, and `target_reversals_reached`.

### Wide-format CSV

- File name: `<participant-id>_audio_discrimination_wide.csv`
- Wide schema version: `5`
- One participant per row, with a stable set of columns for all four tasks. Unselected tasks remain blank and have `<task>_selected = 0`.
- Common fields include participant ID, code/schema version, procedure source, procedure–stimulus binding, complete stimulus lineage, feedback mode, selected tasks, task order, timestamps, language use, staircase/timing/practice parameters, and completion status.
- Each task prefix (`pitch_`, `formant_`, `duration_`, `risetime_`) includes whether the task belongs to the selected source study, task-level stimulus digest and transformation, its Level threshold, mean file index, physical threshold, unit, trials, reversals, scored reversal Levels, stopping reason, estimate availability, target-reversal status, median RT, practice accuracy, and stimulus-substitution count. The task-lineage columns are `<task>_stimulus_task_sha256` and `<task>_stimulus_task_transformation`.

The researcher results page shows a readable task-by-task table and an analysis-oriented subset of the one-row wide record. Provenance hashes and machine-readable audit fields remain in the downloaded CSV but are not exposed as internal labels in the UI. No group-level z-score composites or inferential tests are calculated in the browser; those require the full sample and a prespecified analysis plan.

## Published Levels and physical units

Local files are one-based, while the published continuum is zero-based:

`published Level = local file index - 1`

| Task | Standard (`1.flac`, Level 0) | Comparison Levels 1–100 | Physical threshold for Level L |
|---|---:|---:|---:|
| Pitch | F0 = 330 Hz | 330.3–360 Hz | `0.3 × L` Hz F0 difference |
| Formant | F2 = 1500 Hz | 1502–1700 Hz | `2 × L` Hz F2 difference |
| Duration | 250 ms | 252.5–500 ms | `2.5 × L` ms duration difference |
| Rise time | 15 ms | 17.85–300 ms | `2.85 × L` ms rise-time difference |

For example, a pitch `threshold_estimate` of Level 10 corresponds to a 3 Hz F0 difference. No manual subtraction is required for schema version 2–7 CSV files. Older files without `schema_version` stored file indices and still require subtracting 1.

## Stimulus sets, provenance, and reconstruction

### Frozen official distribution

The 404 FLAC files in the four top-level task directories are frozen as `saito-tierney-offline-osf-6p8hv-e8ebb0a5`; they are never overwritten by the reconstruction workflow. [STIMULUS_MANIFEST.json](STIMULUS_MANIFEST.json) records an aggregate SHA-256 of `e8ebb0a5c1a52f5fd2a8be9c8755c33865611c601bdb20c3e7af90a5e589c118`. All 404 files are byte-identical to the corresponding files in the official OSF [`OFFLINE AP TESTS.zip`](https://osf.io/download/6p8hv/), whose SHA-256 is `70dc8bea86020110f81c2932d5eb05f06f2aaa6f2de3469663e501fbacd96bdb`.

This official offline distribution does not match every article description: its pitch files last 500 ms, and its pitch, formant, and duration standards have approximately 50-ms linear onset/offset ramps. Kachlicka et al. and Sun et al. report 15-ms ramps; Saito and Tierney report 250-ms pitch and a 15-ms formant ramp. The separate task-specific MP3 archives in the same OSF project constitute another specification. Their 404 files are byte-identical to the [IRIS Sound stimuli record](https://www.iris-database.org/details/Kl8ck-cx328), but not to the offline FLAC set.

### Versioned publication-parameter reconstructions

Praat 6.4.19 was used to derive three non-destructive sets from the frozen FLAC distribution. Every set has its own manifest, parameter record, checksum list, task hashes, and aggregate hash under `stimulus_sets/`; [STIMULUS_CATALOG.json](STIMULUS_CATALOG.json) binds each set to its procedure.

| Stimulus set | Tasks/files | Aggregate SHA-256 | Intended parameter profile |
|---|---:|---|---|
| [`kachlicka2019-reconstruction-v1`](stimulus_sets/kachlicka2019-reconstruction-v1/STIMULUS_MANIFEST.json) | 4 × 101 = 404 | `ec00a36f74a48ac6e6edcfc77db9817e6cbe34d300c0f62617129d3d43d919c8` | Kachlicka et al. (2019), p.17 |
| [`sun2021-reconstruction-v1`](stimulus_sets/sun2021-reconstruction-v1/STIMULUS_MANIFEST.json) | 4 × 101 = 404 | `ec00a36f74a48ac6e6edcfc77db9817e6cbe34d300c0f62617129d3d43d919c8` | Sun et al. (2021), pp.558–559 |
| [`saito-tierney2024-reconstruction-v1`](stimulus_sets/saito-tierney2024-reconstruction-v1/STIMULUS_MANIFEST.json) | 3 × 101 = 303 | `a09c4360ebb6e68488c431a9366c3bca0ce6b1e23483927aeb55d6e0522031b1` | Saito & Tierney (2024; online 2022), pp.1213–1215 |

The Kachlicka and Sun sets are acoustically identical but retain distinct IDs and manifests. Their declared task profiles and the Saito–Tierney main-study profile are:

| Task | Kachlicka (2019) / Sun (2021) profile | Saito–Tierney (2024) main-study profile |
|---|---|---|
| Pitch | Equal-amplitude four-harmonic complex; `F0 = 330 + 0.3 × Level` Hz; 500 ms; nominal 15-ms linear onset/offset | Same F0 continuum; 250 ms; article does not report a ramp, so the parent 50-ms onset is retained and a 50-ms offset is placed at the cropped endpoint |
| Formant | 100-Hz F0 with harmonics through 3000 Hz; F1 500 Hz, `F2 = 1500 + 2 × Level` Hz, F3 2500 Hz; 500 ms; nominal 15-ms linear onset/offset | Same frequency continuum, duration, and nominal 15-ms linear onset/offset |
| Duration | Equal-amplitude four-harmonic 330-Hz complex; `250 + 2.5 × Level` ms; nominal 15-ms linear onset/offset | Same duration continuum; article does not report a ramp, so the parent 50-ms onset/offset is retained |
| Rise time | Equal-amplitude four-harmonic 330-Hz complex; 500 ms; onset `15 + 2.85 × Level` ms; approximately 15-ms offset | Not in the main study; no files and unavailable under this setting |

Kachlicka et al. round the first nonstandard rise time to 17.8 ms; the Level formula gives 17.85 ms and is explicit in Sun et al. The reconstruction records this distinction. The Saito–Tierney set contains only the three tasks in the main test–retest study. Pitch is cropped, not time-stretched; its first 200 ms of PCM is retained. Formant is reconstructed as described below.

At 44.1 kHz, the nominal 15-ms ramp reaches its first plateau sample at index 662 (15.011 ms). No peak or RMS normalization is applied. All outputs are mono, 44.1-kHz, 16-bit PCM FLAC.

Duration frame counts are inherited from the parent distribution. Floating-point truncation in that distribution produces a maximum deviation of one sample (`0.022676` ms) from the nominal duration continuum; this is preserved and declared rather than silently resampled. For Saito and Tierney, the article text and the 330.3–360-Hz comparison continuum support a 330-Hz pitch standard, whereas Table 2 contains an isolated 300-Hz entry. The reconstruction follows 330 Hz and records this source inconsistency in its parameter file and manifest.

### Formant reconstruction

Removing the distributed 50-ms envelope by division exposes a filter start-up transient in the early formant waveform. The reconstruction therefore does not extrapolate that transient or invent unreported formant-filter parameters. For each Level, it takes the sample-exact steady 100-Hz carrier cycle beginning at source sample 8821 (0.200 s), repeats its 441 samples over 500 ms, and applies the nominal 15-ms linear onset/offset. The retained cycle preserves the distributed steady-state harmonic amplitudes and Level progression. It is nevertheless a documented reconstruction choice, not evidence that the same phase, filter state, or waveform was used in the original experiments.

### Reproducible generation and verification

Before generation, verify the frozen parent set:

```sh
python3 tools/verify_stimulus_manifest.py
python3 tools/audit_stimulus_acoustics.py --profile original --root .
```

To check the parent set against an independently downloaded official archive, add:

```sh
python3 tools/verify_stimulus_manifest.py \
  --source-archive "/path/to/OFFLINE AP TESTS.zip"
```

On a fresh build with an empty output directory, run the pinned Praat script with absolute paths and overwrite disabled:

```sh
"/Applications/Praat.app/Contents/MacOS/Praat" --run --no-pref-files \
  tools/reconstruct_stimuli.praat \
  "/absolute/path/to/Audio_Discrimination" \
  "/absolute/path/to/Audio_Discrimination/stimulus_sets" \
  0
python3 tools/manage_reconstructed_stimuli.py write
```

For the checked-in sets, verify every manifest, parameter file, checksum list, catalog entry, Praat identity, and PCM-lineage assertion, then run the profile-specific acoustic audits:

```sh
python3 tools/manage_reconstructed_stimuli.py verify
python3 tools/verify_runtime_stimulus_registry.py
python3 tools/audit_stimulus_acoustics.py \
  --profile kachlicka2019 \
  --root stimulus_sets/kachlicka2019-reconstruction-v1
python3 tools/audit_stimulus_acoustics.py \
  --profile sun2021 \
  --root stimulus_sets/sun2021-reconstruction-v1
python3 tools/audit_stimulus_acoustics.py \
  --profile saito_tierney2024 \
  --root stimulus_sets/saito-tierney2024-reconstruction-v1
```

Independent builds can be compared against the canonical sets and against one another with:

```sh
python3 tools/verify_reconstruction_reproducibility.py \
  "/path/to/independent-run-1" \
  "/path/to/independent-run-2" \
  --report RECONSTRUCTION_VALIDATION.json
```

[RECONSTRUCTION_VALIDATION.json](RECONSTRUCTION_VALIDATION.json) records the completed validation: two independent Praat runs, each containing all 1,111 generated FLAC files, were byte-identical to the canonical sets. Metadata files are excluded from this comparison; their deterministic content is checked separately by `manage_reconstructed_stimuli.py verify`.

Passing these checks establishes deterministic derivation from the frozen parent, agreement with the declared physical profile within the documented tolerances, and identity with the recorded local bytes. It does **not** establish byte or waveform identity with the stimuli heard by participants in the cited studies. The original generating PCM/MATLAB code and some synthesis parameters are unavailable; each manifest therefore states `reported_parameter_reconstruction_not_original_study_files`.

The OSF project does not declare a licence for the offline FLAC archive. Creating and locally validating a derivative does not itself grant permission to redistribute it. The browser also never substitutes another file for a missing or unreadable stimulus: playback stops, the response is not accepted, and no trial row is recorded. Repair the inventory, rerun all applicable checks, and follow the preregistered technical-failure rule.

## Required files and placement

Keep the catalog, frozen parent, and reconstructed sets in their recorded locations alongside the integrated application:

```
audio_discrimination/
  ├ index.html
  ├ script.js
  ├ STIMULUS_CATALOG.json
  ├ STIMULUS_MANIFEST.json
  ├ RECONSTRUCTION_VALIDATION.json
  ├ duration_discrimination/
  ├ formant_discrimination/
  ├ pitch_discrimination/
  ├ risetime_discrimination/
  └ stimulus_sets/
      ├ kachlicka2019-reconstruction-v1/
      ├ sun2021-reconstruction-v1/
      └ saito-tierney2024-reconstruction-v1/
```

The top-level task folders are the frozen parent distribution; the bound set under `stimulus_sets/` supplies runtime audio. Do not rename, move, or edit individual files after manifests are written. Results live in browser memory, so download both required files before closing the page or starting the next participant.

## References

Kachlicka, M., Saito, K., & Tierney, A. (2019). Successful second language learning is tied to robust domain-general auditory processing and stable neural representation of sound. *Brain and Language, 192*, 15–24. https://doi.org/10.1016/j.bandl.2019.02.004

Levitt, H. (1971). Transformed up-down methods in psychoacoustics. *The Journal of the Acoustical Society of America, 49*(2B), 467–477. https://doi.org/10.1121/1.1912375

Saito, K., & Tierney, A. (2024). Domain-general auditory processing as a conceptual and measurement framework for second language speech learning aptitude: A test-retest reliability study. *Studies in Second Language Acquisition, 46*, 1206–1230. Published online in 2022. https://doi.org/10.1017/S027226312200047X

Sun, H., Saito, K., & Tierney, A. (2021). A longitudinal investigation of explicit and implicit auditory processing in L2 segmental and suprasegmental acquisition. *Studies in Second Language Acquisition, 43*(3), 551–573. https://doi.org/10.1017/S0272263120000649

Woods, K. J. P., Siegel, M. H., Traer, J., & McDermott, J. H. (2017). Headphone screening to facilitate web-based auditory experiments. *Attention, Perception, & Psychophysics, 79*, 2064–2072. https://doi.org/10.3758/s13414-017-1361-2
