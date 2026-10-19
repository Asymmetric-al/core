"""Run only this synthetic fixture in a disposable, locally isolated Postgres."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import signal
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parent
NAME = f"phase27-d13-assessment-lab-{os.getpid()}"
IMAGE = "postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24"
ENV = dict(os.environ)
for key in ["DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH"]:
    ENV.pop(key, None)
DOCKER = ["docker", "--host=unix:///var/run/docker.sock"]


def command(args, check=True, timeout=45):
    return subprocess.run(args, env=ENV, text=True, capture_output=True,
                          timeout=timeout, check=check)


def interrupted(_signum, _frame):
    raise KeyboardInterrupt("Interrupted; removing only the created D13 container")


signal.signal(signal.SIGTERM, interrupted)
if command(DOCKER + ["container", "inspect", NAME], check=False).returncode == 0:
    raise RuntimeError("Named container exists; refusing to reuse or delete it")
image = json.loads(command(DOCKER + ["image", "inspect", IMAGE]).stdout)[0]
create = DOCKER + ["create", "--name", NAME, "--network", "none", "--memory", "256m",
    "--cpus", "1", "--tmpfs", "/var/lib/postgresql/data:rw,size=128m",
    "-e", "POSTGRES_HOST_AUTH_METHOD=trust", IMAGE]
metadata = {
    "started_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "image": IMAGE, "image_id": image["Id"], "repo_digests": image.get("RepoDigests", []),
    "container_name": NAME, "create_command": create,
    "scope": "Synthetic mechanics only; no Core SQL, application database, credentials or provider",
    "concurrency": "One controlled competing-first-assessment schedule with exact pg_blocking_pids barriers; not load testing",
    "input_sha256": {name: hashlib.sha256((ROOT/name).read_bytes()).hexdigest()
                     for name in ["setup.sql", "mechanics.py", "run-lab.py"]},
}
created = False
try:
    metadata["container_id"] = command(create).stdout.strip()
    created = True
    command(DOCKER + ["start", NAME])
    inspected = json.loads(command(DOCKER + ["container", "inspect", NAME]).stdout)[0]
    metadata["isolation"] = {
        "network_mode": inspected["HostConfig"]["NetworkMode"],
        "port_bindings": inspected["HostConfig"]["PortBindings"],
        "binds": inspected["HostConfig"]["Binds"],
        "tmpfs": inspected["HostConfig"]["Tmpfs"],
        "mounts": inspected["Mounts"],
    }
    assert metadata["isolation"]["network_mode"] == "none"
    assert not metadata["isolation"]["port_bindings"]
    assert not metadata["isolation"]["binds"]
    assert not inspected["Mounts"]
    deadline = time.monotonic() + 25
    while time.monotonic() < deadline:
        # pg_isready alone can see the entrypoint's temporary bootstrap server.
        logs = command(DOCKER + ["logs", NAME], check=False)
        bootstrap_finished = "PostgreSQL init process complete; ready for start up." in (logs.stdout + logs.stderr)
        if bootstrap_finished and command(DOCKER + ["exec", NAME, "pg_isready", "-U", "postgres"], check=False).returncode == 0:
            break
        time.sleep(0.1)
    else:
        raise RuntimeError("Disposable database did not become ready")
    ENV["D13_LAB_CONTAINER"] = NAME
    run = command([sys.executable, str(ROOT / "mechanics.py")], check=False, timeout=100)
    metadata.update(test_exit_code=run.returncode, test_stdout=run.stdout.strip(), test_stderr=run.stderr.strip())
    if run.returncode:
        raise RuntimeError(run.stderr)
finally:
    if created:
        cleanup = command(DOCKER + ["rm", "-f", metadata["container_id"]], check=False)
        metadata["cleanup_exit_code"] = cleanup.returncode
        metadata["container_removed"] = cleanup.returncode == 0 and command(
            DOCKER + ["container", "inspect", metadata["container_id"]], check=False).returncode != 0
    metadata["finished_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    (ROOT / "run-metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
if not metadata.get("container_removed"):
    raise RuntimeError("Cleanup was not verified")
print(metadata["test_stdout"])
print(json.dumps({"container_removed": True, "metadata": str(ROOT / "run-metadata.json")}))
