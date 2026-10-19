"""D26 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D26_LAB_CONTAINER"]
if not NAME.startswith("phase27-d26-sharing-lab-"):
    raise RuntimeError("Only the isolated D26 container is permitted")
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
    return json.loads(sql(f"""SELECT json_build_object(
      'notes',(SELECT jsonb_agg(to_jsonb(n) ORDER BY id) FROM lab.note n WHERE scope_id={scope}),
      'history',(SELECT count(*) FROM lab.history WHERE scope_id={scope}),
      'receipts',(SELECT count(*) FROM lab.receipt WHERE scope_id={scope}));"""))


def save(scope,key='save',body='new routine context'):
    return json.loads(sql(f"SELECT lab.save_shared({scope},1,1,1,1,1,'{key}','{body}');"))


try:
    sql((ROOT/'setup.sql').read_text());version=sql('SELECT version();');isolation=sql('SHOW transaction_isolation;')
    moved=json.loads(sql("""SET ROLE d26_fixture_editor;
      UPDATE lab.weak_note SET context_id=2 WHERE id=1;
      SELECT json_build_object('role',current_user,'context',context_id,'body',body) FROM lab.weak_note WHERE id=1;
      RESET ROLE;"""))
    check('actual synthetic nonowner RLS USING/WITH CHECK permits source retarget when both contexts are writable: row policy alone is insufficient',
      moved['role']=='d26_fixture_editor' and moved['context']==2 and moved['body']=='existing source A',moved)
    # The intentionally weak fixture is separate from the command-qualified model below.

    before=state(1)
    denials={
      'missing_context':sql("SELECT lab.save_shared(1,NULL,1,2,0,1,'missing','routine');",expect_error='22023'),
      'unqualified_context':sql("SELECT lab.save_shared(1,3,1,2,0,1,'unqualified','routine');",expect_error='42501'),
      'ineligible_source':sql("SELECT lab.save_shared(1,1,2,2,0,1,'ineligible','routine');",expect_error='42501'),
      'retarget_despite_destination_access':sql("SELECT lab.save_shared(1,2,1,1,1,1,'move','routine');",expect_error='23514')}
    rejects_unchanged=state(1)==before
    accepted=json.loads(sql("SELECT lab.save_shared(1,1,1,2,0,1,'qualified-new','routine shared update');"))
    after=state(1)
    check('shared default admission needs explicit qualified context/source; existing note origin remains fixed even when destination is writable',
      rejects_unchanged and accepted['context']==1 and accepted['note_id']==2
      and len(after['notes'])==2 and after['history']==1 and after['receipts']==1,
      {'denials':denials,'rejections_left_source_unchanged':rejects_unchanged,'accepted':accepted})

    before=state(2)
    first,pid=session('d26_narrowing_first')
    send(first,'SELECT lab.narrow_context(2,1);');marker(first,'2')
    second,pid2=session('d26_stale_save_waits')
    send(second,"SELECT lab.save_shared(2,1,1,1,1,1,'late-save','new routine context'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);denied=finish(second,expect_error='42501')
    read_denied=sql('SELECT lab.read_shared(2,1,1);',expect_error='42501')
    check('source/audience invalidation wins: waiting save cannot publish under stale permission or silently choose another audience',
      denied=='42501' and read_denied=='42501' and state(2)==before,
      {'wait':wait,'save_denied':denied,'read_denied':read_denied,'content_history_receipts_unchanged':True})

    first,pid=session('d26_save_first')
    send(first,"SELECT lab.save_shared(3,1,1,1,1,1,'before-narrowing','lawfully admitted content');");accepted=json.loads(readline(first))
    second,pid2=session('d26_narrowing_waits')
    send(second,'SELECT lab.narrow_context(3,1); COMMIT;');wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);generation=finish(second);before=state(3)
    read_denied=sql('SELECT lab.read_shared(3,1,1);',expect_error='42501')
    replay_denied=sql("SELECT lab.save_shared(3,1,1,1,1,1,'before-narrowing','lawfully admitted content');",expect_error='42501')
    check('save wins before invalidation: lawful history remains, while later read and exact receipt retry recheck current disclosure',
      generation=='2' and before['history']==1 and before['receipts']==1
      and before['notes'][0]['revision']==2 and before['notes'][0]['body']=='lawfully admitted content'
      and read_denied=='42501' and replay_denied=='42501' and state(3)==before,
      {'wait':wait,'accepted':accepted,'read_denied':read_denied,'replay_denied':replay_denied,'retained_history':True})

    original=save(4,'exact-intent');before=state(4)
    changed_body=sql("SELECT lab.save_shared(4,1,1,1,1,1,'exact-intent','different content');",expect_error='23514')
    changed_audience=sql("SELECT lab.save_shared(4,1,1,1,1,2,'exact-intent','new routine context');",expect_error='23514')
    sql('UPDATE lab.access SET can_write=false WHERE scope_id=4 AND context_id=1 AND actor_id=1;')
    replay=save(4,'exact-intent')
    new_write=sql("SELECT lab.save_shared(4,1,1,1,2,1,'new-intent','another update');",expect_error='42501')
    check('exact result recovery is not a new write: readable historical receipt survives write-only revocation; changed content/audience identity conflicts',
      replay==original and state(4)==before and changed_body=='23514' and changed_audience=='23514' and new_write=='42501',
      {'historical_result':replay,'changed_body':changed_body,'changed_audience':changed_audience,'new_write_denied':new_write})

    before=state(5)
    failure=sql("SET lab.fail_evidence='on'; SELECT lab.save_shared(5,1,1,1,1,1,'recover-evidence','routine update');",expect_error='23514')
    rolled_back=state(5)==before
    recovered=save(5,'recover-evidence','routine update');after=state(5)
    check('late required-evidence failure rolls back shared content/history/receipt, and exact recovery accepts once',
      failure=='23514' and rolled_back and after['history']==1 and after['receipts']==1
      and after['notes'][0]['revision']==2,
      {'failure':failure,'rolled_back':rolled_back,'recovered':recovered,'state':after})

    first,pid=session('d26_read_admitted_first')
    send(first,'SELECT lab.read_shared(6,1,1);');body=readline(first)
    second,pid2=session('d26_invalidation_waits_for_read')
    send(second,'SELECT lab.narrow_context(6,1); COMMIT;');wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);generation=finish(second)
    later=sql('SELECT lab.read_shared(6,1,1);',expect_error='42501')
    check('read admitted before narrowing has explicit source order; a later read cannot reuse the old authorization',
      body=='original lawful source content' and generation=='2' and later=='42501',
      {'wait':wait,'read_before_invalidation':body,'later_read_denied':later,
       'limit':'database admission order only, not recall of delivered bytes or client cache proof'})
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:process.kill();process.wait(timeout=5)
    report={'server_version':version,'isolation_level':locals().get('isolation'),
      'completed':completed,'passed':sum(x['pass'] for x in results),'total':len(results),
      'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


