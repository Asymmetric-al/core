# Q53 isolated reference model — assumptions, two actual runs and limits

2026-10-26. This is executable research, not application implementation or native qualification. Both runs passed 5,040 serial orders, 10 named groups and three intentionally unsafe toy countermodels. Run two explicitly adds disposal-policy/retention/coverage inputs and denied branches after independent review found that settled uploads alone do not grant disposal. Atomic source commit, immutable adapter behavior and trustworthy fresh input predicates remain assumptions. No database, provider, role, UI, accessibility, load or bill test is represented.

## Initial run

```python
"""Q53 logical assumption checks only. No native database, provider or application code."""
from dataclasses import dataclass
from itertools import permutations
from pathlib import Path
import hashlib,json

@dataclass
class Intake:
    source_open: bool=True
    authority: bool=True
    intent_valid: bool=True
    disclose: bool=True
    verified: bool=True
    bytes_present: bool=True
    grant_live: bool=True
    inflight: int=1
    cancelled: bool=False
    admitted: bool=False
    reference: bool=False
    hold: bool=False
    processor_claim: bool=False
    delete_claimed: bool=False
    retired: bool=False
    effects: int=0
    receipt_actor: str|None=None
    original_intent: str='one-bound-intake'

    def finalize(self,intent='one-bound-intake'):
        if intent!=self.original_intent:return 'conflict'
        if self.admitted:return 'original-added' if self.disclose else 'unavailable'
        if not self.disclose:return 'unavailable'
        if not (self.source_open and self.authority and self.intent_valid):return 'not-added'
        if self.cancelled or self.delete_claimed or self.retired:return 'not-added'
        if not self.verified or not self.bytes_present:return 'not-added'
        # Atomic assumed source boundary; actual DB/provider proof is still required.
        self.admitted=self.reference=True;self.effects+=1;self.receipt_actor='actual-staff'
        return 'added'

    def cancel(self):
        if self.admitted:return 'already-added'
        self.cancelled=True;return 'intake-cancelled'

    def expire(self):self.grant_live=False
    def close(self):self.source_open=False
    def finish(self):
        if not self.inflight:return 'no-inflight'
        self.inflight-=1
        # Qualified immutable-target contract, not proof a provider enforces it.
        if self.retired or self.delete_claimed or self.admitted:return 'no-write'
        if self.bytes_present:return 'existing-object-no-overwrite'
        self.bytes_present=True;return 'staged-only'

    def claim_delete(self):
        if self.reference or self.hold or self.processor_claim:return 'protected'
        if self.grant_live or self.inflight:return 'writer-not-settled'
        self.delete_claimed=True;return 'claimed'

    def lease_expired(self):
        # A possibly executing physical delete remains fenced despite lease expiry.
        return 'claim-remains-fenced' if self.delete_claimed else 'no-claim'

    def delete(self):
        if not self.delete_claimed:return 'not-claimed'
        assert not (self.reference or self.hold or self.processor_claim)
        assert not self.grant_live and self.inflight==0
        self.bytes_present=False;self.retired=True;return 'physically-absent-model'

    def invariant(self):
        assert self.effects in (0,1)
        assert self.reference==self.admitted
        if self.admitted:
            assert self.bytes_present and self.receipt_actor=='actual-staff'
            assert not self.cancelled and not self.retired and not self.delete_claimed
        if self.retired:assert not self.bytes_present and not self.reference

groups=[]
def checked(name,fn):fn();groups.append(name)

def all_orders():
    global orders
    actions=('finalize','cancel','expire','finish','claim_delete','delete','close')
    orders=0
    for order in permutations(actions):
        s=Intake()
        for act in order:getattr(s,act)();s.invariant()
        orders+=1
checked('All seven-event serial orders preserve admission/cancel/closure/deletion invariants',all_orders)

def replay():
    s=Intake();assert s.finalize()=='added';s.close();s.authority=False;s.intent_valid=False
    assert s.finalize()=='original-added' and s.effects==1
    s.disclose=False;assert s.finalize()=='unavailable' and s.effects==1;s.invariant()
checked('Original committed result precedes fresh creation gates but keeps current disclosure',replay)

def mismatch():
    s=Intake();assert s.finalize()=='added';assert s.finalize('changed-target')=='conflict';s.invariant()
checked('Changed intent cannot replay or create another effect',mismatch)

def prereqs():
    for field in ('source_open','authority','intent_valid','verified','bytes_present'):
        s=Intake();setattr(s,field,False);assert s.finalize()=='not-added';assert s.effects==0;s.invariant()
checked('Required current authority, intent and verified bytes are independent prerequisites',prereqs)

def expiry():
    s=Intake();s.expire();assert s.claim_delete()=='writer-not-settled';s.finish()
    assert s.claim_delete()=='claimed';assert s.delete()=='physically-absent-model';s.invariant()
    t=Intake();t.expire();assert t.finalize()=='added';t.invariant()
checked('Transfer expiry is not in-flight settlement or admission-intent expiry',expiry)

def cancel_race():
    a=Intake();a.cancel();a.finish();assert a.finalize()=='not-added';a.invariant()
    b=Intake();b.finalize();assert b.cancel()=='already-added';b.invariant()
checked('Cancellation and admission have distinct ordered outcomes',cancel_race)

def deletion_lease():
    s=Intake(grant_live=False,inflight=0);assert s.claim_delete()=='claimed'
    assert s.lease_expired()=='claim-remains-fenced';assert s.finalize()=='not-added'
    s.delete();assert s.finalize()=='not-added';s.invariant()
checked('Cleanup lease expiry cannot reopen admission against an outstanding delete',deletion_lease)

def protection():
    for field in ('hold','processor_claim'):
        s=Intake(grant_live=False,inflight=0);setattr(s,field,True);assert s.claim_delete()=='protected'
    s=Intake(grant_live=False,inflight=0);s.finalize();assert s.claim_delete()=='protected';s.invariant()
checked('Source reference, hold and processor claims block destructive cleanup',protection)

def two_intents():
    a,b=Intake(),Intake(original_intent='second-deliberate-intake')
    assert a.finalize()=='added';assert b.finalize('second-deliberate-intake')=='added'
    assert a.effects+b.effects==2;a.invariant();b.invariant()
checked('Distinct eligible intakes are not globally deduplicated by equal-byte assumption',two_intents)

def negative_controls():
    # Intentionally unsafe toy algorithms; these demonstrate assumptions, not real defects.
    expiry_only={'grant_live':False,'inflight':1,'bytes':True}
    expiry_only['bytes']=False
    if expiry_only['inflight']:expiry_only['bytes']=True
    assert expiry_only['bytes'] # An accepted late write recreates supposedly cleaned bytes.
    lease_only={'delete_pending':True,'fenced':True,'admitted':False,'bytes':True}
    lease_only['fenced']=False;lease_only['admitted']=True
    if lease_only['delete_pending']:lease_only['bytes']=False
    assert lease_only['admitted'] and not lease_only['bytes']
    response_only={'admitted':True,'client_knows':False,'bytes':True}
    if not response_only['client_knows']:response_only['bytes']=False
    assert response_only['admitted'] and not response_only['bytes']
checked('Three intentionally unsafe countermodels demonstrate expiry/lease/response fallacies',negative_controls)

out={'kind':'isolated conceptual reference model, not native proof','date':'2026-10-26','serial_orders':orders,'check_groups':len(groups),'checks':groups,'unsafe_countermodels':3,'result':'passed','assumptions':['Atomic source/reference/history/result commit is assumed, not verified.','Immutable adapter write behavior and complete registered-reference/hold coverage are assumed.','Serialized event order is explored; actual SQL isolation, authorization and physical provider concurrency are not implemented.','No UI, processing, mail, performance or bill proof follows.'],'model_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
target=Path(__file__).parent/'phase29-q53-reference-model-result.json';target.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,indent=2))
```

