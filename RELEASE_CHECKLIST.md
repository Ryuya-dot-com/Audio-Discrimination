# Release checklist

A release is ready only when every applicable item below is checked and the
approved study protocol matches the deployed build.

## Build and deployment identity

- [ ] CI passes on the exact release commit; no check is waived without a recorded rationale.
- [ ] The candidate is tested on staging before production, using the same hosting and asset paths.
- [ ] The implementation contract is `battery 5.4.0`, `trial schema 11`, `wide schema 9`, `checkpoint schema 3`, `participant-link schema 3`, `result-bundle schema 3`; protocol and stimulus-set versions are also updated when their contracts change.
- [ ] The exact non-secret `deployment-config.json` is approved and archived. Its deployment ID/environment, researcher and participant origins, public participant base URL, researcher-UI setting, return-origin allowlist, and local-test setting match the release record; it contains no credentials, tokens, participant identifiers, or secrets.
- [ ] The deployed app calculates the same non-empty asset-set SHA-256 for `deployment-config.json`, `deployment_policy.js`, `index.html`, `result_bundle.js`, `session_safety.js`, and `script.js` and the same served-`script.js` and deployment-config SHA-256 values on two clean loads; all are recorded in exported data and match the release record.
- [ ] Production/staging research sessions run only on the exact HTTPS origins frozen in the deployment configuration. Arbitrary HTTPS copies and `file://` are confirmed to block research-session entry; loopback creates only visibly labelled `test` sessions.
- [ ] A loopback UAT export uses the `TEST_ONLY_` filename prefix and records `session_type=test` plus `test_data_do_not_analyze` consistently in checkpoint, both CSV representations, and manifest. The research-ingestion workflow rejects or segregates it.
- [ ] The production participant origin does not expose researcher setup unless explicitly required: `researcher_ui_enabled` and the exact researcher origin are verified independently from participant-link execution.
- [ ] Return-URL policy is reviewed: use exact origins in `allowed_return_url_origins` when possible; if the explicit `"*"` wildcard is retained, document that any HTTPS return origin entered in the public researcher UI will be accepted. Credentials and HTTP remain rejected.
- [ ] Production deployment is approved separately from merging. A source-branch push cannot update production without a distinct approval; rollback to the previous tagged build has been rehearsed.
- [ ] The release is tagged and the production URL is archived. For remote collection, the exact fully generated participant link—not only the base URL—is reviewed, UAT-tested, and archived for every distribution ID.

## Study mode, consent, and result return

- [ ] Exactly one operating mode is declared: **supervised** (same browser/device, researcher exports locally) or **remote manual return** (participant saves the ZIP and uses an approved external authenticated portal).
- [ ] For remote use, the pre-consent information states the complete ZIP → portal upload → receipt retention → browser-clear sequence, and support instructions cover failure at every step.
- [ ] End-to-end submission, duplicate handling, failure recovery, researcher receipt reconciliation, and the participant's explicit post-receipt clear action are tested. A participant launch link alone is not a return channel, and the app's receipt confirmation is a participant assertion rather than server verification.
- [ ] The release record states that remote links are unsigned, reusable, contain no expiry, do not authenticate either party, and expose the named study configuration. The exact distributed URL and independent study-contact instructions are archived for each distribution.
- [ ] If the researcher configuration origin is public or shared with the participant origin, the study accepts that anyone can construct a link. Studies that require authenticated configuration use a separate protected researcher origin.
- [ ] Ethics approval, study identity, researcher contact, estimated duration, eligibility, withdrawal procedure, data handling, and consent text/version are shown or linked before participation.
- [ ] Participant-facing completion text states whether data were sent, saved locally, or still require action, and gives a receipt/reference when applicable.
- [ ] The current release is verified to accept only structurally canonical unsigned links matching the frozen deployment/build/stimulus configuration. A future signed-link implementation receives a new schema/security review; authenticated researcher access, participant identity policy, blinding, and result return are assessed separately.

## Persistence, recovery, and data integrity

- [ ] Trial state is persisted after each committed response and before playback; repeated row metadata is normalized in the checkpoint and correctly reconstructed in trial/wide exports after resume.
- [ ] The browser-local checkpoint retention window and expired-record cleanup are fixed in the approved data-management procedure; the resume prompt hides the stored participant code and requires code re-entry.
- [ ] Resume is rejected when session type, deployment ID/environment/origin/config SHA, frozen application-asset-set SHA, served-script SHA, study configuration, stimulus binding, or checkpoint structure differs.
- [ ] Resume, restart, withdraw, equal-revision foreign-owner conflicts, visibility interruption, audio abort/retry, and unrecoverable-error paths cannot silently duplicate trials, mix participants, continue background playback, or overwrite an unexported session.
- [ ] Closing, reloading, clearing data, and starting the next participant warn about unsent or unexported results.
- [ ] Stop, discard, next-participant, and remote post-receipt clearing verify checkpoint removal and the deletion barrier. A forced deletion-write failure never displays a deletion-success screen, and another open tab cannot recreate the deleted run.
- [ ] Release documentation states that the retained deletion-barrier timestamp is non-identifying and that clearing browser data may remove it; it also states that browser clearing cannot delete a ZIP already saved in Downloads or a copy already uploaded.
- [ ] Trial CSV, wide CSV, settings/provenance, completion status, timestamps, and session run ID agree and pass the analysis import/codebook checks.
- [ ] CSV tests cover string values beginning with whitespace plus `=`, `+`, `-`, or `@`, and embedded comma, quote, CR, and LF; spreadsheet and analysis importers treat those values as data.

## Participant UAT

- [ ] A researcher and a person unfamiliar with the project complete the full flow from invitation through confirmed result return without coaching.
- [ ] The researcher completes all three setup steps in order; Back preserves values, invalid metadata returns focus to the exact field with a local explanation, and changing an encoded setting invalidates the previously generated link.
- [ ] The participant-language selector initially follows the researcher UI language, remains independent after manual selection, and the copied invitation uses that selected language with the exact generated link, assigned pseudonymous code, and approved return portal. Generated codes are recorded in the approved roster and checked for duplicates.
- [ ] English-default and Japanese flows, language switching, valid/invalid participant links, code correction, task order, practice, breaks, completion, and researcher handoff are tested.
- [ ] Headphone/audio setup, playback permission, missing/slow audio, retry, low bandwidth, interruption, and supported desktop/mobile browsers are tested.
- [ ] Consent, contact, and return URLs are HTTPS without credentials, no more than 1,024 characters each, and preserve required fragments; generated participant links remain at or below 4,096 characters and reject over-limit values.
- [ ] Keyboard-only use, visible focus, screen-reader announcements, 200% zoom, reduced motion, contrast, and touch targets are checked on representative devices.

## Rights, privacy, and release record

- [ ] `NOTICE` separately states the rights and redistribution status of code, frozen source audio, and each derivative stimulus set; unresolved audio rights block public distribution.
- [ ] Public artifacts contain no source PDFs, participant data, credentials, local paths, or directly identifying information.
- [ ] The approved release record preserves the commit SHA, CI run, dedicated production origin, exact distributed links, asset-set/script hashes, UAT evidence, protocol/consent versions, browser/device matrix, known limitations, approvers, date, and rollback target.
