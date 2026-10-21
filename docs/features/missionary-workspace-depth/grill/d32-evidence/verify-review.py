#!/usr/bin/env python3
"""Read-only D32 structural verification; never executes any semantic model."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
GRILL = HERE.parent
MAIN = GRILL / 'phase28-d32-combined-gift-fulfillment-follow-up-adversarial-review.md'
QUESTION = GRILL / 'phase28-q32-gift-and-fulfillment-follow-up-research.md'
SESSION = GRILL / 'phase28-session.md'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_manifest(path):
    data = json.loads(path.read_text())
    if 'artifacts' in data:
        entries = [(ROOT / x['path'], x['sha256']) for x in data['artifacts']]
    else:
        entries = [(GRILL / name, value) for name, value in data.items()]
    for target, expected in entries:
        assert target.is_file(), f'Missing artifact: {target}'
        assert digest(target) == expected, f'Changed artifact: {target}'
    return len(entries)


def slugs(path):
    result, seen = set(), {}
    for heading in re.findall(r'^#{1,6}\s+(.+)$', path.read_text(), re.M):
        heading = re.sub(r'<[^>]+>', '', heading).strip().lower()
        heading = re.sub(r'[^\w\-\s]', '', heading)
        slug = re.sub(r'\s', '-', heading)
        index = seen.get(slug, 0)
        result.add(slug if index == 0 else f'{slug}-{index}')
        seen[slug] = index + 1
    result.update(re.findall(r'<a\s+(?:id|name)="([^"]+)"', path.read_text()))
    return result


def main():
    body = MAIN.read_text()
    clauses = re.findall(r'^\*\*C(\d{2}) —', body, re.M)
    proof_section = body.split('## Acceptance criteria and release proof', 1)[1].split('## Ruthless synthesis', 1)[0]
    proofs = re.findall(r'^\| P(\d{2})\s*\|', proof_section, re.M)
    findings = re.findall(r'^\| F(\d{2})\s*\|', body, re.M)
    assert clauses == [f'{n:02}' for n in range(1, 25)], clauses
    assert proofs == [f'{n:02}' for n in range(1, 37)], proofs
    assert findings == [f'{n:02}' for n in range(1, 19)], findings
    cats = body.split('## Every requested review category', 1)[1].split('## Acceptance criteria', 1)[0]
    categories = [line for line in cats.splitlines() if line.startswith('| ') and '**Yes**' in line]
    assert len(categories) == 22, len(categories)
    assert 'A selected; this corrected decision and its engineering amendments await explicit ratification' in body
    assert 'No Q33 is posed' in body
    assert 'The founder explicitly selected **one organization-wide setting**' in body
    session = SESSION.read_text()
    assert 'All thirty-two review dispositions' in session
    assert '| D32 (answered Q32)' in session and '| E32 ' in session
    assert '### Q32: gift and commitment-fulfillment follow-up (answered A)' in session
    assert '### D32 answer and completed adversarial review' in session
    assert not re.search(r'^#{1,6}\s+Q33\b', session, re.M)
    assert '**The founder subsequently selected A.**' in QUESTION.read_text()
    assert '**Q32 is unanswered.**' in (HERE / 'q32-before-answer.txt').read_text()
    assert '**Combined gift and fulfillment follow-up** (Phase 28 D32, A selected; amendments pending):' in (ROOT / 'CONTEXT.md').read_text()
    previous = (GRILL / 'phase28-d31-confirmed-excess-follow-up-adversarial-review.md').read_text()
    assert 'required amendments were explicitly ratified on October 18, 2026 UTC' in previous
    preserved = {'D31': check_manifest(HERE / 'prior-evidence-sha256.json'),
                 'D30': check_manifest(GRILL / 'd31-evidence/prior-evidence-sha256.json'),
                 'D29': check_manifest(GRILL / 'd30-evidence/prior-evidence-sha256.json')}
    pins = check_manifest(HERE / 'artifact-pins.json')
    model = json.loads((HERE / 'combined-counterexamples.json').read_text())
    initial = json.loads((HERE / 'initial-model.json').read_text())
    reproduction = json.loads((HERE / 'root-reproduction.json').read_text())
    assert initial['script_sha256'] == digest(HERE / 'initial-model.py.txt')
    assert initial['counts']['passed_outcome_assertions'] == 112
    assert model['script_sha256'] == digest(HERE / 'combined-counterexamples.py')
    assert model['counts']['passed_outcome_assertions'] > initial['counts']['passed_outcome_assertions']
    assert reproduction['byte_identical'] is True
    assert reproduction['expected_sha256'] == reproduction['actual_sha256'] == digest(HERE / 'combined-counterexamples.json')
    assert reproduction['script_sha256'] == model['script_sha256']
    assert reproduction['counts'] == model['counts']
    sources = [MAIN, QUESTION, SESSION, ROOT / 'CONTEXT.md', *sorted(HERE.glob('*.md'))]
    links = lines = anchors = 0
    slug_cache = {}
    for source in sources:
        for raw in re.findall(r'\[[^\]\n]+\]\(([^\s()]+)\)', source.read_text()):
            raw = unquote(raw.strip('<>'))
            if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', raw):
                continue
            target, _, anchor = raw.partition('#')
            match = re.search(r':(\d+)$', target)
            line = int(match[1]) if match else None
            if match:
                target = target[:match.start()]
            path = (source.parent / target).resolve() if target else source
            assert path.exists(), f'Broken link in {source}: {raw}'
            links += 1
            if line:
                assert line <= len(path.read_text().splitlines()), f'Bad line: {raw}'
                lines += 1
            if anchor and path.suffix == '.md':
                if path not in slug_cache:
                    slug_cache[path] = slugs(path)
                assert anchor in slug_cache[path], f'Bad anchor in {source}: {raw}'
                anchors += 1
    for path in [MAIN, QUESTION, SESSION, HERE / 'verify-review.py', *HERE.glob('*.md')]:
        assert not re.search(r'^(<<<<<<<|=======|>>>>>>>)', path.read_text(), re.M), path
        assert not any(line.rstrip() != line for line in path.read_text().splitlines()), path
    print(json.dumps({
        'date': '2026-10-18', 'status': 'passed',
        'scope': 'D32 research status, structural completeness, links and preserved evidence only',
        'review': {'clauses': len(clauses), 'proofs': len(proofs), 'findings': len(findings), 'categories': len(categories)},
        'preserved_prior_artifacts': preserved, 'current_pinned_artifacts': pins,
        'model': model['counts'], 'initial_D32_model': 'retained; revised after root found missing semantic cases',
        'root_reproduction': 'recorded byte-identical execution of current D32 model only; no model executed by verifier',
        'links': {'local': links, 'line_references': lines, 'anchors': anchors, 'source_documents': len(sources)},
        'status_checks': ['Q32 A selected', 'D32 corrected amendments pending ratification', 'organization-wide scope explicitly selected by founder', 'D31 remains ratified', 'no Q33 posed', 'conceptual glossary consistent'],
        'limits': 'No real financial source, SQL/RLS, locks/concurrency, provider, migration, performance, accessibility or usability qualification. No earlier model/probe/verifier executed.'
    }, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
