#!/usr/bin/env python3
"""Fail-closed verification of the runtime stimulus registry and its files.

The verifier is read-only and uses only the Python standard library.  It joins
four independently maintained representations of the runtime contract:

* ``STIMULUS_CATALOG.json`` protocol bindings;
* each bound derivative set's manifest, parameters, checksums, and FLAC bytes;
* the static ``STIMULUS_CATALOG`` and ``STIMULUS_SETS`` literals in ``script.js``;
* the protocol presets and exported-data version constants in ``script.js``.

Any missing, extra, dynamic, or inconsistent registry value is an error.  In
particular, the official legacy distribution may remain in the JSON catalog but
must not be selectable through the runtime registry.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
from pathlib import Path
import re
import sys
from typing import Any


EXPECTED_BINDINGS = {
    "kachlicka2019": "kachlicka2019-reconstruction-v1",
    "saitoTierney2024": "saito-tierney2024-reconstruction-v1",
    "sun2021": "sun2021-reconstruction-v1",
}
EXPECTED_TASKS = {
    "kachlicka2019": ("pitch", "formant", "duration", "risetime"),
    "saitoTierney2024": ("pitch", "formant", "duration"),
    "sun2021": ("pitch", "formant", "duration", "risetime"),
}
EXPECTED_IMPLEMENTATION_VERSIONS = {
    "batteryVersion": "5.0.0",
    "trialSchemaVersion": 7,
    "wideSchemaVersion": 5,
}
LEGACY_SET_ID = "saito-tierney-offline-osf-6p8hv-e8ebb0a5"
KNOWN_TASKS = ("pitch", "formant", "duration", "risetime")
SHA256_PATTERN = re.compile(r"[0-9a-f]{64}\Z")


class VerificationFailure(RuntimeError):
    """A deterministic verification failure suitable for concise CLI output."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise VerificationFailure(message)


def require_equal(actual: Any, expected: Any, label: str) -> None:
    require(
        type(actual) is type(expected) and actual == expected,
        f"{label}: expected {expected!r}, found {actual!r}",
    )


def require_mapping(value: Any, label: str) -> dict[str, Any]:
    require(isinstance(value, dict), f"{label}: expected an object")
    return value


def require_list(value: Any, label: str) -> list[Any]:
    require(isinstance(value, list), f"{label}: expected an array")
    return value


def require_keys(value: dict[str, Any], keys: set[str], label: str) -> None:
    actual = set(value)
    require(
        actual == keys,
        f"{label}: key mismatch; missing={sorted(keys - actual)}, "
        f"extra={sorted(actual - keys)}",
    )


def require_sha256(value: Any, label: str) -> str:
    require(
        isinstance(value, str) and SHA256_PATTERN.fullmatch(value) is not None,
        f"{label}: expected a lowercase SHA-256 hex digest",
    )
    return value


def unique_json_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise VerificationFailure(f"JSON duplicate key: {key!r}")
        result[key] = value
    return result


def load_json(path: Path) -> dict[str, Any]:
    require(path.is_file(), f"missing JSON file: {path}")
    try:
        value = json.loads(
            path.read_text(encoding="utf-8"), object_pairs_hook=unique_json_object
        )
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise VerificationFailure(f"cannot read strict JSON {path}: {exc}") from exc
    return require_mapping(value, str(path))


def sha256_bytes(path: Path) -> bytes:
    require(path.is_file(), f"missing file: {path}")
    digest = hashlib.sha256()
    try:
        with path.open("rb") as source:
            for chunk in iter(lambda: source.read(1024 * 1024), b""):
                digest.update(chunk)
    except OSError as exc:
        raise VerificationFailure(f"cannot hash {path}: {exc}") from exc
    return digest.digest()


def sha256_hex(path: Path) -> str:
    return sha256_bytes(path).hex()


