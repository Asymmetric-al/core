"""D37 documentation-only checks. Reads older evidence; executes no older code."""

from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
ROOT = HERE.parents[4]
MAIN = BASE / "phase28-d37-starting-guide-research-and-design.md"
QUESTION = BASE / "phase28-q37-getting-started-guidance-research.md"
SESSION = BASE / "phase28-session.md"
GLOSSARY = ROOT / "CONTEXT.md"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def anchors(path):
    result = set(re.findall(r'<a\s+(?:id|name)="([^"]+)"', path.read_text()))
    used = {}
    fenced = False
    for line in path.read_text().splitlines():
        if line.startswith("```"):
            fenced = not fenced
        if fenced or not re.match(r"^#{1,6} ", line):
            continue
        title = re.sub(r"^#{1,6} +", "", line).strip().lower()
        title = re.sub(r"[^\w\- ]", "", title).replace(" ", "-")
        n = used.get(title, 0)
        used[title] = n + 1
        result.add(title if n == 0 else f"{title}-{n}")
    return result


manifest = json.loads((HERE / "artifact-pins.json").read_text())
for name, expected in manifest["sha256"].items():
    assert digest(ROOT / name) == expected, f"Changed D37 artifact: {name}"

previous = json.loads((HERE / "prior-evidence-sha256.json").read_text())
assert len(previous["sha256"]) == 20
for name, expected in previous["sha256"].items():
    assert digest(BASE / name) == expected, f"Changed prior evidence: {name}"
assert digest(HERE / "q37-before-answer.txt") == previous["q37_before_answer_sha256"]

text = MAIN.read_text()
clauses = re.findall(r"^- \*\*(C\d{2}) —", text, re.M)
proofs = re.findall(r"^- \*\*(P\d{2}):", text, re.M)
assert clauses == [f"C{x:02d}" for x in range(1, 17)], clauses
assert proofs == [f"P{x:02d}" for x in range(1, 25)], proofs
review = text.split("## Adversarial category review", 1)[1].split(
    "## Required proof and acceptance criteria", 1
)[0]
rows = [line for line in review.splitlines() if line.startswith("|") and "**" in line]
assert len(rows) == 22, len(rows)
assert sum("**Yes." in row for row in rows) == 21
assert sum("**No additional material concern" in row for row in rows) == 1
assert "**Disposition: Accept with required amendments.**" in text
assert "awaiting\nratification" in text
assert "**Q37 is answered A.**" in QUESTION.read_text()
assert "| D37 (answered Q37)" in SESSION.read_text()
assert "| E37" in SESSION.read_text()
assert "Q37 is unanswered" not in SESSION.read_text()
assert "**Starting guide** (Phase 28 D37, selected; detailed amendments reviewed):" in GLOSSARY.read_text()
assert "Keep it optional; tenants can offer, edit or disable" in text
assert "## Exact corrected decision to record" in text

# Reserve this run's report so links to the generated result can be checked.
# A failed run cannot leave a prior successful result looking current.
(HERE / "review-verification.json").write_text('{"status":"checking"}\n')
documents = [MAIN, QUESTION, SESSION, *sorted(HERE.glob("*.md"))]
count = lines = fragments = 0
errors = []
for path in documents:
    for destination in re.findall(r"\]\(([^\n)]+)\)", path.read_text()):
        destination = destination.strip("<>")
        if re.match(r"^[a-z]+:", destination):
            continue
        target, _, fragment = destination.partition("#")
        line = re.search(r":(\d+)$", target)
        if line:
            target = target[:line.start()]
        resolved = (path.parent / unquote(target)).resolve() if target else path
        count += 1
        if not resolved.is_file():
            errors.append(f"{path.name}: missing {destination}")
            continue
        if line:
            lines += 1
            if not 1 <= int(line.group(1)) <= len(resolved.read_text().splitlines()):
                errors.append(f"{path.name}: bad line {destination}")
        if fragment:
            fragments += 1
            if unquote(fragment) not in anchors(resolved):
                errors.append(f"{path.name}: bad anchor {destination}")
assert not errors, "\n".join(errors)

result = {
    "status": "passed",
    "scope": "Documentation structure, links, statuses and immutable evidence hashes only.",
    "categories": len(rows),
    "required_clauses": len(clauses),
    "future_acceptance_criteria": len(proofs),
    "checked_documents": len(documents),
    "local_links": count,
    "line_references": lines,
    "anchors": fragments,
    "pinned_d37_artifacts": len(manifest["sha256"]),
    "preserved_d36_evidence_files": len(previous["sha256"]),
    "original_q37_preserved": True,
    "prior_models_probes_or_verifiers_executed": False,
    "runtime_ui_database_or_user_study_proof": False,
}
(HERE / "review-verification.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
