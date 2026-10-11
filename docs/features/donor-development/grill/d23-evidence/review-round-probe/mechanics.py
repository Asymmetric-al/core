"""D23 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D23_LAB_CONTAINER"]
if not NAME.startswith("phase27-d23-review-round-lab-"):
    raise RuntimeError("Only the isolated D23 container is permitted")
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
    return json.loads(sql(f"""SELECT json_build_object('head',to_jsonb(p),
      'decisions',COALESCE((SELECT jsonb_agg(to_jsonb(d) ORDER BY round_id) FROM lab.decision d WHERE scope_id={scope}),'[]'::jsonb),
      'versions',(SELECT count(*) FROM lab.terms_version WHERE scope_id={scope}),
      'receipts',(SELECT count(*) FROM lab.receipt WHERE scope_id={scope}),
      'events',(SELECT count(*) FROM lab.internal_event WHERE scope_id={scope}),
      'starts',(SELECT count(*) FROM lab.started_action WHERE scope_id={scope}))
      FROM lab.proposal p WHERE scope_id={scope} AND id=1;"""))


try:
    sql((ROOT/'setup.sql').read_text());version=sql('SELECT version();');isolation=sql('SHOW transaction_isolation;')
    sql('UPDATE lab.proposal SET metadata_revision=metadata_revision+1 WHERE scope_id=1;')
    approved=json.loads(sql("SELECT lab.decide(1,1,'metadata-only','approved');"))
    check('incidental metadata change does not alter the reviewed business terms version',
      approved['business_version']==1 and state(1)['head']['metadata_revision']==2
      and len(state(1)['decisions'])==1,{'result':approved,'head':state(1)['head']})

    first,pid=session('d23_revise_first')
    send(first,"SELECT lab.revise(2,1,'{\"requested_minor\":20000,\"currency\":\"USD\"}');");marker(first,'2')
    second,pid2=session('d23_old_review_waits')
    send(second,"SELECT lab.decide(2,1,'old-round','approved'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);stale=finish(second,expect_error='40001');after=state(2)
    check('terms revision wins: waiting old review cannot approve revised terms or emit a decision event',
      stale=='40001' and after['head']['business_version']==2
      and after['decisions']==[] and after['events']==0 and after['receipts']==0,
      {'wait':wait,'error':stale,'state':after})

    first,pid=session('d23_decision_first')
    send(first,"SELECT lab.decide(3,1,'before-revision','approved');");original=json.loads(readline(first))
    second,pid2=session('d23_revision_waits')
    send(second,"SELECT lab.revise(3,1,'{\"requested_minor\":20000,\"currency\":\"USD\"}'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);revised=finish(second)
    denied=sql('SELECT lab.start_action(3,2);',expect_error='23514');after=state(3)
    check('decision wins: subsequent terms revision preserves original decision but cannot present new terms under it',
      revised=='2' and original['business_version']==1 and after['head']['business_version']==2
      and len(after['decisions'])==1 and after['events']==1 and after['starts']==0 and denied=='23514',
      {'wait':wait,'no_compatible_approval':denied,'state':after})

    first,pid=session('d23_duplicate_first')
    send(first,"SELECT lab.decide(4,1,'same-intent','approved');");original=json.loads(readline(first))
    second,pid2=session('d23_duplicate_waits')
    send(second,"SELECT lab.decide(4,1,'same-intent','approved'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);replayed=json.loads(finish(second));after=state(4)
    changed=sql("SELECT lab.decide(4,1,'same-intent','rejected');",expect_error='23514')
    check('concurrent exact decision retry has one accepted decision/receipt/internal event; changed outcome under same identity conflicts',
      replayed==original and len(after['decisions'])==1 and after['receipts']==1
      and after['events']==1 and changed=='23514' and state(4)==after,
      {'wait':wait,'replay':replayed,'changed_payload':changed,'counts':{k:after[k] for k in ['receipts','events']}})

    first,pid=session('d23_approve_first')
    send(first,"SELECT lab.decide(5,1,'approve-intent','approved');");readline(first)
    second,pid2=session('d23_reject_competes')
    send(second,"SELECT lab.decide(5,1,'reject-intent','rejected'); COMMIT;");wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);competing=finish(second,expect_error='23514');after=state(5)
    check('competing distinct approve/reject intents cannot both decide the same review round',
      competing=='23514' and len(after['decisions'])==1 and after['decisions'][0]['outcome']=='approved'
      and after['events']==1 and after['receipts']==1,
      {'wait':wait,'losing_decision':competing,'state':after})

    before=state(6)
    fault=sql("SELECT lab.decide(6,1,'fixture-outbox-failure','approved');",expect_error='23514')
    check('late internal-event failure rolls back decision and durable receipt together',
      fault=='23514' and state(6)==before,{'error':fault,'all_state_unchanged':state(6)==before})

    sql("SELECT lab.decide(7,1,'approved-before-policy','approved');")
    first,pid=session('d23_material_policy_first')
    send(first,'UPDATE lab.policy SET material_epoch=2 WHERE scope_id=7 RETURNING material_epoch;');marker(first,'2')
    second,pid2=session('d23_action_waits_for_policy')
    send(second,'SELECT lab.start_action(7,1); COMMIT;');wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);denied=finish(second,expect_error='23514');after=state(7)
    check('material policy change wins: local supported-action start waits and cannot use incompatible prior approval',
      denied=='23514' and after['starts']==0 and len(after['decisions'])==1,
      {'wait':wait,'denial':denied,'historical_decision_retained':len(after['decisions'])})

    sql("SELECT lab.decide(8,1,'approved-before-start','approved');")
    first,pid=session('d23_action_start_first')
    send(first,'SELECT lab.start_action(8,1);');marker(first,'started')
    second,pid2=session('d23_policy_waits_for_start')
    send(second,'UPDATE lab.policy SET material_epoch=2 WHERE scope_id=8 RETURNING material_epoch; COMMIT;');wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);policy=finish(second);after=state(8)
    check('local supported-action start wins: later material policy change waits and preserves accepted start history',
      policy=='2' and after['starts']==1 and len(after['decisions'])==1,
      {'wait':wait,'new_policy_epoch':int(policy),'accepted_starts':after['starts']})

    original=json.loads(sql("SELECT lab.decide(9,1,'before-reviewer-departure','approved');"))
    sql('UPDATE lab.policy SET reviewer_allowed=false WHERE scope_id=9;')
    replay=json.loads(sql("SELECT lab.decide(9,1,'before-reviewer-departure','approved');"))
    started=sql('SELECT lab.start_action(9,1);')
    sql("SELECT lab.revise(9,1,'{\"requested_minor\":30000,\"currency\":\"USD\"}');")
    rejected=sql("SELECT lab.decide(9,2,'departed-new-decision','approved');",expect_error='42501')
    check('reviewer departure blocks new decisions but does not retroactively invalidate accepted approval or replay; present actor remains independently allowed',
      replay==original and started=='started' and rejected=='42501'
      and state(9)['starts']==1 and len(state(9)['decisions'])==1 and state(9)['receipts']==1,
      {'historical_result':replay,'independent_action_start':started,'new_decision_denied':rejected})

    sql("UPDATE lab.policy SET requirement='unknown',reviewer_allowed=false WHERE scope_id=10;")
    unknown=sql('SELECT lab.start_action(10,1);',expect_error='23514')
    sql("UPDATE lab.policy SET requirement='required' WHERE scope_id=10;")
    required=sql('SELECT lab.start_action(10,1);',expect_error='23514')
    no_reviewer=sql("SELECT lab.decide(10,1,'no-reviewer','approved');",expect_error='42501')
    sql("UPDATE lab.policy SET requirement='not_required' WHERE scope_id=10;")
    routine=sql('SELECT lab.start_action(10,1);');after=state(10)
    check('known not-required permits ordinary action without fake approval; unknown or required-with-no-reviewer does not downgrade to optional',
      unknown=='23514' and required=='23514' and no_reviewer=='42501'
      and routine=='started' and after['decisions']==[] and after['receipts']==0
      and after['events']==0 and after['starts']==1,
      {'unknown':unknown,'required':required,'empty_eligible_review':no_reviewer,'routine':routine})
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:process.kill();process.wait(timeout=5)
    report={'server_version':version,'isolation_level':locals().get('isolation'),
      'completed':completed,'passed':sum(x['pass'] for x in results),'total':len(results),
      'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


