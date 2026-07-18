#!/usr/bin/env python3
"""Fail if a legacy standalone task can still be started from its HTML entrypoint."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LEGACY_ENTRYPOINTS = (
    ROOT / "pitch_discrimination" / "index.html",
    ROOT / "formant_discrimination" / "index.html",
    ROOT / "duration_discrimination" / "index.html",
    ROOT / "risetime_discrimination" / "index.html",
)
FORBIDDEN_TAGS = {"audio", "button", "form", "input", "script", "select", "textarea"}


class LegacyPageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.forbidden: list[str] = []
        self.text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in FORBIDDEN_TAGS:
            self.forbidden.append(tag.lower())

    def handle_data(self, data: str) -> None:
        self.text.append(data)


def main() -> int:
    failures: list[str] = []
    for path in LEGACY_ENTRYPOINTS:
        parser = LegacyPageParser()
        try:
            parser.feed(path.read_text(encoding="utf-8"))
            parser.close()
        except (OSError, UnicodeError, ValueError) as error:
            failures.append(f"{path.relative_to(ROOT)}: could not parse: {error}")
            continue

        if parser.forbidden:
            failures.append(
                f"{path.relative_to(ROOT)}: interactive tag(s) remain: "
                + ", ".join(sorted(set(parser.forbidden)))
            )
        normalized_text = " ".join(" ".join(parser.text).split()).lower()
        if "legacy task disabled" not in normalized_text:
            failures.append(
                f"{path.relative_to(ROOT)}: missing the legacy-disabled notice"
            )

    if failures:
        print("Legacy entrypoint verification failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(
        "Legacy entrypoint verification passed: "
        f"{len(LEGACY_ENTRYPOINTS)} standalone task pages are non-interactive."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
