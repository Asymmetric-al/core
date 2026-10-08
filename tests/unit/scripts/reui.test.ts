import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyReui } from "../../../scripts/verify/reui.mjs";

const roots: string[] = [];
const testLicense = "test-reui-license";
type RpcRequest = {
  id?: number;
  method: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
};

function remoteFixture({
  json = false,
  openStream = false,
  override,
}: {
  json?: boolean;
  openStream?: boolean;
  override?: (
    body: RpcRequest | undefined,
    url: string,
  ) => Response | undefined;
} = {}) {
  const requests: { url: string; headers: Headers; body?: RpcRequest }[] = [];
  const fetchImpl = vi.fn(async (url: string, options: RequestInit = {}) => {
    const body = options.body ? JSON.parse(String(options.body)) : undefined;
    requests.push({ url, headers: new Headers(options.headers), body });
    const replacement = override?.(body, url);
    if (replacement) return replacement;
    if (url === "https://reui.io/r/base-maia/solution-crm-1.json") {
      return Response.json({
        name: "solution-crm-1",
        type: "registry:block",
        files: [
          {
            path: "block.tsx",
            type: "registry:component",
            content: "export function Block() { return null }",
          },
        ],
        dependencies: ["@base-ui/react"],
      });
    }
    if (body?.method === "notifications/initialized")
      return new Response(null, { status: 202 });
    let result: unknown;
    if (body?.method === "initialize") {
      result = {
        protocolVersion: "2025-06-18",
        serverInfo: { name: "ReUI", version: "1.1.0" },
        capabilities: { tools: {} },
      };
    } else if (body?.method === "tools/list") {
      result = {
        tools: [
          "search",
          "get_block",
          "get_component",
          "get_examples",
          "compose_page",
          "validate_usage",
          "get_install_command",
          "get_project_context",
          "get_agent_skill",
          "get_audit_checklist",
        ].map((name) => ({ name, inputSchema: { type: "object" } })),
      };
    } else {
      const results: Record<string, unknown> = {
        get_project_context: {
          plan: "pro",
          projectStyle: { current: { style: "base-maia", base: "base" } },
        },
        search: {
          plan: "pro",
          results: [
            {
              name: "solution-crm-1",
              type: "block",
              free: false,
              requiredPlan: "pro",
              surface: "card",
            },
          ],
        },
        get_component: {
          name: "data-grid",
          api: "The Base UI DataGrid API.",
          docsUrl: "https://reui.io/docs/components/base/data-grid?ref=mcp",
          dependencies: ["@base-ui/react"],
        },
      };
      result = {
        content: [
          { type: "text", text: JSON.stringify(results[body?.params?.name]) },
        ],
      };
    }
    const message = JSON.stringify({ jsonrpc: "2.0", id: body?.id, result });
    if (json)
      return new Response(message, {
        headers: { "content-type": "application/json" },
      });
    const events = `: heartbeat\r\nevent: message\r\ndata: {"jsonrpc":"2.0","method":"notifications/progress"}\r\n\r\nevent: message\r\ndata: ${message}\r\n\r\n`;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(events));
      },
    });
    return new Response(openStream ? stream : events, {
      headers: {
        "content-type": "text/event-stream",
        "Mcp-Session-Id": "test-session",
      },
    });
  });
  return { fetchImpl, requests };
}

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "reui-readiness-"));
  roots.push(root);
  function write(relative: string, value: unknown) {
    const destination = path.join(root, relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(
      destination,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  }
  const skill = "---\nname: reui\ndescription: ReUI workflow\n---\n# ReUI\n";
  for (const directory of [
    "docs/ai/skills",
    ".agents/skills",
    ".cursor/skills",
    ".claude/skills",
  ]) {
    write(`${directory}/reui/SKILL.md`, skill);
    write(`${directory}/reui/rules/cli.md`, "Run from packages/ui.\n");
  }
  const config = {
    style: "base-maia",
    tailwind: { baseColor: "zinc", cssVariables: true },
    registries: {
      "@reui": {
        url: "https://reui.io/r/{style}/{name}.json",
        headers: { Authorization: "Bearer ${REUI_LICENSE_KEY}" },
      },
    },
  };
  write("packages/ui/components.json", config);
  write(".mcp.json", {
    mcpServers: {
      reui: {
        type: "http",
        url: "https://mcp.reui.io",
        headers: {
          Authorization: "Bearer ${REUI_LICENSE_KEY}",
          "X-Reui-Style": "base-maia",
        },
      },
    },
  });
  write(".cursor/mcp.json", {
    mcpServers: {
      reui: {
        type: "http",
        url: "https://mcp.reui.io",
        headers: {
          Authorization: "Bearer ${env:REUI_LICENSE_KEY}",
          "X-Reui-Style": "base-maia",
        },
      },
    },
  });
  write(
    ".codex/config.toml",
    '[mcp_servers.reui]\nurl = "https://mcp.reui.io"\nbearer_token_env_var = "REUI_LICENSE_KEY"\nhttp_headers = { "X-Reui-Style" = "base-maia" }\n',
  );
  return { root, write, config };
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("ReUI readiness verification", () => {
  it("checks local setup without credentials, network requests, or writes", async () => {
    const { root } = fixture();
    const fetchImpl = vi.fn();
    const before = readFileSync(path.join(root, ".mcp.json"));
    const result = await verifyReui({ root, env: {}, fetchImpl });
    expect(result.checks).toEqual([
      "canonical ReUI skill and all mirrors",
      "Base UI/base-maia authenticated registry",
      "Codex, Claude, and Cursor MCP auth/style forwarding",
    ]);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(readFileSync(path.join(root, ".mcp.json"))).toEqual(before);
  });

  it("fails live mode loudly when the license is absent, without sending requests", async () => {
    const { root } = fixture();
    const fetchImpl = vi.fn();
    await expect(
      verifyReui({ root, live: true, env: {}, fetchImpl }),
    ).rejects.toThrow("--live requires REUI_LICENSE_KEY");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("authenticates MCP and a paid Base UI registry fetch, parsing SSE notifications", async () => {
    const { root } = fixture();
    const { fetchImpl, requests } = remoteFixture();
    const result = await verifyReui({
      root,
      live: true,
      env: { REUI_LICENSE_KEY: testLicense },
      fetchImpl,
    });
    expect(result.checks).toContain("authenticated MCP tools and Pro plan");
    expect(result.checks).toContain(
      "Pro block discovery and Base UI component API",
    );
    expect(result.checks).toContain("paid Base UI registry source retrieval");
    expect(
      requests.map((request) => request.body?.method ?? "registry"),
    ).toEqual([
      "initialize",
      "notifications/initialized",
      "tools/list",
      "tools/call",
      "tools/call",
      "tools/call",
      "registry",
    ]);
    for (const request of requests) {
      expect(request.headers.get("authorization")).toBe(
        `Bearer ${testLicense}`,
      );
    }
    for (const request of requests.filter((request) => request.body)) {
      expect(request.headers.get("X-Reui-Style")).toBe("base-maia");
      expect(request.headers.get("Accept")).toBe(
        "application/json, text/event-stream",
      );
      if (request.body?.method !== "initialize") {
        expect(request.headers.get("Mcp-Session-Id")).toBe("test-session");
      }
    }
    expect(
      requests.find((request) => request.body?.params?.name === "search")?.body
        ?.params?.arguments,
    ).toEqual({
      query: "CRM dashboard",
      type: "block",
      surface: "card",
      limit: 2,
    });
  });

  it("finishes each SSE request when its result arrives while the server keeps the stream open", async () => {
    const { root } = fixture();
    const { fetchImpl } = remoteFixture({ openStream: true });
    await expect(
      verifyReui({
        root,
        live: true,
        env: { REUI_LICENSE_KEY: testLicense },
        fetchImpl,
      }),
    ).resolves.toMatchObject({
      checks: expect.arrayContaining([
        "paid Base UI registry source retrieval",
      ]),
    });
  }, 500);

  it("rejects initialization without a supported negotiated protocol before subsequent requests", async () => {
    const { root } = fixture();
    const { fetchImpl, requests } = remoteFixture({
      override: (body) =>
        body?.method === "initialize"
          ? Response.json({
              jsonrpc: "2.0",
              id: body.id,
              result: {
                serverInfo: { name: "ReUI" },
                capabilities: { tools: {} },
              },
            })
          : undefined,
    });
    await expect(
      verifyReui({
        root,
        live: true,
        env: { REUI_LICENSE_KEY: testLicense },
        fetchImpl,
      }),
    ).rejects.toThrow("unsupported MCP protocol version");
    expect(requests).toHaveLength(1);
  });

  it("also accepts standard JSON MCP responses", async () => {
    const { root } = fixture();
    const { fetchImpl } = remoteFixture({ json: true });
    await expect(
      verifyReui({
        root,
        live: true,
        env: { REUI_LICENSE_KEY: testLicense },
        fetchImpl,
      }),
    ).resolves.toMatchObject({
      checks: expect.arrayContaining(["authenticated MCP tools and Pro plan"]),
    });
  });

  it.each([
    [
      "skill mirror",
      ".cursor/skills/reui/rules/cli.md",
      "Stale install instructions",
      "canonical ReUI skill and all mirrors",
    ],
    [
      "Claude credential",
      ".mcp.json",
      { mcpServers: { reui: { url: "https://mcp.reui.io" } } },
      "MCP auth/style forwarding",
    ],
    [
      "Cursor credential syntax",
      ".cursor/mcp.json",
      {
        mcpServers: {
          reui: {
            url: "https://mcp.reui.io",
            headers: { Authorization: "Bearer ${REUI_LICENSE_KEY}" },
          },
        },
      },
      "MCP auth/style forwarding",
    ],
    [
      "Codex server scope",
      ".codex/config.toml",
      '[mcp_servers.reui]\nurl = "https://mcp.reui.io"\n# bearer_token_env_var = "REUI_LICENSE_KEY"\n[mcp_servers.other]\nbearer_token_env_var = "REUI_LICENSE_KEY"\nhttp_headers = { "X-Reui-Style" = "base-maia" }\n',
      "MCP auth/style forwarding",
    ],
  ])(
    "rejects local %s drift before requesting hosted access",
    async (_label, relative, value, expected) => {
      const { root, write } = fixture();
      write(relative, value);
      const fetchImpl = vi.fn();
      await expect(
        verifyReui({
          root,
          live: true,
          env: { REUI_LICENSE_KEY: testLicense },
          fetchImpl,
        }),
      ).rejects.toThrow(expected);
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it("rejects Codex credentials inherited from an indented next TOML table", async () => {
    const { root, write } = fixture();
    write(
      ".codex/config.toml",
      '[mcp_servers.reui]\nurl = "https://mcp.reui.io"\n  [mcp_servers.other]\nbearer_token_env_var = "REUI_LICENSE_KEY"\nhttp_headers = { "X-Reui-Style" = "base-maia" }\n',
    );
    const fetchImpl = vi.fn();
    await expect(
      verifyReui({
        root,
        live: true,
        env: { REUI_LICENSE_KEY: testLicense },
        fetchImpl,
      }),
    ).rejects.toThrow("MCP auth/style forwarding");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each(["style", "registry"])(
    "rejects local %s changes that would install another base or drop paid auth",
    async (drift) => {
      const { root, write, config } = fixture();
      write(
        "packages/ui/components.json",
        drift === "style"
          ? { ...config, style: "radix-maia" }
          : {
              ...config,
              registries: { "@reui": "https://reui.io/r/{style}/{name}.json" },
            },
      );
      await expect(verifyReui({ root, env: {} })).rejects.toThrow(
        "Base UI/base-maia authenticated registry",
      );
    },
  );

  it.each([
    [
      "HTTP auth failure",
      () => new Response(`unauthorized ${testLicense}`, { status: 401 }),
      "initialize HTTP 401",
    ],
    [
      "malformed SSE",
      () =>
        new Response("data: {broken}\n\n", {
          headers: { "content-type": "text/event-stream" },
        }),
      "malformed JSON/SSE",
    ],
    [
      "wrong response id",
      () => Response.json({ jsonrpc: "2.0", id: 999, result: {} }),
      "did not match the request",
    ],
    [
      "JSON-RPC error",
      (body: RpcRequest) =>
        Response.json({
          jsonrpc: "2.0",
          id: body.id,
          error: { code: -32000, message: testLicense },
        }),
      "JSON-RPC error (-32000)",
    ],
  ])(
    "fails safely for %s without echoing remote response bodies or credentials",
    async (_label, reply, expected) => {
      const { root } = fixture();
      const { fetchImpl } = remoteFixture({
        override: (body) =>
          body?.method === "initialize" ? reply(body) : undefined,
      });
      let message = "";
      try {
        await verifyReui({
          root,
          live: true,
          env: { REUI_LICENSE_KEY: testLicense },
          fetchImpl,
        });
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toContain(expected);
      expect(message).not.toContain(testLicense);
    },
  );

  it.each([
    ["missing path", { type: "registry:component" }],
    ["missing type", { path: "block.tsx" }],
    ["unsupported type", { path: "block.tsx", type: "source" }],
    ["page target", { path: "page.tsx", type: "registry:page" }],
    ["file target", { path: "block.tsx", type: "registry:file" }],
  ])(
    "rejects paid registry files with %s metadata",
    async (_label, metadata) => {
      const { root } = fixture();
      const { fetchImpl } = remoteFixture({
        override: (_body, url) =>
          url === "https://reui.io/r/base-maia/solution-crm-1.json"
            ? Response.json({
                name: "solution-crm-1",
                type: "registry:block",
                files: [
                  {
                    ...metadata,
                    content: "export function Block() { return null }",
                  },
                ],
                dependencies: ["@base-ui/react"],
              })
            : undefined,
      });
      await expect(
        verifyReui({
          root,
          live: true,
          env: { REUI_LICENSE_KEY: testLicense },
          fetchImpl,
        }),
      ).rejects.toThrow("usable Base UI block source");
    },
  );

  it.each([
    ["dependency", ["radix-ui"], "export function Block() { return null }"],
    [
      "versioned dependency",
      ["radix-ui@^1.4.3"],
      "export function Block() { return null }",
    ],
    [
      "import",
      ["@base-ui/react"],
      'import { Dialog } from "radix-ui"; export { Dialog };',
    ],
    [
      "subpath import",
      ["@base-ui/react"],
      "export * from 'radix-ui/react-dialog';",
    ],
  ])(
    "rejects paid block source using a monolithic Radix %s",
    async (_label, dependencies, content) => {
      const { root } = fixture();
      const { fetchImpl } = remoteFixture({
        override: (_body, url) =>
          url === "https://reui.io/r/base-maia/solution-crm-1.json"
            ? Response.json({
                name: "solution-crm-1",
                type: "registry:block",
                files: [
                  { path: "block.tsx", type: "registry:component", content },
                ],
                dependencies,
              })
            : undefined,
      });
      await expect(
        verifyReui({
          root,
          live: true,
          env: { REUI_LICENSE_KEY: testLicense },
          fetchImpl,
        }),
      ).rejects.toThrow("usable Base UI block source");
    },
  );

  it("redacts a credential if a transport exception includes it", async () => {
    const { root } = fixture();
    const fetchImpl = vi.fn(async () => {
      throw new Error(`Proxy rejected ${testLicense}`);
    });
    await expect(
      verifyReui({
        root,
        live: true,
        env: { REUI_LICENSE_KEY: testLicense },
        fetchImpl,
      }),
    ).rejects.toThrow("Proxy rejected <redacted>");
  });

  it.each([
    [
      "free plan",
      "get_project_context",
      {
        plan: "free",
        projectStyle: { current: { style: "base-maia", base: "base" } },
      },
      "does not unlock a Pro plan",
    ],
    [
      "Radix documentation",
      "get_component",
      {
        name: "data-grid",
        api: "API",
        docsUrl: "https://reui.io/docs/components/radix/data-grid",
        dependencies: ["@radix-ui/react-dialog"],
      },
      "does not describe Base UI",
    ],
    [
      "missing premium blocks",
      "search",
      { plan: "pro", results: [] },
      "no usable Pro Card block",
    ],
    [
      "tool failure",
      "get_project_context",
      undefined,
      "returned an MCP tool error",
    ],
  ])(
    "rejects remote %s before declaring readiness",
    async (_label, name, value, expected) => {
      const { root } = fixture();
      const { fetchImpl } = remoteFixture({
        override: (body) =>
          body?.method === "tools/call" && body.params?.name === name
            ? Response.json({
                jsonrpc: "2.0",
                id: body.id,
                result: {
                  isError: value === undefined,
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify(value ?? { error: testLicense }),
                    },
                  ],
                },
              })
            : undefined,
      });
      await expect(
        verifyReui({
          root,
          live: true,
          env: { REUI_LICENSE_KEY: testLicense },
          fetchImpl,
        }),
      ).rejects.toThrow(expected);
    },
  );
});
