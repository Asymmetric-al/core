#!/usr/bin/env python3
"""Fresh documentation-only verifier. Older programs are bytes, never imports."""

from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
GRILL = HERE.parent
ROOT = HERE.parents[4]
MAIN = GRILL / "phase28-completeness-adversarial-review.md"
BEFORE = HERE / "review-before-ratification.txt"
MANIFEST = HERE / "ratification-evidence-sha256.json"
REPORT = HERE / "ratification-verification.json"
Q42 = GRILL / "phase28-q42-newsletter-confirmation-research.md"
ERRORS: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        ERRORS.append(message)


def relative(path: Path) -> str:
    return str(path.relative_to(ROOT))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized(text: str) -> str:
    return " ".join(text.split())


def manifest_entries(value: object) -> list[tuple[str, str]]:
    """Understand historical manifest data shapes without loading any code."""
    result: list[tuple[str, str]] = []
    if isinstance(value, dict):
        checksum = value.get("sha256")
        target = value.get("path") or value.get("snapshot")
        if isinstance(target, str) and isinstance(checksum, str):
            if re.fullmatch(r"[0-9a-f]{64}", checksum):
                result.append((target, checksum))
        for key, item in value.items():
            if isinstance(item, str) and re.fullmatch(r"[0-9a-f]{64}", item):
                if "." in key and key != "sha256":
                    result.append((key, item))
            elif isinstance(item, (dict, list)):
                result.extend(manifest_entries(item))
    elif isinstance(value, list):
        for item in value:
            result.extend(manifest_entries(item))
    return result


def manifest_target(manifest: Path, name: str) -> Path:
    if name.startswith("docs/"):
        return ROOT / name
    if re.match(r"(?:d\d+|completion|post-completion)-evidence/", name):
        return GRILL / name
    return manifest.parent / name


def verify_manifests() -> dict:
    pending = [MANIFEST]
    visited: set[Path] = set()
    files: set[Path] = set()
    checks = []
    comparisons = 0
    passed = 0
    direct = 0
    while pending:
        manifest = pending.pop()
        if manifest in visited:
            continue
        visited.add(manifest)
        data = json.loads(manifest.read_text())
        entries = manifest_entries(data)
        require(bool(entries), f"No recognized entries in {relative(manifest)}")
        if manifest == MANIFEST:
            direct = len(entries)
            require(direct == 15, f"Expected 15 direct frozen entries, found {direct}")
        local_passed = 0
        for name, expected in entries:
            path = manifest_target(manifest, name).resolve()
            comparisons += 1
            files.add(path)
            match = path.is_file() and digest(path) == expected
            require(match, f"Frozen hash mismatch: {relative(manifest)} -> {name}")
            if match:
                passed += 1
                local_passed += 1
            # Preservation manifests bind immutable evidence. artifact-pins.json
            # is itself hashed above, but can describe then-current documents
            # later changed by ratification; its historic source hashes are not
            # an instruction to revert those current documents.
            if path.is_file() and path.suffix == ".json" and "sha256" in path.name:
                pending.append(path)
        checks.append({"manifest": relative(manifest), "entries": len(entries), "passed": local_passed})
    return {
        "direct_entries": direct,
        "manifest_count": len(visited),
        "unique_files": len(files),
        "entry_comparisons": comparisons,
        "passed_comparisons": passed,
        "recursion_scope": "Explicit sha256 preservation manifests only. Historical artifact-pins files are frozen byte evidence; their then-current mutable source hashes are not asserted as current.",
        "manifests": sorted(checks, key=lambda row: row["manifest"]),
    }


def sections(text: str, prefix: str) -> dict[str, str]:
    pattern = rf"^### ({prefix}\d{{2}})\b[^\n]*\n(.*?)(?=^### |^## |\Z)"
    return {key: body.strip() for key, body in re.findall(pattern, text, re.M | re.S)}


def proof_rows(text: str) -> dict[str, str]:
    return {key: row.strip() for key, row in re.findall(r"^\|\s*(P\d{2})\s*\|([^\n]+)", text, re.M)}


