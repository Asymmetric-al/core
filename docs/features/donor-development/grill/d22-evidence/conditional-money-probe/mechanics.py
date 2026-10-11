"""D22 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D22_LAB_CONTAINER"]
if not NAME.startswith("phase27-d22-conditional-money-lab-"):
    raise RuntimeError("Only the isolated D22 container is permitted")
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


def state():
    return json.loads(sql("""SELECT json_build_object(
      'request',(SELECT to_jsonb(r) FROM lab.request r WHERE tenant_id=1 AND entity_id=10 AND id=1),
      'versions',(SELECT jsonb_agg(snapshot ORDER BY revision) FROM lab.request_version WHERE tenant_id=1 AND entity_id=10 AND request_id=1),
      'receipts',(SELECT count(*) FROM lab.receipt WHERE tenant_id=1 AND entity_id=10 AND request_id=1));"""))


try:
    sql((ROOT/'setup.sql').read_text())
    version=sql('SELECT version();')
    isolation=sql('SHOW transaction_isolation;')

    sql("INSERT INTO lab.naive_request VALUES('monetary',NULL);")
    check('nullable CHECK trap: amount greater than zero does not by itself require an amount',
      sql('SELECT count(*) FROM lab.naive_request;')=='1',
      {'accepted_null_rows':1,'reason':'CHECK accepts UNKNOWN; requiredness needs an explicit rule'})

    unknown=json.loads(sql('SELECT to_jsonb(r) FROM lab.request r WHERE id=2;'))
    no_money=json.loads(sql('SELECT to_jsonb(r) FROM lab.request r WHERE id=3;'))
    invalid={}
    for name,statement in [
      ('missing_currency',"UPDATE lab.request SET currency=NULL WHERE id=2;"),
      ('nonfinancial_zero',"UPDATE lab.request SET requested_minor=0 WHERE id=3;"),
      ('nonfinancial_currency',"UPDATE lab.request SET currency='USD' WHERE id=3;"),
      ('negative_expected',"UPDATE lab.request SET expected_minor=-1 WHERE id=2;")]:
        invalid[name]=sql(statement,expect_error='23514')
    check('conditional fields: nonfinancial absence and monetary unknown remain distinct; invalid partial monetary tuples reject',
      unknown['kind']=='monetary' and unknown['currency']=='USD'
      and unknown['requested_minor'] is None and unknown['expected_minor'] is None
      and no_money['kind']=='nonfinancial' and no_money['currency'] is None
      and no_money['requested_minor'] is None and all(v=='23514' for v in invalid.values()),
      {'monetary_unknown':unknown,'nonfinancial_absence':no_money,'errors':invalid})

    foreign_target=sql('UPDATE lab.request SET target_id=600 WHERE id=2;',expect_error='23503')
    foreign_parent=sql("INSERT INTO lab.request VALUES(1,10,200,99,'nonfinancial',NULL,NULL,NULL,NULL,1);",expect_error='23503')
    missing_entity=sql("INSERT INTO lab.request VALUES(1,NULL,100,99,'nonfinancial',NULL,NULL,NULL,NULL,1);",expect_error='23502')
    check('optional monetary context never weakens required journey/entity scope; supplied targets must share exact source scope',
      foreign_target=='23503' and foreign_parent=='23503' and missing_entity=='23502',
      {'foreign_target':foreign_target,'foreign_journey_even_without_money':foreign_parent,'missing_entity':missing_entity})

    before=state()
    implicit=sql("UPDATE lab.request SET kind='nonfinancial' WHERE id=1;",expect_error='23514')
    check('type flag alone cannot hide or retain incompatible money as a valid nonfinancial row',
      implicit=='23514' and state()==before,{'error':implicit,'all_rows_unchanged':state()==before})

    late=sql("SELECT lab.replace_terms(1,'fixture-late-failure',1,'nonfinancial',NULL,NULL,NULL,NULL);",expect_error='23514')
    rollback=state()==before
    absent=json.loads(sql("SELECT lab.replace_terms(1,'replace-terms',1,'nonfinancial',NULL,NULL,NULL,NULL);"))
    after=state()
    check('explicit type-and-terms replacement preserves original monetary version and atomically records current version plus result',
      late=='23514' and rollback and absent==after['request']
      and absent['kind']=='nonfinancial' and absent['requested_minor'] is None
      and len(after['versions'])==2 and after['versions'][0]==before['request'] and after['receipts']==1,
      {'late_failure':late,'rollback_all':rollback,'original':after['versions'][0],'current':after['request'],'versions':len(after['versions']),'receipts':after['receipts']})

    conflict=sql("SELECT lab.replace_terms(1,'replace-terms',1,'monetary','USD',12000,0,NULL);",expect_error='23514')
    changed=json.loads(sql("SELECT lab.replace_terms(1,'revised-funding',2,'monetary','USD',12000,0,NULL);"))
    before_replay=state()
    replay=json.loads(sql("SELECT lab.replace_terms(1,'replace-terms',1,'nonfinancial',NULL,NULL,NULL,NULL);"))
    stale=sql("SELECT lab.replace_terms(1,'stale-revision',1,'nonfinancial',NULL,NULL,NULL,NULL);",expect_error='40001')
    check('business identity binds conditional meaning; old successful nonfinancial result never wipes later monetary revision',
      conflict=='23514' and stale=='40001' and replay==absent and state()==before_replay
      and changed['requested_minor']==12000 and changed['expected_minor']==0
      and len(before_replay['versions'])==3 and before_replay['receipts']==2,
      {'changed_meaning':conflict,'stale_revision':stale,'historical_result':replay,
       'current':changed,'replay_preserved_current_and_history':state()==before_replay})

    lanes=json.loads(sql("""SELECT jsonb_agg(to_jsonb(x) ORDER BY entity_id,currency) FROM(
      SELECT entity_id,currency,count(*) AS asks,count(requested_minor) AS known_requested,
        sum(requested_minor) AS known_requested_sum FROM lab.request WHERE kind='monetary'
      GROUP BY entity_id,currency)x;"""))
    check('same-currency/entity amount lanes retain known coverage; SUM ignoring NULL is not complete monetary knowledge',
      lanes==[{'entity_id':10,'currency':'JPY','asks':1,'known_requested':1,'known_requested_sum':10000},
        {'entity_id':10,'currency':'USD','asks':2,'known_requested':1,'known_requested_sum':12000},
        {'entity_id':20,'currency':'USD','asks':1,'known_requested':1,'known_requested_sum':10000}],lanes)

    storage=json.loads(sql("SELECT json_build_object('fractional_numeric_cast',1.5::numeric::bigint,'exact_large_integer','9007199254740993'::bigint::text);"))
    check('integer storage is not input precision validation: decimal cast rounds while bigint retains values beyond JS safe integer',
      storage=={'fractional_numeric_cast':2,'exact_large_integer':'9007199254740993'},storage)
    completed=True
finally:
    report={'server_version':version,'isolation_level':locals().get('isolation'),
      'completed':completed,'passed':sum(x['pass'] for x in results),'total':len(results),
      'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


