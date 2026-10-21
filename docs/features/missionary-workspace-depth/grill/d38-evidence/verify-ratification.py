"""Verify D38 ratification and Q39 documentation; execute no older program."""

from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
GRILL = HERE.parent
ROOT = HERE.parents[4]
REPORT = HERE / "ratification-verification.json"
REPORT.write_text('{"status": "checking"}\n')
MAIN = GRILL / "phase28-d38-separate-referral-periods-adversarial-review.md"
Q38 = GRILL / "phase28-q38-referral-period-scope-research.md"
Q39 = GRILL / "phase28-q39-initial-referral-clock-research.md"
SESSION = GRILL / "phase28-session.md"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def preserved(name):
    entries = json.loads((GRILL / name).read_text())
    entries = entries.get("sha256", entries)
    for relative, expected in entries.items():
        assert sha(GRILL / relative) == expected, f"Evidence changed: {relative}"
    return len(entries)


count = preserved("d38-evidence/ratification-evidence-sha256.json")
prior = preserved("d38-evidence/prior-evidence-sha256.json")
older = preserved("d37-evidence/prior-evidence-sha256.json")
before = (HERE / "d38-before-ratification.txt").read_text()
after = MAIN.read_text()
for start, end in [
    ("## Exact corrected decision to record", "## Evidence and what is actually known"),
    ("- **C01 —", "## Concern register"),
    ("## Independently testable proof obligations", "## Ruthless synthesis and order of work"),
]:
    assert before.split(start, 1)[1].split(end, 1)[0] == after.split(start, 1)[1].split(end, 1)[0], start
assert "ratified on October 18, 2026" in after
assert "## Explicit ratification" in after
assert "were explicitly ratified on October 18, 2026" in Q38.read_text()
assert "**Q39 is unanswered.**" in Q39.read_text()
assert "### Q39: initial clock for a late-recorded referral (unanswered)" in SESSION.read_text()
assert "**New referral period** (Phase 28 D38, ratified):" in (ROOT / "CONTEXT.md").read_text()


def anchors(text):
    found = set(re.findall(r'<a\s+(?:id|name)=[\"\']([^\"\']+)', text))
    seen = {}
    for title in re.findall(r"^#{1,6}\s+(.+)$", text, re.M):
        title = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", title)
        slug = re.sub(r"[^\w\- ]", "", title.lower()).replace(" ", "-")
        n = seen.get(slug, 0)
        seen[slug] = n + 1
        found.add(slug if not n else f"{slug}-{n}")
    return found


docs = [MAIN, Q38, Q39, SESSION] + sorted(HERE.glob("*.md"))
links = lines = fragments = 0
for doc in docs:
    for raw in re.findall(r"(?<!!)\[[^\]]*\]\(([^)]+)\)", doc.read_text()):
        if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*://|mailto:", raw):
            continue
        location, _, fragment = unquote(raw.strip("<>")).partition("#")
        match = re.search(r":(\d+)$", location)
        line = int(match.group(1)) if match else None
        if match:
            location = location[:match.start()]
        target = (doc.parent / location).resolve() if location else doc
        assert target.is_file(), f"Missing {raw} in {doc.name}"
        links += 1
        if line is not None:
            assert 1 <= line <= len(target.read_text().splitlines()), raw
            lines += 1
        if fragment:
            assert fragment in anchors(target.read_text()), f"Missing anchor {raw}"
            fragments += 1

report = {
    "status": "passed",
    "date": "2026-10-18",
    "scope": "Exact D38 decision/amendments, ratification status, Q39 references and evidence preservation only",
    "D38_ratified_Q39_unanswered": True,
    "exact_corrected_decision_unchanged": True,
    "C01_C16_unchanged": True,
    "P01_P24_unchanged": True,
    "preserved_D38_evidence_and_snapshots": count,
    "preserved_D37_evidence_and_Q38_snapshot": prior,
    "preserved_D36_evidence": older,
    "checked_documents": len(docs),
    "local_links": links,
    "line_references": lines,
    "anchors": fragments,
    "prior_programs_executed": False,
    "runtime_or_user_study_proof": False,
    "current_artifact_sha256": {
        str(path.relative_to(ROOT)): sha(path)
        for path in docs + [ROOT / "CONTEXT.md", Path(__file__).resolve()]
    },
}
REPORT.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({k: v for k, v in report.items() if k != "current_artifact_sha256"}, indent=2))