def resolve_relative(base: Path, relative: Any, label: str) -> Path:
    require(isinstance(relative, str) and relative, f"{label}: invalid path")
    candidate = Path(relative)
    require(not candidate.is_absolute(), f"{label}: absolute paths are forbidden")
    require(".." not in candidate.parts, f"{label}: parent traversal is forbidden")
    base_resolved = base.resolve()
    resolved = (base / candidate).resolve()
    try:
        resolved.relative_to(base_resolved)
    except ValueError as exc:
        raise VerificationFailure(f"{label}: path escapes {base}") from exc
    return resolved


class JavaScriptLiteralParser:
    """Parse the deliberately static JavaScript-literal subset used by registries."""

    TOKEN = re.compile(
        r"""
        (?P<space>\s+)
        |(?P<line_comment>//[^\n]*(?:\n|\Z))
        |(?P<block_comment>/\*.*?\*/)
        |(?P<string>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")
        |(?P<number>-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)
        |(?P<identifier>[A-Za-z_$][A-Za-z0-9_$]*)
        |(?P<punctuation>[{}\[\]():,.;])
        """,
        flags=re.DOTALL | re.VERBOSE,
    )

    def __init__(self, source: str, position: int, label: str) -> None:
        self.source = source
        self.position = position
        self.label = label
        self.buffer: tuple[str, str, int] | None = None

    def next_token(self) -> tuple[str, str, int]:
        while self.position < len(self.source):
            match = self.TOKEN.match(self.source, self.position)
            if match is None:
                excerpt = self.source[self.position : self.position + 30]
                raise VerificationFailure(
                    f"script.js {self.label}: unsupported token near {excerpt!r}"
                )
            self.position = match.end()
            kind = match.lastgroup
            require(kind is not None, "internal tokenizer error")
            if kind in {"space", "line_comment", "block_comment"}:
                continue
            value = match.group(kind)
            if kind == "punctuation":
                kind = value
            return kind, value, match.start()
        return "eof", "", self.position

    def peek(self) -> tuple[str, str, int]:
        if self.buffer is None:
            self.buffer = self.next_token()
        return self.buffer

    def pop(self, kind: str | None = None, value: str | None = None) -> tuple[str, str, int]:
        token = self.peek()
        if kind is not None and token[0] != kind:
            raise VerificationFailure(
                f"script.js {self.label}: expected {kind!r}, found {token[1]!r}"
            )
        if value is not None and token[1] != value:
            raise VerificationFailure(
                f"script.js {self.label}: expected {value!r}, found {token[1]!r}"
            )
        self.buffer = None
        return token

    def parse(self) -> Any:
        value = self.parse_value()
        self.pop(";")
        return value

    def parse_value(self) -> Any:
        kind, value, _ = self.peek()
        if kind == "string":
            self.pop()
            try:
                decoded = ast.literal_eval(value)
            except (SyntaxError, ValueError) as exc:
                raise VerificationFailure(
                    f"script.js {self.label}: invalid string literal"
                ) from exc
            require(isinstance(decoded, str), f"script.js {self.label}: invalid string")
            return decoded
        if kind == "number":
            self.pop()
            return float(value) if any(char in value for char in ".eE") else int(value)
        if kind == "{":
            return self.parse_object()
        if kind == "[":
            return self.parse_array()
        if kind == "identifier":
            if value in {"true", "false", "null"}:
                self.pop()
                return {"true": True, "false": False, "null": None}[value]
            if value == "Object":
                self.pop("identifier", "Object")
                self.pop(".")
                self.pop("identifier", "freeze")
                self.pop("(")
                frozen_value = self.parse_value()
                self.pop(")")
                return frozen_value
        raise VerificationFailure(
            f"script.js {self.label}: value must be a static literal, found {value!r}"
        )

    def parse_object(self) -> dict[str, Any]:
        result: dict[str, Any] = {}
        self.pop("{")
        if self.peek()[0] == "}":
            self.pop("}")
            return result
        while True:
            kind, raw_key, _ = self.pop()
            require(
                kind in {"identifier", "string"},
                f"script.js {self.label}: object key must be static",
            )
            if kind == "string":
                try:
                    key = ast.literal_eval(raw_key)
                except (SyntaxError, ValueError) as exc:
                    raise VerificationFailure(
                        f"script.js {self.label}: invalid object key"
                    ) from exc
            else:
                key = raw_key
            require(isinstance(key, str), f"script.js {self.label}: invalid object key")
            require(key not in result, f"script.js {self.label}: duplicate key {key!r}")
            self.pop(":")
            result[key] = self.parse_value()
            if self.peek()[0] == "}":
                self.pop("}")
                return result
            self.pop(",")
            if self.peek()[0] == "}":
                self.pop("}")
                return result

    def parse_array(self) -> list[Any]:
        result: list[Any] = []
        self.pop("[")
        if self.peek()[0] == "]":
            self.pop("]")
            return result
        while True:
            result.append(self.parse_value())
            if self.peek()[0] == "]":
                self.pop("]")
                return result
            self.pop(",")
            if self.peek()[0] == "]":
                self.pop("]")
                return result


