// Protocol policy is owned by Core agent tooling. Recheck these versions on
// each MCP executable/server upgrade; legacy is negotiated, never assumed.
export const MCP_MODERN_VERSIONS = Object.freeze(["2026-07-28"]);
export const MCP_LEGACY_VERSIONS = Object.freeze([
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
]);

export class McpRpcError extends Error {
  constructor(code, data, status) {
    super(
      `MCP JSON-RPC error (${typeof code === "number" ? code : "unknown"})`,
    );
    this.code = code;
    this.data = data;
    this.status = status;
  }
}

export class McpHttpError extends Error {
  constructor(method, status) {
    super(`${method} HTTP ${status}`);
    this.status = status;
  }
}

/** One negotiation per connection; no cross-origin, credential or process cache. */
export async function createMcpSession({
  request,
  transport = "http",
  clientInfo = { name: "core-readiness", version: "1.0.0" },
}) {
  if (!["http", "stdio"].includes(transport))
    throw new Error("Unsupported MCP transport");
  let protocol = MCP_MODERN_VERSIONS[0];
  const attempted = new Set();
  const modernRequest = async (method, params = {}, notification = false) => {
    const result = await request(
      method,
      {
        ...params,
        _meta: {
          ...params._meta,
          "io.modelcontextprotocol/protocolVersion": protocol,
          "io.modelcontextprotocol/clientInfo": clientInfo,
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
      { protocol, notification },
    );
    if (
      method !== "server/discover" &&
      result?.resultType !== undefined &&
      result.resultType !== "complete"
    ) {
      // Readiness advertises no sampling, elicitation, roots or extensions and
      // never performs interactive/provider work to complete a tool response.
      throw new Error("Unsupported MCP result type for read-only readiness");
    }
    return result;
  };

  let discovery;
  for (;;) {
    attempted.add(protocol);
    try {
      discovery = await modernRequest("server/discover");
      break;
    } catch (error) {
      // A recognized modern rejection must never trigger a legacy handshake.
      if (error instanceof McpRpcError && error.code === -32022) {
        const supported = error.data?.supported;
        const next =
          Array.isArray(supported) && error.data?.requested === protocol
            ? MCP_MODERN_VERSIONS.find(
                (version) =>
                  supported.includes(version) && !attempted.has(version),
              )
            : undefined;
        if (!next)
          throw new Error("No mutually supported modern MCP protocol version");
        protocol = next;
        continue;
      }
      // STDIO legacy implementations may reject pre-initialize methods using
      // arbitrary errors or ignore them until the transport's bounded timeout.
      // HTTP authentication, network and server failures are not downgrade signals.
      if (error instanceof McpRpcError && [-32020, -32021].includes(error.code))
        throw error;
      const legacyHttp =
        (error instanceof McpHttpError && [400, 404].includes(error.status)) ||
        (error instanceof McpRpcError &&
          ([400, 404].includes(error.status) ||
            ([-32601, -32602].includes(error.code) &&
              (error.status === undefined || error.status === 200))));
      if (transport !== "stdio" && !legacyHttp) throw error;
      const initialized = await request(
        "initialize",
        {
          protocolVersion: MCP_LEGACY_VERSIONS[0],
          capabilities: {},
          clientInfo,
        },
        {},
      );
      if (!MCP_LEGACY_VERSIONS.includes(initialized?.protocolVersion)) {
        throw new Error(
          "Server negotiated an unsupported MCP protocol version",
        );
      }
      protocol = initialized.protocolVersion;
      await request("notifications/initialized", undefined, {
        protocol,
        notification: true,
      });
      return {
        mode: "legacy",
        protocol,
        capabilities: initialized.capabilities,
        serverInfo: initialized.serverInfo,
        rpc: (method, params, notification = false) =>
          request(method, params, { protocol, notification }),
      };
    }
  }
  if (
    discovery?.resultType !== "complete" ||
    !Array.isArray(discovery.supportedVersions) ||
    !discovery.supportedVersions.includes(protocol) ||
    !discovery.capabilities ||
    typeof discovery.capabilities !== "object" ||
    Array.isArray(discovery.capabilities)
  )
    throw new Error(
      "MCP returned malformed discovery capabilities or versions",
    );
  return {
    mode: "modern",
    protocol,
    capabilities: discovery.capabilities,
    serverInfo: discovery._meta?.["io.modelcontextprotocol/serverInfo"],
    rpc: modernRequest,
  };
}
