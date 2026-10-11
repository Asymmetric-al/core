"""Run only the disposable mechanics fixture, with no application DB access."""
from pathlib import Path
import datetime, json, os, subprocess, sys, time

ROOT = Path(__file__).resolve().parent
NAME = 'phase27-d3-postgres-lab'
IMAGE = 'postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24'
env = dict(os.environ)
for key in ['DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH']:
    env.pop(key, None)
DOCKER = ['docker', '--host=unix:///var/run/docker.sock']

def command(args, check=True):
    return subprocess.run(args, env=env, text=True, capture_output=True, timeout=45, check=check)

if command(DOCKER + ['container', 'inspect', NAME], check=False).returncode == 0:
    raise RuntimeError('Named lab container already exists; refusing to reuse or delete it')
command(DOCKER + ['image', 'inspect', IMAGE])
create = DOCKER + ['run', '-d', '--name', NAME, '--network', 'none', '--memory', '256m', '--cpus', '1',
                   '--tmpfs', '/var/lib/postgresql/data:rw,size=128m',
                   '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', IMAGE]
metadata = {
    'started_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'image': IMAGE,
    'create_command': create,
    'network': 'none', 'published_ports': [], 'host_mounts': [],
    'persistence': 'tmpfs; deleted with container',
    'scope': 'Only synthetic lab schema; no application SQL, credentials or data',
    'race_scheduling': 'Keep A transaction open until pg_stat_activity and pg_blocking_pids prove B blocked by A; then commit A',
    'concurrency_sample': '16 submissions with at most 8 concurrent client workers; not a load benchmark',
}
created = False
try:
    metadata['container_id'] = command(create).stdout.strip()
    created = True
    deadline = time.monotonic() + 25
    while time.monotonic() < deadline:
        if command(DOCKER + ['exec', NAME, 'pg_isready', '-U', 'postgres'], check=False).returncode == 0:
            break
        time.sleep(0.2)
    else:
        raise RuntimeError('Disposable Postgres did not become ready within 25 seconds')
    run = command([sys.executable, str(ROOT / 'mechanics.py')], check=False)
    metadata['test_exit_code'] = run.returncode
    metadata['test_stdout'] = run.stdout.strip()
    metadata['test_stderr'] = run.stderr.strip()
    if run.returncode:
        raise RuntimeError(run.stderr)
finally:
    if created:
        cleanup = command(DOCKER + ['rm', '-f', NAME], check=False)
        metadata['cleanup_exit_code'] = cleanup.returncode
        metadata['container_removed'] = (
            cleanup.returncode == 0
            and command(DOCKER + ['container', 'inspect', NAME], check=False).returncode != 0
        )
    metadata['finished_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    (ROOT / 'run-metadata.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(metadata['test_stdout'])
print(json.dumps({'container_removed': metadata['container_removed'], 'metadata': str(ROOT / 'run-metadata.json')}))
