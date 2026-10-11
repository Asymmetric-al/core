"""Deterministic verification of the Phase 27 publication receipt (no network calls)."""
import collections
import hashlib
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
PROPOSAL = HERE.parent / 'implementation-proposal'
load = lambda p: json.loads(p.read_text())
sha = lambda raw: hashlib.sha256(raw).hexdigest()
issues = load(HERE / 'issues.json')
graph = load(HERE / 'dependencies.json')
coverage = load(HERE / 'coverage.json')
verification = load(HERE / 'verification.json')
ledger = load(HERE / 'ledger.json')
audit = load(HERE / 'audit.json')
tickets = load(PROPOSAL / 'tickets.json')
approved_graph = load(PROPOSAL / 'dependencies.json')
approved_coverage = load(PROPOSAL / 'coverage.json')
bykey = {t['id']: t for t in tickets}
byissuekey = {i['key']: i for i in issues}
assert len(issues) == len(byissuekey) == 68
assert set(byissuekey) == set(bykey) == set(ledger['issues'])
assert len({i['number'] for i in issues}) == len({i['url'] for i in issues}) == 68
assert verification['specification_commit'] == 'b5a65b3f2da880fcbfa4b3cae189d216d06542be'
assert verification['proposal_commit'] == '057a1dc43832eeeca2a8856716d6be1d5422e96f'
assert verification['status'] == 'published_verified' and verification['result'] == 'PASS'
assert audit['result'] == 'PASS' and not audit['errors'] and all(c['pass'] for c in audit['checks'])
assert ledger['status'] in ['published_verified', 'complete']
assert all(op['state'] == 'confirmed' or
           (op['state'] == 'confirmed_not_applied' and op.get('resolution') and op.get('resolved_at'))
           for op in ledger['operations'])
for name, digest in verification['approved_source_sha256'].items():
    assert sha((PROPOSAL / name).read_bytes()) == digest, ('Approved source drift', name)
assert verification['source_audit_sha256'] == audit['source_audit_sha256']
assert verification['source_ledger_sha256'] == ledger['source_ledger_sha256']
for digest in [verification['source_audit_sha256'], verification['source_ledger_sha256'],
               audit['protected_parent_snapshot_sha256']]:
    assert re.fullmatch(r'[0-9a-f]{64}', digest)

mapping = {key: row['url'] for key, row in byissuekey.items()}
def resolve(value):
    if value in mapping:
        return mapping[value]
    if re.fullmatch(r'#\d+', value):
        return 'https://github.com/Asymmetric-al/core/issues/' + value[1:]
    return value

def translate(value, keys=False):
    if isinstance(value, str):
        return resolve(value)
    if isinstance(value, list):
        return [translate(v, keys) for v in value]
    if isinstance(value, dict):
        return {resolve(k) if keys else k: translate(v, keys) for k, v in value.items()}
    return value

assert coverage == translate(approved_coverage), 'Coverage is not the exact approved translation'
for name, value in approved_graph.items():
    assert graph[name] == translate(value, keys=True), ('Graph drift', name)
counts = {'tickets': 68, 'phase27_children': 67, 'phase9_enablers': 1, 'requirements': 193,
          'stories': 193, 'acceptance': 711, 'monitors': 141, 'open_spec_tasks': 204}
