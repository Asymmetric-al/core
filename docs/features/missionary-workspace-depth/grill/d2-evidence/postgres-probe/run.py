#!/usr/bin/env python3
"""D2-only atomic acceptance and optional projection probe on a fresh local PG."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parent
HELPER=ROOT.parents[1]/'d1-evidence'/'postgres-probe'/'run.py'
spec=importlib.util.spec_from_file_location('d1_probe_harness',HELPER)
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.ROOT=ROOT;h.NAME='phase28-d2-pg';h.RESULTS=[]

def check(name,query,expected=None,state=None,role='sharer',counterexample=False):
    h.check(name,query,expected,state,role,counterexample)

def sid(source): return h.admin(f'SELECT id FROM probe.shares WHERE tenant=1 AND source_id={source};')

def main():
    isolation=h.docker(['inspect',h.NAME,'--format','{{json .HostConfig.NetworkMode}} {{json .NetworkSettings.Ports}} {{json .Mounts}}'])
    if isolation.returncode or not isolation.stdout.startswith('"none" {} '): raise RuntimeError('Expected isolated no-network/no-port container')
    env={'at':datetime.now(timezone.utc).isoformat(),'container':h.NAME,'isolation':isolation.stdout.strip(),'server':h.admin('SELECT version();'),'image':'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'}
    (ROOT/'environment.json').write_text(json.dumps(env,indent=2)+'\n')
    r=h.sql((ROOT/'setup.sql').read_text())
    if r.returncode: raise RuntimeError(r.stderr)
    (ROOT/'roles.json').write_text(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolinherit FROM pg_roles WHERE rolname IN('sharer','projector') ORDER BY rolname)r;")+'\n')
    check('off_acceptance_records_share_without_notification',"SELECT probe.share(1,1,false,'off-1')>0;",'t')
    check('off_acceptance_has_one_receipt_and_no_intent',"SELECT (SELECT count(*) FROM probe.shares WHERE source_id=1)||':'||(SELECT count(*) FROM probe.receipts WHERE source_id=1)||':'||(SELECT count(*) FROM probe.intents);",'1:1:0')
    check('on_acceptance_records_pending_intent',"SELECT probe.share(2,1,true,'on-1',NULL,ARRAY['synthetic-staff'])>0; SELECT phase FROM probe.intents;",'t\npending')
    check('on_acceptance_does_not_claim_available_or_read','SELECT count(*) FROM probe.local_items;','0',role='projector')
    check('failure_before_intent_aborts_transaction',"SELECT probe.share(3,1,true,'fault-a','before_intent',ARRAY['synthetic-staff']);",state='P0001')
    check('before_intent_failure_preserves_restricted_source',"SELECT shared FROM probe.sources WHERE id=3; SELECT count(*) FROM probe.shares WHERE source_id=3; SELECT count(*) FROM probe.receipts WHERE source_id=3;",'f\n0\n0')
    check('failure_after_intent_and_receipt_aborts_transaction',"SELECT probe.share(3,1,true,'fault-b','after_intent',ARRAY['synthetic-staff']);",state='P0001')
    check('after_intent_failure_leaves_no_partial_effect',"SELECT shared FROM probe.sources WHERE id=3; SELECT count(*) FROM probe.shares WHERE source_id=3; SELECT count(*) FROM probe.receipts WHERE source_id=3; SELECT count(*) FROM probe.intents;",'f\n0\n0\n1')
    check('successful_recovery_after_aborted_acceptance',"SELECT probe.share(3,1,true,'fault-b',NULL,ARRAY['synthetic-staff'])>0;",'t')
    h.concurrent('concurrent_distinct_keys_one_semantic_share','sharer',"SELECT probe.share(4,1,true,'double-a',NULL,ARRAY['synthetic-staff']);",'sharer',"SELECT probe.share(4,1,true,'double-b',NULL,ARRAY['synthetic-staff']);",lambda a,b:(a.splitlines()[0]==b.splitlines()[0] and h.admin('SELECT count(*) FROM probe.shares WHERE source_id=4;')=='1' and h.admin('SELECT count(*) FROM probe.intents WHERE share_id='+sid(4)+';')=='1',{'first':a,'second':b,'shares':h.admin('SELECT count(*) FROM probe.shares WHERE source_id=4;'),'receipts':h.admin('SELECT count(*) FROM probe.receipts WHERE source_id=4;'),'intents':h.admin('SELECT count(*) FROM probe.intents WHERE share_id='+sid(4)+';')}))
    check('same_key_changed_toggle_conflicts',"SELECT probe.share(1,1,true,'off-1',NULL,ARRAY['synthetic-staff']);",state='22023')
    check('new_key_changed_toggle_cannot_add_surprise_notice',"SELECT probe.share(1,1,true,'off-new-key',NULL,ARRAY['synthetic-staff']);",state='22023')
    check('changed_toggle_conflict_keeps_off_choice_and_no_intent',"SELECT notify_requested FROM probe.shares WHERE source_id=1; SELECT count(*) FROM probe.intents WHERE share_id="+sid(1)+';','f\n0')
    check('same_key_exact_replay_preserves_same_share',"SELECT probe.share(2,1,true,'on-1',NULL,ARRAY['synthetic-staff']);",sid(2))
    notice=sid(2)
    check('worker_claim_is_not_availability',f"SELECT probe.claim({notice},'worker-a'); SELECT phase FROM probe.intents WHERE share_id={notice}; SELECT count(*) FROM probe.local_items WHERE share_id={notice};",'1\nclaimed\n0',role='projector')
    check('second_worker_cannot_claim_inflight_work',f"SELECT probe.claim({notice},'worker-b');",'0',role='projector')
    check('projector_failure_is_reported',f"SELECT probe.materialize({notice},'worker-a',true);",state='P0001',role='projector')
    check('projector_failure_does_not_revert_share',"SELECT shared FROM probe.sources WHERE id=2; SELECT count(*) FROM probe.shares WHERE source_id=2;",'t\n1')
    check('projector_failure_rolls_back_partial_local_item',f'SELECT phase FROM probe.intents WHERE share_id={notice}; SELECT count(*) FROM probe.local_items WHERE share_id={notice};','claimed\n0',role='projector')
    check('worker_failure_state_is_separate_from_source',f"UPDATE probe.intents SET phase='failed',claim_token=NULL WHERE share_id={notice} AND phase='claimed' AND claim_token='worker-a'; SELECT phase FROM probe.intents WHERE share_id={notice};",'failed',role='projector')
    check('recovery_claim_reuses_same_intent',f"SELECT probe.claim({notice},'worker-c');",'1',role='projector')
    check('old_claim_cannot_materialize_after_recovery',f"SELECT probe.materialize({notice},'worker-a');",state='22023',role='projector')
    check('qualified_local_materialization_creates_one_available_item',f"SELECT probe.materialize({notice},'worker-c'); SELECT count(*) FROM probe.local_items WHERE share_id={notice}; SELECT read_at IS NULL AND archived_at IS NULL FROM probe.local_items WHERE share_id={notice};",'available\n1\nt',role='projector')
    check('completed_claim_retry_cannot_duplicate_local_item',f"SELECT probe.materialize({notice},'worker-c');",state='22023',role='projector')
    check('provider_delivered_is_not_an_admitted_local_processing_status',f"UPDATE probe.intents SET phase='delivered' WHERE share_id={notice};",state='23514',role='projector')
    check('worker_has_no_source_mutation_grant',"UPDATE probe.sources SET shared=false WHERE id=2;",state='42501',role='projector')
    check('materialized_claim_needs_actual_local_item',f"UPDATE probe.intents SET phase='materialized',available_for='synthetic-staff' WHERE share_id={sid(3)};",state='23503',role='projector')
    check('composite_FK_rejects_cross_tenant_intent',f"INSERT INTO probe.intents(tenant,share_id,purpose,chosen_recipients) VALUES(2,{sid(3)},'staff-availability',ARRAY['synthetic-staff']);",state='23503')
    check('semantic_intent_identity_prevents_duplicate',f"INSERT INTO probe.intents(tenant,share_id,purpose,chosen_recipients) VALUES(1,{sid(3)},'staff-availability',ARRAY['synthetic-staff']);",state='23505')
    h.admin("UPDATE probe.recipient_gate SET allowed=false WHERE tenant=1;")
    check('current_ineligible_recipient_creates_no_replacement',f"SELECT probe.claim({sid(3)},'worker-d'); SELECT probe.materialize({sid(3)},'worker-d'); SELECT count(*) FROM probe.local_items WHERE share_id={sid(3)};",'1\nno-longer-eligible\n0',role='projector')
    check('notification_ineligibility_preserves_committed_share',"SELECT shared FROM probe.sources WHERE id=3;",'t')
    check('required_audit_failure_aborts_share',"SELECT probe.share(5,1,false,'audit-fail','audit');",state='P0001')
    check('required_audit_failure_leaves_no_share',"SELECT shared FROM probe.sources WHERE id=5; SELECT count(*) FROM probe.shares WHERE source_id=5;",'f\n0')
    check('every_accepted_share_has_exactly_one_required_audit',"SELECT (SELECT count(*) FROM probe.shares)=(SELECT count(*) FROM probe.source_audit);",'t')
    check('chosen_recipient_set_normalizes_order_and_duplicates',"SELECT probe.share(6,1,true,'chosen-1',NULL,ARRAY['staff-b','synthetic-staff','staff-b'])>0; SELECT chosen_recipients::text FROM probe.shares WHERE source_id=6;",'t\n{staff-b,synthetic-staff}')
    check('reordered_equal_recipient_set_is_exact_replay',"SELECT probe.share(6,1,true,'chosen-1',NULL,ARRAY['synthetic-staff','staff-b']);",sid(6))
    check('changed_recipient_same_key_conflicts',"SELECT probe.share(6,1,true,'chosen-1',NULL,ARRAY['staff-c']);",state='22023')
    check('changed_recipient_new_key_conflicts_same_transition',"SELECT probe.share(6,1,true,'chosen-2',NULL,ARRAY['staff-c']);",state='22023')
    check('notify_on_without_selected_staff_rejects',"SELECT probe.share(7,1,true,'empty-recipients',NULL,ARRAY[]::text[]);",state='22023')
    check('unsafe_split_commit_accepts_source_first','UPDATE probe.unsafe_source SET shared=true WHERE id=1; SELECT shared FROM probe.unsafe_source;','t',counterexample=True)
    check('unsafe_split_commit_projection_failure',"DO $$ BEGIN RAISE EXCEPTION 'injected failure before separate notice insert'; END $$;",state='P0001',counterexample=True)
    check('unsafe_split_commit_loses_durable_notification_intent','SELECT shared FROM probe.unsafe_source; SELECT count(*) FROM probe.unsafe_notices;','t\n0',counterexample=True)
    check('unsafe_request_key_only_dedupe_allows_duplicate_notices',"INSERT INTO probe.unsafe_notices VALUES('browser-key-a',1),('browser-key-b',1); SELECT count(*) FROM probe.unsafe_notices WHERE source_id=1;",'2',counterexample=True)

if __name__=='__main__':
    failure=None
    try: main()
    except Exception as e: failure=repr(e)
    finally:
        hashes={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py']}
        hashes['../../d1-evidence/postgres-probe/run.py']=hashlib.sha256(HELPER.read_bytes()).hexdigest()
        result={'recorded_at':datetime.now(timezone.utc).isoformat(),'scope':'synthetic PG D2 acceptance and optional in-product intent; not Core/Supabase/API/provider qualification','checks':len(h.RESULTS),'passed':sum(x['passed'] for x in h.RESULTS),'failure':failure,'source_sha256':hashes,'results':h.RESULTS}
        (ROOT/'results.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ['checks','passed','failure']}))
    if failure: raise SystemExit(1)
