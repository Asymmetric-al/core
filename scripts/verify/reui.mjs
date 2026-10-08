#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import * as http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const MCP_URL = "https://mcp.reui.io";
const REGISTRY_URL = "https://reui.io/r/{style}/{name}.json";
const PROTOCOL_VERSION = "2025-06-18";
// Match the file discriminators in Core's installed shadcn registry schema.
const REGISTRY_FILE_TYPES = new Set([
  "registry:file",
  "registry:page",
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:style",
  "registry:item",
  "registry:base",
  "registry:font",
  "registry:example",
  "registry:internal",
]);
const REQUIRED_TOOLS = [
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
];

function read(root, relative) {
  try {
    return readFileSync(path.join(root, relative), "utf8");
  } catch {
    return undefined;
  }
}

function readJson(root, relative) {
  try {
    return JSON.parse(read(root, relative));
  } catch {
    return undefined;
  }
}

function skillFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const name = path.join(directory, entry.name);
      if (entry.isDirectory()) return skillFiles(name);
      if (!entry.isFile())
        throw new Error("Skill entries must be regular files");
      return [name];
    })
    .sort();
}

function mirrorsMatch(root) {
  try {
    const canonical = path.join(root, "docs/ai/skills/reui");
    const files = skillFiles(canonical);
    if (!files.includes(path.join(canonical, "SKILL.md"))) return false;
    const skill = read(root, "docs/ai/skills/reui/SKILL.md");
    if (!/^name:\s*reui\s*$/m.test(skill ?? "")) return false;
    const manifest = readJson(
      root,
      "docs/ai/skills/reui/references/upstream-manifest.json",
    );
    if (
      typeof manifest?.reviewedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(manifest.reviewedAt) ||
      !Number.isFinite(Date.parse(manifest.reviewedAt)) ||
      (manifest.reviewStatus !== undefined &&
        manifest.reviewStatus !== "reviewed")
    ) {
      return false;
    }
    for (const mirror of [".agents", ".cursor", ".claude"]) {
      const destination = path.join(root, mirror, "skills/reui");
      const mirrored = skillFiles(destination);
      if (files.length !== mirrored.length) return false;
      for (let index = 0; index < files.length; index++) {
        const relative = path.relative(canonical, files[index]);
        if (path.relative(destination, mirrored[index]) !== relative)
          return false;
        if (!readFileSync(files[index]).equals(readFileSync(mirrored[index]))) {
          return false;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

function localChecks(root) {
  const checks = [];
  const failures = [];
  const check = (label, passes) => {
    (passes ? checks : failures).push(label);
  };
  check("canonical ReUI skill and all mirrors", mirrorsMatch(root));
  const config = readJson(root, "packages/ui/components.json");
  const registry = config?.registries?.["@reui"];
  check(
    "Base UI/base-maia authenticated registry",
    config?.style === "base-maia" &&
      config?.tailwind?.baseColor === "zinc" &&
      config?.tailwind?.cssVariables === true &&
      registry?.url === REGISTRY_URL &&
      registry?.headers?.Authorization === "Bearer ${REUI_LICENSE_KEY}",
  );
  const claude = readJson(root, ".mcp.json")?.mcpServers?.reui;
  const cursor = readJson(root, ".cursor/mcp.json")?.mcpServers?.reui;
  const toml = read(root, ".codex/config.toml") ?? "";
  // Check only this server's table; another server or a commented example
  // must never satisfy its credential/style forwarding contract.
  const codex =
    toml.match(
      /^[ \t]*\[mcp_servers\.reui\][ \t]*\r?\n([\s\S]*?)(?=^[ \t]*\[|(?![\s\S]))/m,
    )?.[1] ?? "";
  check(
    "Codex, Claude, and Cursor MCP auth/style forwarding",
    claude?.type === "http" &&
      claude?.url === MCP_URL &&
      claude?.headers?.Authorization === "Bearer ${REUI_LICENSE_KEY}" &&
      claude?.headers?.["X-Reui-Style"] === "base-maia" &&
      cursor?.url === MCP_URL &&
      cursor?.headers?.Authorization === "Bearer ${env:REUI_LICENSE_KEY}" &&
      cursor?.headers?.["X-Reui-Style"] === "base-maia" &&
      !/^[ \t]*enabled\s*=\s*false\s*(?:#.*)?$/m.test(codex) &&
      /^[ \t]*url\s*=\s*"https:\/\/mcp\.reui\.io"\s*(?:#.*)?$/m.test(codex) &&
      /^[ \t]*bearer_token_env_var\s*=\s*"REUI_LICENSE_KEY"\s*(?:#.*)?$/m.test(
        codex,
      ) &&
      /^[ \t]*http_headers\s*=\s*\{[^\n]*"X-Reui-Style"\s*=\s*"base-maia"[^\n]*\}\s*(?:#.*)?$/m.test(
        codex,
      ),
  );
  if (failures.length) {
    throw new Error(`Local readiness failed: ${failures.join("; ")}`);
  }
  return checks;
}

function nativeFetch() {
  // Node 24.5+ supports the same proxy variables that Bun honors. Keep
  // compatibility with older Node releases when no proxy is configured.
  if (http.setGlobalProxyFromEnv) http.setGlobalProxyFromEnv();
  return globalThis.fetch;
}

function rpcMessage(text, id, optional = false) {
  const trimmed = text.trim();
  let messages;
  try {
    if (trimmed.startsWith("{")) {
      messages = [JSON.parse(trimmed)];
    } else {
      messages = trimmed.split(/\r?\n\r?\n/).flatMap((event) => {
        const data = event
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        return data && data !== "[DONE]" ? [JSON.parse(data)] : [];
      });
    }
  } catch {
    throw new Error("MCP returned malformed JSON/SSE");
  }
  const message = messages.find((item) => item?.id === id);
  if (!message && optional) return undefined;
  if (!message || message.jsonrpc !== "2.0") {
    throw new Error("MCP response did not match the request");
  }
  if (message.error) {
    throw new Error(`MCP JSON-RPC error (${message.error.code ?? "unknown"})`);
  }
  return message.result;
}

async function readRpc(response, id) {
  if (!response.headers.get("content-type")?.includes("text/event-stream")) {
    return rpcMessage(await response.text(), id);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("MCP returned an empty SSE response");
  const decoder = new TextDecoder();
  let pending = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      const events = pending.split(/\r?\n\r?\n/);
      pending = events.pop();
      if (done && pending.trim()) events.push(pending);
      for (const event of events) {
        const result = rpcMessage(event, id, true);
        if (result !== undefined) return result;
      }
      if (done) throw new Error("MCP response did not match the request");
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

function toolValue(result, name) {
  if (result?.isError) throw new Error(`${name} returned an MCP tool error`);
  for (const content of result?.content ?? []) {
    if (content.type !== "text") continue;
    try {
      return JSON.parse(content.text);
    } catch {
      // Non-JSON prose can accompany a structured text result.
    }
  }
  throw new Error(`${name} returned no structured result`);
}

function usableRegistryFile(file) {
  return (
    typeof file?.path === "string" &&
    file.path.trim() &&
    REGISTRY_FILE_TYPES.has(file.type) &&
    typeof file.content === "string" &&
    file.content.trim() &&
    (!["registry:page", "registry:file"].includes(file.type) ||
      (typeof file.target === "string" && file.target.trim()))
  );
}

async function liveChecks(key, fetchImpl) {
  let id = 0;
  let session;
  let protocol;
  const baseHeaders = {
    Authorization: `Bearer ${key}`,
    "X-Reui-Style": "base-maia",
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };
  async function rpc(method, params, notification = false) {
    const requestId = notification ? undefined : ++id;
    const headers = { ...baseHeaders };
    if (session) headers["Mcp-Session-Id"] = session;
    if (protocol) headers["MCP-Protocol-Version"] = protocol;
    const response = await fetchImpl(MCP_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`${method} HTTP ${response.status}`);
    session = response.headers.get("Mcp-Session-Id") ?? session;
    if (notification) return;
    return readRpc(response, requestId);
  }
  const call = async (name, args = {}) =>
    toolValue(await rpc("tools/call", { name, arguments: args }), name);
  const initialized = await rpc("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "core-reui-readiness", version: "1.0.0" },
  });
  if (!initialized?.capabilities?.tools || !initialized?.serverInfo?.name) {
    throw new Error("MCP initialization lacks tool capabilities");
  }
  if (![PROTOCOL_VERSION, "2025-03-26"].includes(initialized.protocolVersion)) {
    throw new Error("ReUI negotiated an unsupported MCP protocol version");
  }
  protocol = initialized.protocolVersion;
  await rpc("notifications/initialized", undefined, true);
  const listed = await rpc("tools/list", {});
  const available = new Set(listed?.tools?.map((tool) => tool.name));
  const missing = REQUIRED_TOOLS.filter((name) => !available.has(name));
  if (missing.length)
    throw new Error(`MCP missing capabilities: ${missing.join(", ")}`);
  const context = await call("get_project_context");
  if (!["pro", "ultimate"].includes(context.plan)) {
    throw new Error("MCP credential does not unlock a Pro plan");
  }
  if (
    context.projectStyle?.current?.style !== "base-maia" ||
    context.projectStyle?.current?.base !== "base"
  ) {
    throw new Error("MCP did not honor Base UI/base-maia style");
  }
  const search = await call("search", {
    query: "CRM dashboard",
    type: "block",
    surface: "card",
    limit: 2,
  });
  const block = search.results?.find(
    (item) =>
      item.type === "block" &&
      item.free === false &&
      item.requiredPlan === "pro" &&
      ["card", "none"].includes(item.surface) &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name),
  );
  if (!block) throw new Error("MCP search returned no usable Pro Card block");
  const component = await call("get_component", {
    name: "data-grid",
    maxChars: 4000,
  });
  if (
    component.name !== "data-grid" ||
    !component.api?.trim() ||
    !component.docsUrl?.startsWith(
      "https://reui.io/docs/components/base/data-grid",
    ) ||
    !component.dependencies?.includes("@base-ui/react")
  ) {
    throw new Error("MCP component API does not describe Base UI data-grid");
  }
  const registryUrl = REGISTRY_URL.replace("{style}", "base-maia").replace(
    "{name}",
    block.name,
  );
  const response = await fetchImpl(registryUrl, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Paid registry HTTP ${response.status}`);
  let item;
  try {
    item = await response.json();
  } catch {
    throw new Error("Paid registry returned malformed JSON");
  }
  if (
    item.name !== block.name ||
    item.type !== "registry:block" ||
    !Array.isArray(item.files) ||
    !item.files.length ||
    !item.files.every(usableRegistryFile) ||
    item.dependencies?.some((dependency) =>
      /^(?:@radix-ui\/|radix-ui(?:$|[@/]))/.test(dependency),
    ) ||
    item.files.some((file) =>
      /["'](?:@radix-ui\/[^"']+|radix-ui(?:\/[^"']*)?)["']/.test(file.content),
    )
  ) {
    throw new Error("Paid registry did not return usable Base UI block source");
  }
  return [
    "authenticated MCP tools and Pro plan",
    "Pro block discovery and Base UI component API",
    "paid Base UI registry source retrieval",
  ];
}

/** Read-only readiness check. Live access is explicit and never silently skipped. */
export async function verifyReui({
  root = REPO_ROOT,
  live = false,
  env = process.env,
  fetchImpl,
} = {}) {
  const checks = localChecks(root);
  if (live && !env.REUI_LICENSE_KEY?.trim()) {
    throw new Error("--live requires REUI_LICENSE_KEY");
  }
  if (live) {
    try {
      checks.push(
        ...(await liveChecks(env.REUI_LICENSE_KEY, fetchImpl ?? nativeFetch())),
      );
    } catch (error) {
      throw new Error(
        String(error.message ?? error).replaceAll(
          env.REUI_LICENSE_KEY,
          "<redacted>",
        ),
      );
    }
  }
  return { checks };
}

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.includes("--help")) {
      console.log(
        "Usage: bun run verify:reui [--live]\n--live requires REUI_LICENSE_KEY and performs read-only authenticated checks.",
      );
      return;
    }
    if (args.some((arg) => arg !== "--live")) {
      throw new Error("Unknown argument; use --help");
    }
    const result = await verifyReui({ live: args.includes("--live") });
    for (const check of result.checks) console.log(`[reui] PASS ${check}`);
  } catch (error) {
    console.error(`[reui] FAIL ${error.message}`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
