#!/usr/bin/env python3
"""D42 documentary checks only. Never executes/imports an earlier program."""
from __future__ import annotations

import difflib
import hashlib
import html
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
REPORT = HERE / "verification.json"
MAIN = GRILL / "phase28-d42-verified-email-newsletter-signup-adversarial-review.md"
Q42 = GRILL / "phase28-q42-newsletter-confirmation-research.md"
SESSION = GRILL / "phase28-session.md"
COVERAGE = GRILL / "phase28-post-d41-coverage-synthesis.md"
COMPLETENESS = GRILL / "phase28-completeness-adversarial-review.md"
CONTEXT = ROOT / "CONTEXT.md"
DOCS = [MAIN, Q42, SESSION, COVERAGE, COMPLETENESS, CONTEXT] + [
    HERE / name for name in [
        "auth-proof.md", "database-authorization.md", "owner-reconciliation.md",
        "ux-research.md", "behavior-model.md", "independent-review.md",
    ]
]
errors: list[str] = []
checks: dict[str, object] = {}


def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def norm(value: str) -> str:
    return " ".join(value.split())


# Only explicitly named *sha256.json manifests are recursively interpreted.
# Other historical JSON, including artifact-pins.json, is immutable byte evidence,
# never a license to recheck an old mutable-current-artifact hash or run its code.
HEX = re.compile(r"[0-9a-f]{64}\Z")
manifest_seen: set[Path] = set()
frozen_files: set[Path] = set()
comparisons: list[dict[str, object]] = []


def resolve_manifest_path(raw: str, manifest: Path) -> Path:
    p = Path(raw)
    candidates = [p] if p.is_absolute() else [ROOT / p, manifest.parent / p, GRILL / p]
    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()
    return candidates[0].resolve()


def entries(node: object):
    if isinstance(node, list):
        for value in node:
            yield from entries(value)
    elif isinstance(node, dict):
        digest = node.get("sha256")
        target = node.get("snapshot") or node.get("path")
        if isinstance(digest, str) and HEX.fullmatch(digest) and isinstance(target, str):
            yield target, digest
        for key, value in node.items():
            if isinstance(value, str) and HEX.fullmatch(value):
                if "/" in key or re.search(r"\.(?:md|txt|json|py|sql)$", key):
                    yield key, value
                elif key.endswith("_before_answer_sha256"):
                    yield key.removesuffix("_sha256").replace("_", "-") + ".txt", value
            elif isinstance(value, (dict, list)):
                yield from entries(value)


def visit(manifest: Path) -> None:
    manifest = manifest.resolve()
    if manifest in manifest_seen:
        return
    manifest_seen.add(manifest)
    require(manifest.name.endswith("sha256.json"), f"Not an explicit SHA manifest: {rel(manifest)}")
    try:
        parsed = json.loads(manifest.read_text())
    except (OSError, ValueError) as exc:
        errors.append(f"Unreadable manifest {rel(manifest)}: {exc}")
        return
    found = list(entries(parsed))
    require(bool(found), f"No immutable entries found in {rel(manifest)}")
    for raw, expected in found:
        target = resolve_manifest_path(raw, manifest)
        exists = target.is_file()
        actual = sha(target) if exists else None
        ok = exists and actual == expected
        comparisons.append({"manifest": rel(manifest), "path": rel(target), "matches": ok})
        require(ok, f"Frozen evidence mismatch/missing: {rel(target)} from {rel(manifest)}")
        if exists:
            frozen_files.add(target)
            if target.name.endswith("sha256.json"):
                visit(target)


visit(HERE / "prior-evidence-sha256.json")
checks["frozen_evidence"] = {
    "manifest_count": len(manifest_seen), "unique_file_count": len(frozen_files),
    "hash_comparisons": len(comparisons),
    "all_match": all(row["matches"] for row in comparisons),
    "manifests": sorted(rel(p) for p in manifest_seen),
    "old_artifact_pins_are_bytes_only": True,
}

for p in DOCS:
    require(p.is_file(), f"Missing document: {rel(p)}")
texts = {p: p.read_text() if p.is_file() else "" for p in DOCS}
main = texts[MAIN]

