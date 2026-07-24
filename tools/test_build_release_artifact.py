#!/usr/bin/env python3
"""Tests for deterministic production release artifacts."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
import zipfile


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BUILDER = REPOSITORY_ROOT / "tools" / "build_release_artifact.py"
FIXED_EPOCH = "1735689600"  # 2025-01-01T00:00:00Z


def write(path: Path, data: str | bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, bytes):
        path.write_bytes(data)
    else:
        path.write_text(data, encoding="utf-8")


def run(command: list[str], cwd: Path, *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=cwd,
        check=check,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


class ReleaseArtifactTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.repo = self.base / "repo"
        self.repo.mkdir()
        self.production_config = self.base / "production.json"
        self.preview_config = self.base / "preview.json"
        self._write_fixture()
        run(["git", "init", "-q"], self.repo)
        run(["git", "config", "user.email", "release-test@example.invalid"], self.repo)
        run(["git", "config", "user.name", "Release Test"], self.repo)
        run(["git", "add", "."], self.repo)
        environment = dict(os.environ, GIT_AUTHOR_DATE="2025-01-01T00:00:00Z", GIT_COMMITTER_DATE="2025-01-01T00:00:00Z")
        subprocess.run(
            ["git", "commit", "-q", "-m", "fixture"],
            cwd=self.repo,
            check=True,
            env=environment,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        self.head = run(["git", "rev-parse", "HEAD"], self.repo).stdout.strip()

    def _write_fixture(self) -> None:
        source_files = {
            "index.html": "<script src=\"deployment_policy.js\"></script>\n",
            "script.js": "console.log('runtime');\n",
            "session_safety.js": "globalThis.SessionSafety = {};\n",
            "result_bundle.js": "globalThis.ResultBundle = {};\n",
            "deployment_policy.js": "globalThis.DeploymentPolicy = {};\n",
        }
        for name, contents in source_files.items():
            write(self.repo / name, contents)

        set_id = "test-reconstruction-v1"
        root = f"stimulus_sets/{set_id}"
        catalog = {
            "schema_version": 1,
            "bindings": {"testProtocol": set_id},
            "sets": {
                set_id: {
                    "root": root,
                    "manifest": f"{root}/STIMULUS_MANIFEST.json",
                    "task_ids": ["pitch"],
                    "validated": True,
                }
            },
        }
        manifest = {
            "schema_version": 1,
            "stimulus_set_id": set_id,
            "checksums_file": "CHECKSUMS.sha256",
            "generator": {"parameters_file": "PARAMETERS.json"},
            "tasks": {"pitch_discrimination": {"file_count": 2}},
        }
        write(self.repo / "STIMULUS_CATALOG.json", json.dumps(catalog))
        write(self.repo / root / "STIMULUS_MANIFEST.json", json.dumps(manifest))
        write(self.repo / root / "PARAMETERS.json", "{}\n")
        write(self.repo / root / "CHECKSUMS.sha256", "fixture checksums\n")
        write(self.repo / root / "pitch_discrimination/Stimuli/1.flac", b"fLaC\x00one")
        write(self.repo / root / "pitch_discrimination/Stimuli/2.flac", b"fLaC\x00two")

        # These files are deliberately tracked but must never enter the runtime artifact.
        excluded = {
            "pitch_discrimination/index.html": "legacy entry point",
            "formant_discrimination/formant_discrimination.js": "legacy script",
            "duration_discrimination/index.html": "legacy entry point",
            "risetime_discrimination/risetime_discrimination.js": "legacy script",
            "Readings/source.pdf": "private PDF",
            "docs/internal.md": "internal docs",
            "tools/private_tool.py": "internal tool",
            ".github/workflows/ci.yml": "internal workflow",
            "participant_audio_discrimination.csv": "private result",
            "frozen-parent/Stimuli/1.flac": "frozen parent",
        }
        for name, contents in excluded.items():
            write(self.repo / name, contents)

        production = {
            "schema_version": 1,
            "deployment_id": "prod-test",
            "environment": "production",
            "research_session_enabled": True,
            "researcher_ui_enabled": True,
            "researcher_origin": "https://research.example.edu",
            "participant_origin": "https://listen.example.edu",
            "public_participant_base_url": "https://listen.example.edu/battery/",
            "allowed_return_url_origins": ["https://return.example.edu"],
            "local_test_sessions_enabled": False,
        }
        preview = {
            **production,
            "deployment_id": "preview-test",
            "environment": "preview",
            "research_session_enabled": False,
            "researcher_origin": "https://preview.example.edu",
            "participant_origin": "https://preview.example.edu",
            "public_participant_base_url": "https://preview.example.edu/battery/",
        }
        write(self.production_config, json.dumps(production))
        write(self.preview_config, json.dumps(preview))

    def build(self, output: Path, *extra: str, config: Path | None = None) -> subprocess.CompletedProcess[str]:
        environment = dict(os.environ, SOURCE_DATE_EPOCH=FIXED_EPOCH)
        return subprocess.run(
            [
                "python3",
                str(BUILDER),
                "--source-root",
                str(self.repo),
                "--output",
                str(output),
                "--deployment-config",
                str(config or self.production_config),
                "--source-commit",
                self.head,
                *extra,
            ],
            cwd=self.repo,
            env=environment,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

    def test_artifact_is_reproducible_allowlisted_and_self_verifying(self) -> None:
        first = self.base / "first.zip"
        second = self.base / "second.zip"
        self.assertEqual(self.build(first).returncode, 0)
        self.assertEqual(self.build(second).returncode, 0)
        self.assertEqual(first.read_bytes(), second.read_bytes())

        with zipfile.ZipFile(first) as archive:
            names = archive.namelist()
            self.assertEqual(names, sorted(names))
            self.assertIn("index.html", names)
            self.assertIn("script.js", names)
            self.assertIn("session_safety.js", names)
            self.assertIn("result_bundle.js", names)
            self.assertIn("deployment_policy.js", names)
            self.assertIn("deployment-config.json", names)
            self.assertIn("stimulus_sets/test-reconstruction-v1/pitch_discrimination/Stimuli/2.flac", names)
            self.assertFalse(any(name.endswith(".pdf") for name in names))
            self.assertFalse(any(name.split("/", 1)[0] in {"tools", "docs", "Readings", ".git", ".github"} for name in names))
            self.assertFalse(any(name.startswith("pitch_discrimination/") for name in names))
            self.assertFalse(any("frozen-parent" in name for name in names))
            self.assertFalse(any("_audio_discrimination" in name for name in names))

            manifest = json.loads(archive.read("release_manifest.json"))
            self.assertEqual(manifest["schema"], "audio-discrimination-release-manifest/v1")
            self.assertEqual(manifest["source_commit"], self.head)
            self.assertEqual(manifest["source_date_epoch"], int(FIXED_EPOCH))
            self.assertEqual(manifest["generated_at"], "2025-01-01T00:00:00Z")
            self.assertNotIn(str(self.base), json.dumps(manifest))

            records = manifest["members"]
            self.assertEqual({record["path"] for record in records}, set(names) - {"release_manifest.json"})
            aggregate = hashlib.sha256()
            for record in records:
                data = archive.read(record["path"])
                self.assertEqual(record["size"], len(data))
                self.assertEqual(record["sha256"], hashlib.sha256(data).hexdigest())
                aggregate.update(record["path"].encode("utf-8"))
                aggregate.update(b"\0")
                aggregate.update(bytes.fromhex(record["sha256"]))
                aggregate.update(record["size"].to_bytes(8, "big"))
            self.assertEqual(manifest["aggregate_sha256"], aggregate.hexdigest())
            for name, digest in manifest["build_asset_sha256"].items():
                self.assertEqual(digest, hashlib.sha256(archive.read(name)).hexdigest())

            for info in archive.infolist():
                self.assertEqual(info.date_time, (2025, 1, 1, 0, 0, 0))
                self.assertEqual((info.external_attr >> 16) & 0o777, 0o644)
                self.assertEqual(info.compress_type, zipfile.ZIP_STORED)

    def test_dirty_tree_and_commit_mismatch_are_rejected(self) -> None:
        mismatch = self.build(self.base / "mismatch.zip", "--source-commit", "0" * 40)
        # The helper already supplies one source-commit, so argparse takes the last value.
        self.assertEqual(mismatch.returncode, 2)
        self.assertIn("Source commit mismatch", mismatch.stderr)

        write(self.repo / "script.js", "dirty\n")
        dirty = self.build(self.base / "dirty.zip")
        self.assertEqual(dirty.returncode, 2)
        self.assertIn("working tree is not clean", dirty.stderr)

    def test_preview_config_requires_explicit_override(self) -> None:
        refused = self.build(self.base / "preview-refused.zip", config=self.preview_config)
        self.assertEqual(refused.returncode, 2)
        self.assertIn("environment=production", refused.stderr)
        allowed = self.build(
            self.base / "preview-allowed.zip",
            "--allow-preview-config",
            config=self.preview_config,
        )
        self.assertEqual(allowed.returncode, 0, allowed.stderr)

    def test_incomplete_or_unsafe_production_config_is_rejected(self) -> None:
        incomplete = self.base / "incomplete.json"
        write(incomplete, json.dumps({"schema_version": 1, "deployment_id": "prod", "environment": "production"}))
        refused = self.build(self.base / "incomplete.zip", config=incomplete)
        self.assertEqual(refused.returncode, 2)
        self.assertIn("keys do not match schema 1", refused.stderr)

        disabled = json.loads(self.production_config.read_text(encoding="utf-8"))
        disabled["research_session_enabled"] = False
        disabled_path = self.base / "disabled.json"
        write(disabled_path, json.dumps(disabled))
        refused = self.build(self.base / "disabled.zip", config=disabled_path)
        self.assertEqual(refused.returncode, 2)
        self.assertIn("must enable research sessions", refused.stderr)

        no_researcher_ui = json.loads(self.production_config.read_text(encoding="utf-8"))
        no_researcher_ui["researcher_ui_enabled"] = False
        no_researcher_ui_path = self.base / "no-researcher-ui.json"
        write(no_researcher_ui_path, json.dumps(no_researcher_ui))
        refused = self.build(
            self.base / "no-researcher-ui.zip",
            config=no_researcher_ui_path,
        )
        self.assertEqual(refused.returncode, 2)
        self.assertIn("researcher-configured production artifact", refused.stderr)

        bad_origin = json.loads(self.production_config.read_text(encoding="utf-8"))
        bad_origin["participant_origin"] = "https://listen.example.edu/path"
        bad_origin_path = self.base / "bad-origin.json"
        write(bad_origin_path, json.dumps(bad_origin))
        refused = self.build(self.base / "bad-origin.zip", config=bad_origin_path)
        self.assertEqual(refused.returncode, 2)
        self.assertIn("exact HTTPS origin", refused.stderr)

        wildcard = json.loads(self.production_config.read_text(encoding="utf-8"))
        wildcard["allowed_return_url_origins"] = ["*"]
        wildcard_path = self.base / "wildcard-return.json"
        write(wildcard_path, json.dumps(wildcard))
        allowed = self.build(self.base / "wildcard-return.zip", config=wildcard_path)
        self.assertEqual(allowed.returncode, 0, allowed.stderr)

        duplicate = json.loads(self.production_config.read_text(encoding="utf-8"))
        duplicate["allowed_return_url_origins"] = [
            "https://return.example.edu",
            "https://return.example.edu",
        ]
        duplicate_path = self.base / "duplicate-return.json"
        write(duplicate_path, json.dumps(duplicate))
        refused = self.build(self.base / "duplicate-return.zip", config=duplicate_path)
        self.assertEqual(refused.returncode, 2)
        self.assertIn("must not contain duplicates", refused.stderr)

    def test_catalog_path_traversal_is_rejected(self) -> None:
        catalog_path = self.repo / "STIMULUS_CATALOG.json"
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        catalog["sets"]["test-reconstruction-v1"]["root"] = "../escape"
        write(catalog_path, json.dumps(catalog))
        run(["git", "add", "STIMULUS_CATALOG.json"], self.repo)
        run(["git", "commit", "-q", "-m", "malicious catalog"], self.repo)
        self.head = run(["git", "rev-parse", "HEAD"], self.repo).stdout.strip()
        refused = self.build(self.base / "unsafe.zip")
        self.assertEqual(refused.returncode, 2)
        self.assertIn("Bound stimulus root must be exactly", refused.stderr)


if __name__ == "__main__":
    unittest.main()