Actual output:

```json
{
  "kind": "isolated conceptual reference model, not native proof",
  "date": "2026-10-26",
  "serial_orders": 5040,
  "check_groups": 10,
  "checks": [
    "All seven-event serial orders preserve admission/cancel/closure/deletion invariants",
    "Original committed result precedes fresh creation gates but keeps current disclosure",
    "Changed intent cannot replay or create another effect",
    "Required current authority, intent and verified bytes are independent prerequisites",
    "Transfer expiry is not in-flight settlement or admission-intent expiry",
    "Cancellation and admission have distinct ordered outcomes",
    "Cleanup lease expiry cannot reopen admission against an outstanding delete",
    "Source reference, hold and processor claims block destructive cleanup",
    "Distinct eligible intakes are not globally deduplicated by equal-byte assumption",
    "Three intentionally unsafe countermodels demonstrate expiry/lease/response fallacies"
  ],
  "unsafe_countermodels": 3,
  "result": "passed",
  "assumptions": [
    "Atomic source/reference/history/result commit is assumed, not verified.",
    "Immutable adapter write behavior and complete registered-reference/hold coverage are assumed.",
    "Serialized event order is explored; actual SQL isolation, authorization and physical provider concurrency are not implemented.",
    "No UI, processing, mail, performance or bill proof follows."
  ],
  "model_sha256": "63c04a2476776420e560c39e401ab3dc111ac178e79692dd56a608dea8b46338"
}
```

## Strengthened second run

