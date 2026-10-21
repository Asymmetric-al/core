#!/usr/bin/env python3
"""D30 document/provenance checks only; runs no semantic or database model."""
from pathlib import Path
from urllib.parse import unquote
import hashlib
import json
import re
import unicodedata

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / 'phase28-d30-one-time-need-follow-up-adversarial-review.md'
QUESTION = GRILL / 'phase28-q30-one-time-need-purpose-research.md'
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
older = json.loads((GRILL / 'd29-evidence/prior-evidence-sha256.json').read_text())
require(len(prior['artifacts']) == 20, 'Expected 20 preserved D29 evidence artifacts')
require(len(older['artifacts']) == 23, 'Expected 23 earlier D28 evidence artifacts')
for manifest in (prior, older, pins):
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
clauses = re.findall(r'^### D30-C(\d\d)\b', main, re.M)
proofs = re.findall(r'^\| P(\d\d)\s*\|', main, re.M)
findings = re.findall(r'^\| F(\d\d)\s*\|', main, re.M)
categories = re.findall(r'^\| (\d+)\. ([^|]+)\| (\*\*[^|]+)\|', main, re.M)
require(clauses == [f'{i:02}' for i in range(1, 25)], 'Expected C01-C24')
require(proofs == [f'{i:02}' for i in range(1, 33)], 'Expected P01-P32')
require(findings == [f'{i:02}' for i in range(1, 19)], 'Expected F01-F18')
require([int(row[0]) for row in categories] == list(range(1, 23)), 'Expected all 22 category dispositions')
require(all('Yes' in row[2] or 'No' in row[2] for row in categories), 'Missing material-concern disposition')
for row in re.findall(r'^\| F\d\d\s*\|.*$', main, re.M):
    require(len(row.split('|')) == 7 and re.search(r'C\d\d', row) and re.search(r'P\d\d', row), 'Incomplete finding fields/trace')
require('**Disposition: Accept with required amendments.**' in main, 'Missing disposition')
require('required amendments await explicit ratification' in normalized, 'Ratification status wrong')
require('no reply was available' in normalized and 'recommendation' in normalized, 'Customization status not explicit')
require('Funding/goal attainment or archive alone SHALL NOT close coordination' in normalized, 'Funding improperly closes coordination')
require('without invalidating a still-current reviewed subset' in normalized, 'D20 reviewed-subset preservation missing')
require('**Q30 is answered A.**' in QUESTION.read_text(), 'Q30 answer missing')
require('All thirty review dispositions' in SESSION.read_text(), 'Session count wrong')
require('### D30 answer and completed adversarial review' in SESSION.read_text(), 'Session D30 missing')
require('### Q30: support for a specific one-time need (answered A)' in SESSION.read_text(), 'Session Q30 status wrong')
require('### Q31' not in SESSION.read_text(), 'Unexpected next question')
require('**Gift for a specific one-time need** (Phase 28 D30, A selected; amendments pending):' in (ROOT / 'CONTEXT.md').read_text(), 'Selected glossary meaning missing')
require('unanswered product choice' in (HERE / 'q30-before-answer.txt').read_text(), 'Original Q30 not preserved')
model = json.loads((HERE / 'need-policy-counterexamples.json').read_text())
reproduction = json.loads((HERE / 'root-reproduction.json').read_text())
require(model['summary'] == {'all_passed': True, 'assertions_passed': 38, 'counterexample_families': 13, 'positive_controls': 4}, 'Unexpected model result')
require(model['script_sha256'] == digest(HERE / 'need-policy-counterexamples.py'), 'Model script changed after run')
require(reproduction['identical'] and reproduction['script_sha256'] == model['script_sha256'], 'Root reproduction mismatch')
require(reproduction['expected_output_sha256'] == reproduction['reproduced_output_sha256'] == digest(HERE / 'need-policy-counterexamples.json'), 'Output hash mismatch')
fetches = json.loads((HERE / 'technical-fetches.json').read_text())['fetches']
require(len(fetches) == 12 and all(f['status'] == 200 for f in fetches), 'Technical fetch evidence mismatch')
result = {
    'kind': 'D30 current documentation, provenance and bounded-model consistency only',
    'passed': not errors,
    'decision': 'A selected; Accept with required amendments; amendments await ratification',
    'customization': 'Organization-wide On/Off is proposed; clarification unanswered, no per-need selection inferred',
    'category_count': len(categories), 'finding_count': len(findings),
    'clause_count': len(clauses), 'proof_count': len(proofs),
    'local_links_checked': local_count, 'line_links_checked': line_count, 'anchors_checked': anchor_count,
    'prior_d29_artifacts_unchanged': len(prior['artifacts']),
    'earlier_d28_artifacts_unchanged': len(older['artifacts']),
    'current_pinned_evidence_count': len(pins['artifacts']),
    'semantic_model_summary': model['summary'], 'root_reproduction_identical': reproduction['identical'],
    'primary_technical_fetches': len(fetches), 'q30_answered_a': True, 'q31_posed': False,
    'reviewed_documents': [{'path': str(p.relative_to(ROOT)), 'sha256': digest(p)} for p in [MAIN, QUESTION, SESSION, ROOT / 'CONTEXT.md']],
    'limitations': ['No real SQL/RLS, runtime, concurrency, financial/source qualification, migration, capacity, accessibility or user study.', 'No prior model or database probe rerun; prior results retain their historical point-in-time status.', 'Link/structure checks validate references and document shape, not every linked assertion or future implementation.'],
    'errors': errors,
}
RESULT.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
raise SystemExit(0 if not errors else 1)
