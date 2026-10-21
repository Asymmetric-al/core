#!/usr/bin/env python3
"""Six disposable FK scenarios from selected exact migration declarations."""
import hashlib
import importlib.util
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[5]
HELPER = ROOT.parents[1] / 'd1-evidence/postgres-probe/run.py'
spec = importlib.util.spec_from_file_location('d1_harness', HELPER)
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)
h.NAME = 'phase28-d3-pg'
IMAGE = 'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'
CASES = []

def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + '\n')

def uid(n):
    return f'00000000-0000-0000-0000-{n:012}'

def counts(n, tables):
    return 'SELECT ' + "||':'||".join(
        f"(SELECT count(*) FROM {table} WHERE id='{uid(n)}')"
        for table in tables) + ';'

def case(name, action, observation, before, after, state=None):
    entry = {'name': name, 'role': 'd3_deleter', 'steps': []}
    CASES.append(entry)
    for query, expected, sqlstate in [(observation, before, None), (action, '', state), (observation, after, None)]:
        result = h.sql(query, 'd3_deleter')
        passed = (result.returncode != 0 and f'{sqlstate}:' in result.stderr) if sqlstate else (result.returncode == 0 and result.stdout.strip() == expected)
        entry['steps'].append({'sql': query, 'expected_stdout': expected if not sqlstate else None, 'expected_sqlstate': sqlstate, 'exit_code': result.returncode, 'stdout': result.stdout.strip(), 'stderr': result.stderr.strip(), 'passed': passed})
        if not passed:
            raise AssertionError(name + ': ' + result.stdout + result.stderr)
    entry['passed'] = True

