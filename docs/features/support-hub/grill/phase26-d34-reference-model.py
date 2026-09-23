from dataclasses import dataclass, asdict
from pathlib import Path
import json, hashlib

@dataclass
class Lease:
    seq: int = 0
    gen: int = 0
    window: float = 15
    observer: float = 30
    input_at: float | None = None
    composing: float | None = None
    closed: bool = False
    exists: bool = True

def control(x, now, seq, gen, intent, authorized=True):
    if not (x.exists and not x.closed and authorized and now < x.window and now < x.observer and seq > x.seq and gen == x.gen):
        return False
    if intent == 'renew' and not (x.composing is not None and now < x.composing and now < x.input_at + 30):
        return False
    x.seq, x.gen, x.window, x.observer = seq, x.gen+1, now+15, now+30
    if intent == 'input':
        x.input_at = now
        x.composing = min(now+15, x.input_at+30, x.observer)
    elif intent == 'renew':
        x.composing = min(now+15, x.input_at+30, x.observer)
    elif intent in ('stop','close'):
        x.composing = None
        if intent == 'close': x.closed = True
    return True

def reconcile(x): return asdict(x).copy()
def deadline(start, asof, expiry): return min(start+12, start+max(0, expiry-asof))

results=[]
def check(id, description, fn):
    assert fn(), description
    results.append({'id':id,'assertion':description,'pass':True})

def tests():
    x=Lease(); check('M01','Fresh input begins a15second finite cue',lambda:control(x,1,1,0,'input') and x.composing==16)
    check('M02','Renewal extends liveness but preserves fresh-input frontier',lambda:control(x,6,2,1,'renew') and x.composing==21 and x.input_at==1)
    check('M03','Replay does not renew any deadline',lambda:(lambda before: not control(x,7,2,1,'renew') and asdict(x)==before)(asdict(x).copy()))
    check('M04','Stop ends the episode; old Start cannot revive it',lambda:control(x,8,3,2,'stop') and not control(x,9,1,0,'input') and x.composing is None)
    check('M05','Ordinary renew cannot restart a stopped episode',lambda:not control(x,10,4,3,'renew') and x.composing is None)
    check('M06','Fresh input can start a new episode in a valid current instance',lambda:control(x,10,4,3,'input') and x.composing==25)
    check('M07','Older Stop cannot clear a newer episode',lambda:not control(x,11,3,2,'stop') and x.composing==25)
    y=Lease();control(y,0,1,0,'input')
    for t in (5,10,15,20,25): control(y,t,y.seq+1,y.gen,'renew')
    check('M08','Keepalive never extends beyond last input+30s',lambda:y.composing==30 and y.input_at==0 and not control(y,30,y.seq+1,y.gen,'renew'))
    z=Lease();control(z,14,1,0,'observe')
    check('M09','Old Start cannot use a window refreshed by unrelated heartbeat',lambda:not control(z,20,2,0,'input') and z.composing is None)
    check('M10','At window equality a command is expired',lambda:not control(Lease(),15,1,0,'input'))
    check('M11','ACK reconciliation is read-only and cannot renew freshness',lambda:(lambda before:reconcile(x)==before and asdict(x)==before)(asdict(x).copy()))
    q=Lease();control(q,1,1,0,'close');q.exists=False
    check('M12','Purged unknown instance cannot be recreated by a late update',lambda:not control(q,2,2,1,'input') and not q.exists)
    check('M13','Current authorization denial rejects otherwise valid intent',lambda:not control(Lease(),1,1,0,'input',False))
    check('M14','Old snapshot expiry is anchored to request start, not arrival',lambda:deadline(100,200,215)==112 and not (113<deadline(100,200,215)))
    check('M15','Peer deadline shorter than snapshot trust wins',lambda:deadline(100,200,204)==104)
    check('M16','Expired snapshot cannot gain freshness on a late arrival',lambda:deadline(100,200,199)==100)
    sessions=[{'profile':'p1','expiry':16,'allowed':True},{'profile':'p1','expiry':20,'allowed':True},{'profile':'p2','expiry':25,'allowed':False}]
    def visible(now):
        out={}
        for s in sessions:
            if s['allowed'] and s['expiry']>now:out[s['profile']]=max(out.get(s['profile'],0),s['expiry'])
        return out
    check('M17','Multiple tabs dedupe only after source permission; one expiry does not clear other',lambda:visible(17)=={'p1':20})
    check('M18','No names remain after the last eligible contribution expires',lambda:visible(20)=={})
tests()
counterexamples=[
 {'id':'X01','rejectedDesign':'sequence plus mutable observer expiry alone','trace':'observer expires30; old Observe(seq1) arrives14 and extends expiry44; already-old Start(seq2) arrives20; naive seq/observer check accepts','violation':'freshness assigned at receipt without the original report window','qualifiedModel':'M09 rejects old generation'},
 {'id':'X02','rejectedDesign':'renewal also refreshes last-input','trace':'input0; renew5,10,15,... each sets input=now','violation':'idle staff remains composing indefinitely','qualifiedModel':'M08 stops at30'},
 {'id':'X03','rejectedDesign':'lease timer starts at HTTP response arrival','trace':'asOf200 expiry215; request begins100, response arrives113; naive arrival+15 lasts128','violation':'stale snapshot extends perceived freshness','qualifiedModel':'M14 caps at112 and discards response'}
]
p=Path(__file__); out=p.parent.parent/'outputs/phase26-d34-reference-probe.json'
out.write_text(json.dumps({'date':'2026-09-13','kind':'executed synthetic reference model, not Core implementation','scope':'finite sequence/window/input/expiry and authorized aggregation arithmetic','externalNetwork':0,'databaseQueries':0,'browserRuns':0,'modelSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'checks':results,'counterexamples':counterexamples,'limitations':['No actual RLS/auth-session/source locks or revocation tested','No live broker/Vercel/browser/IME/AT/latency/load proof','Client lifecycle and database constraints require actual implementation tests']},indent=2)+'\n')
print(json.dumps({'modelChecks':len(results),'counterexamples':len(counterexamples),'allPassed':all(r['pass'] for r in results)}))
