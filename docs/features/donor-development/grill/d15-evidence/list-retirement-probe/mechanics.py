"""D15 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D15_LAB_CONTAINER"]
if not NAME.startswith("phase27-d15-retirement-lab-"):
    raise RuntimeError("Only the isolated D15 container is permitted")
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


def list_state(list_id):
    return json.loads(sql(f"""SELECT json_build_object(
      'accepts_new',accepts_new,
      'available_stages',(SELECT count(*) FROM lab.stage s WHERE s.tenant_id=l.tenant_id
        AND s.list_id=l.id AND s.available),
      'journeys',(SELECT count(*) FROM lab.journey j WHERE j.tenant_id=l.tenant_id
        AND j.list_id=l.id)) FROM lab.stage_list l WHERE tenant_id=1 AND id={list_id};"""))


try:
    sql((ROOT / 'setup.sql').read_text())
    version = sql('SELECT version();')

    # Inadequate guard: FK/key stability does not fence a mutable non-key flag.
    first, first_pid = session('d15_key_share_reader')
    send(first, 'SELECT accepts_new FROM lab.stage_list WHERE tenant_id=1 AND id=1 FOR KEY SHARE;')
    marker(first, 't')
    updated = sql('UPDATE lab.stage_list SET accepts_new=false WHERE tenant_id=1 AND id=1 RETURNING accepts_new;')
    send(first, 'INSERT INTO lab.journey(tenant_id,id,list_id) VALUES(1,100,1); COMMIT;')
    finish(first)
    check('counterexample: KEY SHARE and FK allow stale admission after non-key retirement commits',
          updated == 'f' and list_state(1)['journeys'] == 1 and not list_state(1)['accepts_new'],
          {'retirement_completed_while_key_share_held': updated == 'f', 'state': list_state(1)})

    first, first_pid = session('d15_retire_before_admit')
    send(first, 'SELECT lab.set_admission(1,2,false);')
    marker(first, 'list-changed')
    second, second_pid = session('d15_admit_waits_for_retire')
    send(second, 'SELECT lab.admit(1,2,200); COMMIT;')
    wait = blocked(second_pid, first_pid)
    send(first, 'COMMIT;')
    finish(first)
    rejected = finish(second, expect_error='23514')
    check('retirement first: SHARE admission waits, rechecks and rejects with no new journey',
          rejected == '23514' and list_state(2)['journeys'] == 0 and not list_state(2)['accepts_new'],
          {'wait': wait, 'error': rejected, 'state': list_state(2)})

    first, first_pid = session('d15_admit_before_retire')
    send(first, 'SELECT lab.admit(1,3,300);')
    marker(first, 'admitted')
    second, second_pid = session('d15_retire_waits_for_admit')
    send(second, 'SELECT lab.set_admission(1,3,false); COMMIT;')
    wait = blocked(second_pid, first_pid)
    send(first, 'COMMIT;')
    finish(first)
    outcome = finish(second)
    check('admission first: retirement waits and preserves the committed unassessed journey',
          outcome == 'list-changed' and list_state(3)['journeys'] == 1 and not list_state(3)['accepts_new']
          and sql('SELECT stage_id IS NULL FROM lab.journey WHERE tenant_id=1 AND id=300;') == 't',
          {'wait': wait, 'state': list_state(3)})

    sql('SELECT lab.move_existing(1,4,40,2); SELECT lab.move_existing(1,4,41,2);')
    sql('SELECT lab.retire_stage(1,4,1);')
    retired_stage_error = sql('SELECT lab.move_existing(1,4,40,1);', expect_error='23514')
    observed = json.loads(sql("""SELECT json_build_object(
      'journeys',(SELECT json_agg(json_build_object('id',id,'stage',stage_id,'revision',revision) ORDER BY id)
        FROM lab.journey WHERE tenant_id=1 AND list_id=4),
      'events',(SELECT json_agg(json_build_object('journey',journey_id,'from',old_stage,'to',new_stage) ORDER BY journey_id)
        FROM lab.stage_event WHERE tenant_id=1 AND journey_id IN (40,41)));"""))
    check('withdrawn list permits existing and first assessment; individually retired stage still rejects',
          not list_state(4)['accepts_new'] and retired_stage_error == '23514'
          and observed['journeys'] == [{'id':40,'stage':2,'revision':2},{'id':41,'stage':2,'revision':2}]
          and observed['events'] == [{'journey':40,'from':1,'to':2},{'journey':41,'from':None,'to':2}], observed)

    first, first_pid = session('d15_retire_before_existing_move')
    send(first, 'SELECT lab.set_admission(1,5,false);')
    marker(first, 'list-changed')
    second, second_pid = session('d15_existing_move_waits')
    send(second, 'SELECT lab.move_existing(1,5,50,2); COMMIT;')
    wait = blocked(second_pid, first_pid)
    send(first, 'COMMIT;')
    finish(first)
    outcome = finish(second)
    check('retirement first: waiting existing stage change succeeds after retirement',
          outcome == 'stage-changed' and not list_state(5)['accepts_new']
          and sql('SELECT stage_id FROM lab.journey WHERE tenant_id=1 AND id=50;') == '2',
          {'wait': wait, 'state': list_state(5)})

    first, first_pid = session('d15_existing_move_before_retire')
    send(first, 'SELECT lab.move_existing(1,6,60,2);')
    marker(first, 'stage-changed')
    second, second_pid = session('d15_retire_waits_existing_move')
    send(second, 'SELECT lab.set_admission(1,6,false); COMMIT;')
    wait = blocked(second_pid, first_pid)
    send(first, 'COMMIT;')
    finish(first)
    outcome = finish(second)
    check('stage change first: waiting retirement preserves accepted stage and history',
          outcome == 'list-changed' and not list_state(6)['accepts_new']
          and sql('SELECT stage_id FROM lab.journey WHERE tenant_id=1 AND id=60;') == '2'
          and sql('SELECT count(*) FROM lab.stage_event WHERE tenant_id=1 AND journey_id=60;') == '1',
          {'wait': wait, 'state': list_state(6)})

    counts = json.loads(sql("""SELECT json_build_object(
      'assigned_source_rows',(SELECT count(*) FROM lab.journey WHERE tenant_id=1),
      'active_only_join',(SELECT count(*) FROM lab.journey j JOIN lab.stage_list l
        ON (l.tenant_id,l.id)=(j.tenant_id,j.list_id) WHERE j.tenant_id=1 AND l.accepts_new));"""))
    check('counterexample: active-admission catalog join erases all still-existing journey rows',
          counts == {'assigned_source_rows':6,'active_only_join':0}, counts)

    first, first_pid = session('d15_retire_stage_one')
    send(first, 'SELECT lab.retire_stage(1,7,1);')
    marker(first, 'stage-retired')
    second, second_pid = session('d15_retire_stage_two')
    send(second, 'SELECT lab.retire_stage(1,7,2); COMMIT;')
    wait = blocked(second_pid, first_pid)
    send(first, 'COMMIT;')
    finish(first)
    rejected = finish(second, expect_error='23514')
    check('withdrawn list retains one available stage under concurrent last-stage edits, independent of usage count',
          rejected == '23514' and list_state(7) == {'accepts_new':False,'available_stages':1,'journeys':0},
          {'wait': wait, 'error':rejected, 'state':list_state(7)})

    # Deliberately malformed fixture 8: illustrates a restoration guard only.
    # Creating such a usable zero-stage list is not an authorized product path.
    rejected = sql('SELECT lab.set_admission(1,8,true);', expect_error='23514')
    check('conditional restoration guard rejects pre-existing zero-stage invalid fixture',
          rejected == '23514' and list_state(8) == {'accepts_new':False,'available_stages':0,'journeys':0},
          {'error':rejected,'state':list_state(8)})
    completed = True
finally:
    for process in sessions:
        if process.poll() is None:
            process.kill()
            process.wait(timeout=5)
    report = {'server_version':version,'completed':completed,'passed':sum(x['pass'] for x in results),
              'total':len(results),'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT / 'results.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


