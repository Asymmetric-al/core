#!/usr/bin/env python3
"""Read-only D31 ratification and Q32 continuation checks; executes no models."""

import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent


def preserved(manifest):
    entries = json.loads(manifest.read_text())["artifacts"]
    for entry in entries:
        path = ROOT / entry["path"]
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry["sha256"], f"Changed evidence: {path}"
    return len(entries)


def slugs(path):
    seen, result = {}, set()
    for text in re.findall(r"^#{1,6}\s+(.+)$", path.read_text(), re.M):
        text = re.sub(r"<[^>]+>", "", text).strip().lower()
        base = re.sub(r"\s", "-", re.sub(r"[^\w\-\s]", "", text))
        number = seen.get(base, 0)
        result.add(base if not number else f"{base}-{number}")
        seen[base] = number + 1
    result.update(re.findall(r'<a\s+(?:id|name)="([^"]+)"', path.read_text()))
    return result


def main():
    main_path = GRILL / "phase28-d31-confirmed-excess-follow-up-adversarial-review.md"
    question_path = GRILL / "phase28-q32-gift-and-fulfillment-follow-up-research.md"
    prior_question = GRILL / "phase28-q31-above-commitment-minimum-research.md"
    session_path = GRILL / "phase28-session.md"
    before = (HERE / "d31-before-ratification.txt").read_text()
    current = main_path.read_text()
    for start, end in [
        ("**C01 — Materiality.**", "## Consolidated adversarial findings"),
        ("## Acceptance criteria and release proof", "## Ruthless synthesis and delivery order"),
    ]:
        assert before[before.index(start):before.index(end)] == current[current.index(start):current.index(end)], start
    assert re.findall(r"^>.*$", before, re.M) == re.findall(r"^>.*$", current, re.M)
    assert "**Status: the corrected decision and required amendments were explicitly ratified on October 18, 2026 UTC.**" in current
    assert "## Subsequent explicit ratification and continuation" in current
    assert "amendments await explicit ratification" not in current
    assert len(re.findall(r"^\*\*C\d{2} —", current, re.M)) == 24
    assert len(re.findall(r"^\| P\d{2}\s*\|", current, re.M)) == 32
    assert len(re.findall(r"^\| F\d{2}\s*\|", current, re.M)) == 18
    category = current.split("## Every requested review category")[1].split("## Acceptance criteria")[0]
    assert len([line for line in category.splitlines() if "**Yes**" in line]) == 22
    assert "**Confirmed commitment excess** (Phase 28 D31, ratified):" in (ROOT / "CONTEXT.md").read_text()
    assert "amendments were explicitly ratified on October 18, 2026 UTC" in prior_question.read_text()
    session = session_path.read_text()
    assert re.search(r"^\| D31 \(answered Q31\).*explicitly ratified", session, re.M)
    assert re.search(r"^\| E31\s+\| Ratified", session, re.M)
    assert "### D31 explicit ratification" in session
    assert "### Q32: gift and commitment-fulfillment follow-up (unanswered)" in session
    assert "**Q32 is unanswered.**" in question_path.read_text()
    assert "**Q32 remains unanswered; no joint-purpose contract is" in session
    assert not re.search(r"^#{1,6}\s+Q33\b", session, re.M)
    assert len(re.findall(r"^- \*\*[AB] —", question_path.read_text(), re.M)) == 2
    d31 = preserved(HERE / "ratification-evidence-sha256.json")
    d30 = preserved(HERE / "prior-evidence-sha256.json")
    d29 = preserved(GRILL / "d30-evidence/prior-evidence-sha256.json")
    sources = [main_path, prior_question, question_path, session_path, ROOT / "CONTEXT.md"]
    links = line_links = anchors = 0
    cache = {}
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
                assert 1 <= line <= len(path.read_text().splitlines()), raw
                line_links += 1
            if anchor and path.suffix == ".md":
                if path not in cache:
                    cache[path] = slugs(path)
                assert anchor in cache[path], f"Bad anchor {source.name}: {raw}"
                anchors += 1
    for source in sources[:-1] + [Path(__file__)]:
        assert all(line == line.rstrip() for line in source.read_text().splitlines()), source
        assert not re.search(r"^(<<<<<<<|=======|>>>>>>>)", source.read_text(), re.M), source
    result = {
        "date": "2026-10-18",
        "status": "passed",
        "ratification": "D31 corrected decision, C01–C24, P01–P32 and operational controls explicitly ratified",
        "unchanged_review": {"decision_quote": True, "clauses": 24, "acceptance_criteria": 32, "findings": 18, "categories": 22},
        "preserved_artifacts": {"D31_initial": d31 - 1, "D31_original_review": 1, "D30": d30, "D29": d29},
        "links": {"local": links, "line_references": line_links, "anchors": anchors},
        "continuation": "Q32 posed and unanswered; two options; no Q33; no shared-purpose contract selected",
        "limits": "Structural verification only. No initial verifier, semantic model or database probe rerun. No application, source producer, SQL/RLS, provider, UI, load or release qualification.",
    }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
