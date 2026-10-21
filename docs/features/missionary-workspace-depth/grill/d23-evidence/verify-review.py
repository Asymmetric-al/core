#!/usr/bin/env python3
"""Validate D23 documentation/provenance only. Never run a probe or product action."""
import hashlib
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

E = Path(__file__).resolve().parent
G = E.parent
ROOT = E.parents[4]
MAIN = G / 'phase28-d23-activity-targets-adversarial-review.md'
Q = G / 'phase28-q23-activity-target-measures-research.md'
Q24 = G / 'phase28-q24-coaching-activity-summary-research.md'
SESSION = G / 'phase28-session.md'
OUTPUT = E / 'review-verification.json'
PINS = {
    'prior-evidence-sha256.json': 'f91f45e50fe463c36df7170ac87eead79ee9fc2e6a123768a4867a9b8555982f',
    'counterexample-probe/probe.py': 'bd4230b7b052a1d323ce9086ef70a3500f9ad932fbc7bec00e652ca64bb6e854',
    'counterexample-probe/results.json': '0a81678c61327c7381eb4dd4e1a3e659e8819c5573e50a24dcdd024014193ac4',
    'primary-sources.json': 'd8c8cf66fc13d8ddd819a13ccfc55e7a2e5eaa1f199246a457f8467db2eb4e07',
    'review-verification-initial.json': 'cd029a8a37866ccf6173de03417241e26ec22241e794ceeb0c07c65f70285110',
    'verify-review-initial.py': '20df64e92018c2a6ecf0189b511a85d7a198ef452384ac4bbc7fa44ff9f33e74',
    'ratification-evidence-sha256.json': '44456611a85ab52face6bc81ec4754270bb018fe04f5b82a4f462d350f07e532',
}
errors = []
refs = lines = anchors = 0

def check(ok, msg):
    if not ok:
        errors.append(msg)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read_json(path):
    return json.loads(path.read_text())

def destinations(body):
    for match in re.finditer(r'\]\(', body):
        start = end = match.end()
        depth = 1
        while end < len(body) and depth:
            if body[end] == '(' and body[end-1] != '\\':
                depth += 1
            elif body[end] == ')' and body[end-1] != '\\':
                depth -= 1
            end += 1
        if depth == 0:
            yield body[start:end-1].strip().strip('<>')

def slugs(body):
    found, counts = set(), Counter()
    for heading in re.findall(r'^#{1,6}\s+(.+?)\s*#*\s*$', body, re.M):
        value = re.sub(r'<[^>]+>', '', heading).lower()
        value = re.sub(r'[^\w\- ]', '', value).replace(' ', '-')
        n = counts[value]
        counts[value] += 1
        found.add(value if n == 0 else f'{value}-{n}')
    found.update(re.findall(r'<(?:a|span)\s+(?:id|name)=[\"\']([^\"\']+)', body))
    return found

def section(body, heading):
    match = re.search(r'^## ' + re.escape(heading) + r'\s*$', body, re.M)
    check(match is not None, f'Missing section {heading}')
    return re.split(r'^## ', body[match.end():], maxsplit=1, flags=re.M)[0] if match else ''

if not OUTPUT.exists():
    OUTPUT.write_text('{}\n')
files = [MAIN, Q, Q24, SESSION, *sorted(E.rglob('*.md'))]
for path in files:
    body = path.read_text()
    for line in body.splitlines():
        check(line.rstrip() == line or (bool(line.strip()) and line.endswith('  ') and not line.endswith('   ') and line[:-2].rstrip() == line[:-2]), f'Trailing whitespace in {path.relative_to(ROOT)}')
    for dest in destinations(body):
        if re.match(r'^[a-z][a-z0-9+.-]*:', dest, re.I):
            continue
        target, _, anchor = unquote(dest).partition('#')
        match = re.search(r':(\d+)$', target)
        lineno = int(match.group(1)) if match else None
        if match:
            target = target[:match.start()]
        p = (path.parent / target).resolve() if target else path
        refs += 1
        check(p.exists(), f'Missing link {path.name}: {dest}')
        if not p.exists() or not p.is_file():
            continue
        if lineno:
            lines += 1
            check(1 <= lineno <= len(p.read_text().splitlines()), f'Invalid line {path.name}: {dest}')
        if anchor:
            anchors += 1
            check(anchor in slugs(p.read_text()), f'Missing anchor {path.name}: {dest}')

main, question, session = MAIN.read_text(), Q.read_text(), SESSION.read_text()
clauses = re.findall(r'^\*\*(C\d{2}) —', main, re.M)
proofs = re.findall(r'^\|\s*(P\d{2})\s*\|', main, re.M)
findings = re.findall(r'^### (F\d{2}) —', main, re.M)
check(clauses == [f'C{i:02}' for i in range(1,25)], 'C01-C24 missing/duplicate/order')
check(proofs == [f'P{i:02}' for i in range(1,33)], 'P01-P32 missing/duplicate/order')
check(findings == [f'F{i:02}' for i in range(1,15)], 'F01-F14 missing/duplicate/order')
for block in re.split(r'^### F\d{2} —', section(main,'Material findings and permanent fixes'), flags=re.M)[1:]:
    for field in ['What/why:', 'Severity:', 'Likelihood:', 'Evidence:', 'Effect on A:', 'Permanent prevention:', 'Exact change:']:
        check(f'**{field}**' in block, f'Finding missing {field}: {block[:70]}')
    check(re.search(r'C\d{2}',block) and re.search(r'P\d{2}',block), 'Finding lacks clause/proof')
