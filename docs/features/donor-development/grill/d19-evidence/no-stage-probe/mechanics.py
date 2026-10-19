"""D19 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D19_LAB_CONTAINER"]
if not NAME.startswith("phase27-d19-no-stage-lab-"):
    raise RuntimeError("Only the isolated D19 container is permitted")
ENV = dict(os.environ)
for key in ["DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH"]:
    ENV.pop(key, None)
BASE = ["docker", "--host=unix:///var/run/docker.sock", "exec", "-i", NAME,
        "psql", "-X", "-U", "postgres", "-d", "postgres", "-Atq",
        "-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=verbose"]
results = []
sessions = []
version = None
completed = False


def check(name, condition, observed):
    results.append({"test": name, "pass": bool(condition), "observed": observed})
    if not condition:
        raise AssertionError((name, observed))


def error_code(stderr):
    found = re.search(r"ERROR:\s+([0-9A-Z]{5}):", stderr)
    return found.group(1) if found else None


def sql(source, expect_error=None):
    result = subprocess.run(BASE, input="SET statement_timeout='15s';\n" + source,
                            text=True, capture_output=True, env=ENV, timeout=20)
    if expect_error is not None:
        actual = error_code(result.stderr)
        if result.returncode == 0 or actual != expect_error:
            raise AssertionError((expect_error, result.returncode, result.stdout, result.stderr))
        return actual
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def session(name):
    process = subprocess.Popen(BASE, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, text=True, env=ENV, bufsize=1)
    sessions.append(process)
    send(process, f"SET application_name='{name}'; SET statement_timeout='15s'; BEGIN; SELECT pg_backend_pid();")
    return process, int(readline(process))


def send(process, source):
    process.stdin.write(source + "\n")
    process.stdin.flush()


def readline(process):
    with selectors.DefaultSelector() as selector:
        selector.register(process.stdout, selectors.EVENT_READ)
        if not selector.select(timeout=10):
            raise RuntimeError("Transaction output barrier timeout")
    row = process.stdout.readline().strip()
    if not row:
        raise RuntimeError("Unexpected empty transaction output barrier")
    return row


def marker(process, expected):
    actual = readline(process)
    if actual != expected:
        raise AssertionError((expected, actual))


def finish(process, expect_error=None):
    process.stdin.close()
    process.stdin = None
    stdout, stderr = process.communicate(timeout=20)
    if expect_error is not None:
        actual = error_code(stderr)
        if process.returncode == 0 or actual != expect_error:
            raise AssertionError((expect_error, process.returncode, stderr))
        return actual
    if process.returncode:
        raise RuntimeError(stderr)
    return stdout.strip()


def blocked(waiter, blocker):
    deadline = time.monotonic() + 8
    while time.monotonic() < deadline:
        observed = sql(f"""SELECT json_build_object('waiter_pid',pid,'wait_event_type',wait_event_type,
          'blocker_pids',pg_blocking_pids(pid)) FROM pg_stat_activity
          WHERE pid={waiter} AND wait_event_type='Lock'
          AND {blocker}=ANY(pg_blocking_pids(pid));""")
        if observed:
            return json.loads(observed)
        time.sleep(0.05)
    raise RuntimeError(f"No observed wait from {waiter} on expected blocker {blocker}")


def state(scope):
    return json.loads(sql(f"""SELECT json_build_object('journey',to_jsonb(j),
      'history',COALESCE((SELECT jsonb_agg(to_jsonb(h) ORDER BY revision) FROM lab.history h
        WHERE tenant_id=1 AND scope_id={scope}),'[]'::jsonb),
      'receipts',COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY command_key) FROM lab.receipt r
        WHERE tenant_id=1 AND scope_id={scope}),'[]'::jsonb)) FROM lab.journey j
        WHERE tenant_id=1 AND scope_id={scope} AND id=100;"""))


def call(scope,key,revision,target,stage=None,omit=False):
    intent={'expected_revision':revision,'target_list':target}
    if not omit:
        intent['target_stage']=stage
    # All inputs are fixed synthetic literals, not caller-provided shell/SQL text.
    literal=json.dumps(intent,separators=(',',':'))
    return f"SELECT lab.switch_list(1,{scope},100,'{key}','{literal}'::jsonb);"


try:
    sql((ROOT/'setup.sql').read_text())
    version=sql('SELECT version();')
    isolation=sql('SHOW transaction_isolation;')

    sql('INSERT INTO lab.naive_binding VALUES(1,1,999,NULL);')
    naive=sql('SELECT count(*) FROM lab.naive_binding WHERE list_id=999;')
    missing_parent=sql("INSERT INTO lab.journey VALUES(1,1,999,200,300,'p',999,NULL,1);",expect_error='23503')
    null_parent=sql("INSERT INTO lab.journey VALUES(1,1,999,200,300,'p',NULL,NULL,1);",expect_error='23502')
    foreign_scope=sql("INSERT INTO lab.journey VALUES(1,999,999,200,300,'p',10,NULL,1);",expect_error='23503')
    check('MATCH SIMPLE trap: absent stage bypasses lone composite FK; independent required scoped list FK rejects invalid parent',
      naive=='1' and missing_parent=='23503' and null_parent=='23502' and foreign_scope=='23503',
      {'naive_invalid_parent_rows':int(naive),'missing_parent':missing_parent,
       'null_required_parent':null_parent,'wrong_source_scope':foreign_scope})

    extracted=json.loads(sql("""SELECT json_build_object(
      'omitted_extract',('{}'::jsonb->>'target_stage'),
      'explicit_null_extract',('{"target_stage":null}'::jsonb->>'target_stage'),
      'omitted_has_key','{}'::jsonb ? 'target_stage',
      'explicit_has_key','{"target_stage":null}'::jsonb ? 'target_stage');"""))
    before=state(1)
    omission=sql(call(1,'omitted',1,20,omit=True),expect_error='22023')
    stale_stage=sql(call(1,'stale-stage',1,20,101),expect_error='23503')
    invalid_value=sql(call(1,'empty-stage',1,20,''),expect_error='22023')
    check('extraction conflates omission and JSON null; presence validation rejects omission and invalid or old-list stage without clearing',
      extracted=={'omitted_extract':None,'explicit_null_extract':None,
                  'omitted_has_key':False,'explicit_has_key':True}
      and omission=='22023' and stale_stage=='23503' and invalid_value=='22023' and state(1)==before,
      {'extraction':extracted,'omission':omission,'old_list_stage':stale_stage,
       'invalid_empty_string':invalid_value,'source_unchanged':state(1)==before})

    before=state(1)
    late_failure=sql(call(1,'fixture-deny-receipt',1,20,None),expect_error='23514')
    rolled_back=state(1)==before
    first,pid=session('d19_explicit_no_stage_atomic')
    send(first,call(1,'no-stage',1,20,None));no_stage_result=json.loads(readline(first))
    pending=state(1)
    send(first,'COMMIT;');finish(first)
    after=state(1)
    check('explicit no-stage switch commits required list, null current stage, old assessment history and exact receipt atomically',
      rolled_back and late_failure=='23514' and pending==before
      and after['journey']==no_stage_result and no_stage_result['list_id']==20
      and no_stage_result['stage_id'] is None and no_stage_result['revision']==2
      and len(after['history'])==1 and after['history'][0]['from_stage']==101
      and after['history'][0]['to_stage'] is None and len(after['receipts'])==1
      and after['receipts'][0]['intent']['target_stage'] is None,
      {'late_failure':late_failure,'rollback':rolled_back,'pending_saw_old':pending==before,
       'accepted':no_stage_result,'history':after['history']})

    before=state(1)
    exact=json.loads(sql(call(1,'no-stage',1,20,None)))
    omit_conflict=sql(call(1,'no-stage',1,20,omit=True),expect_error='23514')
    stage_conflict=sql(call(1,'no-stage',1,20,201),expect_error='23514')
    check('same durable identity replays explicit absence but does not conflate omitted stage or a concrete assessment',
      exact==no_stage_result and omit_conflict=='23514' and stage_conflict=='23514'
      and state(1)==before,
      {'omission_conflict':omit_conflict,'concrete_stage_conflict':stage_conflict,
       'exact_replay_unchanged':state(1)==before})

    returned=json.loads(sql(call(1,'return-without-stage',2,10,None)))
    before=state(1)
    old_receipt=json.loads(sql(call(1,'no-stage',1,20,None)))
    check('return to an earlier list with explicit absence preserves earlier assessment history without restoring it; old receipt never reapplies',
      returned['list_id']==10 and returned['stage_id'] is None and returned['revision']==3
      and len(before['history'])==2 and before['history'][0]['from_stage']==101
      and before['history'][1]['to_stage'] is None and old_receipt==no_stage_result
      and state(1)==before,
      {'current':returned,'old_successful_receipt':old_receipt,
       'old_assessment_retained_in_history':before['history'][0]['from_stage'],
       'no_reapplication':state(1)==before})

    first,pid=session('d19_concrete_destination_wins')
    send(first,call(2,'chosen-stage-first',1,20,201));chosen_result=json.loads(readline(first))
    second,pid2=session('d19_stale_no_stage_waits')
    send(second,call(2,'old-no-stage-proposal',1,20,None)+' COMMIT;')
    wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first)
    conflict=finish(second,expect_error='40001')
    after=state(2)
    same_list=sql(call(2,'refreshed-but-same-list-clear',2,20,None),expect_error='23514')
    check('stale A-to-B no-stage proposal cannot clear B assessment after another writer wins; fresh same-list clear remains outside switch command',
      conflict=='40001' and after['journey']==chosen_result and chosen_result['stage_id']==201
      and len(after['history'])==1 and len(after['receipts'])==1
      and same_list=='23514' and state(2)==after,
      {'wait':wait,'stale_error':conflict,'same_list_clear':same_list,'current':after['journey']})

    before=state(3)
    sql('UPDATE lab.stage_list SET accepts_new=false WHERE tenant_id=1 AND scope_id=3 AND id=20;')
    unavailable=sql(call(3,'unavailable-without-stage',1,20,None),expect_error='23514')
    check('no-stage choice does not skip target new-attachment eligibility',
      unavailable=='23514' and state(3)==before,
      {'unavailable_target':unavailable,'source_unchanged':state(3)==before})

    report_counts=json.loads(sql("""SELECT json_build_object(
      'journey_rows',(SELECT count(*) FROM lab.journey),
      'nonnull_stages',(SELECT count(stage_id) FROM lab.journey),
      'unassessed',(SELECT count(*) FROM lab.journey WHERE stage_id IS NULL),
      'inner_join_rows',(SELECT count(*) FROM lab.journey j JOIN lab.stage s
        ON (j.tenant_id,j.scope_id,j.list_id,j.stage_id)=(s.tenant_id,s.scope_id,s.list_id,s.id)),
      'not_equal_201',(SELECT count(*) FROM lab.journey WHERE stage_id<>201),
      'distinct_from_201',(SELECT count(*) FROM lab.journey WHERE stage_id IS DISTINCT FROM 201),
      'null_equals_null',(NULL::int=NULL::int),
      'null_not_distinct_null',(NULL::int IS NOT DISTINCT FROM NULL::int));"""))
    check('report counterexamples: inner joins, count(stage), inequality and equals-null omit or misclassify known unassessed rows',
      report_counts=={'journey_rows':5,'nonnull_stages':4,'unassessed':1,
        'inner_join_rows':4,'not_equal_201':3,'distinct_from_201':4,
        'null_equals_null':None,'null_not_distinct_null':True},report_counts)
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:
            process.kill();process.wait(timeout=5)
    report={'server_version':version,'isolation_level':locals().get('isolation'),
      'completed':completed,'passed':sum(x['pass'] for x in results),'total':len(results),
      'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


