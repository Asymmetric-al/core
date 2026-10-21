import { describe, expect, it, vi } from "vitest";
import {
  createMcpSession,
  McpRpcError,
} from "../../../scripts/lib/mcp-session.mjs";

describe("STDIO MCP discovery", () => {
  it.each(["input_required", "extension", "unknown"])(
    "fails closed on a %s modern response without downgrading",
    async (resultType) => {
      const request = vi.fn(async () => ({
        resultType,
        supportedVersions: ["2026-07-28"],
        capabilities: { tools: {} },
      }));
      await expect(
        createMcpSession({ request, transport: "stdio" }),
      ).rejects.toThrow(/malformed discovery|Unsupported MCP result/);
      expect(request.mock.calls).toHaveLength(1);
    },
  );
});

describe("MCP legacy HTTP discovery", () => {
  it("negotiates after a JSON-RPC method rejection with HTTP404", async () => {
    const request = vi.fn(async (method: string) => {
      if (method === "server/discover")
        throw new McpRpcError(-32601, undefined, 404);
      if (method === "initialize")
        return { protocolVersion: "2025-11-25", capabilities: { tools: {} } };
      return undefined;
    });
    await expect(createMcpSession({ request })).resolves.toMatchObject({
      mode: "legacy",
      protocol: "2025-11-25",
    });
    expect(request.mock.calls.map(([method]) => method)).toEqual([
      "server/discover",
      "initialize",
      "notifications/initialized",
    ]);
  });
  it("rejects array-valued modern capabilities without downgrading", async () => {
    const request = vi.fn(async () => ({
      resultType: "complete",
      supportedVersions: ["2026-07-28"],
      capabilities: [],
    }));
    await expect(createMcpSession({ request })).rejects.toThrow(
      /malformed discovery/,
    );
    expect(request).toHaveBeenCalledOnce();
  });
});

describe("modern MCP result contracts", () => {
  it.each([undefined, null, {}, { tools: [] }])(
    "rejects a modern result without its complete discriminator: %j",
    async (result) => {
      const request = vi.fn(async (method: string) =>
        method === "server/discover"
          ? {
              resultType: "complete",
              supportedVersions: ["2026-07-28"],
              capabilities: { tools: {} },
            }
          : result,
      );
      const session = await createMcpSession({ request });
      await expect(session.rpc("tools/list", {})).rejects.toThrow(
        "Unsupported MCP result type",
      );
      expect(request.mock.calls.map(([method]) => method)).toEqual([
        "server/discover",
        "tools/list",
      ]);
    },
  );

  it("does not require result objects for modern notifications", async () => {
    const request = vi.fn(async (method: string) =>
      method === "server/discover"
        ? {
            resultType: "complete",
            supportedVersions: ["2026-07-28"],
            capabilities: { tools: {} },
          }
        : undefined,
    );
    const session = await createMcpSession({ request });
    await expect(
      session.rpc("notifications/cancelled", {}, true),
    ).resolves.toBeUndefined();
  });
});
