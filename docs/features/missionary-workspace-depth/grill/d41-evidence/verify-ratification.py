#!/usr/bin/env python3
"""Verify D41 ratification documentation without running any earlier program.

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
EVIDENCE = GRILL / "d41-evidence"
REPORT = EVIDENCE / "ratification-verification.json"
FILES = {
    "d41": GRILL / "phase28-d41-native-contact-work-adversarial-review.md",
    "q41": GRILL / "phase28-q41-external-contact-continuity-research.md",
    "coverage": GRILL / "phase28-post-d41-coverage-synthesis.md",
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
    queue = [EVIDENCE / "ratification-evidence-sha256.json"]
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
            require(len(entries) == 17, "D41 manifest must preserve exactly seventeen entries")
        if manifest_path == EVIDENCE / "ratification-evidence-sha256.json":
            require(len(entries) == 11, "D41 ratification manifest must preserve exactly eleven entries")
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
    # D41 intentionally links this new output; create a placeholder before the
    # link pass without touching any prior report.
    if not REPORT.exists():
        REPORT.write_text(json.dumps({"status": "not_run", "scope": "D41 documentation ratification only"}, indent=2) + "\n")

    checks["frozen_evidence"] = validate_frozen_evidence()
    for label, path in FILES.items():
        require(path.is_file(), f"Missing current document: {label}: {path.relative_to(ROOT)}")
    if any(not path.is_file() for path in FILES.values()):
        write_report()
        return

    documents = {key: path.read_text() for key, path in FILES.items()}
    current = documents["d41"]
    before = (EVIDENCE / "d41-before-ratification.txt").read_text()
    require(bool(section(current, "Exact corrected decision to record")), "D41 exact decision is missing")
    quote = lambda value: "\n".join(line[1:].lstrip() for line in value.splitlines() if line.startswith(">"))
    require(normalized(quote(section(before, "Exact corrected decision to record"))) == normalized(quote(section(current, "Exact corrected decision to record"))), "Exact D41 decision changed beyond whitespace formatting")
    before_clauses = section(before, "Exact required amendments").split("- **C01", 1)[1]
    current_clauses = section(current, "Exact required amendments").split("- **C01", 1)[1]
    require(normalized(before_clauses) == normalized(current_clauses), "C01–C16 changed beyond whitespace formatting")
    # Ignore only table separator widths in addition to ordinary whitespace;
    # preserve every substantive character and mapping in these sections.
    normalize_section = lambda value: normalized(re.sub(r"(?m)^\|\s*-[-| :]*\|\s*$", "", value))
    for heading in ("Consolidated adversarial concerns", "Every requested category", "Falsifiable acceptance criteria and pressure tests"):
        require(normalize_section(section(before, heading)) == normalize_section(section(current, heading)), f"Ratification changed {heading} beyond whitespace formatting")
    checks["preserved_substance"] = {"exact_decision": "unchanged", "amendment_clauses": "unchanged", "concern_register": "unchanged", "category_matrix_and_mappings": "unchanged", "acceptance_criteria": "unchanged"}
    clauses = re.findall(r"^- \*\*(C\d{2})\b", section(current, "Exact required amendments"), re.M)
    require(clauses == [f"C{i:02}" for i in range(1, 17)], "Expected exactly C01–C16 in order")
    concerns = re.findall(r"^\| (F\d{2})\s*\|", section(current, "Consolidated adversarial concerns"), re.M)
    require(concerns == [f"F{i:02}" for i in range(1, 13)], "Expected exactly F01–F12 in order")
    criteria = re.findall(r"^\| (P\d{2})\s*\|", section(current, "Falsifiable acceptance criteria and pressure tests"), re.M)
    require(criteria == [f"P{i:02}" for i in range(1, 31)], "Expected exactly P01–P30 in order")
    expected_categories = [
        "Problem validity, necessity, and alternatives", "Brittleness", "Technical debt", "Edge cases", "Footguns", "Tenant safety", "Database, RLS, and authorization safety", "Overengineering", "UX/UI and user friction", "Source of truth, ownership, and domain invariants", "Hidden coupling", "Failure modes", "Lifecycle, temporal correctness, concurrency, and idempotency", "Data integrity risks", "Security and privacy risks", "Scalability and performance risks", "Operational burden", "Observability and auditability gaps", "Dependency and integration risks", "Migration, rollout, and upgrade risks", "Testability, traceability, and proof", "Other development hazards",
    ]
    category_rows = []
    for line in section(current, "Every requested category").splitlines():
        if line.startswith("|"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if len(cells) >= 3 and cells[0] in expected_categories:
                category_rows.append(cells)
    require([row[0] for row in category_rows] == expected_categories, "All twenty-two requested categories must appear exactly once in order")
    yes = sum(row[1].startswith("Yes") for row in category_rows)
    no = sum(row[1].startswith("No") for row in category_rows)
    require((yes, no) == (20, 2), "Expected twenty material-concern rows and two no-material-concern rows")
    # References may use compact slash or en-dash notation; all explicit IDs
    # must belong to this review's declared catalogs.
    for prefix, allowed in (("C", set(clauses)), ("F", set(concerns))):
        for identifier in re.findall(rf"\b{prefix}\d{{2}}\b", current):
            require(identifier in allowed, f"Undeclared D41 reference: {identifier}")
    # P31 is also an owner-phase name, including inside evidence matrices.
    # Criterion identity/order is checked from the explicit acceptance table;
    # this checker does not pretend to resolve ambiguous prose abbreviations.
    checks["review_structure"] = {"clauses": len(clauses), "concerns": len(concerns), "categories": len(category_rows), "material_concern_yes": yes, "no_additional_concern": no, "acceptance_criteria": len(criteria)}

    require("explicitly ratified" in normalized(current[:1800]).lower() and "pending explicit ratification" not in normalized(current[:1800]).lower(), "D41 must record explicit ratification")
    require(re.search(r"selected\s+(?:\*\*)?(?:Q41\s+)?B\b", current[:1800]) is not None, "D41 must record selected B")
    require("Q41 is answered B" in documents["q41"][:1800] and "explicitly ratified" in normalized(documents["q41"][:1800]).lower() and "pending explicit ratification" not in normalized(documents["q41"][:1800]).lower(), "Q41 must record answered B with explicitly ratified amendments")
    glossary_status = re.search(r"\*\*Contact-update feed\*\* \(Phase 28 D41,([^)]*)\):", documents["glossary"])
    require(glossary_status is not None and "ratified" in glossary_status.group(1) and "pending" not in glossary_status.group(1), "CONTEXT must record ratified D41 contact-feed release exclusion")
    d41_rows = [line for line in documents["session"].splitlines() if re.match(r"\| D41\b", line)]
    require(len(d41_rows) == 1 and "ratified" in d41_rows[0].lower() and "pending" not in d41_rows[0].lower(), "Session D41 register must record explicit ratification")
    require("### D41 explicit ratification" in documents["session"], "Session lacks D41 ratification record")
    require(not list(GRILL.glob("phase28-d42-*")) and not list(GRILL.glob("phase28-q42-*")), "No unsupported Q42/D42 artifact should be introduced")
    require(not re.search(r"(?m)^(?:\| [DQ]42\b|#{1,6} [DQ]42\b)", documents["session"]), "Session introduces an unsupported Q42/D42 question or decision")
    selected_only = ["D1", "D3", "D6", "D11", "D12", "D13"]
    for decision in selected_only:
        rows = [line for line in documents["session"].splitlines() if re.match(rf"\| {decision}\b", line)]
        status_cell = rows[0].split("|")[2].lower() if len(rows) == 1 else ""
        require(len(rows) == 1 and "selected" in status_cell and "ratified" not in status_cell, f"{decision} must preserve its selected/reviewed status without blanket ratification")
    require("/to-prd" in documents["coverage"] and "/to-issues" in documents["coverage"], "Coverage synthesis must preserve the separate formal transition boundaries")
    require(bool(documents["coverage"].strip()), "Post-D41 coverage synthesis is empty")
    checks["status"] = {"d41": "explicitly ratified", "q41": "answered B; amendments explicitly ratified", "glossary": "ratified contact-feed release exclusion", "session": "explicitly ratified", "selected_only_preserved": selected_only, "continuation": "post-D41 coverage synthesis; formal transition boundaries retained", "q42_and_d42": "absent"}
    evidence_markdown = sorted(EVIDENCE.glob("*.md"))
    checks["references"] = validate_links([FILES[key] for key in ("d41", "q41", "coverage", "session", "glossary")] + evidence_markdown)
    checks["references"]["markdown_documents_checked"] = 5 + len(evidence_markdown)
    write_report()


def write_report() -> None:
    report = {
        "status": "failed" if errors else "passed",
        "date": "2026-10-18",
        "timezone": "Asia/Bangkok",
        "scope": "D41 ratification and post-D41 coverage synthesis documentation only",
        "checks": checks,
        "current_sha256": {str(path.relative_to(ROOT)): digest(path) for path in [*FILES.values(), *sorted(EVIDENCE.glob("*.md")), Path(__file__).resolve()] if path.is_file()},
        "limitations": [
            "No prior verification, model, probe or example program was executed.",
            "No application, database, RLS, provider, accessibility, usability or performance behavior was tested.",
            "Local Markdown file/line/heading/explicit-HTML-anchor references were checked; external URL availability was not tested.",
            "Ratification establishes accepted intended behavior, not formal specification publication, implementation, qualification or activation.",
            "Line-bound validation verifies only that a cited local line exists, not that its current contents prove the surrounding business claim.",
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
