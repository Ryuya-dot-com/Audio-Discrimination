#!/usr/bin/env python3
"""Negative-heavy regression tests for strict result-bundle validation."""

from __future__ import annotations

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
from urllib.parse import urlencode

if __package__:
    from .validate_result_bundle import (
        BundleValidationError,
        TRIAL_HEADER,
        WIDE_HEADER,
        validate_bundle,
    )
else:
    from validate_result_bundle import (
        BundleValidationError,
        TRIAL_HEADER,
        WIDE_HEADER,
        validate_bundle,
    )


SUBJECT_ID = "P001"
RUN_ID = "123e4567-e89b-12d3-a456-426614174000"
TRIAL_NAME = f"{SUBJECT_ID}_{RUN_ID}_audio_discrimination_trials.csv"
WIDE_NAME = f"{SUBJECT_ID}_{RUN_ID}_audio_discrimination_wide.csv"
CONFIG_SHA = "a" * 64
POLICY_SHA = "b" * 64
INDEX_SHA = "c" * 64
BUNDLE_JS_SHA = "d" * 64
SAFETY_SHA = "e" * 64
SCRIPT_SHA = "f" * 64
ASSETS = {
    "deployment-config.json": CONFIG_SHA,
    "deployment_policy.js": POLICY_SHA,
    "index.html": INDEX_SHA,
    "result_bundle.js": BUNDLE_JS_SHA,
    "session_safety.js": SAFETY_SHA,
    "script.js": SCRIPT_SHA,
}
BUILD_SHA = hashlib.sha256(
    "\n".join(f"{name}:{digest}" for name, digest in ASSETS.items()).encode()
).hexdigest()
TASK_SHA = {
    "duration": "1" * 64,
    "formant": "2" * 64,
    "pitch": "3" * 64,
    "risetime": "4" * 64,
}


