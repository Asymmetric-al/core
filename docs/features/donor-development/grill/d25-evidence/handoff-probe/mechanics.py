"""D25 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D25_LAB_CONTAINER"]
if not NAME.startswith("phase27-d25-handoff-lab-"):
    raise RuntimeError("Only the isolated D25 container is permitted")
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
      'head',(SELECT to_jsonb(h) FROM lab.handoff h WHERE scope_id={scope} AND id=1),
      'resolutions',COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY handoff_revision) FROM lab.resolution r WHERE scope_id={scope}),'[]'),
      'history',COALESCE((SELECT jsonb_agg(to_jsonb(h) ORDER BY event_id) FROM lab.history h WHERE scope_id={scope}),'[]'),
      'receipts',(SELECT count(*) FROM lab.receipt WHERE scope_id={scope}));"""))


def finance(scope):
    return json.loads(sql(f"""SELECT json_build_object(
      'posted',COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY id) FROM lab.finance_posted p WHERE scope_id={scope}),'[]'),
      'adjustments',COALESCE((SELECT jsonb_agg(to_jsonb(a) ORDER BY id) FROM lab.finance_adjustment a WHERE scope_id={scope}),'[]'),
      'effective_minor',(SELECT sum(amount_minor) FROM lab.finance_posted WHERE scope_id={scope})+
        COALESCE((SELECT sum(delta_minor) FROM lab.finance_adjustment WHERE scope_id={scope}),0));"""))


def resolve(scope,key='resolve'):
    return json.loads(sql(f"SELECT lab.resolve_handoff({scope},1,'{key}',1,1,1,'[11,12]');"))