cat_section = section(main,'All 22 categories evaluated independently')
categories = re.findall(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*(.+)\|$',cat_section,re.M)
check([int(x[0]) for x in categories] == list(range(1,23)), 'Category coverage 1-22')
for n,name,result in categories:
    check('**Yes' in result or '**No' in result, f'No material disposition {name}')
    check(re.search(r'F\d{2}',result) and re.search(r'C\d{2}',result), f'No concern/requirement trace {name}')
for term in ['Accept with required amendments', 'required amendments explicitly ratified', '27/27', 'Subsequent explicit ratification']:
    check(term in main, f'Main status/evidence missing {term}')
check('**Answered A.**' in question, 'Q23 not answered')
check('supported activity types with personal customization' in question, 'Q23 customization absent')
check('All twenty-three review dispositions' in session, 'Session review count')
check('| D23 (answered Q23)' in session and '| E23 (P28 design)' in session,'Session D23/E23 absent')
check('D23 answer and completed adversarial review' in session, 'Session review missing')
check('Q23 awaits' not in session and 'Q23 is prepared and unanswered' not in session,'Session stale answer state')
check('Personal activity target** (Phase 28 D23, ratified)' in (ROOT/'CONTEXT.md').read_text(),'Glossary status missing')
check('D23 explicit ratification' in session, 'Session ratification missing')
q24=Q24.read_text()
check('**Awaiting founder answer.**' in q24 and 'Neither option' in q24, 'Q24 answer status')
check('first-release' in q24 and 'narrows' in q24, 'Q24 B narrowing not explicit')
check('Q24 awaits' in session and 'awaiting answer' in session, 'Session Q24 frontier status')
for path, expected in PINS.items():
    check(sha(E/path) == expected, f'Pinned artifact changed: {path}')
prior = read_json(E/'prior-evidence-sha256.json')
check(len(prior)==26,'Expected 26 prior artifacts')
for path,expected in prior.items():
    check((ROOT/path).exists() and sha(ROOT/path)==expected,f'Prior evidence changed {path}')
retained = read_json(E/'ratification-evidence-sha256.json')
check(len(retained)==13, 'Expected 13 initial D23 artifacts')
for path,expected in retained.items():
    check((E/path).exists() and sha(E/path)==expected,f'Initial D23 evidence changed {path}')
initial = read_json(E/'review-verification-initial.json')
check(initial['passed'] and initial['amendments_ratified'] is False and initial['q24_posed'] is False, 'Initial verification status changed')
probe = read_json(E/'counterexample-probe/results.json')
check(probe['case_count'] == probe['reproduced'] == len(probe['cases']) == 27,'Counterexample counts')
check(all(c['counterexample_reproduced'] for c in probe['cases']),'Counterexample not reproduced')
check(len({c['id'] for c in probe['cases']})==27,'Duplicate case ID')
manifest = read_json(E/'primary-sources.json')
check(len(manifest['fresh'])==5 and len(manifest['same_day_reused'])==6,'Source manifest counts')
source_checks, unavailable = [], []
for group in ['fresh','same_day_reused']:
    for row in manifest[group]:
        for path_key, hash_key in [('raw_path','sha256'),('path','sha256'),('text_path','text_sha256')]:
            if path_key not in row:
                continue
            path = Path(row[path_key])
            if not path.exists():
                unavailable.append(str(path))
                continue
            check(sha(path)==row[hash_key],f'Primary cached body changed: {path}')
        source_checks.append({'url':row['url'],'group':group,'fetched_at':row['fetched_at']})
check(manifest['fresh'][0]['fetched_at'] < min(x['fetched_at'] for x in manifest['fresh'][1:]),'Changelog not first')
db = (E/'database-target-lifecycle.md').read_text()
local_verified=[]
for path,digest in re.findall(r'\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{64})`\s*\|',db):
    if path.endswith('phase28-q23-activity-target-measures-research.md'):
        continue # Explicitly pre-answer snapshot; current answer is checked above.
    p=ROOT/path
    check(p.exists() and sha(p)==digest, f'Inspected unchanged local source differs: {path}')
    local_verified.append(path)
check(len(local_verified)==9, 'Expected nine unchanged local source snapshots')
report={
 'scope':'D23 document and provenance checks only; no probe or product command executed',
 'checked_at_utc':datetime.now(timezone.utc).isoformat(),
 'passed':not errors,'errors':errors,
 'local_references':refs,'line_references':lines,'anchor_references':anchors,
 'clauses':len(clauses),'proof_obligations':len(proofs),'material_findings':len(findings),'categories':len(categories),
 'selected':'A; supported activity types with personal customization',
 'amendments_ratified':True,'q24_posed':True,'q24_prepared_unanswered':True,
 'initial_d23_artifacts_unchanged':len(retained),
 'initial_verification_preserved':True,
 'prior_artifacts_unchanged':len(prior),
 'finite_counterexamples_reproduced':probe['reproduced'],
 'new_database_experiment':False,'prior_experiments_rerun':False,
 'technical_sources':source_checks,'unavailable_temporary_source_paths':unavailable,
 'unchanged_local_source_hashes':local_verified,
 'q23_hash_in_database_note':'pre-answer inspection snapshot; updated status verified separately',
 'new_artifact_pins':PINS,
 'document_sha256':{str(p.relative_to(ROOT)):sha(p) for p in files},
 'limits':['No actual Core source/P12/target command qualification','No hosted Supabase or provider test','No browser/accessibility/user study','No production workload proof']
}
OUTPUT.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','errors','local_references','line_references','anchor_references','clauses','proof_obligations','material_findings','categories','prior_artifacts_unchanged','finite_counterexamples_reproduced','amendments_ratified','q24_posed','q24_prepared_unanswered','initial_d23_artifacts_unchanged','unavailable_temporary_source_paths']},indent=2))
sys.exit(0 if report['passed'] else 1)
