#!/usr/bin/env python3
"""New documentary verifier for D43 ratification and unanswered Q44.

All prior evidence, including programs, is read as bytes or JSON data only.
No earlier program/model is read as source, imported, or executed. This file
uses only Python's standard library and writes only ratification-verification.json.
"""

from __future__ import annotations

import hashlib
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit


EVIDENCE = Path(__file__).resolve().parent
GRILL = EVIDENCE.parent
ROOT = EVIDENCE.parents[4]
REPORT = EVIDENCE / "ratification-verification.json"
MANIFEST = EVIDENCE / "ratification-evidence-sha256.json"
CURRENT = {
    "review": GRILL / "phase28-d43-pending-newsletter-confirmation-adversarial-review.md",
    "q43": GRILL / "phase28-q43-pending-newsletter-confirmation-research.md",
    "session": GRILL / "phase28-session.md",
    "coverage": GRILL / "phase28-post-d41-coverage-synthesis.md",
    "completeness": GRILL / "phase28-completeness-adversarial-review.md",
    "d42": GRILL / "phase28-d42-verified-email-newsletter-signup-adversarial-review.md",
    "context": ROOT / "CONTEXT.md",
    "q44": GRILL / "phase28-q44-newsletter-confirmation-period-research.md",
    "scope": EVIDENCE / "ratification-scope.md",
    "primary": EVIDENCE / "q44-primary-research.md",
}
CHECKS = []


def relative(path):
    return str(path.relative_to(ROOT))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def compact(text):
    return " ".join(text.split())


def record(name, ok, detail=None):
    CHECKS.append({"name": name, "pass": bool(ok), "detail": detail})


def manifest_records(data):
    if isinstance(data, dict):
        if isinstance(data.get("path"), str) and re.fullmatch(r"[0-9a-f]{64}", str(data.get("sha256", ""))):
            yield data["path"], data["sha256"]
        for key, value in data.items():
            is_path = "/" in key or key.endswith((".json", ".md", ".txt", ".sql", ".py"))
            if is_path and re.fullmatch(r"[0-9a-f]{64}", str(value)):
                yield key, value
            elif isinstance(value, (dict, list)):
                yield from manifest_records(value)
    elif isinstance(data, list):
        for value in data:
            yield from manifest_records(value)


def preserved_evidence():
    work = [MANIFEST]
    manifests = set()
    paths = set()
    opaque_pins = set()
    mismatches = []
    comparisons = 0
    direct = 0
    while work:
        current = work.pop()
        if current in manifests:
            continue
        manifests.add(current)
        entries = list(manifest_records(json.loads(current.read_text())))
        if current == MANIFEST:
            direct = len(entries)
        for name, expected in entries:
            comparisons += 1
            candidates = [ROOT / name, current.parent / name, GRILL / name]
            resolved = next((p.resolve() for p in candidates if p.is_file()), None)
            if resolved is None:
                mismatches.append({"manifest": relative(current), "path": name, "error": "missing"})
                continue
            paths.add(resolved)
            actual = digest(resolved)
            if actual != expected:
                mismatches.append({"manifest": relative(current), "path": relative(resolved), "expected": expected, "actual": actual})
            if resolved.name.endswith("sha256.json"):
                work.append(resolved)
            elif resolved.name == "artifact-pins.json":
                opaque_pins.add(resolved)
    report = {"direct_entries": direct, "explicit_manifests": len(manifests),
              "distinct_frozen_files": len(paths), "hash_comparisons": comparisons,
              "historical_pin_files_hashed_without_following_pins": len(opaque_pins),
              "mismatches": mismatches}
    record("Exactly 22 direct frozen entries", direct == 22, direct)
    record("All recursively referenced explicit SHA-256 manifest entries preserved", not mismatches, report)
    return report


def headings_as_blocks(text, pattern):
    blocks = {}
    for heading in re.finditer(pattern, text, re.M):
        following = re.search(r"^#{1,3} ", text[heading.end():], re.M)
        end = heading.end() + following.start() if following else len(text)
        blocks[heading.group(1)] = compact(text[heading.start():end])
    return blocks


def section(text, name):
    opening = re.search(r"^## " + re.escape(name) + r"[ \t]*$", text, re.M)
    if not opening:
        return ""
    ending = re.search(r"^## ", text[opening.end():], re.M)
    return text[opening.end():opening.end() + ending.start()] if ending else text[opening.end():]


def category_rows(text):
    result = []
    for line in section(text, "Every requested category").splitlines():
        cells = [part.strip() for part in line.split("|")[1:-1]]
        if len(cells) == 2 and re.match(r"\*\*(?:Yes|No)\b", cells[1]):
            result.append(tuple(compact(cell) for cell in cells))
    return result


def proof_rows(text):
    return [compact(row) for row in text.splitlines() if re.match(r"^\|\s*P\d{2}\s*\|", row)]


