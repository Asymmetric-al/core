#!/usr/bin/env python3
"""Fresh D43 documentary checks; reads prior programs only as hashed bytes.

This program never imports or runs application code, models, prior checkers,
database commands, browsers, or external network tools. All JSON is data.
Only this directory's verification.json is written.
"""

from __future__ import annotations

import difflib
import hashlib
import html
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / "phase28-d43-pending-newsletter-confirmation-adversarial-review.md"
Q43 = GRILL / "phase28-q43-pending-newsletter-confirmation-research.md"
SESSION = GRILL / "phase28-session.md"
COVERAGE = GRILL / "phase28-post-d41-coverage-synthesis.md"
COMPLETENESS = GRILL / "phase28-completeness-adversarial-review.md"
D42 = GRILL / "phase28-d42-verified-email-newsletter-signup-adversarial-review.md"
CONTEXT = ROOT / "CONTEXT.md"
CONTEXT_ADDITION = (
    b"Hiding it stops new requests through that entry. An already accepted request\n"
    b"may still be confirmed before its original deadline while current newsletter\n"
    b"and recipient rules permit it; hiding or showing the entry does not renew that\n"
    b"request.\n"
)
CATEGORIES = [
    "Problem validity, necessity, and alternatives", "Brittleness", "Technical debt",
    "Edge cases", "Footguns", "Tenant safety", "Database, RLS, and authorization safety",
    "Overengineering", "UX/UI and user friction", "Source of truth, ownership, and domain invariants",
    "Hidden coupling", "Failure modes", "Lifecycle, temporal correctness, concurrency, and idempotency",
    "Data integrity risks", "Security and privacy risks", "Scalability and performance risks",
    "Operational burden", "Observability and auditability gaps", "Dependency and integration risks",
    "Migration, rollout, and upgrade risks", "Testability, traceability, and proof", "Other development hazards",
]
ERRORS: list[str] = []
CHECKS: list[dict] = []


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def check(name: str, condition: bool, detail=None) -> None:
    CHECKS.append({"name": name, "pass": bool(condition), "detail": detail})
    if not condition:
        ERRORS.append(name)


def normalize(value: str) -> str:
    return " ".join(value.split())


def json_entries(value):
    """Understand explicit path/digest records and path->digest maps as data."""
    if isinstance(value, dict):
        if isinstance(value.get("path"), str) and re.fullmatch(r"[0-9a-f]{64}", str(value.get("sha256", ""))):
            yield value["path"], value["sha256"]
        for key, child in value.items():
            if re.fullmatch(r"[0-9a-f]{64}", str(child)) and ("/" in key or key.endswith((".md", ".json", ".py", ".txt", ".sql"))):
                yield key, child
            elif isinstance(child, (dict, list)):
                yield from json_entries(child)
    elif isinstance(value, list):
        for child in value:
            yield from json_entries(child)


def resolve_manifest_path(manifest: Path, value: str) -> Path | None:
    # Historical packs use repository-relative, manifest-relative, or grill-relative paths.
    for candidate in (ROOT / value, manifest.parent / value, GRILL / value):
        if candidate.is_file():
            return candidate.resolve()
    return None


def preserve_manifests() -> dict:
    start = HERE / "prior-evidence-sha256.json"
    queue = [start]
    seen = set()
    frozen = set()
    mismatches = []
    comparisons = 0
    direct = 0
    opaque_pins = set()
    while queue:
        manifest = queue.pop()
        if manifest in seen:
            continue
        seen.add(manifest)
        entries = list(json_entries(json.loads(manifest.read_text())))
        if manifest == start:
            direct = len(entries)
        for name, expected in entries:
            comparisons += 1
            path = resolve_manifest_path(manifest, name)
            if path is None:
                mismatches.append({"manifest": rel(manifest), "path": name, "reason": "missing"})
                continue
            frozen.add(path)
            actual = sha(path)
            if actual != expected:
                mismatches.append({"manifest": rel(manifest), "path": rel(path), "expected": expected, "actual": actual})
            if path.name.endswith("sha256.json"):
                queue.append(path)
            elif path.name == "artifact-pins.json":
                # Its historic mutable-document pins are not current assertions.
                opaque_pins.add(path)
    result = {"explicit_manifests": len(seen), "direct_entries": direct,
              "distinct_frozen_files": len(frozen), "hash_comparisons": comparisons,
              "opaque_historical_artifact_pins": len(opaque_pins), "mismatches": mismatches}
    check("Recursive explicit SHA-256 manifests preserve frozen bytes", not mismatches, result)
    return result


