#!/usr/bin/env python3
"""Read-only D35 documentation checks. Executes no model or prior verifier."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d35-referral-continuation-adversarial-review.md"
QUESTION = GRILL / "phase28-q35-expired-referral-continuation-authority-research.md"
SESSION = GRILL / "phase28-session.md"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def manifest(path):
    data = json.loads(path.read_text())
    entries = [(ROOT / x["path"], x["sha256"]) for x in data["artifacts"]] if "artifacts" in data else [(GRILL / n, h) for n, h in data.items()]
    for target, expected in entries:
        assert target.is_file(), f"Missing artifact: {target}"
        assert digest(target) == expected, f"Changed artifact: {target}"
    return len(entries)


def slugs(path):
    result, seen = set(), {}
    for heading in re.findall(r"^#{1,6}\s+(.+)$", path.read_text(), re.M):
        heading = re.sub(r"<[^>]+>", "", heading).strip().lower()
        heading = re.sub(r"[^\w\-\s]", "", heading)
        slug = re.sub(r"\s", "-", heading)
        n = seen.get(slug, 0)
        result.add(slug if n == 0 else f"{slug}-{n}")
        seen[slug] = n + 1
    result.update(re.findall(r'<a\s+(?:id|name)="([^"]+)"', path.read_text()))
    return result


def main():
    body, question, session = MAIN.read_text(), QUESTION.read_text(), SESSION.read_text()
    clauses = re.findall(r"^\*\*C(\d{2}) —", body, re.M)
    proofs = re.findall(r"^\| P(\d{2})\s*\|", body, re.M)
    findings = re.findall(r"^\| F(\d{2})\s*\|", body, re.M)
    assert clauses == [f"{n:02}" for n in range(1, 25)]
    assert proofs == [f"{n:02}" for n in range(1, 41)]
    assert findings == [f"{n:02}" for n in range(1, 19)]
    section = body.split("## Every requested review category", 1)[1].split("## Acceptance criteria", 1)[0]
    categories = [x for x in section.splitlines() if x.startswith("| ") and ("**Yes" in x or "**No additional" in x)]
    assert len(categories) == 22
    assert "required amendments below await explicit ratification" in body.replace("\n", " ")
    assert "initial Off default" in body and "proposed product" in body
    assert "time alone" in body and "admissible lifetime" in body
    assert "**Q35 is answered A;" in question and "Q35 is unanswered" not in question
    assert "**Q35 is unanswered.**" in (HERE / "q35-before-answer.txt").read_text()
    assert "All thirty-five review dispositions" in session
    assert "### Q35:" in session and "(answered A)" in session.split("### Q35:", 1)[1].splitlines()[0]
    d35 = next(x for x in session.splitlines() if x.startswith("| D35 (answered Q35)"))
    e35 = next(x for x in session.splitlines() if x.startswith("| E35 "))
    assert "await explicit ratification" in d35
    assert "Proposed engineering/UX requirements; runtime unqualified" in e35
    assert "### D34 explicit ratification" in session and "### D35 answer and completed adversarial review" in session
    assert not re.search(r"^#{1,6}\s+Q36\b", body + "\n" + question + "\n" + session, re.M)
    glossary = (ROOT / "CONTEXT.md").read_text()
    assert "**Referral continuation** (Phase 28 D35, A selected; amendments pending ratification):" in glossary
    d34 = (GRILL / "phase28-d34-expired-referral-history-adversarial-review.md").read_text()
    assert "## Explicit ratification" in d34
    preserved = {"D34": manifest(HERE / "prior-evidence-sha256.json"),
                 "D33": manifest(GRILL / "d34-evidence/prior-evidence-sha256.json"),
                 "D32": manifest(GRILL / "d33-evidence/prior-evidence-sha256.json"),
                 "D31": manifest(GRILL / "d32-evidence/prior-evidence-sha256.json"),
                 "D30": manifest(GRILL / "d31-evidence/prior-evidence-sha256.json"),
                 "D29": manifest(GRILL / "d30-evidence/prior-evidence-sha256.json")}
    assert preserved == {"D34": 20, "D33": 23, "D32": 25, "D31": 19, "D30": 19, "D29": 20}
    initial = json.loads((HERE / "initial-model-artifact-sha256.json").read_text())
    assert len(initial["artifacts"]) == 4
    for entry in initial["artifacts"]:
        path = HERE / entry["snapshot"]
        assert digest(path) == entry["sha256"]
        assert path.stat().st_size == entry["bytes"]
    reproduction = json.loads((HERE / "root-reproduction.json").read_text())
    assert reproduction["byte_identical"] is True
    assert reproduction["source_sha256"] == digest(HERE / "continuation-counterexamples.py")
    assert reproduction["output_sha256"] == digest(HERE / "continuation-counterexamples.json")
    pinned = manifest(HERE / "artifact-pins.json")
    # Historical initial Markdown is preserved as evidence, not treated as current wording.
    sources = [MAIN, QUESTION, SESSION, ROOT / "CONTEXT.md", *sorted(x for x in HERE.glob("*.md") if not x.name.startswith("initial-"))]
    links = lines = anchors = 0
    cache = {}
    for source in sources:
        for raw in re.findall(r"\[[^\]\n]+\]\(([^\s()]+)\)", source.read_text()):
            raw = unquote(raw.strip("<>"))
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", raw):
                continue
            target, _, anchor = raw.partition("#")
            m = re.search(r":(\d+)$", target)
            line = int(m[1]) if m else None
            if m:
                target = target[:m.start()]
            path = (source.parent / target).resolve() if target else source
            assert path.exists(), f"Broken link in {source}: {raw}"
            links += 1
            if line:
                assert 0 < line <= len(path.read_text().splitlines()), f"Invalid line: {raw}"
                lines += 1
            if anchor and path.suffix == ".md":
                if path not in cache:
                    cache[path] = slugs(path)
                assert anchor in cache[path], f"Invalid anchor in {source}: {raw}"
                anchors += 1
    for path in [MAIN, QUESTION, SESSION, Path(__file__), *[x for x in sources if x.parent == HERE]]:
        assert not re.search(r"^(<<<<<<<|=======|>>>>>>>)", path.read_text(), re.M), path
        assert not any(line.rstrip() != line for line in path.read_text().splitlines()), path
    print(json.dumps({
        "date": "2026-10-18", "timezone": "Asia/Bangkok", "status": "passed",
        "scope": "D35 answer-review documentation only; amendments pending ratification",
        "review": {"clauses": len(clauses), "acceptance_criteria": len(proofs), "findings": len(findings), "categories": len(categories)},
        "preserved_artifacts": preserved, "initial_model_snapshots": 4, "current_pins": pinned,
        "links": {"local": links, "line_references": lines, "anchors": anchors, "source_documents": len(sources)},
        "status_checks": ["D34 remains ratified", "Q35 answered A and tenant control requested", "D35 amendments pending ratification", "no Q36", "session and glossary consistent", "new model independent reproduction hashes match"],
        "limits": "Read-only structural and hash checks. This verifier executes no model, probe or previous verifier. No real source, SQL/RLS, concurrency, retention/restore, migration, performance, accessibility or usability qualification."
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
