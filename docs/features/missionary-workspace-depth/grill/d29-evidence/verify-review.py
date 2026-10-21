#!/usr/bin/env python3
"""D29 document/provenance checks, not authorization or implementation proof."""
from pathlib import Path
from urllib.parse import unquote
import hashlib
import json
import re
import unicodedata

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / 'phase28-d29-additional-gift-purpose-adversarial-review.md'
QUESTION = GRILL / 'phase28-q29-special-gift-purpose-research.md'
SESSION = GRILL / 'phase28-session.md'
RESULT = HERE / 'review-verification.json'
errors = []


def require(ok, why):
    if not ok:
        errors.append(why)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def headings(path):
    result = set(re.findall(r'''<[a-z0-9]+\b[^>]*\bid=["']([^"']+)['"]''', path.read_text(), re.I))
    seen = {}
    for line in path.read_text().splitlines():
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$', line)
        if not match:
            continue
        slug = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', match[1]).replace('`', '').replace('*', '').lower()
        slug = ''.join(c for c in slug if c in ' -_' or unicodedata.category(c)[0] in 'LN').replace(' ', '-')
        n = seen.get(slug, 0)
        seen[slug] = n + 1
        result.add(slug if n == 0 else slug + '-' + str(n))
    return result


prior = json.loads((HERE / 'prior-evidence-sha256.json').read_text())
pins = json.loads((HERE / 'artifact-pins.json').read_text())
require(len(prior['artifacts']) == 23, 'Expected 23 D28 evidence artifacts')
for manifest in (prior, pins):
    for item in manifest['artifacts']:
        path = ROOT / item['path']
        require(path.is_file() and digest(path) == item['sha256'], 'Changed/missing evidence: ' + item['path'])

local_count = line_count = anchor_count = 0
for doc in [MAIN, QUESTION, SESSION] + sorted(HERE.glob('*.md')):
    for raw in re.findall(r'\[[^\]]*\]\(([^)\s]+)\)', doc.read_text()):
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', raw) and not re.fullmatch(r'.+:[0-9]+', raw):
            continue
        target = unquote(raw.strip('<>'))
        part, _, fragment = target.partition('#')
        match = re.fullmatch(r'(.*):([0-9]+)', part)
        line = None
        if match:
            part, line = match[1], int(match[2])
        path = (doc.parent / part).resolve() if part else doc
        local_count += 1
        if path == RESULT and not path.exists():
            continue
        require(path.exists(), f'Broken local link in {doc.name}: {raw}')
        if not path.exists():
            continue
        if line is not None:
            line_count += 1
            require(1 <= line <= len(path.read_text().splitlines()), 'Out-of-bounds line: ' + raw)
        if fragment:
            anchor_count += 1
            require(fragment in headings(path), f'Broken anchor in {doc.name}: {raw}')

main = MAIN.read_text()
normalized = re.sub(r'\s+', ' ', main)
clauses = re.findall(r'^### D29-C(\d\d)\b', main, re.M)
proofs = re.findall(r'^\| P(\d\d)\s*\|', main, re.M)
findings = re.findall(r'^\| F(\d\d)\s*\|', main, re.M)
categories = re.findall(r'^\| (\d+)\. ([^|]+)\| (\*\*[^|]+)\|', main, re.M)
require(clauses == [f'{i:02}' for i in range(1, 25)], 'Expected C01-C24')
require(proofs == [f'{i:02}' for i in range(1, 33)], 'Expected P01-P32')
require(findings == [f'{i:02}' for i in range(1, 17)], 'Expected F01-F16')
require([int(row[0]) for row in categories] == list(range(1, 23)), 'Expected all 22 category dispositions')
require(all('Yes' in row[2] or 'No' in row[2] for row in categories), 'Missing material-concern disposition')
for row in re.findall(r'^\| F\d\d\s*\|.*$', main, re.M):
    require(len(row.split('|')) == 7 and re.search(r'C\d\d', row) and re.search(r'P\d\d', row), 'Incomplete finding columns/trace')
require('**Disposition: Accept with required amendments.**' in main, 'Missing disposition')
require('required amendments await explicit ratification' in normalized, 'Ratification status wrong')
require('**Selected actor clarification:**' in main and 'authorized staff and missionaries' in normalized, 'Selected actor class missing')
require('No further product clarification blocks this review.' in normalized, 'Stale product blocker')
require('**Q29 is answered A.**' in QUESTION.read_text(), 'Q29 answer missing')
require('All twenty-nine review dispositions' in SESSION.read_text(), 'Session count wrong')
require('### D29 answer and completed adversarial review' in SESSION.read_text(), 'Session D29 missing')
require('### Q29: additional support without a specific one-time need (answered A)' in SESSION.read_text(), 'Session Q29 status wrong')
require('### Q30' not in SESSION.read_text(), 'Unexpected next question')
require('**Donor-stated additional support** (Phase 28 D29, A selected; amendments pending):' in (ROOT / 'CONTEXT.md').read_text(), 'Selected glossary meaning missing')
require('unanswered product choice' in (HERE / 'q29-before-answer.txt').read_text(), 'Original Q29 not preserved')
current_docs = [MAIN, QUESTION] + sorted(HERE.glob('*.md'))
for doc in current_docs:
    text = re.sub(r'\s+', ' ', doc.read_text()).lower()
    for stale in ('actor clarification remains pending', 'actor clarification remains unanswered',
                  'actor choice is abstract and unselected', 'if the founder chooses staff-only',
                  'if the founder selects staff-only', 'confirming-actor clarification remains pending'):
        require(stale not in text, f'Stale actor status in {doc.name}: {stale}')
for invariant in ('current time after lock waits', 'bytes already released while authorized cannot be recalled',
                  'Every preactivation receipt is excluded', 'no optional workflow or extra manual Add step',
                  'current qualifying surviving support is separate', 'Ordinary absence of a donor statement creates no repair task'):
    require(invariant in normalized, 'Missing independently reviewed correction: ' + invariant)

model = json.loads((HERE / 'purpose-counterexamples.json').read_text())
expected = dict(all_passed=True, assertions_passed=47, counterexample_families=14, positive_controls=5)
require(model['summary'] == expected, 'Model summary mismatch')
require(len(model['counterexamples']) == 14 and len(model['positive_controls']) == 5, 'Model case count wrong')
require(len(model['limitations']) >= 10, 'Model limits missing')
require('Founder selected authorized staff and missionaries' in model['actor_policy'], 'Model actor selection stale')
require(model['script_sha256'] == digest(HERE / 'purpose-counterexamples.py'), 'Model script hash wrong')
reproduction = json.loads((HERE / 'root-reproduction.json').read_text())
require(reproduction['passed'] and reproduction['summary'] == expected, 'Root reproduction failed/mismatched')
require(reproduction['saved_result_sha256'] == reproduction['reproduced_result_sha256'] == digest(HERE / 'purpose-counterexamples.json'), 'Root output hash mismatch')
require(reproduction['script_sha256'] == digest(HERE / 'purpose-counterexamples.py'), 'Root script hash mismatch')
require(not reproduction['earlier_models_rerun'] and not reproduction['actual_database_or_application_tested'], 'Overclaimed model proof')
fetches = json.loads((HERE / 'technical-fetches.json').read_text())['fetches']
require(len(fetches) == 14, 'Expected 14 fresh primary technical fetches')
for item in fetches:
    require(item['status'] == 200 and item['bytes'] > 0 and len(item['sha256']) == 64, 'Invalid primary fetch metadata')

result = {
    'kind': 'D29 current documentation, provenance, selected actor clarification and bounded-model consistency only',
    'passed': not errors,
    'decision': 'A selected; Accept with required amendments; remaining amendments await ratification',
    'actor_class': 'Authorized staff and missionaries when organization permits exact qualified action/scope',
    'category_count': len(categories), 'finding_count': len(findings), 'clause_count': len(clauses), 'proof_count': len(proofs),
    'local_links_checked': local_count, 'line_links_checked': line_count, 'anchors_checked': anchor_count,
    'prior_d28_artifacts_unchanged': len(prior['artifacts']), 'current_pinned_evidence_count': len(pins['artifacts']),
    'semantic_model_summary': model['summary'], 'root_reproduction_identical': reproduction['passed'],
    'primary_technical_fetches': len(fetches), 'q29_answered_a': True, 'actor_clarification_selected': True, 'q30_posed': False,
    'reviewed_documents': [{'path': str(p.relative_to(ROOT)), 'sha256': digest(p)} for p in [MAIN, QUESTION, SESSION]],
    'limitations': ['No application, live database, RLS/role, real concurrency, provider, migration, capacity, accessibility or user qualification.', 'No prior finite model or database experiment rerun; old D28 verification retains its original historical state.', 'Link and structure checks establish document consistency, not truth of every linked source or correctness of future implementation.'],
    'errors': errors,
}
RESULT.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
raise SystemExit(0 if not errors else 1)
