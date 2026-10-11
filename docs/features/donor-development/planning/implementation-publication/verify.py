"""Deterministic verification of the Phase 27 publication receipt (no network calls)."""
import collections
import datetime
import hashlib
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
PROPOSAL = HERE.parent / 'implementation-proposal'
load = lambda p: json.loads(p.read_text())
sha = lambda raw: hashlib.sha256(raw).hexdigest()
canonical_sha = lambda value: sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())
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
assert audit['result'] == 'PASS' and not audit['errors']
assert all(c['pass'] is True for c in audit['checks']), 'Audit contains a nonpassing check'
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
edges = graph['internal'] + graph['existing_issue']
edge_counts = {'internal_edges': len(graph['internal']), 'existing_issue_edges': len(graph['existing_issue']),
               'actual_direct_edges': len(edges)}
assert len({(e['from'], e['to']) for e in edges}) == verification['direct_edges'] == len(edges)
assert graph['counts'] == edge_counts
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
# This is the independent publication-audit protocol, derived from the approved
# issue set and required evidence categories, not from whichever checks remain in
# audit.json. Counts and PASS flags alone cannot prove that its inventory is intact.
issue_checks = (
    'database ID', 'exact approved labels', 'open/blocked/unassigned', 'native parent',
    'exact native direct blockers', 'finalized body exact hash', 'full acceptance references',
    'exact specification and PR', 'draft marker removed', 'bounded full issue body', 'title final',
)
parent_checks = ('exact native children', 'native child limit', 'acyclic parent ancestry',
                 'subissue nesting limit')
amendment_checks = ('amendment ledger/raw evidence present', 'approved amendment current exact body',
                    'amendment source exact hash', 'predecessor comments remain0')
protected_parent_check = 'Parent1992protectedfieldsand42commentsunchanged'
required_checks = {
    f'Exact{len(tickets)}planIDs', f'Unique{len(tickets)}issueNumbers',
    'Native dependency closure acyclic', protected_parent_check,
    f"Exact{len(ledger['amendments'])}scopedexistingissueamendments",
}
required_checks.update(f'{key} {name}' for key in bykey for name in issue_checks)
required_checks.update(f'{parent} {name}' for parent in {t['proposed_parent'] for t in tickets}
                       for name in parent_checks)
for amendment in ledger['amendments']:
    number = amendment['number']
    required_checks.update(f'{number} {name}' for name in amendment_checks)
    if number == 702:
        names = ('known prewrite metadata unchanged', 'accepted body-only request',
                 'accepted response metadata preserved through recovery',
                 'native dependency operation scope and current readback')
    else:
        names = ('protected metadata unchanged', 'predecessor native blockers unchanged')
    required_checks.update(f'{number} {name}' for name in names)
checks_by_name = {check['check']: check for check in audit['checks']}
assert len(checks_by_name) == len(audit['checks']), 'Duplicate audit checks'
assert set(checks_by_name) == required_checks, (
    'Incomplete audit inventory', sorted(required_checks - set(checks_by_name)),
    sorted(set(checks_by_name) - required_checks))
expected_audit_counts = {
    'tickets': len(tickets), 'phase27_children': sum(t['proposed_parent'] == 1992 for t in tickets),
    'phase9_children': sum(t['proposed_parent'] == 604 for t in tickets), **edge_counts,
    'scoped_existing_amendments': len(ledger['amendments']), 'checks': len(required_checks), 'failures': 0,
}
assert audit['counts'] == expected_audit_counts, 'Audit counts disagree with its required evidence'
assert audit['protected_parent_comments_count'] == 42
assert checks_by_name[protected_parent_check]['detail'] == {'comments': 42, 'different_fields': []}
for parent in {t['proposed_parent'] for t in tickets}:
    children = sorted(row['number'] for row in issues if row['parent'] == parent)
    assert checks_by_name[f'{parent} exact native children']['detail'] == {
        'actual': children, 'expected': children}
for row in issues:
    key = row['key']
    assert checks_by_name[f'{key} exact approved labels']['detail'] == row['labels']
    assert checks_by_name[f'{key} native parent']['detail'] == row['parent']
    assert checks_by_name[f'{key} exact native direct blockers']['detail'] == {
        'expected': row['verified_blockers'], 'actual': row['verified_blockers']}
    bounds = checks_by_name[f'{key} bounded full issue body']['detail']
    assert 0 < bounds['characters'] <= bounds['bytes'] < 65536
    receipt = ledger['issues'][key]
    assert receipt == {name: row[name] for name in (
        'number', 'url', 'database_id', 'node_id', 'created_at', 'created_body_sha256',
        'current_body_sha256', 'parent', 'body_finalized', 'parent_verified', 'verified_blockers')}, (
            'Issue receipt disagrees with independently read-back index', key)

