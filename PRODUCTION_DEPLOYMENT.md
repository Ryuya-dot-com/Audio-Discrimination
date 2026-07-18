# Production deployment and result-return contract

This document defines the minimum technical boundary for collecting research
data. GitHub Pages remains a preview. Passing repository CI or building an
artifact does not approve a study release.

## Required separation

Use separate HTTPS origins and separate access policies:

1. **Researcher administration** — protected by institutional SSO and MFA.
   Researchers configure a study and obtain participant links here. This origin
   must not be publicly accessible merely because someone knows its URL.
2. **Participant runtime** — public only to the extent required by recruitment.
   It serves an immutable, approved release artifact. Its bare URL does not
   expose an enabled researcher setup screen.
3. **Result-return portal** — authenticated independently from the participant
   runtime. It accepts packages into private quarantine, validates them, and
   issues a server-side receipt before they become accepted research data.

The deployment configuration is public data and must contain no credential,
private key, upload code, participant identifier, or result. A release binds the
exact researcher origin, participant origin, participant base URL, permitted
return-portal origins, environment, and deployment ID into the application
asset-set hash.

## Participant-link authenticity

Canonical URL parsing detects malformed or internally inconsistent links, but
it does not establish who issued a link. Before remote production use, the
participant configuration must be authorized by an authenticated issuer and
cryptographically verified by the participant runtime. The signed payload must
bind at least:

- issuer and audience;
- issue and expiry times;
- a high-entropy invitation or distribution identifier;
- study, condition, site, and distribution IDs;
- protocol, tasks, feedback, language, and all stimulus/build versions;
- consent, contact, and return-portal URLs.

Do not place a signing secret in browser JavaScript or the public deployment
configuration. Until an approved issuer is connected, remote links remain test
artifacts and must not be distributed for data collection. The current runtime
enforces this boundary: it enables link issuance and participant-link execution
only for visibly labelled loopback TEST sessions. Production and staging may run
supervised sessions on the configured researcher origin, but their participant
origins remain blocked.

## Submission state machine

The return service must implement explicit, auditable states:

```text
issued upload authorization
  -> uploading
  -> quarantined
  -> accepted | duplicate_accepted | conflict_quarantined | rejected
  -> retained according to policy | deletion_pending -> deleted
```

An HTTP upload success is not an accepted result. Acceptance requires the
strict bundle validator, approved study/distribution, approved application and
stimulus hashes, and an unused or idempotently reused upload authorization.

## Duplicate and retry rules

Use `study_id + session_run_id` as the run identity and the two CSV SHA-256
digests as the stable content identity.

- Same run identity and same trial/wide digests: idempotent retry. Return the
  original receipt and do not create a second accepted copy.
- Same run identity and different trial or wide digest: never overwrite. Move
  the submission to conflict quarantine for named researcher review.
- Same participant code and a different run ID: retain as a separate run. The
  approved analysis plan decides whether it is a retest, replacement, or
  technical partial.
- Network retry after an unknown client outcome: converge on the same receipt.

ZIP bytes alone are not the duplicate key because regenerating a package may
change its generation timestamp while retaining the same committed CSV data.

## Receipt ledger

For every upload attempt, retain only the fields required for audit and
reconciliation:

- random receipt ID;
- study/distribution and session-run IDs;
- ZIP, trial CSV, and wide CSV SHA-256 digests;
- application build SHA-256;
- validator version and validation outcome;
- first-received and last-attempt timestamps;
- attempt count, final state, and retention/deletion deadline.

Do not duplicate the participant code, original filename, consent URL, or raw
CSV content into application logs. Upload codes must be high entropy, expire,
have bounded attempts, and be stored as one-way hashes. Object storage must be
private; only the validator/portal service may move objects from quarantine to
the accepted area.

A receipt must bind the receipt ID, run ID, accepted content digests, validation
outcome, and server timestamp. The researcher—not the static participant app—
reconciles that receipt with the result ledger. Browser-local clearing is
permitted only after the approved procedure has established receipt issuance.

## HTTP and cache requirements

Production responses must set headers at the server or CDN, including:

- a restrictive Content Security Policy with `frame-ancestors 'none'`;
- `Strict-Transport-Security` after HTTPS/domain readiness is confirmed;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer`;
- a minimal `Permissions-Policy`;
- an approved cross-origin opener/resource policy where compatible.

Serve versioned JavaScript, deployment configuration, and audio immutably. The
entry HTML must not be cached across releases in a way that can combine it with
assets from another release. Staging and production use the same asset paths;
promotion deploys the already-reviewed artifact rather than rebuilding it.

## Release evidence

Archive the following outside participant-facing hosting:

- source commit and release tag;
- CI and deterministic release-artifact records;
- staging and production deployment IDs/origins;
- exact distributed participant links and their issuer records;
- application asset hashes and approved stimulus hashes;
- UAT/browser/device evidence;
- ethics/protocol/consent versions and operating mode;
- portal end-to-end, duplicate, conflict, receipt, and deletion evidence;
- named approvers, promotion time, rollback target, and rollback rehearsal.

Do not begin recruitment until every applicable item in
`RELEASE_CHECKLIST.md` is satisfied and the unresolved rights status in
`NOTICE.md` has been formally resolved.
