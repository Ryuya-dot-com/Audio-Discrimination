# Audio Discrimination Battery (Integrated)

The integrated interface can run any supported subset of four auditory discrimination tasks. It separates researcher setup, participant testing, and result handling; supports English and Japanese; and exports a ZIP result package containing trial-level and participant-level wide CSV files plus a machine-readable session manifest. English is the default for a bare URL and for the participant-link language selector; a researcher can explicitly encode Japanese as the starting language.

Participant screens label tasks sequentially by their position in that participant's order (`Listening Task 1`, `Listening Task 2`, and so on). These are neutral session-local labels, not permanent aliases for pitch, formant, duration, or rise-time. Researcher screens, participant-link parameters, CSV files, the manifest, and the public source code retain the actual task IDs. The generated URL therefore is not a participant-blinding mechanism.

The four earlier stand-alone task paths are retained only as historical entry points that display a non-interactive stop notice. They cannot start an experiment or produce results. All study use must enter through the integrated `index.html`.

The evidence and implementation decisions are recorded in [PROCEDURE_AUDIT.md](PROCEDURE_AUDIT.md). Read that document before freezing a study protocol.

## Operating modes

The researcher chooses one of two operational flows by the action used on the setup screen:

- **Supervised (`administration_mode = supervised`)**: start the session on the same browser/device. At completion, the researcher can inspect the result tables and download the ZIP package or either CSV. The next-participant control remains disabled until a ZIP download has been initiated and then requires a deletion confirmation.
- **Remote manual return (`administration_mode = remote_manual_upload`)**: the complete participant and result-return flow can be exercised with visibly labelled local TEST links. Production link issuance and execution remain disabled until an authenticated issuer and participant-side signature verification are integrated. Once that boundary exists, the participant downloads the ZIP, uploads it through the approved external HTTPS return portal, and retains the portal's receipt; the app itself never uploads or verifies acceptance.

This repository is a static site. It cannot authenticate invitations, make a link one-time, authenticate a researcher, provide an approved data-receiving backend, or verify a portal receipt. For remote studies, the signed issuer, receiving service, access controls, retention rules, duplicate handling, participant support, and receipt reconciliation must be supplied and approved outside this app. Runtime authority comes from the frozen, non-secret [deployment-config.json](deployment-config.json). The current build allows production/staging research only as a supervised session on the exact researcher origin; the participant origin remains fail-closed. The checked-in `*.github.io` configuration is **preview-only** and cannot start research sessions. See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for the promotion procedure.

The deployment configuration is included in `app_build_sha256`; a missing, unreadable, unknown-schema, or internally inconsistent configuration stops the app. The configuration also controls whether researcher UI is exposed, fixes the public participant base URL, and allowlists exact HTTPS origins for remote `return_url` values. It must never contain credentials, access tokens, participant identifiers, or other secrets.

## Research workflow

1. Open the approved deployment on the exact HTTPS origin frozen in its deployment configuration. A bare URL starts in English. `file://`, `*.github.io`, and arbitrary HTTPS copies cannot run research sessions. `localhost`, `127.0.0.1`, and `[::1]` can run only an explicitly labelled `test` session when local tests are enabled in the configuration.
2. Enter the required non-participant study metadata: study, condition, site, and distribution IDs; participant-facing title; institution; consent version; expected minutes; and external HTTPS consent and contact URLs. A remote link additionally requires an approved HTTPS result-return portal. Do not enter direct identifiers or credentials in these fields or URLs.
3. Select one or more available tasks, a study profile (procedure plus its bound stimulus set), feedback mode, and—when creating a link—the participant's starting language. English is selected by default.
4. Start a supervised session on the current device. A local loopback environment may create a visibly labelled TEST link to exercise the remote flow. Do not distribute a remote research link: production issuance and execution are disabled until the signed-issuer boundary in [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) is implemented and audited.
5. Before consent confirmation, a remote participant is told that completion requires saving a ZIP, uploading it through the named portal, retaining the portal receipt, and then explicitly clearing the browser copy. The participant reviews the study identity and external consent information, confirms that the study's consent process was completed, and passes the headphone/environment checklist and test-sound playback. This checkbox records a confirmation time; the app does not replace the study's approved consent system.
6. The participant enters the researcher-supplied pseudonymous code, checks it before starting, and confirms the sequential neutral task order. Each selected task has five practice trials followed by the main adaptive task.
7. If playback fails, retry the uncommitted presentation or end with a `technical_failure` partial package. The participant can also stop at any time and explicitly delete the browser checkpoint.
8. Complete result handling for the chosen operating mode. In supervised mode, retain and verify the ZIP before clearing the session. In remote mode, verify that the ZIP exists, upload it to the external portal, retain and reconcile its receipt, and only then use the explicit clear control. The app records the participant's confirmation but cannot verify the upload or receipt.

