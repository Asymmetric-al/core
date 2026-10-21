#!/usr/bin/env python3
"""New D42 ratification documentary verifier; old programs are bytes only."""
import difflib
import hashlib
import html
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
GRILL = HERE.parent
ROOT = HERE.parents[4]
REPORT = HERE / 'ratification-verification.json'
MANIFEST = HERE / 'ratification-evidence-sha256.json'
MAIN = GRILL / 'phase28-d42-verified-email-newsletter-signup-adversarial-review.md'
Q42 = GRILL / 'phase28-q42-newsletter-confirmation-research.md'
Q43 = GRILL / 'phase28-q43-pending-newsletter-confirmation-research.md'
SESSION = GRILL / 'phase28-session.md'
COVERAGE = GRILL / 'phase28-post-d41-coverage-synthesis.md'
COMPLETE = GRILL / 'phase28-completeness-adversarial-review.md'
CONTEXT = ROOT / 'CONTEXT.md'
DOCS = [MAIN, Q42, SESSION, COVERAGE, COMPLETE, Q43, HERE / 'ratification-scope.md', HERE / 'q43-primary-research.md']
errors, checks = [], {}


def require(ok, message):
    if not ok:
        errors.append(message)


def relative(path):
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalize(text):
    return ' '.join(text.split())


# Only explicit *sha256.json entries are interpreted recursively. Historical
# artifact-pins and result files are compared as immutable bytes, never as current
# mutation instructions, imported modules or executable validation programs.
hex64 = re.compile(r'[0-9a-f]{64}\Z')
manifests, frozen, comparisons = set(), set(), []


def pairs(node):
    if isinstance(node, list):
        for item in node:
            yield from pairs(item)
    elif isinstance(node, dict):
        value, path = node.get('sha256'), node.get('snapshot') or node.get('path')
        if isinstance(value, str) and hex64.fullmatch(value) and isinstance(path, str):
            yield path, value
        for key, value in node.items():
            if isinstance(value, str) and hex64.fullmatch(value):
                if '/' in key or re.search(r'\.(?:md|json|txt|py|sql)$', key):
                    yield key, value
                elif key.endswith('_before_answer_sha256'):
                    yield key.removesuffix('_sha256').replace('_', '-') + '.txt', value
            elif isinstance(value, (dict, list)):
                yield from pairs(value)


def locate(raw, manifest):
    p = Path(raw)
    choices = [p] if p.is_absolute() else [ROOT / p, manifest.parent / p, GRILL / p]
    return next((x.resolve() for x in choices if x.is_file()), choices[0].resolve())


def preserve(manifest):
    manifest = manifest.resolve()
    if manifest in manifests:
        return
    manifests.add(manifest)
    require(manifest.name.endswith('sha256.json'), 'Non-manifest recursive input')
    try:
        data = json.loads(manifest.read_text())
    except (OSError, ValueError) as exc:
        errors.append(f'Cannot read {relative(manifest)}: {exc}')
        return
    entries = list(pairs(data))
    require(bool(entries), f'No preservation entries in {relative(manifest)}')
    for raw, expected in entries:
        path = locate(raw, manifest)
        good = path.is_file() and digest(path) == expected
        comparisons.append((relative(manifest), relative(path), good))
        require(good, f'Frozen artifact mismatch/missing: {relative(path)} from {relative(manifest)}')
        if path.is_file():
            frozen.add(path)
            if path.name.endswith('sha256.json'):
                preserve(path)


preserve(MANIFEST)
root_manifest = json.loads(MANIFEST.read_text())
require(len(root_manifest.get('files', [])) == 21, 'Expected 21 explicit ratification preservation entries')
require(digest(CONTEXT) == root_manifest.get('unchanged_context_sha256'), 'CONTEXT must remain byte-identical during D42 ratification')
checks['preservation'] = {'direct_ratification_entries': len(root_manifest.get('files', [])), 'manifest_count': len(manifests), 'unique_frozen_files': len(frozen), 'hash_comparisons': len(comparisons), 'all_match': all(x[2] for x in comparisons), 'CONTEXT_unchanged': digest(CONTEXT) == root_manifest.get('unchanged_context_sha256'), 'manifests': sorted(relative(p) for p in manifests), 'artifact_pins_are_bytes_only': True}

