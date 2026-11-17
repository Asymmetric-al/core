/**
 * Council round 2, A7a (plan 7.2, 7.3): the REST and GraphQL routes call
 * Payload's handlers directly, so they never passed the configuration
 * refusal that `get-payload.ts` and the Payload layout run. The refusal now
 * sits in the database adapter's `init`, which every path that starts Payload
 * goes through, before it connects.
 *
 * Each case loads the two route modules as Next.js does, with a protected
 * deployment's environment whose database connection names a local listener.
 * A connection that reaches the listener means Payload tried to use the
 * refused configuration.
 */
import net from "node:net";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@payload-config", () => import("../../../apps/admin/payload.config"));

type Listener = { port: number; connections: () => number; close: () => void };

async function listen(): Promise<Listener> {
  let connections = 0;
  const sockets = new Set<net.Socket>();
  const server = net.createServer((socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    port: (server.address() as net.AddressInfo).port,
    connections: () => connections,
    close: () => {
      for (const socket of sockets) socket.destroy();
      server.close();
    },
  };
}

let listener: Listener | undefined;
afterEach(() => {
  listener?.close();
  listener = undefined;
  vi.unstubAllEnvs();
  vi.resetModules();
});

/** The two route modules, loaded afresh under a protected deployment's environment. */
async function loadRoutes(env: Record<string, string>) {
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("RESEND_API_KEY", undefined);
  vi.stubEnv("SUPABASE_DB_URL", undefined);
  vi.stubEnv("PAYLOAD_MIGRATION_DATABASE_URI", undefined);
  vi.stubEnv("PAYLOAD_SECRET", "route-guard-test-secret");
  vi.stubEnv("VERCEL_ENV", "production");
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  const rest =
    await import("../../../apps/admin/app/(payload)/api/[...slug]/route");
  const graphql =
    await import("../../../apps/admin/app/(payload)/api/graphql/route");
  return { rest, graphql };
}

const local = (user: string) =>
  `postgresql://${user}:route-guard-password@127.0.0.1:${listener!.port}/postgres`;

describe("Payload's REST and GraphQL routes refuse a database configuration a protected deployment must not use", () => {
  it.each<[string, (url: (user: string) => string) => Record<string, string>]>([
    [
      "the CMS migration connection in the runtime",
      (url) => ({
        PAYLOAD_DATABASE_URI: url("cms_runtime"),
        PAYLOAD_MIGRATION_DATABASE_URI: url("cms_owner"),
      }),
    ],
    ["a postgres login", (url) => ({ PAYLOAD_DATABASE_URI: url("postgres") })],
    [
      "a cms_runtime URL whose query logs in as postgres",
      (url) => ({
        PAYLOAD_DATABASE_URI: `${url("cms_runtime")}?user=postgres`,
      }),
    ],
  ])(
    "refuses %s without connecting",
    async (_name, env) => {
      listener = await listen();
      const { rest, graphql } = await loadRoutes(env(local));
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});

      const response = await rest.GET(
        new Request("http://admin.test/api/pages?limit=1"),
        { params: Promise.resolve({ slug: ["pages"] }) },
      );
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        message: "There was an error initializing Payload",
      });

      await expect(
        graphql.POST(
          new Request("http://admin.test/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query: "{ __typename }" }),
          }),
        ),
      ).rejects.toMatchObject({ name: "PayloadDatabaseConfigurationError" });

      expect(listener.connections()).toBe(0);
      errors.mockRestore();
    },
    60_000,
  );
});
