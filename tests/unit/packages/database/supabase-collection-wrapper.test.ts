import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { z } from "../../../../packages/database/node_modules/zod";

import {
  defineSupabaseCollection,
  resolveSupabaseCollectionRealtime,
} from "../../../../packages/database/collections/supabase-collection";

const wrapperPath = fileURLToPath(
  new URL(
    "../../../../packages/database/collections/supabase-collection.ts",
    import.meta.url,
  ),
);

describe("Supabase collection wrapper", () => {
  const messageSchema = z.object({
    tenant_id: z.string().uuid(),
    id: z.string().min(1),
    body: z.string(),
  });

  it("defaults browser-visible collections to realtime", () => {
    const collection = defineSupabaseCollection({
      tableName: "support_messages",
      schema: messageSchema,
      keys: ["tenant_id", "id"],
    });

    expect(collection.metadata).toEqual({
      kind: "supabase-table",
      tableName: "support_messages",
      keys: ["tenant_id", "id"],
      realtime: true,
    });
  });

  it("allows realtime to be disabled with a documented reason", () => {
    const realtime = resolveSupabaseCollectionRealtime({
      enabled: false,
      reason: "Large payloads are read through a server report endpoint.",
    });

    expect(realtime).toEqual({
      enabled: false,
      reason: "Large payloads are read through a server report endpoint.",
    });
  });

  it("keeps raw Supabase SDK imports out of the wrapper source", () => {
    const source = readFileSync(wrapperPath, "utf8");

    expect(source).not.toContain('from "@supabase/supabase-js"');
    expect(source).not.toContain("from '@supabase/supabase-js'");
  });

  it("types collection keys from the schema output", () => {
    defineSupabaseCollection({
      tableName: "support_messages",
      schema: messageSchema,
      keys: ["tenant_id", "id"],
    });

    defineSupabaseCollection({
      tableName: "support_messages",
      schema: messageSchema,
      // @ts-expect-error keys must exist on the row schema
      keys: ["missing_column"],
    });
  });
});
