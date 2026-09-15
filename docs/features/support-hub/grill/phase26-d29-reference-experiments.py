"""Finite synthetic contract examples, not a Core implementation or DB/browser test."""
from pathlib import Path
from urllib.parse import urlencode
import json
o=Path(__file__).resolve().parent;results=[]
def check(n,ok,evidence):
 assert ok,n;results.append({'name':n,'passed':True,'evidence':evidence})
def guides(refs,scope,available=True):
 if not available:return []
 if len(refs)>3:raise ValueError('selection too large')
 return [r['id'] for r in refs if all(r[k]==scope[k] for k in ['tenant','site','locale']) and r['reach']=='listed' and r['current']]
scope={'tenant':'t1','site':'s1','locale':'th'}
base=dict(scope,id='a',reach='listed',current=True)
for key,value in [('tenant','t2'),('site','s2'),('locale','en'),('reach','shared_by_link'),('current',False)]:
 check('guide_excludes_'+key,guides([dict(base,**{key:value})],scope)==[],value)
check('eligible_guide',guides([base],scope)==['a'],'Correct public scope and reach')
check('withdrawal_never_tops_up',guides([base,dict(base,id='b',current=False)],scope)==['a'],'Only explicit refs are considered; no replacement search')
check('no_guidance_preserves_contact', {'contact':True,'guides':guides([base],scope,False)}=={'contact':True,'guides':[]},'Safe contact-only presentation requires owner conformance, not DOM hiding')
check('empty_guidance_preserves_contact', {'contact':True,'guides':guides([],scope)}['contact'],'No empty-library gate')
try:guides([dict(base,id=str(i)) for i in range(4)],scope);raise AssertionError('not rejected')
except ValueError:check('selection_four_rejected',True,'At most3 selected refs; no silent truncation')
for length in [0,1,9999,10000,10001]:
 text='🙂'*length;valid=bool(text.strip()) and len(text)<=10000
 check('message_unicode_'+str(length),valid==(1<=length<=10000),{'scalarCount':len(text),'utf8Bytes':len(text.encode())})
payload=urlencode({'message':'🙂'*10000,'name':'🙂'*200,'email':'x@example.org','binding':'x'*4096,'intent':'y'*128}).encode()
check('urlencoded_unicode_budget',len(payload)<262144,{'rawBytes':len(payload),'limitBytes':262144,'fixture':'10000four-byte message scalars+200name+bounded synthetic envelope'})
ledger={};writes=[]
def admit(key,body,route='support',notification_failed=False):
 if key in ledger:return 'same_receipt' if ledger[key]==(body,route) else 'conflict'
 if route!='support':return 'wrong_primary'
 ledger[key]=(body,route);writes.append({'occurrence':key,'support_source':key,'notification_failed':notification_failed});return 'received'
check('atomic_receipt_reference',admit('a','hello',notification_failed=True)=='received' and len(writes)==1,'Primary admission can succeed while optional delivery later fails')
check('duplicate_same_intent',admit('a','hello')=='same_receipt' and len(writes)==1,'Replay same receipt, no second Support source')
check('changed_intent_conflict',admit('a','changed')=='conflict' and len(writes)==1,'No silent replacement of admitted request')
check('no_email_only_primary_fallback',admit('b','hello','email')=='wrong_primary' and len(writes)==1,'A Support-intake route must not silently switch to external email')
def state_after_identity_change(draft,tenant,principal):return draft if (draft['tenant'],draft['principal'])==(tenant,principal) else None
d={'tenant':'t1','principal':'u1','text':'private','context':'owned-reference'}
check('tenant_switch_clears_draft',state_after_identity_change(d,'t2','u1') is None,'No cross-tenant persistence')
check('logout_clears_private_draft',state_after_identity_change(d,'t1',None) is None,'Do not silently submit previous actor/context as anonymous')
check('same_actor_recoverable_error_preserves',state_after_identity_change(d,'t1','u1')==d,'Retain local work for ordinary validation failure')
def valid_outcomes(primary, acknowledgements):
 return primary == ['support'] and 0 <= acknowledgements <= 1
check('one_primary_and_one_optional_ack',
 valid_outcomes(['support'],0) and valid_outcomes(['support'],1)
 and not valid_outcomes(['support','email'],1)
 and not valid_outcomes([],1) and not valid_outcomes(['email'],0)
 and not valid_outcomes(['support'],2),
 'Positive zero/one acknowledgement; reject two/no/wrong primaries and two acknowledgements. Actual SQL atomicity and P17 fanout remain release proof.')
r={'status':'passed','scope':'24 finite synthetic requirement examples; no product runtime, actual SQL/RLS, browser, P6 provider or human usability proof','checkCount':len(results),'checks':results,'limits':['Reference functions demonstrate intended invariants, not production source behavior.','The request encoding fixture is a specific worst-width Unicode example with a bounded synthetic envelope; actual released schema must enforce total bytes.','No network or real requester/tenant data is used.']}
assert len(results)==24
(o/'phase26-d29-reference-experiments.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'status':'passed','checks':len(results),'encodedFixtureBytes':len(payload)}))
