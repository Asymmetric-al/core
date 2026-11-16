import {
  factoryEnvironment,
  type FactoryConfiguration,
} from "./factory-config";
import { runProcess, type ProcessRunner } from "./process";

export type StateDocument = {
  name: string;
  revision: number;
  value: unknown;
  lease: { runId: string; live: boolean } | null;
};

/** The read seam over Archon state documents in the control project. */
export interface StateReader {
  get(name: string): Promise<StateDocument>;
  list(prefix: string): Promise<StateDocument[]>;
}

export class StateUnavailable extends Error {}

const NAME = /^core\/[a-z0-9/_.:-]{1,200}$/;

/**
 * At most this many Archon CLI processes run at once across every request in
 * this server process, so a refresh never starts a burst of engine binaries.
 */
export const CLI_CONCURRENCY = 3;
let active = 0;
const waiting: (() => void)[] = [];

async function gated<T>(work: () => Promise<T>): Promise<T> {
  // A finishing process hands its slot straight to the next waiter, so the
  // limit holds even when new callers arrive in between.
  if (active >= CLI_CONCURRENCY)
    await new Promise<void>((resolve) => waiting.push(resolve));
  else active += 1;
  try {
    return await work();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else active -= 1;
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function documentFrom(raw: unknown): StateDocument | null {
  if (!record(raw) || typeof raw.name !== "string") return null;
  const revision = raw.revision ?? 0;
  if (!Number.isSafeInteger(revision) || (revision as number) < 0) return null;
  const lease =
    record(raw.lease) && typeof raw.lease.runId === "string"
      ? { runId: raw.lease.runId, live: raw.lease.live !== false }
      : null;
  return {
    name: raw.name,
    revision: revision as number,
    value: raw.value ?? null,
    lease,
  };
}

/**
 * Output bound of one `state list` read. A 2,000-issue factory whose work
 * items keep 40 rounds with long summaries lists at about 25 MB; the bound
 * keeps that readable while still capping server memory.
 */
export const LIST_OUTPUT_LIMIT = 48_000_000;

/**
 * Reads state documents by spawning the pinned Archon CLI with an argv array:
 * `archon state get <name> --project <p>` and
 * `archon state list --prefix <p> --values --project <p>`.
 * Failures never include stderr or paths; the caller reports availability.
 */
export function cliStateReader(
  config: FactoryConfiguration,
  run: ProcessRunner = runProcess,
): StateReader {
  const invoke = async (args: string[], maxOutput: number) => {
    const result = await gated(() =>
      run([...config.archonCommand, ...args], {
        env: factoryEnvironment(config),
        cwd: config.cwd,
        timeoutMs: config.readTimeoutMs,
        maxOutput,
      }),
    );
    if (result.timedOut)
      throw new StateUnavailable("Factory state read timed out");
    if (result.overflow)
      throw new StateUnavailable(
        "Factory state read exceeded the Console output limit",
      );
    if (result.code === null)
      throw new StateUnavailable("The Archon CLI could not be started");
    if (result.code !== 0)
      throw new StateUnavailable(
        `Factory state read failed (Archon CLI exit ${result.code})`,
      );
    try {
      return JSON.parse(result.stdout) as unknown;
    } catch {
      throw new StateUnavailable("Factory state read returned malformed JSON");
    }
  };
  return {
    async get(name) {
      if (!NAME.test(name) || name.includes(".."))
        throw new StateUnavailable("Invalid state document name");
      const document = documentFrom(
        await invoke(
          ["state", "get", name, "--project", config.project],
          2_000_000,
        ),
      );
      if (!document || document.name !== name)
        throw new StateUnavailable("Archon returned another state document");
      return document;
    },
    async list(prefix) {
      if (!NAME.test(prefix) || prefix.includes(".."))
        throw new StateUnavailable("Invalid state document prefix");
      const raw = await invoke(
        [
          "state",
          "list",
          "--prefix",
          prefix,
          "--values",
          "--project",
          config.project,
        ],
        LIST_OUTPUT_LIMIT,
      );
      if (!record(raw) || !Array.isArray(raw.documents))
        throw new StateUnavailable("Archon returned a malformed state list");
      const documents: StateDocument[] = [];
      for (const entry of raw.documents) {
        const document = documentFrom(entry);
        if (!document || !document.name.startsWith(prefix))
          throw new StateUnavailable(
            "Archon listed a document outside the prefix",
          );
        documents.push(document);
      }
      return documents;
    },
  };
}