def parse_static_const(script: str, name: str) -> Any:
    pattern = re.compile(rf"^\s*const\s+{re.escape(name)}\s*=", flags=re.MULTILINE)
    matches = list(pattern.finditer(script))
    require(len(matches) == 1, f"script.js: expected exactly one const {name}")
    parser = JavaScriptLiteralParser(script, matches[0].end(), name)
    return parser.parse()


def checksum_entries(path: Path) -> list[tuple[str, str]]:
    require(path.is_file(), f"missing checksum inventory: {path}")
    entries: list[tuple[str, str]] = []
    seen: set[str] = set()
    try:
        lines = path.read_text(encoding="ascii").splitlines()
    except (OSError, UnicodeError) as exc:
        raise VerificationFailure(f"cannot read {path}: {exc}") from exc
    for line_number, line in enumerate(lines, start=1):
        match = re.fullmatch(r"([0-9a-f]{64})  ([^\r\n]+)", line)
        require(match is not None, f"{path}:{line_number}: malformed checksum line")
        digest, relative = match.groups()
        require(relative not in seen, f"{path}: duplicate path {relative}")
        seen.add(relative)
        entries.append((relative, digest))
    return entries


def verify_catalog(root: Path, catalog: dict[str, Any]) -> None:
    require_keys(
        catalog,
        {"audit_date", "bindings", "policy", "schema_version", "sets"},
        "catalog",
    )
    require_equal(catalog.get("schema_version"), 1, "catalog.schema_version")
    require_equal(catalog.get("bindings"), EXPECTED_BINDINGS, "catalog.bindings")
    require_equal(
        catalog.get("policy"),
        {
            "allow_independent_stimulus_selection": False,
            "protocol_and_stimulus_set_are_bound": True,
            "unvalidated_set_behavior": "fail_closed",
        },
        "catalog.policy",
    )
    sets = require_mapping(catalog.get("sets"), "catalog.sets")
    expected_set_ids = set(EXPECTED_BINDINGS.values()) | {LEGACY_SET_ID}
    require(set(sets) == expected_set_ids, "catalog.sets: unexpected set inventory")

    legacy = require_mapping(sets[LEGACY_SET_ID], f"catalog.sets.{LEGACY_SET_ID}")
    require_keys(
        legacy,
        {
            "aggregate_sha256",
            "claim",
            "kind",
            "manifest",
            "manifest_sha256",
            "root",
            "task_ids",
            "validated",
        },
        f"catalog.sets.{LEGACY_SET_ID}",
    )
    legacy_manifest_path = resolve_relative(root, legacy.get("manifest"), "legacy manifest")
    legacy_manifest = load_json(legacy_manifest_path)
    require_equal(legacy.get("root"), ".", "legacy catalog root")
    require_equal(legacy.get("validated"), True, "legacy catalog validation")
    require_equal(legacy.get("task_ids"), list(KNOWN_TASKS), "legacy catalog tasks")
    require_equal(
        legacy.get("manifest_sha256"),
        sha256_hex(legacy_manifest_path),
        "legacy catalog manifest SHA-256",
    )
    require_equal(
        legacy.get("aggregate_sha256"),
        legacy_manifest.get("aggregate_sha256"),
        "legacy catalog aggregate SHA-256",
    )
    require_equal(
        legacy_manifest.get("stimulus_set_id"), LEGACY_SET_ID, "legacy manifest ID"
    )


