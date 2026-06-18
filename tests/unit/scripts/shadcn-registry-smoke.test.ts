import { describe, expect, it } from "vitest";

import {
  buildRegistrySmokePlan,
  collectEnvRefs,
  shadcnViewSpawnSpec,
} from "../../../scripts/verify/shadcn-registry-smoke.mjs";

describe("shadcn registry smoke helpers", () => {
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
