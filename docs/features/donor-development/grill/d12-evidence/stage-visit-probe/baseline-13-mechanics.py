"""D12 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D12_LAB_CONTAINER"]
if not NAME.startswith("phase27-d12-visit-lab-"):
    raise RuntimeError("Only the isolated D12 container is permitted")
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


def snapshot(journey):
    return json.loads(sql(f"""SELECT json_build_object('current',row_to_json(j),
      'events',(SELECT coalesce(json_agg(t ORDER BY accepted_revision),'[]'::json)
        FROM lab.transition t WHERE journey_id=j.id),
      'receipts',(SELECT count(*) FROM lab.receipt WHERE journey_id=j.id))
      FROM lab.journey j WHERE id={journey};"""))


def change(journey, revision, target, effect):
    # Arguments are fixed fixture constants, never external or application data.
    return json.loads(sql(f"SELECT lab.change_stage({journey},{revision},'{target}','{effect}');"))


try:
    sql((ROOT / "setup.sql").read_text())
    version = sql("SELECT version();")
    sql("""INSERT INTO lab.bad_history VALUES (1,'B','visit-1'),(1,'A','visit-2'),(1,'B','visit-3')
      ON CONFLICT(journey_id,target_code) DO NOTHING;""")
    bad = json.loads(sql("SELECT json_agg(b ORDER BY effect_key) FROM lab.bad_history b;"))
    check("counterexample: journey plus target stage loses a real second visit",
          len(bad) == 2 and not any(r['effect_key'] == 'visit-3' for r in bad),
          {'attempted_occurrences':3,'retained_rows':bad})

    first = change(1,0,'B','visit-1')
    back = change(1,1,'A','visit-2')
    returned = snapshot(1)
    check("A to B to A retains two distinct direct transitions",
          returned['current']['stage_code']=='A' and returned['current']['revision']==2
          and [(r['from_code'],r['to_code']) for r in returned['events']]==[('A','B'),('B','A')],
          returned)

    replay = change(1,0,'B','visit-1')
    check("old accepted B receipt is historical; current A remains unchanged",
          replay['replayed'] and replay['receipt']==first['receipt']
          and replay['current']['stage_code']=='A' and replay['current']['revision']==2
          and snapshot(1)==returned, replay)

    again = change(1,2,'B','visit-3')
    revisited = snapshot(1)
    check("new B occurrence is not deduplicated by destination",
          len(revisited['events'])==3
          and [r['to_code'] for r in revisited['events']]==['B','A','B']
          and again['receipt']['transition_id']!=first['receipt']['transition_id'], revisited)

    noop = change(1,3,'B','no-op-1')
    after_noop = snapshot(1)
    check("same-value fresh intent writes no transition and resets no stage clock",
          noop['receipt']['kind']=='no_op' and after_noop['current']==revisited['current']
          and after_noop['events']==revisited['events']
          and after_noop['receipts']==revisited['receipts']+1, after_noop)

    change(1,3,'C','visit-4')
    at_c = snapshot(1)
    replay_noop = change(1,3,'B','no-op-1')
    check("replaying an earlier no-op after another visit does not select its old target",
          replay_noop['replayed'] and replay_noop['receipt']==noop['receipt']
          and replay_noop['current']['stage_code']=='C' and snapshot(1)==at_c, replay_noop)

    code = sql("SELECT lab.change_stage(1,0,'D','visit-1');",'22023')
    check("same receipt key with changed intent conflicts without mutation",
          code=='22023' and snapshot(1)==at_c, {'sqlstate':code,'state_unchanged':snapshot(1)==at_c})

    code = sql("SELECT lab.change_stage(1,0,'D','stale-new-intent');",'P0001')
    check("new intent with stale expected revision rejects without history or receipt",
          code=='P0001' and snapshot(1)==at_c, {'sqlstate':code,'state_unchanged':snapshot(1)==at_c})

    skip = change(2,0,'D','skip-direct')
    skipped = snapshot(2)
    check("A directly to D records one transition and no fictional B or C visits",
          skipped['current']['stage_code']=='D' and len(skipped['events'])==1
          and (skipped['events'][0]['from_code'],skipped['events'][0]['to_code'])==('A','D'), skipped)

    sql("UPDATE lab.stage SET display_order=105-display_order;")
    # All resulting positions are outside the original 1..4 range, avoiding
    # transient unique-index collisions; this is only a fixture display edit.
    reorder_change = change(3,0,'D','after-reorder')
    order = json.loads(sql("SELECT json_agg(code ORDER BY display_order) FROM lab.stage;"))
    check("changed display order is not a transition path or semantic direction",
          order==['D','C','B','A'] and reorder_change['receipt']['from']=='A'
          and reorder_change['receipt']['stage']=='D' and len(snapshot(3)['events'])==1,
          {'display_order':order,'accepted':reorder_change})

    before_rollback=snapshot(4)
    code=sql("BEGIN; SELECT lab.change_stage(4,0,'D','rolled-back'); SELECT 1/0; COMMIT;",'22012')
    check("transaction failure after result construction rolls back current value history and receipt",
          code=='22012' and snapshot(4)==before_rollback,
          {'sqlstate':code,'state_unchanged':snapshot(4)==before_rollback})

    a, apid = session('d12_winning_edit')
    send(a,"SELECT lab.change_stage(5,0,'B','race-winner');")
    winning_result=json.loads(readline(a))
    b, bpid = session('d12_stale_edit')
    send(b,"SELECT lab.change_stage(5,0,'D','race-loser'); COMMIT;")
    barrier=blocked(bpid,apid)
    send(a,'COMMIT;')
    finish(a)
    code=finish(b,expect_error='P0001')
    raced=snapshot(5)
    check("blocked competing writer rechecks revision after winner commits",
          code=='P0001' and raced['current']['stage_code']=='B'
          and raced['current']['revision']==1 and len(raced['events'])==1 and raced['receipts']==1,
          {'barrier':barrier,'sqlstate':code,'state':raced})

    a, apid=session('d12_first_delivery')
    send(a,"SELECT lab.change_stage(6,0,'B','duplicate-effect');")
    original=json.loads(readline(a))
    b, bpid=session('d12_duplicate_delivery')
    send(b,"SELECT lab.change_stage(6,0,'B','duplicate-effect'); COMMIT;")
    barrier=blocked(bpid,apid)
    send(a,'COMMIT;')
    finish(a)
    duplicate=json.loads(finish(b))
    duplicated=snapshot(6)
    check("concurrent same-effect delivery returns one original accepted result",
          duplicate['replayed'] and duplicate['receipt']==original['receipt']
          and len(duplicated['events'])==1 and duplicated['receipts']==1,
          {'barrier':barrier,'duplicate':duplicate,'state':duplicated})
    completed = True
finally:
    for process in sessions:
        if process.poll() is None:
            process.kill()
            process.communicate()
    report={'version':version,'checks':len(results),'completed':completed,
            'all_passed':completed and bool(results) and all(r['pass'] for r in results),
            'observations':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')

print(json.dumps({'version':version,'checks':len(results),'all_passed':all(r['pass'] for r in results)}))