def verify_derivative_set(
    root: Path,
    catalog: dict[str, Any],
    protocol_id: str,
    set_id: str,
) -> tuple[dict[str, Any], dict[str, Any], int]:
    expected_task_ids = EXPECTED_TASKS[protocol_id]
    expected_task_folders = tuple(f"{task}_discrimination" for task in expected_task_ids)
    catalog_sets = require_mapping(catalog["sets"], "catalog.sets")
    entry = require_mapping(catalog_sets.get(set_id), f"catalog.sets.{set_id}")
    require_keys(
        entry,
        {
            "aggregate_sha256",
            "claim",
            "kind",
            "manifest",
            "manifest_sha256",
            "root",
            "task_ids",
            "validated",
        },
        f"catalog.sets.{set_id}",
    )
    expected_root = f"stimulus_sets/{set_id}"
    require_equal(entry["root"], expected_root, f"{set_id} catalog root")
    require_equal(
        entry["manifest"], f"{expected_root}/STIMULUS_MANIFEST.json", f"{set_id} manifest path"
    )
    require_equal(entry["task_ids"], list(expected_task_ids), f"{set_id} task support")
    require_equal(entry["validated"], True, f"{set_id} catalog validation")

    set_root = resolve_relative(root, entry["root"], f"{set_id} root")
    manifest_path = resolve_relative(root, entry["manifest"], f"{set_id} manifest")
    require_equal(
        require_sha256(entry["manifest_sha256"], f"{set_id} manifest digest"),
        sha256_hex(manifest_path),
        f"{set_id} manifest SHA-256",
    )
    manifest = load_json(manifest_path)
    require_equal(manifest.get("schema_version"), 1, f"{set_id} manifest schema")
    require_equal(manifest.get("stimulus_set_id"), set_id, f"{set_id} manifest ID")
    require_equal(manifest.get("target_protocol_id"), protocol_id, f"{set_id} protocol")
    require_equal(manifest.get("task_order"), list(expected_task_folders), f"{set_id} task order")
    require_equal(manifest.get("file_count"), 101 * len(expected_task_ids), f"{set_id} file count")
    require_equal(manifest.get("validation_status"), "passed", f"{set_id} validation")
    require_equal(manifest.get("kind"), entry["kind"], f"{set_id} kind")
    require_equal(manifest.get("claim"), entry["claim"], f"{set_id} claim")
    require_equal(
        require_sha256(manifest.get("aggregate_sha256"), f"{set_id} aggregate"),
        require_sha256(entry["aggregate_sha256"], f"{set_id} catalog aggregate"),
        f"{set_id} catalog/manifest aggregate",
    )

    acoustic_audit = require_mapping(manifest.get("acoustic_audit"), f"{set_id} acoustic audit")
    expected_profile = "saito_tierney2024" if protocol_id == "saitoTierney2024" else protocol_id
    require_equal(acoustic_audit.get("profile"), expected_profile, f"{set_id} audit profile")
    require_equal(
        acoustic_audit.get("script"), "tools/audit_stimulus_acoustics.py", f"{set_id} audit script"
    )

    manifest_tasks = require_mapping(manifest.get("tasks"), f"{set_id} tasks")
    require(set(manifest_tasks) == set(expected_task_folders), f"{set_id}: manifest task mismatch")
    generator = require_mapping(manifest.get("generator"), f"{set_id} generator")
    require_keys(
        generator,
        {
            "application",
            "parameters_file",
            "parameters_sha256",
            "praat_binary_sha256",
            "praat_version",
            "script",
            "script_sha256",
        },
        f"{set_id} generator",
    )
    parameters_path = resolve_relative(set_root, generator["parameters_file"], f"{set_id} parameters")
    require_equal(
        require_sha256(generator["parameters_sha256"], f"{set_id} parameters digest"),
        sha256_hex(parameters_path),
        f"{set_id} parameters SHA-256",
    )
    parameters = load_json(parameters_path)
    require_equal(parameters.get("schema_version"), 1, f"{set_id} parameters schema")
    require_equal(parameters.get("stimulus_set_id"), set_id, f"{set_id} parameters ID")
    parameter_generator = require_mapping(parameters.get("generator"), f"{set_id} parameter generator")
    parameter_generator_keys = {
        "application",
        "praat_binary_sha256",
        "praat_version",
        "script",
        "script_sha256",
    }
    require_keys(parameter_generator, parameter_generator_keys, f"{set_id} parameter generator")
    for key in parameter_generator_keys:
        require_equal(parameter_generator[key], generator[key], f"{set_id} generator {key}")
    generator_script_path = resolve_relative(root, generator["script"], f"{set_id} generator script")
    require_equal(
        require_sha256(generator["script_sha256"], f"{set_id} generator script digest"),
        sha256_hex(generator_script_path),
        f"{set_id} generator script SHA-256",
    )

    parent = require_mapping(manifest.get("parent"), f"{set_id} parent")
    parent_entry = require_mapping(catalog_sets[LEGACY_SET_ID], "legacy catalog entry")
    require_equal(parent.get("stimulus_set_id"), LEGACY_SET_ID, f"{set_id} parent ID")
    require_equal(parent.get("manifest"), parent_entry.get("manifest"), f"{set_id} parent manifest")
    require_equal(
        parent.get("aggregate_sha256"), parent_entry.get("aggregate_sha256"), f"{set_id} parent aggregate"
    )
    require_equal(
        parameters.get("parent_stimulus_set_id"), LEGACY_SET_ID, f"{set_id} parameter parent ID"
    )
    require_equal(
        parameters.get("parent_aggregate_sha256"),
        parent_entry.get("aggregate_sha256"),
        f"{set_id} parameter parent aggregate",
    )

    transformations = require_mapping(
        parameters.get("task_transformations"), f"{set_id} transformations"
    )
    require(set(transformations) == set(expected_task_folders), f"{set_id}: transformation task mismatch")
    checksum_path = resolve_relative(set_root, manifest.get("checksums_file"), f"{set_id} checksums")
    require_equal(
        require_sha256(manifest.get("checksums_sha256"), f"{set_id} checksums digest"),
        sha256_hex(checksum_path),
        f"{set_id} CHECKSUMS SHA-256",
    )
    listed_checksums = checksum_entries(checksum_path)
    expected_checksum_paths: list[str] = []
    actual_checksum_pairs: list[tuple[str, str]] = []
    aggregate = hashlib.sha256()
    total_files = 0

    for task_id, task_folder in zip(expected_task_ids, expected_task_folders):
        task_metadata = require_mapping(manifest_tasks[task_folder], f"{set_id} {task_folder}")
        require_equal(task_metadata.get("file_count"), 101, f"{set_id} {task_folder} file count")
        require_equal(task_metadata.get("first_file"), "1.flac", f"{set_id} {task_folder} first")
        require_equal(task_metadata.get("last_file"), "101.flac", f"{set_id} {task_folder} last")
        require_equal(
            transformations[task_folder], task_metadata.get("transformation"), f"{set_id} {task_folder} transform"
        )
        stimuli = set_root / task_folder / "Stimuli"
        expected_names = [f"{index}.flac" for index in range(1, 102)]
        require(stimuli.is_dir(), f"{set_id}: missing directory {stimuli}")
        actual_names = {path.name for path in stimuli.glob("*.flac")}
        require(actual_names == set(expected_names), f"{set_id} {task_folder}: FLAC inventory mismatch")
        task_digest = hashlib.sha256()
        for name in expected_names:
            path = stimuli / name
            digest = sha256_bytes(path)
            digest_hex = digest.hex()
            relative = f"{task_folder}/Stimuli/{name}"
            expected_checksum_paths.append(relative)
            actual_checksum_pairs.append((relative, digest_hex))
            task_digest.update(name.encode("utf-8"))
            task_digest.update(b"\0")
            task_digest.update(digest)
            aggregate.update(relative.encode("utf-8"))
            aggregate.update(b"\0")
            aggregate.update(digest)
            total_files += 1
        require_equal(
            require_sha256(task_metadata.get("task_sha256"), f"{set_id} {task_id} task digest"),
            task_digest.hexdigest(),
            f"{set_id} {task_id} task SHA-256",
        )

    require_equal(listed_checksums, actual_checksum_pairs, f"{set_id} checksum inventory")
    require_equal(
        aggregate.hexdigest(), manifest["aggregate_sha256"], f"{set_id} aggregate SHA-256"
    )
    require_equal(total_files, manifest["file_count"], f"{set_id} verified file count")

    for unsupported in set(KNOWN_TASKS) - set(expected_task_ids):
        require(
            not (set_root / f"{unsupported}_discrimination").exists(),
            f"{set_id}: unsupported {unsupported} directory must be absent",
        )

    return manifest, parameters, total_files