try:
    sql((ROOT/'setup.sql').read_text());version=sql('SELECT version();');isolation=sql('SHOW transaction_isolation;')
    money=finance(1);before=state(1)
    sql('INSERT INTO lab.confirmation VALUES(7,88,1,1,1,true);')
    denials={
      'draft':sql("SELECT lab.resolve_handoff(1,1,'draft',1,2,1,'[11]');",expect_error='23514'),
      'wrong_handoff':sql("SELECT lab.resolve_handoff(1,1,'other',1,3,1,'[99]');",expect_error='23514'),
      'other_scope_only':sql("SELECT lab.resolve_handoff(1,1,'other-scope',1,88,1,'[11]');",expect_error='23514'),
      'null_source':sql("SELECT lab.resolve_handoff(1,1,'null',1,NULL,1,'[11]');",expect_error='22023'),
      'empty_claim':sql("SELECT lab.resolve_handoff(1,1,'empty',1,4,1,'[]');",expect_error='22023'),
      'empty_source_set':sql("SELECT lab.resolve_handoff(1,1,'empty-source',1,4,1,'[11]');",expect_error='23514'),
      'same_amount_wrong_ref':sql("SELECT lab.resolve_handoff(1,1,'same-amount',1,1,1,'[11,99]');",expect_error='23514')}
    check('only exact scoped owner confirmation can resolve: draft, other handoff/scope, absent or empty proof and equal-amount substitutes fail',
      state(1)==before and finance(1)==money,{'denials':denials,'consumer_unchanged':True,'finance_unchanged':True})

    money=finance(2)
    result=json.loads(sql("SELECT lab.resolve_handoff(2,1,'exact-set',1,1,1,'[12,11,11]');"));after=state(2)
    check('one owner-confirmed reference set attaches atomically without creating money or forcing a single posted reference',
      result['posted_refs']==[11,12] and len(after['resolutions'])==1
      and len(after['history'])==1 and after['receipts']==1
      and after['head']['last_resolution_revision']==1 and finance(2)==money,
      {'result':result,'state':after,'finance_unchanged':finance(2)==money})

    money=finance(3);before=state(3)
    failed=sql("SET lab.fail_completion='on'; SELECT lab.resolve_handoff(3,1,'same-recovery',1,1,1,'[11,12]');",expect_error='23514')
    rolled_back=state(3)==before and finance(3)==money
    recovered=resolve(3,'same-recovery');after=state(3)
    check('late consumer failure rolls back linkage/history/result while independent posted evidence survives; exact retry recovers without reposting',
      failed=='23514' and rolled_back and len(after['resolutions'])==1
      and after['receipts']==1 and finance(3)==money,
      {'error':failed,'consumer_rolled_back':rolled_back,'recovered':recovered,'finance_unchanged':finance(3)==money})

    money=finance(4)
    first,pid=session('d25_material_revision_first')
    send(first,'SELECT lab.supersede_handoff(4,1,1);');marker(first,'2')
    second,pid2=session('d25_old_confirmation_waits')
    send(second,"SELECT lab.resolve_handoff(4,1,'stale-resolution',1,1,1,'[11,12]'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);stale=finish(second,expect_error='40001');after=state(4)
    check('material handoff revision wins: waiting old confirmation cannot overwrite the corrected report; posted money remains',
      stale=='40001' and after['head']['revision']==2 and after['resolutions']==[]
      and after['receipts']==0 and len(after['history'])==1 and finance(4)==money,
      {'wait':wait,'error':stale,'state':after,'finance_unchanged':finance(4)==money})

    money=finance(5)
    first,pid=session('d25_resolution_first')
    send(first,"SELECT lab.resolve_handoff(5,1,'accepted-before-revision',1,1,1,'[11,12]');");original=json.loads(readline(first))
    second,pid2=session('d25_material_revision_waits')
    send(second,'SELECT lab.supersede_handoff(5,1,1); COMMIT;');wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);revised=finish(second);before=state(5)
    replay=resolve(5,'accepted-before-revision')
    incompatible=sql("SELECT lab.resolve_handoff(5,1,'new-head-old-proof',2,1,1,'[11,12]');",expect_error='23514')
    check('resolution wins then report revision: historical acceptance survives but cannot silently cover new report terms or be reapplied',
      revised=='2' and replay==original and state(5)==before and finance(5)==money
      and before['head']['revision']==2 and before['head']['last_resolution_revision']==1
      and len(before['history'])==2 and incompatible=='23514',
      {'wait':wait,'historic_result':replay,'head':before['head'],'old_proof_for_new_head':incompatible,'finance_unchanged':True})

    original=resolve(6,'before-financial-correction')
    # Independent finance/source correction. The consumer never executes these writes.
    sql('INSERT INTO lab.finance_adjustment VALUES(6,1,11,-10000); UPDATE lab.confirmation SET revision=2,confirmed=false WHERE scope_id=6 AND id=1;')
    money=finance(6);before=state(6);replay=resolve(6,'before-financial-correction')
    changed=sql("SELECT lab.resolve_handoff(6,1,'before-financial-correction',1,1,1,'[11,99]');",expect_error='23514')
    check('later financial/source correction does not erase historic resolution or let its replay reapply; changed reference payload conflicts',
      replay==original and state(6)==before and finance(6)==money
      and money['effective_minor']==20000 and len(money['posted'])==3 and changed=='23514',
      {'historic_result':replay,'changed_payload':changed,'current_finance':money,'consumer_unchanged':True})

    money=finance(7)
    first,pid=session('d25_duplicate_resolution_first')
    send(first,"SELECT lab.resolve_handoff(7,1,'same-intent',1,1,1,'[11,12]');");original=json.loads(readline(first))
    second,pid2=session('d25_duplicate_resolution_waits')
    send(second,"SELECT lab.resolve_handoff(7,1,'same-intent',1,1,1,'[11,12]'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);replayed=json.loads(finish(second));after=state(7)
    check('concurrent duplicate source-confirmation consumption records one resolution/history/result and zero additional money',
      replayed==original and len(after['resolutions'])==1 and len(after['history'])==1
      and after['receipts']==1 and finance(7)==money,
      {'wait':wait,'result':replayed,'state':after,'finance_unchanged':True})
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:process.kill();process.wait(timeout=5)
    report={'server_version':version,'isolation_level':locals().get('isolation'),
      'completed':completed,'passed':sum(x['pass'] for x in results),'total':len(results),
      'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


