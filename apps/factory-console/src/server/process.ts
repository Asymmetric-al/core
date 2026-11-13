import { spawn } from "node:child_process";

export type ProcessResult = {
  code: number | null;
  /** True only when the process never started (spawn error). */
  spawnFailed?: boolean;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  overflow: boolean;
};

export type ProcessRunner = (
  argv: readonly string[],
  options: {
    env: Record<string, string>;
    cwd: string;
    timeoutMs: number;
    maxOutput: number;
  },
) => Promise<ProcessResult>;

/**
 * Spawn one process from an explicit argv array (never a shell), with an
 * explicit minimal environment, a hard timeout and bounded captured output.
 * Spawn failures resolve with code null instead of throwing so callers can
 * report "unavailable" without leaking the executable path.
 */
export const runProcess: ProcessRunner = (argv, options) =>
  new Promise((resolve) => {
    const [file, ...args] = argv;
    let stdout = "";
    let stderr = "";
    let size = 0;
    let overflow = false;
    let timedOut = false;
    let settled = false;
    let started = false;
    const finish = (code: number | null, spawnFailed = false) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut, overflow, spawnFailed });
    };
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(file, args, {
        cwd: options.cwd,
        env: options.env as NodeJS.ProcessEnv,
        shell: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch {
      resolve({
        code: null,
        stdout: "",
        stderr: "",
        timedOut: false,
        overflow,
        spawnFailed: true,
      });
      return;
    }
    child.on("spawn", () => {
      started = true;
    });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, options.timeoutMs);
    const collect = (target: "stdout" | "stderr") => (chunk: Buffer) => {
      size += chunk.byteLength;
      if (size > options.maxOutput) {
        if (!overflow) {
          overflow = true;
          child.kill("SIGKILL");
        }
        return;
      }
      if (target === "stdout") stdout += chunk.toString("utf8");
      else stderr += chunk.toString("utf8");
    };
    child.stdout?.on("data", collect("stdout"));
    child.stderr?.on("data", collect("stderr"));
    // An error before "spawn" means the executable never ran; a later error or
    // a close without a code (killed by a signal) means it ran and its effect
    // is unknown.
    child.on("error", () => finish(null, !started));
    child.on("close", (code) => finish(code));
  });

/** Strip NUL and other control characters (keeping tab/newline) from argv text. */
export function argvText(value: string, maximum: number) {
  return Array.from(value.trim().slice(0, maximum))
    .filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code === 9 || code === 10 || (code >= 32 && code !== 127);
    })
    .join("");
}
