#!/usr/bin/env python3
"""Fresh, standard-library-only D44 documentary verifier.

Prior manifests are JSON data; prior programs are opaque hashed bytes.
No prior program/model is read as source, imported, or executed.
Only this directory's verification.json is written.
"""

import hashlib
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit


DIRECTORY = Path(__file__).resolve().parent
GRILL = DIRECTORY.parent
ROOT = DIRECTORY.parents[4]
MANIFEST = DIRECTORY / "prior-evidence-sha256.json"
OUTPUT = DIRECTORY / "verification.json"
NAMES = {
    "d44": "phase28-d44-standard-confirmation-period-decision.md",
    "q44": "phase28-q44-newsletter-confirmation-period-research.md",
    "q45": "phase28-q45-newsletter-confirmation-duration-research.md",
    "session": "phase28-session.md",
    "coverage": "phase28-post-d41-coverage-synthesis.md",
    "completeness": "phase28-completeness-adversarial-review.md",
    "d43": "phase28-d43-pending-newsletter-confirmation-adversarial-review.md",
    "d42": "phase28-d42-verified-email-newsletter-signup-adversarial-review.md",
}
PATHS = {key: GRILL / value for key, value in NAMES.items()}
CHECKS = []


def relative(path):
    return str(path.relative_to(ROOT))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check(name, passed, details=None):
    CHECKS.append({"name": name, "pass": bool(passed), "details": details})


def plain(text):
    return " ".join(text.split())


def records(data):
    if isinstance(data, dict):
        if isinstance(data.get("path"), str) and re.fullmatch("[0-9a-f]{64}", str(data.get("sha256", ""))):
            yield data["path"], data["sha256"]
        for key, value in data.items():
            if ("/" in key or key.endswith((".md", ".json", ".txt", ".sql", ".py"))) and re.fullmatch("[0-9a-f]{64}", str(value)):
                yield key, value
            elif isinstance(value, (dict, list)):
                yield from records(value)
    elif isinstance(data, list):
        for value in data:
            yield from records(value)


def preservation():
    queue, manifests, files, pins = [MANIFEST], set(), set(), set()
    comparisons, direct = 0, 0
    failures = []
    while queue:
        manifest = queue.pop()
        if manifest in manifests:
            continue
        manifests.add(manifest)
        entries = list(records(json.loads(manifest.read_text())))
        if manifest == MANIFEST:
            direct = len(entries)
        for name, expected in entries:
            comparisons += 1
            path = next((p.resolve() for p in (ROOT / name, manifest.parent / name, GRILL / name) if p.is_file()), None)
            if path is None:
                failures.append({"manifest": relative(manifest), "path": name, "reason": "missing"})
                continue
            files.add(path)
            if sha(path) != expected:
                failures.append({"manifest": relative(manifest), "path": relative(path), "expected": expected, "actual": sha(path)})
            if path.name.endswith("sha256.json"):
                queue.append(path)
            elif path.name == "artifact-pins.json":
                pins.add(path)
    summary = {"direct_entries": direct, "explicit_manifests": len(manifests), "distinct_files": len(files), "hash_comparisons": comparisons, "opaque_artifact_pin_files": len(pins), "failures": failures}
    check("33 direct frozen entries", direct == 33, direct)
    check("All explicit recursive manifest hashes preserved", not failures, summary)
    return summary


def clauses(text):
    result = {}
    for match in re.finditer(r"^### (C\d{2})\b[^\n]*", text, re.M):
        ending = re.search(r"^#{1,3} ", text[match.end():], re.M)
        stop = match.end() + ending.start() if ending else len(text)
        result[match.group(1)] = plain(text[match.start():stop])
    return result


def remove_fences(text):
    return re.sub(r"(?ms)^(```|~~~).*?^\1[^\n]*(?:\n|$)", "\n", text)


def destinations(text):
    text = remove_fences(text)
    for found in re.finditer(r"\]\(", text):
        cursor = found.end()
        while cursor < len(text) and text[cursor].isspace():
            cursor += 1
        if cursor < len(text) and text[cursor] == "<":
            close = text.find(">", cursor + 1)
            if close >= 0:
                yield text[cursor + 1:close]
            continue
        start, depth = cursor, 0
        while cursor < len(text):
            char = text[cursor]
            if char == "\\":
                cursor += 2
                continue
            if char == "(":
                depth += 1
            elif char == ")":
                if depth == 0:
                    break
                depth -= 1
            elif char.isspace() and depth == 0:
                break
            cursor += 1
        yield text[start:cursor]
    for found in re.finditer(r"(?m)^\s{0,3}\[[^]]+\]:\s*(?:<([^>]+)>|(\S+))", text):
        yield found.group(1) or found.group(2)


def anchor_set(text):
    result, seen = set(), {}
    for found in re.finditer(r"(?m)^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$", remove_fences(text)):
        title = html.unescape(found.group(1))
        title = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", title)
        title = re.sub(r"<[^>]*>", "", title)
        slug = re.sub(r"[^\w\- ]", "", title.lower()).replace(" ", "-")
        number = seen.get(slug, 0)
        seen[slug] = number + 1
        result.add(slug if number == 0 else f"{slug}-{number}")
    result.update(re.findall(r"(?i)\b(?:name|id)=[\"']([^\"']+)[\"']", text))
    return result


