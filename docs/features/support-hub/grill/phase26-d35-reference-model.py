"""Finite D35 requirement examples. Not Core code or SQL/RLS/concurrency proof.

Time values are toy units; they do not propose a product retention duration.
The model is deliberately sequential. Competing operations are represented by
every ordering for a small fixture, not by real concurrent database execution.
"""
from dataclasses import dataclass, field
from itertools import permutations
from pathlib import Path
import json

@dataclass
class Note:
    tenant: str = 't1'
    author: str = 'maya'
    human: bool = True
    body: str = 'Tuesday'
    head: int = 1
    privacy: int = 1
    topology: int = 1
    deadline: int = 100
    allowed: bool = True
    published: int = 1
    files: tuple = ('file1',)
    refs: frozenset = frozenset({'mention1','image1'})
    versions: dict = field(default_factory=lambda:{1:'Tuesday'})
    hidden: set = field(default_factory=set)
    receipts: dict = field(default_factory=dict)
    response_cache: dict = field(default_factory=dict)
    new_notes: int = 0
    notifications: int = 0

    def save(self,key,body,base=1,privacy=1,topology=1,tenant='t1',actor='maya',now=10,refs=None):
        if refs is None: refs=self.refs
        if tenant!=self.tenant or actor!=self.author or not self.allowed or not self.human or now>=self.deadline:
            return 'unavailable'
        meaning=(tenant,actor,base,privacy,topology,body,tuple(sorted(refs)))
        if key in self.receipts:
            old,result=self.receipts[key]
            return result if old==meaning else 'meaning-conflict'
        if (base,privacy,topology)!=(self.head,self.privacy,self.topology):return 'base-conflict'
        if not set(refs).issubset(self.refs):return 'invalid-reference'
        if body==self.body and refs==self.refs:
            result=('unchanged',self.head)
        else:
            self.head+=1;self.body=body;self.refs=frozenset(refs);self.versions[self.head]=body
            result=('saved',self.head)
        self.receipts[key]=(meaning,result);self.response_cache[key]=result
        return result

    def lookup(self,key,tenant='t1',actor='maya',now=10):
        if tenant!=self.tenant or actor!=self.author or not self.allowed or now>=self.deadline:return None
        return self.receipts.get(key,(None,None))[1]

    def read(self,version,tenant='t1',now=10):
        if tenant!=self.tenant or not self.allowed or now>=self.deadline or version in self.hidden:return None
        return self.versions.get(version)

checks=[]
def check(name,value):
    assert value,name
    checks.append({'name':name,'passed':True})

n=Note();r=n.save('op1','Thursday')
check('one correction keeps note publication and file membership',r==('saved',2) and n.published==1 and n.files==('file1',))
check('correction is no new note or notification',n.new_notes==n.notifications==0)
check('permitted original remains deliberate history',n.read(1)=='Tuesday' and n.read(2)=='Thursday')
check('identical retry has one effect',n.save('op1','Thursday')==r and n.head==2)
check('changed operation meaning conflicts',n.save('op1','Friday')=='meaning-conflict')
for order in permutations([('a','Thursday'),('b','Friday')]):
    n=Note();out=[n.save(k,v) for k,v in order]
    check('one winner from same base '+order[0][0],sum(isinstance(x,tuple) and x[0]=='saved' for x in out)==1 and n.head==2)
n=Note();check('same tenant different author rejected',n.save('a','x',actor='sam')=='unavailable')
check('different tenant rejected',n.save('a','x',tenant='t2')=='unavailable')
n.human=False;check('generated note kind not human editing',n.save('a','x')=='unavailable')
n=Note();noop=n.save('empty','Tuesday');n.response_cache.clear()
check('no-op binds identity beyond response cache',noop==('unchanged',1) and n.save('empty','Thursday')=='meaning-conflict' and n.head==1)
n=Note();n.save('a','Thursday');n.save('b','Tuesday',base=2)
check('ABA content equality does not accept stale base',n.body=='Tuesday' and n.save('c','Tuesday',base=1)=='base-conflict')
n=Note();n.privacy=2
check('old privacy fence cannot write',n.save('a','secret')=='base-conflict')
n=Note();n.topology=2
check('old topology fence cannot retarget write',n.save('a','Thursday')=='base-conflict')
n=Note();check('deadline equality denies save and history',n.save('a','Thursday',now=100)=='unavailable' and n.read(1,now=100) is None)
n=Note();n.save('a','Thursday');check('edit does not renew retention deadline',n.deadline==100)
check('lost response reconciles read-only',n.lookup('a')==('saved',2) and n.head==2 and len(n.receipts)==1)
n.save('b','Friday',base=2)
check('old result and current head stay distinct',n.lookup('a')==('saved',2) and n.body=='Friday' and n.head==3)
n.allowed=False;check('replay cannot expose after authority loss',n.lookup('a') is None and n.read(1) is None)
n=Note();n.save('a','No inline picture',refs=frozenset())
check('natural reference deletion preserves actual files',not n.refs and n.files==('file1',) and n.notifications==0)
n=Note();check('new typed target rejected',n.save('a','hi',refs=frozenset({'mention2'}))=='invalid-reference')
n=Note(body='secret moved');n.versions={1:'secret earlier'};n.save('a','safe current');n.hidden.add(1)
check('unsafe older correspondence is not exposed',n.read(1) is None and n.read(2)=='safe current')
n=Note();n.save('a','Thursday');current_hits=[n.head] if 'Thursday' in n.body else [];old_hits=[n.head] if 'Tuesday' in n.body else []
check('current-head search excludes retained old term',current_hits==[2] and not old_hits and n.read(1)=='Tuesday')
n=Note();before=(n.head,n.body,len(n.receipts));n.lookup('unknown')
check('lookup of unknown operation creates nothing',before==(n.head,n.body,len(n.receipts)))

# Deliberately broken alternatives, shown as counterexamples rather than fixes.
counterexamples=[]
body='Tuesday';body='Thursday';body='Friday'
counterexamples.append({'name':'blind overwrite loses first same-base correction','reproduced':body=='Friday'})
noop_registry={};same_key_would_be_available='no-op' not in noop_registry
counterexamples.append({'name':'unrecorded no-op permits changed key reuse','reproduced':same_key_would_be_available})
old_version='private value';current_version='removed'
counterexamples.append({'name':'redacting current body alone leaves older value visible','reproduced':'private' in old_version and 'private' not in current_version})
saved_text='A';old_base_text='A';different_head=True
counterexamples.append({'name':'text equality alone misses ABA stale base','reproduced':saved_text==old_base_text and different_head})
assert all(x['reproduced'] for x in counterexamples)
result={'date':'2026-09-14','status':'passed','scope':'finite sequential requirement model only; no Core implementation, real auth/SQL/RLS, concurrent DB, provider, browser, performance or usability proof','checkCount':len(checks),'checks':checks,'counterexamples':counterexamples,'releaseGroupsExecuted':0}
Path(__file__).with_name('phase26-d35-reference-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'status':'passed','syntheticChecks':len(checks),'naiveCounterexamples':len(counterexamples),'actualReleaseGroupsExecuted':0}))