def without_fences(text):
    return re.sub(r"(?ms)^(```|~~~).*?^\1[^\n]*(?:\n|$)", "\n", text)


def link_destinations(text):
    text = without_fences(text)
    for match in re.finditer(r"\]\(", text):
        pos = match.end()
        while pos < len(text) and text[pos].isspace():
            pos += 1
        if pos < len(text) and text[pos] == "<":
            closing = text.find(">", pos + 1)
            if closing >= 0:
                yield text[pos + 1:closing]
            continue
        start, depth = pos, 0
        while pos < len(text):
            char = text[pos]
            if char == "\\":
                pos += 2
                continue
            if char == "(":
                depth += 1
            elif char == ")":
                if not depth:
                    break
                depth -= 1
            elif char.isspace() and not depth:
                break
            pos += 1
        yield text[start:pos]
    for match in re.finditer(r"(?m)^\s{0,3}\[[^]]+\]:\s*(?:<([^>]+)>|(\S+))", text):
        yield match.group(1) or match.group(2)


def anchors(text):
    found, repetitions = set(), {}
    for match in re.finditer(r"(?m)^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$", without_fences(text)):
        label = html.unescape(match.group(1))
        label = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", label)
        label = re.sub(r"<[^>]*>", "", label)
        slug = re.sub(r"[^\w\- ]", "", label.lower()).replace(" ", "-")
        index = repetitions.get(slug, 0)
        repetitions[slug] = index + 1
        found.add(slug if index == 0 else f"{slug}-{index}")
    found.update(re.findall(r"(?i)\b(?:id|name)=[\"']([^\"']+)[\"']", text))
    return found


def verify_links(paths):
    info = {"documents": len(paths), "local_targets": 0, "line_checks": 0,
            "heading_checks": 0, "external_targets_not_fetched": 0,
            "generated_report_targets": 0, "failures": []}
    for source in paths:
        if not source.is_file():
            info["failures"].append({"source": relative(source), "reason": "missing document"})
            continue
        for target in link_destinations(source.read_text()):
            if urlsplit(target).scheme or target.startswith("//"):
                info["external_targets_not_fetched"] += 1
                continue
            location, _, fragment = target.partition("#")
            location = unquote(re.sub(r"\\([() ])", r"\1", location))
            line_match = re.search(r":(\d+)$", location)
            line = int(line_match.group(1)) if line_match else None
            if line_match:
                location = location[:line_match.start()]
            path = (source.parent / location).resolve() if location else source
            info["local_targets"] += 1
            if path == REPORT and not line and not fragment:
                # This output is created before successful program completion.
                info["generated_report_targets"] += 1
                continue
            if not path.exists():
                info["failures"].append({"source": relative(source), "target": target, "reason": "missing target"})
                continue
            if line is not None:
                info["line_checks"] += 1
                if not path.is_file() or not 1 <= line <= len(path.read_text().splitlines()):
                    info["failures"].append({"source": relative(source), "target": target, "reason": "line out of bounds"})
            if fragment:
                if re.fullmatch(r"L\d+(?:-L\d+)?", fragment):
                    info["line_checks"] += 1
                    numbers = list(map(int, re.findall(r"\d+", fragment)))
                    valid = min(numbers) >= 1 and max(numbers) <= len(path.read_text().splitlines())
                else:
                    info["heading_checks"] += 1
                    valid = unquote(fragment) in anchors(path.read_text())
                if not valid:
                    info["failures"].append({"source": relative(source), "target": target, "reason": "invalid anchor"})
    record("Current local Markdown links and anchors resolve", not info["failures"], info)
    return info