def clause_blocks(text: str) -> dict[str, str]:
    heads = list(re.finditer(r"^### (C\d{2})\b[^\n]*", text, re.M))
    result = {}
    for head in heads:
        stop = re.search(r"^#{1,3} ", text[head.end():], re.M)
        end = head.end() + stop.start() if stop else len(text)
        result[head.group(1)] = normalize(text[head.start():end])
    return result


def section(text: str, heading: str) -> str:
    match = re.search(r"^## " + re.escape(heading) + r"\s*$", text, re.M)
    if not match:
        return ""
    next_head = re.search(r"^## ", text[match.end():], re.M)
    return text[match.end():match.end() + next_head.start()] if next_head else text[match.end():]


def strip_code(text: str) -> str:
    return re.sub(r"(?ms)^(```|~~~).*?^\1[^\n]*(?:\n|$)", "\n", text)


def markdown_targets(text: str):
    """Read inline destinations with balanced parentheses and angle brackets.

    Reference definitions are checked once, covering all uses of those targets.
    External URL reachability and rendered HTML are deliberately out of scope.
    """
    text = strip_code(text)
    for match in re.finditer(r"!?\[[^\]\n]*(?:\][^\[\]\n]*)?\]\(", text):
        cursor = match.end()
        while cursor < len(text) and text[cursor].isspace():
            cursor += 1
        if cursor < len(text) and text[cursor] == "<":
            end = text.find(">", cursor + 1)
            if end != -1:
                yield text[cursor + 1:end]
            continue
        start = cursor
        depth = 0
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
    for match in re.finditer(r"(?m)^\s{0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))", text):
        yield match.group(1) or match.group(2)


def heading_anchors(text: str) -> set[str]:
    anchors = set()
    duplicate_counts = {}
    for match in re.finditer(r"(?m)^#{1,6}\s+(.+?)\s*#*\s*$", strip_code(text)):
        value = html.unescape(match.group(1))
        value = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", value)
        value = re.sub(r"<[^>]*>", "", value).lower()
        slug = re.sub(r"[^\w\- ]", "", value).replace(" ", "-")
        index = duplicate_counts.get(slug, 0)
        duplicate_counts[slug] = index + 1
        anchors.add(slug if index == 0 else f"{slug}-{index}")
    anchors.update(re.findall(r"(?i)\b(?:id|name)=[\"']([^\"']+)[\"']", text))
    return anchors


def links(docs: list[Path]) -> dict:
    counts = {"documents": len(docs), "local_targets": 0, "line_bounds": 0, "heading_anchors": 0, "external_targets_not_fetched": 0}
    failures = []
    for source in docs:
        if not source.is_file():
            failures.append({"source": rel(source), "reason": "missing document"})
            continue
        for target in markdown_targets(source.read_text()):
            if urlsplit(target).scheme or target.startswith("//"):
                counts["external_targets_not_fetched"] += 1
                continue
            pathpart, _, anchor = target.partition("#")
            pathpart = unquote(re.sub(r"\\([() ])", r"\1", pathpart))
            line = None
            number = re.search(r":(\d+)$", pathpart)
            if number:
                line = int(number.group(1))
                pathpart = pathpart[:number.start()]
            destination = (source.parent / pathpart).resolve() if pathpart else source
            counts["local_targets"] += 1
            if not destination.exists():
                failures.append({"source": rel(source), "target": target, "reason": "missing target"})
                continue
            if line is not None:
                counts["line_bounds"] += 1
                if not destination.is_file() or not 1 <= line <= len(destination.read_text().splitlines()):
                    failures.append({"source": rel(source), "target": target, "reason": "line out of bounds"})
            if anchor:
                if re.fullmatch(r"L\d+(?:-L\d+)?", anchor):
                    counts["line_bounds"] += 1
                    if max(map(int, re.findall(r"\d+", anchor))) > len(destination.read_text().splitlines()):
                        failures.append({"source": rel(source), "target": target, "reason": "line anchor out of bounds"})
                else:
                    counts["heading_anchors"] += 1
                    if unquote(anchor) not in heading_anchors(destination.read_text()):
                        failures.append({"source": rel(source), "target": target, "reason": "missing heading anchor"})
    counts["failures"] = failures
    check("All current local Markdown links, line bounds, and heading anchors", not failures, counts)
    return counts