## Participant links and participant codes

The researcher screen currently creates participant links only on an explicitly enabled loopback TEST environment. A link pins participant-link schema 3, battery version, deployment ID, frozen deployment-config SHA-256, `session_type=test`, protocol and protocol version, stimulus-catalog hash, bound stimulus-set ID and manifest hash, selected tasks, feedback mode, starting language, study/condition/site/distribution IDs, participant-facing study title, institution, consent version, expected duration, and the three external URLs. The participant-language selector defaults to English; Japanese is used only when explicitly selected. The URL contains neither a participant code nor results, but it is reusable and exposes the named study configuration. Never treat a local TEST link as a research invitation.

Participant-link parsing is fail closed. A missing, duplicate, unknown, unsupported, outdated, non-canonical, or internally inconsistent value—including deployment/session type, current origin, protocol, task, metadata, HTTPS URL, catalog, set, or manifest mismatch—stops at an invalid-link screen instead of silently falling back to current defaults. Consent, contact, and return URLs must use HTTPS, contain no credentials or display-control characters, and are limited to 1,024 characters each; return URLs must also match an exact origin in `allowed_return_url_origins`. URL fragments are preserved. The complete participant link is limited to 4,096 characters. Older link schemas fail closed. Because schema 3 does not yet carry a verified issuer signature, the runtime permits it only for local TEST sessions and rejects production/staging participant-link execution.

Participant codes are normalized to uppercase and must contain 1–32 ASCII letters, digits, hyphens, or underscores, beginning with an ASCII letter. Use a pseudonymous study code; do not enter a name, email address, student number, health information, or other directly identifying information. The normalized code seeds a reproducible relative task order for the selected task subset. The overview screen shows the normalized code and allows correction before the battery begins.

### Local recovery and interruption semantics

Before a participant code can start a run, the browser hashes `deployment-config.json`, `deployment_policy.js`, `index.html`, `result_bundle.js`, `session_safety.js`, and `script.js`, derives `app_build_sha256`, and freezes that value together with the served `script.js` and deployment-config SHA-256 values for the run. After the code is accepted, checkpoint schema 3 stores a pseudonymous recovery copy in `localStorage` at committed boundaries and before each audio presentation. Resume is offered only when session type, deployment ID/environment/origin, frozen deployment configuration, application assets, study configuration, stimulus binding, and checkpoint structure are compatible. The resume screen does not display the stored participant code and requires the code to be re-entered before restoration. A different, older, or structurally invalid configuration is not merged.

To limit storage duplication, checkpoint trial rows omit repeated consent/contact/return URLs, participant-link configuration, and app URL; these values are restored from the validated session-level metadata when the checkpoint is resumed and remain present in exported data. Only one active checkpoint is supported per deployed application path. A foreign owner at the same or a later revision, a different session, a deletion barrier, or an overwrite attempt stops instead of silently combining data. Explicit resume performs a checked one-time ownership transfer.

Playback and preflight audio use abortable waits. Stopping, changing run state, or leaving an active presentation cancels the remaining waits and audio elements. Hiding the page during preflight invalidates the test sound; hiding it during a practice or main presentation aborts the sequence and opens a technical-interruption screen rather than accepting a response. If a browser interruption occurs after an audio presentation was checkpointed but before its response was committed, retry or resume replays that uncommitted presentation. The resulting trial marks `replayed_interrupted_presentation = 1`; session-level `interrupted_presentation_count`, `visibility_interruption_count`, and `resume_count` preserve the deviation history. These fields support review, but they do not decide exclusion. Refreshing, switching tabs, replaying, and technical-failure rules must be prespecified.

