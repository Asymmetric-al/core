#!/usr/bin/env python3
"""D27 documentation/provenance verification; not runtime or policy qualification."""
from pathlib import Path
import hashlib
import json
import re
import unicodedata
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d27-resume-preparation-adversarial-review.md"
Q27 = GRILL / "phase28-q27-returning-missionary-preparation-research.md"
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
require(len(prior["artifacts"]) == 16, "Expected 16 preserved D26 artifacts")
for manifest in (prior, pins):
    for entry in manifest["artifacts"]:
        path = ROOT / entry["path"]
        require(path.is_file() and digest(path) == entry["sha256"], "Changed/missing pinned artifact: " + str(path))

local_count = line_count = anchor_count = 0
for doc in [MAIN, Q27, SESSION] + sorted(HERE.glob("*.md")):
    for raw in re.findall(r"\[[^\]]*\]\(([^)\s]+)\)", doc.read_text()):
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", raw):
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
clauses = re.findall(r"^### D27-C(\d\d)\b", main, re.M)
proofs = re.findall(r"^\| P(\d\d)\s*\|", main, re.M)
findings = re.findall(r"^\| F(\d\d)\s*\|", main, re.M)
categories = re.findall(r"^\| (\d+)\. ([^|]+)\| (\*\*[^|]+)\|", main, re.M)
require(clauses == [f"{i:02}" for i in range(1, 19)], "Expected exactly C01-C18")
require(proofs == [f"{i:02}" for i in range(1, 25)], "Expected exactly P01-P24")
require(findings == [f"{i:02}" for i in range(1, 15)], "Expected exactly F01-F14")
require([int(row[0]) for row in categories] == list(range(1, 23)), "Expected 22 explicit categories")
require(all("Yes" in row[2] or "No" in row[2] for row in categories), "Missing material-concern disposition")
require("**Disposition: Accept with required amendments.**" in main, "Disposition missing")
require("amendments below await explicit" in main and "ratification.**" in main, "D27 status incorrect")
for row in re.findall(r"^\| F\d\d\s*\|.*$", main, re.M):
    require(len(row.split("|")) == 7 and re.search(r"C\d\d", row), "Incomplete finding trace: " + row[:60])
require("**Answered A.**" in Q27.read_text(), "Q27 not marked answered")
session = SESSION.read_text()
require("All twenty-seven review dispositions" in session and "### D27 answer and completed adversarial review" in session, "Session not current")
require("### Q28" not in session, "Unexpected Q28")
require("**Preparation resumption** (Phase 28 D27, A selected; amendments proposed):" in (ROOT / "CONTEXT.md").read_text(), "Glossary status incorrect")

probe = json.loads((HERE / "resumption-counterexamples.json").read_text())
summary = probe["summary"]
require(summary == dict(all_passed=True, assertions_passed=94, positive_controls=5, unsafe_alternatives=14), "Finite-model summary mismatch")
require(len(probe["counterexamples"]) == 14 and len(probe["positive_controls"]) == 5 and len(probe["limitations"]) >= 8, "Finite evidence/limits missing")
require(probe["script_sha256"] == digest(HERE / "resumption-counterexamples.py"), "Probe script mismatch")
reproduction = json.loads((HERE / "root-reproduction.json").read_text())
require(reproduction["passed"] and reproduction["prior_result_sha256"] == reproduction["reproduced_result_sha256"] == digest(HERE / "resumption-counterexamples.json"), "Independent reproduction mismatch")
require(reproduction["script_sha256"] == digest(HERE / "resumption-counterexamples.py"), "Reproduction script mismatch")
fetches = json.loads((HERE / "technical-fetches.json").read_text())["sources"]
unavailable = []
for entry in fetches:
    require(entry["status"] == 200 and entry["bytes"] > 0, "Unsuccessful claimed fetch: " + entry["url"])
    path = Path(entry["temporary_path"])
    if path.exists():
        require(digest(path) == entry["sha256"] and path.stat().st_size == entry["bytes"], "Technical source body mismatch: " + entry["url"])
    else:
        unavailable.append(str(path))

result = dict(scope=__doc__, passed=not errors, local_references=local_count,
              line_references=line_count, anchor_references=anchor_count,
              clauses=len(clauses), proof_obligations=len(proofs), material_findings=len(findings),
              categories=len(categories), prior_artifacts_unchanged=len(prior["artifacts"]),
              d27_evidence_pins=len(pins["artifacts"]), finite_unsafe_alternatives=14,
              finite_positive_controls=5, finite_assertions=94,
              independent_root_reproduction=reproduction["passed"],
              q27_answered_a=True, d27_amendments_ratified=False, q28_posed=False,
              technical_fetches=len(fetches), unavailable_temporary_source_paths=unavailable,
              runtime_qualification=False, errors=errors)
RESULT.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
raise SystemExit(0 if result["passed"] else 1)
