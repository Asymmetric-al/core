#!/usr/bin/env python3
"""Independent structural/coverage audit; never runs original source validators or product code."""
import collections
import json
from pathlib import Path
import re
import sys

P = Path(__file__).resolve().parents[1]
REPO = P.parents[2]
SOURCE = P.parent / "program-roadmap/source-2026-09-22/assets/ws"
errors = []

def check(condition, message):
    if not condition: errors.append(message)

def read(path):
    return json.loads(path.read_text())

def unique(rows, key, label):
    ids = [r[key] for r in rows]
    check(len(ids) == len(set(ids)), "Duplicate " + label)
    return set(ids)

def closure(graph, root, active=None):
    active = set() if active is None else active
    if root in active:
        raise ValueError("Dependency cycle at " + root)
    if root not in graph:
        raise ValueError("Missing dependency " + root)
    result = set()
    for dep in graph[root]:
        result.add(dep)
        result.update(closure(graph, dep, active | {root}))
    return result

def walk(node):
    if isinstance(node, dict):
        yield node
        for value in node.values(): yield from walk(value)
    elif isinstance(node, list):
        for value in node: yield from walk(value)

def main():
    recipes = read(P / "contracts/recipe-catalog.json")["recipes"]
    original = read(SOURCE / "contracts/recipe-catalog.json")["recipes"]
    recipe_ids = unique(recipes, "id", "recipe ID")
    check(recipe_ids == {r["id"] for r in original} and len(recipes) == 96, "Recipe coverage differs from 96 original IDs")
    counts = collections.Counter(r["checkpoint"] for r in recipes)
    check(counts == {"CORE":57,"MOBILIZATION":12,"GIVING":15,"EVENTS":3,"CARE":9}, "Recipe allocation mismatch")
    for r in recipes:
        check(r["default_activation"] == "disabled", r["id"] + " activates automatically")
        source = next(s for s in original if s["id"] == r["id"])
        check(r["sourceDependencyLabels"] == source["dependencies"], r["id"] + " lost captured source dependency labels")
        rid = r["id"]
        expected = "MOBILIZATION" if rid.startswith("MOB-") else "GIVING" if (rid.startswith("DON-") and int(rid[-2:]) <= 13) or rid in {"MPD-01","MPD-06"} else "EVENTS" if rid in {"GEN-10","GEN-11","GEN-12"} else "CARE" if rid.startswith("CARE-") or rid == "GEN-18" else "CORE"
        check(r["checkpoint"] == expected, rid + " assigned to wrong source checkpoint")
        for key in ["title","pack","persona","customization","subject","trigger","steps","editable","protected","evidence","default_activation","audience","idempotency","exception_policy","acceptance_ids"]:
            check(r[key] == source[key], r["id"] + " lost original " + key)
    scenarios = read(P / "verification/acceptance-scenarios.json")["scenarios"]
    source_scenarios = read(SOURCE / "verification/acceptance-scenarios.json")["scenarios"]
    scenario_ids = unique(scenarios, "id", "scenario ID")
    check(scenario_ids == {r["id"] for r in source_scenarios} and len(scenarios) == 352, "Scenario coverage differs from original 352")
    check(sum(r["category"] != "RECIPE" for r in scenarios) == 64, "Shared scenario count is not 64")
    for r in scenarios:
        source = next(s for s in source_scenarios if s["id"] == r["id"])
        for key,value in source.items(): check(r.get(key) == value, r["id"] + " changed captured scenario " + key)
        check(r["status"] == "specified_not_executed", r["id"] + " falsely claims execution")
    recipe_tests = collections.Counter(r.get("recipeId") for r in scenarios if r["category"] == "RECIPE")
    check(set(recipe_tests) == recipe_ids and set(recipe_tests.values()) == {3}, "Recipes do not each have exactly three tests")
    for r in recipes: check(set(r["acceptance_ids"]) <= scenario_ids, r["id"] + " has missing acceptance ID")
    plan = read(P / "contracts/delivery-plan.json")
    packages = plan["packages"]
    check(unique(packages,"id","package ID") == {f"WS-{n:02}" for n in range(1,27)}, "Work-package IDs differ from WS-01 through WS-26")
    slices = plan["slices"]
    slice_ids = unique(slices,"id","slice ID")
    graph = {r["id"]:r["dependsOn"] for r in slices}
    for r in slices:
        check(r["packageId"] in {w["id"] for w in packages}, r["id"] + " has no parent package")
        check(r["status"] == "not_started", r["id"] + " falsely claims implementation")
        try:
            deps = closure(graph,r["id"])
            if r["checkpoint"] == "CORE": check(all(d.endswith("-CORE") for d in deps), r["id"] + " has a backward pack dependency")
        except ValueError as exc: errors.append(str(exc))
    check(set(graph["WS-26-FULL"]) == {"WS-26-" + k for k in counts}, "FULL does not roll up all five checkpoints")
    for pack in packages:
        check(set(pack["sliceIds"]) == {s["id"] for s in slices if s["packageId"] == pack["id"]}, pack["id"] + " slice membership mismatch")
        check(set(pack["crossCuttingTests"]) <= scenario_ids, pack["id"] + " references unknown tests")
    check(sum(len(c["recipeIds"]) for c in plan["checkpoints"]) == 96,"Checkpoint recipe coverage mismatch")
    for c in plan["checkpoints"]:
        check(set(c["recipeIds"]) == {r["id"] for r in recipes if r["checkpoint"] == c["id"]}, c["id"] + " recipe membership mismatch")
    refs = read(P / "contracts/reference-allocation.json")
    check(len(refs["blueprints"]) == 16 and len(refs["forms"]) == 4,"Reference fixture count mismatch")
    registry = read(P / "contracts/source-contract-register.json")
    contracts = registry["contracts"]
    check(len(contracts) == 105,"Source-contract inventory count mismatch")
    originals = read(SOURCE / "contracts/source-contract-register.json")["contracts"]
    for captured in originals:
        actual = next((r for r in contracts if (r["bindingKind"],r["contractId"]) == (captured["bindingKind"],captured["contractId"])), None)
        check(actual is not None, "Missing source contract " + captured["contractId"])
        if actual:
            for key,value in captured.items(): check(actual.get(key) == value, "Lost source binding detail " + captured["contractId"] + ":" + key)
    keys = {(r["bindingKind"],r["contractId"]) for r in contracts}
    check(len(keys) == 105,"Duplicate source contract")
    for r in contracts + registry["formContractBindings"]:
        check(r["qualified"] is False and r["effectiveSourceContract"] is None and not r["qualificationEvidence"], "Unproved qualified source: " + r["contractId"])
    allowed_nodes = {"sequence","task","evidence","action","wait","choose_one","parallel","subflow","finish"}
    for ref in refs["blueprints"]:
        bp = read(P / ref["path"])
        check(bp == read(SOURCE / ref["path"]), ref["id"] + " changed original fixture semantics")
        check(bp["defaultEnabled"] is False and bp["enrollment"]["historicalMode"] == "disabled", ref["id"] + " has an unsafe activation default")
        check(bp["recipeId"] in recipe_ids, ref["id"] + " has an unknown recipe")
        check(("triggers",bp["enrollment"]["triggerContract"]) in keys, ref["id"] + " trigger missing from source registry")
        for kind,bindings in bp["bindings"].items():
            for contract in bindings.values(): check((kind,contract) in keys, ref["id"] + " unresolved registry entry " + kind + ":" + contract)
        nodes = [n for n in walk(bp["root"]) if "kind" in n]
        unique(nodes,"id",ref["id"] + " executable node ID")
        for node in nodes: check(node["kind"] in allowed_nodes, ref["id"] + " has unknown executable node")
    for ref in refs["forms"]:
        form = read(P / ref["sourcePath"])
        check(form == read(SOURCE / ref["sourcePath"]), ref["id"] + " changed original form semantics")
        check(form["defaultEnabled"] is False, ref["id"] + " enabled by default")
        if ref["id"] == "FORM-03": check(form["submissionRules"]["hiddenValues"] == "exclude_from_submission_and_effects", "FORM-03 hidden answer rule missing")
    for name in ["workflow","form","operation-result"]:
        path = "contracts/" + name + ".schema.json"
        check(read(P/path) == read(SOURCE/path),"Candidate schema changed: " + name)
    rq = read(P / "contracts/requirements.json")
    check(len(rq["workflow"]) == 38 and len(rq["surfaces"]) == 1,"Requirement projection coverage mismatch")
    cases = {case["name"] for r in rq["workflow"] for case in r["scenarios"]}
    check({f"WS-RQ-{n:03} supported behavior" for n in range(1,31)} <= cases,"Missing original WS-RQ requirement scenario")
    names = unique(rq["workflow"]+rq["surfaces"],"name","requirement name")
    for r in rq["workflow"]+rq["surfaces"]: check(r["scenarios"],"Requirement has no scenario: " + r["name"])
    # Negative self-checks prove the graph guard rejects the relevant regressions.
    for invalid in [{"a":["a"]},{"a":["b"]}]:
        try: closure(invalid,"a")
        except ValueError: pass
        else: errors.append("Graph guard accepted an invalid dependency graph")
    if errors:
        print("\n".join(errors),file=sys.stderr)
        return 1
    print("PASS: 96 recipes; 352 scenarios; 26 packages / 39 slices; independent CORE DAG; 105 source bindings; 16 blueprints / 4 forms / 3 candidate schemas; exact source semantic coverage; no activation or runtime claims.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