The recovery copy persists through normal completion until explicitly cleared. **Stop session** removes the checkpoint only after the browser verifies both the checkpoint removal and a non-identifying deletion-barrier timestamp. If either write or verification fails, the app does not claim deletion and stops at a recovery screen. The barrier prevents another open tab from recreating the deleted run; its minimal timestamp remains locally after the response data and participant code are removed. This operation does not delete ZIP files already downloaded or data already uploaded elsewhere. In supervised mode, starting the next participant uses the same verified deletion path after the ZIP gate and confirmation. Browser storage is not a durable archive and may be cleared by the user, browser, private-browsing policy, or device management.

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

The primary artifact is `<participant-code>_<session_run_id>_audio_discrimination_results.zip` (result-bundle schema 3). A local test instead uses the unmistakable `TEST_ONLY_` filename prefix. It contains exactly:

- `<participant-code>_<session_run_id>_audio_discrimination_trials.csv`
- `<participant-code>_<session_run_id>_audio_discrimination_wide.csv`
- `session_manifest.json`

Including the independently generated `session_run_id` in the ZIP and both CSV filenames prevents two runs with the same participant code from silently receiving the same name; the manifest member intentionally keeps the fixed name `session_manifest.json`. The manifest records pseudonymous-data classification, `automatic_upload_performed = false`, operating mode, session status and timing, study metadata, procedure and stimulus provenance, implementation versions, the frozen application-asset-set and served-`script.js` SHA-256 values, and SHA-256 digests of both CSV members. In remote mode it also states that an external portal receipt is required. The app cannot include or validate that receipt because the portal is external.

### Trial-level CSV

- Battery version: `5.3.0`; trial CSV schema version: `11`.
- One row per **committed** main-task trial. An interrupted presentation that has not received a response does not create a row; ending after a technical error exports all rows committed up to that point.
- `stimulus_step`, `stimulus_requested_step`, `step_before`, `step_after`, `reversal_level`, `mean_reversal_so_far`, and `threshold_estimate` use the published Level 0–100 scale.
- `stimulus_file_index`, `stimulus_requested_file_index`, `file_index_before`, and `file_index_after` preserve local FLAC file numbers 1–101.
- `is_reversal`, `reversal_number`, and `reversal_level` allow the threshold to be reconstructed.
- Study and run provenance includes `session_run_id`, `administration_mode` (`supervised` or `remote_manual_upload`), `session_type`, deployment ID/environment/config schema/config SHA/app origin, study/condition/site/distribution IDs, participant-facing study fields and URLs, consent/preflight markers, `configuration_source` (`researcher_ui` or `participant_link`), `participant_link_schema_version`, `participant_link_validation_status` (`not_applicable` or `passed`), `configured_initial_language`, and `participant_link_config`. The normalized link configuration contains no participant code or results.
- Session integrity fields include current and final status, status reason, session/task timestamps, resume/interruption counts, `replayed_interrupted_presentation`, `app_build_id`, the frozen `app_build_sha256`, the served `script.js` SHA-256, and `app_url`. Exported terminal runs are `completed` or `technical_failure`; an explicit stop deletes the local checkpoint instead of creating a submitted run. A technical partial export uses `session_final_status = technical_failure` even though rows committed earlier may retain their then-current `session_status`.
- Source/procedure audit columns include `battery_version`, `protocol_id`, `protocol_version`, `protocol_source_locator`, `protocol_source_audit_status`, `procedure_scope`, source-study task scope, `step_sizes`, `first_scored_reversal`, `threshold_aggregation`, timing fields, practice fields, `task_order_method`, and `ui_language`.
- Stimulus lineage columns identify the protocol binding, catalog, selected set and version, set kind and claim, parameter profile, set/manifest/task digests, transformation, generator identity, source citation, licence status, validation status, parent set, and parent source archive. The common fields include `protocol_stimulus_binding_id`, `stimulus_catalog`, `stimulus_catalog_schema_version`, `stimulus_catalog_sha256`, `stimulus_set_id`, `stimulus_set_version`, `stimulus_set_kind`, `stimulus_claim`, `stimulus_parameter_profile_id`, `stimulus_manifest`, `stimulus_manifest_sha256`, `stimulus_set_sha256`, `stimulus_source_citation`, `stimulus_source_locator`, `stimulus_parent_set_id`, `stimulus_parent_manifest`, `stimulus_parent_set_sha256`, `stimulus_parent_source_locator`, `stimulus_source_archive_sha256`, `stimulus_parent_source_archive_sha256`, `stimulus_provenance_verification`, `stimulus_validation_status`, `stimulus_audit_date`, and `stimulus_standard_file_index`.
- Generator lineage is recorded in `stimulus_generator`, `stimulus_generator_version`, `stimulus_generator_script`, `stimulus_generator_script_sha256`, `stimulus_parameters_file`, and `stimulus_parameters_sha256`. Rights metadata uses `stimulus_license` and `stimulus_license_note`. Trial rows additionally contain `stimulus_task_sha256` and `stimulus_task_transformation`.
- `stimulus_file_index` and the Level fields identify the exact file used within the set; set identity must never be inferred from a file number alone. Schema 11 uses `stimulus_error_policy = fatal_no_substitution`, so `stimulus_substituted` is retained for backward-compatible analysis but is always zero in a successfully recorded trial.
- CSV string cells beginning with optional whitespace followed by `=`, `+`, `-`, or `@` are prefixed with an apostrophe, and cells containing commas, quotes, CR, or LF are CSV-quoted. This reduces spreadsheet formula/record injection risk; analysis importers should still treat exported fields as data rather than executable formulas.
- Final task columns include `termination_reason`, `scored_reversal_count`, `reversal_levels_used`, `threshold_available`, and `target_reversals_reached`.

