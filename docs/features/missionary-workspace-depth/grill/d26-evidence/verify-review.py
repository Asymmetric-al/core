#!/usr/bin/env python3
"""D26 documentation/provenance checks; not Core/SQL/RLS/UI qualification."""
from pathlib import Path
import hashlib
import json
import re
import unicodedata
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d26-next-step-sharing-adversarial-review.md"
Q27 = GRILL / "phase28-q27-returning-missionary-preparation-research.md"
RESULT = HERE / "review-verification.json"
errors = []


def require(condition, message):
    if not condition:
        errors.append(message)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def anchors(path):
    content = path.read_text()
    found = set(re.findall(r'<[a-z0-9]+\b[^>]*\bid=[\"\']([^\"\']+)[\"\']', content, re.I))
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
        found.add(value if not number else value + "-" + str(number))
    return found


prior = json.loads((HERE / "prior-evidence-sha256.json").read_text())
pins = json.loads((HERE / "artifact-pins.json").read_text())
ratification = json.loads((HERE / "ratification-evidence-sha256.json").read_text())
require(len(ratification["artifacts"]) == 13, "Expected 13 preserved initial D26 artifacts")
for manifest in (prior, pins, ratification):
    for entry in manifest["artifacts"]:
        path = ROOT / entry["path"]
        require(path.is_file() and digest(path) == entry["sha256"], "Changed/missing pinned artifact: " + str(path))

docs = [MAIN, GRILL / "phase28-q26-coaching-next-step-summary-research.md", Q27, GRILL / "phase28-session.md"] + sorted(HERE.glob("*.md"))
local_count = line_count = anchor_count = 0
for doc in docs:
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
clauses = re.findall(r"^### D26-C(\d\d)\b", main, re.M)
proofs = re.findall(r"^\| P(\d\d)\s*\|", main, re.M)
findings = re.findall(r"^\| F(\d\d)\s*\|", main, re.M)
categories = re.findall(r"^\| (\d+)\. ([^|]+)\| (\*\*[^|]+)\|", main, re.M)
require(clauses == [f"{i:02}" for i in range(1, 19)], "Expected exactly C01-C18")
require(proofs == [f"{i:02}" for i in range(1, 25)], "Expected exactly P01-P24")
require(findings == [f"{i:02}" for i in range(1, 15)], "Expected exactly F01-F14")
require([int(row[0]) for row in categories] == list(range(1, 23)), "Expected all 22 explicit categories")
require(all("Yes" in row[2] or "No" in row[2] for row in categories), "Missing material-concern disposition")
require("**Disposition: Accept with required amendments.**" in main, "Disposition missing")
require("**Status: Corrected decision and required amendments explicitly ratified on" in main, "D26 ratification missing")
require("## Subsequent explicit ratification" in main and "No counterexample, earlier PostgreSQL experiment or runtime test was" in main, "Ratification chronology/proof limits missing")
for row in re.findall(r"^\| F\d\d\s*\|.*$", main, re.M):
    require(len(row.split("|")) == 7 and re.search(r"C\d\d", row), "Incomplete finding trace: " + row[:60])
q26 = (GRILL / "phase28-q26-coaching-next-step-summary-research.md").read_text()
session = (GRILL / "phase28-session.md").read_text()
require("**Answered A.**" in q26, "Q26 not marked answered")
require("All twenty-six review dispositions" in session and "### D26 answer and completed adversarial review" in session, "Session not current")
q27 = Q27.read_text()
require("### Q27: resuming own preparation after returning (unanswered)" in session, "Q27 continuation missing")
require("Awaiting founder answer; neither" in q27 and "option is selected." in q27, "Q27 falsely selected")
require("### Q28" not in session, "Unexpected second question")
require("**Coaching next-step summary** (Phase 28 D26, ratified):" in (ROOT / "CONTEXT.md").read_text(), "Glossary status incorrect")

probe = json.loads((HERE / "disclosure-counterexamples.json").read_text())
reproduction = json.loads((HERE / "root-reproduction.json").read_text())
require(probe["passed"] and probe["negative_counterexamples"] == 9 and probe["positive_controls"] == 3 and len(probe["cases"]) == 12, "Finite result mismatch")
require(reproduction["passed"] and reproduction["prior_result_sha256"] == reproduction["reproduced_result_sha256"] == digest(HERE / "disclosure-counterexamples.json"), "Independent reproduction mismatch")
fetches = json.loads((HERE / "technical-fetches.json").read_text())["sources"]
unavailable = []
for entry in fetches:
    require(entry["status"] == 200 and entry["bytes"] > 0, "Unsuccessful claimed fetch: " + entry["url"])
    path = Path(entry["temporary_body_path"])
    if path.exists():
        require(digest(path) == entry["sha256"] and path.stat().st_size == entry["bytes"], "Technical source body mismatch: " + entry["url"])
    else:
        unavailable.append(str(path))

result = dict(scope=__doc__, passed=not errors, local_references=local_count,
              line_references=line_count, anchor_references=anchor_count,
              clauses=len(clauses), proof_obligations=len(proofs), material_findings=len(findings),
              categories=len(categories), prior_artifacts_unchanged=len(prior["artifacts"]),
              d26_evidence_pins=len(pins["artifacts"]), finite_negative_counterexamples=9,
              finite_positive_controls=3, independent_root_reproduction=reproduction["passed"],
              q26_answered_a=True, d26_amendments_ratified=True, q27_posed=True,
              q27_answered=False, initial_d26_artifacts_unchanged=len(ratification["artifacts"]),
              prior_probes_rerun_during_ratification=False,
              technical_fetches=len(fetches), unavailable_temporary_source_paths=unavailable,
              errors=errors)
RESULT.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
raise SystemExit(0 if result["passed"] else 1)
