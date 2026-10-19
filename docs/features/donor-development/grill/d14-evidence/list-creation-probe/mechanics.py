"""D14 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D14_LAB_CONTAINER"]
if not NAME.startswith("phase27-d14-list-lab-"):
    raise RuntimeError("Only the isolated D14 container is permitted")
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


def snapshot():
    return json.loads(sql("""SELECT json_build_object(
      'lists',(SELECT json_agg(x ORDER BY tenant_id,id) FROM lab.stage_list x),
      'stages',(SELECT json_agg(x ORDER BY tenant_id,list_id,id) FROM lab.stage x),
      'receipts',(SELECT coalesce(json_agg(x ORDER BY tenant_id,effect_key),'[]') FROM lab.creation_receipt x),
      'configuration_events',(SELECT coalesce(json_agg(x ORDER BY tenant_id,list_id),'[]') FROM lab.configuration_event x));"""))


def journey_snapshot():
    return json.loads(sql("""SELECT json_build_object(
      'journeys',(SELECT json_agg(x ORDER BY tenant_id,id) FROM lab.journey x),
      'events',(SELECT json_agg(x ORDER BY tenant_id,journey_id) FROM lab.journey_event x));"""))


def create(tenant,effect,label,stages):
    # Fixed fixture constants only, never external/app data.
    stages_sql='ARRAY['+','.join("'"+stage+"'" for stage in stages)+']'
    return json.loads(sql(f"SELECT lab.create_list({tenant},'{effect}','{label}',{stages_sql});"))


try:
    sql((ROOT/'setup.sql').read_text())
    version=sql('SELECT version();')
    original_journeys=journey_snapshot()
    sql('INSERT INTO lab.bad_journey VALUES(1,1,2);')
    bad=json.loads(sql("""SELECT json_build_object('journey_list',j.list_id,'stage_list',s.list_id)
      FROM lab.bad_journey j JOIN lab.stage s ON (s.tenant_id,s.id)=(j.tenant_id,j.stage_id);"""))
    check('counterexample: independent list and stage references permit a same-tenant wrong-list stage',
          bad=={'journey_list':1,'stage_list':2},bad)

    wrong_list=sql('UPDATE lab.journey SET stage_id=2 WHERE tenant_id=1 AND id=1;',expect_error='23503')
    wrong_tenant_list=sql('UPDATE lab.journey SET list_id=3,stage_id=NULL WHERE tenant_id=1 AND id=1;',expect_error='23503')
    check('composite membership rejects wrong-list stage and foreign list without changing source',
          wrong_list=='23503' and wrong_tenant_list=='23503' and journey_snapshot()==original_journeys,
          {'same_tenant_wrong_list':wrong_list,'foreign_list':wrong_tenant_list})

    sql("""INSERT INTO lab.bad_name_key VALUES(1,'Shared label','intent-one');
      INSERT INTO lab.bad_name_key VALUES(1,'Shared label','intent-two')
        ON CONFLICT(tenant_id,label) DO NOTHING;""")
    bad_name=json.loads(sql('SELECT json_agg(x) FROM lab.bad_name_key x;'))
    check('counterexample: label-based duplicate success silently merges two distinct create intents',
          len(bad_name)==1 and bad_name[0]['creation_intent']=='intent-one',
          {'attempted_intents':2,'persisted_rows':bad_name})

    created=create(1,'create-1','New process',['Listen','Agree'])
    state=snapshot();receipt=created['receipt'];list_id=receipt['list_id']
    stages=[s for s in state['stages'] if s['tenant_id']==1 and s['list_id']==list_id]
    histories=[h for h in state['configuration_events'] if h['effect_key']=='create-1']
    receipts=[r for r in state['receipts'] if r['effect_key']=='create-1']
    check('one create stores new list, independent stage IDs, configuration history and matching receipt',
          len(stages)==2 and [s['label'] for s in stages]==['Listen','Agree']
          and all(s['id'] not in [1,2,3] for s in stages)
          and len(histories)==1 and histories[0]['snapshot']==receipt
          and len(receipts)==1 and receipts[0]['outcome']==receipt,
          {'receipt':created,'stage_rows':stages,'configuration_events':histories})

    replay=create(1,'create-1','New process',['Listen','Agree'])
    check('ambiguous completed create retry returns the same identities without new records',
          replay['replayed'] and replay['receipt']==receipt and snapshot()==state,replay)

    altered_label=sql("SELECT lab.create_list(1,'create-1','Different',ARRAY['Listen','Agree']);",expect_error='22023')
    altered_stages=sql("SELECT lab.create_list(1,'create-1','New process',ARRAY['Listen','Other']);",expect_error='22023')
    check('existing effect key cannot silently accept changed list or stage intent',
          altered_label=='22023' and altered_stages=='22023' and snapshot()==state,
          {'changed_label_error':altered_label,'changed_stage_error':altered_stages})

    distinct=create(1,'create-2','New process',['Discover'])
    check('distinct create intent with same label is not mistaken for the original request',
          distinct['receipt']['list_id']!=list_id and not distinct['replayed']
          and distinct['receipt']['stages'][0]['id'] not in [s['id'] for s in stages],
          {'first':receipt,'second':distinct['receipt'],
           'limit':'Fixture deliberately permits equal labels; no product label-uniqueness rule is selected.'})

    before_failure=snapshot()
    failed=sql("SELECT lab.create_list(1,'partial-failure','Broken process',ARRAY['Valid',NULL]);",expect_error='23502')
    check('failure inside stage insertion rolls back claimed receipt, list, stages and configuration history',
          failed=='23502' and snapshot()==before_failure,
          {'sqlstate':failed,'source_record_counts':{key:len(rows) for key,rows in before_failure.items()}})

    before_abort=snapshot()
    aborted=sql("BEGIN; SELECT lab.create_list(1,'abort-after-create','Never committed',ARRAY['One']); SELECT 1/0; COMMIT;",expect_error='22012')
    check('error after complete creation but before commit leaves no successful list or receipt',
          aborted=='22012' and snapshot()==before_abort,{'sqlstate':aborted})

    role_info=json.loads(sql("""SET ROLE lab_config; SELECT json_build_object('user',current_user,
      'superuser',rolsuper,'bypassrls',rolbypassrls) FROM pg_roles WHERE rolname=current_user;"""))
    config_write=sql("SET ROLE lab_config; WITH changed AS (UPDATE lab.stage_list SET label=label WHERE tenant_id=1 AND id=1 RETURNING id) SELECT count(*) FROM changed;")
    journey_read=sql('SET ROLE lab_config; SELECT * FROM lab.journey;',expect_error='42501')
    journey_write=sql('SET ROLE lab_config; UPDATE lab.journey SET list_id=2,stage_id=2 WHERE tenant_id=1 AND id=1;',expect_error='42501')
    check('separate configuration privilege does not inherently grant journey read or write',
          config_write=='1' and journey_read=='42501' and journey_write=='42501'
          and role_info=={'user':'lab_config','superuser':False,'bypassrls':False},
          {'role':role_info,'config_rows_updated':int(config_write),'journey_read':journey_read,'journey_write':journey_write})

    label_groups=json.loads(sql("""SELECT json_agg(x) FROM (SELECT s.label,count(*) AS journeys
      FROM lab.journey j JOIN lab.stage s ON (s.tenant_id,s.list_id,s.id)=(j.tenant_id,j.list_id,j.stage_id)
      GROUP BY s.label) x;"""))
    scoped_groups=json.loads(sql("""SELECT json_agg(x ORDER BY list_id,stage_id) FROM
      (SELECT j.list_id,j.stage_id,count(*) AS journeys FROM lab.journey j GROUP BY j.list_id,j.stage_id) x;"""))
    check('label-only grouping merges distinct list meanings; identity-aware grouping preserves both',
          label_groups==[{'label':'Engaged','journeys':2}] and len(scoped_groups)==2
          and all(r['journeys']==1 for r in scoped_groups),
          {'label_groups':label_groups,'scoped_groups':scoped_groups})

    before_concurrent=snapshot()
    first,first_pid=session('d14-create-winner')
    send(first,"SELECT lab.create_list(1,'concurrent-create','Concurrent process',ARRAY['First','Second']);")
    first_result=json.loads(readline(first))
    new_id=first_result['receipt']['list_id']
    invisible_before_commit=snapshot()==before_concurrent
    second,second_pid=session('d14-create-retry')
    send(second,"SELECT lab.create_list(1,'concurrent-create','Concurrent process',ARRAY['First','Second']);")
    barrier=blocked(second_pid,first_pid)
    send(first,'COMMIT;');finish(first)
    second_result=json.loads(readline(second))
    send(second,'COMMIT;');finish(second)
    after=snapshot()
    check('concurrent duplicate creation waits, sees no partial committed list and yields one complete result',
          invisible_before_commit and second_result['replayed']
          and first_result['receipt']==second_result['receipt']
          and len(after['lists'])==len(before_concurrent['lists'])+1
          and len(after['stages'])==len(before_concurrent['stages'])+2
          and len(after['configuration_events'])==len(before_concurrent['configuration_events'])+1
          and len(after['receipts'])==len(before_concurrent['receipts'])+1,
          {'exact_lock_barrier':barrier,'no_uncommitted_records_visible':invisible_before_commit,
           'first':first_result,'retry':second_result})

    other_tenant=create(2,'create-1','New process',['Other scope'])
    check('same intent token in another tenant has an independent scoped receipt and list',
          other_tenant['receipt']['tenant_id']==2 and other_tenant['receipt']['list_id']!=list_id
          and not other_tenant['replayed'],other_tenant)

    check('configuration creation never reassigns existing journeys or invents journey history',
          journey_snapshot()==original_journeys,journey_snapshot())
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:
            process.kill();process.communicate()
    report={'postgres_version':version,'completed':completed,'passed':sum(r['pass'] for r in results),
      'total':len(results),'all_pass':completed and all(r['pass'] for r in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'total':report['total'],'all_pass':report['all_pass']}))


