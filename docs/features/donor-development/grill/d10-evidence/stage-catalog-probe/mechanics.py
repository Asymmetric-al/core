"""D10 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D10_LAB_CONTAINER"]
if not NAME.startswith("phase27-d10-stage-lab-"):
    raise RuntimeError("Only the isolated D10 container is permitted")
ENV = dict(os.environ)
for key in ["DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH"]:
    ENV.pop(key, None)
BASE = ["docker", "--host=unix:///var/run/docker.sock", "exec", "-i", NAME,
        "psql", "-X", "-U", "postgres", "-d", "postgres", "-Atq",
        "-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=verbose"]
results = []
sessions = []
version = None


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


def catalog():
    return sql("""SELECT json_build_object('revision',p.revision,'order',
      (SELECT array_agg(id ORDER BY position) FROM lab.stage WHERE tenant_id=1 AND preset_id=10),
      'audit_count',(SELECT count(*) FROM lab.catalog_history WHERE tenant_id=1 AND preset_id=10),
      'stage_history',(SELECT json_agg(h ORDER BY journey_id) FROM lab.stage_history h))
      FROM lab.preset p WHERE tenant_id=1 AND id=10;""")


try:
    sql((ROOT / "setup.sql").read_text())
    version = sql("SELECT version();")
    violations = [
        sql("INSERT INTO lab.journey VALUES(11,1,10,901,false);", "23503"),
        sql("INSERT INTO lab.journey VALUES(12,1,10,111,false);", "23503"),
        sql("INSERT INTO lab.journey VALUES(13,NULL,10,101,false);", "23502"),
    ]
    check("composite scope rejects foreign tenant/preset stage and null tenant", violations == ["23503","23503","23502"], violations)

    before = sql("SELECT row_to_json(h) FROM lab.stage_history h WHERE journey_id=1;")
    sql("SELECT lab.retire_stage(1,12,121); UPDATE lab.journey SET closed=false WHERE id=1;")
    retained = sql("SELECT stage_id::text||','||closed::text FROM lab.journey WHERE id=1;")
    after = sql("SELECT row_to_json(h) FROM lab.stage_history h WHERE journey_id=1;")
    check("retired recorded assignment survives D9-style reopen with unchanged stage provenance", retained == "121,false" and before == after,
          {"journey":retained,"history_unchanged":before==after,"history":json.loads(after)})

    a, _ = session("d10_stale_precheck")
    send(a, "SELECT selectable::text FROM lab.stage WHERE tenant_id=1 AND preset_id=20 AND id=201;")
    marker(a, "true")
    sql("SELECT lab.retire_stage(1,20,201);")
    send(a, "INSERT INTO lab.journey VALUES(20,1,20,201,false); COMMIT;")
    finish(a)
    observed = sql("SELECT selectable::text||','||(SELECT count(*) FROM lab.journey WHERE id=20) FROM lab.stage WHERE tenant_id=1 AND preset_id=20;")
    check("counterexample: ordinary FK admits retired stage after stale unlocked precheck", observed == "false,1", observed)

    a, apid = session("d10_retire_winner")
    send(a, "SELECT lab.retire_stage(1,21,211);")
    marker(a, "t")
    b, bpid = session("d10_assign_waiter")
    send(b, "SELECT lab.assign_stage(21,1,21,211); COMMIT;")
    barrier = blocked(bpid, apid)
    send(a, "COMMIT;")
    finish(a)
    outcome = finish(b)
    count = sql("SELECT count(*) FROM lab.journey WHERE id=21;")
    check("serialized retirement first rejects new assignment after observed lock wait", outcome == "f" and count == "0",
          {"barrier":barrier,"assignment_accepted":outcome,"rows":count})

    a, apid = session("d10_assign_winner")
    send(a, "SELECT lab.assign_stage(22,1,22,221);")
    marker(a, "t")
    b, bpid = session("d10_retire_waiter")
    send(b, "SELECT lab.retire_stage(1,22,221); COMMIT;")
    barrier = blocked(bpid, apid)
    send(a, "COMMIT;")
    finish(a)
    outcome = finish(b)
    observed = sql("SELECT selectable::text||','||(SELECT count(*) FROM lab.journey WHERE id=22) FROM lab.stage WHERE tenant_id=1 AND preset_id=22;")
    check("serialized assignment first preserves accepted value after subsequent retirement", outcome == "t" and observed == "false,1",
          {"barrier":barrier,"retirement_accepted":outcome,"state":observed})

    initial_history = sql("SELECT json_agg(h ORDER BY journey_id) FROM lab.stage_history h;")
    revision = sql("SELECT lab.reorder(1,10,0,ARRAY[103,101,102]);")
    accepted = json.loads(catalog())
    check("full reorder swaps unique positions atomically and leaves stage history unchanged",
          revision == "1" and accepted["order"] == [103,101,102] and accepted["audit_count"] == 1
          and initial_history == sql("SELECT json_agg(h ORDER BY journey_id) FROM lab.stage_history h;"), accepted)

    frozen = catalog()
    for name, source, expected in [
        ("stale reorder revision rejected without changes", "SELECT lab.reorder(1,10,0,ARRAY[101,102,103]);", "P0001"),
        ("duplicate reorder manifest rejected without changes", "SELECT lab.reorder(1,10,1,ARRAY[101,101,103]);", "22023"),
        ("foreign-preset reorder identifier rejected without changes", "SELECT lab.reorder(1,10,1,ARRAY[101,102,111]);", "22023"),
        ("incomplete reorder manifest rejected without changes", "SELECT lab.reorder(1,10,1,ARRAY[101,102]);", "22023"),
        ("failure after order/revision/audit writes rolls all changes back", "SELECT lab.reorder(1,10,1,ARRAY[101,102,103],true);", "P0001"),
    ]:
        code = sql(source, expected)
        check(name, catalog() == frozen, {"sqlstate":code,"catalog_unchanged":catalog()==frozen})

    a, apid = session("d10_reorder_winner")
    send(a, "SELECT lab.reorder(1,10,1,ARRAY[102,103,101]);")
    marker(a, "2")
    b, bpid = session("d10_reorder_waiter")
    send(b, "SELECT lab.reorder(1,10,1,ARRAY[101,102,103]); COMMIT;")
    barrier = blocked(bpid, apid)
    send(a, "COMMIT;")
    finish(a)
    code = finish(b, "P0001")
    observed = json.loads(catalog())
    check("concurrent stale reorder waits then rejects instead of overwriting winner",
          observed["revision"] == 2 and observed["order"] == [102,103,101] and observed["audit_count"] == 2,
          {"barrier":barrier,"loser_sqlstate":code,"catalog":observed})

    role = json.loads(sql("""SET ROLE lab_writer; SELECT json_build_object('role',current_user,
      'superuser',r.rolsuper,'bypassrls',r.rolbypassrls,'table_owner',pg_get_userbyid(c.relowner))
      FROM pg_roles r,pg_class c WHERE r.rolname=current_user AND c.oid='lab.journey'::regclass;"""))
    scoped = sql("""SET ROLE lab_writer;
      UPDATE lab.journey SET closed=true WHERE id=1 RETURNING 'owned-write-ok';
      WITH changed AS(UPDATE lab.journey SET closed=true WHERE id=901 RETURNING id)
      SELECT count(*) FROM changed;
      SELECT count(*) FROM lab.journey WHERE tenant_id=2;""")
    check("real nonowner RLS role permits owned write and filters foreign old rows",
          role["role"] == "lab_writer" and not role["superuser"] and not role["bypassrls"]
          and role["table_owner"] != "lab_writer" and scoped == "owned-write-ok\n0\n0",
          {"role":role,"observed":scoped})

    code = sql("SET ROLE lab_writer; UPDATE lab.journey SET tenant_id=2,preset_id=10,stage_id=901 WHERE id=1;", "42501")
    state = sql("SELECT tenant_id::text||','||preset_id::text||','||stage_id::text FROM lab.journey WHERE id=1;")
    check("RLS WITH CHECK rejects own-row move into valid foreign scope", state == "1,12,121", {"sqlstate":code,"unchanged_scope":state})

    code = sql("SET ROLE lab_writer; INSERT INTO lab.journey VALUES(902,2,10,901,false);", "42501")
    count = sql("SELECT count(*) FROM lab.journey WHERE id=902;")
    check("RLS WITH CHECK rejects new foreign-scope row despite valid FK", count == "0", {"sqlstate":code,"inserted_rows":count})

finally:
    for process in sessions:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
    report = {"version":version,"checks":len(results),"all_passed":len(results)==15 and all(r["pass"] for r in results),
        "scope":"Synthetic PostgreSQL mechanics only; not Core/P27/Supabase authorization, migrations, UI, provider or load qualification",
        "results":results}
    (ROOT / "results.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({"version":version,"checks":len(results),"all_passed":report["all_passed"]}))
if not report["all_passed"]:
    raise AssertionError("Expected exactly 15 passing mechanics checks")
