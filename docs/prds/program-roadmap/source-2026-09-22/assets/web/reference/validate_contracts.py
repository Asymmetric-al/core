"""Research reference validator, NOT Core runtime authorization or a Payload adapter.

Requires jsonschema. Owner-level semantic/prose/settings/reference validators must
be integrated in Core; this module deliberately validates only structural rules.
"""
from __future__ import annotations
from copy import deepcopy
from dataclasses import dataclass, field
import hashlib
import json
from pathlib import Path
from typing import Any, Mapping
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SEMANTIC_TYPES = {'hero','rich-text','media','gallery','cta','cards','faq','quote','impact-statistics','content-list'}
ARTICLE_TYPES = {'rich-text','media','gallery','quote','cta'}

class ContractError(ValueError):
    """A reference structural or state contract is violated."""

def canonical_bytes(value: Any) -> bytes:
    # A deterministic reference JSON encoding, not a substitute for D1's qualified canonicalizer.
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False).encode('utf-8')

def validate_schema(name: str, value: Any) -> None:
    path = ROOT / 'schemas' / name
    schema = json.loads(path.read_text(encoding='utf-8'))
    Draft202012Validator.check_schema(schema)
    errors = sorted(Draft202012Validator(schema).iter_errors(value), key=lambda e: str(list(e.path)))
    if errors:
        first = errors[0]
        raise ContractError(f'{name}: {list(first.path)}: {first.message}')

def validate_composition(document: Mapping[str, Any], *, publishing: bool = False,
                         expanded_reuse_counts: Mapping[str, int] | None = None) -> None:
    """Check envelope and proposed grammar; NOT exact semantic completeness/auth.

    Publishing here checks container completeness only. It cannot certify the
    referenced records, content values, package settings, prose or live safety.
    Supplied reuse counts are test inputs, not authoritative usage evidence.
    """
    validate_schema('composition.schema.json', document)
    if document['profile'] == 'asym.page-composition/2' and len(canonical_bytes(document)) > 512 * 1024:
        raise ContractError('canonical document exceeds 512 KiB')
    if document['family'] == 'article' and document['profile'] != 'asym.page-composition/1':
        raise ContractError('Article retains v1 profile')
    seen: set[str] = set()
    total = 0
    hero_count = 0

    def walk(node: Mapping[str, Any], parent: str, depth: int, root_index: int = -1) -> None:
        nonlocal total, hero_count
        ident = node['instanceId']
        if ident in seen:
            raise ContractError('duplicate instance identity')
        seen.add(ident)
        total += 1
        kind = node['kind']
        if kind == 'semantic':
            if node['semanticType'] not in SEMANTIC_TYPES:
                raise ContractError('unregistered semantic type')
            if node['schemaVersion'] != 1:
                raise ContractError('reference fixtures admit semantic version 1 only')
            if document['family'] == 'article' and node['semanticType'] not in ARTICLE_TYPES:
                raise ContractError('semantic type excluded from reference Article profile')
            if node['semanticType'] == 'hero':
                hero_count += 1
                if parent != 'root' or root_index != 0 or hero_count > 1:
                    raise ContractError('Hero is root-first and singular')
            return
        if kind == 'reusable':
            if parent != 'root':
                raise ContractError('reuse must be root-only')
            if expanded_reuse_counts is None or node['revisionId'] not in expanded_reuse_counts:
                if publishing:
                    raise ContractError('publish structural test requires exact reuse expansion count')
            else:
                count = expanded_reuse_counts[node['revisionId']]
                if not isinstance(count, int) or isinstance(count, bool) or count < 1:
                    raise ContractError('invalid reuse expansion count')
                # Count the reference plus the fully expanded source nodes conservatively.
                total += count
            return
        if document['profile'] != 'asym.page-composition/2' or document['family'] != 'page':
            raise ContractError('layout requires Page v2')
        new_depth = depth + 1
        if new_depth > 2:
            raise ContractError('more than two container levels')
        typ = node['layoutType']
        allowed_parents = {'stack': {'root','split'}, 'split': {'root','stack'}, 'grid': {'root','stack'}}
        if parent not in allowed_parents[typ]:
            raise ContractError(f'illegal {typ} parent {parent}')
        for slot_nodes in node['slots'].values():
            if publishing and not slot_nodes:
                raise ContractError('empty layout slot is incomplete for publication')
            if typ == 'split':
                nested = [x for x in slot_nodes if x['kind'] == 'layout']
                if nested and (len(slot_nodes) != 1 or len(nested) != 1 or nested[0]['layoutType'] != 'stack'):
                    raise ContractError('split slot accepts leaves or one Stack, not a mixture')
            for child in slot_nodes:
                if typ == 'grid' and child['kind'] != 'semantic':
                    raise ContractError('Grid accepts semantic leaves only')
                if typ == 'stack' and depth > 0 and child['kind'] == 'layout':
                    raise ContractError('nested Stack has leaves only')
                walk(child, typ, new_depth)

    for idx, node in enumerate(document['nodes']):
        walk(node, 'root', 0, idx)
    if document['profile'] == 'asym.page-composition/2' and total > 128:
        raise ContractError('expanded node count exceeds 128')

@dataclass
class SaveModel:
    """In-memory example of semantics, NOT persistence/RLS/concurrency proof."""
    revision: int = 1
    lease_generation: int = 1
    content: dict[str, Any] = field(default_factory=dict)
    receipts: dict[str, tuple[str, int]] = field(default_factory=dict)

    def save(self, request_id: str, expected: int, lease: int, content: dict[str, Any],
             *, authorized: bool = True, inject_before_commit_failure: bool = False) -> int:
        if not authorized:
            raise ContractError('not authorized')
        fingerprint = hashlib.sha256(canonical_bytes({'expected': expected, 'lease': lease, 'content': content})).hexdigest()
        if request_id in self.receipts:
            prior_fingerprint, prior_revision = self.receipts[request_id]
            if prior_fingerprint != fingerprint:
                raise ContractError('idempotency key reused for different request')
            return prior_revision
        if expected != self.revision or lease != self.lease_generation:
            raise ContractError('stale revision or lease')
        if inject_before_commit_failure:
            raise ContractError('simulated transaction failed before commit')
        self.content = deepcopy(content)
        self.revision += 1
        self.receipts[request_id] = (fingerprint, self.revision)
        return self.revision

    def take_over(self) -> None:
        self.lease_generation += 1

    def fixed_candidate(self) -> dict[str, Any]:
        return {'revision': self.revision, 'content': deepcopy(self.content)}
