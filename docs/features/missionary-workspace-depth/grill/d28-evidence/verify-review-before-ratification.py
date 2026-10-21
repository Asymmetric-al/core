#!/usr/bin/env python3
"""D28 documentation/provenance verification; not runtime or policy qualification."""
from pathlib import Path
import hashlib
import json
import re
import unicodedata
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d28-preparation-retention-adversarial-review.md"
D27 = GRILL / "phase28-d27-resume-preparation-adversarial-review.md"
Q28 = GRILL / "phase28-q28-preparation-retention-control-research.md"
SESSION = GRILL / "phase28-session.md"
RESULT = HERE / "review-verification.json"
errors = []


def require(condition, message):
    if not condition:
        errors.append(message)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def anchors(path):
    content = path.read_text()
    result = set(re.findall(r'<[a-z0-9]+\b[^>]*\bid=[\"\']([^\"\']+)[\"\']', content, re.I))
    seen = {}
    for line in content.splitlines():
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if not match:
            continue
        value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", match[1])
        value = value.replace("`", "").replace("*", "").lower()
        value = "".join(c for c in value if c in " -_" or unicodedata.category(c)[0] in "LN").replace(" ", "-")
        number = seen.get(value, 0)
        seen[value] = number + 1
        result.add(value if not number else value + "-" + str(number))
    return result


prior = json.loads((HERE / "prior-evidence-sha256.json").read_text())
pins = json.loads((HERE / "artifact-pins.json").read_text())
clarification = json.loads((HERE / "clarification-evidence-sha256.json").read_text())
require(len(prior["artifacts"]) == 16, "Expected 16 preserved D27 artifacts")
require(len(clarification["artifacts"]) == 13, "Expected 13 preserved initial D28 artifacts")
require(len(clarification["decision_snapshots"]) == 2, "Expected original D27/D28 decision snapshots")
for manifest in (prior, pins, clarification, {"artifacts": clarification["decision_snapshots"]}):
    for entry in manifest["artifacts"]:
        path = ROOT / entry["path"]
        require(path.is_file() and digest(path) == entry["sha256"], "Changed/missing pinned artifact: " + str(path))

local_count = line_count = anchor_count = 0
for doc in [MAIN, D27, Q28, SESSION] + sorted(HERE.glob("*.md")):
    for raw in re.findall(r"\[[^\]]*\]\(([^)\s]+)\)", doc.read_text()):
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", raw) and not re.fullmatch(r".+:[0-9]+", raw):
            continue
        target = unquote(raw.strip("<>"))
        path_part, _, fragment = target.partition("#")
        match = re.match(r"^(.*):([0-9]+)$", path_part)
        line = None
        if match:
            path_part, line = match[1], int(match[2])
        path = (doc.parent / path_part).resolve() if path_part else doc
        local_count += 1
        if path == RESULT and not path.exists():
            continue
        require(path.exists(), f"Broken local link in {doc.name}: {raw}")
        if not path.exists():
            continue
        if line is not None:
            line_count += 1
            require(1 <= line <= len(path.read_text().splitlines()), "Line out of bounds: " + raw)
        if fragment:
            anchor_count += 1
            require(fragment in anchors(path), f"Bad anchor in {doc.name}: {raw}")

main = MAIN.read_text()
clauses = re.findall(r"^### D28-C(\d\d)\b", main, re.M)
proofs = re.findall(r"^\| P(\d\d)\s*\|", main, re.M)
findings = re.findall(r"^\| F(\d\d)\s*\|", main, re.M)
categories = re.findall(r"^\| (\d+)\. ([^|]+)\| (\*\*[^|]+)\|", main, re.M)
require(clauses == [f"{i:02}" for i in range(1, 19)], "Expected exactly C01-C18")
require(proofs == [f"{i:02}" for i in range(1, 27)], "Expected exactly P01-P26")
require(findings == [f"{i:02}" for i in range(1, 17)], "Expected exactly F01-F16")
require([int(row[0]) for row in categories] == list(range(1, 23)), "Expected 22 explicit categories")
require(all("Yes" in row[2] or "No" in row[2] for row in categories), "Missing material-concern disposition")
require("**Disposition: Accept with required amendments.**" in main, "Disposition missing")
require("amendments await explicit" in main and "ratification.**" in main, "D28 status incorrect")
for row in re.findall(r"^\| F\d\d\s*\|.*$", main, re.M):
    require(len(row.split("|")) == 7 and re.search(r"C\d\d", row), "Incomplete finding trace: " + row[:60])