for path in DOCS:
    require(path.is_file(), f'Missing current document: {relative(path)}')
texts = {p: p.read_text() if p.is_file() else '' for p in DOCS}
main, prior = texts[MAIN], (HERE / 'review-before-ratification.txt').read_text()


def sections(text, prefix):
    headings = list(re.finditer(r'^#{1,3} [^\n]+', text, re.M))
    result = {}
    for i, heading in enumerate(headings):
        match = re.match(r'### (' + prefix + r'\d{2})\s+—', heading.group())
        if match:
            end = headings[i + 1].start() if i + 1 < len(headings) else len(text)
            result[match.group(1)] = normalize(text[heading.start():end])
    return result


def numbered_rows(text, prefix):
    return [(m.group(1), normalize(m.group(0))) for m in re.finditer(r'^\|\s*(' + prefix + r'\d{2})\s*\|[^\n]+$', text, re.M)]


def decision(text):
    match = re.search(r'^## Exact corrected decision to record\s*\n([\s\S]*?)(?=^## |\Z)', text, re.M)
    if not match:
        return ''
    return normalize('\n'.join(line for line in match.group(1).splitlines() if line.startswith('>')))


old_c, new_c = sections(prior, 'C'), sections(main, 'C')
expected_c = [f'C{i:02}' for i in range(1, 25)]
require(list(new_c) == expected_c, 'D42 needs exactly ordered C01–C24')
require(all(new_c.get(k) == v for k, v in old_c.items() if k != 'C24'), 'An adopted C01–C23 requirement changed')
require(decision(main) == decision(prior) and bool(decision(main)), 'Corrected decision block changed')
old_tail = old_c.get('C24', '').partition('D6 pending-after-Page-Off')[2]
new_tail = new_c.get('C24', '').partition('D6 pending-after-Page-Off')[2]
require(bool(old_tail) and new_tail == old_tail, 'C24 changed beyond its opening adoption-status sentence')
require('ratified' in new_c.get('C24', '').partition('D6 pending-after-Page-Off')[0].lower(), 'C24 must record ratification')
old_p, new_p = numbered_rows(prior, 'P'), numbered_rows(main, 'P')
require(new_p == old_p and [x[0] for x in new_p] == [f'P{i:02}' for i in range(1, 41)], 'Future proof P01–P40 changed')
findings = list(sections(main, 'F'))
require(findings == [f'F{i:02}' for i in range(1, 13)], 'D42 finding structure differs from F01–F12')


def categories(text):
    return [(int(m.group(1)), normalize(m.group(2)), normalize(m.group(3))) for m in re.finditer(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^\n]+)\|$', text, re.M)]


old_categories, current_categories = categories(prior), categories(main)
require(current_categories == old_categories, 'Adversarial category review changed during ratification')
require([r[0] for r in current_categories] == list(range(1, 23)) and len({r[1] for r in current_categories}) == 22, 'Need 22 unique numbered categories')
require(all(re.match(r'\*\*(?:Yes\b|No\b)', r[2]) for r in current_categories), 'Every category needs an explicit material-concern disposition')
checks['adopted_content_preserved'] = {'corrected_decision_unchanged': decision(main) == decision(prior), 'C01_C23_unchanged': all(new_c.get(k) == v for k, v in old_c.items() if k != 'C24'), 'C24_only_opening_status_changed': bool(old_tail) and new_tail == old_tail, 'requirements': len(new_c), 'findings': len(findings), 'future_proof_rows': len(new_p), 'P01_P40_unchanged': new_p == old_p, 'categories': len(current_categories), 'category_yes': sum(x[2].startswith('**Yes') for x in current_categories), 'category_no': sum(x[2].startswith('**No') for x in current_categories)}

