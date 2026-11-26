import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const read = (file: string) =>
  readFileSync(path.join(process.cwd(), file), "utf8");

async function parseEnvWith(overrides: Record<string, string>) {
  vi.resetModules();
  vi.stubEnv("SKIP_ENV_VALIDATION", "");
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("VERCEL_TARGET_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("FRONT_ADMIN_ORIGIN", "");
  vi.stubEnv("FRONT_MISSIONARY_ORIGIN", "");
  vi.stubEnv("OPERATIONS_NAMES", "");
  for (const [key, value] of Object.entries(overrides)) {
    vi.stubEnv(key, value);
  }
  return import("../../../../packages/env/src/schema");
}

describe("AL-2675 WP2c part 2a, T7: OPERATIONS_NAMES in the @asym/env schema", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("declares OPERATIONS_NAMES on the server beside FRONT_NAMES, refined by the shared parser, and never NEXT_PUBLIC_", () => {
    const source = read("packages/env/src/schema.ts");
    expect(source).toMatch(
      /OPERATIONS_NAMES: z\s*\.string\(\)\s*\.refine\(\s*isValidOperationsNamesEnv,/,
    );
    expect(source).toContain(
      '"OPERATIONS_NAMES must be a comma-separated list of bare host[:port] entries."',
    );
    expect(source).toContain("OPERATIONS_NAMES: process.env.OPERATIONS_NAMES,");
    expect(source).not.toContain("NEXT_PUBLIC_OPERATIONS_NAMES");
    expect(source).toMatch(
      /import \{ isValidOperationsNamesEnv \} from "\.\/operations-names";/,
    );
    const server = source.slice(
      source.indexOf("server: {"),
      source.indexOf("client: {"),
    );
    expect(server).toContain("OPERATIONS_NAMES:");
    expect(server.indexOf("OPERATIONS_NAMES:")).toBeGreaterThan(
      server.indexOf("FRONT_NAMES:"),
    );
  });

  it("is read at run time only: no build hash names it", () => {
    for (const file of [
      "turbo.json",
      "apps/admin/turbo.json",
      "apps/donor/turbo.json",
      "apps/missionary/turbo.json",
    ]) {
      let text = "";
      try {
        text = read(file);
      } catch {
        continue;
      }
      expect(text, file).not.toContain("OPERATIONS_NAMES");
    }
  });

  it("exports the one parser from @asym/env", () => {
    const manifest = JSON.parse(read("packages/env/package.json")) as {
      exports: Record<string, string>;
    };
    expect(manifest.exports["./operations-names"]).toBe(
      "./src/operations-names.ts",
    );
  });

  it.each([
    "ops.example",
    "ops.example:8443",
    "localhost:3130",
    "a.example,b.example",
  ])("accepts %s at start-up", async (value) => {
    const mod = await parseEnvWith({ OPERATIONS_NAMES: value });
    expect(mod.serverEnv.OPERATIONS_NAMES).toBe(value);
  });

  it("treats an empty value as unset", async () => {
    const mod = await parseEnvWith({ OPERATIONS_NAMES: "" });
    expect(mod.serverEnv.OPERATIONS_NAMES).toBeUndefined();
  });

  it.each([
    "https://ops.example",
    "ops.example/x",
    "*.example",
    "ops..example",
    "ops.example.",
    "a.example,",
  ])("refuses %s at start-up", async (value) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(parseEnvWith({ OPERATIONS_NAMES: value })).rejects.toThrow();
  });
});
