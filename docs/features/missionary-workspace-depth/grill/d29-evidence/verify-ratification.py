#!/usr/bin/env python3
"""Verify D29 ratification and Q30 continuation; never execute old evidence."""
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
Q29 = GRILL / 'phase28-q29-special-gift-purpose-research.md'
Q30 = GRILL / 'phase28-q30-one-time-need-purpose-research.md'
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
require(len(manifest['artifacts']) == 16, 'Expected 16 preserved initial D29 artifacts')
require(len(prior['artifacts']) == 23, 'Expected 23 preserved D28 artifacts')
for entry in manifest['artifacts'] + [manifest['decision_snapshot']] + prior['artifacts']:
    path = ROOT / entry['path']
    require(path.is_file() and sha(path) == entry['sha256'], 'Changed evidence: ' + entry['path'])
main = MAIN.read_text()
original = (ROOT / manifest['decision_snapshot']['path']).read_text()
normalize = lambda s: re.sub(r'\s+', ' ', s)
clauses = lambda s: re.findall(r'^### D29-C\d\d\b[\s\S]*?(?=^### D29-C\d\d\b|^## Lifecycle)', s, re.M)
proofs = lambda s: re.findall(r'^\| P\d\d\s*\|.*$', s, re.M)
findings = re.findall(r'^\| F(\d\d)\s*\|', main, re.M)
categories = re.findall(r'^\| (\d+)\. [^|]+\| (\*\*[^|]+)\|', main, re.M)
require(len(clauses(main)) == 24 and clauses(main) == clauses(original), 'Ratified clauses changed')
require(len(proofs(main)) == 32 and proofs(main) == proofs(original), 'Ratified proof obligations changed')
require(findings == [f'{i:02}' for i in range(1,17)], 'Finding set changed')
require([int(x[0]) for x in categories] == list(range(1,23)), 'Category coverage changed')
require('**Status: the corrected decision and required amendments were explicitly ratified on October 18, 2026 UTC.**' in normalize(main), 'Main ratification status missing')
require('## Subsequent explicit ratification and continuation' in main, 'Ratification provenance missing')
require('**Donor-stated additional support** (Phase 28 D29, ratified):' in (ROOT / 'CONTEXT.md').read_text(), 'Glossary ratification missing')
require('ratified the corrected decision and required amendments on October 18, 2026 UTC.' in normalize(Q29.read_text()), 'Q29 current status stale')
session = SESSION.read_text()
require('### D29 explicit ratification' in session, 'Session ratification missing')
require('### Q30: support for a specific one-time need (unanswered)' in session, 'Q30 missing/unexpected answer')
require('### Q31' not in session, 'Unexpected Q31')
require('D26, D27, D28 and D29 with their required amendments' in session, 'Ratification register stale')
for doc in (MAIN, Q29):
    for stale in ('amendments await ratification', 'requirements preserve A and await ratification', 'supplied here for ratification'):
        require(stale not in normalize(doc.read_text()), 'Stale status in ' + doc.name)
q30 = Q30.read_text()
require('Q30 remains unanswered' in q30 and 'No other automatic-follow-up reason applies' in q30, 'Question distinction/status missing')
require('**A — Recognize gifts for a specific one-time need (recommended).**' in q30, 'Q30 option A wrong')
require('**B — Require another established qualifying reason.**' in q30, 'Q30 option B wrong')
require('E7' in q30 and 'D20' in q30 and 'D29' in q30, 'Question owner scope missing')
local_count = line_count = anchor_count = 0
for doc in (MAIN, Q29, Q30, SESSION):
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
    'kind': 'D29 explicit ratification and Q30 unanswered continuation; documentation/provenance only',
    'date_utc': '2026-10-18', 'passed': not errors, 'ratified': True,
    'unchanged_d29_evidence_artifacts': 16, 'unchanged_d28_evidence_artifacts': 23,
    'clauses_preserved_exactly': len(clauses(main)), 'proof_obligations_preserved_exactly': len(proofs(main)),
    'findings': len(findings), 'category_count': len(categories),
    'local_links_checked': local_count, 'line_links_checked': line_count, 'anchors_checked': anchor_count,
    'q30_posed': True, 'q30_answered': False, 'q31_posed': False,
    'prior_models_or_database_probes_rerun': False,
    'reviewed_documents': [{'path':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in (MAIN,Q29,Q30,SESSION)],
    'limits': ['Ratification does not implement, grant current authority, qualify or activate the source.', 'Original verification and semantic-model results remain unchanged historical evidence.', 'No live data/provider, formal spec, ticket or GitHub mutation.'],
    'errors': errors,
}
RESULT.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
raise SystemExit(0 if not errors else 1)