for prefix, expected, pattern in [
    ("C", 24, r"^### (C\d{2})\s+—"),
    ("F", 12, r"^### (F\d{2})\s+—"),
    ("P", 40, r"^\| (P\d{2}) \|"),
]:
    actual = re.findall(pattern, main, re.M)
    wanted = [f"{prefix}{i:02}" for i in range(1, expected + 1)]
    require(actual == wanted, f"{prefix} numbered structure differs: {actual}")
    checks[f"{prefix}_definitions"] = {"count": len(actual), "expected": expected, "unique": len(set(actual))}

category_rows = re.findall(r"^\|\s+(\d+)\s+\|\s+([^|]+)\|\s+([^\n]+)\|$", main, re.M)
require([int(r[0]) for r in category_rows] == list(range(1, 23)), "Category rows must be exactly 1–22")
require(len({norm(r[1]) for r in category_rows}) == 22, "Category names are not unique")
require(all(re.match(r"\*\*(?:Yes\b|No\b)", r[2].strip()) for r in category_rows), "Each category needs an explicit Yes/No material-concern finding")
checks["categories"] = {"count": len(category_rows), "yes": sum(r[2].strip().startswith("**Yes") for r in category_rows), "no": sum(r[2].strip().startswith("**No") for r in category_rows), "names": [norm(r[1]) for r in category_rows]}

require("Q42 B is selected" in norm(main[:1000]), "Main must record selected Q42 B")
require("not separately ratified" in norm(main[:1000]), "Main must not claim detailed review ratification")
require("Accept with required amendments" in norm(main[:1000]), "Main must record its disposition")
require("not blanket D6 adoption" in norm(main), "Exact D6 non-adoption boundary missing")
require("still separate, unadopted" in norm(main), "Remaining D6 policy boundary missing")
require("Verified-address newsletter signup" in texts[CONTEXT], "Selected glossary term missing")
require("B" in texts[Q42][:2500] and re.search(r"select|answer", texts[Q42][:2500], re.I) is not None, "Q42 current answer missing")
require("unanswered" not in texts[Q42][:600].lower(), "Q42 current header still says unanswered")
require(re.search(r"^\|\s*(?:Q42|D42 \(answered Q42\))\s*\|[^\n]*(?:Selected|Answered|selected|answered)[^\n]*", texts[SESSION], re.M) is not None, "Session current Q42 row must be answered/selected")
require(re.search(r"^\|\s*(?:Q42|D42 \(answered Q42\))\s*\|[^\n]*(?:unanswered|No D42)", texts[SESSION], re.M) is None, "Session current Q42 row still says unanswered/no D42")
checks["status_scope"] = {"selected_answer": "B", "review_amendments": "not separately ratified", "blanket_D6_adoption": False, "glossary_term": "Verified-address newsletter signup"}

# Model JSON is inspected as data only. The checker never executes even the new model.
model_path = HERE / "behavior-model.py"
model_result_path = HERE / "behavior-model-results.json"
try:
    model_result = json.loads(model_result_path.read_text())
    model_checks = model_result.get("checks", [])
    require(model_result.get("source_sha256") == sha(model_path), "Model result source hash does not match model source bytes")
    require(model_result.get("check_count") == 35 and len(model_checks) == 35, "Expected 35 model cases")
    require(model_result.get("all_checks_pass") is True and all(r.get("pass") is True for r in model_checks), "Recorded model has failed checks")
    require(len({r.get("name") for r in model_checks}) == 35, "Model case names must be unique")
    require(model_result.get("naive_counterexamples") == 3 and model_result.get("two_tab_withdrawal_serial_orders") == 6, "Model case-shape metadata differs")
    require(bool(model_result.get("not_proved")) and bool(model_result.get("assumptions")), "Model limitations/assumptions missing")
    checks["behavior_model_record"] = {"recorded_cases": len(model_checks), "source_hash_matches": model_result.get("source_sha256") == sha(model_path), "recorded_all_pass": model_result.get("all_checks_pass"), "naive_counterexamples": model_result.get("naive_counterexamples"), "not_executed_by_this_verifier": True}
except (OSError, ValueError) as exc:
    errors.append(f"Model data cannot be checked: {exc}")

# Snapshot preservation: the only glossary change is the new resolved term.
context_before = (HERE / "context-before-d42.txt").read_text()
context_without_new = re.sub(r"(?ms)^\*\*Verified-address newsletter signup\*\*.*?(?=^\*\*[^\n]+\*\*|\Z)", "", texts[CONTEXT], count=1)
require(norm(context_without_new) == norm(context_before), "CONTEXT changed beyond the new verified-address newsletter signup entry")

