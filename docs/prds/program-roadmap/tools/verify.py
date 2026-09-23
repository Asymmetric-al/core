#!/usr/bin/env python3
"""Read-only program source, inventory and routing checks; never executes source assets."""
from pathlib import Path
import hashlib
import json
import re
import sys
from urllib.parse import unquote

BASE = Path(__file__).resolve().parents[1]
REPO = BASE.parents[2]
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)

def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def without_fences(text):
    result, fence = [], None
    for line in text.splitlines():
        match = re.match(r"^\s*(`{3,}|~{3,})", line)
        if match:
            marker = match[1]
            if fence is None:
                fence = marker
            elif marker[0] == fence[0] and len(marker) >= len(fence):
                fence = None
            result.append("")
        else:
            result.append(line if fence is None else "")
    return "\n".join(result)

def main():
    source = BASE / "source-2026-09-22"
    manifest = read_json(source / "manifest.json")
    original = source / manifest["sourceFile"]
    check(original.stat().st_size == manifest["bytes"], "Supplied document byte count changed")
    check(digest(original) == manifest["sha256"], "Supplied document hash changed")
    assets = manifest["assets"]
    check(len(assets) == 52 and len({x["extractedPath"] for x in assets}) == 52, "Expected 52 distinct source assets")
    for item in assets:
        path = source / item["extractedPath"]
        check(path.is_relative_to(source) and ".." not in Path(item["extractedPath"]).parts, "Source asset escapes capture")
        check(path.stat().st_size == item["bytes"] and digest(path) == item["sha256"], "Original source asset changed: " + item["extractedPath"])
        if path.suffix == ".json":
            read_json(path)
    previous = manifest["previousRoadmap"]
    check(digest(source / previous["path"]) == previous["sha256"], "Previous roadmap capture changed")
    inventory = read_json(BASE / "phases.json")
    phases = inventory["phases"]
    check(inventory["revision"] == 3 and [x["phase"] for x in phases] == list(range(45)), "Expected roadmap v3 phases 0 through 44 exactly once")
    check(len({x["slug"] for x in phases}) == 45, "Duplicate phase slug")
    roadmap = (BASE.parent / "sitestacker-parity/roadmap.md").read_text(encoding="utf-8")
    mirror = (BASE.parent / "sitestacker-parity/phase-map.md").read_text(encoding="utf-8")
    for row in phases:
        n = row["phase"]
        master = next((l for l in roadmap.splitlines() if l.startswith(f"| **{n}** |")), "")
        compact = next((l for l in mirror.splitlines() if l.startswith(f"| [{n} —")), "")
        check(bool(master and compact), f"Missing table phase {n}")
        for field in ["slug", "startingDependencies", "status"]:
            check(row[field] in master and row[field] in compact, f"Phase {n} {field} diverged from inventory")
        check(f'<a id="phase-{n:02}"></a>' in roadmap, f"Missing phase {n} anchor")
        check(re.search(rf"^### Phase {n} — .*\(`{re.escape(row['slug'])}`\)$",roadmap,re.M), f"Phase {n} title/slug mismatch")
    old = (source / previous["path"]).read_text(encoding="utf-8")
    for n in range(27):
        before = next(l for l in old.splitlines() if l.startswith(f"| **{n}** |"))
        after = next(l for l in roadmap.splitlines() if l.startswith(f"| **{n}** |"))
        check(before.split("|")[4].strip() == after.split("|")[4].strip(), f"Predecessor Phase {n} dependency floor changed")
    check("34 CORE" in phases[41]["startingDependencies"], "Mobilization is not bound to independent CORE")
    check(not re.search(r"\b(34|40|41)\b", phases[42]["startingDependencies"]), "Hybrid Web has an unrelated whole-phase blocker")
    check("36" in phases[37]["startingDependencies"], "Phase 37 supplied starting dependency was silently removed")
    check("43" not in phases[31]["startingDependencies"] and "44" not in phases[31]["startingDependencies"], "Connector/consumer cycle")
    # Path checks cover operative packages, never interpret original code examples as executable input.
    docs = []
    for directory in [BASE,BASE.parent/"workflow-studio",BASE.parent/"web-studio-hybrid",BASE.parent/"governed-sms",BASE.parent/"enterprise-identity"]:
        check(directory.exists(), "Missing adopted package: " + str(directory.relative_to(REPO)))
        docs += [p for p in directory.rglob("*.md") if source not in p.parents]
    docs += [BASE.parent/"sitestacker-parity"/name for name in ["roadmap.md","phase-map.md","README.md"]]
    links = 0
    for path in docs:
        content = without_fences(path.read_text(encoding="utf-8"))
        for target in re.findall(r"\]\(([^\s)]+)(?:\s+\"[^\"]*\")?\)",content):
            target = unquote(target.strip("<>"))
            if re.match(r"[a-zA-Z][\w+.-]*:|//|#",target):
                continue
            local = target.split("#",1)[0].split("?",1)[0]
            if not local:
                continue
            dest = (path.parent/local).resolve()
            check(dest.exists(), f"Broken local path {path.relative_to(REPO)}: {target}")
            links += 1
    if errors:
        print("\n".join(errors),file=sys.stderr)
        return 1
    print(f"PASS program roadmap: 45 phases, 52 exact assets, predecessor floors, {len(docs)} operative documents, {links} local links")
    return 0

if __name__ == "__main__":
    sys.exit(main())