### Wide-format CSV

- Wide schema version: `9`.
- One participant per row, with a stable set of columns for all four tasks. Unselected tasks remain blank and have `<task>_selected = 0`.
- Common fields include participant code, study/site/distribution identity, schema and run IDs, operating mode, configuration provenance, session status/reason/timestamps, consent and preflight markers, interruption and resume counts, build/script identity, procedure source, procedure–stimulus binding, complete stimulus lineage, feedback mode, selected tasks, task order, language use, and staircase/timing/practice parameters.
- Each task prefix (`pitch_`, `formant_`, `duration_`, `risetime_`) includes whether the task belongs to the selected source study, task-level stimulus digest and transformation, task start/end timestamps, its Level and file-index threshold, physical threshold, unit, trials, reversals, scored reversal Levels, stopping reason, estimate availability, target-reversal status, median RT, practice accuracy, and stimulus-substitution count.

The supervised researcher-results page shows a readable task-by-task table and an analysis-oriented subset of the one-row wide record. Provenance hashes and machine-readable audit fields remain in the downloaded CSV and manifest but are not all repeated in the UI. No group-level z-score composites or inferential tests are calculated in the browser; those require the full sample and a prespecified analysis plan.

Before importing a returned package, run `python tools/validate_result_bundle.py <path-to-results.zip>`. The validator treats the ZIP as untrusted input and rejects unexpected or unsafe members, duplicate JSON keys, schema drift, deployment/session-type mismatches, digest failures, CSV formula-bearing cells, inconsistent run/build/status fields, invalid terminal states, and operating-mode/portal-receipt contradictions. A `VALID` result establishes internal package integrity under result-bundle schema 3; it does not authenticate the participant, invitation, external portal, or study authorization. Files marked `TEST_ONLY_` and `test_data_do_not_analyze` must never enter the research analysis dataset.

## Published Levels and physical units

Local files are one-based, while the published continuum is zero-based:

`published Level = local file index - 1`

| Task | Standard (`1.flac`, Level 0) | Comparison Levels 1–100 | Physical threshold for Level L |
|---|---:|---:|---:|
| Pitch | F0 = 330 Hz | 330.3–360 Hz | `0.3 × L` Hz F0 difference |
| Formant | F2 = 1500 Hz | 1502–1700 Hz | `2 × L` Hz F2 difference |
| Duration | 250 ms | 252.5–500 ms | `2.5 × L` ms duration difference |
| Rise time | 15 ms | 17.85–300 ms | `2.85 × L` ms rise-time difference |