def runtime_set_expected(
    set_id: str,
    catalog_entry: dict[str, Any],
    manifest: dict[str, Any],
) -> dict[str, Any]:
    generator = manifest["generator"]
    parent = manifest["parent"]
    tasks: dict[str, Any] = {}
    for task_folder in manifest["task_order"]:
        task_id = task_folder.removesuffix("_discrimination")
        task = manifest["tasks"][task_folder]
        tasks[task_id] = {
            "folder": task_folder,
            "fileCount": task["file_count"],
            "taskSha256": task["task_sha256"],
            "transformation": task["transformation"],
        }
    return {
        "id": set_id,
        "version": manifest["stimulus_set_version"],
        "kind": manifest["kind"],
        "claim": manifest["claim"],
        "root": catalog_entry["root"],
        "manifest": catalog_entry["manifest"],
        "manifestSha256": catalog_entry["manifest_sha256"],
        "aggregateSha256": manifest["aggregate_sha256"],
        "auditDate": manifest["audit_date"],
        "validationStatus": manifest["validation_status"],
        "targetProtocolId": manifest["target_protocol_id"],
        "targetCitation": manifest["target_citation"],
        "targetSourceLocator": manifest["target_source_locator"],
        "parameterProfileId": manifest["acoustic_audit"]["profile"],
        "parentStimulusSetId": parent["stimulus_set_id"],
        "parentManifest": parent["manifest"],
        "parentAggregateSha256": parent["aggregate_sha256"],
        "parentSourceLocator": parent["official_repository_url"],
        "parentSourceArchiveSha256": parent["official_source_archive_sha256"],
        "generatorApplication": generator["application"],
        "generatorVersion": generator["praat_version"],
        "generatorScript": generator["script"],
        "generatorScriptSha256": generator["script_sha256"],
        "parametersFile": generator["parameters_file"],
        "parametersSha256": generator["parameters_sha256"],
        # Runtime CSV cells use an empty string for an explicitly undeclared
        # license; the manifest retains JSON null to distinguish it from a grant.
        "license": manifest["license"] or "",
        "licenseNote": manifest["license_note"],
        "tasks": tasks,
    }


