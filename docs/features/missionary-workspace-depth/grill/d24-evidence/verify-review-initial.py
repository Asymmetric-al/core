#!/usr/bin/env python3
"""D24 document/provenance checks only. Does not run probes or product commands."""
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
MAIN = G / 'phase28-d24-coaching-activity-summary-adversarial-review.md'
Q = G / 'phase28-q24-coaching-activity-summary-research.md'
SESSION = G / 'phase28-session.md'
OUTPUT = E / 'review-verification.json'
errors = []
refs = lines = anchors = 0

def check(ok, message):
    if not ok:
        errors.append(message)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read_json(path):
    return json.loads(path.read_text())

def destinations(body):
    for match in re.finditer(r'\]\(', body):
        start = end = match.end()
        depth = 1
        while end < len(body) and depth:
            if body[end] == '(' and body[end - 1] != '\\':
                depth += 1
            elif body[end] == ')' and body[end - 1] != '\\':
                depth -= 1
            end += 1
        if depth == 0:
            yield body[start:end - 1].strip().strip('<>')

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

if not OUTPUT.exists():
    OUTPUT.write_text('{}\n')
files = [MAIN, Q, SESSION, *sorted(E.rglob('*.md'))]
for path in files:
    body = path.read_text()
    for n, line in enumerate(body.splitlines(), 1):
        check(line.rstrip() == line or (bool(line.strip()) and line.endswith('  ') and not line.endswith('   ') and line[:-2].rstrip() == line[:-2]), f'Trailing whitespace {path.name}:{n}')
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
        if not p.is_file():
            continue
        if lineno:
            lines += 1
            check(1 <= lineno <= len(p.read_text().splitlines()), f'Invalid line {path.name}: {dest}')
        if anchor:
            anchors += 1
            check(anchor in slugs(p.read_text()), f'Missing anchor {path.name}: {dest}')

main, question, session = MAIN.read_text(), Q.read_text(), SESSION.read_text()
clauses = re.findall(r'^### (C\d{2}) —', main, re.M)
proofs = re.findall(r'^\|\s*(P\d{2})\s*\|', main, re.M)
findings = re.findall(r'^\|\s*(F\d{2})\s*\|', main, re.M)
categories = re.findall(r'^\|\s*(\d+)\.\s*([^|]+)\|\s*\*\*(Yes|No[^*]*)\*\*\s*\|\s*([^\n]+)', main, re.M)
check(clauses == [f'C{i:02}' for i in range(1, 24)], 'C01-C23 missing/duplicate/order')
check(proofs == [f'P{i:02}' for i in range(1, 33)], 'P01-P32 missing/duplicate/order')
check(findings == [f'F{i:02}' for i in range(1, 15)], 'F01-F14 missing/duplicate/order')
check([int(x[0]) for x in categories] == list(range(1, 23)), 'Categories 1-22 missing/order')
for row in re.findall(r'^\|\s*F\d{2}\s*\|[^\n]+', main, re.M):
    columns = row.strip('|').split('|')
    check(len(columns) == 6 and all(c.strip() for c in columns), 'Finding lacks required dimension columns')
    check('/' in columns[2] and re.search(r'C\d{2}', columns[-1]), 'Finding lacks severity/likelihood or exact clause')
for number, name, state, result in categories:
    check(bool(re.search(r'F\d{2}', result)) and bool(re.search(r'C\d{2}', result)), f'Category trace missing {number}: {name}')
for term in ['Accept with required amendments', 'proposed, not ratified', '18/18', 'Explicit same-target continuation', 'One-off']:
    # Case-insensitive because one-off is in clause prose as well as capitalized journey text.
    check(term.lower() in main.lower(), f'Main missing {term}')
check('**Answered A.**' in question and 'continuation into' in question, 'Q24 status/clarification missing')
check('All twenty-four review dispositions' in session, 'Session review count')
check('| D24 (answered Q24)' in session and '| E24 (P28 design)' in session, 'Session D24/E24 missing')
check('D24 answer, clarification and completed adversarial review' in session, 'Session D24 completion missing')
check('Q24 awaits' not in session and 'Q24: optional activity summaries in coaching (awaiting answer)' not in session, 'Stale Q24 answer state')
check('Coaching activity summary** (Phase 28 D24, selected; amendments proposed)' in (ROOT / 'CONTEXT.md').read_text(), 'Glossary term/status missing')
check(not (G / 'phase28-q25').exists() and not re.search(r'^###? Q25[: —]', session, re.M), 'Q25 unexpectedly posed')