# Ratification of planning intent must never become implementation qualification.
head = normalize(main[:1800]).lower()
ratification_section = re.search(r'^## Explicit ratification\s*\n([\s\S]*?)(?=^## |\Z)', main, re.M)
ratification_text = normalize(ratification_section.group(1)).lower() if ratification_section else ''
require('explicitly' in head and 'ratified' in head and 'c01–c24' in ratification_text and 'adopts' in ratification_text, 'Main current header and explicit ratification must adopt D42/C01–C24')
require('not separately ratified' not in head, 'Main current header retains obsolete unratified status')
require(re.search(r'^## Explicit ratification', main, re.M) is not None, 'D42 needs explicit ratification record')
require('not blanket d6 adoption' in normalize(main).lower(), 'D42 must preserve non-blanket D6 boundary')
q42_head = normalize(texts[Q42][:1400]).lower()
require('answered b' in q42_head and 'ratified' in q42_head and 'not separately ratified' not in q42_head, 'Q42 current header must state B ratified')
q43_head = normalize(texts[Q43][:2200]).lower()
require('q43' in q43_head and 'unanswered' in q43_head, 'Q43 must remain explicitly unanswered')
require('d43' not in q43_head or re.search(r'no d43|not.*d43', q43_head) is not None, 'Q43 must not invent a D43 answer')
register = re.search(r'^\|\s*D42 \(answered Q42\)\s*\|[^\n]+$', texts[SESSION], re.M)
require(bool(register) and 'ratified' in register.group().lower() and 'not separately ratified' not in register.group().lower(), 'Session D42 current register row must be ratified')
q43_register = re.search(r'^\|\s*Q43\s*\|[^\n]+$', texts[SESSION], re.M)
require(bool(q43_register) and 'unanswered' in q43_register.group().lower(), 'Session Q43 current row must be unanswered')
require('ratified' in normalize(texts[COVERAGE]).lower() and Q43.name in texts[COVERAGE], 'Coverage must link the next unanswered Q43 frontier')
require('d42 amendments are explicitly ratified' in normalize(texts[COMPLETE]).lower() and 'q43' in normalize(texts[COMPLETE]).lower(), 'Completeness current status must recognize ratified D42 and the Q43 frontier')
require('unadopted choices' in normalize(main).lower() and 'pending-after-page-off' in normalize(main).lower(), 'Remaining D6 lifecycle/retention boundary missing')
checks['current_status'] = {'D42': 'explicitly ratified planning intent', 'Q42': 'B ratified', 'Q43': 'unanswered', 'blanket_D6_adoption': False, 'runtime_qualification': False}

# Existing completeness requirements and pre-D42 session history are not reopened.
old_complete = (HERE / 'completeness-before-ratification.txt').read_text()
require(sections(old_complete, 'C') == sections(texts[COMPLETE], 'C'), 'Ratified completeness C01–C20 changed')
checks['completeness_requirements_unchanged'] = sections(old_complete, 'C') == sections(texts[COMPLETE], 'C')
change_inventory = {}
for current, snap in [(MAIN, 'review-before-ratification.txt'), (Q42, 'q42-before-ratification.txt'), (SESSION, 'session-before-ratification.txt'), (COVERAGE, 'coverage-before-ratification.txt'), (COMPLETE, 'completeness-before-ratification.txt')]:
    previous, now = (HERE / snap).read_text().splitlines(), texts[current].splitlines()
    change_inventory[relative(current)] = [{'kind': op, 'old_start': a + 1, 'old_end': b, 'new_start': c + 1, 'new_end': d} for op, a, b, c, d in difflib.SequenceMatcher(a=previous, b=now, autojunk=False).get_opcodes() if op != 'equal']
checks['current_document_change_inventory'] = change_inventory


def no_fences(text):
    result, fence = [], None
    for line in text.splitlines():
        marker = re.match(r'^\s*(`{3,}|~{3,})', line)
        if marker:
            kind = marker.group(1)[0]
            if fence is None:
                fence = kind
            elif fence == kind:
                fence = None
            result.append('')
        else:
            result.append(line if fence is None else '')
    return '\n'.join(result)


def targets(text):
    text = no_fences(text)
    for match in re.finditer(r'(?<!!)\[[^\]\n]+\]\(', text):
        begin, pos, depth, angle = match.end(), match.end(), 1, False
        while pos < len(text) and depth:
            char = text[pos]
            if char == '<' and pos == begin:
                angle = True
            elif char == '>' and angle:
                angle = False
            elif not angle and char == '(' and text[pos - 1] != '\\':
                depth += 1
            elif not angle and char == ')' and text[pos - 1] != '\\':
                depth -= 1
            pos += 1
        if depth:
            errors.append('Unterminated Markdown link destination')
            continue
        raw = text[begin:pos - 1].strip()
        if raw.startswith('<'):
            yield raw[1:raw.find('>')]
        else:
            yield re.split(r'\s+["\']', raw, maxsplit=1)[0]
    for match in re.finditer(r'^\s{0,3}\[[^\]]+\]:\s*(<[^>]+>|\S+)', text, re.M):
        yield match.group(1).strip('<>')


