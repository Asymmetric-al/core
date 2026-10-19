"""D24 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D24_LAB_CONTAINER"]
if not NAME.startswith("phase27-d24-membership-lab-"):
    raise RuntimeError("Only the isolated D24 container is permitted")
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
      'members',COALESCE((SELECT jsonb_agg(to_jsonb(m) ORDER BY party_id) FROM lab.member m WHERE scope_id={scope}),'[]'),
      'history',COALESCE((SELECT jsonb_agg(to_jsonb(h) ORDER BY party_id,revision) FROM lab.history h WHERE scope_id={scope}),'[]'),
      'receipts',(SELECT count(*) FROM lab.receipt WHERE scope_id={scope}),
      'batches',(SELECT count(*) FROM lab.batch WHERE scope_id={scope}));"""))


def capture(scope,key,items):
    # All values are fixture constants, never user input.
    payload=json.dumps([{'party_id':p,'expected_revision':v} for p,v in items])
    return json.loads(sql(f"SELECT lab.capture({scope},1,'{key}','{payload}');"))


def apply(scope,key):
    return json.loads(sql(f"SELECT lab.apply_batch({scope},1,'{key}');"))


try:
    sql((ROOT/'setup.sql').read_text());version=sql('SELECT version();');isolation=sql('SHOW transaction_isolation;')
    initial=json.loads(sql('SELECT jsonb_agg(id ORDER BY id) FROM lab.party WHERE scope_id=1 AND matches_filter;'))
    captured=capture(1,'finite',[(initial[0],0),(initial[0],0),(initial[1],0)])
    sql('UPDATE lab.party SET matches_filter=(id IN(1,3)) WHERE scope_id=1;')
    changed=json.loads(sql('SELECT jsonb_agg(id ORDER BY id) FROM lab.party WHERE scope_id=1 AND matches_filter;'))
    result=apply(1,'finite');after=state(1)
    duplicate=sql("INSERT INTO lab.member VALUES(1,1,1,'included',9);",expect_error='23505')
    check('captured membership remains finite across filter change; duplicate candidate yields one scoped membership',
      initial==[1,2] and changed==[1,3] and len(captured)==2
      and [x['party_id'] for x in after['members']]==[1,2]
      and len(after['history'])==2 and duplicate=='23505',
      {'initial_filter':initial,'later_filter':changed,'capture':captured,'result':result,'duplicate_error':duplicate})

    capture(2,'stale-add',[(1,0)])
    first,pid=session('d24_exclusion_first')
    send(first,"SELECT lab.set_member(2,1,1,'exclude',0,'excluded');");excluded=json.loads(readline(first))
    second,pid2=session('d24_stale_add_waits')
    send(second,"SELECT lab.apply_batch(2,1,'stale-add'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);outcome=json.loads(finish(second));after=state(2)
    check('absent-to-excluded tombstone wins: waiting stale bulk add records conflict, never resurrects',
      excluded['revision']==1 and outcome==[{'party_id':1,'outcome':'conflict'}]
      and after['members'][0]['state']=='excluded' and len(after['history'])==1,
      {'wait':wait,'outcome':outcome,'state':after})

    capture(3,'add-first',[(1,0)])
    first,pid=session('d24_add_first')
    send(first,"SELECT lab.apply_batch(3,1,'add-first');");accepted=json.loads(readline(first))
    second,pid2=session('d24_current_exclusion_waits')
    # Revision 1 is deliberately supplied by this controlled fixture. No UI auto-refresh claim.
    send(second,"SELECT lab.set_member(3,1,1,'exclude-current',1,'excluded'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);excluded=json.loads(finish(second));before=state(3)
    replay=apply(3,'add-first')
    check('add wins then current explicit exclusion: old accepted batch replay cannot undo the later exclusion',
      excluded['revision']==2 and replay==accepted and state(3)==before
      and before['members'][0]['state']=='excluded' and len(before['history'])==2,
      {'wait':wait,'old_result':replay,'current_member':before['members'][0],'history':before['history']})

    sql("SELECT lab.set_member(4,1,4,'remove-before-batch',0,'removed'); UPDATE lab.party SET eligible=false WHERE scope_id=4 AND id=2;")
    capture(4,'partial',[(1,0),(2,0),(4,1),(99,0)])
    original=apply(4,'partial')
    sql("SELECT lab.set_member(4,1,1,'later-remove',1,'removed'); UPDATE lab.party SET eligible=true WHERE scope_id=4 AND id=2;")
    before=state(4);replayed=apply(4,'partial')
    check('partial batch keeps item outcomes; exact retry after eligibility change and removal neither expands nor reapplies',
      original==[{'party_id':1,'outcome':'included'},{'party_id':2,'outcome':'unavailable'},
        {'party_id':4,'outcome':'not_included'},{'party_id':99,'outcome':'unavailable'}]
      and replayed==original and state(4)==before
      and [m['party_id'] for m in before['members']]==[1,4],
      {'original_result':original,'replayed_result':replayed,'current_members':before['members']})

    capture(5,'fixture-late-failure',[(1,0),(2,0)])
    before=state(5);failure=sql("SELECT lab.apply_batch(5,1,'fixture-late-failure');",expect_error='23514')
    check('late durable-receipt failure rolls back all proposed member and history writes; accepted capture remains recoverable',
      failure=='23514' and state(5)==before and before['batches']==1
      and before['members']==[] and before['receipts']==0,
      {'error':failure,'state_unchanged':state(5)==before,'state':state(5)})

    sql("SELECT lab.set_member(6,1,1,'exclude',0,'excluded');")
    capture(6,'plain-add',[(1,1)]);skipped=apply(6,'plain-add')
    returned=json.loads(sql("SELECT lab.set_member(6,1,1,'explicit-return',1,'included');"))
    sql("SELECT lab.set_member(6,1,1,'remove-again',2,'removed');")
    before=state(6)
    old_return=json.loads(sql("SELECT lab.set_member(6,1,1,'explicit-return',1,'included');"))
    stale=sql("SELECT lab.set_member(6,1,1,'new-key-old-revision',1,'included');",expect_error='40001')
    check('plain add skips recorded exclusion; explicit current return retains history and old return replay cannot undo later removal',
      skipped==[{'party_id':1,'outcome':'not_included'}] and old_return==returned
      and returned['revision']==2 and state(6)==before and stale=='40001'
      and [h['state'] for h in before['history']]==['excluded','included','removed'],
      {'plain_add':skipped,'historic_return':old_return,'stale_return':stale,'current_member':before['members'][0]})

    original=capture(7,'fixed-intent',[(2,0),(1,0)])
    normalized=capture(7,'fixed-intent',[(1,0),(2,0),(1,0)])
    apply(7,'fixed-intent');before=state(7)
    changed=sql("SELECT lab.capture(7,1,'fixed-intent','[{\"party_id\":1,\"expected_revision\":0},{\"party_id\":3,\"expected_revision\":0}]');",expect_error='23514')
    ambiguity=sql("SELECT lab.capture(7,1,'ambiguous','[{\"party_id\":1,\"expected_revision\":0},{\"party_id\":1,\"expected_revision\":1}]');",expect_error='22023')
    check('same command normalizes order and duplicate IDs, but changing finite identities or conflicting observed versions cannot mutate it',
      original==normalized and changed=='23514' and ambiguity=='22023' and state(7)==before,
      {'normalized':normalized,'changed_identity_error':changed,'conflicting_duplicate_version':ambiguity})

    capture(8,'same-batch',[(1,0)])
    first,pid=session('d24_same_batch_first')
    send(first,"SELECT lab.apply_batch(8,1,'same-batch');");original=json.loads(readline(first))
    second,pid2=session('d24_same_batch_retry_waits')
    send(second,"SELECT lab.apply_batch(8,1,'same-batch'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);replay=json.loads(finish(second));after=state(8)
    check('concurrent exact membership batch retry returns one durable result with one member and one history entry',
      replay==original and len(after['members'])==1 and len(after['history'])==1 and after['receipts']==1,
      {'wait':wait,'result':replay,'state':after})
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:process.kill();process.wait(timeout=5)
    report={'server_version':version,'isolation_level':locals().get('isolation'),
      'completed':completed,'passed':sum(x['pass'] for x in results),'total':len(results),
      'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