def verify_review() -> dict:
    current, before = MAIN.read_text(), BEFORE.read_text()
    current_c, before_c = sections(current, "C"), sections(before, "C")
    findings = sections(current, "F")
    current_p, before_p = proof_rows(current), proof_rows(before)
    category_ids = re.findall(r"^\|\s*(\d+)\s*\|", current, re.M)
    require(set(current_c) == {f"C{i:02}" for i in range(1, 21)}, "C01–C20 set differs")
    require(set(findings) == {f"F{i:02}" for i in range(1, 13)}, "F01–F12 set differs")
    require(set(current_p) == {f"P{i:02}" for i in range(1, 37)}, "P01–P36 set differs")
    require(category_ids == [str(i) for i in range(1, 23)], "22 category rows differ")
    unchanged = []
    for key in before_c:
        old, new = before_c[key], current_c.get(key, "")
        if key == "C04":
            old = old.replace("**Exact owner amendment proposed:**", "**Exact owner amendment ratified for later formal reconciliation:**")
            old = normalized(old).replace(
                "Explicit adoption and coordinated owner/OpenSpec reconciliation are required; until then current separate predicates remain the interim rule.",
                "This policy is explicitly adopted. Coordinated owner/OpenSpec reconciliation remains required; no implementation, consumer cutover or runtime qualification is inferred from ratification.",
            )
        elif key == "C05":
            old = old.replace("**Exact owner amendment proposed:**", "**Exact owner amendment ratified for later formal reconciliation:**")
            old = normalized(old).replace(
                "This is an explicit recommendation to narrow an unresolved promise, **not an implication already ratified by D40**.",
                "This is an explicitly ratified narrowing of the broader promise, **not an implication of D40's earlier scope**.",
            )
        same = normalized(old) == normalized(new)
        require(same, f"Unexpected normative change in {key}")
        if same:
            unchanged.append(key)
    for key, old in before_p.items():
        if key == "P14":
            old = old.replace("Test C05 only after adoption.", "C05 is adopted; actual source qualification is still required.")
        require(normalized(old) == normalized(current_p.get(key, "")), f"Unexpected proof behavior change in {key}")
    require("### C04 — Financial support and relationship continuity: ratified policy" in current, "C04 status is not ratified")
    require("### C05 — Recurring attention: ratified scope correction" in current, "C05 status is not ratified")
    require("## Explicit ratification" in current, "Missing explicit ratification record")
    require("D1/D3/D6/D11–D13 SHALL retain selected/reviewed status" in normalized(current_c.get("C07", "")), "Six exceptions not retained")
    require("E7 temporal attribution and C-01 posted-correction approval remain upstream policy gates" in normalized(current_c.get("C07", "")), "Upstream gates not retained")
    require("No D42 answer is recorded" in current, "Main review must not invent D42")
    require("future proof obligations" in current, "Future proof status missing")
    require(Q42.is_file(), "Q42 research file missing")
    question = Q42.read_text() if Q42.is_file() else ""
    require(bool(re.search(r"unanswered|not yet answered|no (?:founder )?answer|no d42 answer", question, re.I)), "Q42 must state unanswered status")
    require(not (GRILL / "phase28-d42-newsletter-confirmation-adversarial-review.md").exists(), "Unexpected D42 answer review")
    return {"clauses": len(current_c), "findings": len(findings), "proofs": len(current_p), "categories": len(category_ids), "normative_clauses_preserved_with_status_only_changes": unchanged, "proof_rows_preserved_with_P14_status_only_change": len(current_p)}


def heading_anchors(text: str) -> set[str]:
    anchors: set[str] = set()
    seen: dict[str, int] = {}
    for line in text.splitlines():
        match = re.match(r"^#{1,6}\s+(.+?)(?:\s+#+)?$", line)
        if not match:
            continue
        title = re.sub(r"<[^>]*>", "", match.group(1)).lower()
        title = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", title)
        slug = "".join(char for char in title if char in "-_ " or not unicodedata.category(char).startswith(("P", "S")))
        slug = slug.replace(" ", "-")
        count = seen.get(slug, 0)
        seen[slug] = count + 1
        anchors.add(f"{slug}-{count}" if count else slug)
    anchors.update(re.findall(r"<(?:a|h[1-6])[^>]+(?:id|name)=[\"']([^\"']+)", text, re.I))
    return anchors


def verify_links(paths: list[Path]) -> dict:
    local = external = line_refs = anchor_refs = 0
    checked = []
    for source in paths:
        if not source.is_file():
            require(False, f"Missing current document {relative(source)}")
            continue
        text = source.read_text()
        checked.append(relative(source))
        for destination in re.findall(r"\[[^\]\n]*\]\(([^\n)]+)\)", text):
            destination = destination.strip().strip("<>")
            if re.match(r"(?:[a-z][a-z0-9+.-]*:)?//|(?:mailto|app|codex):", destination, re.I):
                external += 1
                continue
            destination = unquote(destination)
            path_text, _, anchor = destination.partition("#")
            line = None
            match = re.search(r":(\d+)(?:[-–](\d+))?$", path_text)
            if match:
                line = (int(match.group(1)), int(match.group(2) or match.group(1)))
                path_text = path_text[:match.start()]
            target = (source.parent / path_text).resolve() if path_text else source
            local += 1
            if target == REPORT and not target.exists():
                require(not line and not anchor, "Uncreated self-report has a line/anchor reference")
                continue
            if not target.is_file():
                require(False, f"Broken link in {relative(source)}: {destination}")
                continue
            if line:
                line_refs += 1
                length = len(target.read_text().splitlines())
                require(1 <= line[0] <= line[1] <= length, f"Out-of-bounds line in {relative(source)}: {destination}")
            if anchor:
                anchor_refs += 1
                require(anchor in heading_anchors(target.read_text()), f"Missing anchor in {relative(source)}: {destination}")
    return {"documents": checked, "local_references": local, "external_links_not_fetched": external, "line_bounds": line_refs, "anchors": anchor_refs}


def main() -> int:
    report = {
        "status": "pending",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "Fresh documentation-only ratification verification. Historical programs are hashed as bytes and manifest JSON parsed as data; no earlier program is imported or executed.",
        "runtime_or_usability_tests_run": False,
        "checks": {},
    }
    try:
        report["checks"]["frozen_evidence"] = verify_manifests()
        report["checks"]["ratified_review"] = verify_review()
        documents = [MAIN, GRILL / "phase28-post-d41-coverage-synthesis.md", GRILL / "phase28-session.md", Q42, *sorted(HERE.glob("*.md"))]
        report["checks"]["links"] = verify_links(documents)
        report["current_sha256"] = {relative(path): digest(path) for path in [*documents, MANIFEST, Path(__file__).resolve()] if path.is_file()}
    except Exception as exc:
        ERRORS.append(f"Verifier error: {type(exc).__name__}: {exc}")
    report["status"] = "passed" if not ERRORS else "failed"
    report["errors"] = ERRORS
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"status": report["status"], "report": relative(REPORT), "errors": ERRORS}, ensure_ascii=False))
    return 0 if not ERRORS else 1


if __name__ == "__main__":
    sys.exit(main())