anchor_cache = {}


def anchors(path):
    if path in anchor_cache:
        return anchor_cache[path]
    text, counts = path.read_text(), {}
    result = set(re.findall(r'<(?:a|span)\b[^>]*\b(?:id|name)=["\']([^"\']+)', text, re.I))
    for line in no_fences(text).splitlines():
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$', line)
        if not match:
            continue
        title = html.unescape(match.group(1))
        title = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', title)
        title = re.sub(r'<[^>]+>', '', title)
        slug = re.sub(r'[^\w\-\s]', '', title.lower()).strip()
        slug = re.sub(r'\s', '-', slug)
        n = counts.get(slug, 0)
        counts[slug] = n + 1
        result.add(slug + (f'-{n}' if n else ''))
    anchor_cache[path] = result
    return result


links = lines = heading_refs = remote = 0
for doc, text in texts.items():
    for raw in targets(text):
        if re.match(r'(?:https?|mailto|app|skill|codex|data):|[a-zA-Z][a-zA-Z0-9+.-]*://', raw) or raw.startswith('//'):
            remote += 1
            continue
        target, _, fragment = unquote(html.unescape(raw)).partition('#')
        target = target.split('?', 1)[0]
        line = re.search(r':(\d+)(?:[-–](\d+))?$', target)
        interval = (int(line.group(1)), int(line.group(2) or line.group(1))) if line else None
        if line:
            target = target[:line.start()]
        path = (doc.parent / target).resolve() if target else doc.resolve()
        links += 1
        exists = path.is_file() or path == REPORT.resolve()
        require(exists, f'Broken local link in {relative(doc)}: {raw}')
        if not exists:
            continue
        if interval:
            lines += 1
            require(1 <= interval[0] <= interval[1] <= len(path.read_text().splitlines()), f'Line bounds failure in {relative(doc)}: {raw}')
        if fragment:
            line_fragment = re.fullmatch(r'L(\d+)(?:-L?(\d+))?', fragment)
            if line_fragment:
                lines += 1
                lo, hi = int(line_fragment.group(1)), int(line_fragment.group(2) or line_fragment.group(1))
                require(1 <= lo <= hi <= len(path.read_text().splitlines()), f'Fragment line bounds failure: {raw}')
            else:
                heading_refs += 1
                require(fragment in anchors(path), f'Missing anchor in {relative(doc)}: {raw}')
checks['local_references'] = {'documents': len(DOCS), 'links': links, 'line_bounds': lines, 'anchors': heading_refs, 'external_links_not_retrieved_by_verifier': remote, 'angle_paths_and_balanced_parentheses_supported': True}
current_artifacts = DOCS + [CONTEXT, MANIFEST, Path(__file__).resolve()]
report = {'scope': 'New D42 ratification documentary verifier only; prior programs/model are preserved bytes and never executed or imported.', 'all_checks_pass': not errors, 'checks': checks, 'errors': errors, 'current_sha256': {relative(p): digest(p) for p in current_artifacts if p.is_file()}, 'limits': ['Ratification records adopted planning intent, not implementation or release qualification.', 'No prior checker/model, application test, SQL, migration, live database, Auth service, provider or browser was executed.', 'Manifest preservation and local link/line/anchor checks prove documentary integrity, not the semantic correctness of every cited claim.', 'Historical statements retain their original dated status; current headers/registers and ratification records control.', 'The root-document change inventory is descriptive; explicit content comparisons cover the corrected decision, C01–C23, C24 non-status tail, all P rows, categories and completeness requirements.', 'External primary research is recorded separately; this checker does not refetch external URLs.']}
REPORT.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'all_checks_pass': not errors, 'errors': errors, 'manifests': len(manifests), 'frozen_files': len(frozen), 'hash_comparisons': len(comparisons), 'local_links': links, 'line_bounds': lines, 'anchors': heading_refs, 'report': relative(REPORT)}, indent=2))
sys.exit(0 if not errors else 1)
