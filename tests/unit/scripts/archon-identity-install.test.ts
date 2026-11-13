import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  policySwitch,
  systemdUnits,
} from "../../../scripts/archon-factory/installation/install-logic.mjs";

import { joinWrappedStatements } from "./support/source-statements";

const installer = joinWrappedStatements(
  readFileSync(
    new URL(
      "../../../scripts/archon-factory/installation/install.mjs",
      import.meta.url,
    ),
    "utf8",
  ),
);

describe("installed native launcher binding", () => {
  it("routes both provider configuration scopes through the root-owned installed launcher", () => {
    expect(installer).toContain(
      "controlFiles({ node: NODE, claude: claudeLauncher, runtime })",
    );
    expect(installer).toContain("archonHomeConfig({ claude: claudeLauncher })");
    expect(installer).toContain("own(claudeLauncher, ROOT_ID, ROOT_ID, 0o755)");
    expect(installer).toContain(
      'identityModule: posix.join(release, "pack", ".shared", "identity.mjs")',
    );
  });

  it("records actual binary separately from launcher and hashes account status before layout", () => {
    expect(installer).toContain(
      "claudeBinary: CLAUDE, claudeBinarySha256: PIN.claude",
    );
    expect(installer).toContain(
      "claudeLauncher: { path: claudeLauncher, sha256: fileSha(claudeLauncher) }",
    );
    const preflight = installer.slice(0, installer.indexOf("// --- Layout"));
    expect(preflight).toContain('[CLAUDE, "auth", "status", "--json"]');
    expect(preflight).toContain(
      "nativeAccountDigest(JSON.parse(status.stdout), serviceIdentity.profile)",
    );
    expect(preflight).not.toMatch(/tail\(status|log\([^\n]*status\./);
  });

  it("treats changed launcher bytes as a policy switch", () => {
    const previous = {
      policyRevision: "a".repeat(64),
      settingsDigest: "b".repeat(64),
      claudeLauncher: {
        path: "/opt/factory/native-claude",
        sha256: "c".repeat(64),
      },
    };
    expect(
      policySwitch(previous, {
        ...previous,
        claudeLauncher: { ...previous.claudeLauncher, sha256: "d".repeat(64) },
      }),
    ).toBe(true);
    expect(policySwitch(previous, { ...previous })).toBe(false);
  });

  it("removes binary and auth overrides before the provider resolver runs", () => {
    const units = systemdUnits({
      archon: "/opt/archon",
      node: "/opt/node",
      root: "/srv/factory",
      control: "/srv/factory/control",
      runtime: "/opt/runtime",
      backupScript: "/opt/backup",
      port: 3190,
      hostId: "fixture",
      environment: [],
    });
    const line = units["core-archon.service"]
      .split("\n")
      .find((value: string) => value.startsWith("UnsetEnvironment="));
    expect(line).toBeDefined();
    for (const key of [
      "CLAUDE_BIN_PATH",
      "ANTHROPIC_API_KEY",
      "ANTHROPIC_AUTH_TOKEN",
      "ANTHROPIC_BASE_URL",
      "CLAUDE_CODE_OAUTH_TOKEN",
      "NODE_OPTIONS",
      "BUN_OPTIONS",
    ])
      expect(line?.split(/[= ]/)).toContain(key);
  });
});
