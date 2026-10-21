#!/usr/bin/env python3
"""Verify D39 ratification documentation without running any earlier program.

This checker reads only local documentation and frozen evidence. Its output is
structural evidence, not application, database, provider, or usability proof.
"""

from __future__ import annotations

import hashlib
import html
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[5]
GRILL = ROOT / "docs/features/missionary-workspace-depth/grill"
EVIDENCE = GRILL / "d39-evidence"
REPORT = EVIDENCE / "ratification-verification.json"
FILES = {
    "d39": GRILL / "phase28-d39-original-referral-clock-adversarial-review.md",
    "q39": GRILL / "phase28-q39-initial-referral-clock-research.md",
    "q40": GRILL / "phase28-q40-missed-recurring-gift-review-research.md",
    "session": GRILL / "phase28-session.md",
    "glossary": ROOT / "CONTEXT.md",
}
errors: list[str] = []
checks: dict[str, object] = {}


def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized(value: str) -> str:
    return " ".join(value.split())


def section(document: str, heading: str) -> str:
    marker = "## " + heading + "\n"
    require(marker in document, f"Missing section: {heading}")
    if marker not in document:
        return ""
    body = document.split(marker, 1)[1]
    return body.split("\n## ", 1)[0]


def validate_manifest(name: str, expected_count: int) -> dict[str, object]:
    manifest = json.loads((EVIDENCE / name).read_text())
    entries = manifest["sha256"]
    require(len(entries) == expected_count, f"{name}: expected {expected_count} entries")
    passed = 0
    for relative, expected in entries.items():
        path = (ROOT / relative).resolve()
        require(path.is_relative_to(ROOT), f"Manifest escapes root: {relative}")
        if not path.is_relative_to(ROOT):
            continue
        if not path.is_file():
            errors.append(f"Missing frozen evidence: {relative}")
        elif digest(path) != expected:
            errors.append(f"Frozen evidence changed: {relative}")
        else:
            passed += 1
    return {"entries": len(entries), "passed": passed}


def strip_code(document: str) -> str:
    """Blank fenced/inline code while retaining offsets for useful diagnostics."""
    blank = lambda match: re.sub(r"[^\n]", " ", match.group())
    document = re.sub(r"(?ms)^([ \t]*)(`{3,}|~{3,})[^\n]*\n.*?^\1\2[ \t]*$", blank, document)
    return re.sub(r"(`+)([^`]|(?!\1)`)*?\1", blank, document)


def anchors(document: str) -> set[str]:
    result = set(re.findall(r"<(?:a|[A-Za-z][\w:-]*)\b[^>]*\b(?:id|name)=[\"']([^\"']+)[\"']", document))
    seen: dict[str, int] = {}
    # Retain inline-code heading text; only fenced blocks are excluded.
    fence = False
    for line in document.splitlines():
        if re.match(r"^\s*(`{3,}|~{3,})", line):
            fence = not fence
            continue
        if fence:
            continue
        match = re.match(r"^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$", line)
        if not match:
            continue
        label = html.unescape(match.group(1))
        label = re.sub(r"!?\[([^]]+)\]\([^)]*\)", r"\1", label)
        label = re.sub(r"<[^>]*>", "", label)
        slug = re.sub(r"[^\w\s-]", "", label.lower()).replace(" ", "-")
        slug = re.sub(r"[\t\r\n]", "-", slug)
        ordinal = seen.get(slug, 0)
        seen[slug] = ordinal + 1
        result.add(slug if ordinal == 0 else f"{slug}-{ordinal}")
    return result


def validate_links(paths: list[Path]) -> dict[str, int]:
    counts = {"local_references": 0, "line_references": 0, "anchor_references": 0}
    for source in paths:
        document = strip_code(source.read_text())
        # Repository links use ordinary or angle-bracket destinations. Optional
        # Markdown titles are excluded from the destination.
        for match in re.finditer(r"!?\[[^\]\n]*\]\(\s*(<[^>\n]+>|[^\s)]+)(?:\s+[\"'][^\n]*?[\"'])?\s*\)", document):
            destination = html.unescape(match.group(1).strip("<>"))
            if re.match(r"(?:https?|mailto|tel|app|codex|skill|data|javascript):", destination, re.I) or destination.startswith("//") or "://" in destination:
                continue
            base, _, fragment = destination.partition("#")
            base = unquote(base).split("?", 1)[0]
            fragment = unquote(fragment)
            line_number = None
            line_match = re.search(r":([0-9]+)$", base)
            if line_match:
                line_number = int(line_match.group(1))
                base = base[:line_match.start()]
            target = (source.parent / base).resolve() if base else source
            location = f"{source.relative_to(ROOT)}:{document[:match.start()].count(chr(10)) + 1}"
            counts["local_references"] += 1
            if not target.exists():
                errors.append(f"{location}: missing link target {destination}")
                continue
            if line_number is not None:
                counts["line_references"] += 1
                require(target.is_file(), f"{location}: line target is not a file")
                if target.is_file():
                    total = len(target.read_text().splitlines())
                    require(1 <= line_number <= total, f"{location}: line {line_number} outside {total} lines in {base}")
            if fragment:
                counts["anchor_references"] += 1
                require(target.is_file(), f"{location}: anchor target is not a file")
                if target.is_file():
                    require(fragment in anchors(target.read_text()), f"{location}: missing anchor #{fragment} in {base or source.name}")
    return counts


