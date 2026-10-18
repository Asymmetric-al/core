#!/usr/bin/env python3
"""Fresh documentation-only completion review verifier.

This program reads old evidence and hash manifests as bytes/JSON data only.
It never imports, executes or shells out to an earlier program. It does not
claim application, database, permission, provider or usability qualification.
"""

from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime
import hashlib
import html
import json
from pathlib import Path
import re
from urllib.parse import unquote
from zoneinfo import ZoneInfo


HERE = Path(__file__).resolve().parent
GRILL = HERE.parent
ROOT = GRILL.parents[3]
REPORT = HERE / "verification.json"
FROZEN = HERE / "prior-evidence-sha256.json"
HASH = re.compile(r"^[0-9a-f]{64}$")
EXPECTED_CATEGORIES = [
    ("Problem validity, necessity and alternatives", ["problem", "validity"]),
    ("Brittleness", ["brittleness"]),
    ("Technical debt", ["technical", "debt"]),
    ("Edge cases", ["edge", "cases"]),
    ("Footguns", ["footguns"]),
    ("Tenant safety", ["tenant", "safety"]),
    ("Database, RLS and authorization safety", ["database", "rls"]),
    ("Overengineering", ["overengineering"]),
    ("UX/UI and user friction", ["ux", "friction"]),
    ("Source of truth, ownership and invariants", ["source", "truth"]),
    ("Hidden coupling", ["hidden", "coupling"]),
    ("Failure modes", ["failure", "modes"]),
    ("Lifecycle, temporal correctness, concurrency and idempotency", ["lifecycle", "idempotency"]),
    ("Data integrity", ["data", "integrity"]),
    ("Security and privacy", ["security", "privacy"]),
    ("Scalability and performance", ["scalability", "performance"]),
    ("Operational burden", ["operational", "burden"]),
    ("Observability and auditability", ["observability", "auditability"]),
    ("Dependency and integration", ["dependencies", "integrations"]),
    ("Migration, rollout and upgrade", ["migration", "rollout"]),
    ("Testability, traceability and proof", ["testability", "traceability"]),
    ("Other development hazards", ["other", "development", "hazards"]),
]


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def frozen_entries(value: object) -> dict[str, str]:
    if not isinstance(value, dict):
        raise ValueError("manifest must be a JSON object")
    if "artifacts" in value:
        artifacts = value["artifacts"]
        if not isinstance(artifacts, list) or not artifacts:
            raise ValueError("manifest artifacts must be a nonempty list")
        entries = {}
        for artifact in artifacts:
            if not isinstance(artifact, dict) or not isinstance(artifact.get("path"), str):
                raise ValueError("manifest artifact must have a path")
            if artifact["path"] in entries:
                raise ValueError(f"duplicate manifest path: {artifact['path']}")
            entries[artifact["path"]] = artifact.get("sha256")
    else:
        entries = value.get("sha256", value)
    if not isinstance(entries, dict) or not entries:
        raise ValueError("manifest must contain a nonempty hash map")
    if not all(isinstance(k, str) and isinstance(v, str) and HASH.fullmatch(v)
               for k, v in entries.items()):
        raise ValueError("manifest map has a non-path or invalid SHA-256 value")
    return entries


def resolve_frozen(manifest: Path, key: str) -> Path:
    supplied = Path(key)
    if supplied.is_absolute():
        candidates = [supplied.resolve()]
    elif key.startswith("docs/"):
        candidates = [(ROOT / supplied).resolve()]
    else:
        candidates = list(dict.fromkeys([
            (GRILL / supplied).resolve(),
            (manifest.parent / supplied).resolve(),
            (ROOT / supplied).resolve(),
        ]))
    existing = [p for p in candidates if p.is_file()]
    if len(existing) != 1:
        raise ValueError(f"expected one existing path for {key!r}; found {existing}")
    result = existing[0]
    if not result.is_relative_to(ROOT):
        raise ValueError(f"frozen file outside repository: {result}")
    return result


def verify_frozen(errors: list[str]) -> dict:
    pending = [FROZEN]
    seen: set[Path] = set()
    files: set[Path] = set()
    details = []
    total = passed = direct = direct_passed = 0
    while pending:
        manifest = pending.pop()
        if manifest in seen:
            continue
        seen.add(manifest)
        try:
            entries = frozen_entries(json.loads(manifest.read_text()))
        except (OSError, ValueError) as exc:
            errors.append(f"{relative(manifest)}: {exc}")
            continue
        manifest_passed = 0
        for key, expected in entries.items():
            total += 1
            try:
                target = resolve_frozen(manifest, key)
                files.add(target)
                actual = digest(target)
                if actual != expected:
                    errors.append(f"frozen hash mismatch: {relative(manifest)} -> {key}")
                else:
                    passed += 1
                    manifest_passed += 1
                # These files are data. Never follow or run Python references.
                if target.name.endswith("evidence-sha256.json"):
                    pending.append(target)
            except (OSError, ValueError) as exc:
                errors.append(f"{relative(manifest)} -> {key}: {exc}")
        details.append({"manifest": relative(manifest), "entries": len(entries),
                        "passed": manifest_passed})
        if manifest == FROZEN:
            direct, direct_passed = len(entries), manifest_passed
    if direct != 18:
        errors.append(f"expected 18 direct frozen paths, found {direct}")
    return {"direct_entries": direct, "direct_passed": direct_passed,
            "manifests_checked": len(seen), "unique_frozen_files_checked": len(files),
            "manifest_entry_checks": total, "manifest_entry_passed": passed,
            "manifests": sorted(details, key=lambda x: x["manifest"])}