def main():
    # Refuse stale or changed source artifacts rather than silently test another graph.
    for source in json.loads((ROOT / 'sources.json').read_text())['sources']:
        assert hashlib.sha256((REPO / source['path']).read_bytes()).hexdigest() == source['full_file_sha256'], source['path']
    startup = h.docker(['run', '--name', h.NAME, '--rm', '--network', 'none', '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-d', IMAGE])
    if startup.returncode:
        raise RuntimeError(startup.stderr)
    container_id = startup.stdout.strip()
    cleanup = {'container': h.NAME, 'container_id': container_id, 'volume_names': []}
    try:
        details = json.loads(h.docker(['inspect', h.NAME]).stdout)[0]
        assert details['HostConfig']['NetworkMode'] == 'none'
        assert not details['HostConfig']['PortBindings'] and not details['NetworkSettings']['Ports']
        cleanup['volume_names'] = [m['Name'] for m in details['Mounts'] if m['Type'] == 'volume']
        deadline = time.monotonic() + 30
        while True:
            logs = h.docker(['logs', h.NAME])
            initialized = 'PostgreSQL init process complete; ready for start up.' in logs.stdout + logs.stderr
            if initialized and h.docker(['exec', h.NAME, 'pg_isready', '-U', 'postgres']).returncode == 0:
                break
            if time.monotonic() > deadline:
                raise TimeoutError('PostgreSQL did not become ready')
            time.sleep(.2)
        save('environment.json', {'recorded_at': datetime.now(timezone.utc).isoformat(), 'container': h.NAME, 'container_id': container_id, 'image': IMAGE, 'actual_image_id': details['Image'], 'network': details['HostConfig']['NetworkMode'], 'published_ports': details['NetworkSettings']['Ports'], 'volume_names': cleanup['volume_names'], 'server': h.admin('SELECT version();')})
        h.admin((ROOT / 'setup.sql').read_text())
        save('roles.json', json.loads(h.admin("SELECT json_agg(r) FROM (SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname='d3_deleter')r;")))
        save('constraints.json', json.loads(h.admin("SELECT json_agg(c) FROM (SELECT conrelid::regclass::text AS child,conname,confrelid::regclass::text AS parent,confdeltype,condeferrable,condeferred,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace ORDER BY conrelid::regclass::text,conname)c;")))
        common = ['auth.users', 'public.profiles', 'public.missionaries', 'public.missionary_tasks']
        case('unblocked_auth_delete_cascades_profile_missionary_and_profile_keyed_task', f"DELETE FROM auth.users WHERE id='{uid(1)}';", counts(1, common), '1:1:1:1', '0:0:0:0')
        case('donor_primary_association_blocks_profile_delete_and_preserves_cascade_candidates', f"DELETE FROM public.profiles WHERE id='{uid(2)}';", counts(2, common + ['public.donors']), '1:1:1:1:1', '1:1:1:1:1', '23503')
        case('fund_blocks_auth_delete_and_entire_cascade_is_rolled_back', f"DELETE FROM auth.users WHERE id='{uid(3)}';", counts(3, common + ['public.funds']), '1:1:1:1:1', '1:1:1:1:1', '23503')
        case('donation_blocks_auth_delete_and_entire_cascade_is_rolled_back', f"DELETE FROM auth.users WHERE id='{uid(4)}';", counts(4, common + ['public.donations']), '1:1:1:1:1', '1:1:1:1:1', '23503')
        pledge = counts(5, common + ['public.donor_pledges']) + f"SELECT missionary_id IS NULL FROM public.donor_pledges WHERE id='{uid(5)}';"
        case('successful_missionary_delete_nulls_pledge_but_preserves_profile_keyed_task', f"DELETE FROM public.missionaries WHERE id='{uid(5)}';", pledge, '1:1:1:1:1\nf', '1:1:0:1:1\nt')
        retained = counts(6, common + ['public.crm_notes', 'public.crm_command_logs']) + f"SELECT author_profile_id='{uid(6)}' AND author_name='Retained synthetic author' AND body='Retained synthetic body' AND linked_record_id='{uid(6)}' AND linked_record_label='Retained synthetic label' FROM public.crm_notes WHERE id='{uid(6)}'; SELECT actor_profile_id IS NULL, actor_user_id='{uid(6)}', command_payload='{{\"retained\":\"synthetic\"}}'::jsonb FROM public.crm_command_logs WHERE id='{uid(6)}';"
        case('auth_delete_retains_note_author_and_text_but_only_nulls_log_profile_fk', f"DELETE FROM auth.users WHERE id='{uid(6)}';", retained, '1:1:1:1:1:1\nt\nf|t|t', '0:0:0:0:1:1\nt\nt|t|t')
    finally:
        stopped = h.docker(['stop', h.NAME])
        cleanup['stop_exit_code'] = stopped.returncode
        deadline = time.monotonic() + 15
        while True:
            cleanup['container_absent'] = h.docker(['inspect', container_id]).returncode != 0
            cleanup['volumes_absent'] = {v: h.docker(['volume', 'inspect', v]).returncode != 0 for v in cleanup['volume_names']}
            if cleanup['container_absent'] and all(cleanup['volumes_absent'].values()):
                break
            if time.monotonic() > deadline:
                raise RuntimeError('Disposable cleanup not confirmed')
            time.sleep(.2)
        cleanup['verified_at'] = datetime.now(timezone.utc).isoformat()
        save('cleanup.json', cleanup)

if __name__ == '__main__':
    failure = None
    try:
        main()
    except Exception as exc:
        failure = repr(exc)
    result = {'recorded_at': datetime.now(timezone.utc).isoformat(), 'scope': 'Selected source-exact FK mechanics in an isolated PostgreSQL fixture; not a full migration replay, deployed catalog, Supabase Auth/API/JWT or authorization qualification.', 'cases': len(CASES), 'cases_passed': sum(c.get('passed', False) for c in CASES), 'assertions': sum(len(c['steps']) for c in CASES), 'assertions_passed': sum(s['passed'] for c in CASES for s in c['steps']), 'failure': failure, 'artifact_sha256': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in ['setup.sql', 'run.py', 'sources.json']}, 'helper_sha256': hashlib.sha256(HELPER.read_bytes()).hexdigest(), 'results': CASES}
    save('results.json', result)
    print(json.dumps({k: result[k] for k in ['cases', 'cases_passed', 'assertions', 'assertions_passed', 'failure']}))
    if failure:
        raise SystemExit(1)
