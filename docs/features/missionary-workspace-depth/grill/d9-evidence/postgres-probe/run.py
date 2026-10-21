#!/usr/bin/env python3
"""Disposable D9 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
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
h.NAME = 'phase28-d9-pg'
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



def summary(profile=1,module='expected',generate=True,tenant=1,target=10):
    return f"WITH s AS MATERIALIZED(SELECT probe.summary({tenant},{target},{profile},'{module}',{str(generate).lower()}) AS x) SELECT CASE x->>'status' WHEN 'available' THEN x->>'amount_minor' ELSE x->>'status' END FROM s;"


def concurrent(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def permit():
    fixture("UPDATE probe.grants SET allowed=true,revision=revision+1 WHERE tenant=1 AND principal='coach_a' AND profile=1 AND module='expected';",'source_manager')


def fresh_expected():
    # Synthetic publisher supplies a new immutable source version and coverage together.
    fixture("BEGIN; UPDATE probe.source_heads SET revision=revision+1 WHERE tenant=1 AND profile=1 AND module='expected'; INSERT INTO probe.facts SELECT f.tenant,f.profile,f.module,f.source_id,h.revision,f.amount_minor FROM probe.facts f JOIN probe.source_heads h USING(tenant,profile,module) WHERE f.tenant=1 AND f.profile=1 AND f.module='expected' AND f.revision=1; UPDATE probe.coverage c SET revision=h.revision,complete=true FROM probe.source_heads h WHERE (c.tenant,c.profile,c.module)=(h.tenant,h.profile,h.module) AND c.tenant=1 AND c.profile=1 AND c.module='expected'; COMMIT;")


def current_snapshot():
    return h.admin("SELECT g.allowed||':'||g.revision||':'||h.revision||':'||(SELECT count(*) FROM probe.summaries s WHERE s.tenant=1 AND s.principal='coach_a' AND s.profile=1 AND s.module='expected' AND s.grant_revision=g.revision AND s.source_revision=h.revision) FROM probe.grants g JOIN probe.source_heads h USING(tenant,profile,module) WHERE g.tenant=1 AND g.principal='coach_a' AND g.profile=1 AND g.module='expected';")


def scenarios():
    check('expected_has_exact_currency_period_and_cohort', "WITH s AS MATERIALIZED(SELECT probe.summary(1,10,1,'expected',true) AS x) SELECT x->>'currency'||':'||(x->>'period_start')||':'||(x->>'period_end_exclusive')||':'||(x->>'cohort')||':'||(x->>'amount_minor') FROM s;", 'USD:2026-10-01:2026-11-01:admitted-A:200')
    check('received_remains_its_own_source_basis', "WITH s AS MATERIALIZED(SELECT probe.summary(1,10,1,'received',true) AS x) SELECT x->>'basis'||':'||(x->>'amount_minor') FROM s;", 'synthetic_received_line_minor:150')
    check('zero_exponent_currency_is_not_scaled_or_mixed', "WITH s AS MATERIALIZED(SELECT probe.summary(1,10,2,'expected',true) AS x) SELECT x->>'currency'||':'||(x->>'amount_minor') FROM s;", 'JPY:300')
    check('coach_has_no_raw_financial_fact_select', 'SELECT * FROM probe.facts;', state='42501')
    check('coach_has_no_raw_historical_summary_select', 'SELECT * FROM probe.summaries;', state='42501')
    check('coach_cannot_rewrite_source_amount', 'UPDATE probe.facts SET amount_minor=0 WHERE tenant=1;', state='42501')
    check('fractional_minor_unit_rejected_not_rounded', "INSERT INTO probe.facts VALUES(1,1,'expected',91,1,0.5);", state='23514',role='postgres')
    check('nonfinite_minor_unit_rejected', "INSERT INTO probe.facts VALUES(1,1,'expected',92,1,'NaN');", state='23514',role='postgres')
    check('reversed_period_is_structurally_invalid', "INSERT INTO probe.profiles VALUES(1,99,10,'USD','2026-11-01','2026-10-01','Etc/UTC','invalid');",state='23514',role='postgres')
    check('cross_tenant_source_profile_reference_rejected', "INSERT INTO probe.source_heads VALUES(1,21,'expected',1,'2026-10-16Z');",state='23503',role='postgres')
    check('other_module_cannot_be_inferred_from_allowed_module', summary(module='received'), 'unavailable',role='coach_b')
    check('exact_target_period_cohort_tenant_ceiling', summary(target=20)+summary(profile=4)+summary(profile=8)+summary(tenant=2,profile=21,target=20), 'unavailable\nunavailable\nunavailable\nunavailable')
    check('complete_empty_coverage_can_legitimately_be_zero', summary(profile=3), '0')
    check('incomplete_coverage_is_not_zero', summary(profile=5), 'unavailable')
    check('missing_coverage_is_not_zero', summary(profile=6), 'unavailable')
    check('unsafe_join_and_sum_distinct_both_change_financial_grain', 'SELECT probe.unsafe_join_totals();','300:230:100',counterexample=True)
    check('ratio_reconstructs_hidden_received_value', "SELECT ((probe.summary(1,10,1,'expected',true)->>'amount_minor')::numeric * probe.unsafe_ratio())::numeric(20,0)||':'||(probe.summary(1,10,1,'received',false)->>'status');",'150:unavailable',role='coach_b',counterexample=True)
    check('large_exact_integer_survives_as_decimal_json_string', "WITH s AS MATERIALIZED(SELECT probe.summary(1,10,7,'expected',true) AS x) SELECT x->>'amount_minor'||':'||jsonb_typeof(x->'amount_minor') FROM s;",'9007199254741000:string')
    revoke="UPDATE probe.grants SET allowed=false,revision=revision+1 WHERE tenant=1 AND principal='coach_a' AND profile=1 AND module='expected';"
    concurrent('revoke_first_blocks_summary_generation','source_manager',revoke,'coach_a',summary(),lambda a,b:(b.startswith('unavailable\n') and current_snapshot().endswith(':0'),dict(first=a,second=b,current=current_snapshot())))
    permit()
    concurrent('summary_first_then_revoke_preserves_history','coach_a',summary(),'source_manager',revoke,lambda a,b:(a.startswith('200\n') and current_snapshot().startswith('false:'),dict(first=a,second=b,current=current_snapshot())))
    permit()
    check('new_grant_revision_cannot_reuse_old_summary',summary(generate=False),'unavailable')
    advance="UPDATE probe.source_heads SET revision=revision+1 WHERE tenant=1 AND profile=1 AND module='expected';"
    concurrent('source_change_first_blocks_incomplete_generation','source_manager',advance,'coach_a',summary(),lambda a,b:(b.startswith('unavailable\n') and current_snapshot().endswith(':0'),dict(first=a,second=b,current=current_snapshot())))
    fresh_expected()
    concurrent('summary_first_then_source_change_fences_cache','coach_a',summary(),'source_manager',advance,lambda a,b:(a.startswith('200\n') and current_snapshot().endswith(':0'),dict(first=a,second=b,current=current_snapshot())))
    check('changed_source_makes_materialized_total_unavailable',summary(generate=False),'unavailable')
    fixture("BEGIN; UPDATE probe.source_heads SET revision=2 WHERE tenant=1 AND profile=1 AND module='received'; INSERT INTO probe.facts VALUES(1,1,'received',1,2,80),(1,1,'received',2,2,40); UPDATE probe.coverage SET revision=2 WHERE tenant=1 AND profile=1 AND module='received'; COMMIT;")
    check('new_effective_source_fold_replaces_current_not_history',summary(module='received',generate=False)+summary(module='received')+"SELECT probe.summary(1,10,1,'received',false)->>'source_revision';",'unavailable\n120\n2')
    history=h.admin("SELECT string_agg(source_revision||':'||amount_minor,',' ORDER BY source_revision) FROM probe.summaries WHERE tenant=1 AND principal='coach_a' AND profile=1 AND module='received';")
    h.RESULTS[-1]['retained_history_assertion']=dict(expected='1:150,2:120',actual=history)
    if history!='1:150,2:120':
        h.RESULTS[-1]['passed']=False
        raise AssertionError('Immutable summary history was changed')


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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','coach_a','coach_b','coach_tenant_two','source_manager') ORDER BY rolname)r;")))
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
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D9 exact scoped summary, coverage, numerical and concurrency mechanics only; not Core/P12/Supabase/Auth/PostgREST/API qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