assert coverage['counts'] == verification['counts'] == counts
assert len(coverage['requirements']) == 193 and len(coverage['stories']) == 193
assert len(coverage['primary_acceptance']) == 711 and len(coverage['monitors']) == 141
assert len(coverage['open_spec_tasks']) == 204
assert collections.Counter(i['parent'] for i in issues) == {1992: 67, 604: 1}
assert byissuekey['P27-S01']['parent'] == 604
owned = {}
for row in issues:
    ticket = bykey[row['key']]
    assert row['url'] == f"https://github.com/Asymmetric-al/core/issues/{row['number']}"
    assert row['title'] == f"AL-{row['number']}: {ticket['title']} ({row['key']})"
    assert row['delivers'] == ticket['delivers']
    assert row['parent'] == ticket['proposed_parent']
    assert row['state'] == 'open' and row['assignees'] == []
    assert row['labels'] == sorted(ticket['proposed_labels']) and 'status:blocked' in row['labels']
    assert row['body_finalized'] and row['parent_verified']
    for category in ['type:', 'status:', 'complexity:']:
        assert len([label for label in row['labels'] if label.startswith(category)]) == 1
    for field in ['created_body_sha256', 'current_body_sha256']:
        assert re.fullmatch(r'[0-9a-f]{64}', row[field])
        assert ledger['issues'][row['key']][field] == row[field]
    assert row['direct_blockers'] == [dict(b, url=resolve(b['id'])) for b in ticket['blockers']]
    assert row['verified_blockers'] == sorted(int(b['url'].rsplit('/', 1)[1]) for b in row['direct_blockers'])
    assert row['requirements'] == ticket['requirements'] and row['story_ids'] == ticket['story_ids']
    assert row['primary_acceptance_ids'] == ticket['acceptance_ids'] and row['monitor_ids'] == ticket['monitor_ids']
    assert row['prerequisites'] == translate(ticket['prerequisites'])
    for ac in row['primary_acceptance_ids']:
        assert ac not in owned, ('Duplicate primary AC', ac)
        owned[ac] = row['url']
assert owned == coverage['primary_acceptance']
assert [row['url'] for row in issues] == graph['topological_order']
assert len(graph['internal']) == 123 and len(graph['existing_issue']) == 16
edges = graph['internal'] + graph['existing_issue']
assert len({(e['from'], e['to']) for e in edges}) == verification['direct_edges'] == 139
assert graph['counts'] == {'internal_edges': 123, 'existing_issue_edges': 16, 'actual_direct_edges': 139}
seen = set()
for url in graph['topological_order']:
    assert url not in seen
    assert all(e['from'] in seen for e in graph['internal'] if e['to'] == url), ('Cycle/order', url)
    seen.add(url)
assert seen == set(mapping.values())
assert {i['key'] for i in issues if not any(e['to'] == i['url'] for e in graph['internal'])} == {
    'P27-A01', 'P27-C04', 'P27-F12', 'P27-P14', 'P27-S01'}
assert len(ledger['amendments']) == verification['predecessor_amendments'] == 15
assert {a['number'] for a in ledger['amendments']} == {
    492, 607, 610, 617, 618, 620, 622, 625, 702, 703, 763, 764, 773, 780, 897}
for amendment in ledger['amendments']:
    assert amendment['verified_at'] and amendment['protected_metadata_unchanged'] and amendment['comments_unchanged']
    assert amendment['url'] == f"https://github.com/Asymmetric-al/core/issues/{amendment['number']}"
    if amendment['number'] == 702:
        fields = ['recovery_note', 'protected_metadata_verification', 'dependency_verification', 'current_blocked_by']
        assert all(amendment.get(field) for field in fields[:3])
        assert isinstance(amendment['current_blocked_by'], list)
        assert {field: amendment[field] for field in fields} == audit['existing_issue_evidence_limits']['702']
        assert audit['existing_issue_evidence_limits'] == verification['existing_issue_evidence_limits']
    else:
        assert isinstance(amendment['blocked_by_unchanged'], list)
    for name in ['before_body_sha256', 'after_body_sha256']:
        assert re.fullmatch(r'[0-9a-f]{64}', amendment[name])
readme = (HERE / 'README.md').read_text()
assert all(row['url'] in readme and row['delivers'] in readme for row in issues)
mermaid = (HERE / 'graph.md').read_text()
actual_edges = {(int(a), int(b)) for a, b in re.findall(r'^\s*I(\d+) --> I(\d+)$', mermaid, re.M)}
assert actual_edges == {(int(e['from'].rsplit('/', 1)[1]), int(e['to'].rsplit('/', 1)[1])) for e in edges}
print(json.dumps({'result': 'PASS', 'counts': counts, 'direct_edges': 139,
                  'predecessor_amendments': 15, 'publication_status': 'published_verified',
                  'runtime_status': 'not implemented or qualified',
                  'verification_scope': 'local reconstruction of dated independent remote audit'}, indent=2))
