"""Structural verification of the preserved Phase 27 issue proposal snapshot."""
import collections
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'AGENTS.md').is_file())
SPEC = ROOT / 'docs/prds/sitestacker-parity/phase-27-donor-development'
load = lambda p: json.loads(p.read_text())
tickets = load(HERE / 'tickets.json')
coverage = load(HERE / 'coverage.json')
graph = load(HERE / 'dependencies.json')
trace = load(SPEC / 'traceability.json')
stories = load(SPEC / 'stories.json')
monitors = load(SPEC / 'monitors.json')
byid = {t['id']: t for t in tickets}
assert len(byid) == len(tickets), 'Duplicate proposed ticket'

owned = collections.defaultdict(list)
for t in tickets:
    for ac in t['acceptance_ids']:
        owned[ac].append(t['id'])
    body = (HERE / 'issues' / (t['id'] + '.md')).read_text()
    assert len(body) < 65536, ('GitHub issue body limit', t['id'], len(body))
    for section in ['Parent', 'Source of truth', 'What to build', 'Acceptance criteria',
                    'Testing and verification', 'Blocked by', 'Implementation constraints']:
        assert f'## {section}\n' in body, (t['id'], section)
    assert t['specification_commit'] in body and t['documentation_pr'] in body
    assert all(ac in body for ac in t['acceptance_ids'])
    for category in ['type:', 'status:', 'complexity:']:
        assert len([x for x in t['proposed_labels'] if x.startswith(category)]) == 1
    assert 'status:blocked' in t['proposed_labels']
    for b in t['blockers']:
        assert b['id'] in byid or re.fullmatch(r'#\d+', b['id']), (t['id'], b)
        assert b['contract'] and b['reason']
    assert t['proposed_parent'] in [604, 1992]

assert set(owned) == set(trace['acceptance']), 'Missing or invented AC'
assert all(len(v) == 1 for v in owned.values()), 'Overlapping primary AC ownership'
assert {k: v[0] for k, v in owned.items()} == coverage['primary_acceptance']
for requirement in trace['requirements']:
    expected = sorted(t['id'] for t in tickets if requirement in t['requirements'])
    assert expected and coverage['requirements'][requirement] == expected
for story in stories:
    assert coverage['stories'][story['id']] == sorted({owned[a][0] for a in story['acceptance']})
for monitor in monitors:
    row = coverage['monitors'][monitor['id']]
    assert all(row[k] == v for k, v in monitor.items()), monitor['id']
    assert row['producer_tickets'] and all(t in byid for t in row['producer_tickets'])

expected_internal = {(b['id'], t['id']) for t in tickets for b in t['blockers'] if b['id'] in byid}
expected_external = {(b['id'], t['id']) for t in tickets for b in t['blockers'] if b['id'] not in byid}
assert expected_internal == {(e['from'], e['to']) for e in graph['internal']}
assert expected_external == {(e['from'], e['to']) for e in graph['existing_issue']}
seen = set()
for k in graph['topological_order']:
    assert k in byid and k not in seen
    assert all(b['id'] in seen for b in byid[k]['blockers'] if b['id'] in byid), ('Cycle/order', k)
    seen.add(k)
assert seen == set(byid)
assert all(n <= 100 for n in collections.Counter(t['proposed_parent'] for t in tickets).values())
tasks = re.findall(r'^- \[ \] (\d+\.\d+) ', (ROOT / 'openspec/changes/add-donor-development/tasks.md').read_text(), re.M)
assert set(tasks) == set(coverage['open_spec_tasks']) and len(tasks) == 204
assert all(x['tickets'] and all(t in byid for t in x['tickets']) for x in coverage['open_spec_tasks'].values())
assert not re.search(r'root (?:proposal must|resolves)|resolved by root|OWNER-P12-EXACT',
                     '\n'.join((HERE / 'issues' / (t['id'] + '.md')).read_text() for t in tickets), re.I)
print(json.dumps({'result': 'PASS', 'counts': coverage['counts'],
                  'runtime_status': 'not implemented or qualified',
                  'snapshot_status': 'approved proposal; earlier capture was unpublished',
                  'current_publication_record': '../implementation-publication/README.md'}, indent=2))
