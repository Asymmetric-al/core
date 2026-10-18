#!/usr/bin/env python3
"""Read-only D33 structure/provenance verification; executes no model or probe."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d33-missionary-offline-gift-report-adversarial-review.md"
QUESTION = GRILL / "phase28-q33-missionary-offline-gift-report-research.md"
SESSION = GRILL / "phase28-session.md"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_manifest(path):
    data = json.loads(path.read_text())
    entries = (
        [(ROOT / item["path"], item["sha256"]) for item in data["artifacts"]]
        if "artifacts" in data
        else [(GRILL / name, value) for name, value in data.items()]
    )
    for target, expected in entries:
        assert target.is_file(), f"Missing artifact: {target}"
        assert digest(target) == expected, f"Changed artifact: {target}"
    return len(entries)


def section(body, start, end):
    return body.split(start, 1)[1].split(end, 1)[0]


def slugs(path):
    result, seen = set(), {}
    for heading in re.findall(r"^#{1,6}\s+(.+)$", path.read_text(), re.M):
        heading = re.sub(r"<[^>]+>", "", heading).strip().lower()
        heading = re.sub(r"[^\w\-\s]", "", heading)
        slug = re.sub(r"\s", "-", heading)
        count = seen.get(slug, 0)
        result.add(slug if count == 0 else f"{slug}-{count}")
        seen[slug] = count + 1
    result.update(re.findall(r'<a\s+(?:id|name)="([^"]+)"', path.read_text()))
    return result


def main():
    body = MAIN.read_text()
    clauses = re.findall(r"^\*\*C(\d{2}) —", body, re.M)
    proof_section = section(body, "## Acceptance criteria and release proof", "## Ruthless synthesis")
    proofs = re.findall(r"^\| P(\d{2})\s*\|", proof_section, re.M)
    findings = re.findall(r"^\| F(\d{2})\s*\|", body, re.M)
    assert clauses == [f"{n:02}" for n in range(1, 25)]
    assert proofs == [f"{n:02}" for n in range(1, 37)]
    assert findings == [f"{n:02}" for n in range(1, 19)]
    category_section = section(body, "## Every requested review category", "## Acceptance criteria")
    categories = [line for line in category_section.splitlines()
                  if line.startswith("| ") and ("**Yes" in line or "**No additional" in line)]
    assert len(categories) == 22
    assert "**Disposition: Accept with required amendments.**" in body
    assert "A, tenant control and default Off are explicitly selected" in body
    assert "and engineering amendments below await explicit ratification" in body
    assert "No Q34 is posed" in body
    assert "ADR-0211" in body and "MON27-110" in body and "MON27-112" in body
    assert "Older than 5 minutes, or any terminal retry failure" in body
    assert "Any 1 credible unsafe misunderstanding before or after release" in body
    assert "preserve the organization's explicit qualified choice" in body

    session, question = SESSION.read_text(), QUESTION.read_text()
    assert "All thirty-three review dispositions" in session
    assert "### Q33: missionary reporting of actual offline gifts (answered A)" in session
    assert "### D33 answer and completed adversarial review" in session
    assert "| D33 (answered Q33)" in session and "| E33 " in session
    assert "**Q33 is answered A.**" in question
    assert "**Q33 is unanswered.**" in (HERE / "q33-before-answer.txt").read_text()
    assert not re.search(r"^#{1,6}\s+Q34\b", session + "\n" + question, re.M)
    assert "**Missionary gift reporting** (Phase 28 D33, A selected; amendments pending):" in (ROOT / "CONTEXT.md").read_text()
    assert "required amendments were explicitly ratified on October 18, 2026 UTC" in (GRILL / "phase28-d32-combined-gift-fulfillment-follow-up-adversarial-review.md").read_text()

    preserved = {
        "D32": check_manifest(HERE / "prior-evidence-sha256.json"),
        "D31": check_manifest(GRILL / "d32-evidence/prior-evidence-sha256.json"),
        "D30": check_manifest(GRILL / "d31-evidence/prior-evidence-sha256.json"),
        "D29": check_manifest(GRILL / "d30-evidence/prior-evidence-sha256.json"),
    }
    assert preserved["D32"] == 25
    pins = check_manifest(HERE / "artifact-pins.json")
    initial = json.loads((HERE / "initial-model.json").read_text())
    model = json.loads((HERE / "report-counterexamples.json").read_text())
    reproduction = json.loads((HERE / "root-reproduction.json").read_text())
    assert initial["script_sha256"] == digest(HERE / "initial-model.py.txt")
    assert initial["counts"] == {"counterexample_families": 13, "positive_controls": 4, "passed_outcome_assertions": 79}
    assert model["script_sha256"] == digest(HERE / "report-counterexamples.py")
    assert model["counts"] == {"counterexample_families": 15, "positive_controls": 5, "passed_outcome_assertions": 91}
    assert reproduction["byte_identical"] is True
    assert reproduction["actual_sha256"] == reproduction["expected_sha256"] == digest(HERE / "report-counterexamples.json")
    assert reproduction["script_sha256"] == model["script_sha256"]
    assert reproduction["counts"] == model["counts"]
    assert digest(HERE / "initial-model.py.txt") == "89db41e17665322ccdea9367df185ec4f2047ea3e8383911fc158fc911526403"
    assert digest(HERE / "initial-model-readme.md") == "fd6f8b51d8e416171c19b2c74a9e129adf9f8fc96aa82217db64e345a331f432"

    sources = [MAIN, QUESTION, SESSION, ROOT / "CONTEXT.md", *sorted(HERE.glob("*.md"))]
    links = lines = anchors = 0
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
            assert path.exists(), f"Broken link in {source}: {raw}"
            links += 1
            if line:
                assert 0 < line <= len(path.read_text().splitlines()), f"Invalid line: {raw}"
                lines += 1
            if anchor and path.suffix == ".md":
                if path not in slug_cache:
                    slug_cache[path] = slugs(path)
                assert anchor in slug_cache[path], f"Invalid anchor in {source}: {raw}"
                anchors += 1
    for path in [MAIN, QUESTION, SESSION, Path(__file__), *HERE.glob("*.md")]:
        assert not re.search(r"^(<<<<<<<|=======|>>>>>>>)", path.read_text(), re.M), path
        assert not any(line.rstrip() != line for line in path.read_text().splitlines()), path
    print(json.dumps({
        "date": "2026-10-18", "status": "passed",
        "scope": "D33 research structure, status, links, bounded model provenance and preserved evidence only",
        "review": {"clauses": len(clauses), "proofs": len(proofs), "findings": len(findings), "categories": len(categories)},
        "preserved_prior_artifacts": preserved,
        "current_pinned_artifacts": pins,
        "model": model["counts"],
        "initial_model": {"counts": initial["counts"], "status": "preserved byte-for-byte; revised after root found omitted policy-cycle case"},
        "root_reproduction": "recorded byte-identical execution of revised D33 model only; verifier executes no model",
        "links": {"local": links, "line_references": lines, "anchors": anchors, "source_documents": len(sources)},
        "status_checks": ["Q33 answered A", "tenant control and default Off selected", "D33 amendments awaiting ratification", "D32 remains ratified", "no Q34 posed", "conceptual glossary and session coherent"],
        "limits": "No real financial source, SQL/RLS, actual locks/concurrency, provider, migration, performance, accessibility or usability qualification. No earlier model/probe/verifier executed.",
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
