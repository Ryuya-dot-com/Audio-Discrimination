#!/usr/bin/env python3
"""Regression tests for the strict result-bundle ingestion validator."""

from __future__ import annotations

import copy
import csv
import hashlib
import io
import json
import tempfile
import unittest
import warnings
import zipfile
from pathlib import Path
from typing import Any, Callable

if __package__:
    from .validate_result_bundle import BundleValidationError, validate_bundle
else:
    from validate_result_bundle import BundleValidationError, validate_bundle


SUBJECT_ID = "P001"
SESSION_RUN_ID = "123e4567-e89b-12d3-a456-426614174000"
INDEX_SHA256 = "c" * 64
RESULT_BUNDLE_SHA256 = "d" * 64
SESSION_SAFETY_SHA256 = "e" * 64
APP_SCRIPT_SHA256 = "b" * 64
APP_BUILD_SHA256 = hashlib.sha256(
    (
        f"index.html:{INDEX_SHA256}\n"
        f"result_bundle.js:{RESULT_BUNDLE_SHA256}\n"
        f"session_safety.js:{SESSION_SAFETY_SHA256}\n"
        f"script.js:{APP_SCRIPT_SHA256}"
    ).encode("utf-8")
).hexdigest()
TRIAL_NAME = f"{SUBJECT_ID}_{SESSION_RUN_ID}_audio_discrimination_trials.csv"
WIDE_NAME = f"{SUBJECT_ID}_{SESSION_RUN_ID}_audio_discrimination_wide.csv"

TRIAL_HEADER = (
    "subject_id",
    "session_run_id",
    "session_status",
    "session_final_status",
    "status_reason",
    "app_build_sha256",
    "app_script_sha256",
    "schema_version",
)
WIDE_HEADER = (
    "subject_id",
    "session_run_id",
    "session_status",
    "status_reason",
    "app_build_sha256",
    "app_script_sha256",
    "wide_schema_version",
)


def csv_bytes(header: tuple[str, ...], rows: list[tuple[str, ...]]) -> bytes:
    destination = io.StringIO(newline="")
    writer = csv.writer(destination, lineterminator="\n")
    writer.writerow(header)
    writer.writerows(rows)
    return ("\ufeff" + destination.getvalue()).encode("utf-8")


def default_contents(*, trial_rows: bool = True) -> dict[str, bytes]:
    trials = []
    if trial_rows:
        trials.append(
            (
                SUBJECT_ID,
                SESSION_RUN_ID,
                "in_progress",
                "completed",
                "",
                APP_BUILD_SHA256,
                APP_SCRIPT_SHA256,
                "10",
            )
        )
    return {
        TRIAL_NAME: csv_bytes(TRIAL_HEADER, trials),
        WIDE_NAME: csv_bytes(
            WIDE_HEADER,
            [
                (
                    SUBJECT_ID,
                    SESSION_RUN_ID,
                    "completed",
                    "",
                    APP_BUILD_SHA256,
                    APP_SCRIPT_SHA256,
                    "8",
                )
            ],
        ),
    }


def default_manifest(contents: dict[str, bytes]) -> dict[str, Any]:
    return {
        "result_bundle_schema_version": 2,
        "generated_at_utc": "2026-07-18T00:00:00.000Z",
        "data_classification": "pseudonymous_research_data",
        "automatic_upload_performed": False,
        "administration_mode": "remote_manual_upload",
        "result_return_requires_external_portal_receipt": True,
        "session": {
            "subject_id": SUBJECT_ID,
            "session_run_id": SESSION_RUN_ID,
            "status": "completed",
            "status_reason": "",
            "started_at_utc": "2026-07-18T00:00:00.000Z",
            "ended_at_utc": "2026-07-18T00:10:00.000Z",
            "completed_at_utc": "2026-07-18T00:10:00.000Z",
            "resume_count": 0,
            "interrupted_presentation_count": 0,
            "visibility_interruption_count": 0,
            "consent_confirmed_at_utc": "2026-07-18T00:00:05.000Z",
            "preflight_completed_at_utc": "2026-07-18T00:00:30.000Z",
            "preflight_audio_passed": True,
        },
        "study": {
            "studyId": "STUDY1",
            "conditionId": "CONTROL",
            "siteId": "TOKYO",
            "distributionId": "WAVE1",
        },
        "implementation": {
            "batteryVersion": "5.2.0",
            "trialSchemaVersion": 10,
            "wideSchemaVersion": 8,
            "checkpointSchemaVersion": 2,
            "resultBundleSchemaVersion": 2,
            "appBuildId": "audio-discrimination-5.2.0",
            "app_build_sha256": APP_BUILD_SHA256,
            "app_script_sha256": APP_SCRIPT_SHA256,
            "served_asset_sha256": {
                "index.html": INDEX_SHA256,
                "result_bundle.js": RESULT_BUNDLE_SHA256,
                "session_safety.js": SESSION_SAFETY_SHA256,
                "script.js": APP_SCRIPT_SHA256,
            },
            "app_url": "https://example.test/Audio-Discrimination/",
        },
        "procedure": {"protocol_id": "kachlicka2019"},
        "provenance": {"stimulus_set_id": "kachlicka2019-reconstruction-v1"},
        "files": [
            {
                "name": TRIAL_NAME,
                "media_type": "text/csv",
                "sha256": hashlib.sha256(contents[TRIAL_NAME]).hexdigest(),
            },
            {
                "name": WIDE_NAME,
                "media_type": "text/csv",
                "sha256": hashlib.sha256(contents[WIDE_NAME]).hexdigest(),
            },
        ],
    }


