#!/usr/bin/env python3
"""Read-only structural verification of D31 research; never runs evidence models."""

import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d31-confirmed-excess-follow-up-adversarial-review.md"
SESSION = GRILL / "phase28-session.md"
QUESTION = GRILL / "phase28-q31-above-commitment-minimum-research.md"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_manifest(path):
    entries = json.loads(path.read_text())["artifacts"]
    for entry in entries:
        target = ROOT / entry["path"]
        assert target.is_file(), f"Missing preserved artifact: {target}"
        assert digest(target) == entry["sha256"], f"Changed preserved artifact: {target}"
    return len(entries)


def heading_slugs(path):
    result, seen = set(), {}
    for text in re.findall(r"^#{1,6}\s+(.+)$", path.read_text(), re.M):
        text = re.sub(r"<[^>]+>", "", text).strip().lower()
        text = re.sub(r"[^\w\-\s]", "", text)
        slug = re.sub(r"\s", "-", text)
        number = seen.get(slug, 0)
        result.add(slug if number == 0 else f"{slug}-{number}")
        seen[slug] = number + 1
    result.update(re.findall(r'<a\s+(?:id|name)="([^"]+)"', path.read_text()))
    return result


def main():
    text = MAIN.read_text()
    clauses = re.findall(r"^\*\*C(\d{2}) —", text, re.M)
    proofs = re.findall(r"^\| P(\d{2})\s*\|", text, re.M)
    findings = re.findall(r"^\| F(\d{2})\s*\|", text, re.M)
    assert clauses == [f"{n:02}" for n in range(1, 25)], clauses
    assert proofs == [f"{n:02}" for n in range(1, 33)], proofs
    assert findings == [f"{n:02}" for n in range(1, 19)], findings
    section = text.split("## Every requested review category", 1)[1].split("## Acceptance criteria", 1)[0]
    categories = [line for line in section.splitlines() if line.startswith("| ") and "**Yes**" in line]
    assert len(categories) == 22, len(categories)
    assert "A selected; this corrected decision and its engineering amendments await explicit ratification" in text
    assert "No Q32 is posed" in text
    session = SESSION.read_text()
    assert "All thirty-one review dispositions" in session
    assert "| D31 (answered Q31)" in session and "| E31 " in session
    assert "### Q31: minimum amount for verified above-commitment follow-up (answered A)" in session
    assert "**A is selected; the corrected decision and required\namendments await explicit ratification.**" in session
    assert not re.search(r"^#{1,6}\s+Q32\b", session, re.M)
    assert "**The founder subsequently selected A.**" in QUESTION.read_text()
    assert "Q31 remains unanswered" in (HERE / "q31-before-answer.txt").read_text()
    assert "**Confirmed commitment excess** (Phase 28 D31, A selected; amendments pending):" in (ROOT / "CONTEXT.md").read_text()
    prior = verify_manifest(HERE / "prior-evidence-sha256.json")
    older = verify_manifest(GRILL / "d30-evidence/prior-evidence-sha256.json")
    current = verify_manifest(HERE / "artifact-pins.json")
    model = json.loads((HERE / "excess-counterexamples.json").read_text())
    reproduction = json.loads((HERE / "root-reproduction.json").read_text())
    assert model["counts"] == {"counterexample_families": 14, "positive_controls": 5, "passed_outcome_assertions": 88}
    assert model["script_sha256"] == digest(HERE / "excess-counterexamples.py")
    assert reproduction["byte_identical"] is True
    assert reproduction["expected_sha256"] == reproduction["actual_sha256"] == digest(HERE / "excess-counterexamples.json")
    assert reproduction["script_sha256"] == model["script_sha256"]
    assert reproduction["counts"] == model["counts"]
    sources = [MAIN, SESSION, QUESTION, ROOT / "CONTEXT.md", *sorted(HERE.glob("*.md"))]
    links = line_links = anchors = 0
    slug_cache = {}
    for source in sources:
        for raw in re.findall(r"\[[^\]\n]+\]\(([^\s()]+)\)", source.read_text()):
            raw = unquote(raw.strip("<>"))
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", raw):
                continue
            target, _, anchor = raw.partition("#")
            match = re.search(r":(\d+)$", target)
            line = int(match[1]) if match else None
            if match:
                target = target[:match.start()]
            path = (source.parent / target).resolve() if target else source
            assert path.exists(), f"Broken local link {source.name}: {raw}"
            links += 1
            if line is not None:
                assert 1 <= line <= len(path.read_text().splitlines()), f"Bad line {source.name}: {raw}"
                line_links += 1
            if anchor and path.suffix == ".md":
                if path not in slug_cache:
                    slug_cache[path] = heading_slugs(path)
                assert anchor in slug_cache[path], f"Bad anchor {source.name}: {raw}"
                anchors += 1
    for path in [MAIN, QUESTION, SESSION, *HERE.glob("*.md"), HERE / "verify-review.py"]:
        assert not any(line.rstrip() != line for line in path.read_text().splitlines()), f"Trailing whitespace: {path}"
        assert not re.search(r"^(<<<<<<<|=======|>>>>>>>)", path.read_text(), re.M), f"Conflict marker: {path}"
    result = {
        "date": "2026-10-18",
        "status": "passed",
        "scope": "D31 research documentation, status, evidence hashes and links; read-only verifier",
        "review": {"clauses": len(clauses), "acceptance_criteria": len(proofs), "findings": len(findings), "categories": len(categories)},
        "model": model["counts"],
        "root_reproduction": "byte-identical earlier execution recorded; no model executed by this verifier",
        "preserved_artifacts": {"D30": prior, "D29": older, "current_D31_pins": current},
        "links": {"local": links, "line_references": line_links, "anchors": anchors, "source_documents": len(sources)},
        "status_checks": ["Q31 answered A", "D31 amendments await explicit ratification", "D30 remains ratified", "original Q31 preserved", "no Q32 posed", "conceptual glossary updated"],
        "limits": "Structural/research evidence only. No SQL/RLS, actual financial source, runtime concurrency, provider, migration, performance, accessibility or usability proof. No earlier model/probe/verifier executed.",
    }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
