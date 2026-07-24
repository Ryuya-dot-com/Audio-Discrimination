#!/usr/bin/env python3
"""Statically verify the contract between index.html and script.js.

This intentionally uses only the Python standard library.  It is a focused
static check, not a general-purpose JavaScript parser.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable, Sequence
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "index.html"
SCRIPT_PATH = ROOT / "script.js"
DEPLOYMENT_CONFIG_PATH = ROOT / "deployment-config.json"

I18N_ATTRIBUTES = (
    "data-i18n",
    "data-i18n-placeholder",
    "data-i18n-aria-label",
)


class StaticParseError(RuntimeError):
    """Raised when a required, narrowly defined JavaScript shape is absent."""


@dataclass(frozen=True)
class JSToken:
    kind: str
    value: str
    offset: int


@dataclass
class CheckResult:
    name: str
    passed: bool
    summary: str
    details: list[str] = field(default_factory=list)


class ContractHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: Counter[str] = Counter()
        self.i18n_keys: dict[str, set[str]] = {
            attribute: set() for attribute in I18N_ATTRIBUTES
        }
        self.script_sources: list[str] = []
        self.html_elements: list[dict[str, str | None]] = []
        self.english_toggles: list[dict[str, str | None]] = []
        self.attributes_by_id: dict[str, dict[str, str | None]] = {}

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        attributes = dict(attrs)
        element_id = attributes.get("id")
        if element_id is not None:
            self.ids[element_id] += 1
            self.attributes_by_id[element_id] = attributes

        for attribute in I18N_ATTRIBUTES:
            key = attributes.get(attribute)
            if key:
                self.i18n_keys[attribute].add(key)

        if tag == "script" and attributes.get("src"):
            self.script_sources.append(attributes["src"] or "")
        if tag == "html":
            self.html_elements.append(attributes)
        if tag == "button" and (
            element_id == "langEn" or attributes.get("data-language") == "en"
        ):
            self.english_toggles.append(attributes)


def _decode_js_escape(source: str, index: int) -> tuple[str, int]:
    """Decode enough JavaScript escapes for static identifier-like strings."""
    escape = source[index]
    simple = {
        "b": "\b",
        "f": "\f",
        "n": "\n",
        "r": "\r",
        "t": "\t",
        "v": "\v",
        "0": "\0",
    }
    if escape in simple:
        return simple[escape], index + 1
    if escape == "u" and index + 4 < len(source):
        digits = source[index + 1 : index + 5]
        if re.fullmatch(r"[0-9A-Fa-f]{4}", digits):
            return chr(int(digits, 16)), index + 5
    if escape == "x" and index + 2 < len(source):
        digits = source[index + 1 : index + 3]
        if re.fullmatch(r"[0-9A-Fa-f]{2}", digits):
            return chr(int(digits, 16)), index + 3
    if escape == "\r" and index + 1 < len(source) and source[index + 1] == "\n":
        return "", index + 2
    if escape in "\r\n":
        return "", index + 1
    return escape, index + 1


def _regex_can_start_after(previous: JSToken | None) -> bool:
    if previous is None:
        return True
    if previous.kind == "identifier":
        return previous.value in {
            "await",
            "case",
            "delete",
            "else",
            "in",
            "instanceof",
            "new",
            "return",
            "throw",
            "typeof",
            "void",
            "yield",
        }
    return previous.value in {
        "(",
        "[",
        "{",
        ",",
        ":",
        ";",
        "=",
        "==",
        "===",
        "!=",
        "!==",
        "=>",
        "!",
        "?",
        "??",
        "&&",
        "||",
        "+",
        "-",
        "*",
        "%",
        "&",
        "|",
        "^",
        "~",
        "<",
        ">",
        "<=",
        ">=",
    }


def tokenize_javascript(source: str) -> list[JSToken]:
    """Tokenize the subset needed by these static contract checks."""
    tokens: list[JSToken] = []
    index = 0
    length = len(source)
    multi_character_operators = (
        "===",
        "!==",
        "=>",
        "==",
        "!=",
        "<=",
        ">=",
        "&&",
        "||",
        "??",
        "?.",
        "++",
        "--",
        "**",
    )

    while index < length:
        character = source[index]
        if character.isspace():
            index += 1
            continue

        if source.startswith("//", index):
            newline = source.find("\n", index + 2)
            index = length if newline < 0 else newline + 1
            continue
        if source.startswith("/*", index):
            end = source.find("*/", index + 2)
            if end < 0:
                raise StaticParseError("unterminated JavaScript block comment")
            index = end + 2
            continue

        if character in {"'", '"', "`"}:
            quote = character
            start = index
            index += 1
            value: list[str] = []
            dynamic_template = False
            while index < length:
                character = source[index]
                if character == quote:
                    index += 1
                    kind = "template-dynamic" if dynamic_template else "string"
                    tokens.append(JSToken(kind, "".join(value), start))
                    break
                if character == "\\":
                    index += 1
                    if index >= length:
                        raise StaticParseError("unterminated JavaScript string escape")
                    decoded, index = _decode_js_escape(source, index)
                    value.append(decoded)
                    continue
                if quote == "`" and source.startswith("${", index):
                    dynamic_template = True
                value.append(character)
                index += 1
            else:
                raise StaticParseError("unterminated JavaScript string literal")
            continue

        if character == "/" and _regex_can_start_after(tokens[-1] if tokens else None):
            start = index
            index += 1
            in_character_class = False
            escaped = False
            while index < length:
                character = source[index]
                if escaped:
                    escaped = False
                elif character == "\\":
                    escaped = True
                elif character == "[":
                    in_character_class = True
                elif character == "]" and in_character_class:
                    in_character_class = False
                elif character == "/" and not in_character_class:
                    index += 1
                    while index < length and source[index].isalpha():
                        index += 1
                    tokens.append(JSToken("regex", source[start:index], start))
                    break
                elif character in "\r\n":
                    # This was division, not a valid regex literal.  Treat the
                    # slash as punctuation and let the next iteration continue.
                    tokens.append(JSToken("punctuation", "/", start))
                    index = start + 1
                    break
                index += 1
            else:
                tokens.append(JSToken("punctuation", "/", start))
                index = start + 1
            continue

        if character.isalpha() or character in {"_", "$"}:
            start = index
            index += 1
            while index < length and (
                source[index].isalnum() or source[index] in {"_", "$"}
            ):
                index += 1
            tokens.append(JSToken("identifier", source[start:index], start))
            continue

        if character.isdigit():
            start = index
            index += 1
            while index < length and (
                source[index].isalnum() or source[index] in {".", "_"}
            ):
                index += 1
            tokens.append(JSToken("number", source[start:index], start))
            continue

        operator = next(
            (
                candidate
                for candidate in multi_character_operators
                if source.startswith(candidate, index)
            ),
            character,
        )
        tokens.append(JSToken("punctuation", operator, index))
        index += len(operator)

    return tokens


PAIRS = {"{": "}", "[": "]", "(": ")"}


def matching_token(tokens: Sequence[JSToken], open_index: int) -> int:
    opening = tokens[open_index].value
    if opening not in PAIRS:
        raise StaticParseError(f"expected opening delimiter, found {opening!r}")
    stack = [PAIRS[opening]]
    for index in range(open_index + 1, len(tokens)):
        value = tokens[index].value
        if value in PAIRS:
            stack.append(PAIRS[value])
        elif value in PAIRS.values():
            if not stack or value != stack[-1]:
                raise StaticParseError(
                    f"unbalanced JavaScript delimiter near byte {tokens[index].offset}"
                )
            stack.pop()
            if not stack:
                return index
    raise StaticParseError(
        f"unterminated {opening!r} near byte {tokens[open_index].offset}"
    )


def const_object(
    tokens: Sequence[JSToken], name: str, allow_wrapper: bool = False
) -> tuple[int, int]:
    for index in range(len(tokens) - 3):
        if (
            tokens[index].value in {"const", "let", "var"}
            and tokens[index + 1].value == name
            and tokens[index + 2].value == "="
        ):
            value_index = index + 3
            if tokens[value_index].value != "{" and allow_wrapper:
                while value_index < len(tokens) and tokens[value_index].value not in {
                    "{",
                    ";",
                }:
                    value_index += 1
            if value_index >= len(tokens) or tokens[value_index].value != "{":
                raise StaticParseError(f"{name} is not initialized with an object")
            return value_index, matching_token(tokens, value_index)
    raise StaticParseError(f"could not find the {name} object")


def object_property_spans(
    tokens: Sequence[JSToken], open_index: int, close_index: int
) -> dict[str, tuple[int, int]]:
    """Return direct object-property value spans as [start, end)."""
    properties: dict[str, tuple[int, int]] = {}
    index = open_index + 1
    while index < close_index:
        if tokens[index].value == ",":
            index += 1
            continue
        key = tokens[index]
        if key.kind not in {"identifier", "string", "number"}:
            raise StaticParseError(
                f"unsupported object property near byte {key.offset}"
            )
        if index + 1 >= close_index or tokens[index + 1].value != ":":
            raise StaticParseError(
                f"expected ':' after object property {key.value!r}"
            )

        value_start = index + 2
        index = value_start
        stack: list[str] = []
        while index < close_index:
            value = tokens[index].value
            if value in PAIRS:
                stack.append(PAIRS[value])
            elif value in PAIRS.values():
                if not stack or value != stack[-1]:
                    raise StaticParseError(
                        f"unbalanced property value near byte {tokens[index].offset}"
                    )
                stack.pop()
            elif value == "," and not stack:
                break
            index += 1
        properties[key.value] = (value_start, index)
        if index < close_index and tokens[index].value == ",":
            index += 1
    return properties


def extract_get_element_ids(tokens: Sequence[JSToken]) -> Counter[str]:
    identifiers: Counter[str] = Counter()
    for index in range(len(tokens) - 5):
        candidate = tokens[index : index + 6]
        if (
            candidate[0].value == "document"
            and candidate[1].value == "."
            and candidate[2].value == "getElementById"
            and candidate[3].value == "("
            and candidate[4].kind == "string"
            and candidate[5].value == ")"
        ):
            identifiers[candidate[4].value] += 1
    return identifiers


def extract_function_bodies(
    tokens: Sequence[JSToken],
) -> dict[str, tuple[int, int]]:
    bodies: dict[str, tuple[int, int]] = {}
    for index in range(len(tokens) - 4):
        if (
            tokens[index].value == "function"
            and tokens[index + 1].kind == "identifier"
            and tokens[index + 2].value == "("
        ):
            parameters_end = matching_token(tokens, index + 2)
            if (
                parameters_end + 1 < len(tokens)
                and tokens[parameters_end + 1].value == "{"
            ):
                body_open = parameters_end + 1
                bodies[tokens[index + 1].value] = (
                    body_open,
                    matching_token(tokens, body_open),
                )

        if (
            tokens[index].value in {"const", "let", "var"}
            and tokens[index + 1].kind == "identifier"
            and tokens[index + 2].value == "="
        ):
            search_end = min(index + 80, len(tokens))
            arrow = next(
                (
                    arrow_index
                    for arrow_index in range(index + 3, search_end)
                    if tokens[arrow_index].value in {"=>", ";"}
                ),
                None,
            )
            if arrow is not None and tokens[arrow].value == "=>":
                body_open = arrow + 1
                if body_open < len(tokens) and tokens[body_open].value == "{":
                    bodies[tokens[index + 1].value] = (
                        body_open,
                        matching_token(tokens, body_open),
                    )
    return bodies


def reachable_function_names(
    tokens: Sequence[JSToken],
    bodies: dict[str, tuple[int, int]],
    start: str,
    excluded: Iterable[str] = (),
) -> set[str]:
    excluded_names = set(excluded)
    if start not in bodies:
        raise StaticParseError(f"could not find function {start}()")
    reachable: set[str] = set()
    pending = [start]
    while pending:
        name = pending.pop()
        if name in reachable or name in excluded_names:
            continue
        reachable.add(name)
        open_index, close_index = bodies[name]
        for index in range(open_index + 1, close_index):
            called_name = tokens[index].value
            if (
                called_name in bodies
                and called_name not in reachable
                and called_name not in excluded_names
                and index + 1 < close_index
                and tokens[index + 1].value == "("
            ):
                pending.append(called_name)
    return reachable


def method_literal_arguments(
    tokens: Sequence[JSToken],
    open_index: int,
    close_index: int,
    methods: set[str],
) -> Counter[str]:
    arguments: Counter[str] = Counter()
    for index in range(open_index + 1, close_index - 3):
        if (
            tokens[index].value in {".", "?."}
            and tokens[index + 1].value in methods
            and tokens[index + 2].value == "("
            and tokens[index + 3].kind == "string"
        ):
            arguments[tokens[index + 3].value] += 1
    return arguments


def check_element_ids(
    parser: ContractHTMLParser, tokens: Sequence[JSToken]
) -> CheckResult:
    references = extract_get_element_ids(tokens)
    problems: list[str] = []
    for element_id in sorted(references):
        html_count = parser.ids[element_id]
        if html_count == 0:
            problems.append(f"#{element_id}: referenced in script.js but absent from index.html")
        elif html_count != 1:
            problems.append(
                f"#{element_id}: referenced in script.js and occurs {html_count} times in index.html"
            )
    if not references:
        problems.append("script.js contains no literal document.getElementById(...) calls")
    return CheckResult(
        "getElementById literals",
        not problems,
        (
            f"{len(references)} distinct literal ID reference(s) each resolve exactly once"
            if not problems
            else f"{len(problems)} ID contract problem(s)"
        ),
        problems,
    )


def check_i18n(
    parser: ContractHTMLParser, tokens: Sequence[JSToken]
) -> CheckResult:
    open_index, close_index = const_object(tokens, "I18N")
    languages = object_property_spans(tokens, open_index, close_index)
    dictionaries: dict[str, set[str]] = {}
    for language in ("en", "ja"):
        if language not in languages:
            raise StaticParseError(f"I18N has no {language!r} dictionary")
        value_start, _ = languages[language]
        if tokens[value_start].value != "{":
            raise StaticParseError(f"I18N.{language} is not an object literal")
        language_close = matching_token(tokens, value_start)
        dictionaries[language] = set(
            object_property_spans(tokens, value_start, language_close)
        )

    html_keys = set().union(*parser.i18n_keys.values())
    problems: list[str] = []
    for key in sorted(html_keys):
        missing = [language for language in ("en", "ja") if key not in dictionaries[language]]
        if missing:
            attributes = sorted(
                attribute
                for attribute, keys in parser.i18n_keys.items()
                if key in keys
            )
            problems.append(
                f"{key!r} ({', '.join(attributes)}): missing from {', '.join(missing)}"
            )
    return CheckResult(
        "static i18n keys",
        not problems,
        (
            f"{len(html_keys)} HTML translation key(s) exist in both en and ja"
            if not problems
            else f"{len(problems)} HTML translation key(s) are incomplete"
        ),
        problems,
    )


def check_participant_link(tokens: Sequence[JSToken]) -> CheckResult:
    open_index, close_index = const_object(
        tokens, "PARTICIPANT_LINK", allow_wrapper=True
    )
    properties = object_property_spans(tokens, open_index, close_index)
    if "parameterNames" not in properties:
        raise StaticParseError("PARTICIPANT_LINK has no parameterNames property")
    parameter_start, parameter_end = properties["parameterNames"]
    array_open = next(
        (
            index
            for index in range(parameter_start, parameter_end)
            if tokens[index].value == "["
        ),
        None,
    )
    if array_open is None:
        raise StaticParseError("PARTICIPANT_LINK.parameterNames is not an array")
    array_close = matching_token(tokens, array_open)
    parameter_names = [
        token.value
        for token in tokens[array_open + 1 : array_close]
        if token.kind == "string"
    ]
    if not parameter_names:
        raise StaticParseError("PARTICIPANT_LINK.parameterNames is empty")

    bodies = extract_function_bodies(tokens)
    if "participantLinkParameters" not in bodies:
        raise StaticParseError("could not find function participantLinkParameters()")
    writer_open, writer_close = bodies["participantLinkParameters"]
    written = method_literal_arguments(
        tokens, writer_open, writer_close, {"set", "append"}
    )

    reachable = reachable_function_names(
        tokens,
        bodies,
        "parseParticipantLink",
        # The parser calls the writer to construct a canonical representation.
        # Do not let writer literals masquerade as parser reads.
        excluded={"participantLinkParameters"},
    )
    parser_mentions: set[str] = set()
    declared_parameters = set(parameter_names)
    for name in reachable:
        body_open, body_close = bodies[name]
        parser_mentions.update(
            method_literal_arguments(tokens, body_open, body_close, {"get", "getAll"})
        )
        parser_mentions.update(
            token.value
            for token in tokens[body_open + 1 : body_close]
            if token.kind in {"identifier", "string"}
            and token.value in declared_parameters
        )

    problems: list[str] = []
    duplicate_declarations = sorted(
        name for name, count in Counter(parameter_names).items() if count != 1
    )
    if duplicate_declarations:
        problems.append(
            "duplicate parameterNames entries: " + ", ".join(duplicate_declarations)
        )

    for name in parameter_names:
        count = written[name]
        if count == 0:
            problems.append(f"{name!r}: not emitted by participantLinkParameters()")
        elif count != 1:
            problems.append(
                f"{name!r}: emitted {count} times by participantLinkParameters()"
            )
        if name not in parser_mentions:
            problems.append(
                f"{name!r}: no explicit handling found on the parseParticipantLink() call path"
            )

    unexpected_written = sorted(set(written) - declared_parameters)
    if unexpected_written:
        problems.append(
            "writer emits parameter(s) absent from parameterNames: "
            + ", ".join(unexpected_written)
        )

    return CheckResult(
        "participant-link parameters",
        not problems,
        (
            f"{len(parameter_names)} declared parameter(s) are emitted and parsed"
            if not problems
            else f"{len(problems)} participant-link parameter problem(s)"
        ),
        problems,
    )


def check_script_order(parser: ContractHTMLParser) -> CheckResult:
    basenames = [Path(urlsplit(source).path).name for source in parser.script_sources]
    policy_positions = [
        index for index, name in enumerate(basenames) if name == "deployment_policy.js"
    ]
    result_positions = [
        index for index, name in enumerate(basenames) if name == "result_bundle.js"
    ]
    safety_positions = [
        index for index, name in enumerate(basenames) if name == "session_safety.js"
    ]
    script_positions = [
        index for index, name in enumerate(basenames) if name == "script.js"
    ]
    problems: list[str] = []
    if len(policy_positions) != 1:
        problems.append(
            f"expected one deployment_policy.js script tag, found {len(policy_positions)}"
        )
    if len(result_positions) != 1:
        problems.append(
            f"expected one result_bundle.js script tag, found {len(result_positions)}"
        )
    if len(safety_positions) != 1:
        problems.append(
            f"expected one session_safety.js script tag, found {len(safety_positions)}"
        )
    if len(script_positions) != 1:
        problems.append(f"expected one script.js script tag, found {len(script_positions)}")
    if (
        len(policy_positions) == 1
        and len(script_positions) == 1
        and policy_positions[0] >= script_positions[0]
    ):
        problems.append("deployment_policy.js must appear before script.js")
    if (
        len(result_positions) == 1
        and len(script_positions) == 1
        and result_positions[0] >= script_positions[0]
    ):
        problems.append("result_bundle.js must appear before script.js")
    if (
        len(safety_positions) == 1
        and len(script_positions) == 1
        and safety_positions[0] >= script_positions[0]
    ):
        problems.append("session_safety.js must appear before script.js")
    return CheckResult(
        "script tag order",
        not problems,
        (
            "deployment_policy.js, session_safety.js, and result_bundle.js appear once before script.js"
            if not problems
            else f"{len(problems)} script tag order problem(s)"
        ),
        problems,
    )


def check_deployment_contract(tokens: Sequence[JSToken]) -> CheckResult:
    expected_assets = {
        "deployment-config.json",
        "deployment_policy.js",
        "index.html",
        "result_bundle.js",
        "session_safety.js",
        "script.js",
    }
    assets: list[str] = []
    for index in range(len(tokens) - 3):
        if (
            tokens[index].value == "const"
            and tokens[index + 1].value == "APP_BUILD_ASSETS"
            and tokens[index + 2].value == "="
        ):
            array_open = next(
                (
                    position
                    for position in range(index + 3, min(index + 40, len(tokens)))
                    if tokens[position].value in {"[", ";"}
                ),
                None,
            )
            if array_open is None or tokens[array_open].value != "[":
                raise StaticParseError("APP_BUILD_ASSETS is not initialized from an array")
            array_close = matching_token(tokens, array_open)
            assets = [
                token.value
                for token in tokens[array_open + 1 : array_close]
                if token.kind == "string"
            ]
            if any(token.value == "DEPLOYMENT_CONFIG_FILE" for token in tokens[array_open + 1 : array_close]):
                assets.append("deployment-config.json")
            break
    if not assets:
        raise StaticParseError("could not find APP_BUILD_ASSETS")

    problems: list[str] = []
    if set(assets) != expected_assets or len(assets) != len(expected_assets):
        problems.append(
            "APP_BUILD_ASSETS must contain each frozen deployment/application asset exactly once"
        )
    try:
        raw_config = json.loads(DEPLOYMENT_CONFIG_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        problems.append(f"deployment-config.json is not readable canonical JSON: {error}")
        raw_config = {}
    required_config_keys = {
        "schema_version",
        "deployment_id",
        "environment",
        "research_session_enabled",
        "researcher_ui_enabled",
        "researcher_origin",
        "participant_origin",
        "public_participant_base_url",
        "allowed_return_url_origins",
        "local_test_sessions_enabled",
    }
    if set(raw_config) != required_config_keys:
        problems.append("deployment-config.json keys do not match schema 1")
    if raw_config.get("schema_version") != 1:
        problems.append("deployment-config.json schema_version must be 1")
    issuance_gate_mentions = sum(
        token.kind == "identifier" and token.value == "participantLinkIssuanceAllowed"
        for token in tokens
    )
    if issuance_gate_mentions < 2:
        problems.append(
            "script.js must use participantLinkIssuanceAllowed for both UI state and link construction"
        )
    return CheckResult(
        "deployment contract",
        not problems,
        (
            "deployment config, remote-link issuance gate, and all six frozen build assets are bound to the UI"
            if not problems
            else f"{len(problems)} deployment contract problem(s)"
        ),
        problems,
    )


def check_default_language(parser: ContractHTMLParser) -> CheckResult:
    problems: list[str] = []
    if len(parser.html_elements) != 1:
        problems.append(f"expected one <html> element, found {len(parser.html_elements)}")
    elif (parser.html_elements[0].get("lang") or "").lower() != "en":
        problems.append(
            f"default document language is {parser.html_elements[0].get('lang')!r}, not 'en'"
        )

    if len(parser.english_toggles) != 1:
        problems.append(
            f"expected one English language toggle, found {len(parser.english_toggles)}"
        )
    else:
        toggle = parser.english_toggles[0]
        if (toggle.get("aria-pressed") or "").lower() != "true":
            problems.append("English language toggle does not have aria-pressed=\"true\"")
        if toggle.get("id") != "langEn":
            problems.append("English language toggle does not have id=\"langEn\"")
        if toggle.get("data-language") != "en":
            problems.append("English language toggle does not have data-language=\"en\"")

    return CheckResult(
        "default language",
        not problems,
        (
            "document defaults to en and the English toggle is pressed"
            if not problems
            else f"{len(problems)} default-language problem(s)"
        ),
        problems,
    )


def check_researcher_wizard(
    parser: ContractHTMLParser, tokens: Sequence[JSToken]
) -> CheckResult:
    problems: list[str] = []
    required_ids = {
        "researcherStepIndicator1",
        "researcherStepIndicator2",
        "researcherStepIndicator3",
        "researcherStepStudy",
        "researcherStepTasks",
        "researcherStepLaunch",
        "researcherStudyNext",
        "researcherTasksBack",
        "researcherTasksNext",
        "researcherLaunchBack",
        "participantHandoff",
        "invitationParticipantCode",
        "generateParticipantCode",
        "copyParticipantInstructions",
    }
    for element_id in sorted(required_ids):
        if parser.ids[element_id] != 1:
            problems.append(
                f"#{element_id}: expected exactly once, found {parser.ids[element_id]}"
            )

    panel_ids = ("researcherStepStudy", "researcherStepTasks", "researcherStepLaunch")
    for step, panel_id in enumerate(panel_ids, start=1):
        attributes = parser.attributes_by_id.get(panel_id, {})
        if attributes.get("data-researcher-step") != str(step):
            problems.append(f"#{panel_id}: data-researcher-step must be {step}")
        if attributes.get("tabindex") != "-1":
            problems.append(f"#{panel_id}: must be programmatically focusable")
        if step == 1 and "hidden" in attributes:
            problems.append(f"#{panel_id}: first step must be initially visible")
        if step > 1 and "hidden" not in attributes:
            problems.append(f"#{panel_id}: later steps must be initially hidden")

    handoff = parser.attributes_by_id.get("participantHandoff", {})
    if "hidden" not in handoff:
        problems.append("#participantHandoff: must remain hidden until a link is created")

    bodies = extract_function_bodies(tokens)
    required_functions = {
        "showResearcherStep",
        "continueResearcherStudy",
        "continueResearcherTasks",
        "validateResearcherMetadataForm",
        "generateParticipantCode",
        "copyParticipantInstructions",
    }
    for function_name in sorted(required_functions):
        if function_name not in bodies:
            problems.append(f"script.js has no {function_name}() function")

    return CheckResult(
        "researcher wizard",
        not problems,
        (
            "three focused steps, field validation, and participant handoff controls are present"
            if not problems
            else f"{len(problems)} researcher-wizard contract problem(s)"
        ),
        problems,
    )


def run_check(name: str, check) -> CheckResult:
    try:
        return check()
    except (StaticParseError, ValueError) as error:
        return CheckResult(name, False, "static analysis could not complete", [str(error)])


def main() -> int:
    try:
        html_source = HTML_PATH.read_text(encoding="utf-8")
        script_source = SCRIPT_PATH.read_text(encoding="utf-8")
    except OSError as error:
        print(f"ERROR: could not read contract input: {error}", file=sys.stderr)
        return 2

    parser = ContractHTMLParser()
    try:
        parser.feed(html_source)
        parser.close()
        tokens = tokenize_javascript(script_source)
    except (StaticParseError, ValueError) as error:
        print(f"ERROR: could not parse contract input: {error}", file=sys.stderr)
        return 2

    checks = [
        run_check(
            "getElementById literals", lambda: check_element_ids(parser, tokens)
        ),
        run_check("static i18n keys", lambda: check_i18n(parser, tokens)),
        run_check(
            "participant-link parameters", lambda: check_participant_link(tokens)
        ),
        run_check("script tag order", lambda: check_script_order(parser)),
        run_check("deployment contract", lambda: check_deployment_contract(tokens)),
        run_check("default language", lambda: check_default_language(parser)),
        run_check(
            "researcher wizard", lambda: check_researcher_wizard(parser, tokens)
        ),
    ]

    print(f"UI contract verification: {HTML_PATH.name} <-> {SCRIPT_PATH.name}")
    for result in checks:
        label = "PASS" if result.passed else "FAIL"
        print(f"[{label}] {result.name}: {result.summary}")
        for detail in result.details:
            print(f"       - {detail}")

    failed = sum(not result.passed for result in checks)
    if failed:
        print(f"FAILED: {failed} of {len(checks)} contract checks failed")
        return 1
    print(f"PASSED: all {len(checks)} contract checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
