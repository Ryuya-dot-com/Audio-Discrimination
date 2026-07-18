#!/usr/bin/env python3
"""Validate Audio Discrimination result ZIPs against the frozen result contract.

This is a strict, dependency-free *self-consistency* validator.  It validates the
ZIP container, the complete schema-versioned CSV headers, every manifest object,
and the joins and invariants shared by the manifest and both CSVs.  It does not
authenticate an external upload receipt and it cannot establish author identity
or chain of custody because bundles are not externally signed; those controls
belong to the approved return portal and ingestion workflow.  For the current
unsigned participant-link schema, remote research bundles are unreachable
runtime states and are rejected; remote-manual-return bundles are TEST-only.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import re
import stat
import sys
import unicodedata
import zipfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, NoReturn
from urllib.parse import parse_qsl, urlsplit


ROOT = Path(__file__).resolve().parents[1]
CODEBOOK_PATH = ROOT / "RESULT_CODEBOOK.json"
MANIFEST_NAME = "session_manifest.json"
MAX_ARCHIVE_BYTES = 256 * 1024 * 1024
MAX_MEMBER_BYTES = 128 * 1024 * 1024
MAX_MANIFEST_BYTES = 2 * 1024 * 1024

SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")
SUBJECT_ID_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_-]{0,31}$")
SESSION_RUN_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$")
STUDY_CODE_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_-]{0,63}$")
VERSION_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
UTC_PATTERN = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$"
)
INTEGER_PATTERN = re.compile(r"^-?(?:0|[1-9]\d*)$")
NUMBER_PATTERN = re.compile(r"^-?(?:0|[1-9]\d*)(?:\.\d+)?$")
CSV_NAME_PATTERN = re.compile(
    r"^(?P<test>TEST_ONLY_)?(?P<subject>[A-Za-z][A-Za-z0-9_-]{0,31})_"
    r"(?P<run>[A-Za-z0-9][A-Za-z0-9_-]{0,127})_"
    r"audio_discrimination_(?P<kind>trials|wide)\.csv$"
)
BUILD_ASSET_NAMES = (
    "deployment-config.json",
    "deployment_policy.js",
    "index.html",
    "result_bundle.js",
    "session_safety.js",
    "script.js",
)


class BundleValidationError(ValueError):
    """Raised when a result bundle fails a required integrity check."""


def _fail(message: str) -> NoReturn:
    raise BundleValidationError(message)


def _load_codebook() -> dict[str, Any]:
    try:
        value = json.loads(CODEBOOK_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        _fail(f"could not load frozen result codebook: {error}")
    if not isinstance(value, dict) or value.get("codebook_schema_version") != 1:
        _fail("unsupported or malformed frozen result codebook")
    return value


CODEBOOK = _load_codebook()
BATTERY_VERSION = CODEBOOK["battery_version"]
PARTICIPANT_LINK_SCHEMA_VERSION = CODEBOOK["participant_link_schema_version"]
SIGNED_PARTICIPANT_LINKS_SUPPORTED = CODEBOOK["signed_participant_links_supported"]
if SIGNED_PARTICIPANT_LINKS_SUPPORTED is not False:
    _fail("result codebook enables signed participant links without validator support")
CHECKPOINT_SCHEMA_VERSION = CODEBOOK["checkpoint_schema_version"]
RESULT_BUNDLE_SCHEMA_VERSION = CODEBOOK["result_bundle_schema_version"]
TRIAL_SCHEMA_VERSION = max(int(version) for version in CODEBOOK["csv_schemas"]["trial"])
WIDE_SCHEMA_VERSION = max(int(version) for version in CODEBOOK["csv_schemas"]["wide"])
TRIAL_HEADER = tuple(
    CODEBOOK["csv_schemas"]["trial"][str(TRIAL_SCHEMA_VERSION)]["columns"]
)
WIDE_SPEC = CODEBOOK["csv_schemas"]["wide"][str(WIDE_SCHEMA_VERSION)]
TASK_IDS = tuple(WIDE_SPEC["task_order"])
TASK_COLUMNS = tuple(WIDE_SPEC["task_columns"])
WIDE_HEADER = tuple(WIDE_SPEC["base_columns"]) + tuple(
    f"{task_id}_{suffix}" for task_id in TASK_IDS for suffix in TASK_COLUMNS
)
MANIFEST_KEYS = CODEBOOK["manifest_keys"]
PROFILES = CODEBOOK["protocols"]
TASK_SPECS = CODEBOOK["tasks"]


@dataclass(frozen=True)
class ValidationReport:
    archive: Path
    subject_id: str
    session_run_id: str
    status: str
    trial_rows: int
    wide_rows: int
    app_build_sha256: str
    app_script_sha256: str


@dataclass(frozen=True)
class ParsedCsv:
    name: str
    header: tuple[str, ...]
    rows: tuple[dict[str, str], ...]


def _require_mapping(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        _fail(f"{label} must be a JSON object")
    return value


def _require_exact_keys(value: dict[str, Any], expected: list[str] | tuple[str, ...], label: str) -> None:
    expected_set = frozenset(expected)
    actual = frozenset(value)
    missing = sorted(expected_set - actual)
    unexpected = sorted(actual - expected_set)
    if missing or unexpected:
        details: list[str] = []
        if missing:
            details.append(f"missing {', '.join(missing)}")
        if unexpected:
            details.append(f"unexpected {', '.join(unexpected)}")
        _fail(f"{label} has invalid keys ({'; '.join(details)})")


def _require_bool(value: Any, label: str) -> bool:
    if type(value) is not bool:
        _fail(f"{label} must be a JSON boolean")
    return value


def _require_int(value: Any, label: str, minimum: int = 0, maximum: int | None = None) -> int:
    if type(value) is not int or value < minimum or (maximum is not None and value > maximum):
        range_text = f" between {minimum} and {maximum}" if maximum is not None else f" >= {minimum}"
        _fail(f"{label} must be a JSON integer{range_text}")
    return value


def _require_string(value: Any, label: str, *, empty: bool = False, maximum: int = 4096) -> str:
    if not isinstance(value, str) or len(value) > maximum or (not empty and not value.strip()):
        qualifier = "a string" if empty else "a non-empty string"
        _fail(f"{label} must be {qualifier} of at most {maximum} characters")
    return value


def _require_sha256(value: Any, label: str, *, empty: bool = False) -> str:
    if empty and value == "":
        return ""
    if not isinstance(value, str) or not SHA256_PATTERN.fullmatch(value):
        _fail(f"{label} must be a lowercase hexadecimal SHA-256 digest")
    return value


def _parse_utc(value: Any, label: str, *, empty: bool = False) -> datetime | None:
    if empty and value == "":
        return None
    if not isinstance(value, str) or not UTC_PATTERN.fullmatch(value):
        _fail(f"{label} must be an ISO 8601 UTC timestamp ending in Z")
    try:
        return datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError:
        _fail(f"{label} is not a valid calendar timestamp")


def _require_https_url(
    value: Any,
    label: str,
    *,
    empty: bool = False,
    origin: bool = False,
    allow_loopback_http: bool = False,
) -> str:
    if empty and value == "":
        return ""
    text = _require_string(value, label, maximum=4096)
    parsed = urlsplit(text)
    loopback = parsed.hostname in {"localhost", "127.0.0.1", "::1"}
    if (
        not (
            parsed.scheme == "https"
            or (allow_loopback_http and loopback and parsed.scheme == "http")
        )
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or (origin and (parsed.path not in {"", "/"} or parsed.query or parsed.fragment))
    ):
        _fail(f"{label} must be a credential-free HTTPS {'origin' if origin else 'URL'}")
    return text


def _csv_int(value: str, label: str, minimum: int = 0, maximum: int | None = None) -> int:
    if not INTEGER_PATTERN.fullmatch(value):
        _fail(f"{label} must be an integer")
    number = int(value)
    if number < minimum or (maximum is not None and number > maximum):
        _fail(f"{label} is outside its permitted range")
    return number


def _csv_number(value: str, label: str, *, empty: bool = False) -> float | None:
    if empty and value == "":
        return None
    if not NUMBER_PATTERN.fullmatch(value):
        _fail(f"{label} must be a finite decimal number")
    number = float(value)
    if not math.isfinite(number):
        _fail(f"{label} must be finite")
    return number


def _csv_bit(value: str, label: str, *, empty: bool = False) -> int | None:
    if empty and value == "":
        return None
    if value not in {"0", "1"}:
        _fail(f"{label} must be 0 or 1")
    return int(value)


def _reject_json_constant(value: str) -> NoReturn:
    _fail(f"manifest contains non-standard JSON constant {value}")


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            _fail(f"manifest contains duplicate JSON key {key!r}")
        result[key] = value
    return result


def _parse_manifest(raw: bytes) -> dict[str, Any]:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        _fail(f"{MANIFEST_NAME} is not valid UTF-8: {error}")
    if text.startswith("\ufeff"):
        _fail(f"{MANIFEST_NAME} must not contain a UTF-8 BOM")
    try:
        value = json.loads(
            text,
            object_pairs_hook=_unique_object,
            parse_constant=_reject_json_constant,
        )
    except BundleValidationError:
        raise
    except (json.JSONDecodeError, RecursionError) as error:
        _fail(f"{MANIFEST_NAME} is not valid JSON: {error}")
    return _require_mapping(value, "manifest")


def _safe_member_name(name: str) -> None:
    if not name or len(name) > 1024:
        _fail("ZIP member names must contain between 1 and 1024 characters")
    if unicodedata.normalize("NFC", name) != name:
        _fail(f"ZIP member name is not NFC-normalized: {name!r}")
    if any(ord(character) < 32 or ord(character) == 127 for character in name):
        _fail(f"ZIP member name contains a control character: {name!r}")
    if "/" in name or "\\" in name or name in {".", ".."}:
        _fail(f"unsafe or nested ZIP member name: {name!r}")
    if Path(name).is_absolute() or re.match(r"^[A-Za-z]:", name):
        _fail(f"absolute ZIP member name is forbidden: {name!r}")


def _validate_zip_info(info: zipfile.ZipInfo) -> None:
    _safe_member_name(info.filename)
    if info.is_dir():
        _fail(f"directories are not allowed in a result bundle: {info.filename!r}")
    if info.flag_bits & 0x0001:
        _fail(f"encrypted ZIP members are not allowed: {info.filename!r}")
    if info.flag_bits & ~0x0800:
        _fail(f"ZIP member has unsupported general-purpose flags: {info.filename!r}")
    if info.compress_type != zipfile.ZIP_STORED:
        _fail(f"ZIP member must use the frozen store-only method: {info.filename!r}")
    if info.file_size < 0 or info.file_size > MAX_MEMBER_BYTES:
        _fail(f"ZIP member exceeds the {MAX_MEMBER_BYTES}-byte limit: {info.filename!r}")
    if info.compress_size != info.file_size:
        _fail(f"stored ZIP member has inconsistent sizes: {info.filename!r}")
    if info.extra or info.comment:
        _fail(f"ZIP member contains unfrozen metadata: {info.filename!r}")
    if info.create_system == 3 and stat.S_IFMT(info.external_attr >> 16) == stat.S_IFLNK:
        _fail(f"symbolic links are not allowed in a result bundle: {info.filename!r}")


def _read_member(archive: zipfile.ZipFile, info: zipfile.ZipInfo) -> bytes:
    try:
        with archive.open(info, "r") as source:
            raw = source.read(MAX_MEMBER_BYTES + 1)
            if source.read(1):
                _fail(f"ZIP member exceeds the read limit: {info.filename!r}")
    except (OSError, RuntimeError, zipfile.BadZipFile) as error:
        _fail(f"could not read ZIP member {info.filename!r}: {error}")
    if len(raw) != info.file_size:
        _fail(f"ZIP member length does not match its directory record: {info.filename!r}")
    return raw


def _formula_bearing(cell: str) -> bool:
    stripped = cell.lstrip()
    if not stripped:
        return False
    if stripped[0] in {"=", "@"}:
        return True
    if stripped[0] in {"+", "-"} and not NUMBER_PATTERN.fullmatch(stripped):
        return True
    return False


def _csv_safe_text(value: str) -> str:
    """Mirror SessionSafety.csvSafeString for manifest-to-CSV comparisons."""
    return f"'{value}" if re.match(r"^\s*[=+\-@]", value) else value


def _parse_csv(name: str, raw: bytes, expected_header: tuple[str, ...]) -> ParsedCsv:
    if b"\x00" in raw:
        _fail(f"{name} contains a NUL byte")
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        _fail(f"{name} is not valid UTF-8: {error}")
    try:
        records = list(csv.reader(io.StringIO(text, newline=""), strict=True))
    except csv.Error as error:
        _fail(f"{name} is not valid CSV: {error}")
    if not records or not records[0]:
        _fail(f"{name} has no CSV header")
    header = tuple(records[0])
    if header != expected_header:
        _fail(
            f"{name} header does not exactly match schema version "
            f"{TRIAL_SCHEMA_VERSION if expected_header == TRIAL_HEADER else WIDE_SCHEMA_VERSION} "
            "(column names and order are frozen)"
        )
    rows: list[dict[str, str]] = []
    for row_number, values in enumerate(records[1:], start=2):
        if len(values) != len(header):
            _fail(f"{name} row {row_number} has {len(values)} fields; expected {len(header)}")
        for column, cell in zip(header, values, strict=True):
            if _formula_bearing(cell):
                _fail(f"{name} row {row_number} has a formula-bearing cell {column!r}")
        rows.append(dict(zip(header, values, strict=True)))
    return ParsedCsv(name=name, header=header, rows=tuple(rows))


def _same(rows: tuple[dict[str, str], ...], column: str, expected: str, name: str) -> None:
    for row_number, row in enumerate(rows, start=2):
        if row[column] != expected:
            _fail(
                f"{name} row {row_number} {column} does not match the frozen bundle contract "
                f"({row[column]!r} != {expected!r})"
            )


def _validate_manifest(manifest: dict[str, Any]) -> tuple[dict[str, Any], ...]:
    _require_exact_keys(manifest, MANIFEST_KEYS["top_level"], "manifest")
    if manifest["result_bundle_schema_version"] != RESULT_BUNDLE_SCHEMA_VERSION:
        _fail("unsupported result_bundle_schema_version")
    generated = _parse_utc(manifest["generated_at_utc"], "manifest.generated_at_utc")
    _require_bool(manifest["automatic_upload_performed"], "manifest.automatic_upload_performed")
    if manifest["automatic_upload_performed"] is not False:
        _fail("manifest must state automatic_upload_performed=false")
    administration = manifest["administration_mode"]
    if administration not in {"supervised", "remote_manual_upload"}:
        _fail("manifest.administration_mode is invalid")
    receipt_required = _require_bool(
        manifest["result_return_requires_external_portal_receipt"],
        "manifest.result_return_requires_external_portal_receipt",
    )
    if receipt_required != (administration == "remote_manual_upload"):
        _fail("result_return_requires_external_portal_receipt disagrees with administration_mode")

    deployment = _require_mapping(manifest["deployment"], "manifest.deployment")
    session = _require_mapping(manifest["session"], "manifest.session")
    study = _require_mapping(manifest["study"], "manifest.study")
    implementation = _require_mapping(manifest["implementation"], "manifest.implementation")
    procedure = _require_mapping(manifest["procedure"], "manifest.procedure")
    provenance = _require_mapping(manifest["provenance"], "manifest.provenance")
    for label, value in (
        ("deployment", deployment),
        ("session", session),
        ("study", study),
        ("implementation", implementation),
        ("procedure", procedure),
        ("provenance", provenance),
    ):
        _require_exact_keys(value, MANIFEST_KEYS[label], f"manifest.{label}")

    session_type = deployment["session_type"]
    if session_type not in {"research", "test"}:
        _fail("manifest.deployment.session_type is invalid")
    if administration == "remote_manual_upload" and session_type != "test":
        _fail(
            "unsigned participant-link schema 3 permits remote_manual_upload only for TEST sessions"
        )
    expected_classification = (
        "test_data_do_not_analyze" if session_type == "test" else "pseudonymous_research_data"
    )
    if manifest["data_classification"] != expected_classification:
        _fail("manifest.data_classification disagrees with deployment.session_type")
    _require_string(deployment["deployment_id"], "manifest.deployment.deployment_id", maximum=128)
    if deployment["environment"] not in {"preview", "staging", "production"}:
        _fail("manifest.deployment.environment is invalid")
    if deployment["config_schema_version"] != 1 or deployment["config_file"] != "deployment-config.json":
        _fail("manifest.deployment configuration identity is unsupported")
    _require_sha256(deployment["config_sha256"], "manifest.deployment.config_sha256")
    app_origin = _require_https_url(
        deployment["app_origin"],
        "manifest.deployment.app_origin",
        origin=True,
        allow_loopback_http=session_type == "test",
    )
    _require_https_url(deployment["researcher_origin"], "manifest.deployment.researcher_origin", origin=True)
    participant_origin = _require_https_url(
        deployment["participant_origin"], "manifest.deployment.participant_origin", origin=True
    )
    _require_https_url(
        deployment["public_participant_base_url"],
        "manifest.deployment.public_participant_base_url",
    )
    if session_type == "research":
        expected_app_origin = (
            participant_origin
            if administration == "remote_manual_upload"
            else deployment["researcher_origin"]
        )
        if app_origin != expected_app_origin:
            _fail("manifest app_origin disagrees with the authorized administration origin")
    elif urlsplit(app_origin).hostname not in {"localhost", "127.0.0.1", "::1"}:
        _fail("test session app_origin must be an authorized loopback origin")

    subject_id = session["subject_id"]
    run_id = session["session_run_id"]
    if not isinstance(subject_id, str) or not SUBJECT_ID_PATTERN.fullmatch(subject_id):
        _fail("manifest.session.subject_id is invalid")
    if not isinstance(run_id, str) or not SESSION_RUN_ID_PATTERN.fullmatch(run_id):
        _fail("manifest.session.session_run_id is invalid")
    status = session["status"]
    if status not in {"completed", "technical_failure"}:
        _fail("manifest.session.status must be completed or technical_failure")
    reason = _require_string(session["status_reason"], "manifest.session.status_reason", empty=True)
    if (status == "technical_failure") != bool(reason.strip()):
        _fail("manifest.session.status_reason must be non-empty only for technical_failure")
    started = _parse_utc(session["started_at_utc"], "manifest.session.started_at_utc")
    ended = _parse_utc(session["ended_at_utc"], "manifest.session.ended_at_utc")
    completed = _parse_utc(
        session["completed_at_utc"], "manifest.session.completed_at_utc", empty=status != "completed"
    )
    if status == "completed" and completed is None:
        _fail("completed bundles require manifest.session.completed_at_utc")
    if status == "technical_failure" and session["completed_at_utc"] != "":
        _fail("technical_failure bundles must not claim completed_at_utc")
    consent = _parse_utc(
        session["consent_confirmed_at_utc"], "manifest.session.consent_confirmed_at_utc"
    )
    preflight = _parse_utc(
        session["preflight_completed_at_utc"], "manifest.session.preflight_completed_at_utc"
    )
    if not (consent <= preflight <= started <= ended <= generated):
        _fail("manifest session timestamps are not chronologically ordered")
    if completed is not None and completed != ended:
        _fail("completed_at_utc must equal ended_at_utc for a completed bundle")
    for key in ("resume_count", "interrupted_presentation_count", "visibility_interruption_count"):
        _require_int(session[key], f"manifest.session.{key}")
    if _require_bool(session["preflight_audio_passed"], "manifest.session.preflight_audio_passed") is not True:
        _fail("manifest.session.preflight_audio_passed must be true")

    for key in ("studyId", "conditionId", "siteId", "distributionId"):
        value = study[key]
        if not isinstance(value, str) or not STUDY_CODE_PATTERN.fullmatch(value):
            _fail(f"manifest.study.{key} is invalid")
    for key in ("studyTitle", "institutionName"):
        _require_string(study[key], f"manifest.study.{key}", maximum=120)
    if not isinstance(study["consentVersion"], str) or not VERSION_PATTERN.fullmatch(study["consentVersion"]):
        _fail("manifest.study.consentVersion is invalid")
    _require_int(study["expectedMinutes"], "manifest.study.expectedMinutes", 1, 240)
    _require_https_url(study["consentUrl"], "manifest.study.consentUrl")
    _require_https_url(study["contactUrl"], "manifest.study.contactUrl")
    _require_https_url(
        study["returnUrl"],
        "manifest.study.returnUrl",
        empty=administration == "supervised",
    )

    expected_implementation = {
        "batteryVersion": BATTERY_VERSION,
        "trialSchemaVersion": TRIAL_SCHEMA_VERSION,
        "wideSchemaVersion": WIDE_SCHEMA_VERSION,
        "checkpointSchemaVersion": CHECKPOINT_SCHEMA_VERSION,
        "resultBundleSchemaVersion": RESULT_BUNDLE_SCHEMA_VERSION,
        "appBuildId": f"audio-discrimination-{BATTERY_VERSION}",
        "procedureScope": "study_profile_binds_adaptive_procedure_scoring_and_stimulus_set",
        "taskOrderMethod": "subject_id_seeded_shuffle",
        "reversalDefinition": "intended_nonzero_staircase_direction_change",
        "stimulusErrorPolicy": "fatal_no_substitution",
    }
    for key, expected in expected_implementation.items():
        if implementation[key] != expected:
            _fail(f"manifest.implementation.{key} does not match the frozen implementation")
    app_build_sha = _require_sha256(
        implementation["app_build_sha256"], "manifest.implementation.app_build_sha256"
    )
    app_script_sha = _require_sha256(
        implementation["app_script_sha256"], "manifest.implementation.app_script_sha256"
    )
    assets = _require_mapping(
        implementation["served_asset_sha256"], "manifest.implementation.served_asset_sha256"
    )
    _require_exact_keys(assets, BUILD_ASSET_NAMES, "manifest.implementation.served_asset_sha256")
    for asset in BUILD_ASSET_NAMES:
        _require_sha256(assets[asset], f"manifest.implementation.served_asset_sha256.{asset}")
    if assets["script.js"] != app_script_sha or assets["deployment-config.json"] != deployment["config_sha256"]:
        _fail("served asset hashes disagree with script or deployment configuration identity")
    descriptor = "\n".join(f"{asset}:{assets[asset]}" for asset in BUILD_ASSET_NAMES).encode()
    if hashlib.sha256(descriptor).hexdigest() != app_build_sha:
        _fail("app_build_sha256 does not match the served-asset descriptor")
    app_url = _require_https_url(
        implementation["app_url"],
        "manifest.implementation.app_url",
        allow_loopback_http=session_type == "test",
    )
    if f"{urlsplit(app_url).scheme}://{urlsplit(app_url).netloc}" != app_origin:
        _fail("manifest implementation app_url origin disagrees with deployment.app_origin")

    protocol_id = procedure["protocol_id"]
    profile = PROFILES.get(protocol_id)
    if profile is None:
        _fail("manifest.procedure.protocol_id is unsupported")
    if procedure["protocol_version"] != profile["version"]:
        _fail("manifest procedure protocol version is not bound to protocol_id")
    _require_string(procedure["protocol_citation"], "manifest.procedure.protocol_citation")
    selected = procedure["selected_task_ids"]
    order = procedure["task_order_ids"]
    if (
        not isinstance(selected, list)
        or not selected
        or any(type(task) is not str for task in selected)
        or len(set(selected)) != len(selected)
        or not set(selected).issubset(profile["available_tasks"])
    ):
        _fail("manifest.procedure.selected_task_ids is invalid for the protocol")
    if not isinstance(order, list) or len(order) != len(selected) or set(order) != set(selected):
        _fail("manifest.procedure.task_order_ids must be a permutation of selected_task_ids")
    if procedure["feedback_mode"] not in {"practice_only", "detailed"}:
        _fail("manifest.procedure.feedback_mode is invalid")

    binding = f"{profile['version']}__{profile['stimulus_set_id']}"
    provenance_expected = {
        "protocol_stimulus_binding_id": binding,
        "stimulus_catalog": "STIMULUS_CATALOG.json",
        "stimulus_catalog_schema_version": 1,
        "stimulus_set_id": profile["stimulus_set_id"],
        "stimulus_set_version": 1,
        "stimulus_set_kind": "transformed_official_distribution",
        "stimulus_claim": "reported_parameter_reconstruction_not_original_study_files",
        "stimulus_parameter_profile_id": profile["parameter_profile_id"],
        "stimulus_provenance_verification": "catalog_binding_and_manifest_validation_passed",
        "stimulus_validation_status": "passed",
        "stimulus_generator": "Praat",
        "stimulus_generator_version": "6.4.19",
        "stimulus_generator_script": "tools/reconstruct_stimuli.praat",
        "stimulus_standard_file_index": 1,
    }
    for key, expected in provenance_expected.items():
        if provenance[key] != expected:
            _fail(f"manifest.provenance.{key} does not match the frozen protocol/stimulus binding")
    for key in (
        "stimulus_catalog_sha256",
        "stimulus_manifest_sha256",
        "stimulus_set_sha256",
        "stimulus_parent_set_sha256",
        "stimulus_parent_source_archive_sha256",
        "stimulus_generator_script_sha256",
        "stimulus_parameters_sha256",
    ):
        _require_sha256(provenance[key], f"manifest.provenance.{key}")
    _require_sha256(
        provenance["stimulus_source_archive_sha256"],
        "manifest.provenance.stimulus_source_archive_sha256",
        empty=True,
    )
    if not isinstance(provenance["stimulus_audit_date"], str) or not DATE_PATTERN.fullmatch(
        provenance["stimulus_audit_date"]
    ):
        _fail("manifest.provenance.stimulus_audit_date is invalid")
    for key in MANIFEST_KEYS["provenance"]:
        if key in {
            "stimulus_catalog_schema_version", "stimulus_set_version", "stimulus_standard_file_index"
        } or key.endswith("sha256"):
            continue
        _require_string(
            provenance[key],
            f"manifest.provenance.{key}",
            empty=key in {"stimulus_license", "stimulus_source_archive_sha256"},
        )
    if not str(provenance["stimulus_manifest"]).endswith("/STIMULUS_MANIFEST.json"):
        _fail("manifest.provenance.stimulus_manifest is invalid")
    if provenance["stimulus_manifest"] != (
        f"stimulus_sets/{profile['stimulus_set_id']}/STIMULUS_MANIFEST.json"
    ):
        _fail("manifest.provenance.stimulus_manifest disagrees with stimulus_set_id")
    if provenance["stimulus_parameters_file"] != (
        f"stimulus_sets/{profile['stimulus_set_id']}/PARAMETERS.json"
    ):
        _fail("manifest.provenance.stimulus_parameters_file disagrees with stimulus_set_id")
    if provenance["stimulus_source_citation"] != procedure["protocol_citation"]:
        _fail("manifest protocol citation disagrees with stimulus provenance citation")

    return session, study, implementation, procedure, provenance, deployment, profile


def _validate_files(
    manifest: dict[str, Any], contents: dict[str, bytes], session: dict[str, Any], deployment: dict[str, Any]
) -> dict[str, str]:
    records = manifest["files"]
    if not isinstance(records, list) or len(records) != 2:
        _fail("manifest.files must contain exactly the trial and wide CSV records")
    kinds: dict[str, str] = {}
    declared: dict[str, str] = {}
    for index, raw in enumerate(records):
        record = _require_mapping(raw, f"manifest.files[{index}]")
        _require_exact_keys(record, MANIFEST_KEYS["file_record"], f"manifest.files[{index}]")
        name = record["name"]
        if not isinstance(name, str):
            _fail(f"manifest.files[{index}].name must be a string")
        _safe_member_name(name)
        match = CSV_NAME_PATTERN.fullmatch(name)
        if not match:
            _fail(f"manifest CSV filename does not follow the frozen naming contract: {name!r}")
        if match.group("subject") != session["subject_id"] or match.group("run") != session["session_run_id"]:
            _fail("manifest CSV filename identifiers disagree with manifest.session")
        if bool(match.group("test")) != (deployment["session_type"] == "test"):
            _fail("manifest CSV filename TEST_ONLY marker disagrees with session_type")
        kind = match.group("kind")
        if kind in kinds or name in declared:
            _fail("manifest.files contains a duplicate CSV kind or name")
        if record["media_type"] != "text/csv":
            _fail("manifest file media_type must be text/csv")
        kinds[kind] = name
        declared[name] = _require_sha256(record["sha256"], f"manifest.files[{index}].sha256")
    if tuple(kinds) != ("trials", "wide"):
        _fail("manifest.files must declare trials then wide in frozen order")
    if set(contents) != {MANIFEST_NAME, *declared}:
        _fail("ZIP members do not exactly match the files declared by the manifest")
    for name, digest in declared.items():
        if hashlib.sha256(contents[name]).hexdigest() != digest:
            _fail(f"SHA-256 mismatch for {name!r}")
    return kinds


def _common_expected(
    manifest: dict[str, Any], session: dict[str, Any], study: dict[str, Any],
    implementation: dict[str, Any], procedure: dict[str, Any], provenance: dict[str, Any],
    deployment: dict[str, Any], profile: dict[str, Any], wide: dict[str, str]
) -> dict[str, str]:
    expected = {
        "subject_id": session["subject_id"],
        "battery_version": BATTERY_VERSION,
        "session_run_id": session["session_run_id"],
        "administration_mode": manifest["administration_mode"],
        "session_type": deployment["session_type"],
        "deployment_id": deployment["deployment_id"],
        "deployment_environment": deployment["environment"],
        "deployment_config_schema_version": str(deployment["config_schema_version"]),
        "deployment_config_sha256": deployment["config_sha256"],
        "app_origin": deployment["app_origin"],
        "study_id": study["studyId"],
        "condition_id": study["conditionId"],
        "site_id": study["siteId"],
        "distribution_id": study["distributionId"],
        "study_title": _csv_safe_text(study["studyTitle"]),
        "institution_name": _csv_safe_text(study["institutionName"]),
        "consent_version": study["consentVersion"],
        "expected_minutes": str(study["expectedMinutes"]),
        "consent_url": study["consentUrl"],
        "contact_url": study["contactUrl"],
        "return_url": study["returnUrl"],
        "consent_confirmed_at_utc": session["consent_confirmed_at_utc"],
        "preflight_completed_at_utc": session["preflight_completed_at_utc"],
        "preflight_audio_passed": "1",
        "status_reason": session["status_reason"],
        "session_started_at_utc": session["started_at_utc"],
        "session_ended_at_utc": session["ended_at_utc"],
        "resume_count": str(session["resume_count"]),
        "interrupted_presentation_count": str(session["interrupted_presentation_count"]),
        "visibility_interruption_count": str(session["visibility_interruption_count"]),
        "app_build_id": implementation["appBuildId"],
        "app_build_sha256": implementation["app_build_sha256"],
        "app_script_sha256": implementation["app_script_sha256"],
        "app_url": implementation["app_url"],
        "protocol_id": procedure["protocol_id"],
        "protocol_version": procedure["protocol_version"],
        "protocol_citation": procedure["protocol_citation"],
        "procedure_scope": implementation["procedureScope"],
        "protocol_main_study_task_ids": "|".join(profile["main_study_tasks"]),
        "feedback_mode": procedure["feedback_mode"],
        "selected_task_ids": "|".join(procedure["selected_task_ids"]),
        "max_trials": str(profile["max_trials"]),
        "target_reversals": str(profile["target_reversals"]),
        "first_scored_reversal": str(profile["first_scored_reversal"]),
        "threshold_aggregation": "arithmetic_mean",
        "correct_responses_for_harder": str(profile["correct_responses_for_harder"]),
        "single_correct_before_first_incorrect": str(profile["single_correct_before_first_incorrect"]),
        "step_sizes": profile["step_sizes"],
        "reversal_definition": implementation["reversalDefinition"],
        "reversal_level_timing": profile["reversal_level_timing"],
        "task_order_method": implementation["taskOrderMethod"],
        "interstimulus_interval_ms": "500",
        "post_sequence_delay_ms": "500",
        "post_response_delay_ms": "1000",
        "practice_feedback": "correctness_and_correct_position",
        "practice_standard_file_index": "1",
        "practice_comparison_file_index": "100",
        "stimulus_error_policy": "fatal_no_substitution",
    }
    for key, value in provenance.items():
        expected[key] = str(value)
    source = wide["configuration_source"]
    if source not in {"researcher_ui", "participant_link"}:
        _fail("wide configuration_source is invalid")
    if (source == "participant_link") != (manifest["administration_mode"] == "remote_manual_upload"):
        _fail("configuration_source disagrees with administration_mode")
    expected["configuration_source"] = source
    if source == "participant_link":
        expected.update({
            "participant_link_schema_version": PARTICIPANT_LINK_SCHEMA_VERSION,
            "participant_link_validation_status": "passed",
        })
        if not wide["participant_link_config"]:
            _fail("participant_link sessions require participant_link_config")
        try:
            pairs = parse_qsl(
                wide["participant_link_config"],
                keep_blank_values=True,
                strict_parsing=True,
                max_num_fields=len(CODEBOOK["participant_link_parameters"]),
            )
        except ValueError as error:
            _fail(f"participant_link_config is not a valid canonical query string: {error}")
        if [name for name, _value in pairs] != CODEBOOK["participant_link_parameters"]:
            _fail("participant_link_config parameter names/order do not match link schema 3")
        link = dict(pairs)
        link_expected = {
            "mode": "participant",
            "link_version": PARTICIPANT_LINK_SCHEMA_VERSION,
            "battery_version": BATTERY_VERSION,
            "deployment_id": deployment["deployment_id"],
            "deployment_config_sha256": deployment["config_sha256"],
            "session_type": deployment["session_type"],
            "protocol": procedure["protocol_id"],
            "protocol_version": procedure["protocol_version"],
            "catalog_sha256": provenance["stimulus_catalog_sha256"],
            "stimulus_set": provenance["stimulus_set_id"],
            "manifest_sha256": provenance["stimulus_manifest_sha256"],
            "tasks": ",".join(procedure["selected_task_ids"]),
            "feedback": procedure["feedback_mode"],
            "lang": wide["configured_initial_language"],
            "study_id": study["studyId"],
            "condition_id": study["conditionId"],
            "site_id": study["siteId"],
            "distribution_id": study["distributionId"],
            "study_title": study["studyTitle"],
            "institution": study["institutionName"],
            "consent_version": study["consentVersion"],
            "expected_minutes": str(study["expectedMinutes"]),
            "consent_url": study["consentUrl"],
            "contact_url": study["contactUrl"],
            "return_url": study["returnUrl"],
        }
        for name, value in link_expected.items():
            if link[name] != value:
                _fail(f"participant_link_config {name} disagrees with manifest/CSV")
    else:
        expected.update({
            "participant_link_schema_version": "",
            "participant_link_validation_status": "not_applicable",
            "participant_link_config": "",
        })
    expected["participant_link_config"] = wide["participant_link_config"]
    if wide["configured_initial_language"] not in {"en", "ja"}:
        _fail("configured_initial_language is invalid")
    expected["configured_initial_language"] = wide["configured_initial_language"]
    for column in (
        "protocol_source_locator",
        "protocol_source_audit_status",
        "stimulus_compatibility",
    ):
        _require_string(wide[column], f"wide CSV {column}")
        expected[column] = wide[column]
    if wide["protocol_source_locator"] != provenance["stimulus_source_locator"]:
        _fail("wide protocol_source_locator disagrees with stimulus provenance")
    return expected


def _validate_trial_rows(
    trial: ParsedCsv, wide_row: dict[str, str], expected: dict[str, str], session: dict[str, Any],
    procedure: dict[str, Any], profile: dict[str, Any]
) -> dict[str, list[dict[str, str]]]:
    for column, value in expected.items():
        if column in trial.header:
            _same(trial.rows, column, value, trial.name)
    for column, value in (
        ("session_status", "in_progress"),
        ("session_final_status", session["status"]),
        ("schema_version", str(TRIAL_SCHEMA_VERSION)),
    ):
        _same(trial.rows, column, value, trial.name)

    by_task: dict[str, list[dict[str, str]]] = {task: [] for task in procedure["selected_task_ids"]}
    previous_pair = (0, 0)
    for offset, row in enumerate(trial.rows, start=2):
        label = f"{trial.name} row {offset}"
        task = row["task_id"]
        if task not in by_task:
            _fail(f"{label} task_id is not selected")
        task_order = _csv_int(row["task_order"], f"{label} task_order", 1, len(by_task))
        expected_order = procedure["task_order_ids"].index(task) + 1
        if task_order != expected_order:
            _fail(f"{label} task_order disagrees with manifest procedure order")
        trial_number = _csv_int(row["trial"], f"{label} trial", 1, profile["max_trials"])
        if (task_order, trial_number) <= previous_pair:
            _fail("trial rows must be ordered by task_order then trial")
        previous_pair = (task_order, trial_number)
        if trial_number != len(by_task[task]) + 1:
            _fail(f"{label} trial numbers must be contiguous from 1 within each task")
        prior_reversals = (
            int(by_task[task][-1]["num_reversals_after"])
            if by_task[task]
            else 0
        )
        by_task[task].append(row)

        for column in (
            "stimulus_substituted", "correct", "is_reversal", "task_in_source_main_study",
            "single_correct_before_first_incorrect", "replayed_interrupted_presentation",
            "threshold_available", "target_reversals_reached",
        ):
            _csv_bit(row[column], f"{label} {column}", empty=column in {"threshold_available", "target_reversals_reached"})
        if row["stimulus_substituted"] != "0":
            _fail(f"{label} violates fatal_no_substitution")
        for level_column, file_column in (
            ("stimulus_step", "stimulus_file_index"),
            ("stimulus_requested_step", "stimulus_requested_file_index"),
            ("step_before", "file_index_before"),
            ("step_after", "file_index_after"),
        ):
            level = _csv_number(row[level_column], f"{label} {level_column}")
            file_index = _csv_int(row[file_column], f"{label} {file_column}", 1, 101)
            if not math.isclose(float(level), file_index - 1, abs_tol=1e-9):
                _fail(f"{label} {file_column} must equal published {level_column} + 1")
        if row["stimulus_step"] != row["stimulus_requested_step"] or row["stimulus_file_index"] != row["stimulus_requested_file_index"]:
            _fail(f"{label} substituted a requested stimulus despite fatal_no_substitution")
        if row["step_before"] != row["stimulus_requested_step"] or row["file_index_before"] != row["stimulus_requested_file_index"]:
            _fail(f"{label} staircase before-state disagrees with requested stimulus")
        correct_answer = _csv_int(row["correct_answer"], f"{label} correct_answer", 1, 3)
        response = _csv_int(row["response"], f"{label} response", 1, 3)
        _csv_int(row["odd_position"], f"{label} odd_position", 1, 3)
        if int(row["correct"]) != int(response == correct_answer):
            _fail(f"{label} correct flag disagrees with response and correct_answer")
        _csv_number(row["rt_ms"], f"{label} rt_ms")
        reversals_after = _csv_int(
            row["num_reversals_after"],
            f"{label} num_reversals_after",
            0,
            profile["target_reversals"],
        )
        if reversals_after != prior_reversals + int(row["is_reversal"]):
            _fail(f"{label} num_reversals_after disagrees with is_reversal history")
        step_size = _csv_number(row["step_size_used"], f"{label} step_size_used")
        permitted_steps = {0.0, *(float(value) for value in profile["step_sizes"].split("|"))}
        if float(step_size) not in permitted_steps:
            _fail(f"{label} step_size_used is not a configured staircase step")
        if row["step_direction"] not in {"harder", "easier", "hold"}:
            _fail(f"{label} step_direction is invalid")
        if (row["step_direction"] == "hold") != (float(step_size) == 0):
            _fail(f"{label} step_direction disagrees with step_size_used")
        before_level = float(row["step_before"])
        after_level = float(row["step_after"])
        if (
            (row["step_direction"] == "hold" and after_level != before_level)
            or (row["step_direction"] == "harder" and after_level > before_level)
            or (row["step_direction"] == "easier" and after_level < before_level)
        ):
            _fail(f"{label} step_direction disagrees with staircase levels")
        if row["step_direction"] != "hold":
            configured_steps = [float(value) for value in profile["step_sizes"].split("|")]
            expected_step = configured_steps[min(reversals_after, len(configured_steps) - 1)]
            if float(step_size) != expected_step:
                _fail(f"{label} step_size_used disagrees with reversal-indexed protocol step")
        reversal_number = (
            None
            if row["reversal_number"] == ""
            else _csv_int(
                row["reversal_number"],
                f"{label} reversal_number",
                1,
                profile["target_reversals"],
            )
        )
        reversal_level = _csv_number(
            row["reversal_level"], f"{label} reversal_level", empty=True
        )
        if row["is_reversal"] == "1":
            if reversal_number is None or reversal_level is None:
                _fail(f"{label} reversal fields are required when is_reversal=1")
            if reversal_number != int(row["num_reversals_after"]):
                _fail(f"{label} reversal_number disagrees with num_reversals_after")
        elif reversal_number is not None or reversal_level is not None:
            _fail(f"{label} reversal fields must be blank when is_reversal=0")
        _csv_number(row["mean_reversal_so_far"], f"{label} mean_reversal_so_far", empty=True)
        threshold = _csv_number(row["threshold_estimate"], f"{label} threshold_estimate", empty=True)
        physical = _csv_number(row["threshold_physical_value"], f"{label} threshold_physical_value", empty=True)
        if (threshold is None) != (physical is None):
            _fail(f"{label} threshold estimate and physical value must be jointly present")
        if threshold is not None:
            factor = TASK_SPECS[task]["physical_per_level"]
            rounding_tolerance = 0.005 * (factor + 1) + 1e-6
            if not math.isclose(
                float(physical), threshold * factor, abs_tol=rounding_tolerance
            ):
                _fail(f"{label} threshold physical value is inconsistent with published level")
        if row["threshold_unit"] != TASK_SPECS[task]["threshold_unit"]:
            _fail(f"{label} threshold_unit is invalid for task")
        expected_main = "1" if task in profile["main_study_tasks"] else "0"
        if row["task_in_source_main_study"] != expected_main:
            _fail(f"{label} task_in_source_main_study disagrees with protocol")
        if row["stimulus_task_sha256"] != wide_row[f"{task}_stimulus_task_sha256"] or row["stimulus_task_transformation"] != wide_row[f"{task}_stimulus_task_transformation"]:
            _fail(f"{label} task stimulus identity disagrees with wide CSV")
        _require_sha256(row["stimulus_task_sha256"], f"{label} stimulus_task_sha256")
        _parse_utc(row["task_started_at_utc"], f"{label} task_started_at_utc")
        _parse_utc(row["task_completed_at_utc"], f"{label} task_completed_at_utc", empty=True)
    return by_task


def _validate_wide_tasks(
    wide: dict[str, str], by_task: dict[str, list[dict[str, str]]], session: dict[str, Any],
    procedure: dict[str, Any], profile: dict[str, Any]
) -> None:
    selected = set(procedure["selected_task_ids"])
    summary_suffixes = TASK_COLUMNS[5:]
    seen_orders: set[int] = set()
    for task in TASK_IDS:
        prefix = f"{task}_"
        is_selected = task in selected
        if _csv_bit(wide[prefix + "selected"], prefix + "selected") != int(is_selected):
            _fail(f"wide {prefix}selected disagrees with manifest procedure")
        expected_main = "1" if task in profile["main_study_tasks"] else "0"
        if wide[prefix + "in_source_main_study"] != expected_main:
            _fail(f"wide {prefix}in_source_main_study disagrees with protocol")
        _require_string(wide[prefix + "stimulus_compatibility"], f"wide {prefix}stimulus_compatibility")
        task_hash = wide[prefix + "stimulus_task_sha256"]
        transformation = wide[prefix + "stimulus_task_transformation"]
        available = task in profile["available_tasks"]
        if available:
            _require_sha256(task_hash, f"wide {prefix}stimulus_task_sha256")
            _require_string(transformation, f"wide {prefix}stimulus_task_transformation")
        elif task_hash or transformation:
            _fail(f"wide {prefix}stimulus identity must be blank for an unavailable task")
        if is_selected and not available:
            _fail(f"wide selects protocol-unavailable task {task}")

        rows = by_task.get(task, [])
        order_value = wide[prefix + "task_order"]
        has_summary = order_value != ""
        if not is_selected and any(wide[prefix + suffix] for suffix in summary_suffixes):
            _fail(f"wide unselected task {task} has task-summary values")
        if session["status"] == "completed" and is_selected and not has_summary:
            _fail(f"completed bundle is missing wide summary for selected task {task}")
        if not has_summary:
            if any(wide[prefix + suffix] for suffix in summary_suffixes):
                _fail(f"wide task {task} has a partial summary without task_order")
            if rows and any(row["termination_reason"] for row in rows):
                _fail(f"trial rows claim task completion but wide summary is absent for {task}")
            continue
        order = _csv_int(order_value, f"wide {prefix}task_order", 1, len(selected))
        if order != procedure["task_order_ids"].index(task) + 1 or order in seen_orders:
            _fail(f"wide {prefix}task_order disagrees with manifest or duplicates another task")
        seen_orders.add(order)
        if not rows:
            _fail(f"wide task {task} summary has no trial rows")
        trials = _csv_int(wide[prefix + "trials_completed"], f"wide {prefix}trials_completed", 1, profile["max_trials"])
        if trials != len(rows):
            _fail(f"wide {prefix}trials_completed disagrees with trial row count")
        reversals = _csv_int(wide[prefix + "reversals_completed"], f"wide {prefix}reversals_completed", 0, profile["target_reversals"])
        if reversals != max(int(row["num_reversals_after"]) for row in rows):
            _fail(f"wide {prefix}reversals_completed disagrees with trial rows")
        scored = _csv_int(wide[prefix + "scored_reversal_count"], f"wide {prefix}scored_reversal_count", 0, profile["target_reversals"])
        reversal_levels = wide[prefix + "reversal_levels_used"]
        levels = [] if reversal_levels == "" else reversal_levels.split("|")
        if len(levels) != scored:
            _fail(f"wide {prefix}scored_reversal_count disagrees with reversal_levels_used")
        for index, value in enumerate(levels):
            _csv_number(value, f"wide {prefix}reversal_levels_used[{index}]")
        available_bit = _csv_bit(wide[prefix + "threshold_available"], f"wide {prefix}threshold_available")
        if available_bit != int(scored > 0):
            _fail(f"wide {prefix}threshold_available disagrees with scored reversals")
        target_bit = _csv_bit(wide[prefix + "target_reversals_reached"], f"wide {prefix}target_reversals_reached")
        if target_bit != int(reversals >= profile["target_reversals"]):
            _fail(f"wide {prefix}target_reversals_reached disagrees with reversal count")
        termination = wide[prefix + "termination_reason"]
        if termination == "target_reversals":
            if target_bit != 1:
                _fail(f"wide {prefix}termination_reason target_reversals is impossible")
        elif termination == "max_trials":
            if trials != profile["max_trials"] or target_bit != 0:
                _fail(f"wide {prefix}termination_reason max_trials is impossible")
        else:
            _fail(f"wide {prefix}termination_reason is invalid")
        threshold = _csv_number(wide[prefix + "threshold_level"], f"wide {prefix}threshold_level", empty=True)
        file_index = _csv_number(wide[prefix + "threshold_file_index"], f"wide {prefix}threshold_file_index", empty=True)
        physical = _csv_number(wide[prefix + "threshold_physical_value"], f"wide {prefix}threshold_physical_value", empty=True)
        if available_bit:
            if threshold is None or file_index is None or physical is None:
                _fail(f"wide {prefix}threshold values are required when available")
            if not math.isclose(file_index, threshold + 1, abs_tol=0.011):
                _fail(f"wide {prefix}threshold_file_index must equal published level + 1")
            factor = TASK_SPECS[task]["physical_per_level"]
            rounding_tolerance = 0.005 * (factor + 1) + 1e-6
            if not math.isclose(
                physical, threshold * factor, abs_tol=rounding_tolerance
            ):
                _fail(f"wide {prefix}threshold physical value is inconsistent")
            if wide[prefix + "threshold_unit"] != TASK_SPECS[task]["threshold_unit"]:
                _fail(f"wide {prefix}threshold_unit is invalid")
        elif any((wide[prefix + "threshold_level"], wide[prefix + "threshold_file_index"], wide[prefix + "threshold_physical_value"])):
            _fail(f"wide {prefix}threshold values must be blank when unavailable")
        elif wide[prefix + "threshold_unit"] != TASK_SPECS[task]["threshold_unit"]:
            _fail(f"wide {prefix}threshold_unit is invalid")
        _csv_number(wide[prefix + "median_rt_ms"], f"wide {prefix}median_rt_ms")
        _csv_int(wide[prefix + "practice_correct_count"], f"wide {prefix}practice_correct_count", 0, 5)
        substitutions = _csv_int(wide[prefix + "stimulus_substitution_count"], f"wide {prefix}stimulus_substitution_count")
        if substitutions != 0 or any(row["stimulus_substituted"] != "0" for row in rows):
            _fail(f"wide {prefix}stimulus substitution violates fatal_no_substitution")
        started = _parse_utc(wide[prefix + "started_at_utc"], f"wide {prefix}started_at_utc")
        completed = _parse_utc(wide[prefix + "completed_at_utc"], f"wide {prefix}completed_at_utc")
        if started > completed:
            _fail(f"wide {prefix}task timestamps are reversed")
        for row in rows:
            if row["task_started_at_utc"] != wide[prefix + "started_at_utc"] or row["task_completed_at_utc"] != wide[prefix + "completed_at_utc"]:
                _fail(f"trial and wide task timestamps disagree for {task}")
            for column in ("termination_reason", "scored_reversal_count", "reversal_levels_used", "threshold_available", "target_reversals_reached"):
                if row[column] != wide[prefix + column]:
                    _fail(f"trial and wide task summary {column} disagree for {task}")
    if session["status"] == "completed" and seen_orders != set(range(1, len(selected) + 1)):
        _fail("completed bundle does not summarize every selected task order")


def validate_bundle(path: str | Path) -> ValidationReport:
    """Validate one result ZIP and return its trusted joining identifiers."""

    archive_path = Path(path)
    try:
        archive_size = archive_path.stat().st_size
    except OSError as error:
        _fail(f"could not stat result bundle {archive_path}: {error}")
    if archive_size <= 0 or archive_size > MAX_ARCHIVE_BYTES:
        _fail(f"result bundle size must be between 1 and {MAX_ARCHIVE_BYTES} bytes")
    try:
        archive = zipfile.ZipFile(archive_path, "r")
    except (OSError, zipfile.BadZipFile) as error:
        _fail(f"not a readable ZIP archive: {error}")
    with archive:
        if archive.comment:
            _fail("result ZIP must not contain an archive comment")
        infos = archive.infolist()
        if len(infos) != 3:
            _fail(f"result ZIP must contain exactly 3 members; found {len(infos)}")
        names = [info.filename for info in infos]
        if len(set(names)) != len(names):
            _fail("result ZIP contains duplicate member names")
        for info in infos:
            _validate_zip_info(info)
        if sum(info.file_size for info in infos) > MAX_ARCHIVE_BYTES:
            _fail("uncompressed result ZIP contents exceed the total size limit")
        if MANIFEST_NAME not in names:
            _fail(f"result ZIP is missing {MANIFEST_NAME}")
        by_name = {info.filename: info for info in infos}
        if by_name[MANIFEST_NAME].file_size > MAX_MANIFEST_BYTES:
            _fail(f"{MANIFEST_NAME} exceeds the manifest size limit")
        contents = {name: _read_member(archive, info) for name, info in by_name.items()}

    manifest = _parse_manifest(contents[MANIFEST_NAME])
    session, study, implementation, procedure, provenance, deployment, profile = _validate_manifest(manifest)
    kinds = _validate_files(manifest, contents, session, deployment)
    trial = _parse_csv(kinds["trials"], contents[kinds["trials"]], TRIAL_HEADER)
    wide = _parse_csv(kinds["wide"], contents[kinds["wide"]], WIDE_HEADER)
    if session["status"] == "completed" and not trial.rows:
        _fail("completed bundles require at least one trial CSV data row")
    if len(wide.rows) != 1:
        _fail(f"wide CSV must contain exactly one data row; found {len(wide.rows)}")
    wide_row = wide.rows[0]
    expected = _common_expected(
        manifest, session, study, implementation, procedure, provenance, deployment, profile, wide_row
    )
    for column, value in expected.items():
        if column in wide.header and wide_row[column] != value:
            _fail(f"wide CSV {column} does not match the frozen bundle contract")
    wide_expected = {
        "wide_schema_version": str(WIDE_SCHEMA_VERSION),
        "session_status": session["status"],
        "completed": "1" if session["status"] == "completed" else "0",
        "completed_at_utc": session["completed_at_utc"],
        "task_order": "|".join(procedure["task_order_ids"]),
        "practice_trials_per_task": "5",
        "stimulus_scale": "published_level_0_100",
    }
    for column, value in wide_expected.items():
        if wide_row[column] != value:
            _fail(f"wide CSV {column} does not match manifest/procedure")
    for language_column in ("ui_language_at_start", "ui_language_at_completion"):
        if wide_row[language_column] not in {"en", "ja", ""}:
            _fail(f"wide CSV {language_column} is invalid")
    languages = [value for value in wide_row["ui_languages_used"].split("|") if value]
    if (
        (session["status"] == "completed" and not languages)
        or any(value not in {"en", "ja"} for value in languages)
    ):
        _fail("wide CSV ui_languages_used is invalid")

    by_task = _validate_trial_rows(trial, wide_row, expected, session, procedure, profile)
    _validate_wide_tasks(wide_row, by_task, session, procedure, profile)

    return ValidationReport(
        archive=archive_path,
        subject_id=session["subject_id"],
        session_run_id=session["session_run_id"],
        status=session["status"],
        trial_rows=len(trial.rows),
        wide_rows=len(wide.rows),
        app_build_sha256=implementation["app_build_sha256"],
        app_script_sha256=implementation["app_script_sha256"],
    )


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate an Audio Discrimination result ZIP before analysis or ingestion."
    )
    parser.add_argument("bundle", type=Path, help="path to one *_results.zip bundle")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    try:
        report = validate_bundle(args.bundle)
    except BundleValidationError as error:
        print(f"INVALID: {error}", file=sys.stderr)
        return 2
    print(
        "VALID: "
        f"subject={report.subject_id} run={report.session_run_id} status={report.status} "
        f"trial_rows={report.trial_rows} wide_rows={report.wide_rows}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