def main() -> None:
    # D39 intentionally links this new output; create a placeholder before the
    # link pass without touching any prior report.
    if not REPORT.exists():
        REPORT.write_text(json.dumps({"status": "not_run", "scope": "D39 documentation ratification only"}, indent=2) + "\n")

    checks["preserved_d39_evidence_and_snapshots"] = validate_manifest("ratification-evidence-sha256.json", 12)
    checks["preserved_d38_evidence_and_original_q39"] = validate_manifest("prior-evidence-sha256.json", 15)
    for label, path in FILES.items():
        require(path.is_file(), f"Missing current document: {label}: {path.relative_to(ROOT)}")
    if any(not path.is_file() for path in FILES.values()):
        write_report()
        return

    documents = {key: path.read_text() for key, path in FILES.items()}
    before = (EVIDENCE / "d39-before-ratification.txt").read_text()
    current = documents["d39"]
    old_decision = section(before, "Exact corrected decision to record")
    new_decision = section(current, "Exact corrected decision to record")
    quote = lambda value: "\n".join(line for line in value.splitlines() if line.startswith(">"))
    require(normalized(quote(old_decision)) == normalized(quote(new_decision)), "Exact D39 corrected decision blockquote changed")
    old_convention = old_decision.split("The inclusive-day convention", 1)[1]
    new_convention = new_decision.split("The inclusive-day convention", 1)[1]
    require(normalized(old_convention.replace("these proposed", "these ratified", 1)) == normalized(new_convention), "Inclusive-day convention changed beyond proposed-to-ratified wording")

    old_amendments = section(before, "Exact required amendments").split("- **C01", 1)[1]
    new_amendments = section(current, "Exact required amendments").split("- **C01", 1)[1]
    require(normalized(old_amendments) == normalized(new_amendments), "C01–C17 amendment text changed")
    clauses = re.findall(r"^- \*\*(C\d{2})\b", section(current, "Exact required amendments"), re.M)
    require(clauses == [f"C{i:02}" for i in range(1, 18)], "Expected exactly C01–C17 in order")

    old_criteria = section(before, "Falsifiable acceptance criteria")
    new_criteria = section(current, "Falsifiable acceptance criteria")
    # Prettier may change only the Markdown table's divider width.
    table_normalize = lambda value: normalized(re.sub(r"(?m)^\|\s*-[-| :]*\|\s*$", "", value))
    require(table_normalize(old_criteria) == table_normalize(new_criteria), "P01–P26 acceptance criteria changed")
    criteria = re.findall(r"^\| (P\d{2})\s*\|", new_criteria, re.M)
    require(criteria == [f"P{i:02}" for i in range(1, 27)], "Expected exactly P01–P26 in order")
    checks["preserved_decision"] = {"blockquote": True, "inclusive_day_convention": "proposed-to-ratified status only", "amendments": len(clauses), "acceptance_criteria": len(criteria)}

    require("explicitly ratified" in current[:1800].lower(), "D39 lacks explicit ratified header status")
    require("explicitly ratified" in documents["q39"].lower(), "Q39 lacks explicit ratified status")
    require(re.search(r"\*\*Original referral date\*\* \(Phase 28 D39, ratified\)", documents["glossary"]) is not None, "CONTEXT Original referral date is not ratified")
    require(re.search(r"\*\*New referral period\*\* \(Phase 28 D38/D39, ratified\)", documents["glossary"]) is not None, "CONTEXT New referral period is not ratified")
    require("### D39 explicit ratification" in documents["session"], "Session lacks D39 explicit ratification")
    d39_rows = [line for line in documents["session"].splitlines() if re.match(r"\| D39\b", line)]
    require(bool(d39_rows) and all("ratified" in row.lower() and "pending" not in row.lower() for row in d39_rows), "Session D39 register is not ratified")
    require("unanswered" in documents["q40"][:2500].lower(), "Q40 must explicitly remain unanswered")
    require(not list(GRILL.glob("phase28-d40-*")), "D40 decision artifact exists before an answer")
    require(not re.search(r"(?m)^(?:\| D40\b|#{1,6} D40\b)", documents["session"]), "Session records a D40 decision before an answer")
    checks["status"] = {"d39": "ratified", "q39": "answered A and ratified", "glossary": "ratified", "session": "ratified", "q40": "unanswered", "d40": "absent"}
    checks["references"] = validate_links([FILES[key] for key in ("d39", "q39", "q40", "session")])
    write_report()


def write_report() -> None:
    report = {
        "status": "failed" if errors else "passed",
        "date": "2026-10-18",
        "timezone": "Asia/Bangkok",
        "scope": "D39 ratification and unanswered Q40 documentation only",
        "checks": checks,
        "current_sha256": {str(path.relative_to(ROOT)): digest(path) for path in [*FILES.values(), Path(__file__).resolve()] if path.is_file()},
        "limitations": [
            "No prior verification, model, probe or example program was executed.",
            "No application, database, RLS, provider, accessibility, usability or performance behavior was tested.",
            "Local Markdown file/line/heading/explicit-HTML-anchor references were checked; external URL availability was not tested.",
            "Ratification proves accepted intended behavior, not formal specification publication, implementation, qualification or activation.",
        ],
        "errors": errors,
    }
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"status": report["status"], "checks": checks, "errors": errors}, indent=2, ensure_ascii=False))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