def strip_fences(text: str) -> str:
    result = []
    fence = None
    for line in text.splitlines():
        match = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
        if match:
            marker = match.group(1)[0]
            if fence is None:
                fence = marker
            elif marker == fence:
                fence = None
            result.append("")
        else:
            result.append(line if fence is None else "")
    return "\n".join(result)


def heading_anchors(text: str) -> set[str]:
    anchors = set(re.findall(r"\bid\s*=\s*['\"]([^'\"]+)['\"]", text))
    counts: Counter[str] = Counter()
    for line in strip_fences(text).splitlines():
        match = re.match(r"^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$", line)
        if not match:
            continue
        label = match.group(1)
        label = re.sub(r"!?\[([^]]+)\]\([^)]*\)", r"\1", label)
        label = html.unescape(re.sub(r"<[^>]*>", "", label))
        label = label.replace("`", "").replace("*", "")
        slug = re.sub(r"[^\w\-\s]", "", label.lower())
        slug = re.sub(r"\s", "-", slug)
        occurrence = counts[slug]
        counts[slug] += 1
        anchors.add(slug if occurrence == 0 else f"{slug}-{occurrence}")
    return anchors


def verify_links(paths: list[Path], errors: list[str]) -> dict:
    count = line_checks = anchor_checks = 0
    details = []
    anchor_cache: dict[Path, set[str]] = {}
    for source in paths:
        text = strip_fences(source.read_text())
        links = re.findall(r"!?\[[^\n]*?\]\((<[^>]+>|[^)\n]+)\)", text)
        links += re.findall(r"^\s*\[[^]]+\]:\s*(\S+)", text, re.MULTILINE)
        source_count = 0
        for raw in links:
            target_text = raw.strip()
            if target_text.startswith("<") and target_text.endswith(">"):
                target_text = target_text[1:-1]
            else:
                target_text = re.sub(r'\s+["\'][^"\']*["\']\s*$', "", target_text)
            if re.match(r"^[A-Za-z][A-Za-z0-9+.-]*://", target_text) or target_text.startswith(("mailto:", "data:", "app:")):
                continue
            target_text = unquote(target_text)
            path_text, marker, anchor = target_text.partition("#")
            line_number = None
            match = re.match(r"^(.*):(\d+)$", path_text)
            if match:
                path_text, line_number = match.group(1), int(match.group(2))
            target = (source.parent / path_text).resolve() if path_text else source
            count += 1
            source_count += 1
            if not target.exists() and target != REPORT:
                errors.append(f"broken local link: {relative(source)} -> {raw}")
                continue
            if target == REPORT:
                if line_number is not None or marker:
                    errors.append(f"generated report cannot have line/anchor link: {raw}")
                continue
            if line_number is not None:
                line_checks += 1
                if not target.is_file() or line_number < 1 or line_number > len(target.read_text().splitlines()):
                    errors.append(f"invalid line reference: {relative(source)} -> {raw}")
            if marker and anchor:
                anchor_checks += 1
                if target.suffix.lower() not in {".md", ".mdx"}:
                    errors.append(f"unsupported local anchor target: {relative(source)} -> {raw}")
                else:
                    if target not in anchor_cache:
                        anchor_cache[target] = heading_anchors(target.read_text())
                    if anchor not in anchor_cache[target]:
                        errors.append(f"missing heading/HTML anchor: {relative(source)} -> {raw}")
        details.append({"document": relative(source), "local_links": source_count})
    return {"local_links": count, "line_bounds": line_checks, "heading_or_html_anchors": anchor_checks,
            "documents": details, "external_urls": "Not network-verified by this checker"}


def definition_ids(text: str, prefix: str) -> list[str]:
    result = []
    for line in strip_fences(text).splitlines():
        content = line.strip()
        if re.match(r"^#{1,6}\s+", content):
            content = re.sub(r"^#{1,6}\s+", "", content)
        elif content.startswith("|"):
            content = content[1:].split("|", 1)[0].strip()
        else:
            # Prose that begins with a reference is not a definition.
            continue
        content = content.lstrip("*` ")
        match = re.match(rf"({prefix}\d{{2}})(?=[\s—–:|.*`-]|$)", content)
        if match:
            result.append(match.group(1))
    return result