# Independently reconstruct the recorded native closure; preserve existing-owner
# dependencies beyond the new issue graph instead of treating them as absent.
closure = audit['native_dependency_closure']
assert all(re.fullmatch(r'[1-9]\d*', number) for number in closure)
assert {str(row['number']) for row in issues}.issubset(closure), 'Missing audited issue in native closure'
for row in issues:
    assert closure[str(row['number'])] == row['verified_blockers']
for number, blockers in closure.items():
    assert len(blockers) == len(set(blockers))
    assert all(type(blocker) is int and blocker > 0 and str(blocker) in closure for blocker in blockers)
visited, active = set(), set()
def visit(number):
    assert number not in active, ('Cycle in recorded native dependency closure', number)
    if number in visited:
        return
    active.add(number)
    for blocker in closure[number]:
        visit(str(blocker))
    active.remove(number)
    visited.add(number)
for number in closure:
    visit(number)
assert checks_by_name['Native dependency closure acyclic']['detail'] == {
    'nodes': len(closure), 'cycles': []}

# Require a confirmed mutation receipt for every published effect. Extra history
# (for example a verified no-effect attempt or later correction) is retained;
# it cannot replace the successful receipt for a required current operation.
expected_operations = {}
for row in issues:
    key, number, parent = row['key'], row['number'], row['parent']
    expected_operations.update({
        f'create-{key}': ('POST', 'issues'),
        f'finalize-{key}': ('PATCH', f'issues/{number}'),
        f'parent-{key}': ('POST', f'issues/{parent}/sub_issues'),
    })
    for blocker in row['verified_blockers']:
        expected_operations[f'edge-{key}-{blocker}'] = ('POST', f'issues/{number}/dependencies/blocked_by')
for amendment in ledger['amendments']:
    expected_operations[f"amend-{amendment['number']}"] = ('PATCH', f"issues/{amendment['number']}")
confirmed = collections.defaultdict(list)
for operation in ledger['operations']:
    assert re.fullmatch(r'[0-9a-f]{64}', operation['request_sha256'])
    started = datetime.datetime.fromisoformat(operation['started_at'])
    assert started.tzinfo is not None
    if operation['state'] == 'confirmed':
        completed = datetime.datetime.fromisoformat(operation['completed_at'])
        assert completed.tzinfo is not None and completed >= started
        confirmed[operation['key']].append(operation)
    else:
        resolved = datetime.datetime.fromisoformat(operation['resolved_at'])
        assert resolved.tzinfo is not None and resolved >= started
for key, (method, endpoint) in expected_operations.items():
    assert any(op['method'] == method and op['endpoint'] == endpoint for op in confirmed[key]), (
        'Missing confirmed publication operation', key)
for operation in ledger['operations']:
    if operation['state'] == 'confirmed_not_applied':
        assert any(op['method'] == operation['method'] and op['endpoint'] == operation['endpoint']
                   and op['request_sha256'] == operation['request_sha256']
                   and datetime.datetime.fromisoformat(op['started_at']) >=
                   datetime.datetime.fromisoformat(operation['resolved_at'])
                   for op in confirmed[operation['key']]), 'No successful retry receipt after verified no-effect attempt'

# These pins bind the complete, previously read-back receipt payloads, including
# failed-attempt history and qualified #702 detail, across harmless formatting.
# They supplement the semantic inventory; neither can replace independent audit.
assert canonical_sha(audit['checks']) == verification['audit_checks_sha256'], 'Audit check payload drift'
assert canonical_sha(ledger['operations']) == verification['operation_receipts_sha256'], 'Operation receipt payload drift'

readme = (HERE / 'README.md').read_text()
assert all(row['url'] in readme and row['delivers'] in readme for row in issues)
mermaid = (HERE / 'graph.md').read_text()
actual_edges = {(int(a), int(b)) for a, b in re.findall(r'^\s*I(\d+) --> I(\d+)$', mermaid, re.M)}
assert actual_edges == {(int(e['from'].rsplit('/', 1)[1]), int(e['to'].rsplit('/', 1)[1])) for e in edges}
print(json.dumps({'result': 'PASS', 'counts': counts, 'direct_edges': len(edges),
                  'predecessor_amendments': len(ledger['amendments']), 'publication_status': 'published_verified',
                  'runtime_status': 'not implemented or qualified',
                  'verification_scope': 'local reconstruction of dated independent remote audit'}, indent=2))
