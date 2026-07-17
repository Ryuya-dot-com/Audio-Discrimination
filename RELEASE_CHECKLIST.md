# Release checklist

A release is ready only when every applicable item below is checked and the
approved study protocol matches the deployed build.

## Build and deployment identity

- [ ] CI passes on the exact release commit; no check is waived without a recorded rationale.
- [ ] The candidate is tested on staging before production, using the same hosting and asset paths.
- [ ] The implementation contract is `battery 5.2.0`, `trial schema 10`, `wide schema 8`, `checkpoint schema 2`, `result-bundle schema 2`; participant-link, protocol, and stimulus-set versions are also updated when their contracts change.
- [ ] The deployed app calculates the same non-empty asset-set SHA-256 for `index.html`, `result_bundle.js`, `session_safety.js`, and `script.js` and the same served-`script.js` SHA-256 on two clean loads; both are recorded in exported data and match the release record.
- [ ] Production uses a dedicated HTTPS origin. Shared `*.github.io`, localhost, and `file://` are preview/test environments only and are confirmed to block research-session entry.
- [ ] Production deployment is approved separately from merging. A source-branch push cannot update production without a distinct approval; rollback to the previous tagged build has been rehearsed.
- [ ] The release is tagged, the dedicated production URL is archived, and the exact fully generated participant link—not only the base URL—is reviewed, UAT-tested, and archived for every distribution ID.

## Study mode, consent, and result return

- [ ] Exactly one operating mode is declared: **supervised** (same browser/device, researcher exports locally) or **remote manual return** (participant saves the ZIP and uses an approved external authenticated portal).
- [ ] For remote use, the pre-consent information states the complete ZIP → portal upload → receipt retention → browser-clear sequence, and support instructions cover failure at every step.
- [ ] End-to-end submission, duplicate handling, failure recovery, researcher receipt reconciliation, and the participant's explicit post-receipt clear action are tested. A participant launch link alone is not a return channel, and the app's receipt confirmation is a participant assertion rather than server verification.
- [ ] Ethics approval, study identity, researcher contact, estimated duration, eligibility, withdrawal procedure, data handling, and consent text/version are shown or linked before participation.
- [ ] Participant-facing completion text states whether data were sent, saved locally, or still require action, and gives a receipt/reference when applicable.
- [ ] The study team accepts or mitigates the static-site limitations: links are reusable and unsigned; participant/researcher identity is not authenticated; another otherwise valid configuration cannot be detected as a forgery; task/configuration IDs are not blinded; and no automatic upload occurs.

## Persistence, recovery, and data integrity

- [ ] Trial state is persisted after each committed response and before playback; repeated row metadata is normalized in the checkpoint and correctly reconstructed in trial/wide exports after resume.
- [ ] Resume is rejected when the frozen application-asset-set SHA, served-script SHA, study configuration, stimulus binding, or checkpoint structure differs.
- [ ] Resume, restart, withdraw, equal-revision foreign-owner conflicts, visibility interruption, audio abort/retry, and unrecoverable-error paths cannot silently duplicate trials, mix participants, continue background playback, or overwrite an unexported session.
- [ ] Closing, reloading, clearing data, and starting the next participant warn about unsent or unexported results.
- [ ] Stop, discard, next-participant, and remote post-receipt clearing verify checkpoint removal and the deletion barrier. A forced deletion-write failure never displays a deletion-success screen, and another open tab cannot recreate the deleted run.
- [ ] Release documentation states that the retained deletion-barrier timestamp is non-identifying and that clearing browser data may remove it; it also states that browser clearing cannot delete a ZIP already saved in Downloads or a copy already uploaded.
- [ ] Trial CSV, wide CSV, settings/provenance, completion status, timestamps, and session run ID agree and pass the analysis import/codebook checks.
- [ ] CSV tests cover string values beginning with whitespace plus `=`, `+`, `-`, or `@`, and embedded comma, quote, CR, and LF; spreadsheet and analysis importers treat those values as data.

## Participant UAT

- [ ] A researcher and a person unfamiliar with the project complete the full flow from invitation through confirmed result return without coaching.
- [ ] English-default and Japanese flows, language switching, valid/invalid participant links, code correction, task order, practice, breaks, completion, and researcher handoff are tested.
- [ ] Headphone/audio setup, playback permission, missing/slow audio, retry, low bandwidth, interruption, and supported desktop/mobile browsers are tested.
- [ ] Consent, contact, and return URLs are HTTPS without credentials, no more than 1,024 characters each, and preserve required fragments; generated participant links remain at or below 4,096 characters and reject over-limit values.
- [ ] Keyboard-only use, visible focus, screen-reader announcements, 200% zoom, reduced motion, contrast, and touch targets are checked on representative devices.

## Rights, privacy, and release record

- [ ] `NOTICE` separately states the rights and redistribution status of code, frozen source audio, and each derivative stimulus set; unresolved audio rights block public distribution.
- [ ] Public artifacts contain no source PDFs, participant data, credentials, local paths, or directly identifying information.
- [ ] The approved release record preserves the commit SHA, CI run, dedicated production origin, exact distributed links, asset-set/script hashes, UAT evidence, protocol/consent versions, browser/device matrix, known limitations, approvers, date, and rollback target.
