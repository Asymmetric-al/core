// Bounded subprocess execution. A timed-out, cancelled or oversized command is
// terminated (SIGTERM, then SIGKILL) and rejected; if the child never reports
// closure the rejection says so, and the caller must reconcile before retrying.
import { spawn } from "node:child_process";

export class ProcessError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ProcessError";
    Object.assign(this, details);
  }
}

export function runProcess(
  argv,
  {
    cwd,
    env = {},
    input,
    timeoutMs = 60_000,
    maxOutput = 4 * 1024 * 1024,
    signal,
    spawnImpl = spawn,
  } = {},
) {
  if (
    !Array.isArray(argv) ||
    argv.length === 0 ||
    argv.some((part) => typeof part !== "string" || part.includes("\0"))
  )
    return Promise.reject(new ProcessError("Invalid command"));
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawnImpl(argv[0], argv.slice(1), {
        cwd,
        env,
        shell: false,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (error) {
      reject(new ProcessError("Command could not start", { cause: error }));
      return;
    }
    const out = [];
    const err = [];
    let size = 0;
    let failure;
    let settled = false;
    let escalation;
    let finalDeadline;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      clearTimeout(escalation);
      clearTimeout(finalDeadline);
      signal?.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve(value);
    };
    const kill = (name) => {
      try {
        child.kill(name);
      } catch {}
    };
    const terminate = (reason) => {
      if (settled || failure) return;
      failure = reason;
      escalation = setTimeout(() => {
        finalDeadline = setTimeout(() => {
          child.stdin?.destroy();
          child.stdout?.destroy();
          child.stderr?.destroy();
          child.unref?.();
          finish(
            new ProcessError(
              `${reason}; termination unconfirmed; reconcile before retry`,
              { terminationConfirmed: false },
            ),
          );
        }, 1000);
        kill("SIGKILL");
      }, 1000);
      kill("SIGTERM");
    };
    const deadline = setTimeout(
      () => terminate("Command timed out"),
      timeoutMs,
    );
    const abort = () => terminate("Command cancelled");
    const collect = (chunks) => (chunk) => {
      if (failure || settled) return;
      size += chunk.length;
      if (size > maxOutput) terminate("Command exceeded output limit");
      else chunks.push(chunk);
    };
    child.stdout.on("data", collect(out));
    child.stderr.on("data", collect(err));
    child.stdin.on("error", () => {});
    child.on("error", (error) => {
      if (child.pid) terminate("Command did not complete");
      else
        finish(new ProcessError("Command could not start", { cause: error }));
    });
    child.on("close", (code, closeSignal) => {
      if (failure) {
        finish(
          new ProcessError(failure, {
            terminationConfirmed: true,
            code,
            signal: closeSignal,
          }),
        );
        return;
      }
      finish(null, {
        code: code ?? -1,
        signal: closeSignal ?? null,
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
      });
    });
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    if (input === undefined) child.stdin.end();
    else child.stdin.end(input);
  });
}

// Minimal environment for trusted helper processes: never inherit model,
// GitHub or cloud credentials by accident.
export function cleanEnvironment(extra = {}) {
  const keep = ["PATH", "HOME", "LANG", "LC_ALL", "TZ", "TMPDIR", "USER"];
  const env = {};
  for (const key of keep)
    if (process.env[key] !== undefined) env[key] = process.env[key];
  return { ...env, ...extra };
}
