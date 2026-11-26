import net from "node:net";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { PostgresAdapter } from "@payloadcms/db-postgres";
import type { Payload } from "payload";

let payload: Payload;
let tables: PostgresAdapter["rawTables"];
const connect = vi.spyOn(net.Socket.prototype, "connect");
const fetch = vi.spyOn(globalThis, "fetch");

beforeAll(async () => {
  connect.mockImplementation(() => {
    throw new Error("Schema qualification must not open a connection");
  });
  fetch.mockImplementation(() => {
    throw new Error("Schema qualification must not make an HTTP request");
  });
  vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("RESEND_API_KEY", undefined);
  const [{ getPayload }, { default: configured }] = await Promise.all([
    import("../../../apps/admin/node_modules/payload/dist/index.js"),
    import("../../../apps/admin/payload.config"),
  ]);
  payload = await getPayload({
    config: { ...(await configured), telemetry: false },
    disableDBConnect: true,
  });
  tables = (payload.db as PostgresAdapter).rawTables;
}, 30_000);

afterAll(async () => {
  await payload?.destroy();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Payload PostgreSQL schema", () => {
  it("keeps every generated identifier within PostgreSQL's 63-byte limit", () => {
    const overlong: string[] = [];
    for (const [name, table] of Object.entries(tables)) {
      const identifiers = [
        name,
        ...Object.values(table.columns).map((column) => column.name),
        ...Object.values(table.indexes).map((index) => index.name),
        ...Object.values(table.foreignKeys).map((key) => key.name),
      ];
      overlong.push(
        ...identifiers.filter(
          (identifier) => Buffer.byteLength(identifier, "utf8") > 63,
        ),
      );
    }
    expect(overlong).toEqual([]);
    expect(connect).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps layout blocks in one JSON column, so no block or block-item table exists (D-18: WP6 part 2b sets blocksAsJSON, index 3)", () => {
    expect(
      Object.keys(tables).filter(
        (name) => name.includes("blocks") || name.includes("impact"),
      ),
    ).toEqual([]);
    expect(
      Object.values(tables.pages!.columns).map(({ name }) => name),
    ).toContain("layout");
    expect(
      Object.values(tables._pages_v!.columns).map(({ name }) => name),
    ).toContain("version_layout");
  });
});
