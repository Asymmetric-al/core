"""SQL counterexamples only; not Core admission, schema, authorization or UI."""
from pathlib import Path
import json, os, subprocess

ROOT = Path(__file__).resolve().parent
NAME = 'phase27-d4-postgres-lab'
env = dict(os.environ)
for key in ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH']:
    env.pop(key, None)
BASE = ['docker','--host=unix:///var/run/docker.sock','exec','-i',NAME,
        'psql','-X','-U','postgres','-d','postgres','-Atq',
        '-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate']
results = []

def sql(source, ok=True):
    p = subprocess.run(BASE, input=source, text=True, capture_output=True, env=env, timeout=20)
    if ok and p.returncode:
        raise RuntimeError(p.stderr)
    return p

def record(name, condition, observed):
    results.append({'test': name, 'pass': bool(condition), 'observed': observed})
    if not condition:
        raise AssertionError(name + ': ' + str(observed))

setup = '''
CREATE SCHEMA lab;
CREATE TABLE lab.candidate (id integer PRIMARY KEY, matches boolean NOT NULL);
INSERT INTO lab.candidate VALUES (1,true),(2,true);
CREATE TABLE lab.reviewed_member (id integer PRIMARY KEY REFERENCES lab.candidate(id));
INSERT INTO lab.reviewed_member SELECT id FROM lab.candidate WHERE matches;
CREATE TABLE lab.parent (id integer PRIMARY KEY);
CREATE TABLE lab.obligation (id integer PRIMARY KEY, parent_id integer NOT NULL REFERENCES lab.parent(id));
'''
(ROOT/'setup.sql').write_text(setup)
sql(setup)
version = sql('SELECT version();').stdout.strip()
before = sql('SELECT string_agg(id::text,\',\' ORDER BY id) FROM lab.reviewed_member;').stdout.strip()
record('review initially contains 1 and 2', before == '1,2', before)
# Deliberate sequencing: changes occur after the review has committed.
sql('INSERT INTO lab.candidate VALUES (3,true); UPDATE lab.candidate SET matches=false WHERE id=2;')
live = sql('SELECT string_agg(id::text,\',\' ORDER BY id) FROM lab.candidate WHERE matches;').stdout.strip()
fixed = sql('SELECT string_agg(id::text,\',\' ORDER BY id) FROM lab.reviewed_member;').stdout.strip()
record('live query changes the reviewed population', live == '1,3' and live != before, live)
record('fixed identities preserve membership only', fixed == before, fixed)

p = sql('BEGIN; INSERT INTO lab.parent VALUES(10); INSERT INTO lab.obligation VALUES(10,10); INSERT INTO lab.parent VALUES(20); INSERT INTO lab.obligation VALUES(20,999); COMMIT;',ok=False)
counts = sql('SELECT (SELECT count(*) FROM lab.parent)::text||\',\'||(SELECT count(*) FROM lab.obligation)::text;').stdout.strip()
record('whole batch transaction rolls back earlier valid item', p.returncode != 0 and '23503' in p.stderr and counts == '0,0', {'counts':counts,'error':p.stderr.strip()})

sql('BEGIN; INSERT INTO lab.parent VALUES(10); INSERT INTO lab.obligation VALUES(10,10); COMMIT;')
p = sql('BEGIN; INSERT INTO lab.parent VALUES(20); INSERT INTO lab.obligation VALUES(20,999); COMMIT;',ok=False)
counts = sql('SELECT (SELECT count(*) FROM lab.parent)::text||\',\'||(SELECT count(*) FROM lab.obligation)::text;').stdout.strip()
record('per-item commit preserves earlier success and rolls back failed pair', p.returncode != 0 and '23503' in p.stderr and counts == '1,1', {'counts':counts,'error':p.stderr.strip()})
sql('BEGIN; INSERT INTO lab.parent VALUES(30); INSERT INTO lab.obligation VALUES(30,30); COMMIT;')
ids = sql('SELECT string_agg(id::text,\',\' ORDER BY id) FROM lab.parent;').stdout.strip()
record('later independent item can succeed after failure', ids == '10,30', ids)

p = sql('BEGIN; SAVEPOINT item; INSERT INTO lab.parent VALUES(40); INSERT INTO lab.obligation VALUES(40,40); RELEASE SAVEPOINT item; INSERT INTO lab.obligation VALUES(50,999); COMMIT;',ok=False)
exists = sql('SELECT count(*) FROM lab.parent WHERE id=40;').stdout.strip()
record('released savepoint is not durable before outer commit', p.returncode != 0 and '23503' in p.stderr and exists == '0', {'exists':exists,'error':p.stderr.strip()})

(ROOT/'results.json').write_text(json.dumps({'version':version,'scope':'Sequential SQL mechanics only; fixed IDs do not freeze current authority or source meaning','results':results},indent=2)+'\n')
print(json.dumps({'version':version,'checks':len(results),'all_passed':all(x['pass'] for x in results)}))
