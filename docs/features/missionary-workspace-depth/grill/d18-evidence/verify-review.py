"""Deterministic documentation/provenance checks, not product qualification."""
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

E = Path(__file__).resolve().parent
G = E.parent
ROOT = E.parents[4]
FILES = [G / 'phase28-d18-newsletter-writing-assistance-adversarial-review.md',
         G / 'phase28-q18-newsletter-writing-assistance-research.md',
         G / 'phase28-session.md', G / 'phase28-q19-first-support-follow-up-research.md', *sorted(E.rglob('*.md'))]
errors = []
refs = anchors = 0

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def targets(text):
    for match in re.finditer(r'\]\(', text):
        start = end = match.end()
        depth = 1
        while end < len(text) and depth:
            if text[end] == '(' and text[end - 1] != '\\':
                depth += 1
            elif text[end] == ')' and text[end - 1] != '\\':
                depth -= 1
            end += 1
        if depth == 0:
            yield text[start:end - 1]

# Create the output pathname before checking its incoming documentation link.
output = E / 'review-verification.json'
if not output.exists():
    output.write_text('{}\n')
for file in FILES:
    body = file.read_text()
    for number, line in enumerate(body.splitlines(), 1):
        if line.rstrip() != line:
            errors.append(f'{file.name}:{number}: trailing whitespace')
    for target in targets(body):
        if re.match(r'[a-z]+://', target):
            continue
        target = unquote(target).strip('<>')
        path, _, anchor = target.partition('#')
        match = re.match(r'^(.*?):(\d+)$', path)
        number = None
        if match:
            path, number = match.group(1), int(match.group(2))
        dest = (file.parent / path).resolve() if path else file
        refs += 1
        if not dest.exists():
            errors.append(f'{file.name}: missing {target}')
            continue
        if number and not 1 <= number <= len(dest.read_text().splitlines()):
            errors.append(f'{file.name}: invalid line {target}')
        if anchor and dest.suffix == '.md':
            heads = re.findall(r'^#{1,6}\s+(.+)$', dest.read_text(), re.M)
            slugs = [re.sub(r'[^\w\- ]', '', h.lower()).replace(' ', '-') for h in heads]
            slugs += re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)["\']', dest.read_text())
            anchors += 1
            if anchor not in slugs:
                errors.append(f'{file.name}: missing anchor {target}')
main = FILES[0].read_text()
counts = {'clauses': len(re.findall(r'^\*\*C\d\d —', main, re.M)),
          'proofs': len(re.findall(r'^\*\*P\d\d\.', main, re.M)),
          'concerns': len(re.findall(r'^\| F\d\d ', main, re.M)),
          'categories': len(re.findall(r'^\| \d\d ', main, re.M))}
assert counts == {'clauses': 24, 'proofs': 30, 'concerns': 14, 'categories': 22}, counts
assert 'Subsequent explicit ratification' in main
assert 'has now explicitly ratified' in main
q18 = FILES[1].read_text()
assert 'Founder answered A' in q18 and 'Awaiting founder answer' not in q18
session = FILES[2].read_text()
assert 'All eighteen review dispositions' in session
assert 'D18 (answered Q18)' in session and 'D17 explicit ratification' in session
assert 'D18 explicit ratification' in session
assert 'Awaiting founder answer' in FILES[3].read_text()
assert 'Q19: first support for a ministry or the organization (awaiting answer)' in session
assert '**Newsletter writing help** (Phase 28 D18, ratified):' in (ROOT / 'CONTEXT.md').read_text()
brief = sha(G / 'phase28-founder-brief.md')
assert brief == '464e3ceb675f1bd3926b0974b003e885ef1b115b5b516a37da3d84fbed8f1dcb'
P = E / 'postgres-probe'
r = json.loads((P / 'results.json').read_text())
assert r['passed'] == r['outcomes'] == 35
assert all(case['passed'] for case in r['results'])
races = [case for case in r['results'] if 'actual_lock_wait' in case]
assert len(races) == 8 and all(case['actual_lock_wait'] for case in races)
for name, digest in r['artifact_sha256'].items():
    assert sha(P / name) == digest, name
assert sha(G / 'd1-evidence/postgres-probe/run.py') == r['helper_sha256']
sources = json.loads((P / 'sources.json').read_text())
for source in sources['local']:
    assert sha(ROOT / source['path']) == source['sha256'], source['path']
cache_count = 0
for source in sources['fresh'] + sources['same_day_reused']:
    assert sha(Path(source['raw_path'])) == source['sha256'], source['name']
    if 'text_path' in source:
        assert sha(Path(source['text_path'])) == source['text_sha256'], source['name']
    cache_count += 1
cleanup = json.loads((P / 'cleanup.json').read_text())
assert cleanup['container_absent'] and all(cleanup['volumes_absent'].values())
roles = json.loads((P / 'roles.json').read_text())
assert len(roles) == 7 and all(not role['rolsuper'] and not role['rolbypassrls'] for role in roles)
initial = P / 'development-attempts/01-before-null-input-review'
old = json.loads((initial / 'results.json').read_text())
assert old['passed'] == old['outcomes'] == 34
for name, digest in old['artifact_sha256'].items():
    assert sha(initial / name) == digest, name
old_cleanup = json.loads((initial / 'cleanup.json').read_text())
assert old_cleanup['container_absent'] and all(old_cleanup['volumes_absent'].values())
content = json.loads((E / 'prose-probe/results.json').read_text())
assert content['cases_passed'] == content['cases_total'] == 16
assert content['model_calls'] == 0
assert all(case['passed'] for case in content['outcomes'])
initial_verification = json.loads((E / 'review-verification-initial.json').read_text())
assert initial_verification['d18_amendments_ratified'] is False
assert sha(E / 'verify-review-initial.py') == initial_verification['sha256'][str((E / 'verify-review.py').relative_to(ROOT))]
result = {'checked_at_utc': datetime.now(timezone.utc).isoformat(),
          'scope': 'Documentation structure, local references and retained research evidence consistency; not application/model/provider qualification',
          'counts': counts, 'local_references_checked': refs,
          'local_heading_anchors_checked': anchors, 'errors': errors,
          'founder_brief_sha256_unchanged': brief,
          'd18_a_selected': True, 'd18_amendments_ratified': True, 'q19_prepared_unanswered': True,
          'ratified_decisions': ['D2','D4','D5','D7','D8','D9','D10','D14','D15','D16','D17','D18'],
          'postgres_version': '17.11', 'postgres_outcomes_passed': 35,
          'actual_concurrent_races': 8, 'initial_34_outcomes_preserved': True,
          'prose_counterexamples_passed': 16, 'model_calls': 0,
          'primary_technical_bodies_hash_verified': cache_count,
          'governing_owner_files_hash_verified': len(sources['local']),
          'probe_and_helper_hashes_verified': True, 'both_cleanup_evidence_verified': True,
          'sha256': {str(file.relative_to(ROOT)): sha(file) for file in [*FILES, ROOT/'CONTEXT.md', Path(__file__), *sorted(P.glob('*.json')), P/'setup.sql', P/'run.py', E/'prose-probe/probe.py', E/'prose-probe/results.json']},
          'not_proved': ['Core source/P12 integration', 'hosted Supabase/API/RLS/storage and service paths', 'provider execution/privacy/account contracts', 'prices/settlement/limit lowering', 'model voice/meaning quality', 'encryption/physical erasure/complete retention/restore', 'production editor and end-to-end send separation', 'browser/accessibility/author usability', 'production throughput and latency']}
output.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key not in ('sha256','not_proved')}, indent=2))
raise SystemExit(bool(errors))