require("**Answered A.**" in Q28.read_text(), "Q28 not marked answered")
session = SESSION.read_text()
require("All twenty-eight review dispositions" in session and "### D28 answer and completed adversarial review" in session, "Session not current")
require("### Q29" not in session, "Unexpected Q29")
require("(answered A)" in Q28.read_text().splitlines()[0], "Q28 header not answered")
require("**Selected return clarification:**" in main, "Selected return choice missing")
require("**Return meaning explicitly selected, refining D27-C07:**" in main, "D28-C07 not reconciled")
require("### D28 return clarification — selected" in session, "Session clarification missing")
d27 = D27.read_text()
require("## Subsequent D28 return clarification" in d27, "D27 provenance missing")
require("end applicability\nof its departure schedule" in d27, "D27-C07 still conflicts with selected return meaning")
require("ends only the selected eligible entry’s departure schedule" in d27, "D27-P09 still conflicts with selection")
for doc in (MAIN, D27, Q28, SESSION):
    normalized = re.sub(r"\s+", " ", doc.read_text()).lower()
    for stale in ("return clarification is still unanswered", "return/expiry clarification remains unanswered",
                  "resume must not reset retention clocks", "resume never changes retention clocks",
                  "d27's ratified text is unchanged", "resolve the pending return choice"):
        require(stale not in normalized, f"Stale current status in {doc.name}: {stale}")
require("ended\ndeparture deadline MUST NOT deny current-work reads or authorize deletion" in main,
        "Ended departure schedule still governs current work")
require("After accepted C07 admission, passing the old deadline" in main, "Post-resume expiry proof missing")
require("**Post-departure preparation retention** (Phase 28 D28, A selected; amendments proposed):" in (ROOT / "CONTEXT.md").read_text(), "Glossary status incorrect")

probe = json.loads((HERE / "retention-counterexamples.json").read_text())
summary = probe["summary"]
require(summary == dict(all_passed=True, assertions_passed=139, positive_controls=6, unsafe_alternatives=15), "Finite-model summary mismatch")
require(len(probe["counterexamples"]) == 15 and len(probe["positive_controls"]) == 6 and len(probe["limitations"]) >= 8, "Finite evidence/limits missing")
require(probe["script_sha256"] == digest(HERE / "retention-counterexamples.py"), "Probe script mismatch")
reproduction = json.loads((HERE / "root-reproduction.json").read_text())
require(reproduction["passed"] and reproduction["prior_result_sha256"] == reproduction["reproduced_result_sha256"] == digest(HERE / "retention-counterexamples.json"), "Independent reproduction mismatch")
require(reproduction["script_sha256"] == digest(HERE / "retention-counterexamples.py"), "Reproduction script mismatch")
fetches = json.loads((HERE / "technical-fetches.json").read_text())["requests"]
for entry in fetches:
    require(entry["status"] == 200 and entry["bytes"] > 0, "Unsuccessful claimed fetch: " + entry["url"])
    require(bool(re.fullmatch(r"[a-f0-9]{64}", entry["sha256"])), "Invalid retrieval hash")
    require(entry["retrieved_utc"].startswith("2026-10-17"), "Unexpected retrieval date")
require(len(fetches) == 17, "Expected 17 primary technical retrieval records")

result = dict(scope=__doc__, passed=not errors, local_references=local_count,
              line_references=line_count, anchor_references=anchor_count,
              clauses=len(clauses), proof_obligations=len(proofs), material_findings=len(findings),
              categories=len(categories), prior_artifacts_unchanged=len(prior["artifacts"]),
              d28_evidence_pins=len(pins["artifacts"]), finite_unsafe_alternatives=15,
              initial_d28_artifacts_unchanged=len(clarification["artifacts"]),
              pre_clarification_decision_snapshots=len(clarification["decision_snapshots"]),
              finite_positive_controls=6, finite_assertions=139,
              independent_root_reproduction=reproduction["passed"],
              q28_answered_a=True, d28_amendments_ratified=False, q29_posed=False,
              return_clarification_answered=True, return_current_work_selected=True,
              d27_current_retention_meaning_reconciled=True,
              finite_model_rerun_for_clarification=False,
              technical_fetches=len(fetches), retrieval_metadata_validated=True,
              source_bodies_retained_in_artifact=False,
              runtime_qualification=False, errors=errors)
RESULT.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
raise SystemExit(0 if result["passed"] else 1)
