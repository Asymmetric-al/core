#!/usr/bin/env python3
"""Disposable D10 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
import hashlib
import importlib.util
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
HELPER = ROOT.parents[1] / 'd1-evidence/postgres-probe/run.py'
spec = importlib.util.spec_from_file_location('d1_harness', HELPER)
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)
h.NAME = 'phase28-d10-pg'
h.RESULTS = []
IMAGE = 'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'
FIXTURE_STEPS = []


def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + '\n')


def fixture(query, role='postgres'):
    result = h.sql(query, role)
    FIXTURE_STEPS.append(dict(role=role, sql=query, exit_code=result.returncode, stdout=result.stdout.strip(), stderr=result.stderr.strip()))
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def check(name, query, expected=None, state=None, role='coach_a', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)



def history(periods='[2026-09-01,2026-10-01)',generate=True,tenant=1,target=10,module='received'):
    return f"WITH s AS MATERIALIZED(SELECT probe.history({tenant},{target},'{module}','{periods}'::daterange,{str(generate).lower()}) AS x) SELECT CASE x->>'status' WHEN 'available' THEN (SELECT string_agg(v->>'amount_minor','|' ORDER BY v->>'start') FROM jsonb_array_elements(x->'values')v) ELSE x->>'status' END FROM s;"


def concurrent(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def grant_state():
    return h.admin("SELECT active::text||':'||revision||':'||periods::text FROM probe.grants;")


def reset(periods='[2026-09-01,2026-10-01)'):
    fixture(f"UPDATE probe.grants SET active=true,revision=revision+1,periods='{periods}'::daterange;",'source_manager')


def preview(ident,periods='[2026-08-01,2026-10-01)',source_revision=None):
    source='h.revision' if source_revision is None else str(source_revision)
    fixture(f"INSERT INTO probe.previews SELECT g.tenant,{ident},'missionary_a',g.target,g.module,g.revision,{source},'{periods}'::daterange FROM probe.grants g JOIN probe.heads h USING(tenant,target,module);")


def current_preview_after_change(ident):
    return f"SELECT probe.apply_preview({ident});"


def scenarios():
    check('source_period_half_open_includes_start_excludes_end',history(),'300')
    check('unsafe_created_time_moves_gifts_to_wrong_period','SELECT probe.unsafe_created_month();','100',counterexample=True)
    check('caller_cannot_widen_server_captured_history',history('[2026-08-01,2026-10-01)'),'unavailable')
    check('future_period_not_granted',history('[2026-10-01,2026-11-01)'),'unavailable')
    check('unbounded_infinite_empty_midmonth_rejected',history('(,2026-10-01)')+history('[2026-09-01,infinity)')+history('empty')+history('[2026-09-15,2026-10-01)'),'unavailable\nunavailable\nunavailable\nunavailable')
    check('different_tenant_subject_module_not_history_authority',history(tenant=2)+history(target=20)+history(module='expected'),'unavailable\nunavailable\nunavailable')
    check('missionary_cannot_rewrite_captured_preview',"UPDATE probe.previews SET new_periods='[2026-01-01,2026-10-01)';",state='42501',role='missionary_a')
    check('coach_cannot_rewrite_history_range',"UPDATE probe.grants SET periods='[2026-01-01,2026-10-01)';",state='42501')
    check('exact_captured_preview_accepted','SELECT probe.apply_preview(1);','accepted',role='missionary_a')
    check('selected_earlier_months_have_distinct_source_totals',history('[2026-08-01,2026-10-01)'),'100|300')
    check('rolling_formula_silently_adds_unselected_month',"SELECT daterange((date '2026-11-01'-interval '2 months')::date,date '2026-11-01')::text||':'||(daterange((date '2026-11-01'-interval '2 months')::date,date '2026-11-01') @> date '2026-10-15')::text||':'||('[2026-08-01,2026-10-01)'::daterange @> date '2026-10-15')::text;",'[2026-09-01,2026-11-01):true:false',counterexample=True)
    preview(2,'[2026-08-01,2026-11-01)')
    check('preview_cannot_grant_future_beyond_captured_cutoff','SELECT probe.apply_preview(2);','conflict',role='missionary_a')
    reset('[2026-07-01,2026-10-01)')
    check('missing_historical_month_is_not_zero',history('[2026-07-01,2026-10-01)'),'unavailable')
    fixture("INSERT INTO probe.coverage VALUES(1,10,'received','2026-07-01',1,true);")
    check('complete_empty_month_can_be_zero',history('[2026-07-01,2026-10-01)'),'0|100|300')
    fixture("BEGIN; UPDATE probe.heads SET revision=2; INSERT INTO probe.facts SELECT tenant,target,module,source_id,2,CASE WHEN source_id=5 THEN date '2026-09-15' ELSE source_date END,created_at,amount_minor FROM probe.facts WHERE revision=1; UPDATE probe.coverage SET revision=2; COMMIT;")
    check('date_correction_moves_cohort_and_invalidates_old_snapshot',history('[2026-07-01,2026-10-01)',False)+history('[2026-07-01,2026-10-01)'),'unavailable\n0|40|360')
    retained=h.admin("SELECT string_agg(source_revision||':'||payload::text,';' ORDER BY source_revision) FROM probe.snapshots WHERE periods='[2026-07-01,2026-10-01)'::daterange;")
    h.RESULTS[-1]['retained_prior_source_snapshots']=retained
    assert '"amount_minor": "100"' in retained and '"amount_minor": "40"' in retained
    reset();preview(3,source_revision=1)
    check('source_changed_after_preview_conflicts','SELECT probe.apply_preview(3);','conflict',role='missionary_a')
    preview(4)
    revoke="UPDATE probe.grants SET active=false,revision=revision+1 WHERE tenant=1 AND target=10 AND module='received';"
    narrow="UPDATE probe.grants SET periods='[2026-09-01,2026-10-01)',revision=revision+1 WHERE tenant=1 AND target=10 AND module='received';"
    concurrent('revoke_first_blocks_old_history_preview','source_manager',revoke,'missionary_a','SELECT probe.apply_preview(4);',lambda a,b:(b.startswith('unavailable\n') and grant_state().startswith('false:'),dict(first=a,second=b,current=grant_state())))
    reset();preview(5)
    concurrent('history_extend_first_then_revoke','missionary_a','SELECT probe.apply_preview(5);','source_manager',revoke,lambda a,b:(a.startswith('accepted\n') and grant_state().startswith('false:'),dict(first=a,second=b,current=grant_state())))
    reset('[2026-08-01,2026-10-01)');preview(6,'[2026-07-01,2026-10-01)')
    concurrent('narrow_first_conflicts_stale_extension','source_manager',narrow,'missionary_a','SELECT probe.apply_preview(6);',lambda a,b:(b.startswith('conflict\n') and grant_state().endswith('[2026-09-01,2026-10-01)'),dict(first=a,second=b,current=grant_state())))
    reset();preview(7)
    concurrent('history_extend_first_then_narrow','missionary_a','SELECT probe.apply_preview(7);','source_manager',narrow,lambda a,b:(a.startswith('accepted\n') and grant_state().endswith('[2026-09-01,2026-10-01)'),dict(first=a,second=b,current=grant_state())))
    check('old_accepted_preview_cannot_undo_later_narrow','SELECT probe.apply_preview(7);','conflict',role='missionary_a')
    check('old_snapshots_do_not_release_removed_months',history('[2026-08-01,2026-10-01)',False)+history(generate=False),'unavailable\nunavailable')
    # Fresh exact snapshot; source-head changes must fence subsequent release.
    fixture(history(),role='coach_a')
    advance="UPDATE probe.heads SET revision=revision+1 WHERE tenant=1 AND target=10 AND module='received';"
    concurrent('source_change_first_blocks_snapshot_release','source_manager',advance,'coach_a',history(generate=False),lambda a,b:(b.startswith('unavailable\n'),dict(first=a,second=b,source_head=h.admin('SELECT revision FROM probe.heads;'))))


def main():
    start = h.docker(['run','--name',h.NAME,'--rm','--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust','-d',IMAGE])
    if start.returncode:
        raise RuntimeError(start.stderr)
    container_id = start.stdout.strip()
    cleanup = dict(container=h.NAME,container_id=container_id,volume_names=[])
    try:
        details = json.loads(h.docker(['inspect',h.NAME]).stdout)[0]
        assert details['HostConfig']['NetworkMode']=='none' and not details['HostConfig']['PortBindings'] and not details['NetworkSettings']['Ports']
        cleanup['volume_names']=[m['Name'] for m in details['Mounts'] if m['Type']=='volume']
        deadline=time.monotonic()+30
        while True:
            logs=h.docker(['logs',h.NAME])
            if 'PostgreSQL init process complete; ready for start up.' in logs.stdout+logs.stderr and h.docker(['exec',h.NAME,'pg_isready','-U','postgres']).returncode==0:
                break
            if time.monotonic()>deadline:
                raise TimeoutError('Database initialization')
            time.sleep(.2)
        save('environment.json',dict(recorded_at=datetime.now(timezone.utc).isoformat(),container=h.NAME,container_id=container_id,image=IMAGE,actual_image_id=details['Image'],network=details['HostConfig']['NetworkMode'],published_ports=details['NetworkSettings']['Ports'],volume_names=cleanup['volume_names'],server=h.admin('SELECT version();')))
        h.admin((ROOT/'setup.sql').read_text())
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','coach_a','missionary_a','source_manager') ORDER BY rolname)r;")))
        save('privileges.json',dict(tables=json.loads(h.admin("SELECT json_agg(t) FROM(SELECT c.relname,r.rolname,has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='probe' AND c.relkind IN('r','v') AND r.rolname IN('coach_a','command_executor') ORDER BY c.relname,r.rolname)t;")),functions=json.loads(h.admin("SELECT json_agg(f) FROM(SELECT p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='probe' ORDER BY p.proname)f;"))))
        scenarios()
    finally:
        cleanup['stop_exit_code']=h.docker(['stop',h.NAME]).returncode
        deadline=time.monotonic()+15
        while True:
            cleanup['container_absent']=h.docker(['inspect',container_id]).returncode!=0
            cleanup['volumes_absent']={v:h.docker(['volume','inspect',v]).returncode!=0 for v in cleanup['volume_names']}
            if cleanup['container_absent'] and all(cleanup['volumes_absent'].values()):
                break
            if time.monotonic()>deadline:
                raise RuntimeError('Cleanup not confirmed')
            time.sleep(.2)
        cleanup['verified_at']=datetime.now(timezone.utc).isoformat()
        save('cleanup.json',cleanup)


if __name__=='__main__':
    failure=None
    try:
        main()
    except Exception as exc:
        failure=repr(exc)
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D10 fixed historical range, preview and source revision mechanics only; not Core/P12/Supabase/Auth/PostgREST/API qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
