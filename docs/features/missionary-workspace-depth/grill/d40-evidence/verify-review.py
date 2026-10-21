#!/usr/bin/env python3
"""Verify D40 review documentation without running any earlier program.

This checker reads only local documentation and frozen evidence. Its output is
structural evidence, not application, database, provider, or usability proof.
"""

from __future__ import annotations

import hashlib
import html
import json
from pathlib import Path
import re
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[5]
GRILL = ROOT / "docs/features/missionary-workspace-depth/grill"
EVIDENCE = GRILL / "d40-evidence"
REPORT = EVIDENCE / "review-verification.json"
FILES = {
    "d40": GRILL / "phase28-d40-informational-missed-gift-adversarial-review.md",
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


def validate_frozen_evidence() -> dict[str, object]:
    """Read/hash the explicit evidence-manifest chain; never import its code.

    Artifact-pin/runtime reports are opaque frozen files, not recursive current
    claims: their recorded hashes may intentionally describe earlier documents.
    Only prior/ratification evidence manifests identify the frozen chain.
    """
    queue = [EVIDENCE / "prior-evidence-sha256.json"]
    seen_manifests: set[Path] = set()
    verified: dict[Path, str] = {}
    manifest_results: list[dict[str, object]] = []
    while queue:
        manifest_path = queue.pop(0)
        if manifest_path in seen_manifests:
            continue
        seen_manifests.add(manifest_path)
        manifest = json.loads(manifest_path.read_text())
        if isinstance(manifest.get("artifacts"), list):
            records = manifest["artifacts"]
            entries = {item["path"]: item["sha256"] for item in records}
            require(len(entries) == len(records), f"Duplicate frozen paths: {manifest_path}")
        else:
            entries = manifest.get("sha256", manifest)
        require(isinstance(entries, dict), f"Invalid manifest mapping: {manifest_path}")
        if not isinstance(entries, dict):
            continue
        if manifest_path == EVIDENCE / "prior-evidence-sha256.json":
            require(len(entries) == 16, "D40 manifest must preserve exactly sixteen entries")
        passed = 0
        for relative, expected in entries.items():
            require(isinstance(expected, str) and re.fullmatch(r"[0-9a-f]{64}", expected) is not None, f"Invalid frozen digest: {manifest_path}: {relative}")
            if relative.startswith("docs/"):
                path = (ROOT / relative).resolve()
            elif re.match(r"d\d+-evidence/", relative):
                path = (GRILL / relative).resolve()
            else:
                path = (manifest_path.parent / relative).resolve()
            require(path.is_relative_to(ROOT), f"Manifest escapes root: {relative}")
            if not path.is_relative_to(ROOT):
                continue
            if not path.is_file():
                errors.append(f"Missing frozen evidence: {relative} in {manifest_path.relative_to(ROOT)}")
                continue
            actual = verified.setdefault(path, digest(path))
            if actual != expected:
                errors.append(f"Frozen evidence changed: {relative} in {manifest_path.relative_to(ROOT)}")
                continue
            passed += 1
            if path.name in {"prior-evidence-sha256.json", "ratification-evidence-sha256.json"}:
                queue.append(path)
        manifest_results.append({"manifest": str(manifest_path.relative_to(ROOT)), "entries": len(entries), "passed": passed})
    return {"current_manifest_entries": manifest_results[0]["entries"], "current_manifest_passed": manifest_results[0]["passed"], "manifests_checked": len(manifest_results), "unique_frozen_files_checked": len(verified), "manifest_entry_checks": sum(item["entries"] for item in manifest_results), "manifest_entry_passed": sum(item["passed"] for item in manifest_results), "manifests": manifest_results}


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
    # D40 intentionally links this new output; create a placeholder before the
    # link pass without touching any prior report.
    if not REPORT.exists():
        REPORT.write_text(json.dumps({"status": "not_run", "scope": "D40 documentation review only"}, indent=2) + "\n")

    checks["frozen_evidence"] = validate_frozen_evidence()
    for label, path in FILES.items():
        require(path.is_file(), f"Missing current document: {label}: {path.relative_to(ROOT)}")
    if any(not path.is_file() for path in FILES.values()):
        write_report()
        return

    documents = {key: path.read_text() for key, path in FILES.items()}
    current = documents["d40"]
    require(bool(section(current, "Exact corrected decision to record")), "D40 exact decision is missing")
    clauses = re.findall(r"^- \*\*(C\d{2})\b", section(current, "Exact required amendments"), re.M)
    require(clauses == [f"C{i:02}" for i in range(1, 23)], "Expected exactly C01–C22 in order")
    concerns = re.findall(r"^\| (F\d{2})\s*\|", section(current, "Concern register"), re.M)
    require(concerns == [f"F{i:02}" for i in range(1, 16)], "Expected exactly F01–F15 in order")
    criteria = re.findall(r"^\| (P\d{2})\s*\|", section(current, "Falsifiable acceptance criteria and edge-case pressure test"), re.M)
    require(criteria == [f"P{i:02}" for i in range(1, 35)], "Expected exactly P01–P34 in order")
    expected_categories = [
        "Problem validity, necessity, and alternatives", "Brittleness", "Technical debt", "Edge cases", "Footguns", "Tenant safety", "Database, RLS, and authorization safety", "Overengineering", "UX/UI and user friction", "Source of truth, ownership, and domain invariants", "Hidden coupling", "Failure modes", "Lifecycle, temporal correctness, concurrency, and idempotency", "Data integrity risks", "Security and privacy risks", "Scalability and performance risks", "Operational burden", "Observability and auditability gaps", "Dependency and integration risks", "Migration, rollout, and upgrade risks", "Testability, traceability, and proof", "Other development hazards",
    ]
    category_rows = []
    for line in section(current, "Category-by-category adversarial review").splitlines():
        if line.startswith("|"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if len(cells) >= 3 and cells[0] in expected_categories:
                category_rows.append(cells)
    require([row[0] for row in category_rows] == expected_categories, "All twenty-two requested categories must appear exactly once in order")
    yes = sum(row[1].startswith("Yes") for row in category_rows)
    no = sum(row[1].startswith("No") for row in category_rows)
    require((yes, no) == (21, 1), "Expected twenty-one material-concern rows and one no-additional-concern row")
    # References may use compact slash or en-dash notation; all explicit IDs
    # must belong to this review's declared catalogs.
    for prefix, allowed in (("C", set(clauses)), ("F", set(concerns)), ("P", set(criteria))):
        for identifier in re.findall(rf"\b{prefix}\d{{2}}\b", current):
            require(identifier in allowed, f"Undeclared D40 reference: {identifier}")
    checks["review_structure"] = {"clauses": len(clauses), "concerns": len(concerns), "categories": len(category_rows), "material_concern_yes": yes, "no_additional_concern": no, "acceptance_criteria": len(criteria)}

    require("pending explicit ratification" in normalized(current[:1800]).lower(), "D40 must retain pending explicit ratification status")
    require(re.search(r"selected\s+(?:\*\*)?(?:Q40\s+)?A\b", current[:1800]) is not None, "D40 must record selected A")
    require("Q40 is answered A" in documents["q40"][:1800] and "pending explicit ratification" in normalized(documents["q40"][:1800]).lower(), "Q40 must record answered A with amendments pending ratification")
    require(re.search(r"\*\*Informational recurring miss\*\* \(Phase 28 D40, selected; amendments reviewed\)", documents["glossary"]) is not None, "CONTEXT must retain selected/reviewed D40 term status")
    d40_rows = [line for line in documents["session"].splitlines() if re.match(r"\| D40\b", line)]
    require(len(d40_rows) == 1 and "A selected" in d40_rows[0] and "pending explicit ratification" in d40_rows[0], "Session D40 register must record selected A and pending ratification")
    require(not list(GRILL.glob("phase28-d41-*")) and not list(GRILL.glob("phase28-q41-*")), "A Q41/D41 artifact was introduced before D40 ratification")
    require(not re.search(r"(?m)^(?:\| [DQ]41\b|#{1,6} [DQ]41\b)", documents["session"]), "Session introduces Q41/D41 in this answer review")
    checks["status"] = {"d40": "A selected; amendments pending explicit ratification", "q40": "answered A; amendments pending explicit ratification", "glossary": "selected; amendments reviewed", "session": "A selected; amendments pending explicit ratification", "q41_and_d41": "absent"}
    evidence_markdown = sorted(EVIDENCE.glob("*.md"))
    checks["references"] = validate_links([FILES[key] for key in ("d40", "q40", "session")] + evidence_markdown)
    checks["references"]["markdown_documents_checked"] = 3 + len(evidence_markdown)
    write_report()


def write_report() -> None:
    report = {
        "status": "failed" if errors else "passed",
        "date": "2026-10-18",
        "timezone": "Asia/Bangkok",
        "scope": "D40 selected-answer review documentation only",
        "checks": checks,
        "current_sha256": {str(path.relative_to(ROOT)): digest(path) for path in [*FILES.values(), *sorted(EVIDENCE.glob("*.md")), Path(__file__).resolve()] if path.is_file()},
        "limitations": [
            "No prior verification, model, probe or example program was executed.",
            "No application, database, RLS, provider, accessibility, usability or performance behavior was tested.",
            "Local Markdown file/line/heading/explicit-HTML-anchor references were checked; external URL availability was not tested.",
            "Selected A and reviewed amendments do not establish ratification, formal specification publication, implementation, qualification or activation.",
            "Recursive evidence checks cover only the explicit prior/ratification evidence manifests; old artifact-pin or runtime reports remain opaque preserved evidence, not current runtime claims.",
        ],
        "errors": errors,
    }
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"status": report["status"], "checks": checks, "errors": errors}, indent=2, ensure_ascii=False))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
