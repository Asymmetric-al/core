"""Validate specification fixtures, not Core runtime behavior.

Uses the separately installed jsonschema package. This verification helper is not
an application dependency and does not add dependencies to Core.
"""
from __future__ import annotations

import copy
import importlib.metadata
import json
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
RESULTS: list[dict[str, str]] = []

def load(relative: str) -> dict:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))

def check(name: str, fn) -> None:
    try:
        fn()
        RESULTS.append({"name": name, "status": "passed"})
    except Exception as exc:
        RESULTS.append({"name": name, "status": "failed", "detail": str(exc)[:1200]})

def reject(validator: Draft202012Validator, document: dict) -> None:
    if validator.is_valid(document):
        raise AssertionError("Invalid fixture was accepted")

validators = {}
for name in ("workflow", "form", "operation-result"):
    schema = load(f"contracts/{name}.schema.json")
    check(f"{name}: JSON Schema 2020-12 meta-validation", lambda s=schema: Draft202012Validator.check_schema(s))
    validators[name] = Draft202012Validator(schema)
for folder, schema_name in (("blueprints", "workflow"), ("form-blueprints", "form")):
    for path in sorted((ROOT / folder).glob("*.json")):
        doc = json.loads(path.read_text(encoding="utf-8"))
        check(f"{path.name}: structural schema", lambda d=doc, v=validators[schema_name]: v.validate(d))

bad = load("blueprints/BP-01.json"); bad["defaultEnabled"] = True
check("Negative schema: default-enabled workflow", lambda: reject(validators["workflow"], bad))
bad_unknown = load("blueprints/BP-01.json"); bad_unknown["arbitraryScript"] = "not_executable"
check("Negative schema: unknown executable property", lambda: reject(validators["workflow"], bad_unknown))
bad_form = load("form-blueprints/FORM-01.json"); bad_form["pages"][0]["fields"][0]["mapping"]["sql"] = "not_executable"
check("Negative schema: raw form mapping property", lambda: reject(validators["form"], bad_form))

base = {"schemaVersion": 1, "operationId": "00000000-0000-4000-8000-000000000001", "fence": 1, "state": "outcome_unknown", "retrySafe": False}
# Inspect the accepted contract instead of assuming reason fields are optional.
required = validators["operation-result"].schema.get("required", [])
if "safeReasonCode" in required:
    base["safeReasonCode"] = "provider_outcome_unknown"
check("Operation result: valid uncertain non-retryable outcome", lambda: validators["operation-result"].validate(base))
bad_retry = copy.deepcopy(base); bad_retry["retrySafe"] = True
check("Negative schema: uncertain outcome cannot be retry-safe", lambda: reject(validators["operation-result"], bad_retry))
bad_confirm = copy.deepcopy(base); bad_confirm["state"] = "confirmed"
check("Negative schema: confirmed outcome requires source evidence", lambda: reject(validators["operation-result"], bad_confirm))

report = {"kind": "specification-json-schema-validation", "scope": "Structural fixtures and negative schema cases only; not source binding or production execution", "jsonschemaVersion": importlib.metadata.version("jsonschema"), "checks": len(RESULTS), "passed": sum(x["status"] == "passed" for x in RESULTS), "failed": sum(x["status"] == "failed" for x in RESULTS), "results": RESULTS}
(ROOT / "verification/schema-results.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
raise SystemExit(1 if report["failed"] else 0)
