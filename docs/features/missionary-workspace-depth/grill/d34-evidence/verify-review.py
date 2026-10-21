#!/usr/bin/env python3
"""Read-only D34 structure/provenance verification; executes no model or probe."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d34-expired-referral-history-adversarial-review.md"
QUESTION = GRILL / "phase28-q34-expired-referral-history-research.md"
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
    assert "A is selected. The corrected decision and required amendments below await" in body
    assert "explicit ratification." in body
    assert "No Q35 is posed" in body
    for token in ["ADR-0209", "ADR-0211", "ADR-0183", "p50/p99", "P9 keyset",
                  "no dummy ministry", "already lawfully released", "68 outcome",
                  "13 counterexample families and 4 positive controls"]:
        assert token in body, token
    assert "do not cancel independently valid promised/planned" in body
    assert "does not authorize permanent readable names" in " ".join(body.split())
    assert "Source corrections update permitted labels, dates or state" in body

    session, question = SESSION.read_text(), QUESTION.read_text()
    glossary = (ROOT / "CONTEXT.md").read_text()
    assert "All thirty-four review dispositions" in session
    assert "### Q34: limited expired-referral history (answered A)" in session
    assert "### D34 answer and completed adversarial review" in session
    assert "| D34 (answered Q34)" in session and "| E34 " in session
    assert "**Q34 is answered A.**" in question
    assert "**Q34 is unanswered.**" in (HERE / "q34-before-answer.txt").read_text()
    assert "**Q34 is unanswered.**" not in question
    assert not re.search(r"^#{1,6}\s+Q35\b", session + "\n" + question, re.M)
    entry = "**Expired-referral history** (Phase 28 D34, A selected; amendments pending):"
    assert glossary.count(entry) == 1
    d33 = (GRILL / "phase28-d33-missionary-offline-gift-report-adversarial-review.md").read_text()
    assert "required amendments were explicitly ratified on October 18, 2026 UTC" in d33

    preserved = {
        "D33": check_manifest(HERE / "prior-evidence-sha256.json"),
        "D32": check_manifest(GRILL / "d33-evidence/prior-evidence-sha256.json"),
        "D31": check_manifest(GRILL / "d32-evidence/prior-evidence-sha256.json"),
        "D30": check_manifest(GRILL / "d31-evidence/prior-evidence-sha256.json"),
        "D29": check_manifest(GRILL / "d30-evidence/prior-evidence-sha256.json"),
    }
    assert preserved == {"D33": 23, "D32": 25, "D31": 19, "D30": 19, "D29": 20}
    pins = check_manifest(HERE / "artifact-pins.json")
    frozen = {
        "history-counterexamples.py": "561371d18104792e8ad9dd6d9f7c190a4645bc013b00bd342a41c706db791f95",
        "history-counterexamples.json": "6234d205dc5b481291f1fd22a99679067a7b446e57b2b4fcdad7a6858abd3272",
        "model-readme.md": "4e439d429fc420696bab24929b662d4e48606f4202c7ec246f829dc343a76983",
        "counterexample-review.md": "95eee952b9eaa0599c729e043b47d5224e4316e1e670cc7c3e6e8db062de2bdb",
    }
    for name, expected in frozen.items():
        assert digest(HERE / name) == expected, name
    model = json.loads((HERE / "history-counterexamples.json").read_text())
    reproduction = json.loads((HERE / "root-reproduction.json").read_text())
    assert model["script_sha256"] == digest(HERE / "history-counterexamples.py")
    assert model["counts"] == {"counterexample_families": 13, "positive_controls": 4, "passed_outcome_assertions": 68}
    assert reproduction["byte_identical"] is True
    assert reproduction["actual_sha256"] == reproduction["expected_sha256"] == digest(HERE / "history-counterexamples.json")
    assert reproduction["script_sha256"] == model["script_sha256"]
    assert reproduction["counts"] == model["counts"]

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
        "scope": "D34 research structure, status, local references, finite model provenance and preserved evidence only",
        "review": {"clauses": len(clauses), "proofs": len(proofs), "findings": len(findings), "categories": len(categories)},
        "preserved_prior_artifacts": preserved,
        "current_pinned_artifacts": pins,
        "model": model["counts"],
        "root_reproduction": "recorded byte-identical execution of new D34 model only; verifier executes no model",
        "frozen_model_artifacts": len(frozen),
        "links": {"local": links, "line_references": lines, "anchors": anchors, "source_documents": len(sources)},
        "status_checks": ["Q34 answered A", "D34 amendments awaiting ratification", "D33 remains ratified", "no Q35 posed", "conceptual glossary and session coherent"],
        "limits": "No real source, SQL/RLS, timing uniformity, locks/concurrency, browser, retention/restore, migration, production performance, accessibility or usability qualification. No earlier model/probe/verifier executed.",
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
