import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_CONFIG_PATH,
  factoryPaths,
  limits,
  loadConfig,
  reviewProviders,
  validateConfig,
} from "../../../scripts/archon-factory/pack/.shared/config.mjs";

type Json = Record<string, unknown>;

const roots: string[] = [];
afterEach(() => {
  vi.unstubAllEnvs();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function validConfig(): Json {
  return {
    version: 1,
    root: "/srv/core-factory",
    repository: {
      slug: "example-org/core",
      remote: "https://github.com/example-org/core.git",
      targetBranch: "develop",
      mergeMethod: "merge",
    },
    archon: {
      home: "/srv/core-factory/archon",
      executable: "/opt/archon/0.14.0/archon",
      hostId: "vm100",
    },
    git: {
      executable: "/usr/bin/git",
      authorName: "Factory Operator",
      authorEmail: "factory@example.invalid",
    },
    github: {
      executable: "/usr/bin/gh",
      configDir: "/srv/core-factory/credentials/gh",
    },
    executor: { docker: "/usr/bin/docker", image: `sha256:${"e".repeat(64)}` },
    owners: {
      operator: { profile: "/home/admin/.claude", githubLogin: "operator" },
    },
    defaultEndState: "PR_READY",
  };
}

function withChange(change: (config: Json) => void): Json {
  const config = validConfig();
  change(config);
  return config;
}

function configFile(content: unknown) {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-pack-config-")),
  );
  roots.push(root);
  const file = path.join(root, "core-factory.json");
  writeFileSync(file, JSON.stringify(content));
  return file;
}

describe("validateConfig", () => {
  it("returns the configuration it was given when every field is valid", () => {
    const config = validConfig();

    expect(validateConfig(config)).toBe(config);
  });

  it("accepts MERGED as the default end state", () => {
    const config = withChange((value) => {
      value.defaultEndState = "MERGED";
    });

    expect(validateConfig(config)).toBe(config);
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["a string", "core-factory.json"],
  ])("refuses %s as a configuration", (_label, config) => {
    expect(() => validateConfig(config)).toThrowError(
      /^Invalid factory configuration$/,
    );
  });

  it.each([
    ["an unsupported version", "version", (c: Json) => (c.version = 2)],
    ["a relative root", "root", (c: Json) => (c.root = "srv/core-factory")],
    ["the filesystem root as root", "root", (c: Json) => (c.root = "/")],
    [
      "a non-normalized root",
      "root",
      (c: Json) => (c.root = "/srv/x/../core-factory"),
    ],
    [
      "a root containing a newline",
      "root",
      (c: Json) => (c.root = "/srv/core\n-factory"),
    ],
    [
      "a malformed repository slug",
      "repository",
      (c: Json) => ((c.repository as Json).slug = "core"),
    ],
    [
      "an unknown merge method",
      "repository",
      (c: Json) => ((c.repository as Json).mergeMethod = "fast-forward"),
    ],
    [
      "a blank target branch",
      "repository",
      (c: Json) => ((c.repository as Json).targetBranch = "  "),
    ],
    [
      "a relative Archon executable",
      "archon",
      (c: Json) => ((c.archon as Json).executable = "archon"),
    ],
    [
      "a missing Archon host id",
      "archon",
      (c: Json) => delete (c.archon as Json).hostId,
    ],
    [
      "a missing Git author email",
      "git",
      (c: Json) => delete (c.git as Json).authorEmail,
    ],
    [
      "a relative GitHub config dir",
      "github",
      (c: Json) => ((c.github as Json).configDir = "gh"),
    ],
    [
      "a tagged executor image",
      "executor",
      (c: Json) => ((c.executor as Json).image = "core-check:latest"),
    ],
    [
      "a short image digest",
      "executor",
      (c: Json) => ((c.executor as Json).image = `sha256:${"e".repeat(63)}`),
    ],
    [
      "an uppercase image digest",
      "executor",
      (c: Json) => ((c.executor as Json).image = `sha256:${"E".repeat(64)}`),
    ],
    [
      "a relative docker executable",
      "executor",
      (c: Json) => ((c.executor as Json).docker = "docker"),
    ],
    ["no owners", "owners", (c: Json) => (c.owners = {})],
    [
      "an uppercase owner alias",
      "owners",
      (c: Json) =>
        (c.owners = {
          Operator: { profile: "/home/admin/.claude", githubLogin: "operator" },
        }),
    ],
    [
      "an owner without a GitHub login",
      "owners",
      (c: Json) =>
        (c.owners = { operator: { profile: "/home/admin/.claude" } }),
    ],
    [
      "an unknown default end state",
      "defaultEndState",
      (c: Json) => (c.defaultEndState = "DONE"),
    ],
  ])("refuses %s", (_label, field, change) => {
    expect(() => validateConfig(withChange(change))).toThrowError(
      new RegExp(`^Invalid factory configuration: ${field}$`),
    );
  });

  // I10: CLI trigger bindings are retired (every start is a signed webhook),
  // so a configuration without them is valid, and an older one that still
  // carries the key keeps validating.
  it("accepts a configuration without the retired trigger bindings", () => {
    const config = withChange((value) => delete value.bindings);
    expect(validateConfig(config)).toBe(config);
  });

  it("still accepts an older configuration that carries the bindings key", () => {
    const config = withChange(
      (value) => (value.bindings = { deliver: "relative" }),
    );
    expect(validateConfig(config)).toBe(config);
  });

  it("names every invalid field in one refusal", () => {
    const config = withChange((value) => {
      delete value.executor;
      value.defaultEndState = "DONE";
    });

    expect(() => validateConfig(config)).toThrowError(
      /^Invalid factory configuration: executor, defaultEndState$/,
    );
  });
});

describe("reviewProviders", () => {
  const coderabbit = {
    login: "coderabbitai[bot]",
    required: false,
    skipMarkers: ["Review skipped"],
  };

  it("defaults to no automated reviewers and passes configured ones through", () => {
    const configured = withChange((value) => {
      value.reviewProviders = [
        coderabbit,
        { login: "codex", required: true, skipMarkers: [] },
      ];
    });
    expect({
      absent: reviewProviders(validateConfig(validConfig())),
      configured: reviewProviders(validateConfig(configured)),
    }).toEqual({
      absent: [],
      configured: [
        coderabbit,
        { login: "codex", required: true, skipMarkers: [] },
      ],
    });
  });

  it.each([
    ["a non-array", { login: "codex" }],
    ["a provider without a login", [{ required: true, skipMarkers: [] }]],
    ["a login with a path", [{ ...coderabbit, login: "../codex" }]],
    ["a non-boolean required flag", [{ ...coderabbit, required: "yes" }]],
    ["missing skip markers", [{ login: "codex", required: true }]],
    ["an empty skip marker", [{ ...coderabbit, skipMarkers: [" "] }]],
  ])("refuses %s", (_label, providers) => {
    expect(() =>
      validateConfig(
        withChange((value) => (value.reviewProviders = providers)),
      ),
    ).toThrowError(/^Invalid factory configuration: reviewProviders$/);
  });
});

describe("factoryPaths", () => {
  it("derives every factory directory beneath the configured root", () => {
    expect(factoryPaths({ root: "/srv/core-factory" })).toEqual({
      root: "/srv/core-factory",
      control: "/srv/core-factory/control",
      mirror: "/srv/core-factory/mirror.git",
      outbox: "/srv/core-factory/outbox.git",
      issues: "/srv/core-factory/issues",
      views: "/srv/core-factory/views",
      runs: "/srv/core-factory/runs",
      cache: "/srv/core-factory/cache",
      locks: "/srv/core-factory/locks",
    });
  });
});

describe("limits", () => {
  it("supplies the documented defaults when the configuration sets none", () => {
    expect(limits({})).toEqual({
      maxRounds: 8,
      maxFeedbackRounds: 12,
      noProgressRepeats: 2,
      checkWaitMs: 600_000,
      transientRetries: 3,
      retryCapMs: 120_000,
    });
  });

  it("lets configured limits override defaults and add their own keys", () => {
    expect(limits({ limits: { maxRounds: 3, heavyCheckSlots: 2 } })).toEqual({
      maxRounds: 3,
      maxFeedbackRounds: 12,
      noProgressRepeats: 2,
      checkWaitMs: 600_000,
      transientRetries: 3,
      retryCapMs: 120_000,
      heavyCheckSlots: 2,
    });
  });
});

describe("loadConfig", () => {
  it("defaults to the trusted control folder path", () => {
    expect(DEFAULT_CONFIG_PATH).toBe(
      "/srv/core-factory/control/core-factory.json",
    );
  });

  it("reads and validates the named file", () => {
    const file = configFile(validConfig());

    expect(loadConfig(file)).toEqual(validConfig());
  });

  it("reads CORE_FACTORY_CONFIG when no file is named", () => {
    const file = configFile(validConfig());
    vi.stubEnv("CORE_FACTORY_CONFIG", file);

    expect(loadConfig()).toEqual(validConfig());
  });

  it("refuses a file whose configuration is invalid", () => {
    const file = configFile(
      withChange((value) => {
        value.version = 0;
      }),
    );

    expect(() => loadConfig(file)).toThrowError(
      /^Invalid factory configuration: version$/,
    );
  });
});
