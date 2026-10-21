#!/usr/bin/env python3
"""D25 artifact checks only. No Core, PostgreSQL, provider or UX tests."""
from pathlib import Path
import hashlib, json, re, unicodedata
from urllib.parse import unquote
ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
GRILL = HERE.parent
MAIN = GRILL / "phase28-d25-check-in-questions-adversarial-review.md"
RESULT = HERE / "review-verification.json"
errors = []
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def require(ok, message):
    if not ok: errors.append(message)
prior = json.loads((HERE / "prior-evidence-sha256.json").read_text())
pins = json.loads((HERE / "artifact-pins.json").read_text())
for group in (prior, pins):
    for item in group["artifacts"]:
        p = ROOT / item["path"]
        require(p.exists() and digest(p) == item["sha256"], "Pinned artifact changed: " + str(p))
def anchors(p):
    found = set(re.findall(r'<(?:a|[a-z0-9]+)\b[^>]*\bid=[\"\']([^\"\']+)[\"\']', p.read_text(), re.I))
    seen = {}
    for line in p.read_text().splitlines():
        m = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if not m: continue
        value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", m[1])
        value = value.replace(chr(96), "").replace("*", "").lower()
        value = "".join(c for c in value if c in " -_" or unicodedata.category(c)[0] in "LN").replace(" ", "-")
        n = seen.get(value, 0); seen[value] = n + 1
        found.add(value if not n else value + "-" + str(n))
    return found
docs = [MAIN, GRILL / "phase28-q25-check-in-prompts-research.md", GRILL / "phase28-session.md"] + sorted(HERE.glob("*.md"))
local_count = line_count = anchor_count = 0
for doc in docs:
    for target in re.findall(r"\[[^\]]*\]\(([^)\s]+)\)", doc.read_text()):
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target): continue
        target = unquote(target.strip("<>"))
        path_part, sep, fragment = target.partition("#")
        line = None
        m = re.match(r"^(.*):([0-9]+)$", path_part)
        if m: path_part, line = m[1], int(m[2])
        p = (doc.parent / path_part).resolve() if path_part else doc
        local_count += 1
        if p == RESULT and not RESULT.exists(): continue
        require(p.exists(), f"Broken reference: {doc.name}: {target}")
        if not p.exists(): continue
        if line is not None:
            line_count += 1
            require(1 <= line <= len(p.read_text().splitlines()), "Bad line: " + target)
        if fragment:
            anchor_count += 1
            require(fragment in anchors(p), f"Bad anchor: {doc.name}: {target}")
main = MAIN.read_text()
clauses = re.findall(r"^### D25-C(\d\d)\b", main, re.M)
findings = re.findall(r"^### F(\d\d)\b", main, re.M)
proofs = re.findall(r"^\| P(\d\d)\s*\|", main, re.M)
require(clauses == [f"{n:02}" for n in range(1,19)], "Expected C01-C18")
require(findings == [f"{n:02}" for n in range(1,15)], "Expected F01-F14")
require(proofs == [f"{n:02}" for n in range(1,25)], "Expected P01-P24")
section = main.split("## Every requested category evaluated independently",1)[1].split("## Required proof obligations",1)[0]
categories = [l for l in section.splitlines() if l.startswith("|") and "**" in l]
require(len(categories)==22, "Expected 22 category judgments")
require(sum("**Yes**" in l for l in categories)==21, "Expected 21 material categories")
require(sum("No additional material external dependency" in l for l in categories)==1, "Dependency conclusion missing")
for item in re.split(r"^### F\d\d", main, flags=re.M)[1:]:
    item = item.split("\n## ",1)[0]
    for marker in ("Severity:", "Likelihood:", "Evidence:", "Effect", "change:"):
        require(marker in item, "Incomplete finding field: " + marker)
q = (GRILL / "phase28-q25-check-in-prompts-research.md").read_text()
session = (GRILL / "phase28-session.md").read_text()
context = (ROOT / "CONTEXT.md").read_text()
require("**Answered A.**" in q, "Q25 answer missing")
require("Q25 remains unanswered" not in q and "Awaiting founder answer" not in q, "Stale Q25 status")
require("All twenty-five review dispositions" in session, "Session count stale")
require("D25 (answered Q25)" in session and "| E25 " in session, "D25/E25 missing")
require("Q25 awaits the founder's answer" not in session and "Neither answer is selected. Q25" not in session, "Stale session frontier")
require("No Q26 is posed" in session and "No Q26 is posed" in main, "Q26 boundary missing")
require("not yet separately ratified" in main and "proposed" in main[:500], "D25 ratification overstated")
require("Coaching check-in questions** (Phase 28 D25, selected; amendments proposed)" in context, "Glossary mismatch")
probe = json.loads((HERE / "counterexample-probe/results.json").read_text())
rep = json.loads((HERE / "independent-reproduction.json").read_text())
require(probe["case_count"]==probe["reproduced"]==len(probe["cases"])==17, "Probe count mismatch")
require(len({i["id"] for i in probe["cases"]})==17, "Duplicate probe IDs")
require(rep["matched_stored_results"] and rep["cases"]==17, "Independent reproduction missing")
require(digest(HERE/"counterexample-probe/probe.py")==rep["probe_sha256"], "Probe changed")
require(digest(HERE/"counterexample-probe/results.json")==rep["results_sha256"], "Result changed")
sources = json.loads((HERE/"primary-sources.json").read_text())
unavailable = []
for source in sources["technical_fetches"]:
    for key, hash_key in (("path","sha256"),("raw_path","sha256"),("text_path","text_sha256")):
        if key not in source: continue
        p=Path(source[key])
        if p.exists(): require(digest(p)==source[hash_key], "Technical fetch changed: "+str(p))
        else: unavailable.append(str(p))
result = {
 "scope":"Documentation, provenance, preservation and synthetic-result checks only; no Core/runtime/DB/UI/capacity qualification",
 "passed":not errors,"local_references":local_count,"line_references":line_count,
 "anchor_references":anchor_count,"clauses":len(clauses),"proof_obligations":len(proofs),
 "material_findings":len(findings),"categories":len(categories),
 "prior_artifacts_unchanged":len(prior["artifacts"]),"d25_evidence_pins":len(pins["artifacts"]),
 "finite_counterexamples_reproduced":17,"independent_root_reproduction":True,
 "q25_answered_a":True,"d25_amendments_ratified":False,"q26_posed":False,
 "technical_fetches":len(sources["technical_fetches"]),
 "unavailable_temporary_source_paths":unavailable,"errors":errors}
RESULT.write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps(result,indent=2))
raise SystemExit(0 if not errors else 1)