```python
"""Q53 logical assumption checks only. No native database, provider or application code."""
from dataclasses import dataclass
from itertools import permutations
from pathlib import Path
import hashlib,json

@dataclass
class Intake:
    source_open: bool=True
    authority: bool=True
    intent_valid: bool=True
    disclose: bool=True
    verified: bool=True
    bytes_present: bool=True
    grant_live: bool=True
    inflight: int=1
    cancelled: bool=False
    admitted: bool=False
    reference: bool=False
    disposition_authorized: bool=True
    retention_eligible: bool=True
    coverage_complete: bool=True
    hold: bool=False
    processor_claim: bool=False
    delete_claimed: bool=False
    retired: bool=False
    effects: int=0
    receipt_actor: str|None=None
    original_intent: str='one-bound-intake'

    def finalize(self,intent='one-bound-intake'):
        if intent!=self.original_intent:return 'conflict'
        if self.admitted:return 'original-added' if self.disclose else 'unavailable'
        if not self.disclose:return 'unavailable'
        if not (self.source_open and self.authority and self.intent_valid):return 'not-added'
        if self.cancelled or self.delete_claimed or self.retired:return 'not-added'
        if not self.verified or not self.bytes_present:return 'not-added'
        # Atomic assumed source boundary; actual DB/provider proof is still required.
        self.admitted=self.reference=True;self.effects+=1;self.receipt_actor='actual-staff'
        return 'added'

    def cancel(self):
        if self.admitted:return 'already-added'
        self.cancelled=True;return 'intake-cancelled'

    def expire(self):self.grant_live=False
    def close(self):self.source_open=False
    def finish(self):
        if not self.inflight:return 'no-inflight'
        self.inflight-=1
        # Qualified immutable-target contract, not proof a provider enforces it.
        if self.retired or self.delete_claimed or self.admitted:return 'no-write'
        if self.bytes_present:return 'existing-object-no-overwrite'
        self.bytes_present=True;return 'staged-only'

    def claim_delete(self):
        if not (self.disposition_authorized and self.retention_eligible and self.coverage_complete):return 'disposition-not-proved'
        if self.reference or self.hold or self.processor_claim:return 'protected'
        if self.grant_live or self.inflight:return 'writer-not-settled'
        self.delete_claimed=True;return 'claimed'

    def lease_expired(self):
        # A possibly executing physical delete remains fenced despite lease expiry.
        return 'claim-remains-fenced' if self.delete_claimed else 'no-claim'

    def delete(self):
        if not self.delete_claimed:return 'not-claimed'
        assert self.disposition_authorized and self.retention_eligible and self.coverage_complete
        assert not (self.reference or self.hold or self.processor_claim)
        assert not self.grant_live and self.inflight==0
        self.bytes_present=False;self.retired=True;return 'physically-absent-model'

    def invariant(self):
        assert self.effects in (0,1)
        assert self.reference==self.admitted
        if self.admitted:
            assert self.bytes_present and self.receipt_actor=='actual-staff'
            assert not self.cancelled and not self.retired and not self.delete_claimed
        if self.retired:assert not self.bytes_present and not self.reference

groups=[]
def checked(name,fn):fn();groups.append(name)

def all_orders():
    global orders
    actions=('finalize','cancel','expire','finish','claim_delete','delete','close')
    orders=0
    for order in permutations(actions):
        s=Intake()
        for act in order:getattr(s,act)();s.invariant()
        orders+=1
checked('All seven-event serial orders preserve admission/cancel/closure/deletion invariants',all_orders)

def replay():
    s=Intake();assert s.finalize()=='added';s.close();s.authority=False;s.intent_valid=False
    assert s.finalize()=='original-added' and s.effects==1
    s.disclose=False;assert s.finalize()=='unavailable' and s.effects==1;s.invariant()
checked('Original committed result precedes fresh creation gates but keeps current disclosure',replay)

def mismatch():
    s=Intake();assert s.finalize()=='added';assert s.finalize('changed-target')=='conflict';s.invariant()
checked('Changed intent cannot replay or create another effect',mismatch)

def prereqs():
    for field in ('source_open','authority','intent_valid','verified','bytes_present'):
        s=Intake();setattr(s,field,False);assert s.finalize()=='not-added';assert s.effects==0;s.invariant()
checked('Required current authority, intent and verified bytes are independent prerequisites',prereqs)

def expiry():
    s=Intake();s.expire();assert s.claim_delete()=='writer-not-settled';s.finish()
    assert s.claim_delete()=='claimed';assert s.delete()=='physically-absent-model';s.invariant()
    t=Intake();t.expire();assert t.finalize()=='added';t.invariant()
checked('Transfer expiry is not in-flight settlement or admission-intent expiry',expiry)

def cancel_race():
    a=Intake();a.cancel();a.finish();assert a.finalize()=='not-added';a.invariant()
    b=Intake();b.finalize();assert b.cancel()=='already-added';b.invariant()
checked('Cancellation and admission have distinct ordered outcomes',cancel_race)

def deletion_lease():
    s=Intake(grant_live=False,inflight=0);assert s.claim_delete()=='claimed'
    assert s.lease_expired()=='claim-remains-fenced';assert s.finalize()=='not-added'
    s.delete();assert s.finalize()=='not-added';s.invariant()
checked('Cleanup lease expiry cannot reopen admission against an outstanding delete',deletion_lease)

def protection():
    for field in ('disposition_authorized','retention_eligible','coverage_complete'):
        s=Intake(grant_live=False,inflight=0);setattr(s,field,False)
        assert s.claim_delete()=='disposition-not-proved' and s.bytes_present
    for field in ('hold','processor_claim'):
        s=Intake(grant_live=False,inflight=0);setattr(s,field,True);assert s.claim_delete()=='protected'
    s=Intake(grant_live=False,inflight=0);s.finalize();assert s.claim_delete()=='protected';s.invariant()
checked('Disposition permission, retention eligibility, complete coverage and actual protections gate cleanup',protection)

def two_intents():
    a,b=Intake(),Intake(original_intent='second-deliberate-intake')
    assert a.finalize()=='added';assert b.finalize('second-deliberate-intake')=='added'
    assert a.effects+b.effects==2;a.invariant();b.invariant()
checked('Distinct eligible intakes are not globally deduplicated by equal-byte assumption',two_intents)

def negative_controls():
    # Intentionally unsafe toy algorithms; these demonstrate assumptions, not real defects.
    expiry_only={'grant_live':False,'inflight':1,'bytes':True}
    expiry_only['bytes']=False
    if expiry_only['inflight']:expiry_only['bytes']=True
    assert expiry_only['bytes'] # An accepted late write recreates supposedly cleaned bytes.
    lease_only={'delete_pending':True,'fenced':True,'admitted':False,'bytes':True}
    lease_only['fenced']=False;lease_only['admitted']=True
    if lease_only['delete_pending']:lease_only['bytes']=False
    assert lease_only['admitted'] and not lease_only['bytes']
    response_only={'admitted':True,'client_knows':False,'bytes':True}
    if not response_only['client_knows']:response_only['bytes']=False
    assert response_only['admitted'] and not response_only['bytes']
checked('Three intentionally unsafe countermodels demonstrate expiry/lease/response fallacies',negative_controls)

out={'kind':'isolated conceptual reference model, not native proof','date':'2026-10-26','run':2,'serial_orders':orders,'check_groups':len(groups),'checks':groups,'unsafe_countermodels':3,'result':'passed','assumptions':['Atomic source/reference/history/result commit is assumed, not verified.','Immutable adapter behavior and trusted freshness of disposition/retention/coverage booleans are assumed; their denial branches are checked, not native authorization.','Serialized event order is explored; actual SQL isolation, authorization and physical provider concurrency are not implemented.','No UI, processing, mail, performance or bill proof follows.'],'model_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
target=Path(__file__).parent/'phase29-q53-reference-model-result.json';target.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,indent=2))
```

