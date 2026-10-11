"""Disposable mechanics only; NOT an Asym schema or lifecycle proposal."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json, os, subprocess, time

ROOT = Path(__file__).resolve().parent
NAME = 'phase27-d3-postgres-lab'
env = dict(os.environ)
for key in ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH']:
    env.pop(key, None)
BASE = ['docker','--host=unix:///var/run/docker.sock','exec','-i',NAME,
        'psql','-X','-U','postgres','-d','postgres','-Atq','-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate']
results = []

def sql(source, ok=True):
    p = subprocess.run(BASE, input=source, text=True, capture_output=True, env=env, timeout=30)
    if ok and p.returncode:
        raise RuntimeError(p.stderr)
    return p

def record(name, condition, detail):
    results.append({'test':name, 'pass':bool(condition), 'detail':detail})
    if not condition:
        raise AssertionError(name + ': ' + str(detail))

def rejects(name, source, state):
    p = sql(source, ok=False)
    record(name, p.returncode != 0 and state in p.stderr, {'sqlstate':state,'actual':p.stderr.strip()})

setup = '''
CREATE SCHEMA lab;
CREATE TABLE lab.party (tenant integer NOT NULL, id integer NOT NULL, PRIMARY KEY (tenant,id));
CREATE TABLE lab.ministry (tenant integer NOT NULL, entity integer NOT NULL, id integer NOT NULL, PRIMARY KEY (tenant,entity,id));
INSERT INTO lab.party VALUES (1,10),(2,20);
INSERT INTO lab.ministry VALUES (1,100,1000),(1,200,2000),(2,200,3000);
-- Deliberately hypothetical ordinary-lane identity; no application names or lifecycle.
CREATE TABLE lab.journey (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 tenant integer NOT NULL, entity integer NOT NULL, party integer NOT NULL, ministry integer NOT NULL,
 FOREIGN KEY (tenant,party) REFERENCES lab.party(tenant,id) ON DELETE RESTRICT,
 FOREIGN KEY (tenant,entity,ministry) REFERENCES lab.ministry(tenant,entity,id) ON DELETE RESTRICT,
 UNIQUE(tenant,entity,party,ministry)
);
INSERT INTO lab.journey(tenant,entity,party,ministry) VALUES(1,100,10,1000);
CREATE TABLE lab.check_null (value integer CHECK(value > 0));
CREATE TABLE lab.unique_null (subject integer, optional_key integer, UNIQUE(subject,optional_key));
CREATE TABLE lab.unique_null_equal (subject integer, optional_key integer, UNIQUE NULLS NOT DISTINCT(subject,optional_key));
CREATE TABLE lab.loose_reference (tenant integer, entity integer, ministry integer,
 FOREIGN KEY(tenant,entity,ministry) REFERENCES lab.ministry(tenant,entity,id));
CREATE TABLE lab.full_reference (tenant integer, entity integer, ministry integer,
 FOREIGN KEY(tenant,entity,ministry) REFERENCES lab.ministry(tenant,entity,id) MATCH FULL);
-- Toy states demonstrate a bad predicate; they are NOT product states.
CREATE TABLE lab.partial_bad (id integer PRIMARY KEY, semantic_key integer NOT NULL, toy_state text NOT NULL);
CREATE UNIQUE INDEX partial_bad_current ON lab.partial_bad(semantic_key) WHERE toy_state='running';
INSERT INTO lab.partial_bad VALUES(1,77,'running');
CREATE TABLE lab.atomic_parent (id integer PRIMARY KEY);
CREATE TABLE lab.atomic_child (id integer PRIMARY KEY, parent integer REFERENCES lab.atomic_parent(id));
CREATE TABLE lab.race (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, semantic_key integer NOT NULL UNIQUE);
CREATE TABLE lab.hidden (id integer PRIMARY KEY, owner_name text NOT NULL);
INSERT INTO lab.hidden VALUES(1,'someone_else');
CREATE ROLE lab_actor;
GRANT USAGE ON SCHEMA lab TO lab_actor;
GRANT SELECT,INSERT ON lab.hidden TO lab_actor;
ALTER TABLE lab.hidden ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.hidden FORCE ROW LEVEL SECURITY;
CREATE POLICY visible_own ON lab.hidden FOR SELECT TO lab_actor USING(owner_name=current_user);
CREATE POLICY insert_own ON lab.hidden FOR INSERT TO lab_actor WITH CHECK(owner_name=current_user);
'''
(ROOT/'setup.sql').write_text(setup)
sql(setup)
version = sql('SELECT version();').stdout.strip()
rejects('same-tenant Party reference', 'INSERT INTO lab.journey(tenant,entity,party,ministry) VALUES(1,100,20,1000);','23503')
rejects('exact ministry Legal Entity reference', 'INSERT INTO lab.journey(tenant,entity,party,ministry) VALUES(1,200,10,1000);','23503')
rejects('required key cannot be null', 'INSERT INTO lab.journey(tenant,entity,party,ministry) VALUES(1,NULL,10,1000);','23502')
rejects('referenced ministry cannot be deleted', 'DELETE FROM lab.ministry WHERE tenant=1 AND entity=100 AND id=1000;','23503')
sql('INSERT INTO lab.check_null VALUES(NULL);')
record('CHECK alone permits null',sql('SELECT count(*) FROM lab.check_null WHERE value IS NULL;').stdout.strip()=='1','NOT NULL is separately necessary for required values')
sql('INSERT INTO lab.unique_null VALUES(1,NULL),(1,NULL);')
record('ordinary UNIQUE permits null duplicate',sql('SELECT count(*) FROM lab.unique_null;').stdout.strip()=='2','Default nulls-distinct behavior')
sql('INSERT INTO lab.unique_null_equal VALUES(1,NULL);')
rejects('NULLS NOT DISTINCT closes optional-key loophole','INSERT INTO lab.unique_null_equal VALUES(1,NULL);','23505')
sql('INSERT INTO lab.loose_reference VALUES(1,NULL,9999);')
record('MATCH SIMPLE nullable composite bypass',sql('SELECT count(*) FROM lab.loose_reference;').stdout.strip()=='1','A partial-null tuple skipped FK matching')
rejects('MATCH FULL rejects partial-null tuple','INSERT INTO lab.full_reference VALUES(1,NULL,9999);','23503')
sql("UPDATE lab.partial_bad SET toy_state='paused' WHERE id=1; INSERT INTO lab.partial_bad VALUES(2,77,'running');")
record('running-only partial index permits paused duplicate',sql('SELECT count(*) FROM lab.partial_bad WHERE semantic_key=77;').stdout.strip()=='2','Predicate silently chooses lifecycle semantics')
rejects('reopening paused row now collides',"UPDATE lab.partial_bad SET toy_state='running' WHERE id=1;",'23505')
rejects('whole DB transaction aborts on child failure','BEGIN; INSERT INTO lab.atomic_parent VALUES(1); INSERT INTO lab.atomic_child VALUES(1,999); COMMIT;','23503')
record('atomic rollback leaves no parent',sql('SELECT count(*) FROM lab.atomic_parent WHERE id=1;').stdout.strip()=='0','Same DB transaction')
sql('INSERT INTO lab.atomic_parent VALUES(2);')
rejects('separate request can fail after first commit','INSERT INTO lab.atomic_child VALUES(2,999);','23503')
record('separate autocommit retains parent',sql('SELECT count(*) FROM lab.atomic_parent WHERE id=2;').stdout.strip()=='1','Multiple client calls do not share a transaction')
record('RLS hides existing row',sql('SET ROLE lab_actor; SELECT count(*) FROM lab.hidden;').stdout.strip()=='0','SELECT policy excludes owner')
rejects('UNIQUE still reveals hidden conflict',"SET ROLE lab_actor; INSERT INTO lab.hidden VALUES(1,current_user);",'23505')
sql('SET ROLE lab_actor; INSERT INTO lab.hidden VALUES(2,current_user);')
record('same authority can insert absent key',sql('SET ROLE lab_actor; SELECT count(*) FROM lab.hidden;').stdout.strip()=='1','Absent success differs from hidden-row conflict; owner admission required')

def race_once(key, cte):
    # A retains an uncommitted row. Commit only after pg_blocking_pids proves
    # B has reached the conflicting INSERT and is waiting on A.
    a = subprocess.Popen(BASE, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                         text=True, env=env, bufsize=1)
    b = None
    try:
        a.stdin.write(f"BEGIN; INSERT INTO lab.race(semantic_key) VALUES({key}); SELECT 'READY|' || pg_backend_pid();\n")
        a.stdin.flush()
        ready = a.stdout.readline().strip()
        assert ready.startswith('READY|'), ready
        a_pid = int(ready.split('|')[1])
        if cte:
            query = f'''WITH attempt AS (INSERT INTO lab.race(semantic_key) VALUES({key})
            ON CONFLICT(semantic_key) DO NOTHING RETURNING id)
            SELECT id FROM attempt UNION ALL SELECT id FROM lab.race WHERE semantic_key={key} LIMIT 1;'''
        else:
            query = f'''BEGIN ISOLATION LEVEL READ COMMITTED;
            INSERT INTO lab.race(semantic_key) VALUES({key}) ON CONFLICT(semantic_key) DO NOTHING;
            SELECT id FROM lab.race WHERE semantic_key={key}; COMMIT;'''
        app_name = f'phase27_d3_b_{key}'
        b = subprocess.Popen(BASE, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             text=True, env=env, bufsize=1)
        b.stdin.write(f"SET application_name='{app_name}';\n" + query + '\n')
        b.stdin.close()
        b.stdin = None
        deadline = time.monotonic() + 10
        observation = ''
        while time.monotonic() < deadline:
            observation = sql(f'''SELECT json_build_object(
                'blocked_pid',pid,'blockers',pg_blocking_pids(pid),
                'wait_event_type',wait_event_type,'wait_event',wait_event)
                FROM pg_stat_activity
                WHERE application_name='{app_name}'
                AND {a_pid}=ANY(pg_blocking_pids(pid));''').stdout.strip()
            if observation:
                break
            if b.poll() is not None:
                raise AssertionError('B exited before observed conflict wait: ' + b.stderr.read())
            time.sleep(0.025)
        assert observation, 'No verified B-on-A blocking observation before timeout'
        a.stdin.write('COMMIT;\n')
        a.stdin.close()
        a.stdin = None
        a_out, a_err = a.communicate(timeout=10)
        assert a.returncode == 0, a_err
        b_out, b_err = b.communicate(timeout=10)
        assert b.returncode == 0, b_err
        return b_out.strip(), {'protocol':'A committed only after B observed blocked by A',
                               'a_pid':a_pid, 'observation':json.loads(observation)}
    finally:
        for process in [b,a]:
            if process is not None and process.poll() is None:
                process.kill()
                process.wait(timeout=10)

cte_value, cte_barrier = race_once(101, True)
record('one CTE get-or-create can return empty under race',cte_value=='',{'returned':cte_value,'existing_count':sql('SELECT count(*) FROM lab.race WHERE semantic_key=101;').stdout.strip(),'barrier':cte_barrier})
fresh_value, fresh_barrier = race_once(102, False)
record('separate READ COMMITTED statement sees winning insert',fresh_value.isdigit(),{'returned_id':fresh_value,'existing_count':sql('SELECT count(*) FROM lab.race WHERE semantic_key=102;').stdout.strip(),'barrier':fresh_barrier})

def contender(_):
    return sql('''BEGIN ISOLATION LEVEL READ COMMITTED;
    INSERT INTO lab.race(semantic_key) VALUES(103) ON CONFLICT(semantic_key) DO NOTHING;
    SELECT id FROM lab.race WHERE semantic_key=103; COMMIT;''').stdout.strip()
with ThreadPoolExecutor(max_workers=8) as pool:
    returns = list(pool.map(contender,range(16)))
record('concurrent contenders converge on one row',len(set(returns))==1 and returns[0].isdigit() and sql('SELECT count(*) FROM lab.race WHERE semantic_key=103;').stdout.strip()=='1',{'submissions':len(returns),'max_concurrent_client_workers':8,'distinct_results':len(set(returns))})

out={'version':version,'scope':'Disposable PostgreSQL mechanics. No application schema, Supabase API/auth, production data, source command or final lifecycle qualification.', 'tests':results}
(ROOT/'results.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({'version':version,'passed':sum(x['pass'] for x in results),'total':len(results),'evidence':str(ROOT/'results.json')}))
