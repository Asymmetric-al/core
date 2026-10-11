"""Controlled PostgreSQL mechanics, not a proposed Core schema or D7 command."""
from pathlib import Path
import json
import os
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = "phase27-d7-postgres-lab"
env = dict(os.environ)
for key in ["DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH"]:
    env.pop(key, None)
BASE = ["docker", "--host=unix:///var/run/docker.sock", "exec", "-i", NAME,
        "psql", "-X", "-U", "postgres", "-d", "postgres", "-Atq",
        "-v", "ON_ERROR_STOP=1"]
results = []


def sql(source):
    result = subprocess.run(BASE, input=source, text=True, capture_output=True, env=env, timeout=20)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def check(name, condition, observed):
    results.append({"test": name, "pass": bool(condition), "observed": observed})
    assert condition, (name, observed)


def session():
    return subprocess.Popen(BASE, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, text=True, env=env, bufsize=1)


def send(process, command):
    process.stdin.write(command + "\n")
    process.stdin.flush()


def marker(process, expected):
    # Only one result row is emitted before each explicit application barrier.
    with selectors.DefaultSelector() as selector:
        selector.register(process.stdout, selectors.EVENT_READ)
        if not selector.select(timeout=10):
            raise RuntimeError("Timed out waiting for transaction barrier")
    actual = process.stdout.readline().strip()
    assert actual == expected, (expected, actual)


def finish(process):
    process.stdin.close()
    process.stdin = None
    stdout, stderr = process.communicate(timeout=15)
    if process.returncode:
        raise RuntimeError(stderr)
    return stdout.strip()


def blocked(app_name):
    deadline = time.monotonic() + 8
    while time.monotonic() < deadline:
        value = sql(f"SELECT count(*) FROM pg_stat_activity WHERE application_name='{app_name}' AND wait_event_type='Lock';")
        if value == "1":
            return True
        time.sleep(0.05)
    return False


setup = """
CREATE SCHEMA lab;
CREATE TABLE lab.scope (id integer PRIMARY KEY, accepting boolean NOT NULL);
CREATE TABLE lab.obligation (
  id integer PRIMARY KEY,
  scope_id integer NOT NULL REFERENCES lab.scope(id)
);
INSERT INTO lab.scope VALUES (1,true),(2,true),(3,true);
"""
(ROOT / "setup.sql").write_text(setup)
sql(setup)
version = sql("SELECT version();")

# Counterexample: an application precheck and a parent NO KEY UPDATE lock do not
# fence a child writer relying only on its ordinary FK and unlocked state read.
a = session()
send(a, "BEGIN; SELECT id FROM lab.scope WHERE id=1 FOR NO KEY UPDATE;")
marker(a, "1")
send(a, "SELECT count(*) FROM lab.obligation WHERE scope_id=1;")
marker(a, "0")
b_result = sql("BEGIN; INSERT INTO lab.obligation SELECT 11,id FROM lab.scope WHERE id=1 AND accepting; COMMIT; SELECT 'child_committed';")
check("FK child admission succeeds while parent NO KEY UPDATE lock is held", b_result == "child_committed", b_result)
send(a, "UPDATE lab.scope SET accepting=false WHERE id=1; COMMIT;")
finish(a)
state = sql("SELECT accepting::text||','||(SELECT count(*) FROM lab.obligation WHERE scope_id=1) FROM lab.scope WHERE id=1;")
check("stale no-obligations precheck can close a scope containing new work", state == "false,1", state)

# Positive mechanics: both relevant writers participate in the same conflict
# fence and re-read after acquiring it. This is one strategy, not a required
# product SQL spelling or proof of all caller/authorization paths.
a = session()
send(a, "BEGIN; SELECT id FROM lab.scope WHERE id=2 FOR UPDATE;")
marker(a, "2")
b = session()
send(b, "SET application_name='d7_new_work_waits'; BEGIN; SELECT id FROM lab.scope WHERE id=2 FOR UPDATE; INSERT INTO lab.obligation SELECT 22,id FROM lab.scope WHERE id=2 AND accepting; COMMIT;")
check("participating work writer blocks behind closure fence", blocked("d7_new_work_waits"), "pg_stat_activity Lock wait observed")
send(a, "UPDATE lab.scope SET accepting=false WHERE id=2 AND NOT EXISTS(SELECT 1 FROM lab.obligation WHERE scope_id=2); COMMIT;")
finish(a)
finish(b)
state = sql("SELECT accepting::text||','||(SELECT count(*) FROM lab.obligation WHERE scope_id=2) FROM lab.scope WHERE id=2;")
check("closure first prevents later admission after current-state recheck", state == "false,0", state)

b = session()
send(b, "BEGIN; SELECT id FROM lab.scope WHERE id=3 FOR UPDATE;")
marker(b, "3")
send(b, "INSERT INTO lab.obligation VALUES (33,3); SELECT 'work_prepared';")
marker(b, "work_prepared")
a = session()
send(a, "SET application_name='d7_close_waits'; BEGIN; SELECT id FROM lab.scope WHERE id=3 FOR UPDATE; UPDATE lab.scope SET accepting=false WHERE id=3 AND NOT EXISTS(SELECT 1 FROM lab.obligation WHERE scope_id=3); COMMIT;")
check("participating closure writer blocks behind work fence", blocked("d7_close_waits"), "pg_stat_activity Lock wait observed")
send(b, "COMMIT;")
finish(b)
finish(a)
state = sql("SELECT accepting::text||','||(SELECT count(*) FROM lab.obligation WHERE scope_id=3) FROM lab.scope WHERE id=3;")
check("work first prevents closure through current obligation check", state == "true,1", state)

(ROOT / "results.json").write_text(json.dumps({"version": version,
    "scope": "Six controlled PostgreSQL mechanics checks only; no Core schema, auth, runtime, load or D7 implementation qualification",
    "results": results}, indent=2) + "\n")
print(json.dumps({"version": version, "checks": len(results), "all_passed": all(r["pass"] for r in results)}))
