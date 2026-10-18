#!/usr/bin/env python3
"""Read-only D36 ratification/Q37 check; never executes any previous verifier/model."""
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[5]
GRILL = ROOT / 'docs/features/missionary-workspace-depth/grill'
EV = GRILL / 'd36-evidence'
MAIN = GRILL / 'phase28-d36-configured-referral-period-adversarial-review.md'
Q36 = GRILL / 'phase28-q36-referral-window-policy-research.md'
Q37 = GRILL / 'phase28-q37-getting-started-guidance-research.md'
SESSION = GRILL / 'phase28-session.md'
CONTEXT = ROOT / 'CONTEXT.md'

def digest(path):
    return sha256(path.read_bytes()).hexdigest()

def section(text, start, end):
    return text.split(start, 1)[1].split(end, 1)[0].strip()

before = (EV / 'd36-before-ratification.txt').read_text()
now = MAIN.read_text()
def decision(text):
    return '\n'.join(line for line in section(text, '## Exact corrected decision to record', '## What is established, and what is not').splitlines() if line.startswith('>'))
assert decision(before) == decision(now)
assert section(before, '**C01 —', '## Material findings and permanent resolution') == section(now, '**C01 —', '## Material findings and permanent resolution')
old_proofs = [re.sub(r'\s+', ' ', line).strip() for line in before.splitlines() if re.match(r'^\| P\d{2}\s*\|', line)]
new_proofs = [re.sub(r'\s+', ' ', line).strip() for line in now.splitlines() if re.match(r'^\| P\d{2}\s*\|', line)]
assert len(old_proofs) == len(new_proofs) == 40
assert [s.replace('pending D36 amendments', 'ratified D36 amendments') for s in old_proofs] == new_proofs
assert sum(a != b for a,b in zip(old_proofs,new_proofs)) == 1
assert re.findall(r'^\*\*C(\d{2}) —', now, re.M) == [f'{i:02}' for i in range(1,25)]
assert '## Explicit ratification' in now
assert 'explicitly ratified on\nOctober 18, 2026 Asia/Bangkok' in now
assert 'those amendments await ratification' not in Q36.read_text()
assert '**Q37 is unanswered.' in Q37.read_text()
assert '### Q37: optional organization-provided starting guidance (unanswered)' in SESSION.read_text()
assert not re.search(r'^#{1,4} D37', SESSION.read_text(), re.M)
assert '**Continued referral period** (Phase 28 D36, ratified):' in CONTEXT.read_text()
assert 'D12\'s reviewed amendments are not newly ratified' in Q37.read_text()
assert 'Initial-referral period policy' in Q37.read_text()

preserved = json.loads((EV / 'ratification-evidence-sha256.json').read_text())
assert len(preserved) == 17
for name, expected in preserved.items():
    assert digest(GRILL / name) == expected, name
original_pins = json.loads((EV / 'artifact-pins.json').read_text())
remap = {MAIN.name: EV/'d36-before-ratification.txt', Q36.name: EV/'q36-before-ratification.txt'}
for name, expected in original_pins.items():
    assert digest(remap.get(name, GRILL/name)) == expected, name
prior_counts = {}
for number in range(36, 29, -1):
    manifest = json.loads((GRILL/f'd{number}-evidence/prior-evidence-sha256.json').read_text())
    pairs = [(ROOT/row['path'],row['sha256']) for row in manifest['artifacts']] if 'artifacts' in manifest else [(GRILL/name,value) for name,value in manifest.items()]
    for target, expected in pairs:
        assert digest(target) == expected, str(target)
    prior_counts[f'd{number-1}'] = len(pairs)

DOCS = [MAIN,Q36,Q37,SESSION,CONTEXT] + sorted(EV.glob('*.md'))
cache = {}
def anchors(path):
    if path in cache:
        return cache[path]
    found = set()
    counts = Counter()
    fenced = False
    for line in path.read_text().splitlines():
        if line.startswith('```'):
            fenced = not fenced
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*$', line) if not fenced else None
        if not match:
            continue
        title = re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',match.group(1)).lower()
        title = re.sub(r'<[^>]*>','',title).replace(' ','-')
        slug = ''.join(c for c in title if c in '-_' or unicodedata.category(c)[0] in 'LN')
        occurrence = counts[slug]
        counts[slug] += 1
        found.add(slug if occurrence == 0 else f'{slug}-{occurrence}')
    found.update(re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)',path.read_text()))
    cache[path] = found
    return found

links = line_links = anchor_links = 0
for doc in DOCS:
    text = doc.read_text()
    for dest in re.findall(r'(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)',text):
        dest = dest.strip().strip('<>')
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://',dest) or dest.startswith('mailto:'):
            continue
        filepart, _, anchor = unquote(dest).partition('#')
        match = re.search(r':(\d+)$',filepart)
        line = int(match.group(1)) if match else None
        if match:
            filepart = filepart[:match.start()]
        target = (doc.parent/filepart).resolve() if filepart else doc
        assert target.is_file(), f'{doc}: missing {dest}'
        links += 1
        if line:
            assert 1 <= line <= len(target.read_text().splitlines()), dest
            line_links += 1
        if anchor:
            assert anchor in anchors(target), f'{doc}: missing anchor {dest}'
            anchor_links += 1

print(json.dumps({
    'status':'passed',
    'ratified':'D36 corrected decision and C01–C24/P01–P40, October 18 2026 Asia/Bangkok',
    'exact_decision_unchanged':True,
    'exact_c01_c24_unchanged':True,
    'p01_p40_preserved_except_p40_status_label':True,
    'p40_only_change':'pending D36 amendments -> ratified D36 amendments',
    'original_evidence_files_preserved':15,
    'pre_ratification_snapshots_preserved':2,
    'original_artifact_pins_verified':len(original_pins),
    'prior_evidence_files_verified':prior_counts,
    'status_checks':{'q36_answered_and_ratified':True,'q37_unanswered':True,'no_d37':True,'no_implied_d12_ratification':True,'initial_referral_scope_unresolved':True},
    'references':{'documents':len(DOCS),'local_links':links,'line_links':line_links,'anchors':anchor_links},
    'previous_model_probe_or_verifier_executions':0,
    'current_documents_sha256':{str(p.relative_to(ROOT)):digest(p) for p in [MAIN,Q36,Q37,SESSION,CONTEXT]},
    'limits':'Status, text, hashes and local-reference checks only; no application, SQL/RLS, model, live state or runtime qualification.'
},indent=2,sort_keys=True))
