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

  it("preserves all seven unaffected impact-stat item table identities", () => {
    expect(
      Object.keys(tables)
        .filter((name) => name.includes("impact_stats_items"))
        .sort(),
    ).toEqual([
      "_page_templates_v_blocks_impact_stats_items",
      "_pages_v_blocks_impact_stats_items",
      "_project_pages_v_blocks_impact_stats_items",
      "missionary_giving_pages_blocks_impact_stats_items",
      "page_templates_blocks_impact_stats_items",
      "pages_blocks_impact_stats_items",
      "project_pages_blocks_impact_stats_items",
    ]);
    expect(tables).toHaveProperty("_mgp_impact_items_v");
  });
});
