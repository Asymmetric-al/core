"""D17 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D17_LAB_CONTAINER"]
if not NAME.startswith("phase27-d17-default-lab-"):
    raise RuntimeError("Only the isolated D17 container is permitted")
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
    return json.loads(sql(f"""SELECT json_build_object('revision',revision,'default',default_list_id,
      'lists',(SELECT json_agg(json_build_object('id',id,'available',accepts_new) ORDER BY id)
        FROM lab.stage_list WHERE tenant_id=1 AND scope_id={scope}),
      'events',(SELECT count(*) FROM lab.config_event WHERE tenant_id=1 AND scope_id={scope}),
      'receipts',(SELECT count(*) FROM lab.command_receipt WHERE tenant_id=1 AND scope_id={scope}))
      FROM lab.catalog_scope WHERE tenant_id=1 AND scope_id={scope};"""))


def configure(scope,key,op,target,revision,clear=False):
    target_sql='NULL' if target is None else str(target)
    return json.loads(sql(f"SELECT lab.configure(1,{scope},'{key}','{op}',{target_sql},{revision},{str(clear).lower()});"))


try:
    sql((ROOT/'setup.sql').read_text())
    version=sql('SELECT version();')
    sql('UPDATE lab.stage_list SET accepts_new=false WHERE tenant_id=1 AND scope_id=1 AND id=11;')
    resolver=json.loads(sql("""WITH eligible AS (
      SELECT id FROM lab.stage_list WHERE tenant_id=1 AND scope_id=1 AND accepts_new
    ) SELECT json_build_object('stored_default',c.default_list_id,
      'eligible_count',(SELECT count(*) FROM eligible),
      'eligible_default',(SELECT id FROM eligible WHERE id=c.default_list_id),
      'initial_choice',CASE WHEN EXISTS(SELECT 1 FROM eligible WHERE id=c.default_list_id)
        THEN c.default_list_id WHEN (SELECT count(*) FROM eligible)=1
        THEN (SELECT id FROM eligible) ELSE NULL END)
      FROM lab.catalog_scope c WHERE tenant_id=1 AND scope_id=1;"""))
    check('FK-valid stored default can be unavailable; qualified complete-set resolver chooses no arbitrary fallback',
          resolver=={'stored_default':11,'eligible_count':2,'eligible_default':None,'initial_choice':None},resolver)

    coverage=json.loads(sql("""SELECT json_build_object(
      'eligible_total',(SELECT count(*) FROM lab.stage_list WHERE tenant_id=1 AND scope_id=6 AND accepts_new),
      'first_page_count',(SELECT count(*) FROM (SELECT id FROM lab.stage_list
        WHERE tenant_id=1 AND scope_id=6 AND accepts_new ORDER BY id LIMIT 1) p));"""))
    check('counterexample: one loaded eligible row is not a sole eligible list',
          coverage=={'eligible_total':3,'first_page_count':1},coverage)

    first,first_pid=session('d17_default_first')
    send(first,"SELECT lab.configure(1,2,'set21','set_default',21,1); SELECT 'held';")
    initial_result=json.loads(readline(first));marker(first,'held')
    second,second_pid=session('d17_withdraw_waits')
    send(second,"SELECT lab.configure(1,2,'withdraw21-stale','withdraw',21,1,true); COMMIT;")
    wait=blocked(second_pid,first_pid)
    send(first,'COMMIT;');finish(first)
    conflict=finish(second,expect_error='40001')
    check('default-set first: competing withdrawal waits and its stale revision cannot partly apply',
          initial_result=={'revision':2,'default_list_id':21} and state(2)['default']==21
          and state(2)['lists'][0]['available'] and state(2)['events']==1 and conflict=='40001',
          {'wait':wait,'error':conflict,'state':state(2)})

    before=state(2)
    missing=sql("SELECT lab.configure(1,2,'withdraw21-no-disposition','withdraw',21,2,false);",expect_error='23514')
    rollback=sql("BEGIN; SELECT lab.configure(1,2,'withdraw21-rolledback','withdraw',21,2,true); SELECT 1/0; COMMIT;",expect_error='22012')
    check('withdrawal requires explicit matching-default disposition; post-call failure rolls back flags, pointer, audit and receipt',
          missing=='23514' and rollback=='22012' and state(2)==before,
          {'missing_disposition_error':missing,'rollback_error':rollback,'unchanged':state(2)==before})

    first,first_pid=session('d17_atomic_withdraw')
    send(first,"SELECT lab.configure(1,2,'withdraw21','withdraw',21,2,true); SELECT 'held';")
    withdrawal_result=json.loads(readline(first));marker(first,'held')
    observer=state(2)
    send(first,'COMMIT;');finish(first)
    after=state(2)
    check('accepted withdrawal clears only matching default coherently; observer sees old complete state before commit',
          observer==before and after['default'] is None and not after['lists'][0]['available']
          and after['revision']==3 and after['events']==2 and after['receipts']==2
          and withdrawal_result=={'revision':3,'default_list_id':None},
          {'before_commit':observer,'after_commit':after})

    first,first_pid=session('d17_withdraw_first')
    send(first,"SELECT lab.configure(1,3,'withdraw31','withdraw',31,1,false); SELECT 'held';")
    readline(first);marker(first,'held')
    second,second_pid=session('d17_default_waits')
    send(second,"SELECT lab.configure(1,3,'set31-stale','set_default',31,1); COMMIT;")
    wait=blocked(second_pid,first_pid)
    send(first,'COMMIT;');finish(first)
    stale=finish(second,expect_error='40001')
    ineligible=sql("SELECT lab.configure(1,3,'set31-refreshed','set_default',31,2);",expect_error='23514')
    check('withdrawal first: waiting default mutation rejects stale revision and refreshed request rejects unavailable target',
          stale=='40001' and ineligible=='23514' and state(3)['default'] is None
          and not state(3)['lists'][0]['available'] and state(3)['events']==1,
          {'wait':wait,'stale_error':stale,'ineligible_error':ineligible,'state':state(3)})

    restored=configure(2,'restore21','restore',21,3)
    before_replay=state(2)
    replay=configure(2,'set21','set_default',21,1)
    check('restore does not revive default; old accepted set-default retry returns historical receipt without reapplying',
          restored=={'revision':4,'default_list_id':None} and before_replay['lists'][0]['available']
          and replay==initial_result and state(2)==before_replay and state(2)['events']==3,
          {'old_receipt':replay,'current_state':state(2)})

    configure(4,'replace41-with42','set_default',42,1)
    configure(4,'withdraw-nondefault41','withdraw',41,2,True)
    preserved=state(4)
    unset=configure(4,'unset42','set_default',None,3)
    stale=sql("SELECT lab.configure(1,4,'stale-replace','set_default',43,2);",expect_error='40001')
    check('replacement, unrelated withdrawal and explicit unset preserve one optional default and reject stale overwrite',
          preserved['default']==42 and not preserved['lists'][0]['available']
          and unset=={'revision':4,'default_list_id':None} and state(4)['default'] is None
          and state(4)['events']==3 and stale=='40001',
          {'after_unrelated_withdrawal':preserved,'after_unset':state(4),'stale_error':stale})

    selected=51  # Captured actual reviewed intent, not a live default alias.
    configure(5,'new-usual-list52','set_default',52,1)
    accepted=sql(f'SELECT lab.accept_selected(1,5,500,{selected});')
    target=int(sql('SELECT selected_list_id FROM lab.accepted_work WHERE tenant_id=1 AND scope_id=5 AND id=500;'))
    check('reviewed explicit list survives later default change; acceptance uses selected ID rather than late default resolution',
          accepted=='accepted-selected' and target==selected and state(5)['default']==52,
          {'reviewed_list':selected,'accepted_list':target,'current_default':state(5)['default']})
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:
            process.kill();process.wait(timeout=5)
    report={'server_version':version,'completed':completed,'passed':sum(x['pass'] for x in results),
            'total':len(results),'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


