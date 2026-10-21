#!/usr/bin/env python3
"""Read-only D35 ratification/Q36 checks; no model or earlier verifier runs."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d35-referral-continuation-adversarial-review.md"
Q35 = GRILL / "phase28-q35-expired-referral-continuation-authority-research.md"
Q36 = GRILL / "phase28-q36-referral-window-policy-research.md"
SESSION = GRILL / "phase28-session.md"
SNAPSHOT = HERE / "d35-before-ratification.txt"
QUESTION_SNAPSHOT = HERE / "q35-before-ratification.txt"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def manifest(path, historical=False):
    data = json.loads(path.read_text())
    entries = [(ROOT / x["path"], x["sha256"]) for x in data["artifacts"]] if "artifacts" in data else [(GRILL / n, h) for n, h in data.items()]
    for target, expected in entries:
        if historical and target == MAIN:
            target = SNAPSHOT
        elif historical and target == Q35:
            target = QUESTION_SNAPSHOT
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


def section(body, start, end):
    return body.split(start, 1)[1].split(end, 1)[0]


def main():
    body, before = MAIN.read_text(), SNAPSHOT.read_text()
    exact = [("decision", "> **D35", "\n\nThe founder"),
             ("C01-C24", "**C01 —", "## Consolidated adversarial findings"),
             ("P01-P40", "| P01", "## Ruthless synthesis")]
    for label, start, end in exact:
        assert section(body, start, end) == section(before, start, end), label
    clauses = re.findall(r"^\*\*C(\d{2}) —", body, re.M)
    proofs = re.findall(r"^\| P(\d{2})\s*\|", body, re.M)
    findings = re.findall(r"^\| F(\d{2})\s*\|", body, re.M)
    assert clauses == [f"{n:02}" for n in range(1, 25)]
    assert proofs == [f"{n:02}" for n in range(1, 41)]
    assert findings == [f"{n:02}" for n in range(1, 19)]
    categories = [x for x in section(body, "## Every requested review category", "## Acceptance criteria").splitlines() if x.startswith("| ") and ("**Yes" in x or "**No additional" in x)]
    assert len(categories) == 22
    assert "required amendments were explicitly ratified on October 18, 2026 Asia/Bangkok" in body.replace("\n", " ")
    assert "## Explicit ratification" in body and "await explicit ratification" not in body
    q35, q36, session = Q35.read_text(), Q36.read_text(), SESSION.read_text()
    assert "required amendments were explicitly ratified on October 18, 2026 Asia/Bangkok" in q35.replace("\n", " ")
    assert "pending explicit ratification" not in q35
    assert "**Q36 is unanswered.**" in q36
    assert re.findall(r"^- \*\*([AB]) —", q36, re.M) == ["A", "B"]
    assert len(re.findall(r"^\*\*How .*\?\*\*$", q36, re.M)) == 1
    assert "**B — Allow a permitted missionary to adjust the end date.**" in q36
    assert "The initial-referral period" in q36
    assert "All thirty-five review dispositions" in session
    assert "### D35 explicit ratification" in session
    assert "### Q36:" in session and "(unanswered)" in session.split("### Q36:", 1)[1].splitlines()[0]
    d35row = next(x for x in session.splitlines() if x.startswith("| D35 (answered Q35)"))
    e35row = next(x for x in session.splitlines() if x.startswith("| E35 "))
    assert "explicitly ratified, 2026-10-18 Asia/Bangkok" in d35row
    assert "Ratified engineering/UX requirements; runtime unqualified" in e35row
    assert "D31, D32, D33, D34 and D35 with their required amendments" in session
    assert "**Referral continuation** (Phase 28 D35, ratified):" in (ROOT / "CONTEXT.md").read_text()
    assert not re.search(r"^#{1,6}\s+(?:D36|Q37)\b", session + "\n" + q36, re.M)
    assert "## Explicit ratification" in (GRILL / "phase28-d34-expired-referral-history-adversarial-review.md").read_text()

    preserved = {"D35_original_evidence_plus_review_and_question_snapshots": manifest(HERE / "ratification-evidence-sha256.json"),
                 "D34": manifest(HERE / "prior-evidence-sha256.json"),
                 "D33": manifest(GRILL / "d34-evidence/prior-evidence-sha256.json"),
                 "D32": manifest(GRILL / "d33-evidence/prior-evidence-sha256.json"),
                 "D31": manifest(GRILL / "d32-evidence/prior-evidence-sha256.json"),
                 "D30": manifest(GRILL / "d31-evidence/prior-evidence-sha256.json"),
                 "D29": manifest(GRILL / "d30-evidence/prior-evidence-sha256.json")}
    assert preserved == {"D35_original_evidence_plus_review_and_question_snapshots": 22, "D34": 20, "D33": 23, "D32": 25, "D31": 19, "D30": 19, "D29": 20}
    pins = manifest(HERE / "artifact-pins.json", historical=True)
    assert pins == 20
    sources = [MAIN, Q35, Q36, SESSION, ROOT / "CONTEXT.md", *sorted(x for x in HERE.glob("*.md") if not x.name.startswith("initial-"))]
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
    for path in [MAIN, Q35, Q36, SESSION, Path(__file__)]:
        assert not re.search(r"^(<<<<<<<|=======|>>>>>>>)", path.read_text(), re.M), path
        assert not any(line.rstrip() != line for line in path.read_text().splitlines()), path
    print(json.dumps({"date": "2026-10-18", "timezone": "Asia/Bangkok", "status": "passed",
        "scope": "D35 ratification and Q36 frontier documentation only",
        "unchanged_exact_sections": [x[0] for x in exact],
        "review": {"clauses": len(clauses), "acceptance_criteria": len(proofs), "findings": len(findings), "categories": len(categories)},
        "preserved_artifacts": preserved, "historical_pins": pins,
        "historical_pin_note": "Current D35/Q35 status changes are checked separately; exact pre-ratification bytes match the original pins.",
        "links": {"local": links, "line_references": lines, "anchors": anchors, "source_documents": len(sources)},
        "status_checks": ["D35 decision and all amendments ratified", "Q35 answered A", "D34 remains ratified", "Q36 one unanswered A/B choice", "no D36 or Q37", "session and glossary consistent"],
        "limits": "Read-only structural/hash verification. No model, probe or earlier verifier executed. No live source, SQL/RLS, concurrency, provider, migration, performance, accessibility or usability qualification."}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
