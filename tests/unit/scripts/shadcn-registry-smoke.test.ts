import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildRegistrySmokePlan,
  collectEnvRefs,
  shadcnViewSpawnSpec,
} from "../../../scripts/verify/shadcn-registry-smoke.mjs";

describe("shadcn registry smoke helpers", () => {
  it("previews UI Kit with the API key forwarded by the private launcher", () => {
    const config = JSON.parse(
      readFileSync(
        new URL("../../../packages/ui/components.json", import.meta.url),
        "utf8",
      ),
    );
    expect(
      buildRegistrySmokePlan({
        registries: { "@shadcnuikit": config.registries["@shadcnuikit"] },
        env: { SHADCNUIKIT_API_KEY: "test-key" },
      }),
    ).toEqual([
      {
        namespace: "@shadcnuikit",
        status: "attempt",
        item: "@shadcnuikit/button1",
        requiredEnvVars: ["SHADCNUIKIT_API_KEY"],
      },
    ]);
  });

  it("requires the ReUI license before previewing a paid block", () => {
    const config = JSON.parse(
      readFileSync(
        new URL("../../../packages/ui/components.json", import.meta.url),
        "utf8",
      ),
    );
    const input = {
      registries: { "@reui": config.registries["@reui"] },
      canaries: { "@reui": "settings-2" },
    };
    expect(buildRegistrySmokePlan({ ...input, env: {} })).toEqual([
      {
        namespace: "@reui",
        status: "skip",
        reason: "missing env REUI_LICENSE_KEY",
        requiredEnvVars: ["REUI_LICENSE_KEY"],
      },
    ]);
    expect(
      buildRegistrySmokePlan({
        ...input,
        env: { REUI_LICENSE_KEY: "test-license" },
      }),
    ).toEqual([
      {
        namespace: "@reui",
        status: "attempt",
        item: "@reui/settings-2",
        requiredEnvVars: ["REUI_LICENSE_KEY"],
      },
    ]);
  });

  it("can preview Blocks with the supplied credential and Base UI style URL", () => {
    const config = JSON.parse(
      readFileSync(
        new URL("../../../packages/ui/components.json", import.meta.url),
        "utf8",
      ),
    );
    const registry = config.registries["@shadcnblocks"];
    expect(registry).toBeDefined();
    expect(registry.url).toBe("https://www.shadcnblocks.com/r/{style}/{name}");
    expect(
      buildRegistrySmokePlan({
        registries: { "@shadcnblocks": registry },
        env: { SHADCNBLOCKS_API_KEY: "test-token" },
        canaries: { "@shadcnblocks": "hero1" },
      }),
    ).toEqual([
      {
        namespace: "@shadcnblocks",
        status: "attempt",
        item: "@shadcnblocks/hero1",
        requiredEnvVars: ["SHADCNBLOCKS_API_KEY"],
      },
    ]);
  });

  it("uses the private launcher's Studio credential names for a paid preview", () => {
    const config = JSON.parse(
      readFileSync(
        new URL("../../../packages/ui/components.json", import.meta.url),
        "utf8",
      ),
    );
    const plan = buildRegistrySmokePlan({
      registries: { "@ss-blocks": config.registries["@ss-blocks"] },
      env: {
        SHADCN_STUDIO_EMAIL: "owner@example.test",
        SHADCN_STUDIO_LICENSE_KEY: "test-license",
      },
    });

    expect(plan).toEqual([
      {
        namespace: "@ss-blocks",
        status: "attempt",
        item: "@ss-blocks/hero-section-09",
        requiredEnvVars: ["SHADCN_STUDIO_EMAIL", "SHADCN_STUDIO_LICENSE_KEY"],
      },
    ]);
    expect(config.registries["@ss-blocks"].url).toBe(
      "https://shadcnstudio.com/r/blocks/{style}/{name}.json",
    );
  });

  it("extracts env placeholders from nested registry config", () => {
    expect(
      collectEnvRefs({
        url: "https://example.test/r/{name}.json",
        params: {
          email: "${EMAIL}",
          license_key: "${LICENSE_KEY}",
        },
        headers: {
          Authorization: "Bearer ${REGISTRY_TOKEN}",
        },
      }),
    ).toEqual(["EMAIL", "LICENSE_KEY", "REGISTRY_TOKEN"]);
  });

  it("extracts mixed-case env placeholders so private checks skip safely", () => {
    expect(
      collectEnvRefs({
        headers: {
          Authorization: "Bearer ${registryToken}",
        },
        params: {
          tenant: "${Registry_Tenant_1}",
        },
      }),
    ).toEqual(["Registry_Tenant_1", "registryToken"]);
  });

  it("skips private registries when required env vars are missing", () => {
    const plan = buildRegistrySmokePlan({
      registries: {
        "@shadcnuikit": {
          url: "https://shadcnuikit.com/r/{name}.json",
          headers: {
            Authorization: "Bearer ${REGISTRY_TOKEN}",
          },
        },
      },
      env: {},
    });

    expect(plan).toEqual([
      {
        namespace: "@shadcnuikit",
        status: "skip",
        reason: "missing env REGISTRY_TOKEN",
        requiredEnvVars: ["REGISTRY_TOKEN"],
      },
    ]);
  });

  it("attempts configured canaries only when private registry env exists", () => {
    const plan = buildRegistrySmokePlan({
      registries: {
        "@shadcnuikit": {
          url: "https://shadcnuikit.com/r/{name}.json",
          headers: {
            Authorization: "Bearer ${REGISTRY_TOKEN}",
          },
        },
      },
      env: {
        REGISTRY_TOKEN: "test-token",
      },
    });

    expect(plan).toEqual([
      {
        namespace: "@shadcnuikit",
        status: "attempt",
        item: "@shadcnuikit/button1",
        requiredEnvVars: ["REGISTRY_TOKEN"],
      },
    ]);
  });

  it("skips known registries that do not have a safe canary configured", () => {
    const plan = buildRegistrySmokePlan({
      registries: {
        "@efferd": {
          url: "https://efferd.com/r/{style}/{name}.json",
          headers: {
            Authorization: "Bearer ${EFFERD_REGISTRY_TOKEN}",
          },
        },
      },
      env: {
        EFFERD_REGISTRY_TOKEN: "test-token",
      },
    });

    expect(plan).toEqual([
      {
        namespace: "@efferd",
        status: "skip",
        reason: "no canary configured",
        requiredEnvVars: ["EFFERD_REGISTRY_TOKEN"],
      },
    ]);
  });

  it("uses cmd.exe on Windows to launch read-only npx CLI checks", () => {
    expect(
      shadcnViewSpawnSpec("button", {
        platform: "win32",
        comspec: "cmd.exe",
      }),
    ).toEqual({
      command: "cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "npx --yes shadcn@latest view button --cwd packages/ui",
      ],
    });
    expect(
      shadcnViewSpawnSpec("button", {
        platform: "linux",
        comspec: "cmd.exe",
      }),
    ).toEqual({
      command: "npx",
      args: [
        "--yes",
        "shadcn@latest",
        "view",
        "button",
        "--cwd",
        "packages/ui",
      ],
    });
  });
});