def link_check(documents):
    summary = {"documents": len(documents), "local_links": 0, "line_bounds": 0, "heading_anchors": 0, "external_links_not_fetched": 0, "generated_report_links": 0, "failures": []}
    for document in documents:
        if not document.is_file():
            summary["failures"].append({"document": relative(document), "reason": "missing document"})
            continue
        for target in destinations(document.read_text()):
            if urlsplit(target).scheme or target.startswith("//"):
                summary["external_links_not_fetched"] += 1
                continue
            filename, _, fragment = target.partition("#")
            filename = unquote(re.sub(r"\\([() ])", r"\1", filename))
            match = re.search(r":(\d+)$", filename)
            line = int(match.group(1)) if match else None
            if match:
                filename = filename[:match.start()]
            path = (document.parent / filename).resolve() if filename else document
            summary["local_links"] += 1
            if path == OUTPUT and line is None and not fragment:
                summary["generated_report_links"] += 1
                continue
            if not path.exists():
                summary["failures"].append({"document": relative(document), "target": target, "reason": "missing target"})
                continue
            if line is not None:
                summary["line_bounds"] += 1
                if not path.is_file() or not 1 <= line <= len(path.read_text().splitlines()):
                    summary["failures"].append({"document": relative(document), "target": target, "reason": "line out of bounds"})
            if fragment:
                if re.fullmatch(r"L\d+(?:-L\d+)?", fragment):
                    summary["line_bounds"] += 1
                    values = list(map(int, re.findall(r"\d+", fragment)))
                    valid = min(values) >= 1 and max(values) <= len(path.read_text().splitlines())
                else:
                    summary["heading_anchors"] += 1
                    valid = unquote(fragment) in anchor_set(path.read_text())
                if not valid:
                    summary["failures"].append({"document": relative(document), "target": target, "reason": "invalid anchor"})
    check("All current local Markdown links, lines and anchors", not summary["failures"], summary)
    return summary


def main():
    frozen = preservation()
    texts = {key: path.read_text() if path.is_file() else "" for key, path in PATHS.items()}
    counts = {}
    for key, expected in (("d42", 24), ("d43", 15), ("completeness", 20)):
        before = clauses((DIRECTORY / f"{key}-before-d44.txt").read_text())
        current = clauses(texts[key])
        names = [f"C{i:02}" for i in range(1, expected + 1)]
        differences = [name for name in names if name not in before or before.get(name) != current.get(name)]
        check(f"{key} normative C01-C{expected:02} unchanged modulo whitespace", not differences and sorted(current) == names, differences)
        counts[key] = len(current)
    context = ROOT / "CONTEXT.md"
    expected_context = json.loads(MANIFEST.read_text())["context_sha256"]
    check("CONTEXT byte-identical", sha(context) == expected_context, {"expected": expected_context, "actual": sha(context)})
    d44 = plain(texts["d44"])
    check("Q44 A recorded as selected standard-period decision", "Q44 answered A" in d44 and "decision accepted as selected" in d44 and "One standard Asym period" in d44)
    check("D44 has no duration settings or numerical adoption", "no tenant, Page, missionary or reader duration setting" in d44 and "Neither seven days nor D6's older 72-hour proposal is adopted" in d44)
    check("D44 distinguishes documentation from implementation", "numeric duration, formal specification, application behavior or live setting" in d44 and "future acceptance obligations, not runtime tests" in d44)
    q44 = plain(texts["q44"][:1800])
    check("Q44 question status records answered A", bool(re.search(r"Q44.{0,120}answered A", q44, re.I)), q44[:500])
    q45 = plain(texts["q45"])
    check("Q45 remains unanswered without a D45", "Question prepared; unanswered. No D45 recorded." in q45)
    check("Q45 distinguishes two proposed elapsed-time choices", "seven days is 168 hours; three days is 72 hours" in q45 and "No duration, retention schedule or D45 is inferred" in q45)
    for key in ("d44", "q44", "session", "coverage", "completeness", "d43", "d42"):
        check(f"{key} references current Q45 frontier", NAMES["q45"] in texts[key])
    rows = [line for line in texts["session"].splitlines() if re.match(r"^\|\s*D44\b", line)]
    check("Session records one selected D44 decision", len(rows) == 1 and bool(re.search(r"A selected|answered A|A —|A;", rows[0], re.I)), rows)
    notes = sorted(DIRECTORY.glob("*.md"))
    documents = [*PATHS.values(), context, *notes]
    links = link_check(documents)
    hashes = {relative(path): sha(path) for path in [*documents, MANIFEST, Path(__file__).resolve()] if path.is_file()}
    errors = [item["name"] for item in CHECKS if not item["pass"]]
    result = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "D44 standard-period ownership decision and unanswered Q45; documentary verification only.",
        "all_checks_pass": not errors, "check_count": len(CHECKS), "checks": CHECKS,
        "errors": errors, "preservation": frozen, "normative_clause_counts": counts,
        "links": links, "current_file_sha256": hashes,
        "limits": [
            "No previous checker, model, application, browser, provider or database program was executed/imported; prior program bytes were hashed only.",
            "Only explicitly referenced *sha256.json manifests are recursively parsed as JSON data; artifact-pins.json historical mutable pins are not current assertions.",
            "Normative C blocks are compared modulo whitespace; CONTEXT and frozen evidence use exact-byte SHA-256 checks.",
            "Local Markdown links, reference definitions, balanced-parentheses/angle-wrapped paths, line bounds and heading anchors are checked across the listed current documents. External links are not fetched.",
            "No 22-category review requirement or numeric duration adoption is invented for this concise control decision. Q45 options remain proposals.",
            "The generated report is created before successful exit; self-links need no preexisting report. The report's own mutable bytes are not self-hashed.",
            "No application/schema/formal/GitHub/live configuration changed, and no Auth/RLS, SQL concurrency, provider, accessibility or measured usability result is claimed.",
        ],
    }
    OUTPUT.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"all_checks_pass": not errors, "checks": len(CHECKS), "errors": errors, "preservation": frozen, "links": links, "normative_clause_counts": counts, "current_hashes": len(hashes)}, indent=2))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
