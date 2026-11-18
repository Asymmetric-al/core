import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildLocalEnvValues,
  parseSupabaseStatusOutput,
  writeLocalEnv,
} from "../../../scripts/cms/lib/env.mjs";
import {
  DEMO_PUBLIC_TENANT_SLUG,
  LOCAL_DATABASE_URL,
  createLexicalRichText,
  createLocalPageLayout,
} from "../../../scripts/cms/lib/local-data.mjs";
import {
  assertPayloadRuntimeRequirements,
  compareNodeVersions,
  isPayloadV4Version,
  PAYLOAD_V4_NODE_RANGE,
  parseNodeVersion,
} from "../../../scripts/cms/lib/payload-runtime.mjs";

function readEnvValue(filePath: string, key: string) {
  const line = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`${key}=`));

  return line?.slice(key.length + 1);
}

describe("local CMS setup scripts", () => {
  it("guards Payload 4 CMS commands behind the required Node runtime", () => {
    expect(parseNodeVersion("v24.22.3")).toEqual({
      major: 24,
      minor: 22,
      patch: 3,
    });
    expect(compareNodeVersions("24.22.3", "24.22.2")).toBe(1);
    expect(compareNodeVersions("24.22.3", "24.22.3")).toBe(0);
    expect(compareNodeVersions("24.15.0", "24.22.3")).toBe(-1);
    expect(isPayloadV4Version("4.0.0-beta.9")).toBe(true);
    expect(isPayloadV4Version("^3.84.1")).toBe(false);

    for (const nodeVersion of [
      "24.15.0",
      "24.22.1",
      "24.22.2",
      "25.9.0",
      "26.0.0",
      "26.13.0",
      "22.22.2",
    ]) {
      expect(
        () =>
          assertPayloadRuntimeRequirements({
            nodeVersion,
            payloadVersion: "4.0.0-beta.9",
          }),
        nodeVersion,
      ).toThrow(/requires Node\.js \^24\.22\.3 \|\| >=26\.13\.1/);
    }

    for (const nodeVersion of ["24.22.3", "24.23.0", "26.13.1", "27.0.0"]) {
      expect(
        () =>
          assertPayloadRuntimeRequirements({
            nodeVersion,
            payloadVersion: "4.0.0-beta.9",
          }),
        nodeVersion,
      ).not.toThrow();
    }
    expect(() =>
      assertPayloadRuntimeRequirements({
        nodeVersion: "24.11.1",
        payloadVersion: "^3.84.1",
      }),
    ).not.toThrow();
  });

  it("encodes the Node range that the installed Payload declares", () => {
    const payloadManifest = JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          "apps",
          "admin",
          "node_modules",
          "payload",
          "package.json",
        ),
        "utf8",
      ),
    );
    expect(payloadManifest.engines.node).toBe(PAYLOAD_V4_NODE_RANGE);
  });

  it("parses Supabase status env output for local key repair", () => {
    const parsed = parseSupabaseStatusOutput(`
      API URL: http://127.0.0.1:54321
      DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      anon key: local-anon
      service_role key: local-service
    `);

    const values = buildLocalEnvValues(parsed);

    expect(values.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
    expect(values.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("local-anon");
    expect(values.SUPABASE_SERVICE_ROLE_KEY).toBe("local-service");
    expect(values.PAYLOAD_DATABASE_URI).toBe(LOCAL_DATABASE_URL);
    expect(values.CMS_LOCAL_DEFAULT_TENANT_SLUG).toBe(DEMO_PUBLIC_TENANT_SLUG);
  });

  it("repairs placeholders without overwriting non-empty local values", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cms-local-env-"));
    const envPath = path.join(tempDir, ".env.local");
    fs.writeFileSync(
      envPath,
      [
        "PAYLOAD_SECRET=custom-payload-secret",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key",
      ].join("\n"),
    );

    const result = writeLocalEnv({
      filePath: envPath,
      statusEnv: {
        ANON_KEY: "local-anon",
        SERVICE_ROLE_KEY: "local-service",
      },
    });

    expect(result.preserved).toContain("PAYLOAD_SECRET");
    expect(result.updated).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(readEnvValue(envPath, "PAYLOAD_SECRET")).toBe(
      "custom-payload-secret",
    );
    expect(readEnvValue(envPath, "NEXT_PUBLIC_SUPABASE_ANON_KEY")).toBe(
      "local-anon",
    );
    expect(readEnvValue(envPath, "SUPABASE_SERVICE_ROLE_KEY")).toBe(
      "local-service",
    );
  });

  it("builds valid local Lexical and layout seed payloads", () => {
    const richText = createLexicalRichText("Local content");
    const layout = createLocalPageLayout({
      headline: "Local CMS Home",
      mediaId: "media_1",
      variant: "standard",
    });

    expect(richText.root.type).toBe("root");
    expect(richText.root.children[0]?.type).toBe("paragraph");
    expect(layout.map((block) => block.blockType)).toEqual([
      "hero",
      "rich-text",
      "call-to-action",
      "impact-stats",
    ]);
    expect(layout[0]).toMatchObject({
      blockType: "hero",
      backgroundImage: "media_1",
    });
  });
});
