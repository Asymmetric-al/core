#!/usr/bin/env python3
"""Verify the proposed planning correction without network access or tracker writes."""
import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
PROPOSAL = HERE.parent / 'implementation-proposal'
PUBLICATION = HERE.parent / 'implementation-publication'
SPEC = ROOT / 'docs/prds/sitestacker-parity/phase-27-donor-development'


def load(path):
    return json.loads(path.read_text())


def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()


def normalized(text):
    return re.sub(r'\s+', ' ', text).strip()


def cases(body):
    matches = list(re.finditer(r'^### (AC27-[A-Z]\d+-\d+)\n.*?(?=^### |^## |\Z)', body, re.M | re.S))
    assert len(matches) == len({m[1] for m in matches}), 'Duplicate full acceptance heading'
    return {m[1]: normalized(m[0]) for m in matches}


def edge_key(edge):
    return edge['from'], edge['to']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Explicitly regenerate the stored verification result')
    args = parser.parse_args()
    correction = load(HERE / 'corrections.json')
    baseline_rows = load(HERE / 'baseline.json')['issues']
    baselines = {row['key']: row for row in baseline_rows}
    published = {row['key']: row for row in load(PUBLICATION / 'issues.json')}
    original = {row['id']: row for row in load(PROPOSAL / 'tickets.json')}
    tickets = {row['id']: row for row in load(HERE / 'tickets.json')}
    coverage = load(HERE / 'coverage.json')
    original_coverage = load(PROPOSAL / 'coverage.json')
    dependencies = load(HERE / 'dependencies.json')
    original_dependencies = load(PROPOSAL / 'dependencies.json')
    edits = load(HERE / 'body-edits.json')
    operations = {row['key']: row for row in correction['body_drafts']}
    moves = correction['moves']
    assert correction['status'] == 'proposed_correction_requires_user_review'
    assert len(tickets) == 68 and set(tickets) == set(original) == set(published)
    assert len(moves) == 23 and len({row['acceptance_id'] for row in moves}) == 23
    assert len(operations) == 25 and set(operations) == set(baselines) == set(edits)
    assert correction['remove_edges'] == []
    assert [(e['from'], e['to']) for e in correction['add_edges']] == [('P27-F12', 'P27-F23')]
    old_edges = {edge_key(e): e for kind in ['internal', 'existing_issue'] for e in original_dependencies[kind]}
    new_edges = {edge_key(e): e for kind in ['internal', 'existing_issue'] for e in dependencies[kind]}
    assert len(old_edges) == 139 and len(new_edges) == 140
    assert set(new_edges) - set(old_edges) == {('P27-F12', 'P27-F23')}
    assert all(new_edges[k] == e for k, e in old_edges.items()), 'Existing edge or contract altered'
    assert new_edges[('P27-F12', 'P27-F23')] == correction['add_edges'][0]
    assert dependencies['source_frontier'] == original_dependencies['source_frontier']
    for key in ['qualification_inputs', 'specification_integration', 'parent_hierarchy', 'existing_issue']:
        assert dependencies[key] == original_dependencies[key], key
    parents = {key: set() for key in tickets}
    for edge in dependencies['internal']:
        assert edge['from'] in tickets and edge['to'] in tickets
        parents[edge['to']].add(edge['from'])
    position = {key: n for n, key in enumerate(dependencies['topological_order'])}
    assert set(position) == set(tickets) and len(position) == 68
    assert dependencies['topological_order'] == original_dependencies['topological_order']
    assert all(position[e['from']] < position[e['to']] for e in dependencies['internal']), 'Cycle or invalid order'

    def closure(key):
        result = {key}
        for parent in parents[key]:
            result.update(closure(parent))
        return result

    expected_owners = dict(original_coverage['primary_acceptance'])
    for move in moves:
        ac = move['acceptance_id']
        assert expected_owners[ac] == move['from']
        expected_owners[ac] = move['to']
        assert set(move['required_producers']) <= closure(move['to']), ac
        assert move['corrected_owner_producer_closure'] == sorted(closure(move['to'])), ac
        source = move['normative_source']
        assert not Path(source['path']).is_absolute()
        source_text = (ROOT / source['path']).read_text()
        assert source['text'] in source_text, f'{ac}: canonical text drift'
        assert source['url'].endswith(source['path'] + '#L' + str(source['line']))
        assert source['text'].splitlines()[0] == source_text.splitlines()[source['line'] - 1]
        for req in move['requirements']:
            assert req in tickets[move['to']]['requirements']
            assert move['to'] in coverage['requirements'][req]
    retained = correction['retained_case_fixed_by_added_edge']
    assert retained['missing_producer'] in closure(retained['owner'])
    assert expected_owners[retained['acceptance_id']] == retained['owner']
    owners = {}
    for key, ticket in tickets.items():
        assert ticket['title'] == original[key]['title']
        for field in ['proposed_parent', 'proposed_labels', 'monitor_ids', 'prerequisites', 'non_goals', 'commands', 'constraints', 'adrs']:
            assert ticket[field] == original[key][field], (key, field)
        assert len(ticket['acceptance_ids']) == len(set(ticket['acceptance_ids']))
        for ac in ticket['acceptance_ids']:
            assert ac not in owners, ac
            owners[ac] = key
        assert {(b['id'], key) for b in ticket['blockers']} == {e for e in new_edges if e[1] == key}, key
    assert len(owners) == 711 and owners == expected_owners == coverage['primary_acceptance']
    assert {ac for ac in owners if owners[ac] != original_coverage['primary_acceptance'][ac]} == {m['acceptance_id'] for m in moves}
    assert coverage['counts'] == original_coverage['counts']
    assert len(coverage['requirements']) == 193 and len(coverage['stories']) == 193
    assert len(coverage['monitors']) == 141 and len(coverage['open_spec_tasks']) == 204
    assert coverage['monitors'] == original_coverage['monitors']
    assert coverage['open_spec_tasks'] == original_coverage['open_spec_tasks']
    for story in load(SPEC / 'stories.json'):
        assert coverage['stories'][story['id']] == sorted({owners[ac] for ac in story['acceptance']})
    for req, contributors in coverage['requirements'].items():
        assert sorted(contributors) == sorted(key for key, ticket in tickets.items() if req in ticket['requirements']), req
    bodies = {}
    before_cases = {}
    for key, row in baselines.items():
        operation = operations[key]
        before = row['body']
        assert row['before_body_sha256'] == sha(before) == published[key]['current_body_sha256'] == operation['before_body_sha256']
        assert row['number'] == published[key]['number'] == operation['number']
        assert row['url'] == published[key]['url'] == operation['url']
        assert operation['path'] == 'issues/' + key + '.md'
        body = (HERE / operation['path']).read_text()
        bodies[key] = body
        assert operation['proposed_body_sha256'] == sha(body), key
        assert len(body.encode()) < 65536 and len(body) < 65536, key
        assert 'Implementation ticket. Plan key:' in body
        reconstructed = before
        for change in edits[key]:
            assert reconstructed.count(change['before']) == 1, (key, 'ambiguous edit')
            reconstructed = reconstructed.replace(change['before'], change['after'], 1)
        assert normalized(body) == normalized(reconstructed), (key, 'unrecorded unrelated change')
        body_cases = cases(body)
        before_cases[key] = cases(before)
        assert set(body_cases) == set(tickets[key]['acceptance_ids']), key
        assert len(before_cases[key]) == operation['primary_cases_before'] == len(original[key]['acceptance_ids'])
        assert len(body_cases) == operation['primary_cases_after']
        assert f'Primary acceptance ownership: {len(body_cases)} exact source cases' in body
        for ac in set(body_cases) & set(before_cases[key]):
            assert body_cases[ac] == before_cases[key][ac], (key, ac, 'retained text altered')
        # Preserve exact parent, operational controls, prerequisites, implementation and delivery boundaries.
        for section in ['Parent', 'Operational controls', 'Implementation constraints', 'Delivery boundary']:
            pattern = r'^## ' + re.escape(section) + r'\n.*?(?=^## |\Z)'
            old_section = re.search(pattern, before, re.M | re.S)[0]
            new_section = re.search(pattern, body, re.M | re.S)[0]
            if section == 'Implementation constraints':
                old_section = re.sub(r'assigned_acceptance_text_tokens_approx: \d+; estimated_total_input_tokens: \d+', '<derived context estimate>', old_section)
                new_section = re.sub(r'assigned_acceptance_text_tokens_approx: \d+; estimated_total_input_tokens: \d+', '<derived context estimate>', new_section)
            assert normalized(old_section) == normalized(new_section), (key, section)
        old_prerequisites = re.search(r'^### Non-issue prerequisites\n.*?(?=^## |\Z)', before, re.M | re.S)[0]
        new_prerequisites = re.search(r'^### Non-issue prerequisites\n.*?(?=^## |\Z)', body, re.M | re.S)[0]
        assert normalized(old_prerequisites) == normalized(new_prerequisites), key
    for move in moves:
        ac = move['acceptance_id']
        source = bodies[move['from']]
        destination = bodies[move['to']]
        assert ac not in cases(source)
        assert cases(destination)[ac] == before_cases[move['from']][ac], (ac, 'transferred full text altered')
        assert re.search(r'^- \[ \] ' + re.escape(ac) + ':', destination, re.M), ac
        assert '## Additional complete-proof handoffs' in source and f'`{ac}` →' in source
        assert move['to_issue'] in source and 'independently passing evidence for its own behavior' in source
        for req in move['requirements']:
            assert re.search(r'^- \[' + req + r'\]\(https://github.com/Asymmetric-al/core/blob/', destination, re.M), (ac, req)
        for story in move['story_references']:
            assert f'[{story}](' in destination, (ac, story)
    assert '**#1996**:' in bodies['P27-F23'] and operations['P27-F23']['number'] == 2026
    assert len(cases(bodies['P27-Q03'])) == 29 and len(before_cases['P27-Q03']) == 25
    for path in HERE.rglob('*'):
        if path.is_file() and path.suffix in ['.json', '.md']:
            assert '/tmp/' not in path.read_text() and '/workspace/' not in path.read_text(), str(path)
    result = {
        'status': 'PASS',
        'scope': 'Proposed planning consistency only; no remote corrections applied and no runtime qualification claimed.',
        'tickets': 68,
        'unique_primary_acceptance': 711,
        'primary_owner_transfers': 23,
        'affected_complete_body_drafts': 25,
        'published_direct_edges': 139,
        'proposed_direct_edges': 140,
        'added_edge': {'from': 'P27-F12', 'from_issue': 1996, 'to': 'P27-F23', 'to_issue': 2026},
        'requirements': 193,
        'stories': 193,
        'monitors': 141,
        'open_spec_tasks': 204,
        'baseline_hashes_match_published_index': True,
        'all_transferred_source_text_preserved': True,
        'unrelated_body_content_preserved': True,
        'required_producer_closure_verified': True,
        'acyclic_and_existing_order_valid': True,
        'source_frontier_unchanged': dependencies['source_frontier'],
        'q03_primary_cases_before': 25,
        'q03_primary_cases_after': 29,
        'q03_body_utf8_bytes': len(bodies['P27-Q03'].encode()),
        'largest_body_utf8_bytes': max(len(body.encode()) for body in bodies.values()),
        'body_size_limit_bytes': 65536,
    }
    if args.write:
        (HERE / 'verification.json').write_text(json.dumps(result, indent=2) + '\n')
    else:
        assert load(HERE / 'verification.json') == result, 'Stored verification differs; inspect the change before explicit --write regeneration'
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