def run():
    preserved = preserved_evidence()
    documents = {key: path.read_text() if path.is_file() else "" for key, path in CURRENT.items()}
    before = (EVIDENCE / "review-before-ratification.txt").read_text()
    now = documents["review"]
    old_decision = section(before, "Corrected decision to record")
    new_decision = section(now, "Corrected decision to record")
    record("Corrected D43 decision preserved modulo whitespace", bool(old_decision) and compact(old_decision) == compact(new_decision))
    for key, prior_name, expected_count in [("review", "review-before-ratification.txt", 15), ("d42", "d42-before-ratification.txt", 24), ("completeness", "completeness-before-ratification.txt", 20)]:
        old = headings_as_blocks((EVIDENCE / prior_name).read_text(), r"^### (C\d{2})\b[^\n]*")
        new = headings_as_blocks(documents[key], r"^### (C\d{2})\b[^\n]*")
        expected = [f"C{i:02}" for i in range(1, expected_count + 1)]
        changes = [name for name in expected if name not in old or old.get(name) != new.get(name)]
        record(f"{key} C01-C{expected_count:02} preserved modulo whitespace", not changes and sorted(new) == expected, changes)
    old_proof, new_proof = proof_rows(before), proof_rows(now)
    record("All 30 D43 proof rows preserved", len(new_proof) == 30 and old_proof == new_proof)
    old_categories, new_categories = category_rows(before), category_rows(now)
    record("All 22 unique explicit category verdicts preserved", len(new_categories) == len(set(x[0] for x in new_categories)) == 22 and old_categories == new_categories)
    expected_context = json.loads(MANIFEST.read_text())["context_sha256_unchanged_expected"]
    record("CONTEXT remains byte-identical to ratification baseline", digest(CURRENT["context"]) == expected_context, {"expected": expected_context, "actual": digest(CURRENT["context"])})

    status_details = {}
    for key in ("review", "q43", "session", "coverage", "completeness", "d42", "q44", "scope"):
        lines = documents[key].splitlines()
        status_details[key] = [compact(line) for line in lines if re.search(r"Q43|D43|Q44|ratified|unanswered", line, re.I)]
    header = compact(now[:1800])
    record("D43 explicitly ratified in current review status", bool(re.search(r"(?:Q43|D43).{0,350}(?:explicitly ratified|ratified explicitly)", header, re.I)) and "not separately ratified" not in header, status_details["review"][:10])
    q43_header = compact(documents["q43"][:1800])
    record("Q43 records ratified A", bool(re.search(r"(?:Q43|D43).{0,350}ratified", q43_header, re.I)) and bool(re.search(r"(?:answered|selected|decision|answer).{0,100}\bA\b", q43_header, re.I)), status_details["q43"][:10])
    session_d43 = [line for line in documents["session"].splitlines() if re.match(r"^\|\s*D43\b", line)]
    record("Session D43 decision register says ratified", len(session_d43) == 1 and "ratified" in session_d43[0].lower() and "not ratified" not in session_d43[0].lower(), session_d43)
    q44_header = compact(documents["q44"][:2000])
    record("Q44 prepared and unanswered", "Q44" in q44_header and "unanswered" in q44_header.lower(), status_details["q44"][:10])
    for key in ("review", "q43", "session", "coverage", "completeness", "d42"):
        record(f"{key} points to current unanswered Q44 frontier", "phase28-q44-newsletter-confirmation-period-research.md" in documents[key], [line for line in status_details[key] if "Q44" in line])
    record("Scope audit recommends Q44 without inventing its answer", "Q44" in documents["scope"] and "Recommended single next question" in documents["scope"] and "invent an answer" in documents["scope"], [line for line in status_details["scope"] if "Q44" in line])
    record("Ratification distinguishes planning from implementation", bool(re.search(r"not.{0,100}(?:implementation|implemented)", compact(documents["scope"]), re.I)))
    record("Q44 does not silently adopt a finite policy", bool(re.search(r"(?:unanswered|not selected|not adopted|not ratified)", q44_header, re.I)))

    links = verify_links(list(CURRENT.values()))
    hashes = {relative(path): digest(path) for path in [*CURRENT.values(), MANIFEST, Path(__file__).resolve()] if path.is_file()}
    errors = [item["name"] for item in CHECKS if not item["pass"]]
    result = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "New D43 ratification documentary verifier; prior files are opaque bytes or JSON data only.",
        "all_checks_pass": not errors, "check_count": len(CHECKS), "checks": CHECKS, "errors": errors,
        "preservation": preserved, "links": links,
        "counts": {"d43_clauses": len(headings_as_blocks(now, r"^### (C\d{2})\b[^\n]*")), "d43_proof_rows": len(new_proof), "category_rows": len(new_categories), "category_yes": sum(x[1].startswith("**Yes") for x in new_categories), "category_no": sum(x[1].startswith("**No") for x in new_categories)},
        "current_file_sha256": hashes,
        "limits": [
            "No older program/model/source checker was read as code, imported or executed; explicit SHA-256 manifest JSON was parsed as data.",
            "Historical artifact-pins.json files are byte evidence only; their mutable-document pins are not asserted against today's documents.",
            "Normative prose/table comparison normalizes whitespace; CONTEXT preservation compares exact bytes by its prior manifest digest.",
            "All Markdown local destinations and reference definitions in ten selected current documents are checked, including angle-wrapped parentheses paths. External web targets are not fetched.",
            "This checker writes its own report before successful completion; links to that generated output do not require a preexisting older report.",
            "Status checks distinguish the current frontier from retained historical passages; they do not ratify a Q44 option or publish formal artifacts.",
            "No application behavior, live Auth/RLS/database, SQL concurrency, browser, provider, migration, performance or usability test ran. No GitHub or formal specification was changed.",
        ],
    }
    REPORT.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"all_checks_pass": not errors, "checks": len(CHECKS), "errors": errors, "preservation": preserved, "links": links, "counts": result["counts"], "current_hashes": len(hashes)}, indent=2))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    run()
