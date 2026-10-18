"""Verify D37 ratification/Q38 documentation without running older programs."""

from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
ROOT = HERE.parents[4]
MAIN = BASE / "phase28-d37-starting-guide-research-and-design.md"
Q37 = BASE / "phase28-q37-getting-started-guidance-research.md"
Q38 = BASE / "phase28-q38-referral-period-scope-research.md"
SESSION = BASE / "phase28-session.md"
CONTEXT = ROOT / "CONTEXT.md"
REPORT = HERE / "ratification-verification.json"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def part(text, start, end):
    return text.split(start, 1)[1].split(end, 1)[0]


before = (HERE / "d37-before-ratification.txt").read_text()
now = MAIN.read_text()
for start, end in [
    ("## Exact corrected decision to record", "## Required amendments"),
    ("- **C01 —", "## Adversarial category review"),
    ("- **P01:", "## Ruthless synthesis and order of work"),
]:
    assert part(before, start, end) == part(now, start, end), start
assert "## Explicit ratification" in now
assert "explicitly ratified" in Q37.read_text()
assert "**Q38 is unanswered.**" in Q38.read_text()
assert "**Starting guide** (Phase 28 D37, ratified):" in CONTEXT.read_text()
assert "### Q38: one or separate referral periods (unanswered)" in SESSION.read_text()
assert "D37 detailed amendments await ratification" not in SESSION.read_text()

preserved = json.loads((HERE / "ratification-evidence-sha256.json").read_text())
assert len(preserved["sha256"]) == 14
for name, expected in preserved["sha256"].items():
    assert sha(BASE / name) == expected, name
older = json.loads((HERE / "prior-evidence-sha256.json").read_text())
assert len(older["sha256"]) == 20
for name, expected in older["sha256"].items():
    assert sha(BASE / name) == expected, name


def anchors(path):
    source = path.read_text()
    result = set(re.findall(r'<a\s+(?:id|name)="([^"]+)"', source))
    used = {}
    fenced = False
    for line in source.splitlines():
        if line.startswith("```"):
            fenced = not fenced
        if fenced or not re.match(r"^#{1,6} ", line):
            continue
        title = re.sub(r"^#{1,6} +", "", line).strip().lower()
        title = re.sub(r"[^\w\- ]", "", title).replace(" ", "-")
        occurrence = used.get(title, 0)
        used[title] = occurrence + 1
        result.add(title if occurrence == 0 else f"{title}-{occurrence}")
    return result


REPORT.write_text('{"status":"checking"}\n')
docs = [MAIN, Q37, Q38, SESSION, *sorted(HERE.glob("*.md"))]
links = line_refs = anchor_refs = 0
errors = []
for doc in docs:
    for target in re.findall(r"\]\(([^\n)]+)\)", doc.read_text()):
        target = target.strip("<>")
        if re.match(r"^[a-z]+:", target):
            continue
        name, _, fragment = target.partition("#")
        line = re.search(r":(\d+)$", name)
        if line:
            name = name[:line.start()]
        path = (doc.parent / unquote(name)).resolve() if name else doc
        links += 1
        if not path.is_file():
            errors.append(f"{doc.name}: missing {target}")
            continue
        if line:
            line_refs += 1
            if not 1 <= int(line.group(1)) <= len(path.read_text().splitlines()):
                errors.append(f"{doc.name}: bad line {target}")
        if fragment:
            anchor_refs += 1
            if unquote(fragment) not in anchors(path):
                errors.append(f"{doc.name}: bad anchor {target}")
assert not errors, "\n".join(errors)

result = {
    "status": "passed",
    "date": "2026-10-18 Asia/Bangkok",
    "scope": "Ratification wording/status, Q38 research links and evidence preservation only.",
    "exact_corrected_decision_unchanged": True,
    "C01_C16_unchanged": True,
    "P01_P24_unchanged": True,
    "D37_ratified_Q38_unanswered": True,
    "preserved_D37_evidence_and_snapshots": len(preserved["sha256"]),
    "preserved_D36_evidence": len(older["sha256"]),
    "checked_documents": len(docs),
    "local_links": links,
    "line_references": line_refs,
    "anchors": anchor_refs,
    "prior_programs_executed": False,
    "runtime_or_user_study_proof": False,
    "current_artifact_sha256": {
        str(p.relative_to(ROOT)): sha(p)
        for p in [MAIN, Q37, Q38, SESSION, CONTEXT, Path(__file__).resolve()]
    },
}
REPORT.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({k: v for k, v in result.items() if k != "current_artifact_sha256"}, indent=2))