def csv_bytes(header: tuple[str, ...], rows: list[dict[str, str]]) -> bytes:
    destination = io.StringIO(newline="")
    writer = csv.DictWriter(destination, fieldnames=header, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return ("\ufeff" + destination.getvalue()).encode("utf-8")


def read_csv(raw: bytes) -> tuple[tuple[str, ...], list[dict[str, str]]]:
    source = io.StringIO(raw.decode("utf-8-sig"), newline="")
    reader = csv.DictReader(source)
    return tuple(reader.fieldnames or ()), list(reader)


def provenance() -> dict[str, Any]:
    return {
        "protocol_stimulus_binding_id": (
            "kachlicka2019-staircase-v2__kachlicka2019-reconstruction-v1"
        ),
        "stimulus_catalog": "STIMULUS_CATALOG.json",
        "stimulus_catalog_schema_version": 1,
        "stimulus_catalog_sha256": "5" * 64,
        "stimulus_set_id": "kachlicka2019-reconstruction-v1",
        "stimulus_set_version": 1,
        "stimulus_set_kind": "transformed_official_distribution",
        "stimulus_claim": "reported_parameter_reconstruction_not_original_study_files",
        "stimulus_parameter_profile_id": "kachlicka2019",
        "stimulus_manifest": (
            "stimulus_sets/kachlicka2019-reconstruction-v1/STIMULUS_MANIFEST.json"
        ),
        "stimulus_manifest_sha256": "6" * 64,
        "stimulus_set_sha256": "7" * 64,
        "stimulus_source_citation": "Kachlicka, Saito, & Tierney (2019)",
        "stimulus_source_locator": "Brain and Language, 192, p. 17, section 2.2.2",
        "stimulus_parent_set_id": "saito-tierney-offline-osf-6p8hv-e8ebb0a5",
        "stimulus_parent_manifest": "STIMULUS_MANIFEST.json",
        "stimulus_parent_set_sha256": "8" * 64,
        "stimulus_parent_source_locator": "https://osf.io/bkj6v/",
        "stimulus_source_archive_sha256": "",
        "stimulus_parent_source_archive_sha256": "9" * 64,
        "stimulus_provenance_verification": (
            "catalog_binding_and_manifest_validation_passed"
        ),
        "stimulus_validation_status": "passed",
        "stimulus_audit_date": "2026-07-17",
        "stimulus_generator": "Praat",
        "stimulus_generator_version": "6.4.19",
        "stimulus_generator_script": "tools/reconstruct_stimuli.praat",
        "stimulus_generator_script_sha256": "0" * 64,
        "stimulus_parameters_file": (
            "stimulus_sets/kachlicka2019-reconstruction-v1/PARAMETERS.json"
        ),
        "stimulus_parameters_sha256": "a" * 64,
        "stimulus_license": "",
        "stimulus_license_note": "No redistribution permission is asserted.",
        "stimulus_standard_file_index": 1,
    }


def common_csv_values() -> dict[str, str]:
    values = {
        "subject_id": SUBJECT_ID,
        "battery_version": "5.4.0",
        "session_run_id": RUN_ID,
        "configuration_source": "researcher_ui",
        "administration_mode": "supervised",
        "session_type": "research",
        "deployment_id": "study-production",
        "deployment_environment": "production",
        "deployment_config_schema_version": "1",
        "deployment_config_sha256": CONFIG_SHA,
        "app_origin": "https://listen.example.edu",
        "study_id": "STUDY1",
        "condition_id": "CONTROL",
        "site_id": "TOKYO",
        "distribution_id": "WAVE1",
        "study_title": "Auditory Perception Study",
        "institution_name": "Example University",
        "consent_version": "2026-07",
        "expected_minutes": "30",
        "consent_url": "https://study.example.edu/consent",
        "contact_url": "https://study.example.edu/contact",
        "return_url": "",
        "consent_confirmed_at_utc": "2026-07-18T09:58:00.000Z",
        "preflight_completed_at_utc": "2026-07-18T09:59:00.000Z",
        "preflight_audio_passed": "1",
        "status_reason": "",
        "session_started_at_utc": "2026-07-18T10:00:00.000Z",
        "session_ended_at_utc": "2026-07-18T11:00:00.000Z",
        "resume_count": "0",
        "interrupted_presentation_count": "0",
        "visibility_interruption_count": "0",
        "app_build_id": "audio-discrimination-5.4.0",
        "app_build_sha256": BUILD_SHA,
        "app_script_sha256": SCRIPT_SHA,
        "app_url": "https://listen.example.edu/battery/",
        "participant_link_schema_version": "",
        "participant_link_validation_status": "not_applicable",
        "configured_initial_language": "en",
        "participant_link_config": "",
        "protocol_id": "kachlicka2019",
        "protocol_version": "kachlicka2019-staircase-v2",
        "protocol_citation": "Kachlicka, Saito, & Tierney (2019)",
        "protocol_source_locator": "Brain and Language, 192, p. 17, section 2.2.2",
        "protocol_source_audit_status": "locally_audited_primary_source",
        "procedure_scope": "study_profile_binds_adaptive_procedure_scoring_and_stimulus_set",
        "protocol_main_study_task_ids": "pitch|formant|duration|risetime",
        "stimulus_compatibility": (
            "reported_parameter_reconstruction_not_original_study_files"
        ),
        "feedback_mode": "practice_only",
        "selected_task_ids": "pitch",
        "max_trials": "70",
        "target_reversals": "8",
        "first_scored_reversal": "2",
        "threshold_aggregation": "arithmetic_mean",
        "correct_responses_for_harder": "3",
        "single_correct_before_first_incorrect": "0",
        "step_sizes": "10|5|2|1|1|1|1|1",
        "reversal_definition": "intended_nonzero_staircase_direction_change",
        "reversal_level_timing": "before_step_update",
        "task_order_method": "subject_id_seeded_shuffle",
        "interstimulus_interval_ms": "500",
        "post_sequence_delay_ms": "500",
        "post_response_delay_ms": "1000",
        "practice_feedback": "correctness_and_correct_position",
        "practice_standard_file_index": "1",
        "practice_comparison_file_index": "100",
        "stimulus_error_policy": "fatal_no_substitution",
    }
    values.update({key: str(value) for key, value in provenance().items()})
    return values


def remote_participant_config(session_type: str = "research") -> str:
    return urlencode([
        ("mode", "participant"),
        ("link_version", "3"),
        ("battery_version", "5.4.0"),
        ("deployment_id", "study-production"),
        ("deployment_config_sha256", CONFIG_SHA),
        ("session_type", session_type),
        ("protocol", "kachlicka2019"),
        ("protocol_version", "kachlicka2019-staircase-v2"),
        ("catalog_sha256", "5" * 64),
        ("stimulus_set", "kachlicka2019-reconstruction-v1"),
        ("manifest_sha256", "6" * 64),
        ("tasks", "pitch"),
        ("feedback", "practice_only"),
        ("lang", "en"),
        ("study_id", "STUDY1"),
        ("condition_id", "CONTROL"),
        ("site_id", "TOKYO"),
        ("distribution_id", "WAVE1"),
        ("study_title", "Auditory Perception Study"),
        ("institution", "Example University"),
        ("consent_version", "2026-07"),
        ("expected_minutes", "30"),
        ("consent_url", "https://study.example.edu/consent"),
        ("contact_url", "https://study.example.edu/contact"),
        ("return_url", "https://return.example.edu/upload"),
    ])


def default_trial_rows() -> list[dict[str, str]]:
    common = common_csv_values()
    rows: list[dict[str, str]] = []
    for trial_number in range(1, 71):
        row = {column: "" for column in TRIAL_HEADER}
        row.update(common)
        row.update(
            {
                "session_status": "in_progress",
                "session_final_status": "completed",
                "task_started_at_utc": "2026-07-18T10:00:00.000Z",
                "task_completed_at_utc": "2026-07-18T11:00:00.000Z",
                "task_id": "pitch",
                "task_label": "Pitch discrimination",
                "task_order": "1",
                "trial": str(trial_number),
                "stimulus_step": "50",
                "stimulus_file_index": "51",
                "stimulus_requested_step": "50",
                "stimulus_requested_file_index": "51",
                "stimulus_substituted": "0",
                "odd_position": "2",
                "correct_answer": "2",
                "response": "1",
                "correct": "0",
                "rt_ms": "500",
                "num_reversals_after": "0",
                "step_before": "50",
                "file_index_before": "51",
                "step_after": "60",
                "file_index_after": "61",
                "step_size_used": "10",
                "step_direction": "easier",
                "is_reversal": "0",
                "reversal_number": "",
                "reversal_level": "",
                "mean_reversal_so_far": "",
                "threshold_estimate": "",
                "threshold_physical_value": "",
                "threshold_unit": "Hz",
                "task_in_source_main_study": "1",
                "task_stimulus_compatibility": (
                    "reported_parameters_reconstructed_not_original_waveforms"
                ),
                "practice_trials": "5",
                "stimulus_task_sha256": TASK_SHA["pitch"],
                "stimulus_task_transformation": "replace_50ms_linear_envelope_with_15ms",
                "ui_language": "en",
                "replayed_interrupted_presentation": "0",
                "termination_reason": "max_trials",
                "scored_reversal_count": "0",
                "reversal_levels_used": "",
                "threshold_available": "0",
                "target_reversals_reached": "0",
                "schema_version": "11",
            }
        )
        rows.append(row)
    return rows


def default_wide_row() -> dict[str, str]:
    row = {column: "" for column in WIDE_HEADER}
    row.update(common_csv_values())
    row.update(
        {
            "wide_schema_version": "9",
            "session_status": "completed",
            "completed": "1",
            "completed_at_utc": "2026-07-18T11:00:00.000Z",
            "ui_language_at_start": "en",
            "ui_language_at_completion": "en",
            "ui_languages_used": "en",
            "task_order": "pitch",
            "practice_trials_per_task": "5",
            "stimulus_scale": "published_level_0_100",
        }
    )
    for task_id in ("duration", "formant", "pitch", "risetime"):
        row[f"{task_id}_selected"] = "1" if task_id == "pitch" else "0"
        row[f"{task_id}_in_source_main_study"] = "1"
        row[f"{task_id}_stimulus_compatibility"] = (
            "reported_parameters_reconstructed_not_original_waveforms"
        )
        row[f"{task_id}_stimulus_task_sha256"] = TASK_SHA[task_id]
        row[f"{task_id}_stimulus_task_transformation"] = "reconstructed"
    row.update(
        {
            "pitch_stimulus_task_transformation": "replace_50ms_linear_envelope_with_15ms",
            "pitch_task_order": "1",
            "pitch_threshold_file_index": "",
            "pitch_threshold_level": "",
            "pitch_threshold_physical_value": "",
            "pitch_threshold_unit": "Hz",
            "pitch_trials_completed": "70",
            "pitch_reversals_completed": "0",
            "pitch_scored_reversal_count": "0",
            "pitch_reversal_levels_used": "",
            "pitch_termination_reason": "max_trials",
            "pitch_threshold_available": "0",
            "pitch_target_reversals_reached": "0",
            "pitch_median_rt_ms": "500.0",
            "pitch_practice_correct_count": "5",
            "pitch_stimulus_substitution_count": "0",
            "pitch_started_at_utc": "2026-07-18T10:00:00.000Z",
            "pitch_completed_at_utc": "2026-07-18T11:00:00.000Z",
        }
    )
    return row


def default_contents() -> dict[str, bytes]:
    return {
        TRIAL_NAME: csv_bytes(TRIAL_HEADER, default_trial_rows()),
        WIDE_NAME: csv_bytes(WIDE_HEADER, [default_wide_row()]),
    }


def default_manifest(contents: dict[str, bytes]) -> dict[str, Any]:
    return {
        "result_bundle_schema_version": 3,
        "generated_at_utc": "2026-07-18T11:01:00.000Z",
        "data_classification": "pseudonymous_research_data",
        "automatic_upload_performed": False,
        "administration_mode": "supervised",
        "result_return_requires_external_portal_receipt": False,
        "deployment": {
            "session_type": "research",
            "deployment_id": "study-production",
            "environment": "production",
            "config_schema_version": 1,
            "config_file": "deployment-config.json",
            "config_sha256": CONFIG_SHA,
            "app_origin": "https://listen.example.edu",
            "researcher_origin": "https://listen.example.edu",
            "participant_origin": "https://listen.example.edu",
            "public_participant_base_url": "https://listen.example.edu/battery/",
        },
        "session": {
            "subject_id": SUBJECT_ID,
            "session_run_id": RUN_ID,
            "status": "completed",
            "status_reason": "",
            "started_at_utc": "2026-07-18T10:00:00.000Z",
            "ended_at_utc": "2026-07-18T11:00:00.000Z",
            "completed_at_utc": "2026-07-18T11:00:00.000Z",
            "resume_count": 0,
            "interrupted_presentation_count": 0,
            "visibility_interruption_count": 0,
            "consent_confirmed_at_utc": "2026-07-18T09:58:00.000Z",
            "preflight_completed_at_utc": "2026-07-18T09:59:00.000Z",
            "preflight_audio_passed": True,
        },
        "study": {
            "studyId": "STUDY1",
            "conditionId": "CONTROL",
            "siteId": "TOKYO",
            "distributionId": "WAVE1",
            "studyTitle": "Auditory Perception Study",
            "institutionName": "Example University",
            "consentVersion": "2026-07",
            "expectedMinutes": 30,
            "consentUrl": "https://study.example.edu/consent",
            "contactUrl": "https://study.example.edu/contact",
            "returnUrl": "",
        },
        "implementation": {
            "batteryVersion": "5.4.0",
            "trialSchemaVersion": 11,
            "wideSchemaVersion": 9,
            "checkpointSchemaVersion": 3,
            "resultBundleSchemaVersion": 3,
            "appBuildId": "audio-discrimination-5.4.0",
            "procedureScope": "study_profile_binds_adaptive_procedure_scoring_and_stimulus_set",
            "taskOrderMethod": "subject_id_seeded_shuffle",
            "reversalDefinition": "intended_nonzero_staircase_direction_change",
            "stimulusErrorPolicy": "fatal_no_substitution",
            "app_build_sha256": BUILD_SHA,
            "app_script_sha256": SCRIPT_SHA,
            "served_asset_sha256": dict(ASSETS),
            "app_url": "https://listen.example.edu/battery/",
        },
        "procedure": {
            "protocol_id": "kachlicka2019",
            "protocol_version": "kachlicka2019-staircase-v2",
            "protocol_citation": "Kachlicka, Saito, & Tierney (2019)",
            "selected_task_ids": ["pitch"],
            "task_order_ids": ["pitch"],
            "feedback_mode": "practice_only",
        },
        "provenance": provenance(),
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


def rewrite_rows(contents: dict[str, bytes], name: str, rows: list[dict[str, str]]) -> None:
    header = TRIAL_HEADER if name == TRIAL_NAME else WIDE_HEADER
    contents[name] = csv_bytes(header, rows)


def write_bundle(
    path: Path,
    manifest: dict[str, Any],
    contents: dict[str, bytes],
    *,
    extra: dict[str, bytes] | None = None,
) -> None:
    manifest_bytes = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_STORED) as archive:
        for name, content in contents.items():
            archive.writestr(name, content)
        archive.writestr("session_manifest.json", manifest_bytes)
        for name, content in (extra or {}).items():
            archive.writestr(name, content)


class ResultBundleValidatorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "fixture_results.zip"

    def make_bundle(
        self,
        mutate: Callable[[dict[str, Any], dict[str, bytes]], None] | None = None,
        *,
        refresh: bool = True,
        extra: dict[str, bytes] | None = None,
    ) -> tuple[dict[str, Any], dict[str, bytes]]:
        contents = default_contents()
        manifest = default_manifest(contents)
        if mutate:
            mutate(manifest, contents)
        if refresh:
            refresh_digests(manifest, contents)
        write_bundle(self.path, manifest, contents, extra=extra)
        return manifest, contents

    def assert_invalid(self, message: str) -> None:
        with self.assertRaisesRegex(BundleValidationError, message):
            validate_bundle(self.path)

    def mutate_trial(self, contents: dict[str, bytes], mutate: Callable[[list[dict[str, str]]], None]) -> None:
        _header, rows = read_csv(contents[TRIAL_NAME])
        mutate(rows)
        rewrite_rows(contents, TRIAL_NAME, rows)

    def mutate_wide(self, contents: dict[str, bytes], mutate: Callable[[dict[str, str]], None]) -> None:
        _header, rows = read_csv(contents[WIDE_NAME])
        mutate(rows[0])
        rewrite_rows(contents, WIDE_NAME, rows)

    def configure_remote_test_bundle(
        self,
        manifest: dict[str, Any],
        contents: dict[str, bytes],
        canonical_config: str,
    ) -> None:
        test_trial_name = f"TEST_ONLY_{TRIAL_NAME}"
        test_wide_name = f"TEST_ONLY_{WIDE_NAME}"
        manifest.update(
            data_classification="test_data_do_not_analyze",
            administration_mode="remote_manual_upload",
            result_return_requires_external_portal_receipt=True,
        )
        manifest["deployment"].update(
            session_type="test",
            environment="preview",
            app_origin="http://127.0.0.1:8765",
        )
        manifest["study"]["returnUrl"] = "https://return.example.edu/upload"
        manifest["implementation"]["app_url"] = "http://127.0.0.1:8765/"
        updates = {
            "configuration_source": "participant_link",
            "administration_mode": "remote_manual_upload",
            "session_type": "test",
            "deployment_environment": "preview",
            "app_origin": "http://127.0.0.1:8765",
            "app_url": "http://127.0.0.1:8765/",
            "return_url": "https://return.example.edu/upload",
            "participant_link_schema_version": "3",
            "participant_link_validation_status": "passed",
            "participant_link_config": canonical_config,
        }
        self.mutate_trial(contents, lambda rows: [row.update(updates) for row in rows])
        self.mutate_wide(contents, lambda row: row.update(updates))
        contents[test_trial_name] = contents.pop(TRIAL_NAME)
        contents[test_wide_name] = contents.pop(WIDE_NAME)
        manifest["files"][0]["name"] = test_trial_name
        manifest["files"][1]["name"] = test_wide_name

    def test_accepts_complete_exact_schema_bundle(self) -> None:
        self.make_bundle()
        report = validate_bundle(self.path)
        self.assertEqual(report.status, "completed")
        self.assertEqual(report.trial_rows, 70)
        self.assertEqual(report.wide_rows, 1)

    def test_accepts_technical_failure_with_zero_trial_rows(self) -> None:
        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            manifest["session"].update(
                status="technical_failure",
                status_reason="AUDIO_PLAYBACK_FAILED",
                completed_at_utc="",
            )
            contents[TRIAL_NAME] = csv_bytes(TRIAL_HEADER, [])
            self.mutate_wide(contents, lambda row: row.update(
                session_status="technical_failure",
                status_reason="AUDIO_PLAYBACK_FAILED",
                completed="0",
                completed_at_utc="",
                ui_language_at_completion="",
                ui_languages_used="",
                **{f"pitch_{suffix}": "" for suffix in (
                    "task_order", "threshold_file_index", "threshold_level",
                    "threshold_physical_value", "threshold_unit", "trials_completed",
                    "reversals_completed", "scored_reversal_count", "reversal_levels_used",
                    "termination_reason", "threshold_available", "target_reversals_reached",
                    "median_rt_ms", "practice_correct_count", "stimulus_substitution_count",
                    "started_at_utc", "completed_at_utc",
                )},
            ))

        self.make_bundle(mutate)
        report = validate_bundle(self.path)
        self.assertEqual(report.status, "technical_failure")
        self.assertEqual(report.trial_rows, 0)

    def test_accepts_remote_test_bundle_with_cross_checked_link_configuration(self) -> None:
        canonical = remote_participant_config("test")
        self.make_bundle(
            lambda manifest, contents: self.configure_remote_test_bundle(
                manifest, contents, canonical
            )
        )
        report = validate_bundle(self.path)
        self.assertEqual(report.status, "completed")

    def test_accepts_unsigned_remote_research_bundle(self) -> None:
        canonical = remote_participant_config("research")

        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            manifest.update(
                administration_mode="remote_manual_upload",
                result_return_requires_external_portal_receipt=True,
            )
            manifest["study"]["returnUrl"] = "https://return.example.edu/upload"
            updates = {
                "configuration_source": "participant_link",
                "administration_mode": "remote_manual_upload",
                "return_url": "https://return.example.edu/upload",
                "participant_link_schema_version": "3",
                "participant_link_validation_status": "passed",
                "participant_link_config": canonical,
            }
            self.mutate_trial(contents, lambda rows: [row.update(updates) for row in rows])
            self.mutate_wide(contents, lambda row: row.update(updates))

        self.make_bundle(mutate)
        report = validate_bundle(self.path)
        self.assertEqual(report.status, "completed")

    def test_accepts_loopback_test_only_bundle(self) -> None:
        test_trial_name = f"TEST_ONLY_{TRIAL_NAME}"
        test_wide_name = f"TEST_ONLY_{WIDE_NAME}"

        def mutate(manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            manifest["data_classification"] = "test_data_do_not_analyze"
            manifest["deployment"].update(
                session_type="test",
                environment="preview",
                app_origin="http://127.0.0.1:8765",
            )
            manifest["implementation"]["app_url"] = "http://127.0.0.1:8765/"
            updates = {
                "session_type": "test",
                "deployment_environment": "preview",
                "app_origin": "http://127.0.0.1:8765",
                "app_url": "http://127.0.0.1:8765/",
            }
            self.mutate_trial(contents, lambda rows: [row.update(updates) for row in rows])
            self.mutate_wide(contents, lambda row: row.update(updates))
            contents[test_trial_name] = contents.pop(TRIAL_NAME)
            contents[test_wide_name] = contents.pop(WIDE_NAME)
            manifest["files"][0]["name"] = test_trial_name
            manifest["files"][1]["name"] = test_wide_name

        self.make_bundle(mutate)
        report = validate_bundle(self.path)
        self.assertEqual(report.status, "completed")

    def test_rejects_remote_link_config_manifest_mismatch(self) -> None:
        canonical = remote_participant_config("test").replace(
            "deployment_id=study-production", "deployment_id=other-production"
        )
        self.make_bundle(
            lambda manifest, contents: self.configure_remote_test_bundle(
                manifest, contents, canonical
            )
        )
        self.assert_invalid("participant_link_config deployment_id disagrees")

    def test_rejects_completed_bundle_with_zero_trials(self) -> None:
        self.make_bundle(lambda _manifest, contents: contents.update(
            {TRIAL_NAME: csv_bytes(TRIAL_HEADER, [])}
        ))
        self.assert_invalid("completed bundles require at least one trial")

    def test_rejects_old_minimal_trial_header(self) -> None:
        def mutate(_manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            _header, rows = read_csv(contents[TRIAL_NAME])
            short = tuple(TRIAL_HEADER[:7])
            contents[TRIAL_NAME] = csv_bytes(short, [
                {column: rows[0][column] for column in short}
            ])

        self.make_bundle(mutate)
        self.assert_invalid("header does not exactly match schema version 11")

    def test_rejects_trial_header_order_drift(self) -> None:
        def mutate(_manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            _header, rows = read_csv(contents[TRIAL_NAME])
            header = list(TRIAL_HEADER)
            header[1], header[2] = header[2], header[1]
            contents[TRIAL_NAME] = csv_bytes(tuple(header), rows)

        self.make_bundle(mutate)
        self.assert_invalid("header does not exactly match schema version 11")

    def test_rejects_wide_header_missing_task_column(self) -> None:
        def mutate(_manifest: dict[str, Any], contents: dict[str, bytes]) -> None:
            _header, rows = read_csv(contents[WIDE_NAME])
            header = tuple(column for column in WIDE_HEADER if column != "risetime_completed_at_utc")
            contents[WIDE_NAME] = csv_bytes(
                header,
                [{column: row[column] for column in header} for row in rows],
            )

        self.make_bundle(mutate)
        self.assert_invalid("header does not exactly match schema version 9")

    def test_rejects_manifest_nested_extra_key(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["study"].update(extra="x"))
        self.assert_invalid("manifest.study has invalid keys.*unexpected extra")

    def test_rejects_manifest_nested_missing_key(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["procedure"].pop("feedback_mode"))
        self.assert_invalid("manifest.procedure has invalid keys.*missing feedback_mode")

    def test_rejects_manifest_boolean_as_integer(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["session"].update(resume_count=True))
        self.assert_invalid("resume_count must be a JSON integer")

    def test_rejects_invalid_manifest_timestamp(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["session"].update(
            ended_at_utc="2026-07-18 11:00:00"
        ))
        self.assert_invalid("ended_at_utc must be an ISO 8601 UTC timestamp")

    def test_rejects_reversed_manifest_timestamps(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["session"].update(
            started_at_utc="2026-07-18T11:30:00.000Z"
        ))
        self.assert_invalid("timestamps are not chronologically ordered")

    def test_rejects_manifest_study_id_csv_mismatch(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["study"].update(studyId="STUDY2"))
        self.assert_invalid("study_id does not match")

    def test_rejects_manifest_deployment_id_csv_mismatch(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["deployment"].update(
            deployment_id="other-production"
        ))
        self.assert_invalid("deployment_id does not match")

    def test_rejects_protocol_version_binding_mismatch(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["procedure"].update(
            protocol_version="kachlicka2019-staircase-v999"
        ))
        self.assert_invalid("protocol version is not bound")

    def test_rejects_protocol_stimulus_set_binding_mismatch(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["provenance"].update(
            stimulus_set_id="sun2021-reconstruction-v1"
        ))
        self.assert_invalid("stimulus_set_id does not match")

    def test_rejects_catalog_hash_csv_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_wide(
            contents, lambda row: row.update(stimulus_catalog_sha256="b" * 64)
        ))
        self.assert_invalid("stimulus_catalog_sha256 does not match")

    def test_rejects_served_asset_build_hash_mismatch(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["implementation"].update(
            app_build_sha256="0" * 64
        ))
        self.assert_invalid("app_build_sha256 does not match")

    def test_rejects_script_hash_trial_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(app_script_sha256="0" * 64)
        ))
        self.assert_invalid("app_script_sha256 does not match")

    def test_rejects_terminal_status_wide_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_wide(
            contents, lambda row: row.update(session_status="technical_failure")
        ))
        self.assert_invalid("session_status does not match manifest/procedure")

    def test_rejects_trial_final_status_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[5].update(session_final_status="technical_failure")
        ))
        self.assert_invalid("session_final_status does not match")

    def test_rejects_selected_task_flag_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_wide(
            contents, lambda row: row.update(pitch_selected="0")
        ))
        self.assert_invalid("pitch_selected disagrees")

    def test_rejects_unselected_task_summary(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_wide(
            contents, lambda row: row.update(duration_task_order="1")
        ))
        self.assert_invalid("unselected task duration has task-summary values")

    def test_rejects_noncontiguous_trial_numbers(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[1].update(trial="3")
        ))
        self.assert_invalid("trial numbers must be contiguous")

    def test_rejects_wrong_task_order(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(task_order="2")
        ))
        self.assert_invalid("task_order.*outside its permitted range|task_order disagrees")

    def test_rejects_non_binary_field(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(correct="2")
        ))
        self.assert_invalid("correct must be 0 or 1")

    def test_rejects_correct_flag_response_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(correct="1")
        ))
        self.assert_invalid("correct flag disagrees")

    def test_rejects_published_level_file_index_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(stimulus_file_index="50")
        ))
        self.assert_invalid(r"stimulus_file_index must equal published stimulus_step \+ 1")

    def test_rejects_stimulus_substitution_under_fatal_policy(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(stimulus_substituted="1")
        ))
        self.assert_invalid("violates fatal_no_substitution")

    def test_rejects_wide_trial_count_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_wide(
            contents, lambda row: row.update(pitch_trials_completed="69")
        ))
        self.assert_invalid("trials_completed disagrees")

    def test_rejects_impossible_max_trials_termination(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_wide(
            contents, lambda row: row.update(pitch_trials_completed="10")
        ))
        self.assert_invalid("trials_completed disagrees|termination_reason max_trials is impossible")

    def test_rejects_task_stimulus_hash_cross_file_mismatch(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(stimulus_task_sha256="b" * 64)
        ))
        self.assert_invalid("task stimulus identity disagrees")

    def test_rejects_negative_numeric_step_semantically_not_as_formula(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(step_size_used="-1")
        ))
        self.assert_invalid("step_size_used is not a configured staircase step")

    def test_rejects_formula_bearing_text(self) -> None:
        self.make_bundle(lambda _manifest, contents: self.mutate_trial(
            contents, lambda rows: rows[0].update(task_label="=HYPERLINK(\"x\")")
        ))
        self.assert_invalid("formula-bearing cell")

    def test_rejects_manifest_file_digest_mismatch(self) -> None:
        self.make_bundle(lambda manifest, _contents: manifest["files"][0].update(
            sha256="0" * 64
        ), refresh=False)
        self.assert_invalid("SHA-256 mismatch")

    def test_rejects_extra_zip_member(self) -> None:
        self.make_bundle(extra={"unexpected.txt": b"x"})
        self.assert_invalid("exactly 3 members")

    def test_rejects_unsafe_zip_member(self) -> None:
        contents = default_contents()
        manifest = default_manifest(contents)
        manifest_bytes = json.dumps(manifest).encode()
        with zipfile.ZipFile(self.path, "w", compression=zipfile.ZIP_STORED) as archive:
            archive.writestr(TRIAL_NAME, contents[TRIAL_NAME])
            archive.writestr("../escape.csv", contents[WIDE_NAME])
            archive.writestr("session_manifest.json", manifest_bytes)
        self.assert_invalid("unsafe or nested ZIP member name")

    def test_rejects_duplicate_zip_member(self) -> None:
        contents = default_contents()
        manifest = default_manifest(contents)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(self.path, "w", compression=zipfile.ZIP_STORED) as archive:
                archive.writestr(TRIAL_NAME, contents[TRIAL_NAME])
                archive.writestr(TRIAL_NAME, contents[TRIAL_NAME])
                archive.writestr("session_manifest.json", json.dumps(manifest).encode())
        self.assert_invalid("duplicate member names")


if __name__ == "__main__":
    unittest.main(verbosity=2)
