#!/usr/bin/env python3
"""Read-only ratification checks; no old verifier, model or probe is executed."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d32-combined-gift-fulfillment-follow-up-adversarial-review.md"
Q32 = GRILL / "phase28-q32-gift-and-fulfillment-follow-up-research.md"
Q33 = GRILL / "phase28-q33-missionary-offline-gift-report-research.md"
SESSION = GRILL / "phase28-session.md"
SNAPSHOT = HERE / "d32-before-ratification.txt"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_manifest(path, historical_main=False):
    data = json.loads(path.read_text())
    entries = (
        [(ROOT / item["path"], item["sha256"]) for item in data["artifacts"]]
        if "artifacts" in data
        else [(GRILL / name, value) for name, value in data.items()]
    )
    for target, expected in entries:
        # The old pin attests to the pre-ratification document, now preserved
        # exactly; current status changes are deliberately checked separately.
        if historical_main and target == MAIN:
            target = SNAPSHOT
        assert target.is_file(), f"Missing artifact: {target}"
        assert digest(target) == expected, f"Changed artifact: {target}"
    return len(entries)


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


def exact_section(body, start, end):
    return body.split(start, 1)[1].split(end, 1)[0]


def main():
    body, before = MAIN.read_text(), SNAPSHOT.read_text()
    sections = [
        ("decision", "> **D32", "\n\nThe founder"),
        ("C01-C24", "**C01 —", "## Consolidated adversarial findings"),
        ("P01-P36", "| P01", "## Ruthless synthesis"),
    ]
    for name, start, end in sections:
        assert exact_section(body, start, end) == exact_section(before, start, end), name
    clauses = re.findall(r"^\*\*C(\d{2}) —", body, re.M)
    proofs = re.findall(r"^\| P(\d{2})\s*\|", body, re.M)
    findings = re.findall(r"^\| F(\d{2})\s*\|", body, re.M)
    assert clauses == [f"{n:02}" for n in range(1, 25)]
    assert proofs == [f"{n:02}" for n in range(1, 37)]
    assert findings == [f"{n:02}" for n in range(1, 19)]
    cats = exact_section(body, "## Every requested review category", "## Acceptance criteria")
    categories = [line for line in cats.splitlines() if line.startswith("| ") and "**Yes**" in line]
    assert len(categories) == 22
    assert "required amendments were explicitly ratified on October 18, 2026 UTC" in body
    assert "## Explicit ratification" in body
    assert "await explicit ratification" not in body
    assert "awaits ratification" not in body

    session, q32, q33 = SESSION.read_text(), Q32.read_text(), Q33.read_text()
    assert "All thirty-two review dispositions" in session
    assert "### D32 explicit ratification" in session
    assert "### Q33: missionary reporting of actual offline gifts (unanswered)" in session
    d32row = next(line for line in session.splitlines() if line.startswith("| D32 (answered Q32)"))
    e32row = next(line for line in session.splitlines() if line.startswith("| E32 "))
    assert "explicitly ratified, 2026-10-18 UTC" in d32row
    assert "Ratified engineering/UX requirements; runtime unqualified" in e32row
    assert "D29, D30, D31 and D32 with their required amendments" in session
    assert "D29, D30, D31 and D32\nwith their amendments are explicitly ratified" in session
    assert "amendments were explicitly ratified on October 18, 2026 UTC" in q32
    assert "await explicit ratification" not in q32
    assert "**Q33 is unanswered.**" in q33
    assert re.findall(r"^- \*\*([AB]) —", q33, re.M) == ["A", "B"]
    assert len(re.findall(r"^\*\*Should .*\?\*\*$", q33, re.M)) == 1
    assert not re.search(r"^#{1,6}\s+Q34\b", session + "\n" + q33, re.M)
    assert "**Combined gift and fulfillment follow-up** (Phase 28 D32, ratified):" in (ROOT / "CONTEXT.md").read_text()
    assert "required amendments were explicitly ratified on October 18, 2026 UTC" in (GRILL / "phase28-d31-confirmed-excess-follow-up-adversarial-review.md").read_text()

    preserved = {
        "D32_original_evidence_plus_review_snapshot": check_manifest(HERE / "ratification-evidence-sha256.json"),
        "D31": check_manifest(HERE / "prior-evidence-sha256.json"),
        "D30": check_manifest(GRILL / "d31-evidence/prior-evidence-sha256.json"),
        "D29": check_manifest(GRILL / "d30-evidence/prior-evidence-sha256.json"),
    }
    assert preserved["D32_original_evidence_plus_review_snapshot"] == 22
    historical_pins = check_manifest(HERE / "artifact-pins.json", historical_main=True)
    sources = [MAIN, Q32, Q33, SESSION, ROOT / "CONTEXT.md", *sorted(HERE.glob("*.md"))]
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
    for path in [MAIN, Q32, Q33, SESSION, Path(__file__)]:
        assert not re.search(r"^(<<<<<<<|=======|>>>>>>>)", path.read_text(), re.M), path
        assert not any(line.rstrip() != line for line in path.read_text().splitlines()), path
    print(json.dumps({
        "date": "2026-10-18",
        "status": "passed",
        "scope": "D32 ratification and Q33 frontier documentation only",
        "unchanged_exact_sections": [name for name, _, _ in sections],
        "review": {"clauses": len(clauses), "proofs": len(proofs), "findings": len(findings), "categories": len(categories)},
        "preserved_artifacts": preserved,
        "historical_pin_validation": {"count": historical_pins, "main_document": "Exact preserved pre-ratification snapshot"},
        "links": {"local": links, "line_references": lines, "anchors": anchors, "source_documents": len(sources)},
        "status_checks": ["D32 and all amendments ratified", "Q32 answered A", "organization-wide setting retained", "D31 remains ratified", "Q33 one unanswered A/B choice", "no Q34", "session and conceptual glossary consistent"],
        "limits": "Read-only structural/hash checks. No model, probe or earlier verifier executed; no source, SQL/RLS, concurrency, provider, migration, performance, accessibility or usability qualification.",
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
