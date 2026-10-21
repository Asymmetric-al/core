"""D21 document/provenance verification; not product or source qualification."""
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

E = Path(__file__).resolve().parent
G = E.parent
ROOT = E.parents[4]
MAIN = G / 'phase28-d21-explicit-gift-follow-up-adversarial-review.md'
OUTPUT = E / 'review-verification.json'
FILES = [MAIN, G / 'phase28-q21-history-based-gift-attention-research.md',
         G / 'phase28-session.md', G / 'phase28-q22-amount-based-gift-follow-up-research.md',
         *sorted(E.rglob('*.md'))]
errors = []
refs = anchors = lines = 0

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def require(value, message):
    if not value:
        errors.append(message)

def targets(body):
    for m in re.finditer(r'\]\(', body):
        start = end = m.end()
        depth = 1
        while end < len(body) and depth:
            if body[end] == '(' and body[end-1] != '\\': depth += 1
            elif body[end] == ')' and body[end-1] != '\\': depth -= 1
            end += 1
        if depth == 0: yield body[start:end-1].strip('<>')

if not OUTPUT.exists(): OUTPUT.write_text('{}\n')
for f in FILES:
    body = f.read_text()
    require(all(x.rstrip() == x for x in body.splitlines()), f'trailing whitespace: {f.name}')
    for target in targets(body):
        if re.match(r'^[a-z][a-z0-9+.-]*://', target) or target.startswith('mailto:'): continue
        path, _, anchor = unquote(target).partition('#')
        m = re.search(r':(\d+)$', path)
        n = int(m.group(1)) if m else None
        if m: path = path[:m.start()]
        dest = (f.parent / path).resolve() if path else f
        refs += 1
        if not dest.exists():
            errors.append(f'{f.name}: missing {target}')
            continue
        if n:
            lines += 1
            require(1 <= n <= len(dest.read_text().splitlines()), f'{f.name}: line {target}')
        if anchor:
            anchors += 1
            heads = re.findall(r'^#+\s+(.+)$', dest.read_text(), re.M)
            slugs = [re.sub(r'[^\w\- ]', '', h.lower()).replace(' ', '-') for h in heads]
            slugs += re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)["\']', dest.read_text())
            require(anchor in slugs, f'{f.name}: anchor {target}')
main = MAIN.read_text()
counts = {'clauses': len(re.findall(r'^\*\*C\d\d —', main, re.M)),
          'proofs': len(re.findall(r'^\*\*P\d\d\.', main, re.M)),
          'concerns': len(re.findall(r'^\| F\d\d\s', main, re.M)),
          'categories': len(re.findall(r'^\| \d\d\s', main, re.M))}
require(counts == {'clauses':20, 'proofs':28, 'concerns':12, 'categories':22}, f'counts: {counts}')
for marker in ['Corrected decision and required amendments explicitly ratified',
               'Subsequent explicit ratification',
               'Ordinary manual tasks and other native purposes retain their own',
               'current task-create', 'the earlier D19', 'required task history/audit remains',
               'No Q22 was posed in the initial review', 'no new gift', 'not rerun']:
    require(marker in main, f'missing main marker: {marker}')
q21 = FILES[1].read_text()
require('Founder answered A' in q21 and 'Awaiting founder answer' not in q21, 'Q21 answered status')
session = FILES[2].read_text()
for marker in ['All twenty-one review dispositions', 'D21 (answered Q21)', 'E21 (P28 design)',
               'Q21: history-based gift attention (now answered A)',
               'D20 explicit ratification', 'D21 answer and completed adversarial review']:
    require(marker in session, f'session missing {marker}')
require('### D21 explicit ratification' in session, 'D21 ratification missing')
require('Q22: amount-based native follow-up (awaiting answer)' in session, 'Q22 question status')
require('Awaiting founder answer' in FILES[3].read_text(), 'Q22 frontier awaiting')
glossary = (ROOT / 'CONTEXT.md').read_text()
require('**Giving-history context** (Phase 28 D21, ratified):' in glossary, 'glossary D21')
require('**Grouped special-gift follow-up** (Phase 28 D20, ratified):' in glossary, 'D20 retained')
brief = sha(G / 'phase28-founder-brief.md')
require(brief == '464e3ceb675f1bd3926b0974b003e885ef1b115b5b516a37da3d84fbed8f1dcb', 'founder changed')

# Verify unchanged D20 artifacts against the previous turn's actual snapshot.
prior = json.loads((G / 'd20-evidence/review-verification.json').read_text())
require(prior['d20_amendments_ratified'] and prior['q21_prepared_unanswered'], 'prior status provenance')
preserved = 0
for rel, digest in prior['sha256'].items():
    if '/d20-evidence/' in rel or rel.endswith('phase28-d20-grouped-special-gift-follow-up-adversarial-review.md') or rel.endswith('phase28-q20-special-gift-follow-up-grouping-research.md') or rel.endswith('d19-evidence/review-verification.json'):
        require(sha(ROOT / rel) == digest, f'prior artifact changed: {rel}')
        preserved += 1
pg = json.loads((G / 'd20-evidence/postgres-probe/results.json').read_text())
require(pg['passed'] == pg['outcomes'] == 38 and pg['failure'] is None, 'D20 result summary')
races = [x for x in pg['results'] if 'actual_lock_wait' in x]
require(len(races) == 9 and all(x['actual_lock_wait'] == 'Lock:transactionid' for x in races), 'D20 races')
for name,digest in pg['artifact_sha256'].items():
    require(sha(G / 'd20-evidence/postgres-probe' / name) == digest, f'executed artifact changed: {name}')
require(sha(G / 'd1-evidence/postgres-probe/run.py') == pg['helper_sha256'], 'probe helper changed')

sources = json.loads((E / 'technical-source-fetches.json').read_text())
for source in sources:
    require(source['status'] == 200, f'source HTTP {source["url"]}')
    require(sha(Path(source.get('raw_path', source.get('path')))) == source['sha256'], f'source hash {source["url"]}')
    if 'text_path' in source:
        require(sha(Path(source['text_path'])) == source['text_sha256'], f'source text {source["url"]}')
    require(source['fetched_at'].startswith('2026-10-17'), f'source date {source["url"]}')
require(len(sources) == 7, 'source count')

# Preserve the actual initial review and semantic run; ratification is not a new experiment.
initial = json.loads((E / 'review-verification-initial.json').read_text())
require(initial['d21_a_selected'] and not initial['d21_amendments_ratified'] and not initial['q22_asked'], 'initial status snapshot')
require(sha(E / 'verify-review-initial.py') == initial['sha256'][str((E / 'verify-review.py').relative_to(ROOT))], 'initial verifier changed')
probe = E / 'counterexample-probe/probe.py'
retained = json.loads((probe.parent / 'results.json').read_text())
require(retained['case_count'] == retained['reproduced'] == 18, 'counterexample summary')
for artifact in [probe, probe.parent / 'results.json']:
    require(sha(artifact) == initial['sha256'][str(artifact.relative_to(ROOT))], f'original semantic artifact changed: {artifact}')
require(initial['independent_semantic_rerun_matches'], 'initial independent semantic run absent')

checked = sorted(set([*FILES, ROOT/'CONTEXT.md', *[x for x in E.rglob('*') if x.is_file() and x != OUTPUT],
                      G/'d20-evidence/review-verification.json']))
report = {
    'checked_at_utc': datetime.now(timezone.utc).isoformat(),
    'scope': 'Document structure, local-reference existence/line bounds, status, source/probe artifact integrity and finite semantic examples; not source truth/Core/runtime/database/user qualification',
    'counts': counts, 'errors': errors, 'local_references_checked': refs,
    'local_heading_anchors_checked': anchors, 'local_line_references_checked': lines,
    'founder_brief_sha256_unchanged': brief,
    'd21_a_selected': True, 'd21_amendments_ratified': True, 'q22_prepared_unanswered': True,
    'initial_verification_preserved':True,
    'ratified_decisions': [*prior['ratified_decisions'], 'D21'],
    'unchanged_prior_artifacts_checked': preserved,
    'prior_postgres_outcomes':38, 'prior_actual_concurrent_races':9,
    'new_database_experiments':0, 'prior_database_probe_rerun':False,
    'semantic_counterexamples_reproduced':18,
    'initial_independent_semantic_rerun_matches':initial['independent_semantic_rerun_matches'],
    'new_semantic_experiments':0,
    'fresh_technical_source_bodies_hash_verified':len(sources),
    'live_supabase_or_provider_operations':0,
    'sha256': {str(f.relative_to(ROOT)):sha(f) for f in checked}
}
OUTPUT.write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k != 'sha256'}, indent=2))
raise SystemExit(1 if errors else 0)
