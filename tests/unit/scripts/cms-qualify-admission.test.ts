/**
 * PR #2714 review (local database admission, step 4): Payload qualification
 * creates and drops databases as a superuser, so it decides on the URL its
 * first client connects with and refuses anything the repository's one
 * local-database decision does not admit before any client is constructed.
 * `pg` is replaced by a stand-in that records every client and never connects.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ constructed: [] as unknown[] }));

vi.mock("pg", () => {
  class Client {
    constructor(config: unknown) {
      mocks.constructed.push(config);
    }
    async connect() {
      throw new Error("stand-in client: no database here");
    }
    async query() {
      throw new Error("stand-in client: no database here");
    }
    async end() {}
  }
  return { default: { Client }, Client };
});

afterEach(() => {
  mocks.constructed.length = 0;
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function qualify(adminUrl: string) {
  vi.stubEnv("PAYLOAD_QUALIFICATION_ADMIN_URL", adminUrl);
  const { main } = await import("../../../scripts/cms/qualify-payload-pin.mjs");
  return main(["--database=r4_never_created"]);
}

describe("Payload qualification admission", () => {
  it.each([
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres?host=db.example.supabase.co",
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres?hostaddr=203.0.113.9",
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres?user=postgres.abcdefghijklmnopqrst",
    "postgresql://postgres:postgres@localhost:5432/postgres?port=6543",
    "postgresql://postgres:postgres@[::1]:5432/postgres?service=hosted",
    "postgresql://postgres:postgres@127.0.0.2:5432/postgres",
    "http://127.0.0.1:5432/postgres",
  ])("refuses %s before any client is constructed", async (url) => {
    await expect(qualify(url)).rejects.toThrow(
      /only against a database on this machine/,
    );
    expect(mocks.constructed).toEqual([]);
  });

  it("opens its first client with exactly the URL it admitted", async () => {
    const url = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
    await expect(qualify(url)).rejects.toThrow("no database here");
    expect(mocks.constructed).toEqual([{ connectionString: url }]);
  });
});
