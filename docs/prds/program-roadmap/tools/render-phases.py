#!/usr/bin/env python3
"""Derive the two phase projections from roadmap.md; read-only unless --write."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys

BASE = Path(__file__).resolve().parents[1]
REPO = BASE.parents[2]
ROADMAP = BASE.parent / "sitestacker-parity/roadmap.md"
INVENTORY = BASE / "phases.json"
PHASE_MAP = BASE.parent / "sitestacker-parity/phase-map.md"
START = "<!-- phase-inventory:start -->"
END = "<!-- phase-inventory:end -->"


def derive_inventory(roadmap):
    """Keep Markdown-valued dependency/status cells exact; headings own names."""
    revision = re.search(r"^# .+ \(v([0-9]+)\)\s*$", roadmap, re.M)
    adopted = re.search(r"^Adopted ([0-9]{4}-[0-9]{2}-[0-9]{2})\b", roadmap, re.M)
    if not revision or not adopted:
        raise ValueError("Roadmap must declare its version and adoption date")
    headings = {}
    for match in re.finditer(r"^### Phase ([0-9]+) — (.+?) \(`([^`]+)`\)$", roadmap, re.M):
        number = int(match[1])
        if number in headings:
            raise ValueError(f"Duplicate Phase {number} heading")
        headings[number] = (match[2], match[3])
    section = re.search(r"^## The master phase table\s*\n(.*?)(?=^## |\Z)", roadmap, re.M | re.S)
    if not section:
        raise ValueError("Missing canonical master phase table")
    phases = []
    for line in section[1].splitlines():
        if not re.match(r"^\|\s*\*\*[0-9]+\*\*\s*\|", line):
            continue
        cells = [cell.strip() for cell in re.split(r"(?<!\\)\|", line.strip())[1:-1]]
        if len(cells) != 7:
            raise ValueError("Master phase row must have exactly seven cells: " + line[:80])
        number = int(cells[0].strip("*"))
        slug_match = re.fullmatch(r"`([^`]+)`", cells[1])
        if not slug_match or number not in headings:
            raise ValueError(f"Phase {number} lacks an exact slug or corresponding heading")
        name, slug = headings[number]
        if slug_match[1] != slug:
            raise ValueError(f"Phase {number} table/heading slug mismatch")
        # Link labels are names; trailing editorial notes (currently Phase 8)
        # remain in the canonical table and do not become part of the name.
        label = re.match(r"\[([^]]+)\]\([^)]+\)", cells[2])
        table_name = label[1] if label else cells[2]
        if table_name != name:
            raise ValueError(f"Phase {number} table/heading name mismatch")
        if f'<a id="phase-{number:02}"></a>' not in roadmap:
            raise ValueError(f"Phase {number} is missing its explicit roadmap anchor")
        phases.append({"phase": number, "slug": slug, "name": name,
                       "startingDependencies": cells[3], "status": cells[6]})
    numbers = [phase["phase"] for phase in phases]
    if not phases or numbers != list(range(len(phases))) or set(headings) != set(numbers):
        raise ValueError("Master table and headings must contain the same contiguous phases from zero, once each")
    if len({phase["slug"] for phase in phases}) != len(phases):
        raise ValueError("Duplicate stable phase slug")
    return {"revision": int(revision[1]), "adoptedOn": adopted[1], "phases": phases}


def format_local(text, path):
    result = subprocess.run(
        ["bunx", "--no-install", "prettier", "--stdin-filepath", str(path)],
        input=text, text=True, capture_output=True, cwd=REPO, check=True,
    )
    return result.stdout


def replace_inventory_table(phase_map, table):
    if phase_map.count(START) != 1 or phase_map.count(END) != 1:
        raise ValueError("Phase map must contain exactly one inventory marker pair")
    before, rest = phase_map.split(START)
    current, after = rest.split(END)
    if END in before or START in after:
        raise ValueError("Phase map inventory markers are out of order")
    return before + START + "\n\n" + table.strip() + "\n\n" + END + after


def build_projections(roadmap, phase_map):
    inventory = derive_inventory(roadmap)
    table = "| Phase | Stable slug | Starting dependencies | Planning state |\n"
    table += "| --- | --- | --- | --- |\n"
    for row in inventory["phases"]:
        table += (f"| [{row['phase']} — {row['name']}](roadmap.md#phase-{row['phase']:02}) "
                  f"| `{row['slug']}` | {row['startingDependencies']} | {row['status']} |\n")
    return {
        INVENTORY: format_local(json.dumps(inventory, indent=2) + "\n", INVENTORY),
        PHASE_MAP: replace_inventory_table(phase_map, format_local(table, PHASE_MAP)),
    }


def stale_projections(expected, actual):
    return [path for path, text in expected.items() if actual.get(path) != text]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="Check without writing (default)")
    mode.add_argument("--write", action="store_true", help="Regenerate only phases.json and the marked phase-map table")
    args = parser.parse_args()
    try:
        projections = build_projections(ROADMAP.read_text(encoding="utf-8"), PHASE_MAP.read_text(encoding="utf-8"))
        if args.write:
            # Construct and format both outputs before touching either file.
            for path, text in projections.items():
                if not path.exists() or path.read_text(encoding="utf-8") != text:
                    path.write_text(text, encoding="utf-8", newline="\n")
        else:
            actual = {path: path.read_text(encoding="utf-8") if path.exists() else None for path in projections}
            stale = stale_projections(projections, actual)
            if stale:
                print("Stale phase projections: " + ", ".join(str(path.relative_to(REPO)) for path in stale), file=sys.stderr)
                print("Review roadmap.md, then run python3 docs/prds/program-roadmap/tools/render-phases.py --write", file=sys.stderr)
                return 1
    except (ValueError, OSError, subprocess.CalledProcessError) as exc:
        print("Phase projection generation failed: " + str(exc), file=sys.stderr)
        if isinstance(exc, subprocess.CalledProcessError) and exc.stderr:
            print(exc.stderr.strip(), file=sys.stderr)
        return 1
    print("PASS phase projections: roadmap master table/headings → phases.json and marked phase-map inventory" + (" (written)" if args.write else " (read-only)"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