For example, a pitch `threshold_estimate` of Level 10 corresponds to a 3 Hz F0 difference. No manual subtraction is required for schema version 2–11 CSV files. Older files without `schema_version` stored file indices and still require subtracting 1.

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

## Runtime audio loading

The active task still creates 101 lightweight `Audio` objects so each file index has a stable runtime mapping, but every object uses `preload = none`. Entering a task warms only the standard, starting, and practice comparison files; each adaptive file is requested when needed, and the next required step is warmed after a committed response. The browser therefore does not preload all 101 stimulus files for every selected task. Cache behavior and duplicate request coalescing remain browser-dependent, so validate the supported browser/network matrix before release.

An audio load, playback rejection, media error, or playback timeout is a fatal presentation error: response controls remain closed and no row is committed. The participant can retry the same uncommitted presentation; retries/resume after an interrupted presentation are counted and marked as deviations. Ending instead records `technical_failure` and makes the partial ZIP available. No threshold should be inferred for an unfinished task unless the prespecified analysis rule explicitly permits it.

## CI and release control

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs JavaScript syntax checks, UI/result-bundle contract tests, ZIP/checksum tests, frozen-parent and runtime-registry verification, all three acoustic profiles, and reconstructed-metadata verification with the pinned Praat 6.4.19 binary. A passing workflow verifies the checked-in contracts and artifacts; it does not replace participant UAT, ethics approval, browser/device testing, portal testing, or deployment approval.

Use [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) and [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) before every study release. In addition to the CI result, archive the exact commit/tag, frozen deployment configuration and digest, dedicated production origins, application-asset-set and served-script SHA-256 values, approved protocol/consent versions, supported browser/device evidence, selected operating mode, known limitations, and rollback target. If a future signed-link release enables remote collection, also archive the issuer record, exact distributed participant link, and external return-portal evidence. A workflow in which merging to the source branch immediately changes production does not satisfy the required deployment-approval separation. [NOTICE.md](NOTICE.md) records the present artifact/right status. Code, source audio, and derivative-stimulus rights must be resolved separately; no audio licence is inferred from repository presence or successful validation.

## Required files and placement

Keep the catalog, frozen parent, and reconstructed sets in their recorded locations alongside the integrated application:

```
audio_discrimination/
  ├ .github/workflows/ci.yml
  ├ index.html
  ├ script.js
  ├ result_bundle.js
  ├ session_safety.js
  ├ RELEASE_CHECKLIST.md
  ├ NOTICE.md
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

The top-level task folders are the frozen parent distribution; the bound set under `stimulus_sets/` supplies runtime audio. Do not rename, move, or edit individual files after manifests are written. In-progress and completed sessions have a browser-local recovery checkpoint, but that checkpoint is neither an archive nor transmission. Retain and verify the ZIP package before clearing the session; in remote mode, also complete and reconcile the external portal receipt.

## References

Kachlicka, M., Saito, K., & Tierney, A. (2019). Successful second language learning is tied to robust domain-general auditory processing and stable neural representation of sound. *Brain and Language, 192*, 15–24. https://doi.org/10.1016/j.bandl.2019.02.004

Levitt, H. (1971). Transformed up-down methods in psychoacoustics. *The Journal of the Acoustical Society of America, 49*(2B), 467–477. https://doi.org/10.1121/1.1912375

Saito, K., & Tierney, A. (2024). Domain-general auditory processing as a conceptual and measurement framework for second language speech learning aptitude: A test-retest reliability study. *Studies in Second Language Acquisition, 46*, 1206–1230. Published online in 2022. https://doi.org/10.1017/S027226312200047X

Sun, H., Saito, K., & Tierney, A. (2021). A longitudinal investigation of explicit and implicit auditory processing in L2 segmental and suprasegmental acquisition. *Studies in Second Language Acquisition, 43*(3), 551–573. https://doi.org/10.1017/S0272263120000649

Woods, K. J. P., Siegel, M. H., Traer, J., & McDermott, J. H. (2017). Headphone screening to facilitate web-based auditory experiments. *Attention, Perception, & Psychophysics, 79*, 2064–2072. https://doi.org/10.3758/s13414-017-1361-2