Actual output:

```json
{
  "kind": "isolated conceptual reference model, not native proof",
  "date": "2026-10-26",
  "run": 2,
  "serial_orders": 5040,
  "check_groups": 10,
  "checks": [
    "All seven-event serial orders preserve admission/cancel/closure/deletion invariants",
    "Original committed result precedes fresh creation gates but keeps current disclosure",
    "Changed intent cannot replay or create another effect",
    "Required current authority, intent and verified bytes are independent prerequisites",
    "Transfer expiry is not in-flight settlement or admission-intent expiry",
    "Cancellation and admission have distinct ordered outcomes",
    "Cleanup lease expiry cannot reopen admission against an outstanding delete",
    "Disposition permission, retention eligibility, complete coverage and actual protections gate cleanup",
    "Distinct eligible intakes are not globally deduplicated by equal-byte assumption",
    "Three intentionally unsafe countermodels demonstrate expiry/lease/response fallacies"
  ],
  "unsafe_countermodels": 3,
  "result": "passed",
  "assumptions": [
    "Atomic source/reference/history/result commit is assumed, not verified.",
    "Immutable adapter behavior and trusted freshness of disposition/retention/coverage booleans are assumed; their denial branches are checked, not native authorization.",
    "Serialized event order is explored; actual SQL isolation, authorization and physical provider concurrency are not implemented.",
    "No UI, processing, mail, performance or bill proof follows."
  ],
  "model_sha256": "b14eefdc8b1f5de90f711e20dd0fc05f6d5fc7d9c75b9201c78239b3f4ab4f18"
}
```
