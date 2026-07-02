import { describe, expect, it } from "vitest";

import {
  resolvePublicVercelClientSignals,
  isProductionDeployment,
  isProtectedDeployment,
  isProtectedNonProductionDeployment,
  PROTECTED_TARGET_ENVIRONMENTS,
  resolveDeploymentEnvironment,
} from "../../../../packages/env/src/target-env";

describe("target environment helpers", () => {
  it("falls back to server Vercel vars for public client signals", () => {
    expect(
      resolvePublicVercelClientSignals({
        VERCEL_ENV: "production",
        VERCEL_TARGET_ENV: "production",
      }),
    ).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: "production",
      NEXT_PUBLIC_VERCEL_TARGET_ENV: "production",
    });
    expect(
      resolvePublicVercelClientSignals({
        NEXT_PUBLIC_VERCEL_ENV: "preview",
        VERCEL_ENV: "production",
        VERCEL_TARGET_ENV: "production",
      }),
    ).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: "preview",
      NEXT_PUBLIC_VERCEL_TARGET_ENV: "production",
    });
  });


  it("keeps the protected target allowlist in one canonical set", () => {
    expect([...PROTECTED_TARGET_ENVIRONMENTS]).toEqual([
      "production",
      "core-development",
      "staging",
    ]);
    expect(PROTECTED_TARGET_ENVIRONMENTS.has("development")).toBe(false);
  });

  it.each([
    {
      env: { VERCEL_ENV: "production", VERCEL_TARGET_ENV: "production" },
      label: "production",
      protectedDeployment: true,
      protectedNonProduction: false,
    },
    {
      env: { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "core-development" },
      label: "core-development",
      protectedDeployment: true,
      protectedNonProduction: true,
    },
    {
      env: { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: " staging " },
      label: "staging",
      protectedDeployment: true,
      protectedNonProduction: true,
    },
    {
      env: { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "preview" },
      label: "preview",
      protectedDeployment: false,
      protectedNonProduction: false,
    },
    {
      env: { VERCEL_ENV: "development", VERCEL_TARGET_ENV: "development" },
      label: "development",
      protectedDeployment: false,
      protectedNonProduction: false,
    },
    {
      env: {},
      label: "local",
      protectedDeployment: false,
      protectedNonProduction: false,
    },
  ])(
    "classifies $label deployments consistently",
    ({ env, label, protectedDeployment, protectedNonProduction }) => {
      expect(resolveDeploymentEnvironment(env)).toBe(label);
      expect(isProtectedDeployment(env)).toBe(protectedDeployment);
      expect(isProtectedNonProductionDeployment(env)).toBe(
        protectedNonProduction,
      );
    },
  );

  it("treats production as production when either Vercel signal says production", () => {
    expect(
      isProductionDeployment({
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "production",
      }),
    ).toBe(true);
    expect(
      isProtectedDeployment({
        VERCEL_ENV: "production",
        VERCEL_TARGET_ENV: "preview",
      }),
    ).toBe(true);
  });

  it("falls back to VERCEL_ENV for unknown custom targets", () => {
    expect(
      resolveDeploymentEnvironment({
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "qa-sandbox",
      }),
    ).toBe("preview");
    expect(
      isProtectedDeployment({
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "qa-sandbox",
      }),
    ).toBe(false);
  });
});
