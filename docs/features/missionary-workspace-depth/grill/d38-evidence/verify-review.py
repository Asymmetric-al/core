"""D38 documentation verification only; never imports/runs prior programs."""

from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
GRILL = HERE.parent
ROOT = HERE.parents[4]
REPORT = HERE / "review-verification.json"
MAIN = GRILL / "phase28-d38-separate-referral-periods-adversarial-review.md"
Q38 = GRILL / "phase28-q38-referral-period-scope-research.md"
SESSION = GRILL / "phase28-session.md"
REPORT.write_text(json.dumps({"status": "checking"}, indent=2) + "\n")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_manifest(path):
    entries = json.loads(path.read_text())
    entries = entries.get("sha256", entries)
    for relative, expected in entries.items():
        target = GRILL / relative
        assert target.is_file(), relative
        assert digest(target) == expected, f"Preserved evidence changed: {relative}"
    return len(entries)


preserved = check_manifest(HERE / "prior-evidence-sha256.json")
prior_d36 = check_manifest(GRILL / "d37-evidence/prior-evidence-sha256.json")
main = MAIN.read_text()
assert "**Disposition: Accept with required amendments.**" in main
assert "**B is selected;" in main and "not yet explicitly ratified" in main
assert "initial-window anchor and late-entry admission behavior SHALL be resolved" in main
assert "no per-missionary, project or referral override" in main
assert set(re.findall(r"^- \*\*C(\d{2}) —", main, re.M)) == {
    f"{n:02}" for n in range(1, 17)
}
assert set(re.findall(r"^\| P(\d{2})\s*\|", main, re.M)) == {
    f"{n:02}" for n in range(1, 25)
}
categories = main.split("## Independent category review", 1)[1].split(
    "## Independently testable proof obligations", 1
)[0]
rows = re.findall(r"^\| (\d+)\s*\|(.+)$", categories, re.M)
assert [int(n) for n, _ in rows] == list(range(1, 23))
assert all("**Yes" in body or "**No additional material" in body for _, body in rows)
assert "**Q38 is answered B.**" in Q38.read_text()
assert "### Q38: one or separate referral periods (answered B)" in SESSION.read_text()
assert "**New referral period** (Phase 28 D38, selected; amendments reviewed):" in (
    ROOT / "CONTEXT.md"
).read_text()
assert "explicitly ratified" in (
    GRILL / "phase28-d37-starting-guide-research-and-design.md"
).read_text()

docs = [MAIN, Q38, SESSION] + sorted(HERE.glob("*.md"))
link_count = line_count = anchor_count = 0


def anchors(text):
    found = set(re.findall(r'<a\s+(?:id|name)=[\"\']([^\"\']+)', text))
    duplicates = {}
    for title in re.findall(r"^#{1,6}\s+(.+)$", text, re.M):
        title = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", title)
        slug = re.sub(r"[^\w\- ]", "", title.lower()).replace(" ", "-")
        count = duplicates.get(slug, 0)
        duplicates[slug] = count + 1
        found.add(slug if not count else f"{slug}-{count}")
    return found


for doc in docs:
    for raw in re.findall(r"(?<!!)\[[^\]]*\]\(([^)]+)\)", doc.read_text()):
        if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*://|mailto:", raw):
            continue
        raw = unquote(raw.strip("<>"))
        location, _, fragment = raw.partition("#")
        match = re.search(r":(\d+)$", location)
        number = int(match.group(1)) if match else None
        if match:
            location = location[: match.start()]
        target = (doc.parent / location).resolve() if location else doc
        assert target.is_file(), f"Missing link in {doc.name}: {raw}"
        link_count += 1
        if number is not None:
            assert 1 <= number <= len(target.read_text().splitlines()), raw
            line_count += 1
        if fragment:
            assert fragment in anchors(target.read_text()), (
                f"Missing anchor in {doc.name}: {raw}"
            )
            anchor_count += 1

inputs = docs + [ROOT / "CONTEXT.md", Path(__file__).resolve()]
report = {
    "status": "passed",
    "date": "2026-10-18",
    "scope": "D38 documentation structure, status, local references and frozen evidence only",
    "D38": "B selected; corrected decision/amendments reviewed, not explicitly ratified",
    "initial_clock_product_choice": "unresolved; no implicit engineering default",
    "adversarial_categories": len(rows),
    "required_amendments": 16,
    "future_proof_obligations": 24,
    "preserved_D37_evidence_and_Q38_snapshot": preserved,
    "preserved_D36_evidence": prior_d36,
    "checked_documents": len(docs),
    "local_links": link_count,
    "line_references": line_count,
    "anchors": anchor_count,
    "prior_programs_executed": False,
    "runtime_database_accessibility_or_user_study_proof": False,
    "current_artifact_sha256": {
        str(path.relative_to(ROOT)): digest(path) for path in inputs
    },
}
REPORT.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({key: value for key, value in report.items() if key != "current_artifact_sha256"}, indent=2))
