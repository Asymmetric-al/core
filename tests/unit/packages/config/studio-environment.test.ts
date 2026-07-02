import { describe, expect, it } from "vitest";

import { resolveStudioEnvironment } from "../../../../packages/config/studio-environment";

describe("studio environment", () => {
  it.each([
    {
      env: {
        NEXT_PUBLIC_VERCEL_ENV: "production",
        NEXT_PUBLIC_VERCEL_TARGET_ENV: "production",
      },
      studioEnvironment: "production",
    },
    {
      env: {
        NEXT_PUBLIC_VERCEL_ENV: "preview",
        NEXT_PUBLIC_VERCEL_TARGET_ENV: "core-development",
      },
      studioEnvironment: "development",
    },
    {
      env: {
        NEXT_PUBLIC_VERCEL_ENV: "preview",
        NEXT_PUBLIC_VERCEL_TARGET_ENV: "staging",
      },
      studioEnvironment: "development",
    },
    {
      env: {
        NEXT_PUBLIC_VERCEL_ENV: "preview",
        NEXT_PUBLIC_VERCEL_TARGET_ENV: "preview",
      },
      studioEnvironment: "development",
    },
    {
      env: {
        NEXT_PUBLIC_VERCEL_ENV: "development",
        NEXT_PUBLIC_VERCEL_TARGET_ENV: "development",
      },
      studioEnvironment: "development",
    },
    {
      env: {},
      studioEnvironment: "development",
    },
  ])(
    "maps $env.NEXT_PUBLIC_VERCEL_TARGET_ENV to $studioEnvironment",
    ({ env, studioEnvironment }) => {
      expect(resolveStudioEnvironment(env)).toBe(studioEnvironment);
    },
  );
});