prior = read_json(E / 'prior-evidence-sha256.json')
check(len(prior) == 19, 'Expected nineteen prior pins')
for path, expected in prior.items():
    check((ROOT / path).is_file() and sha(ROOT / path) == expected, f'Prior evidence changed: {path}')
pins = read_json(E / 'artifact-pins.json')
for path, expected in pins.items():
    check((E / path).is_file() and sha(E / path) == expected, f'D24 retained artifact changed: {path}')
probe = read_json(E / 'counterexample-probe/results.json')
check(probe['case_count'] == probe['reproduced'] == len(probe['cases']) == 18, 'Counterexample count mismatch')
check(all(c['counterexample_reproduced'] for c in probe['cases']), 'Counterexample not reproduced')
check(len({c['id'] for c in probe['cases']}) == 18, 'Duplicate case ID')

manifest = read_json(E / 'primary-sources.json')
check(len(manifest['fresh']) == 1 and len(manifest['same_day_reused']) == 11, 'Technical source counts differ')
source_checks, unavailable = [], []
for group in ['fresh', 'same_day_reused']:
    for row in manifest[group]:
        for path_key, hash_key in [('raw_path', 'sha256'), ('text_path', 'text_sha256')]:
            if path_key not in row:
                continue
            path = Path(row[path_key])
            if not path.exists():
                unavailable.append(str(path))
            else:
                check(sha(path) == row[hash_key], f'Primary body changed: {path}')
        source_checks.append({'url': row['url'], 'group': group, 'original_fetch': row['fetched_at']})
db = (E / 'database-sharing-lifecycle.md').read_text()
local_verified = []
for path, digest in re.findall(r'\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{64})`\s*\|', db):
    if path.endswith('phase28-q24-coaching-activity-summary-research.md'):
        continue  # Explicitly marked pre-answer snapshot; current answer checked above.
    p = ROOT / path
    check(p.exists() and sha(p) == digest, f'Inspected unchanged local source differs: {path}')
    local_verified.append(path)
check(len(local_verified) == 10, 'Expected ten unchanged source hashes')
report = {
    'scope': 'D24 document/provenance verification only; no probe or product command',
    'checked_at_utc': datetime.now(timezone.utc).isoformat(),
    'passed': not errors, 'errors': errors,
    'local_references': refs, 'line_references': lines, 'anchor_references': anchors,
    'clauses': len(clauses), 'proof_obligations': len(proofs),
    'material_findings': len(findings), 'categories': len(categories),
    'selected': 'A; continue future periods of the same selected target',
    'amendments_ratified': False, 'q25_posed': False,
    'prior_artifacts_unchanged': len(prior), 'retained_d24_artifacts': pins,
    'finite_counterexamples_reproduced': probe['reproduced'],
    'new_database_experiment': False, 'prior_experiments_rerun': False,
    'technical_sources': source_checks,
    'unavailable_temporary_source_paths': unavailable,
    'unchanged_local_source_hashes': local_verified,
    'q24_hash_in_database_note': 'Explicit pre-answer inspection snapshot; updated answer checked separately',
    'document_sha256': {str(p.relative_to(ROOT)): sha(p) for p in files},
    'limits': ['No actual Core source/P12/summary command qualification', 'No hosted Supabase test', 'No browser/accessibility/user study', 'No production workload or inference-safe profile proof']
}
OUTPUT.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({k: report[k] for k in ['passed', 'errors', 'local_references', 'line_references', 'anchor_references', 'clauses', 'proof_obligations', 'material_findings', 'categories', 'prior_artifacts_unchanged', 'finite_counterexamples_reproduced', 'amendments_ratified', 'q25_posed', 'unavailable_temporary_source_paths']}, indent=2))
sys.exit(0 if report['passed'] else 1)
