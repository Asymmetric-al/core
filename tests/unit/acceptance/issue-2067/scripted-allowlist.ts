/**
 * Shared `node:fs` / `node:fs/promises` mock factories that serve scripted
 * text for docs/ops/document-cutover/allowlist.json, so a suite can run the
 * command against a populated allowlist without writing one to the repo.
 * Same contract as ./allowlist-schema.acceptance.test.ts: the command reads
 * the allowlist through node:fs during each run.
 *
 *   vi.mock("node:fs", async (importOriginal) =>
 *     (await import("./scripted-allowlist")).mockFs(await importOriginal()),
 *   );
 *   vi.mock("node:fs/promises", async (importOriginal) =>
 *     (await import("./scripted-allowlist")).mockFsPromises(await importOriginal()),
 *   );
 *
 * This module must not import node:fs itself.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

export const scriptedAllowlist = {
  suffix: "docs/ops/document-cutover/allowlist.json",
  text: null as string | null,
};

function isScripted(target: unknown): boolean {
  if (scriptedAllowlist.text === null) return false;
  const value = target instanceof URL ? target.pathname : String(target ?? "");
  return value.replaceAll("\\", "/").endsWith(scriptedAllowlist.suffix);
}

function encodeAs(text: string, options: unknown): string | Buffer {
  const encoding =
    typeof options === "string"
      ? options
      : (options as { encoding?: string } | undefined)?.encoding;
  return encoding ? text : Buffer.from(text, "utf8");
}

export function mockFs(
  actual: Record<string, unknown>,
): Record<string, unknown> {
  const existsSync = actual.existsSync as (target: unknown) => boolean;
  const readFileSync = actual.readFileSync as (...args: unknown[]) => unknown;
  const wrapped: Record<string, unknown> = {
    ...actual,
    existsSync: (target: unknown) => isScripted(target) || existsSync(target),
    readFileSync: (target: unknown, options?: unknown) =>
      isScripted(target)
        ? encodeAs(scriptedAllowlist.text as string, options)
        : readFileSync(target, options),
  };
  return { ...wrapped, default: wrapped };
}

export function mockFsPromises(
  actual: Record<string, unknown>,
): Record<string, unknown> {
  const readFile = actual.readFile as (...args: unknown[]) => Promise<unknown>;
  const wrapped: Record<string, unknown> = {
    ...actual,
    readFile: async (target: unknown, options?: unknown) =>
      isScripted(target)
        ? encodeAs(scriptedAllowlist.text as string, options)
        : readFile(target, options),
  };
  return { ...wrapped, default: wrapped };
}