def refresh_digests(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
    for record in manifest["files"]:
        if record["name"] in contents:
            record["sha256"] = hashlib.sha256(contents[record["name"]]).hexdigest()


def write_bundle(
    path: Path,
    manifest: dict[str, Any],
    contents: dict[str, bytes],
    *,
    extra: dict[str, bytes] | None = None,
) -> None:
    manifest_bytes = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_STORED) as archive:
        for name, content in contents.items():
            archive.writestr(name, content)
        archive.writestr("session_manifest.json", manifest_bytes)
        for name, content in (extra or {}).items():
            archive.writestr(name, content)


class ResultBundleValidatorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.path = Path(self.temporary_directory.name) / "fixture_results.zip"

    def make_bundle(
        self,
        mutate: Callable[[dict[str, Any], dict[str, bytes]], None] | None = None,
        *,
        trial_rows: bool = True,
        extra: dict[str, bytes] | None = None,
    ) -> tuple[dict[str, Any], dict[str, bytes]]:
        contents = default_contents(trial_rows=trial_rows)
        manifest = default_manifest(contents)
        if mutate:
            mutate(manifest, contents)
        write_bundle(self.path, manifest, contents, extra=extra)
        return manifest, contents

    def assert_invalid(self, expected_message: str) -> None:
        with self.assertRaisesRegex(BundleValidationError, expected_message):
            validate_bundle(self.path)

    def test_accepts_valid_bundle(self) -> None:
        self.make_bundle()
        report = validate_bundle(self.path)
        self.assertEqual(report.subject_id, SUBJECT_ID)
        self.assertEqual(report.session_run_id, SESSION_RUN_ID)
        self.assertEqual(report.status, "completed")
        self.assertEqual(report.trial_rows, 1)
        self.assertEqual(report.wide_rows, 1)

    def test_accepts_supervised_bundle_without_portal_receipt(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["administration_mode"] = "supervised"
            manifest["result_return_requires_external_portal_receipt"] = False

        self.make_bundle(mutate)
        report = validate_bundle(self.path)
        self.assertEqual(report.status, "completed")

    def test_accepts_technical_failure_before_any_main_trial(self) -> None:
        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            manifest["session"]["status"] = "technical_failure"
            manifest["session"]["status_reason"] = "AUDIO_PLAYBACK_FAILED"
            contents[WIDE_NAME] = csv_bytes(
                WIDE_HEADER,
                [
                    (
                        SUBJECT_ID,
                        SESSION_RUN_ID,
                        "technical_failure",
                        "AUDIO_PLAYBACK_FAILED",
                        APP_BUILD_SHA256,
                        APP_SCRIPT_SHA256,
                        "8",
                    )
                ],
            )
            refresh_digests(manifest, contents)

        self.make_bundle(mutate, trial_rows=False)
        report = validate_bundle(self.path)
        self.assertEqual(report.status, "technical_failure")
        self.assertEqual(report.trial_rows, 0)

    def test_rejects_unsupported_session_status(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["session"]["status"] = "in_progress"

        self.make_bundle(mutate)
        self.assert_invalid("status must be completed or technical_failure")

    def test_rejects_completed_bundle_without_trial_rows(self) -> None:
        self.make_bundle(trial_rows=False)
        self.assert_invalid("completed bundles require at least one trial CSV data row")

    def test_rejects_technical_failure_without_reason(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["session"]["status"] = "technical_failure"
            manifest["session"]["status_reason"] = " "

        self.make_bundle(mutate)
        self.assert_invalid("technical_failure bundles require a non-empty")

    def test_rejects_completed_bundle_without_end_timestamps(self) -> None:
        for timestamp_name in ("completed_at_utc", "ended_at_utc"):
            with self.subTest(timestamp=timestamp_name):
                def mutate(
                    manifest: dict[str, Any],
                    _contents: dict[str, bytes],
                    field: str = timestamp_name,
                ) -> None:
                    manifest["session"][field] = ""

                self.make_bundle(mutate)
                self.assert_invalid(f"non-empty manifest.session.{timestamp_name}")

    def test_rejects_unknown_administration_mode(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["administration_mode"] = "automatic_upload"

        self.make_bundle(mutate)
        self.assert_invalid("administration_mode must be supervised or remote_manual_upload")

    def test_rejects_remote_bundle_without_portal_receipt_requirement(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["result_return_requires_external_portal_receipt"] = False

        self.make_bundle(mutate)
        self.assert_invalid("must be true only for remote_manual_upload")

    def test_rejects_supervised_bundle_with_portal_receipt_requirement(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["administration_mode"] = "supervised"

        self.make_bundle(mutate)
        self.assert_invalid("must be true only for remote_manual_upload")

    def test_rejects_extra_member(self) -> None:
        self.make_bundle(extra={"notes.txt": b"unexpected"})
        self.assert_invalid("exactly 3 members")

    def test_rejects_path_traversal_member(self) -> None:
        contents = default_contents()
        manifest = default_manifest(contents)
        manifest_bytes = (json.dumps(manifest) + "\n").encode("utf-8")
        with zipfile.ZipFile(self.path, "w", compression=zipfile.ZIP_STORED) as archive:
            archive.writestr(TRIAL_NAME, contents[TRIAL_NAME])
            archive.writestr("../escape.csv", contents[WIDE_NAME])
            archive.writestr("session_manifest.json", manifest_bytes)
        self.assert_invalid("unsafe or nested ZIP member name")

    def test_rejects_duplicate_member_name(self) -> None:
        contents = default_contents()
        manifest = default_manifest(contents)
        manifest_bytes = (json.dumps(manifest) + "\n").encode("utf-8")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(self.path, "w", compression=zipfile.ZIP_STORED) as archive:
                archive.writestr(TRIAL_NAME, contents[TRIAL_NAME])
                archive.writestr(TRIAL_NAME, contents[TRIAL_NAME])
                archive.writestr("session_manifest.json", manifest_bytes)
        self.assert_invalid("duplicate member names")

    def test_rejects_manifest_digest_mismatch(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["files"][0]["sha256"] = "0" * 64

        self.make_bundle(mutate)
        self.assert_invalid("SHA-256 mismatch")

    def test_rejects_result_bundle_schema_mismatch(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            manifest["result_bundle_schema_version"] = 3

        self.make_bundle(mutate)
        self.assert_invalid("unsupported result_bundle_schema_version")

    def test_rejects_trial_schema_mismatch(self) -> None:
        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            contents[TRIAL_NAME] = csv_bytes(
                TRIAL_HEADER,
                [
                    (
                        SUBJECT_ID,
                        SESSION_RUN_ID,
                        "in_progress",
                        "completed",
                        "",
                        APP_BUILD_SHA256,
                        APP_SCRIPT_SHA256,
                        "9",
                    )
                ],
            )
            refresh_digests(manifest, contents)

        self.make_bundle(mutate)
        self.assert_invalid("schema_version does not match")

    def test_rejects_wide_schema_mismatch(self) -> None:
        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            contents[WIDE_NAME] = csv_bytes(
                WIDE_HEADER,
                [
                    (
                        SUBJECT_ID,
                        SESSION_RUN_ID,
                        "completed",
                        "",
                        APP_BUILD_SHA256,
                        APP_SCRIPT_SHA256,
                        "7",
                    )
                ],
            )
            refresh_digests(manifest, contents)

        self.make_bundle(mutate)
        self.assert_invalid("wide_schema_version does not match")

    def test_rejects_cross_file_status_mismatch(self) -> None:
        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            contents[WIDE_NAME] = csv_bytes(
                WIDE_HEADER,
                [
                    (
                        SUBJECT_ID,
                        SESSION_RUN_ID,
                        "technical_failure",
                        "",
                        APP_BUILD_SHA256,
                        APP_SCRIPT_SHA256,
                        "8",
                    )
                ],
            )
            refresh_digests(manifest, contents)

        self.make_bundle(mutate)
        self.assert_invalid("session_status does not match")

    def test_rejects_cross_file_build_hash_mismatch(self) -> None:
        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            contents[TRIAL_NAME] = csv_bytes(
                TRIAL_HEADER,
                [
                    (
                        SUBJECT_ID,
                        SESSION_RUN_ID,
                        "in_progress",
                        "completed",
                        "",
                        "e" * 64,
                        APP_SCRIPT_SHA256,
                        "10",
                    )
                ],
            )
            refresh_digests(manifest, contents)

        self.make_bundle(mutate)
        self.assert_invalid("app_build_sha256 does not match")

    def test_rejects_missing_session_safety_build_asset(self) -> None:
        def mutate(manifest: dict[str, Any], _contents: dict[str, bytes]) -> None:
            del manifest["implementation"]["served_asset_sha256"]["session_safety.js"]

        self.make_bundle(mutate)
        self.assert_invalid("must contain exactly index.html")

    def test_rejects_formula_bearing_first_cell(self) -> None:
        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            contents[TRIAL_NAME] = csv_bytes(
                TRIAL_HEADER,
                [
                    (
                        "=HYPERLINK(\"https://example.test\")",
                        SESSION_RUN_ID,
                        "in_progress",
                        "completed",
                        "",
                        APP_BUILD_SHA256,
                        APP_SCRIPT_SHA256,
                        "10",
                    )
                ],
            )
            refresh_digests(manifest, contents)

        self.make_bundle(mutate)
        self.assert_invalid("formula-bearing first cell")


if __name__ == "__main__":
    unittest.main(verbosity=2)
