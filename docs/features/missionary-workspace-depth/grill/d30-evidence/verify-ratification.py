#!/usr/bin/env python3
"""Verify D30 ratification and Q31 continuation; never execute old evidence."""
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
Q30 = GRILL / 'phase28-q30-one-time-need-purpose-research.md'
Q31 = GRILL / 'phase28-q31-above-commitment-minimum-research.md'
SESSION = GRILL / 'phase28-session.md'
RESULT = HERE / 'ratification-verification.json'
errors = []


def require(ok, message):
    if not ok:
        errors.append(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def anchors(path):
    found = set(re.findall(r'''<[a-z0-9]+\b[^>]*\bid=["']([^"']+)["']''', path.read_text(), re.I))
    seen = {}
    for line in path.read_text().splitlines():
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$', line)
        if match:
            slug = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', match[1]).replace('`', '').replace('*', '').lower()
            slug = ''.join(c for c in slug if c in ' -_' or unicodedata.category(c)[0] in 'LN').replace(' ', '-')
            n = seen.get(slug, 0)
            seen[slug] = n + 1
            found.add(slug if not n else slug + '-' + str(n))
    return found


manifest = json.loads((HERE / 'ratification-evidence-sha256.json').read_text())
prior = json.loads((HERE / 'prior-evidence-sha256.json').read_text())
require(len(manifest['artifacts']) == 15, 'Expected 15 preserved initial D30 artifacts')
require(len(prior['artifacts']) == 20, 'Expected 20 preserved D29 artifacts')
for entry in manifest['artifacts'] + [manifest['decision_snapshot']] + prior['artifacts']:
    path = ROOT / entry['path']
    require(path.is_file() and sha(path) == entry['sha256'], 'Changed evidence: ' + entry['path'])
main = MAIN.read_text()
original = (ROOT / manifest['decision_snapshot']['path']).read_text()
normalize = lambda s: re.sub(r'\s+', ' ', s)
clauses = lambda s: re.findall(r'^### D30-C\d\d\b[\s\S]*?(?=^### D30-C\d\d\b|^## Consolidated)', s, re.M)
proofs = lambda s: re.findall(r'^\| P\d\d\s*\|.*$', s, re.M)
findings = re.findall(r'^\| F(\d\d)\s*\|', main, re.M)
categories = re.findall(r'^\| (\d+)\. [^|]+\| (\*\*[^|]+)\|', main, re.M)
require(len(clauses(main)) == 24 and clauses(main) == clauses(original), 'Ratified clauses changed')
require(len(proofs(main)) == 32 and proofs(main) == proofs(original), 'Ratified proof obligations changed')
require(findings == [f'{i:02}' for i in range(1,19)], 'Finding set changed')
require([int(x[0]) for x in categories] == list(range(1,23)), 'Category coverage changed')
require('**Status: the corrected decision and required amendments were explicitly ratified on October 18, 2026 UTC.**' in normalize(main), 'Main ratification status missing')
require('## Subsequent explicit ratification and continuation' in main, 'Ratification provenance missing')
require('**Gift for a specific one-time need** (Phase 28 D30, ratified):' in (ROOT / 'CONTEXT.md').read_text(), 'Glossary ratification missing')
require('ratified the corrected decision and required amendments on October 18, 2026 UTC' in normalize(Q30.read_text()), 'Q30 current status stale')
require('closes the clarification' in normalize(main), 'Customization clarification not closed by ratification')
session = SESSION.read_text()
require('### D30 explicit ratification' in session, 'Session ratification missing')
require('### Q31: minimum amount for verified above-commitment follow-up (unanswered)' in session, 'Q31 missing/unexpected answer')
require('### Q32' not in session, 'Unexpected Q32')
require('D26, D27, D28, D29 and D30 with their required amendments' in session, 'Ratification register stale')
for doc in (MAIN, Q30):
    for stale in ('amendments await ratification', 'requirements preserve A and await ratification', 'supplied here for ratification'):
        require(stale not in normalize(doc.read_text()), 'Stale status in ' + doc.name)
q31 = Q31.read_text()
require('Q31 remains unanswered' in q31 and 'No other automatic follow-up reason applies' in q31, 'Question distinction/status missing')
require('**A — Follow up on any confirmed excess (recommended).**' in q31, 'Q31 option A wrong')
require('**B — Let the organization set a minimum excess.**' in q31, 'Q31 option B wrong')
require('D21' in q31 and 'D20' in q31 and 'D22' in q31 and 'P16' in q31, 'Question owner scope missing')
local_count = line_count = anchor_count = 0
for doc in (MAIN, Q30, Q31, SESSION):
    for raw in re.findall(r'\[[^\]]*\]\(([^)\s]+)\)', doc.read_text()):
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', raw) and not re.fullmatch(r'.+:[0-9]+', raw):
            continue
        part, _, fragment = unquote(raw.strip('<>')).partition('#')
        match = re.fullmatch(r'(.*):([0-9]+)', part)
        line = None
        if match:
            part, line = match[1], int(match[2])
        path = (doc.parent / part).resolve() if part else doc
        local_count += 1
        if path == RESULT and not path.exists():
            continue
        require(path.exists(), f'Broken link in {doc.name}: {raw}')
        if not path.exists():
            continue
        if line:
            line_count += 1
            require(1 <= line <= len(path.read_text().splitlines()), 'Line out of bounds: ' + raw)
        if fragment:
            anchor_count += 1
            require(fragment in anchors(path), f'Broken anchor in {doc.name}: {raw}')
result = {
    'kind': 'D30 explicit ratification and Q31 unanswered continuation; documentation/provenance only',
    'date_utc': '2026-10-18', 'passed': not errors, 'ratified': True,
    'unchanged_d30_evidence_artifacts': 15, 'unchanged_d29_evidence_artifacts': 20,
    'clauses_preserved_exactly': len(clauses(main)), 'proof_obligations_preserved_exactly': len(proofs(main)),
    'findings': len(findings), 'category_count': len(categories),
    'local_links_checked': local_count, 'line_links_checked': line_count, 'anchors_checked': anchor_count,
    'q31_posed': True, 'q31_answered': False, 'q32_posed': False,
    'prior_models_or_database_probes_rerun': False,
    'reviewed_documents': [{'path':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in (MAIN,Q30,Q31,SESSION)],
    'limits': ['Ratification does not implement, grant current authority, qualify or activate the source.', 'Original verification and semantic-model results remain unchanged historical evidence.', 'No live data/provider, formal spec, ticket or GitHub mutation.'],
    'errors': errors,
}
RESULT.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
raise SystemExit(0 if not errors else 1)