def verify_content(main: Path, counts: dict[str, int], errors: list[str]) -> dict:
    text = main.read_text()
    checks = {}
    for prefix, maximum in counts.items():
        definitions = definition_ids(text, prefix)
        expected = {f"{prefix}{i:02}" for i in range(1, maximum + 1)}
        found = set(definitions)
        if found != expected:
            errors.append(f"{prefix} definitions: missing {sorted(expected-found)}; extra {sorted(found-expected)}")
        duplicates = {key: value for key, value in Counter(definitions).items() if value > 1}
        if duplicates:
            errors.append(f"duplicate {prefix} definitions: {duplicates}")
        references = set(re.findall(rf"\b{prefix}\d{{2}}\b", text))
        if references - expected:
            errors.append(f"unknown {prefix} references: {sorted(references-expected)}")
        checks[prefix] = {"expected": maximum, "definitions": definitions,
                          "unique_references": len(references), "duplicates": duplicates}
    category_rows = []
    for name, keywords in EXPECTED_CATEGORIES:
        matches = []
        for line in text.splitlines():
            if not line.lstrip().startswith("|"):
                continue
            cells = [re.sub(r"[*`]", "", x).strip() for x in line.strip().strip("|").split("|")]
            # The category is the first column, or second after a numeric row ID.
            label = cells[1] if cells and re.fullmatch(r"\d+", cells[0]) and len(cells) > 1 else cells[0]
            normalized = re.sub(r"[^a-z0-9]+", " ", label.lower())
            if all(word in normalized.split() for word in keywords):
                matches.append(line)
        if len(matches) != 1:
            errors.append(f"category {name}: expected one category row, found {len(matches)}")
        explicit = bool(matches and re.search(r"\b(?:yes|no|none)\b", matches[0], re.IGNORECASE))
        if not explicit:
            errors.append(f"category {name}: missing explicit material concern yes/no declaration")
        category_rows.append({"category": name, "rows": len(matches), "explicit_material_status": explicit})
    checks["categories"] = {"expected": 22, "rows": category_rows}
    normalized = text.lower()
    status = {
        "proposed_wording_present": "proposed" in normalized,
        "ratification_distinction_present": "ratif" in normalized,
        "no_new_d42_declaration": bool(re.search(r"(?:no\s+(?:new\s+)?(?:q42|d42)|does\s+not\s+invent\s+(?:a\s+)?(?:q42|d42))", text, re.IGNORECASE)),
        "no_d42_decision_row_or_heading": not bool(re.search(r"^\s*(?:#{1,6}\s+|\|\s*)D42(?:\s|[—–:|])", text, re.MULTILINE)),
        "earlier_status_exceptions_named": all(name in text for name in ["D1", "D3", "D6", "D11", "D13"]),
        "qualification_limit_present": "qualification" in normalized and ("not" in normalized or "no " in normalized),
    }
    for name, passed in status.items():
        if not passed:
            errors.append(f"missing required status marker: {name}")
    checks["status_markers"] = status
    checks["semantic_status_limit"] = "Markers and IDs are structural checks, not independent semantic proof or founder ratification."
    return checks


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--main", required=True, help="Main review path relative to grill directory or absolute")
    parser.add_argument("--clauses", type=int, default=20)
    parser.add_argument("--findings", type=int, default=12)
    parser.add_argument("--proofs", type=int, default=36)
    args = parser.parse_args()
    review = Path(args.main)
    if not review.is_absolute():
        review = GRILL / review
    review = review.resolve()
    errors: list[str] = []
    files = sorted(set([review, GRILL / "phase28-post-d41-coverage-synthesis.md",
                        GRILL / "phase28-session.md", *HERE.glob("*.md")]))
    missing = [relative(path) for path in files if not path.is_file()]
    if missing:
        errors.append(f"missing current documents: {missing}")
    checks = {"frozen_evidence": verify_frozen(errors)}
    if review.is_file():
        checks["content"] = verify_content(review, {"C": args.clauses, "F": args.findings, "P": args.proofs}, errors)
    checks["references"] = verify_links([p for p in files if p.is_file()], errors)
    inventory = {relative(path): digest(path) for path in [*files, FROZEN] if path.is_file()}
    result = {
        "status": "passed" if not errors else "failed",
        "date": datetime.now(ZoneInfo("Asia/Bangkok")).date().isoformat(),
        "timezone": "Asia/Bangkok",
        "scope": "Fresh documentation-only completeness-review verification; earlier programs are read as bytes only and never executed/imported.",
        "main_review": relative(review),
        "expected_counts": {"clauses": args.clauses, "findings": args.findings, "proofs": args.proofs, "categories": 22, "direct_frozen_paths": 18},
        "checks": checks,
        "current_artifact_sha256": inventory,
        "inventory_exclusions": [relative(Path(__file__)), relative(REPORT)],
        "limitations": [
            "No application, database, RLS/grant, provider, browser, accessibility, usability or workload test was run.",
            "No previous program was executed or imported. Pinned manifests were parsed only as JSON data.",
            "Hashes establish byte preservation, not truth of historical claims.",
            "Coverage IDs, links and status markers do not establish domain completeness or ratification.",
            "External web sources were not fetched or validated by this checker.",
        ],
        "errors": errors,
    }
    REPORT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"status": result["status"], "report": relative(REPORT),
                      "frozen_checks": checks["frozen_evidence"]["manifest_entry_checks"],
                      "local_links": checks["references"]["local_links"], "errors": errors}, ensure_ascii=False))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
