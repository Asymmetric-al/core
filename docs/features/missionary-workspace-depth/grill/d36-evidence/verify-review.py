#!/usr/bin/env python3
"""D36 read-only structural/hash/link verifier. Executes no model or prior tool."""
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[5]
GRILL = ROOT / 'docs/features/missionary-workspace-depth/grill'
HERE = GRILL / 'd36-evidence'
MAIN = GRILL / 'phase28-d36-configured-referral-period-adversarial-review.md'
Q36 = GRILL / 'phase28-q36-referral-window-policy-research.md'
SESSION = GRILL / 'phase28-session.md'
CONTEXT = ROOT / 'CONTEXT.md'


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def check_manifest(path):
    data = json.loads(path.read_text())
    if 'artifacts' in data:
        pairs = [(ROOT / row['path'], row['sha256']) for row in data['artifacts']]
    else:
        pairs = [(GRILL / name, value) for name, value in data.items()]
    for target, expected in pairs:
        assert target.is_file(), str(target)
        assert digest(target) == expected, 'hash mismatch: ' + str(target)
    return len(pairs)


main = MAIN.read_text()
assert '**Disposition: Accept with required amendments.**' in main
assert 'amendments below await\nratification' in main
assert 'No Q37 is posed.' in main
assert re.findall(r'^\*\*C(\d{2}) —', main, re.M) == [f'{i:02}' for i in range(1, 25)]
assert re.findall(r'^\| P(\d{2})\s*\|', main, re.M) == [f'{i:02}' for i in range(1, 41)]
assert re.findall(r'^\| F(\d{2}) —', main, re.M) == [f'{i:02}' for i in range(1, 19)]
section = main.split('## Independent review of every requested category', 1)[1].split('## Required acceptance proof', 1)[0]
assert re.findall(r'^\| (\d+)\s*\|', section, re.M) == [str(i) for i in range(1, 23)]
category_rows = [line for line in section.splitlines() if re.match(r'^\| \d+\s*\|', line)]
assert all('**Yes' in line or '**No new material' in line for line in category_rows)
assert '**Q36 is answered A:' in Q36.read_text()
assert '**Q36 is unanswered.**' not in Q36.read_text()
assert '**Q36 is unanswered.**' in (HERE / 'q36-before-answer.txt').read_text()
assert 'All thirty-six review dispositions' in SESSION.read_text()
assert '| D36 (answered Q36)' in SESSION.read_text()
assert '### D36 answer and completed adversarial review' in SESSION.read_text()
assert not re.search(r'^#{1,4} Q37', SESSION.read_text(), re.M)
assert 'Continued referral period** (Phase 28 D36, A selected; amendments await ratification)' in CONTEXT.read_text()
assert 'explicitly ratified on' in (GRILL / 'phase28-d35-referral-continuation-adversarial-review.md').read_text()

prior_counts = {}
for number in range(36, 29, -1):
    path = GRILL / f'd{number}-evidence/prior-evidence-sha256.json'
    prior_counts[f'd{number-1}'] = check_manifest(path)
assert prior_counts['d35'] == 25
pins = check_manifest(HERE / 'artifact-pins.json')
reproduction = json.loads((HERE / 'root-reproduction.json').read_text())
assert reproduction['status'] == 'passed'
assert reproduction['new_model_executions_by_root'] == 1
assert reproduction['byte_identical_author_output']
assert not reproduction['older_models_probes_or_verifiers_executed']
for name, expected in reproduction['frozen_files_sha256'].items():
    assert digest(HERE / name) == expected
result = json.loads((HERE / 'temporal-counterexamples.json').read_text())
assert result['script_sha256'] == digest(HERE / 'temporal-counterexamples.py')
assert result['counts'] == {'counterexample_families': 15, 'positive_controls': 6, 'passed_outcome_assertions': 85}
assert len({row['id'] for row in result['cases']}) == 21
assert result['bounds']['product_default_or_numeric_bounds_selected'] is False

DOCS = [MAIN, Q36, SESSION, CONTEXT] + sorted(HERE.glob('*.md'))
cache = {}

def headings(path):
    if path in cache:
        return cache[path]
    counts = Counter()
    found = set()
    in_fence = False
    for line in path.read_text().splitlines():
        if line.startswith('```'):
            in_fence = not in_fence
        if in_fence:
            continue
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*$', line)
        if not match:
            continue
        title = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', match.group(1)).lower()
        title = re.sub(r'<[^>]*>', '', title).replace(' ', '-')
        slug = ''.join(c for c in title if c in '-_' or unicodedata.category(c)[0] in 'LN')
        ordinal = counts[slug]
        counts[slug] += 1
        found.add(slug if ordinal == 0 else f'{slug}-{ordinal}')
    found.update(re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)', path.read_text()))
    cache[path] = found
    return found

links = line_links = anchor_links = 0
for doc in DOCS:
    text = doc.read_text()
    for dest in re.findall(r'(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)', text):
        dest = dest.strip().strip('<>')
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', dest) or dest.startswith('mailto:'):
            continue
        dest = unquote(dest)
        filepart, _, anchor = dest.partition('#')
        match = re.search(r':(\d+)$', filepart)
        line = int(match.group(1)) if match else None
        if match:
            filepart = filepart[:match.start()]
        target = (doc.parent / filepart).resolve() if filepart else doc
        assert target.is_file(), f'{doc.relative_to(ROOT)} -> missing {dest}'
        links += 1
        if line:
            assert 1 <= line <= len(target.read_text().splitlines()), f'bad line: {dest}'
            line_links += 1
        if anchor:
            assert anchor in headings(target), f'{doc.relative_to(ROOT)} -> missing anchor {dest}'
            anchor_links += 1
    for row in text.splitlines():
        whitespace = re.search(r'[ \t]+$', row)
        assert not whitespace or (whitespace.group() == '  ' and row.strip()), f'trailing whitespace: {doc}'

print(json.dumps({
    'status': 'passed',
    'scope': 'Read-only D36 structure, traceability, local references and hashes; no runtime or model execution.',
    'review': {'categories': 22, 'material_findings': 18, 'required_clauses': 24, 'acceptance_proofs': 40},
    'status_checks': {'q36_answered_a': True, 'd36_amendments_await_ratification': True, 'd35_remains_ratified': True, 'no_q37_posed': True},
    'model_evidence_read_only': result['counts'],
    'local_references': {'documents': len(DOCS), 'links': links, 'line_links': line_links, 'anchors': anchor_links},
    'prior_evidence_files_verified': prior_counts,
    'current_pinned_files': pins,
    'current_document_hashes': {str(path.relative_to(ROOT)): digest(path) for path in DOCS},
    'old_or_new_model_executions_by_this_verifier': 0,
}, indent=2, sort_keys=True))
