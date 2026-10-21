"""Documentation/provenance checks only; not Core or financial qualification."""

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

E = Path(__file__).resolve().parent
G = E.parent
ROOT = E.parents[4]
MAIN = G / "phase28-d20-grouped-special-gift-follow-up-adversarial-review.md"
FILES = [MAIN, G / "phase28-q20-special-gift-follow-up-grouping-research.md",
         G / "phase28-session.md",
         *sorted(E.rglob("*.md"))]
errors = []
refs = anchors = line_refs = 0


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def targets(body):
    for match in re.finditer(r"\]\(", body):
        start = end = match.end()
        depth = 1
        while end < len(body) and depth:
            if body[end] == "(" and body[end - 1] != "\\":
                depth += 1
            elif body[end] == ")" and body[end - 1] != "\\":
                depth -= 1
            end += 1
        if depth == 0:
            yield body[start:end - 1].strip("<>")


# Output exists before the self-referencing local-link check; overwritten below.
OUTPUT = E / "review-verification.json"
if not OUTPUT.exists():
    OUTPUT.write_text("{}\n")

for file in FILES:
    body = file.read_text()
    if any(line.rstrip() != line for line in body.splitlines()):
        errors.append(f"trailing whitespace: {file.name}")
    for target in targets(body):
        if re.match(r"^[a-z][a-z0-9+.-]*://", target) or target.startswith("mailto:"):
            continue
        path, _, anchor = unquote(target).partition("#")
        match = re.search(r":(\d+)$", path)
        lineno = int(match.group(1)) if match else None
        if match:
            path = path[:match.start()]
        dest = (file.parent / path).resolve() if path else file
        refs += 1
        if not dest.exists():
            errors.append(f"{file.name}: missing {target}")
            continue
        if lineno:
            line_refs += 1
            if not 1 <= lineno <= len(dest.read_text().splitlines()):
                errors.append(f"{file.name}: invalid line {target}")
        if anchor:
            heads = re.findall(r"^#+\s+(.+)$", dest.read_text(), re.M)
            slugs = [re.sub(r"[^\w\- ]", "", h.lower()).replace(" ", "-") for h in heads]
            slugs += re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)["\']', dest.read_text())
            anchors += 1
            if anchor not in slugs:
                errors.append(f"{file.name}: missing anchor {target}")

main = MAIN.read_text()
counts = {
    "clauses": len(re.findall(r"^\*\*C\d\d —", main, re.M)),
    "proofs": len(re.findall(r"^\*\*P\d\d\.", main, re.M)),
    "concerns": len(re.findall(r"^\| F\d\d\s", main, re.M)),
    "categories": len(re.findall(r"^\| \d\d\s", main, re.M)),
}
assert counts == {"clauses": 24, "proofs": 30, "concerns": 14, "categories": 22}, counts
assert "their separate\nratification has not occurred" in main
assert "Independent follow-up task" in main
assert "same task" in main and "Choose gifts" in main
assert "P7's issuer/jurisdiction" in main
assert "earlier withdrawal need not have been erroneous" in main
assert "remove\nthe task from that viewer's current queue" in main
assert "Sentry" in main and "before tests ran" in main
q20 = FILES[1].read_text()
assert "Founder answered A" in q20 and "Awaiting founder answer" not in q20
session = FILES[2].read_text()
assert "All twenty review dispositions" in session
assert "D20 (answered Q20)" in session and "E20 (P28 design)" in session
assert "Q20: special-gift follow-up grouping (now answered A)" in session
assert "D19 explicit ratification" in session
assert "This turn\nrecords the finished review and asks no Q21" in session
glossary = (ROOT / "CONTEXT.md").read_text()
assert "**First-support follow-up** (Phase 28 D19, ratified):" in glossary
assert "**Grouped special-gift follow-up** (Phase 28 D20, selected; amendments proposed):" in glossary
brief = sha(G / "phase28-founder-brief.md")
assert brief == "464e3ceb675f1bd3926b0974b003e885ef1b115b5b516a37da3d84fbed8f1dcb"

P = E / "postgres-probe"
r = json.loads((P / "results.json").read_text())
assert r["passed"] == r["outcomes"] == 38 and r["failure"] is None
assert all(case["passed"] for case in r["results"])
races = [case for case in r["results"] if "actual_lock_wait" in case]
assert len(races) == 9 and all(case["actual_lock_wait"] == "Lock:transactionid" for case in races)
for name, digest in r["artifact_sha256"].items():
    assert sha(P / name) == digest, name
assert sha(G / "d1-evidence/postgres-probe/run.py") == r["helper_sha256"]
sources = json.loads((P / "sources.json").read_text())
for source in sources["local"]:
    assert sha(ROOT / source["path"]) == source["sha256"], source["path"]
for source in sources["fresh"] + sources["same_day_reused"]:
    assert sha(Path(source["raw_path"])) == source["sha256"], source["name"]
    if "text_path" in source:
        assert sha(Path(source["text_path"])) == source["text_sha256"], source["name"]
roles = json.loads((P / "roles.json").read_text())
assert len(roles) == 8 and all(not role["rolsuper"] and not role["rolbypassrls"] for role in roles)
env = json.loads((P / "environment.json").read_text())
assert env["server"].startswith("PostgreSQL 17.11") and env["network"] == "none" and not env["published_ports"]
cleanup = json.loads((P / "cleanup.json").read_text())
assert cleanup["container_absent"] and all(cleanup["volumes_absent"].values())
counter = json.loads((E / "grouping-probe/results.json").read_text())
assert counter["case_count"] == counter["reproduced"] == 22
assert all(case["counterexample_reproduced"] for case in counter["cases"])
assert len({case["id"] for case in counter["cases"]}) == 22

# Historical assertions describe their earlier turns, not the newly answered Q20.
prior = json.loads((G / "d19-evidence/review-verification.json").read_text())
assert prior["d19_amendments_ratified"] is True and prior["q20_prepared_unanswered"] is True
assert sha(G / "d19-evidence/verify-review.py") == prior["sha256"][str((G / "d19-evidence/verify-review.py").relative_to(ROOT))]
assert sha(G / "phase28-d19-first-support-follow-up-adversarial-review.md") == prior["sha256"][str((G / "phase28-d19-first-support-follow-up-adversarial-review.md").relative_to(ROOT))]

evidence_files = [f for f in E.rglob("*") if f.is_file() and f != OUTPUT and "__pycache__" not in f.parts]
checked_files = sorted(set([*FILES, ROOT / "CONTEXT.md", *evidence_files,
                           G / "d19-evidence/review-verification.json"]))
result = {
    "checked_at_utc": datetime.now(timezone.utc).isoformat(),
    "scope": "Documentation structure/status/local references and retained research evidence only; not Core, finance, Supabase or UX qualification",
    "counts": counts,
    "local_references_checked": refs,
    "local_heading_anchors_checked": anchors,
    "local_line_references_checked": line_refs,
    "errors": errors,
    "founder_brief_sha256_unchanged": brief,
    "d20_a_selected": True,
    "d20_amendments_ratified": False,
    "q21_asked": False,
    "prior_verification_preserved": True,
    "ratified_decisions": ["D2", "D4", "D5", "D7", "D8", "D9", "D10", "D14", "D15", "D16", "D17", "D18", "D19"],
    "postgres_version": "17.11",
    "postgres_outcomes_passed": 38,
    "actual_concurrent_races": 9,
    "grouping_counterexamples_reproduced": 22,
    "technical_source_bodies_hash_verified": len(sources["fresh"] + sources["same_day_reused"]),
    "supabase_or_provider_calls": 0,
    "sha256": {str(file.relative_to(ROOT)): sha(file) for file in checked_files},
}
OUTPUT.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({key: value for key, value in result.items() if key != "sha256"}, indent=2))
raise SystemExit(1 if errors else 0)

