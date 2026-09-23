"""Validate only local specification structure and traceability, not Core behavior."""
from __future__ import annotations
import json
from pathlib import Path
import re
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
checks: list[str] = []

def load(name): return json.loads((ROOT/name).read_text(encoding='utf-8'))
def expect(condition: bool, message: str):
    (checks if condition else errors).append(message)

def unique(items,key,label):
    vals=[x[key] for x in items]
    expect(len(vals)==len(set(vals)),f'{label}: identifiers are unique')
    return set(vals)

reqs=load('requirements.json');tasks=load('tasks.json');wfs=load('workflows.json');autos=load('automations.json');sources=load('research/sources.json');trace=load('traceability.json')
rids=unique(reqs,'id','Requirements');tids=unique(tasks,'id','Tasks');wids=unique(wfs,'id','Workflows');aids=unique(autos,'id','Automations');sids=unique(sources,'id','Evidence')
expect(len(reqs)==48,'48 normative requirements')
expect(len(wfs)==18,'18 product workflows')
expect(len(autos)==12,'12 fixed automations')
scenarios=[s for r in reqs for s in r['scenarios']]
unique(scenarios,'id','Scenarios')
expect(len(scenarios)==96,'96 specified implementation scenarios')
covered=set()
for r in reqs:
    expect(r['task'] in tids,f"{r['id']}: valid task")
    expect(set(r['workflows'])<=wids,f"{r['id']}: valid workflow references")
    expect(set(r['sources'])<=sids,f"{r['id']}: valid evidence references")
    expect('SHALL' in r['requirement'],f"{r['id']}: normative SHALL clause")
    expect(len(r['scenarios'])==2 and all(s['given'] and s['when'] and s['then'] for s in r['scenarios']),f"{r['id']}: positive/adverse scenarios specified")
    covered.update(r['workflows'])
expect(covered==wids,'Every workflow has requirement/scenario coverage')
for a in autos:
    expect(set(a['workflows'])<=wids,f"{a['id']}: valid workflow references")
    expect(all(a[k] for k in ['owner','effect_identity','effect','retry','cancellation','visibility']),f"{a['id']}: owner, effect, recovery and visibility specified")
for t in tasks:
    expect(set(t['dependencies'])<=tids,f"{t['id']}: valid dependencies")
    expect(t['status']=='not-started',f"{t['id']}: no invented completion")
    expect(set(t['requirements'])=={r['id'] for r in reqs if r['task']==t['id']},f"{t['id']}: inverse coverage agrees")
lookup={t['id']:t for t in tasks}
seen=set();visiting=set()
def visit(tid):
    if tid in visiting: raise ValueError('dependency cycle at '+tid)
    if tid in seen:return
    visiting.add(tid)
    for dep in lookup[tid]['dependencies']:visit(dep)
    visiting.remove(tid);seen.add(tid)
try:
    for tid in tids:visit(tid)
    expect(True,'Implementation dependency graph is acyclic')
except ValueError as exc: expect(False,str(exc))
expect(trace['requirements']==reqs and trace['tasks']==tasks,'Traceability matches canonical requirement/task JSON')
spec=(ROOT/'specs/web-studio-hybrid-authoring/spec.md').read_text()
expect(len(re.findall(r'^### Requirement: HW-\d+',spec,re.M))==48,'OpenSpec-formatted document contains all 48 requirements')
expect(len(re.findall(r'^#### Scenario: HW-\d+-[AB]',spec,re.M))==96,'OpenSpec-formatted document contains all 96 scenarios')
expect(not re.search(r'^- \[[xX]\]',(ROOT/'tasks.md').read_text(),re.M),'Task checklist contains no completed implementation items')
# Check local Markdown file targets, not remote network availability or fragment semantics.
links=0
for p in ROOT.rglob('*.md'):
    if p.name=='MASTER.md':continue
    txt=p.read_text(encoding='utf-8')
    # Strip fenced code to avoid interpreting example syntax as real document links.
    txt=re.sub(r'(?ms)^```.*?^```\s*$', '',txt)
    for target in re.findall(r'(?<!!)\[[^\]\n]+\]\(([^)\s]+)\)',txt):
        parsed=urlsplit(target)
        if parsed.scheme or parsed.netloc or not parsed.path:continue
        path=(p.parent/unquote(parsed.path)).resolve()
        links+=1
        if not path.exists():errors.append(f'Missing local link: {p.relative_to(ROOT)} -> {target}')
expect(not any(e.startswith('Missing local link') for e in errors),f'{links} local Markdown link targets exist')
for p in ROOT.rglob('*.json'):
    if p.name=='MANIFEST.json':continue
    try:json.loads(p.read_text());checks.append(f'JSON parsed: {p.relative_to(ROOT)}')
    except Exception as exc:errors.append(f'{p}: {exc}')
print('ASym Web Studio specification structural validation')
print('Scope: documentation, JSON, links and traceability only. No Core runtime/OpenSpec CLI/provider/browser proof.')
print(f'Workflows={len(wfs)} Automations={len(autos)} Requirements={len(reqs)} Scenarios={len(scenarios)} Tasks={len(tasks)} Evidence={len(sources)}')
print(f'Checks passed: {len(checks)}; failures: {len(errors)}')
for e in errors:print('FAIL:',e)
if not errors: print('PASS: all checked specification relationships are consistent.')
raise SystemExit(1 if errors else 0)