def clause_blocks(content: str) -> dict[str, str]:
    matches = list(re.finditer(r"^### (C\d{2})\s+—[^\n]*", content, re.M))
    result = {}
    for m in matches:
        after = content[m.end():]
        end = re.search(r"^#{1,3} ", after, re.M)
        result[m.group(1)] = norm(content[m.start():m.end()] + after[:end.start() if end else len(after)])
    return result

before_completeness = (HERE / "completeness-before-d42.txt").read_text()
old_clauses = clause_blocks(before_completeness)
new_clauses = clause_blocks(texts[COMPLETENESS])
require(len(old_clauses) == 20 and new_clauses == old_clauses, "Ratified completeness C01–C20 changed")

# Compare each historical subsection separately: current frontier paragraphs
# legitimately occur between the original Q1 and Q2 narrative sections.
def historical_decisions(content: str) -> dict[str, str]:
    headings = list(re.finditer(r"^#{1,3} [^\n]+", content, re.M))
    out = {}
    for index, heading in enumerate(headings):
        m = re.match(r"### [QD](\d{1,2})\b", heading.group())
        if m and int(m.group(1)) <= 41:
            end = headings[index + 1].start() if index + 1 < len(headings) else len(content)
            out[heading.group()] = norm(content[heading.start():end])
    return out

before_session = (HERE / "session-before-d42.txt").read_text()
old_history = historical_decisions(before_session)
new_history = historical_decisions(texts[SESSION])
require(bool(old_history) and all(new_history.get(k) == v for k, v in old_history.items()), "Historical Q1–D41 session subsections changed")
checks["preserved_normative_text"] = {"glossary_only_new_entry": norm(context_without_new) == norm(context_before), "completeness_C01_C20_unchanged": new_clauses == old_clauses, "session_historical_subsections": len(old_history), "session_historical_subsections_unchanged": all(new_history.get(k) == v for k, v in old_history.items())}

# Record exactly how the evolving root/frontier documents differ. This is a
# documentary change inventory, not an automatic semantic-approval claim.
diffs = {}
for current, snapshot in [(CONTEXT, "context-before-d42.txt"), (Q42, "q42-before-answer.txt"), (SESSION, "session-before-d42.txt"), (COVERAGE, "coverage-before-d42.txt"), (COMPLETENESS, "completeness-before-d42.txt")]:
    old = (HERE / snapshot).read_text().splitlines()
    new = texts[current].splitlines()
    sm = difflib.SequenceMatcher(a=old, b=new, autojunk=False)
    diffs[rel(current)] = [{"kind": tag, "old_line_start": i1 + 1, "old_line_end": i2, "new_line_start": j1 + 1, "new_line_end": j2} for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]
checks["evolving_document_change_inventory"] = diffs

# Markdown links: balanced parentheses and angle-wrapped destinations are read
# without chopping donor route paths such as app/(dashboard)/... .
def without_fences(content: str) -> str:
    out, fence = [], None
    for line in content.splitlines():
        match = re.match(r"^\s*(`{3,}|~{3,})", line)
        if match:
            marker = match.group(1)[0]
            if fence is None:
                fence = marker
            elif marker == fence:
                fence = None
            out.append("")
        else:
            out.append(line if fence is None else "")
    return "\n".join(out)


def destinations(content: str):
    content = without_fences(content)
    for match in re.finditer(r"(?<!!)\[[^\]\n]+\]\(", content):
        start, pos, depth, angle = match.end(), match.end(), 1, False
        while pos < len(content) and depth:
            c = content[pos]
            if c == "<" and pos == start:
                angle = True
            elif c == ">" and angle:
                angle = False
            elif not angle and c == "(" and (pos == 0 or content[pos - 1] != "\\"):
                depth += 1
            elif not angle and c == ")" and (pos == 0 or content[pos - 1] != "\\"):
                depth -= 1
            pos += 1
        if depth:
            errors.append("Unterminated Markdown link destination")
            continue
        raw = content[start:pos - 1].strip()
        if raw.startswith("<"):
            end = raw.find(">")
            yield raw[1:end] if end >= 0 else raw
        else:
            yield re.split(r"\s+[\"']", raw, maxsplit=1)[0]
    # Reference-style definitions, if present.
    for match in re.finditer(r"^\s{0,3}\[[^\]]+\]:\s*(<[^>]+>|\S+)", content, re.M):
        yield match.group(1).strip("<>")