def main() -> None:
    preservation = preserve_manifests()
    text = MAIN.read_text()
    normalized = normalize(text)
    clauses = re.findall(r"^### (C\d{2})\b", text, re.M)
    proofs = re.findall(r"^\|\s*(P\d{2})\s*\|", text, re.M)
    findings = re.findall(r"^\|\s*(F\d{2})\s*\|", text, re.M)
    check("Exactly C01-C15", clauses == [f"C{i:02}" for i in range(1, 16)], clauses)
    check("Exactly P01-P30", proofs == [f"P{i:02}" for i in range(1, 31)], proofs)
    check("Exactly F01-F10", findings == [f"F{i:02}" for i in range(1, 11)], findings)
    category_rows = []
    for row in section(text, "Every requested category").splitlines():
        cells = [x.strip() for x in row.split("|")[1:-1]]
        if len(cells) == 2 and cells[0] in CATEGORIES:
            category_rows.append(cells)
    check("All 22 unique requested categories", [x[0] for x in category_rows] == CATEGORIES, [x[0] for x in category_rows])
    explicit = [re.match(r"\*\*(Yes|No)\b", x[1]) for x in category_rows]
    check("Every category explicitly says Yes or No", len(explicit) == 22 and all(explicit))
    category_counts = {answer: sum(bool(m and m.group(1) == answer) for m in explicit) for answer in ("Yes", "No")}
    check("Selected A without detailed ratification", "Q43 answered A" in normalized and "detailed amendments are not separately ratified" in normalized)
    check("No numeric 72/24-hour policy adopted", bool(re.search(r"72-hour.{0,90}24-hour.{0,90}not adopted", normalized)))
    check("Documentation not implementation/formal publication", "not a formal specification or implementation" in normalized)

    for current, snapshot, count in [(D42, HERE / "d42-before-d43.txt", 24), (COMPLETENESS, HERE / "completeness-before-d43.txt", 20)]:
        old = clause_blocks(snapshot.read_text())
        new = clause_blocks(current.read_text())
        changed = [f"C{i:02}" for i in range(1, count + 1) if old.get(f"C{i:02}") != new.get(f"C{i:02}") or f"C{i:02}" not in old]
        check(f"{current.stem} C01-C{count:02} unchanged modulo whitespace", not changed, changed)

    baseline = (HERE / "context-before-d43.txt").read_bytes()
    current_context = CONTEXT.read_bytes()
    ops = difflib.SequenceMatcher(None, baseline.splitlines(keepends=True), current_context.splitlines(keepends=True), autojunk=False).get_opcodes()
    changes = [op for op in ops if op[0] != "equal"]
    inserted = b"".join(line for op in changes for line in current_context.splitlines(keepends=True)[op[3]:op[4]])
    check("CONTEXT retains all original bytes with the exact signup-entry paragraph insertion", len(changes) == 1 and changes[0][0] == "insert" and inserted == CONTEXT_ADDITION and current_context.replace(CONTEXT_ADDITION, b"", 1) == baseline, {"changes": changes, "inserted_text": inserted.decode()})

    # Inspect current frontier/status statements, not dated historical Q43 questions.
    status_observations = {}
    for path in (Q43, SESSION, COVERAGE, COMPLETENESS, D42):
        value = path.read_text()
        rows = [normalize(line) for line in value.splitlines() if re.search(r"Q43|D43", line)]
        status_observations[rel(path)] = rows
    check("Q43 current question records selected A", bool(re.search(r"(?:answered|selected|chose|chosen|answer)[^\n]{0,90}\bA\b", Q43.read_text(), re.I)), status_observations[rel(Q43)])
    check("Session contains current D43 answered-Q43 review row", bool(re.search(r"\|\s*D43[^\n]*\|[^\n]*(?:A selected|answered A|A —|A;)", SESSION.read_text(), re.I)), status_observations[rel(SESSION)])
    for path in (COVERAGE, COMPLETENESS, D42):
        check(f"{path.stem} has current D43 continuation reference", "phase28-d43-pending-newsletter-confirmation-adversarial-review.md" in path.read_text(), status_observations[rel(path)])

    model_results = json.loads((HERE / "results.json").read_text())
    recorded = model_results.get("checks", [])
    check("Recorded new model source hash matches bytes; model not executed", model_results.get("source_sha256") == sha(HERE / "behavior-model.py"))
    check("Recorded model results are 44 passing checks and six naive counterexamples", model_results.get("check_count") == len(recorded) == 44 and model_results.get("expected_naive_counterexamples") == 6 and model_results.get("all_checks_pass") is True and all(x.get("pass") is True for x in recorded))

    notes = [HERE / name for name in ("source-authorization.md", "owner-reconciliation.md", "ux-research.md", "independent-review.md", "behavior-model.md")]
    docs = [MAIN, Q43, SESSION, COVERAGE, COMPLETENESS, D42, CONTEXT, *notes]
    link_report = links(docs)
    current_artifacts = [*docs, HERE / "prior-evidence-sha256.json", HERE / "results.json", HERE / "behavior-model.py", Path(__file__).resolve()]
    hashes = {rel(path): sha(path) for path in current_artifacts if path.is_file()}
    tracked_changes = subprocess.run(["git", "diff", "--name-only", "HEAD"], cwd=ROOT, check=True, capture_output=True, text=True).stdout.splitlines()
    check("Tracked changes contain no app/schema/formal spec changes", all(x == "CONTEXT.md" or x.startswith("docs/features/missionary-workspace-depth/") for x in tracked_changes), tracked_changes)
    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "Fresh D43 documentary verification only; no prior program/model executed or imported.",
        "all_checks_pass": not ERRORS, "check_count": len(CHECKS), "checks": CHECKS,
        "errors": ERRORS, "preservation": preservation, "links": link_report,
        "counts": {"clauses": len(clauses), "proof_rows": len(proofs), "findings": len(findings), "categories": len(category_rows), "category_verdicts": category_counts, "recorded_model_checks": len(recorded)},
        "current_file_sha256": hashes,
        "limits": [
            "Reads prior *sha256.json manifests as data only; artifact-pins.json is preserved as opaque bytes, not a current mutable-document assertion.",
            "Compares normative clauses modulo whitespace; CONTEXT preservation is byte-sensitive outside its recorded insertion.",
            "All local Markdown destinations in the selected current documents are checked; external URLs are not fetched and rendered UI is not tested.",
            "Recorded model JSON and source hash are checked without executing the model; finite model results do not prove database/authorization/concurrency behavior.",
            "No live configuration, database/RLS, Auth, token, browser, provider, migration, performance, or user test was performed.",
            "Tracked-diff scope is reported against HEAD; existing untracked research cannot be attributed to this checker. This checker only writes verification.json.",
        ],
    }
    (HERE / "verification.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"all_checks_pass": not ERRORS, "checks": len(CHECKS), "errors": ERRORS, "preservation": preservation, "links": link_report, "counts": report["counts"], "current_hashes": len(hashes)}, indent=2))
    raise SystemExit(0 if not ERRORS else 1)


if __name__ == "__main__":
    main()