def verify_runtime(
    root: Path,
    catalog: dict[str, Any],
    manifests: dict[str, dict[str, Any]],
) -> None:
    script_path = root / "script.js"
    require(script_path.is_file(), f"missing runtime: {script_path}")
    try:
        script = script_path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise VerificationFailure(f"cannot read script.js: {exc}") from exc

    implementation = require_mapping(
        parse_static_const(script, "IMPLEMENTATION"), "script.js IMPLEMENTATION"
    )
    for key, expected in EXPECTED_IMPLEMENTATION_VERSIONS.items():
        require_equal(implementation.get(key), expected, f"script.js IMPLEMENTATION.{key}")

    runtime_catalog = require_mapping(
        parse_static_const(script, "STIMULUS_CATALOG"), "script.js STIMULUS_CATALOG"
    )
    require_equal(
        runtime_catalog,
        {
            "schemaVersion": catalog["schema_version"],
            "file": "STIMULUS_CATALOG.json",
            "sha256": sha256_hex(root / "STIMULUS_CATALOG.json"),
            "auditDate": catalog["audit_date"],
            "bindings": catalog["bindings"],
        },
        "script.js STIMULUS_CATALOG",
    )

    runtime_sets = require_mapping(
        parse_static_const(script, "STIMULUS_SETS"), "script.js STIMULUS_SETS"
    )
    require(
        set(runtime_sets) == set(EXPECTED_BINDINGS.values()),
        "script.js STIMULUS_SETS must contain exactly the three bound derivative sets",
    )
    require(LEGACY_SET_ID not in runtime_sets, "legacy official set must not be runtime-selectable")
    catalog_sets = catalog["sets"]
    for set_id in EXPECTED_BINDINGS.values():
        expected = runtime_set_expected(set_id, catalog_sets[set_id], manifests[set_id])
        require_equal(runtime_sets[set_id], expected, f"script.js STIMULUS_SETS[{set_id!r}]")

    presets = require_mapping(
        parse_static_const(script, "PROTOCOL_PRESETS"), "script.js PROTOCOL_PRESETS"
    )
    require(set(presets) == set(EXPECTED_BINDINGS), "script.js protocol inventory mismatch")
    for protocol_id, set_id in EXPECTED_BINDINGS.items():
        preset = require_mapping(presets[protocol_id], f"script.js preset {protocol_id}")
        require_equal(preset.get("id"), protocol_id, f"script.js preset {protocol_id}.id")
        require_equal(
            preset.get("stimulusSetId"), set_id, f"script.js preset {protocol_id}.stimulusSetId"
        )
        preset_version = preset.get("version")
        require(
            isinstance(preset_version, str) and preset_version,
            f"script.js preset {protocol_id}.version is missing",
        )
        require_equal(
            preset.get("stimulusBindingId"),
            f"{preset_version}__{set_id}",
            f"script.js preset {protocol_id}.stimulusBindingId",
        )
        require_equal(
            preset.get("stimulusCompatibility"),
            manifests[set_id]["claim"],
            f"script.js preset {protocol_id}.stimulusCompatibility",
        )
        task_ids = require_list(
            preset.get("mainStudyTaskIds"), f"script.js preset {protocol_id}.mainStudyTaskIds"
        )
        require(
            len(task_ids) == len(set(task_ids)) and set(task_ids) == set(EXPECTED_TASKS[protocol_id]),
            f"script.js preset {protocol_id}: task support mismatch",
        )

    saito_set = runtime_sets[EXPECTED_BINDINGS["saitoTierney2024"]]
    require("risetime" not in saito_set["tasks"], "Saito runtime set must not support rise time")
    require(
        "risetime" not in presets["saitoTierney2024"]["mainStudyTaskIds"],
        "Saito protocol must not expose rise time",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="repository root (default: parent of tools/)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    try:
        catalog = load_json(root / "STIMULUS_CATALOG.json")
        verify_catalog(root, catalog)
        manifests: dict[str, dict[str, Any]] = {}
        file_count = 0
        for protocol_id, set_id in EXPECTED_BINDINGS.items():
            manifest, _parameters, verified_files = verify_derivative_set(
                root, catalog, protocol_id, set_id
            )
            manifests[set_id] = manifest
            file_count += verified_files
        verify_runtime(root, catalog, manifests)
    except (VerificationFailure, KeyError, TypeError, ValueError) as exc:
        print(f"Runtime stimulus registry verification FAILED: {exc}", file=sys.stderr)
        return 1

    print(
        "Runtime stimulus registry verification passed: "
        f"{len(EXPECTED_BINDINGS)} protocol bindings, "
        f"{len(manifests)} derivative sets, {file_count} FLAC files."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
