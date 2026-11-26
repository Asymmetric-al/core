import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import defaultConfig, {
  getDefaultProjectTestIgnore,
} from "../../../playwright.config";
import proofConfig from "../../../playwright.n2-on.config";
import {
  appEnvironment,
  freshSecrets,
  parseOptions,
  proofEnvironment,
  proofPorts,
  scratchRowsSql,
  serverEnvironment,
  stackValuesFromStatus,
} from "../../../scripts/e2e/run-n2-on-proof.mts";
import {
  ADMIN_SURFACE,
  defineBoneyardConfig,
  DONOR_SURFACE,
  MISSIONARY_SURFACE,
} from "../../e2e/playwright-shared";

const PROOF_SPECS = "**/n2-on-*.spec.ts";

const STATUS = [
  'API_URL="http://127.0.0.1:34201"',
  'ANON_KEY="anon"',
  'SERVICE_ROLE_KEY="service"',
  'DB_URL="postgresql://postgres:postgres@127.0.0.1:34202/postgres"',
].join("\n");

describe("the on-mode proof runs only through its own command and configuration", () => {
  it("is ignored by the default configuration's projects that scan tests/e2e", () => {
    expect(getDefaultProjectTestIgnore(true)).toContain(PROOF_SPECS);
    expect(getDefaultProjectTestIgnore(false)).toContain(PROOF_SPECS);
    for (const project of defaultConfig.projects ?? []) {
      if (project.testMatch) {
        expect(JSON.stringify(project.testMatch), project.name).not.toMatch(
          /n2-on/,
        );
      } else {
        expect(project.testIgnore, project.name).toContain(PROOF_SPECS);
      }
    }
  });

  it.each([
    ["admin", ADMIN_SURFACE],
    ["donor", DONOR_SURFACE],
    ["missionary", MISSIONARY_SURFACE],
  ] as const)(
    "is ignored by the %s boneyard configuration",
    (_name, surface) => {
      expect(defineBoneyardConfig(surface, {}).testIgnore).toContain(
        PROOF_SPECS,
      );
    },
  );

  it("has a configuration of its own that runs nothing else, starts no server and is not retried", () => {
    expect(proofConfig.testMatch).toEqual([PROOF_SPECS]);
    expect(proofConfig.webServer).toBeUndefined();
    expect(proofConfig.workers).toBe(1);
    expect(proofConfig.retries).toBe(0);
  });

  it("is started only by its package script", () => {
    const scripts = (
      JSON.parse(
        readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
      ) as { scripts: Record<string, string> }
    ).scripts;
    expect(
      Object.entries(scripts).filter(([, command]) =>
        command.includes("n2-on"),
      ),
    ).toEqual([["test:e2e:n2-on", "node scripts/e2e/run-n2-on-proof.mts"]]);
  });
});

describe("the runner", () => {
  it("reads the local stack and refuses one that is not on this machine", () => {
    expect(stackValuesFromStatus(STATUS).dbUrl).toBe(
      "postgresql://postgres:postgres@127.0.0.1:34202/postgres",
    );
    expect(() =>
      stackValuesFromStatus(
        STATUS.replace("127.0.0.1:34202", "db.example.com:5432"),
      ),
    ).toThrow(/not on this machine/);
    expect(() =>
      stackValuesFromStatus(STATUS.replace("127.0.0.1:34201", "example.com")),
    ).toThrow(/not on this machine/);
    expect(() => stackValuesFromStatus("")).toThrow(/did not report/);
  });

  it("makes new keys for every run and hands each server only its own", () => {
    const first = freshSecrets();
    const second = freshSecrets();
    expect(first.adminStampKey).not.toBe(second.adminStampKey);
    expect(first.password).not.toBe(second.password);
    expect(first.adminStampKey).not.toBe(first.missionaryStampKey);
    const stack = stackValuesFromStatus(STATUS);
    const env = appEnvironment(stack, proofPorts({}), first, {});
    expect(env.CORE_SERVE_UNDER_PATHS).toBe("1");
    expect(Object.values(env)).not.toContain(first.adminStampKey);
    expect(Object.values(env)).not.toContain(first.missionaryStampKey);
    expect(serverEnvironment("admin", env, first).FRONT_STAMP_KEY).toBe(
      first.adminStampKey,
    );
    expect(serverEnvironment("missionary", env, first).FRONT_STAMP_KEY).toBe(
      first.missionaryStampKey,
    );
    expect(serverEnvironment("donor", env, first)).toMatchObject({
      FRONT_STAMP_KEY_ADMIN: first.adminStampKey,
      FRONT_STAMP_KEY_MISSIONARY: first.missionaryStampKey,
    });
    const proof = proofEnvironment(stack, proofPorts({}), first, {});
    expect(Object.values(proof)).not.toContain(first.adminStampKey);
    expect(Object.values(proof)).not.toContain(first.payloadSecret);
  });

  it("adds only the person's own rows, and parses its options", () => {
    expect(scratchRowsSql()).toMatch(/^INSERT INTO authz\.memberships /);
    expect(scratchRowsSql()).toContain("ON CONFLICT DO NOTHING RETURNING id");
    expect(parseOptions(["--skip-build", "--", "--grep", "Q"])).toEqual({
      build: false,
      serveOnly: false,
      playwrightArgs: ["--grep", "Q"],
    });
    expect(() => parseOptions(["--fast"])).toThrow(/unknown option/);
  });
});
