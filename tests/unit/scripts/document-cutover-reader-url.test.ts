/**
 * #2067 PR #2169 MAJOR-1, Builder-owned: the reader URL is the only
 * connection source, proven with the REAL `pg` driver (not the acceptance
 * fake). Two local TCP listeners stand in for databases: one named by
 * DOCUMENT_CUTOVER_DATABASE_URL, one named by PGHOST/PGPORT. The gate must
 * only ever reach the URL's listener, and must leave process.env as it was.
 */

import { createServer } from "node:net";

import { afterEach, describe, expect, it, vi } from "vitest";

import { InMemoryDocumentCutoverProofStore } from "../../../packages/api/src/document-cutover";
import { runDocumentCutoverCommand } from "../../../scripts/document-cutover/assess-document-cutover";

/** Obviously fake, built at runtime; never a real credential. */
const PASSWORD = ["reader", "url", "2067", "not", "a", "pw"].join("-");

type Listener = {
  port: number;
  accepted: () => number;
  close: () => Promise<void>;
};

async function listener(): Promise<Listener> {
  let accepted = 0;
  const server = createServer((socket) => {
    accepted += 1;
    socket.destroy();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    port: (server.address() as { port: number }).port,
    accepted: () => accepted,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

let output: string[] = [];
const savedEnv = { ...process.env };

afterEach(() => {
  vi.restoreAllMocks();
  for (const key of Object.keys(process.env)) {
    if (!(key in savedEnv)) delete process.env[key];
  }
  Object.assign(process.env, savedEnv);
});

function captureOutput() {
  output = [];
  const capture = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
}

async function runAssessOnly(databaseUrl: string): Promise<number> {
  return runDocumentCutoverCommand({
    argv: [],
    env: {
      SUPABASE_URL: "http://127.0.0.1:54321",
      DOCUMENT_CUTOVER_DATABASE_URL: databaseUrl,
    },
    store: new InMemoryDocumentCutoverProofStore(),
  });
}

describe("#2067 MAJOR-1 — the real pg driver only uses the reader URL", () => {
  it("connects to the URL's host and port even when PGHOST/PGPORT/PGUSER/PGOPTIONS name another server, and restores process.env", async () => {
    const urlTarget = await listener();
    const decoy = await listener();
    try {
      process.env.PGHOST = "127.0.0.1";
      process.env.PGPORT = String(decoy.port);
      process.env.PGUSER = "postgres";
      process.env.PGOPTIONS = "-c role=postgres";
      const envBefore = { ...process.env };
      captureOutput();

      const exitCode = await runAssessOnly(
        `postgresql://document_cutover_reader:${PASSWORD}@127.0.0.1:${urlTarget.port}/postgres`,
      );

      expect(exitCode).toBe(1);
      expect(urlTarget.accepted()).toBeGreaterThan(0);
      expect(decoy.accepted()).toBe(0);
      expect(output.join("\n")).toMatch(/STOP THE LINE/);
      expect({ ...process.env }).toEqual(envBefore);
    } finally {
      await urlTarget.close();
      await decoy.close();
    }
  }, 30_000);

  it.each([
    [
      "no port (port only in the query)",
      (port: number) => `127.0.0.1/postgres?port=${port}`,
    ],
    ["no database", (port: number) => `127.0.0.1:${port}`],
    [
      "a query parameter other than sslmode",
      (port: number) => `127.0.0.1:${port}/postgres?application_name=x`,
    ],
  ])(
    "a URL with %s is refused before any connection, while PGPORT names a live server",
    async (_label, rest) => {
      const decoy = await listener();
      try {
        process.env.PGPORT = String(decoy.port);
        process.env.PGDATABASE = "postgres";
        captureOutput();

        const exitCode = await runAssessOnly(
          `postgresql://document_cutover_reader:${PASSWORD}@${rest(decoy.port)}`,
        );

        expect(exitCode).toBe(1);
        expect(decoy.accepted()).toBe(0);
        expect(output.join("\n")).toMatch(/DOCUMENT_CUTOVER_DATABASE_URL/);
      } finally {
        await decoy.close();
      }
    },
  );
});
