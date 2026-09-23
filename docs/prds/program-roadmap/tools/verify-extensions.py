#!/usr/bin/env python3
"""Verify Phase 43/44 planning coverage without writing files or claiming runtime proof."""

from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parents[4]
PACKAGES = (
    ("governed-sms", "SMS", 32, "sms-channel-activation"),
    ("enterprise-identity", "EID", 34, "enterprise-identity-integration"),
)


def require(condition, message):
    if not condition:
        raise SystemExit(f"Extended planning verification failed: {message}")


def normalized(text):
    return " ".join(text.split())


def check_package(directory, prefix, count, stable_slug):
    package = ROOT / "docs/prds" / directory
    data = json.loads((package / "delivery.json").read_text())
    spec = ROOT / data["openSpec"]["path"]
    body = spec.read_text()
    source = (ROOT / data["source"]["path"]).read_text()
    expected = {f"{prefix}-AT-{number:02}" for number in range(1, count + 1)}
    cases = {case["id"]: case for case in data["acceptanceCases"]}
    packages = data["packages"]
    known = {item["id"] for item in packages}

    require(data["slug"] == stable_slug, f"{directory}: canonical slug changed")
    require(len(cases) == count == len(data["acceptanceCases"]), f"{directory}: duplicate or missing case")
    require(set(cases) == expected, f"{directory}: original acceptance identifiers changed")
    require(len(known) == 12 == len(packages), f"{directory}: duplicate or missing work package")
    require(known == {f"{prefix}-W{number:02}" for number in range(1, 13)}, f"{directory}: original work-package identifiers changed")

    pending = {item["id"]: set(item["dependsOn"]) for item in packages}
    require(all(dependencies <= known for dependencies in pending.values()), f"{directory}: unknown internal dependency")
    completed = set()
    while pending:
        ready = {key for key, dependencies in pending.items() if dependencies <= completed}
        require(bool(ready), f"{directory}: internal dependency cycle")
        completed.update(ready)
        pending = {key: dependencies for key, dependencies in pending.items() if key not in ready}

    mapped = {case for item in packages for case in item["acceptanceCases"]}
    require(mapped == expected, f"{directory}: acceptance coverage lost or invented")
    source_cases = {}
    for line in source.splitlines():
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if cells and re.fullmatch(fr"{prefix}-AT-\d{{2}}", cells[0]):
            require(len(cells) == 2, f"{directory}: malformed source acceptance row")
            require(cells[0] not in source_cases, f"{directory}: duplicate source acceptance row")
            source_cases[cells[0]] = cells[1]
    require(set(source_cases) == expected, f"{directory}: preserved source acceptance inventory mismatch")

    requirements = re.findall(r"^### Requirement: (.+)$", body, re.MULTILINE)
    scenarios = re.findall(fr"^#### Scenario: ({prefix}-AT-\d{{2}}) source acceptance$", body, re.MULTILINE)
    require(len(requirements) == len(set(requirements)) == 12, f"{directory}: requirement identity/count mismatch")
    require(len(scenarios) == count and set(scenarios) == expected, f"{directory}: each case must appear once in OpenSpec")
    for identity, case in cases.items():
        require(normalized(case["requiredProof"]) == normalized(source_cases[identity]), f"{identity}: source proof text changed")
        require(normalized("- THEN " + case["requiredProof"]) in normalized(body), f"{identity}: OpenSpec proof text missing")

    bindings = data["openSpec"]["acceptanceBindings"]
    require(len(bindings) == count and {binding["case"] for binding in bindings} == expected, f"{directory}: trace inventory mismatch")
    for binding in bindings:
        identity = binding["case"]
        require(binding["requirement"] in requirements, f"{identity}: unknown requirement binding")
        require(binding["scenario"] == f"{identity} source acceptance", f"{identity}: wrong scenario binding")
        consumers = {item["id"] for item in packages if identity in item["acceptanceCases"]}
        require(set(binding["workPackages"]) == consumers, f"{identity}: incorrect work-package consumers")
        section = body.split("### Requirement: " + binding["requirement"] + "\n", 1)[1].split("### Requirement:", 1)[0]
        require(f"#### Scenario: {binding['scenario']}\n" in section, f"{identity}: scenario is under a different requirement")

    change = spec.parents[2]
    tasks = (change / "tasks.md").read_text()
    require(not re.search(r"^- \[[xX]\]", tasks, re.MULTILINE), f"{directory}: planning check must not certify implementation tasks")
    for file in [*package.glob("*.md"), *change.rglob("*.md")]:
        for link in re.findall(r"\[[^\]]+\]\(([^)]+)\)", file.read_text()):
            if re.match(r"^[a-z]+:", link) or link.startswith("#"):
                continue
            target = (file.parent / link.split("#")[0]).resolve()
            require(target.exists(), f"{file.relative_to(ROOT)}: missing relative target {link}")

    return {"package": directory, "workPackages": 12, "sourceCases": count, "OpenSpecScenarios": count, "internalGraph": "acyclic"}


def main():
    results = [check_package(*entry) for entry in PACKAGES]
    print(json.dumps({"extendedPlanning": results, "scope": "Structural source/trace checks only; no runtime or provider qualification."}, indent=2))


if __name__ == "__main__":
    main()
