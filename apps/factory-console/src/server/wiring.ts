import { Archon } from "./archon";
import { processControlRunner, requestIds } from "./control";
import { Factory } from "./factory";
import {
  FactoryConfigurationError,
  factoryConfiguration,
} from "./factory-config";
import { cliStateReader } from "./state";

import type { Configuration } from "./security";

/**
 * Production wiring: the Archon HTTP adapter, the CLI-backed state reader and
 * the control.mjs runner. Tests construct `Factory` with explicit fakes at
 * the same seams instead.
 */
export function createFactory(
  auth: Configuration,
  env: Record<string, string | undefined> = process.env,
) {
  const engine = new Archon(auth);
  const ids = requestIds(auth.password);
  try {
    const settings = factoryConfiguration(env);
    return new Factory({
      auth,
      settings,
      settingsError: null,
      reader: cliStateReader(settings),
      control: processControlRunner(settings),
      engine,
      ids,
    });
  } catch (error) {
    return new Factory({
      auth,
      settings: null,
      settingsError:
        error instanceof FactoryConfigurationError
          ? error.message
          : "Factory adapter configuration is invalid",
      reader: null,
      control: null,
      engine,
      ids,
    });
  }
}
