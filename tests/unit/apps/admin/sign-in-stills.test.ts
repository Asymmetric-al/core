import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  SIGN_IN_FIELD_SHADER,
  SIGN_IN_SHADER_STILL_TIME,
} from "../../../../packages/ui/components/auth/sign-in-shader-source";

interface StillsManifest {
  shaderSha256: string;
  time: number;
  background: { token: string; hex: string };
  stills: { file: string; width: number; height: number; sha256: string }[];
}

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const loginDirectory = path.join(repositoryRoot, "apps/admin/app/(auth)/login");
const manifest = JSON.parse(
  readFileSync(path.join(loginDirectory, "sign-in-stills.json"), "utf8"),
) as StillsManifest;
const REGENERATE =
  "Run `bun scripts/ui/render-sign-in-stills.ts` to recapture.";

function sha256(data: string | Buffer) {
  return createHash("sha256").update(data).digest("hex");
}

function still(file: string) {
  const entry = manifest.stills.find((candidate) => candidate.file === file);
  if (!entry) throw new Error(`${file} is missing from the manifest.`);
  return entry;
}

describe("Mission Control sign-in stills", () => {
  it("were captured from the current shader at the frame the canvas reveals", () => {
    expect(manifest.shaderSha256, REGENERATE).toBe(
      sha256(SIGN_IN_FIELD_SHADER),
    );
    expect(manifest.time, REGENERATE).toBe(SIGN_IN_SHADER_STILL_TIME);
  });

  it("were captured against the current light page colour", () => {
    const css = readFileSync(
      path.join(repositoryRoot, "packages/ui/styles/globals.css"),
      "utf8",
    );
    const lightMuted = /--muted:\s*([^;]+);/.exec(css)?.[1]?.trim();

    expect(manifest.background.token, REGENERATE).toBe(lightMuted);
  });

  it("are the files the manifest describes", () => {
    for (const entry of manifest.stills) {
      const bytes = readFileSync(path.join(loginDirectory, entry.file));
      expect(sha256(bytes), `${entry.file}: ${REGENERATE}`).toBe(entry.sha256);
    }
  });

  it("are framed like the live field for portrait through ultrawide screens", () => {
    const narrow = still("sign-in-still-narrow.webp");
    const wide = still("sign-in-still-wide.webp");

    expect(narrow.width / narrow.height).toBeLessThanOrEqual(3 / 4);
    expect(wide.width / wide.height).toBeGreaterThanOrEqual(32 / 9);
  });
});
