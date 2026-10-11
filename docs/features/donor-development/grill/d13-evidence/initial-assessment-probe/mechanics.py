"""D13 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D13_LAB_CONTAINER"]
if not NAME.startswith("phase27-d13-assessment-lab-"):
    raise RuntimeError("Only the isolated D13 container is permitted")
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
        FROM lab.transition t WHERE tenant_id=1 AND journey_id=j.id),
      'receipts',(SELECT count(*) FROM lab.receipt WHERE tenant_id=1 AND journey_id=j.id))
      FROM lab.journey j WHERE tenant_id=1 AND id={journey};"""))


def assign(journey, revision, target, effect):
    # Fixed synthetic constants only, never external input or app data.
    return json.loads(sql(f"SELECT lab.assign_stage({journey},{revision},'{target}','{effect}');"))


try:
    sql((ROOT / "setup.sql").read_text())
    version = sql("SELECT version();")
    sql("INSERT INTO lab.bad_simple VALUES (1,'missing-preset',NULL);")
    bad = json.loads(sql("SELECT row_to_json(b) FROM lab.bad_simple b;"))
    check("counterexample: MATCH SIMPLE skips scope validation when stage is null",
          bad['preset_code'] == 'missing-preset' and bad['stage_code'] is None,bad)

    full_error = sql("INSERT INTO lab.bad_full VALUES (1,'p',NULL);",expect_error='23503')
    check("counterexample: blanket MATCH FULL rejects a valid optional stage",full_error == '23503',full_error)

    scope_errors = {
      'omitted_tenant':sql("INSERT INTO lab.journey(id,entity_id,preset_code) VALUES(99,10,'p');",expect_error='23502'),
      'null_entity':sql("INSERT INTO lab.journey(tenant_id,id,entity_id,preset_code) VALUES(1,99,NULL,'p');",expect_error='23502'),
      'null_preset':sql("INSERT INTO lab.journey(tenant_id,id,entity_id,preset_code) VALUES(1,99,10,NULL);",expect_error='23502'),
      'foreign_entity':sql("INSERT INTO lab.journey(tenant_id,id,entity_id,preset_code) VALUES(1,99,20,'p');",expect_error='23503'),
      'foreign_preset':sql("INSERT INTO lab.journey(tenant_id,id,entity_id,preset_code) VALUES(1,99,10,'q');",expect_error='23503'),
      'missing_preset':sql("INSERT INTO lab.journey(tenant_id,id,entity_id,preset_code) VALUES(1,99,10,'absent');",expect_error='23503')}
    check("mandatory scope stays enforced independently of nullable stage",
          snapshot(1)['current']['stage_code'] is None and sql("SELECT count(*) FROM lab.journey WHERE id=99;") == '0',scope_errors)

    bad_visibility = json.loads(sql("SET ROLE lab_member; SELECT json_agg(id ORDER BY id) FROM lab.bad_policy;"))
    safe_visibility = json.loads(sql("SET ROLE lab_member; SELECT json_agg(id ORDER BY id) FROM lab.journey;"))
    check("counterexample OR-null policy exposes another tenant; fixed scope does not",
          bad_visibility == [1,2] and safe_visibility == [1,2,3,4,6,7,8],
          {'bad_visible_ids':bad_visibility,'fixed_visible_ids':safe_visibility})

    before = snapshot(1)
    role_info = json.loads(sql("SET ROLE lab_member; SELECT json_build_object('user',current_user,'superuser',rolsuper,'bypassrls',rolbypassrls) FROM pg_roles WHERE rolname=current_user;"))
    rebind = sql("SET ROLE lab_member; UPDATE lab.journey SET tenant_id=2,entity_id=20,preset_code='q' WHERE tenant_id=1 AND id=1;",expect_error='42501')
    hidden_update = sql("SET ROLE lab_member; WITH changed AS (UPDATE lab.journey SET revision=99 WHERE tenant_id=2 AND id=5 RETURNING id) SELECT count(*) FROM changed;")
    check("nonowner nullable rows retain old-row and resulting-row RLS checks",
          rebind == '42501' and hidden_update == '0' and snapshot(1) == before
          and role_info == {'user':'lab_member','superuser':False,'bypassrls':False},
          {'role':role_info,'new_row_error':rebind,'hidden_old_row_updated':int(hidden_update),
           'policy':'FOR ALL USING (tenant_id=1); omitted WITH CHECK inherits USING'})

    json_cases = json.loads(sql("""SELECT json_agg(json_build_object('input',v,'has_stage',v ? 'stage',
      'extracted',v->>'stage','json_type',jsonb_typeof(v->'stage')))
      FROM (VALUES ('{}'::jsonb),('{"stage":null}'::jsonb),('{"stage":"A"}'::jsonb)) t(v);"""))
    check("JSON extraction alone collapses omitted and explicit null intent",
          json_cases[0]['extracted'] is None and json_cases[1]['extracted'] is None
          and json_cases[0]['has_stage'] is False and json_cases[1]['has_stage'] is True,
          json_cases)

    joined = json.loads(sql("""SET ROLE lab_member;
      SELECT json_agg(json_build_object('id',j.id,'source_stage',j.stage_code,'joined_stage',s.code,
        'classification',CASE WHEN j.stage_code IS NULL THEN 'not_assessed'
          WHEN s.code IS NULL THEN 'unavailable_reference' ELSE 'assessed' END) ORDER BY j.id)
      FROM lab.journey j LEFT JOIN lab.stage s ON
        (s.tenant_id,s.preset_code,s.code)=(j.tenant_id,j.preset_code,j.stage_code)
        AND s.selectable WHERE j.id BETWEEN 1 AND 4;"""))
    inner_ids = json.loads(sql("""SET ROLE lab_member; SELECT json_agg(j.id ORDER BY j.id)
      FROM lab.journey j INNER JOIN lab.stage s ON
        (s.tenant_id,s.preset_code,s.code)=(j.tenant_id,j.preset_code,j.stage_code)
        AND s.selectable WHERE j.id BETWEEN 1 AND 4;"""))
    check("LEFT JOIN preserves unassessed; a missing joined stage is not proof of no assessment",
          inner_ids == [2] and [r['classification'] for r in joined] ==
          ['not_assessed','assessed','unavailable_reference','unavailable_reference'],
          {'left_join_rows':joined,'inner_join_ids':inner_ids})

    counts = json.loads(sql("""SELECT json_build_object('total',count(*),'assigned',count(stage_code),
      'not_assessed',count(*) FILTER(WHERE stage_code IS NULL)) FROM lab.journey
      WHERE tenant_id=1 AND id BETWEEN 1 AND 4;"""))
    missing = json.loads(sql("""SELECT json_build_object('rows',count(*),'known',count(age_days),'average',avg(age_days),
      'coalesced_average',coalesce(avg(age_days),0)) FROM (VALUES(NULL::numeric)) t(age_days);"""))
    zero = json.loads(sql("""SELECT json_build_object('rows',count(*),'known',count(age_days),'average',avg(age_days))
      FROM (VALUES(0::numeric)) t(age_days);"""))
    check("counts include missing assessments; no measured duration differs from measured zero",
          counts == {'total':4,'assigned':3,'not_assessed':1}
          and missing['average'] is None and missing['known']==0 and zero['average']==0 and zero['known']==1,
          {'counts':counts,'unknown_duration':missing,'measured_zero_duration':zero})

    initial = snapshot(1)
    check("unassessed admission fixture has receipt but no invented stage event or assessment time",
          initial['events']==[] and initial['receipts']==1 and initial['current']['stage_code'] is None
          and initial['current']['assessed_at'] is None,initial)

    first = assign(1,0,'A','first-assessment')
    assigned = snapshot(1)
    check("first accepted assessment records exactly null-to-A and one current revision",
          len(assigned['events'])==1 and assigned['events'][0]['from_code'] is None
          and assigned['events'][0]['to_code']=='A' and assigned['current']['revision']==1
          and assigned['current']['assessed_at']==assigned['events'][0]['accepted_at'],assigned)

    start_replay = json.loads(sql("SELECT lab.replay_start(1,'start-1');"))
    check("old unassessed start receipt never clears a later assessment",
          start_replay['receipt']=={'kind':'started','stage':None,'revision':0}
          and start_replay['current']['stage_code']=='A' and snapshot(1)==assigned,start_replay)

    retry = assign(1,0,'A','first-assessment')
    check("first-assessment retry returns its accepted receipt without a second history event",
          retry['replayed'] and retry['receipt']==first['receipt'] and snapshot(1)==assigned,retry)

    null_error = sql("SELECT lab.assign_stage(1,1,NULL,'clear-not-authorized');",expect_error='22023')
    missing_revision = sql("SELECT lab.assign_stage(8,NULL,'A','missing-revision');",expect_error='22023')
    invalid_initial_target = sql("SELECT lab.assign_stage(8,0,'R','retired-first-choice');",expect_error='22023')
    check("optional initial assessment does not imply clearing, omitted version or retired first choice",
          snapshot(1)==assigned and snapshot(8)['current']['stage_code'] is None and snapshot(8)['events']==[],
          {'null_target':null_error,'missing_expected_revision':missing_revision,'retired_target':invalid_initial_target})

    rollback_before = snapshot(7)
    aborted = sql("BEGIN; SELECT lab.assign_stage(7,0,'A','rollback-first'); SELECT 1/0; COMMIT;",expect_error='22012')
    check("failed first-assessment transaction rolls back current value, event and receipt",
          aborted=='22012' and snapshot(7)==rollback_before,{'sqlstate':aborted,'after':snapshot(7)})

    winner,winner_pid=session('d13-first-winner')
    send(winner,"SELECT lab.assign_stage(6,0,'A','competing-first-A');")
    winner_receipt=json.loads(readline(winner))
    loser,loser_pid=session('d13-first-loser')
    send(loser,"SELECT lab.assign_stage(6,0,'B','competing-first-B');")
    barrier=blocked(loser_pid,winner_pid)
    send(winner,'COMMIT;')
    finish(winner)
    loser_error=finish(loser,expect_error='P0001')
    raced=snapshot(6)
    check("competing first assessments serialize; stale loser cannot overwrite winner",
          loser_error=='P0001' and raced['current']['stage_code']=='A' and raced['current']['revision']==1
          and len(raced['events'])==1 and raced['events'][0]['from_code'] is None and raced['receipts']==1,
          {'lock_barrier':barrier,'loser_sqlstate':loser_error,'after':raced})
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:
            process.kill()
            process.communicate()
    report={'postgres_version':version,'completed':completed,'passed':sum(r['pass'] for r in results),
      'total':len(results),'all_pass':completed and all(r['pass'] for r in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'total':report['total'],'all_pass':report['all_pass']}))


