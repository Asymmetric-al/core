// TEST-ONLY wiring: the production Factory with fixtures injected at the
// StateReader, ControlRunner and Archon transport seams.
import path from "node:path";

import { createEngine } from "./engine-fixture";
import {
  FixtureControl,
  createFixtureState,
  type FireHook,
} from "./factory-fixture";
import { Archon } from "../../src/server/archon";
import { requestIds } from "../../src/server/control";
import { Factory } from "../../src/server/factory";
import {
  factoryConfiguration,
  factoryPolicyReader,
} from "../../src/server/factory-config";
import { configuration } from "../../src/server/security";

/** TEST-ONLY core-factory.json: owner `conrad`, limits.admittedIssues 2. */
export const FIXTURE_CONFIG_FILE = path.join(
  import.meta.dirname,
  "core-factory.json",
);

export const ENVIRONMENT = {
  CONSOLE_ORIGIN: "http://127.0.0.1:3092",
  CONSOLE_OWNER: "conrad",
  CONSOLE_PASSWORD: "fixture-password-not-a-real-secret",
  ARCHON_URL: "http://127.0.0.1:39994",
  ARCHON_CODEBASE_ID: "fixture-core",
  ARCHON_STORE_ID: "fixture-store",
};

export function harness({
  base = Date.now(),
  fire,
  env = {},
}: {
  base?: number;
  fire?: FireHook;
  env?: Record<string, string>;
} = {}) {
  const auth = configuration(ENVIRONMENT);
  const engine = createEngine({ base });
  const state = createFixtureState(base);
  const control = new FixtureControl(state, {
    cancel: (runId) => engine.cancel(runId),
    fire,
  });
  const archon = new Archon(auth, (input, init) =>
    engine.handle(init?.method ?? "GET", String(input)),
  );
  const ids = requestIds(auth.password);
  const settings = factoryConfiguration({
    FACTORY_CONFIG_FILE: FIXTURE_CONFIG_FILE,
    ...env,
  });
  const policy = factoryPolicyReader(settings);
  const factory = new Factory({
    auth,
    settings,
    settingsError: null,
    reader: state,
    control,
    policy,
    engine: archon,
    ids,
  });
  return { auth, engine, state, control, archon, ids, policy, factory };
}