anchor_cache: dict[Path, set[str]] = {}

def anchors(path: Path) -> set[str]:
    if path in anchor_cache:
        return anchor_cache[path]
    content = path.read_text()
    out = set(re.findall(r"<(?:a|span)\b[^>]*\b(?:id|name)=[\"']([^\"']+)", content, re.I))
    counts: dict[str, int] = {}
    for line in without_fences(content).splitlines():
        m = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if not m:
            continue
        title = html.unescape(m.group(1))
        title = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", title)
        title = re.sub(r"<[^>]+>", "", title)
        slug = re.sub(r"[^\w\-\s]", "", title.lower()).strip().replace(" ", "-")
        slug = re.sub(r"\s", "-", slug)
        n = counts.get(slug, 0)
        counts[slug] = n + 1
        out.add(slug + (f"-{n}" if n else ""))
    anchor_cache[path] = out
    return out

link_count = line_count = anchor_count = external_count = 0
link_details = []
for doc, content in texts.items():
    for raw in destinations(content):
        if not raw:
            continue
        if re.match(r"(?:https?|mailto|app|skill|codex|data):|[a-zA-Z][a-zA-Z0-9+.-]*://", raw) or raw.startswith("//"):
            external_count += 1
            continue
        target, sep, fragment = unquote(html.unescape(raw)).partition("#")
        target = target.split("?", 1)[0]
        line_match = re.search(r":(\d+)(?:[-–](\d+))?$", target)
        line_range = None
        if line_match:
            line_range = [int(line_match.group(1)), int(line_match.group(2) or line_match.group(1))]
            target = target[:line_match.start()]
        path = (doc.parent / target).resolve() if target else doc.resolve()
        exists = path.is_file() or path == REPORT.resolve()
        link_count += 1
        require(exists, f"Broken local link in {rel(doc)}: {raw}")
        if not exists:
            continue
        if line_range:
            line_count += 1
            length = len(path.read_text().splitlines())
            require(1 <= line_range[0] <= line_range[1] <= length, f"Line link out of bounds in {rel(doc)}: {raw} ({length} lines)")
        if fragment:
            lm = re.fullmatch(r"L(\d+)(?:-L?(\d+))?", fragment)
            if lm:
                length = len(path.read_text().splitlines())
                line_count += 1
                require(1 <= int(lm.group(1)) <= int(lm.group(2) or lm.group(1)) <= length, f"Fragment line link out of bounds: {raw}")
            else:
                anchor_count += 1
                require(fragment in anchors(path), f"Missing local anchor in {rel(doc)}: {raw}")
        link_details.append({"from": rel(doc), "target": raw})
checks["local_markdown_references"] = {"documents": len(DOCS), "local_links": link_count, "line_references": line_count, "anchors": anchor_count, "external_links_not_revalidated": external_count, "balanced_parentheses_and_angle_paths_supported": True}

current_paths = DOCS + [HERE / "behavior-model.py", HERE / "behavior-model-results.json", HERE / "prior-evidence-sha256.json", Path(__file__).resolve()]
report = {
    "scope": "New D42 documentary verifier only; prior programs are bytes, not executed or imported.",
    "all_checks_pass": not errors,
    "checks": checks,
    "errors": errors,
    "current_sha256": {rel(p): sha(p) for p in current_paths if p.is_file()},
    "limits": [
        "This script validates document structure, explicit statuses, references, model-record provenance and immutable evidence.",
        "It does not execute the model, any old program, application tests, SQL, migrations or a live service.",
        "Recorded model passes are finite abstract cases; they do not establish actual Auth/database serialization, RLS, provider delivery, UI accessibility or usability.",
        "Local line bounds and heading anchors are mechanical checks, not proof that each citation supports its associated claim.",
        "The change inventory records root/frontier edits; semantic adequacy is independently reviewed by humans/agents and not inferred from a hash or regex.",
        "External URLs are not fetched by this documentary checker; primary-source research is recorded separately.",
    ],
}
REPORT.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({"all_checks_pass": not errors, "errors": errors, "frozen_manifests": len(manifest_seen), "frozen_files": len(frozen_files), "hash_comparisons": len(comparisons), "local_links": link_count, "line_references": line_count, "anchors": anchor_count, "report": rel(REPORT)}, indent=2))
sys.exit(0 if not errors else 1)
