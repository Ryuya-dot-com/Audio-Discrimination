#!/usr/bin/env python3
"""Fail CI when script.js result objects drift from RESULT_CODEBOOK.json."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import NoReturn


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "script.js"
DEPLOYMENT_POLICY_PATH = ROOT / "deployment_policy.js"
CODEBOOK_PATH = ROOT / "RESULT_CODEBOOK.json"


def fail(message: str) -> NoReturn:
    raise SystemExit(f"Result schema contract verification failed: {message}")


def match_group(source: str, pattern: str, label: str) -> str:
    match = re.search(pattern, source, re.DOTALL | re.MULTILINE)
    if not match:
        fail(f"could not locate {label} in script.js")
    return match.group(1)


def line_keys(block: str, indent: int = 4) -> list[str]:
    pattern = re.compile(rf"\s{{{indent}}}([A-Za-z0-9_]+):")
    keys: list[str] = []
    for line in block.splitlines():
        match = pattern.match(line)
        if match:
            keys.append(match.group(1))
    return keys


def object_line_keys(block: str, indent: int = 4) -> list[str]:
    """Read one-property-per-line object keys, including JS shorthand fields."""
    explicit = re.compile(rf"\s{{{indent}}}([A-Za-z0-9_]+):")
    shorthand = re.compile(rf"\s{{{indent}}}([A-Za-z0-9_]+),?\s*$")
    keys: list[str] = []
    for line in block.splitlines():
        match = explicit.match(line) or shorthand.match(line)
        if match:
            keys.append(match.group(1))
    return keys


def assert_equal(actual: object, expected: object, label: str) -> None:
    if actual != expected:
        fail(f"{label} drifted\nexpected={expected!r}\nactual={actual!r}")


def main() -> int:
    try:
        codebook = json.loads(CODEBOOK_PATH.read_text(encoding="utf-8"))
        source = SCRIPT_PATH.read_text(encoding="utf-8")
        deployment_policy_source = DEPLOYMENT_POLICY_PATH.read_text(encoding="utf-8")
    except (OSError, json.JSONDecodeError) as error:
        fail(str(error))

    implementation_block = match_group(
        source,
        r"const IMPLEMENTATION = Object\.freeze\(\{(.*?)\n\}\);",
        "IMPLEMENTATION",
    )
    implementation: dict[str, str | int] = {}
    for match in re.finditer(
        r"^\s{2}([A-Za-z0-9_]+):\s*(?:'([^']*)'|(\d+)),?$",
        implementation_block,
        re.MULTILINE,
    ):
        implementation[match.group(1)] = (
            match.group(2) if match.group(2) is not None else int(match.group(3))
        )
    expected_implementation = {
        "batteryVersion": codebook["battery_version"],
        "trialSchemaVersion": max(int(value) for value in codebook["csv_schemas"]["trial"]),
        "wideSchemaVersion": max(int(value) for value in codebook["csv_schemas"]["wide"]),
        "checkpointSchemaVersion": codebook["checkpoint_schema_version"],
        "resultBundleSchemaVersion": codebook["result_bundle_schema_version"],
        "appBuildId": f"audio-discrimination-{codebook['battery_version']}",
        "procedureScope": "study_profile_binds_adaptive_procedure_scoring_and_stimulus_set",
        "taskOrderMethod": "subject_id_seeded_shuffle",
        "reversalDefinition": "intended_nonzero_staircase_direction_change",
        "stimulusErrorPolicy": "fatal_no_substitution",
    }
    assert_equal(implementation, expected_implementation, "IMPLEMENTATION values")

    link_version = match_group(
        source,
        r"const PARTICIPANT_LINK = Object\.freeze\(\{.*?schemaVersion:\s*'([^']+)'",
        "participant link schema version",
    )
    assert_equal(link_version, codebook["participant_link_schema_version"], "participant link version")
    signed_links = match_group(
        deployment_policy_source,
        r"const SIGNED_PARTICIPANT_LINKS_SUPPORTED = (true|false);",
        "signed participant-link support gate",
    ) == "true"
    assert_equal(
        signed_links,
        codebook["signed_participant_links_supported"],
        "signed participant-link support gate",
    )
    if signed_links:
        fail("schema 3 cannot enable signed participant links without a new validator contract")
    unsigned_remote_links = match_group(
        deployment_policy_source,
        r"const UNSIGNED_REMOTE_PARTICIPANT_LINKS_SUPPORTED = (true|false);",
        "unsigned remote participant-link support gate",
    ) == "true"
    assert_equal(
        unsigned_remote_links,
        codebook["unsigned_remote_participant_links_supported"],
        "unsigned remote participant-link support gate",
    )
    link_parameters = re.findall(
        r"'([^']+)'",
        match_group(
            source,
            r"parameterNames:\s*Object\.freeze\(\[(.*?)\]\)",
            "participant link parameter names",
        ),
    )
    assert_equal(
        link_parameters,
        codebook["participant_link_parameters"],
        "participant link parameter names/order",
    )

    trial_version = str(expected_implementation["trialSchemaVersion"])
    trial_header_block = match_group(
        source,
        r"function buildTrialCsv\(\) \{\s*const header = \[(.*?)\n  \];",
        "trial header",
    )
    trial_header = re.findall(r"'([^']+)'", trial_header_block)
    expected_trial_header = codebook["csv_schemas"]["trial"][trial_version]["columns"]
    assert_equal(trial_header, expected_trial_header, "trial header names/order")

    provenance_block = match_group(
        source,
        r"function stimulusProvenance\(task = null\) \{.*?const provenance = \{(.*?)\n  \};",
        "stimulus provenance object",
    )
    provenance_keys = line_keys(provenance_block)
    assert_equal(
        provenance_keys,
        codebook["manifest_keys"]["provenance"],
        "stimulus provenance object keys/order",
    )

    trial_object_block = match_group(
        source,
        r"currentResults\.push\(\{(.*?)\n  \}\);",
        "trial row object",
    )
    trial_object_keys: list[str] = []
    for line in trial_object_block.splitlines():
        match = re.match(r"\s{4}([A-Za-z0-9_]+):", line)
        if match:
            trial_object_keys.append(match.group(1))
        elif "...stimulusProvenance(currentTask)" in line:
            trial_object_keys.extend(provenance_keys)
            trial_object_keys.extend(["stimulus_task_sha256", "stimulus_task_transformation"])
    late_bound = ["session_final_status", "task_completed_at_utc"]
    assert_equal(
        set(trial_object_keys) | set(late_bound),
        set(expected_trial_header),
        "trial row/header object-key set",
    )
    if len(trial_object_keys) != len(set(trial_object_keys)):
        fail("trial row object contains duplicate keys")
    for pattern, label in (
        (r"session_final_status:\s*sessionStatus", "session_final_status export binding"),
        (r"row\.task_completed_at_utc\s*=\s*taskCompletedAt", "task_completed_at_utc binding"),
    ):
        if not re.search(pattern, source):
            fail(f"missing {label}")

    wide_version = str(expected_implementation["wideSchemaVersion"])
    wide_object_block = match_group(
        source,
        r"function buildWideResult\(\) \{\s*const row = \{(.*?)\n  \};",
        "wide row object",
    )
    wide_base_keys: list[str] = []
    for line in wide_object_block.splitlines():
        match = re.match(r"\s{4}([A-Za-z0-9_]+):", line)
        if match:
            wide_base_keys.append(match.group(1))
        elif "...stimulusProvenance()" in line:
            wide_base_keys.extend(provenance_keys)
    wide_spec = codebook["csv_schemas"]["wide"][wide_version]
    assert_equal(wide_base_keys, wide_spec["base_columns"], "wide base object keys/order")

    task_ids_block = match_group(source, r"const TASKS = \[(.*?)\n\];", "TASKS")
    task_ids = re.findall(r"^\s{4}id:\s*'([^']+)'", task_ids_block, re.MULTILINE)
    assert_equal(task_ids, wide_spec["task_order"], "wide task expansion order")
    task_contract = {
        match.group(1): {
            "threshold_unit": match.group(3),
            "physical_per_level": float(match.group(2)),
        }
        for match in re.finditer(
            r"^\s{4}id:\s*'([^']+)'.*?^\s{4}levelSize:\s*([0-9.]+),.*?"
            r"^\s{4}thresholdUnit:\s*'([^']+)'",
            task_ids_block,
            re.MULTILINE | re.DOTALL,
        )
    }
    assert_equal(task_contract, codebook["tasks"], "task units/physical level factors")

    for protocol_id, expected_profile in codebook["protocols"].items():
        profile_block = match_group(
            source,
            rf"^\s{{2}}{re.escape(protocol_id)}:\s*\{{(.*?)^\s{{2}}\}}(?:,|$)",
            f"protocol profile {protocol_id}",
        )
        stimulus_set_id = match_group(
            profile_block,
            r"stimulusSetId:\s*'([^']+)'",
            f"{protocol_id} stimulusSetId",
        )
        set_block = match_group(
            source,
            rf"^\s{{2}}'{re.escape(stimulus_set_id)}':\s*\{{(.*?)^\s{{2}}\}}(?:,|$)",
            f"stimulus set {stimulus_set_id}",
        )
        observed_profile = {
            "version": match_group(profile_block, r"version:\s*'([^']+)'", "protocol version"),
            "stimulus_set_id": stimulus_set_id,
            "parameter_profile_id": match_group(
                set_block,
                r"parameterProfileId:\s*'([^']+)'",
                "parameter profile",
            ),
            "main_study_tasks": re.findall(
                r"'([^']+)'",
                match_group(
                    profile_block,
                    r"mainStudyTaskIds:\s*\[(.*?)\]",
                    "main-study tasks",
                ),
            ),
            "available_tasks": re.findall(
                r"^\s{6}(duration|formant|pitch|risetime):\s*\{",
                set_block,
                re.MULTILINE,
            ),
            "max_trials": int(match_group(profile_block, r"maxTrials:\s*(\d+)", "maxTrials")),
            "target_reversals": int(match_group(profile_block, r"targetReversals:\s*(\d+)", "targetReversals")),
            "first_scored_reversal": int(match_group(profile_block, r"firstScoredReversal:\s*(\d+)", "firstScoredReversal")),
            "correct_responses_for_harder": int(match_group(profile_block, r"correctResponsesForHarder:\s*(\d+)", "correctResponsesForHarder")),
            "single_correct_before_first_incorrect": 1 if match_group(
                profile_block,
                r"singleCorrectBeforeFirstIncorrect:\s*(true|false)",
                "singleCorrectBeforeFirstIncorrect",
            ) == "true" else 0,
            "step_sizes": "|".join(re.findall(
                r"\d+",
                match_group(profile_block, r"stepSizes:\s*\[(.*?)\]", "stepSizes"),
            )),
            "reversal_level_timing": match_group(
                profile_block,
                r"reversalLevelTiming:\s*'([^']+)'",
                "reversalLevelTiming",
            ),
        }
        assert_equal(observed_profile, expected_profile, f"protocol profile {protocol_id}")
    task_loop = match_group(
        source,
        r"TASKS\.forEach\(task => \{(.*?)\n  \}\);\n  return row;",
        "wide task-column loop",
    )
    suffixes = re.findall(r"row\[`\$\{task\.id\}_([^`]+)`\]", task_loop)
    assert_equal(suffixes, wide_spec["task_columns"], "wide task columns/order")

    manifest_block = match_group(
        source,
        r"const manifest = \{(.*?)\n  \};\n  const manifestText",
        "result manifest object",
    )
    manifest_top = line_keys(manifest_block)
    assert_equal(manifest_top, codebook["manifest_keys"]["top_level"], "manifest top-level keys/order")
    nested_patterns = {
        "deployment": r"deployment:\s*\{(.*?)\n    \},",
        "session": r"session:\s*\{(.*?)\n    \},",
        "procedure": r"procedure:\s*\{(.*?)\n    \},",
    }
    for label, pattern in nested_patterns.items():
        block = match_group(manifest_block, pattern, f"manifest {label}")
        assert_equal(
            line_keys(block, indent=6),
            codebook["manifest_keys"][label],
            f"manifest {label} keys/order",
        )
    implementation_runtime = line_keys(
        match_group(manifest_block, r"implementation:\s*\{(.*?)\n    \},", "manifest implementation"),
        indent=6,
    )
    implementation_base = list(expected_implementation)
    assert_equal(
        implementation_base + implementation_runtime,
        codebook["manifest_keys"]["implementation"],
        "manifest implementation keys/order",
    )
    study_return = match_group(
        source,
        r"function validateStudyMetadata\(.*?return Object\.freeze\(\{(.*?)\n  \}\);\n\}",
        "validated study object",
    )
    assert_equal(
        object_line_keys(study_return),
        codebook["manifest_keys"]["study"],
        "manifest study spread keys/order",
    )
    file_keys = re.findall(
        r"\{\s*name:\s*(?:trialFilename|wideFilename),\s*media_type:\s*'text/csv',\s*sha256:\s*(?:trialSha256|wideSha256)\s*\}",
        manifest_block,
    )
    if len(file_keys) != 2:
        fail("manifest files object no longer has exactly two frozen records")

    print(
        "Result schema contract verified: "
        f"trial={trial_version}/{len(trial_header)} columns, "
        f"wide={wide_version}/{len(wide_base_keys) + len(task_ids) * len(suffixes)} columns, "
        f"bundle={codebook['result_bundle_schema_version']}."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
