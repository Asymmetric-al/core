"""Verify D39 documentation and frozen evidence; never execute older programs."""

from pathlib import Path
from urllib.parse import unquote
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[5]
GRILL = ROOT / "docs/features/missionary-workspace-depth/grill"
EVIDENCE = GRILL / "d39-evidence"
MAIN = GRILL / "phase28-d39-original-referral-clock-adversarial-review.md"
QUESTION = GRILL / "phase28-q39-initial-referral-clock-research.md"
SESSION = GRILL / "phase28-session.md"
(EVIDENCE / "review-verification.json").write_text(
    json.dumps({"status": "running", "scope": "Documentation verification only"}, indent=2) + "\n"
)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


manifest = json.loads((EVIDENCE / "prior-evidence-sha256.json").read_text())
for path, expected in manifest["sha256"].items():
    assert digest(ROOT / path) == expected, f"Changed prior evidence: {path}"
assert len(manifest["sha256"]) == 15

old_report = json.loads((GRILL / "d38-evidence/ratification-verification.json").read_text())
for path, expected in old_report["current_artifact_sha256"].items():
    if path.endswith("phase28-session.md") or path.endswith("phase28-q39-initial-referral-clock-research.md") or path == "CONTEXT.md":
        continue
    assert digest(ROOT / path) == expected, f"Changed retained D38 artifact: {path}"

text = MAIN.read_text()
assert "**Disposition: Accept with required amendments.**" in text
assert "**reviewed, pending explicit ratification**" in text
clauses = re.findall(r"^- \*\*(C\d{2}) —", text, re.M)
proofs = re.findall(r"^\| (P\d{2})\s*\|", text, re.M)
assert clauses == [f"C{i:02}" for i in range(1, 18)], clauses
assert proofs == [f"P{i:02}" for i in range(1, 27)], proofs
review = text.split("## Category-by-category adversarial review", 1)[1].split("## Falsifiable acceptance criteria", 1)[0]
rows = re.findall(r"^\|\s*(\d+)\s*\|[^\n]+", review, re.M)
assert rows == [str(i) for i in range(1, 23)], rows
assert len(re.findall(r"\*\*Yes —", review)) == 21
assert "**No additional material concern" in review
assert "**Q39 is answered A.**" in QUESTION.read_text()
assert "**Q39 is unanswered" not in QUESTION.read_text()
assert "### D39 answer, calendar clarification and completed adversarial review" in SESSION.read_text()
assert "**Q39 is unanswered" not in SESSION.read_text()
assert "**Original referral date** (Phase 28 D39, selected; amendments reviewed)" in (ROOT / "CONTEXT.md").read_text()
assert "separate mistaken-expiry correction" in text
assert "Continued SHALL retain D36" in text

examples = json.loads((EVIDENCE / "calendar-examples.json").read_text())
assert examples["status"] == "passed" and len(examples["cases"]) == 8
assert examples["Core_database_UI_runtime_or_user_study_proof"] is False


def anchors(path):
    result = set(re.findall(r'<a\s+(?:id|name)=["\x27]([^"\x27]+)', path.read_text()))
    counts = {}
    for heading in re.findall(r"^#{1,6}\s+(.+?)\s*#*\s*$", path.read_text(), re.M):
        heading = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", heading).replace("&#x20;", "")
        slug = re.sub(r"[^\w\- ]", "", heading.lower()).replace(" ", "-")
        count = counts.get(slug, 0)
        counts[slug] = count + 1
        result.add(f"{slug}-{count}" if count else slug)
    return result


documents = [MAIN, QUESTION, SESSION] + sorted(EVIDENCE.glob("*.md"))
link_count = line_count = anchor_count = 0
for doc in documents:
    for raw in re.findall(r"\[[^\]]*\]\(([^)]+)\)", doc.read_text()):
        target = raw.strip().strip("<>")
        if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*://", target) or target.startswith("mailto:"):
            continue
        target, _, anchor = target.partition("#")
        line = None
        numbered = re.search(r":(\d+)$", target)
        if numbered:
            line = int(numbered.group(1))
            target = target[:numbered.start()]
        dest = (doc.parent / unquote(target)).resolve() if target else doc
        assert dest.is_file(), f"Missing local link in {doc}: {raw}"
        link_count += 1
        if line is not None:
            assert 1 <= line <= len(dest.read_text().splitlines()), f"Bad line {raw}"
            line_count += 1
        if anchor:
            assert unquote(anchor) in anchors(dest), f"Missing anchor in {doc}: {raw}"
            anchor_count += 1

artifacts = documents + [
    ROOT / "CONTEXT.md",
    EVIDENCE / "calendar-examples.py",
    EVIDENCE / "calendar-examples.json",
    EVIDENCE / "prior-evidence-sha256.json",
    Path(__file__),
]
report = {
    "status": "passed", "date": "2026-10-18",
    "scope": "D39 document structure, current selected/pending status, references and preserved evidence only",
    "Q39_A_and_calendar_clarification_selected": True,
    "D39_exact_amendments_ratified": False,
    "D38_retained_artifacts_unchanged": True,
    "categories": 22, "material_categories": 21, "no_additional_material_category": 1,
    "clauses": clauses, "acceptance_criteria": proofs,
    "preserved_D38_evidence_files": 14, "preserved_original_Q39": True,
    "checked_documents": len(documents), "local_links": link_count,
    "line_references": line_count, "anchors": anchor_count,
    "illustrative_calendar_cases": 8,
    "prior_programs_executed": False,
    "runtime_or_user_study_proof": False,
    "current_artifact_sha256": {str(p.relative_to(ROOT)): digest(p) for p in artifacts},
}
(EVIDENCE / "review-verification.json").write_text(json.dumps(report, indent=2) + "\n")
print(f"D39 documentation passed: 22 categories, 17 clauses, 26 criteria; {link_count} local links; 15 frozen inputs.")
