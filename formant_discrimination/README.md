# Listening Task 2 (Formant Discrimination) — Single Task

This is the stand-alone formant discrimination task. The participant UI shows the dummy label “Listening Task 2”; this README documents the actual task and parameters for researchers.

The FLAC files are byte-identical to the official OSF `OFFLINE AP TESTS.zip` distribution, but that distribution's approximately 50-ms ramp does not match the 15-ms ramps reported in the cited articles. See the root `PROCEDURE_AUDIT.md`; do not edit these files in place.

## Methodological basis

The task is adapted from Kachlicka, Saito, and Tierney (2019) and uses a transformed up-down staircase derived from Levitt (1971). The 70-trial/eight-reversal stopping rule also appears in Kachlicka et al.; however, Kachlicka et al. averaged reversals from the second onward. This implementation uses the mean from the third reversal onward, following Sun, Saito, and Tierney (2021).

## Flow

- Practice: 5 trials using stimuli 1 and 100, with correctness feedback.
- After practice: start the main run via Space or the “Start main run” button (practice button disabled).
- Main run: up to 70 trials or 8 reversals; no feedback and no progress indicator.
- Threshold: mean of reversal Levels from the third reversal onward, shown as both a published Level and an F2 difference; CSV downloads automatically.

## Required file layout

```
formant_discrimination/
  ├ Stimuli/1.flac ... Stimuli/101.flac
  ├ index.html
  └ formant_discrimination.js
```

## How to run

1. Open `index.html` in a browser.
2. Enter participant ID, go to instructions, then start practice.
3. After 5 practice trials, press Space or the button to start the main run.
4. A CSV downloads automatically when finished (filename: `<ID>_formant_discrimination.csv`).

## CSV columns

- `stimulus_step`, `step_before`, `step_after`, `mean_reversal_so_far`, and `threshold_estimate` use the published Level 0–100 scale.
- `stimulus_file_index`, `file_index_before`, and `file_index_after` preserve the local FLAC file numbers (1–101).
- `threshold_physical_value` is the F2 difference in the unit given by `threshold_unit`; `schema_version` is `2`.
- Other columns include `subject_id`, `trial`, `odd_position`, `correct_answer`, `response`, `correct`, `rt_ms`, `num_reversals_after`, and `step_size_used`.

## Level mapping and parameters

- Published `Level = local file index - 1`; therefore, the starting file 51 is Level 50.
- `1.flac` (Level 0) has F2 = 1500 Hz; Levels 1–100 span 1502–1700 Hz.
- Physical threshold: `2 × threshold_estimate` Hz F2 difference.
- Main run: maximum 70 trials / stop at 8 reversals.
- Threshold: mean of reversal Levels from the third reversal onward.
- Practice: 5 trials (stimuli 1 and 100), followed by manual start of the main run (Space/button).
- ISI: 500 ms / post-sequence: 500 ms / post-response: 1000 ms.
- Step sizes: [10, 5, 2, 1, 1, 1, 1, 1] (staircase).

## References

Kachlicka, M., Saito, K., & Tierney, A. (2019). Successful second language learning is tied to robust domain-general auditory processing and stable neural representation of sound. *Brain and Language, 192*, 15–24. https://doi.org/10.1016/j.bandl.2019.02.004

Levitt, H. (1971). Transformed up-down methods in psychoacoustics. *The Journal of the Acoustical Society of America, 49*(2B), 467–477. https://doi.org/10.1121/1.1912375

Sun, H., Saito, K., & Tierney, A. (2021). A longitudinal investigation of explicit and implicit auditory processing in L2 segmental and suprasegmental acquisition. *Studies in Second Language Acquisition, 43*(3), 551–573. https://doi.org/10.1017/S0272263120000649
