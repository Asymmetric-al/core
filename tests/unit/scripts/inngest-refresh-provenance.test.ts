import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const roots: string[] = [];
const coreRef = "082798a627bbe9c3ed3a6638a9f56116a035f122";
const codexRef = "351e14c55a01f3924ab47f9feb69bae615b8bb52";
const coreNames = [
  "inngest-setup",
  "inngest-events",
  "inngest-durable-functions",
  "inngest-steps",
  "inngest-flow-control",
  "inngest-middleware",
  "inngest-realtime",
];
const codexNames = [
  "inngest-brownfield-audit",
  "inngest-agents",
  "inngest-v3-v4-migration",
  "inngest-api",
  "inngest-api-cli",
];
const names = [...coreNames, ...codexNames];
const agentExample = [
  "When starting a durable support or tool-calling agent from scratch, inspect the",
  "companion example at `../../examples/durable-agent`. It shows the expected",
  "agent-first shape: quick HTTP trigger, typed events, AgentKit inside an",
  "Inngest function, step-scoped context loading, human approval with",
  "`step.waitForEvent`, and durable side effects after approval.",
].join("\n");
const cloudRoute =
  "For Cloud operations with connected MCP tools, use `inngest-cloud` first.";
function url(repo: string, ref: string, source: string) {
  return "https://raw.githubusercontent.com/" + repo + "/" + ref + "/" + source;
}
async function fixture() {
  await mkdir(path.join(repoRoot, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repoRoot, ".tmp/inngest-provenance-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts"));
  await cp(
    path.join(repoRoot, "scripts/refresh-inngest-skills.mjs"),
    path.join(root, "scripts/refresh-inngest-skills.mjs"),
  );
  const sources: Record<string, string> = {};
  for (const name of names) {
    const core = coreNames.includes(name);
    sources[
      url(
        core ? "inngest/inngest-skills" : "inngest/inngest-codex-plugin",
        core ? coreRef : codexRef,
        (core ? "skills/" : "plugins/inngest/skills/") + name + "/SKILL.md",
      )
    ] =
      "---\nname: " +
      name +
      "\ndescription: Synthetic upstream fixture\n---\n\n[Expressions](../references/expressions.md)\n\n" +
      (name === "inngest-agents"
        ? agentExample
        : name === "inngest-api" || name === "inngest-api-cli"
          ? cloudRoute
          : "Synthetic skill guidance.") +
      "\n";
  }
  for (const source of [
    "skills/references/expressions.md",
    "skills/inngest-durable-functions/references/step-execution.md",
    "skills/inngest-durable-functions/references/error-handling.md",
    "skills/inngest-durable-functions/references/observability.md",
    "skills/inngest-durable-functions/references/checkpointing.md",
    "skills/inngest-middleware/references/dependency-injection.md",
    "skills/inngest-middleware/references/built-in-middleware.md",
  ])
    sources[url("inngest/inngest-skills", coreRef, source)] =
      "# Synthetic reference\n";
  sources[
    url(
      "inngest/inngest-codex-plugin",
      codexRef,
      "plugins/inngest/skills/inngest-api/references/rest-api-v2.md",
    )
  ] = "[Insights](cli-commands.md#insights-sql-over-execution-data)\n";
  sources[
    url(
      "inngest/inngest-codex-plugin",
      codexRef,
      "plugins/inngest/skills/inngest-api-cli/references/cli-commands.md",
    )
  ] = "# Insights SQL over execution data\n";
  sources[url("inngest/inngest-skills", coreRef, "LICENSE")] =
    "Synthetic Apache license fixture\n";
  sources[url("inngest/inngest-codex-plugin", codexRef, "LICENSE")] =
    "Synthetic MIT license fixture\n";
  await writeFile(
    path.join(root, "fetch-inputs.json"),
    JSON.stringify(sources),
  );
  await writeFile(
    path.join(root, "mock-fetch.mjs"),
    `import { readFile } from "node:fs/promises";
const inputs = JSON.parse(await readFile(new URL("./fetch-inputs.json", import.meta.url), "utf8"));
globalThis.fetch = async (source) => {
  if (!Object.hasOwn(inputs, String(source))) throw new Error("Unexpected network source: " + source);
  return new Response(inputs[String(source)]);
};
`,
  );
  const reference = path.join(
    root,
    "docs/ai/skills/inngest/references/upstream.md",
  );
  await mkdir(path.dirname(reference), { recursive: true });
  await cp(
    path.join(repoRoot, "docs/ai/skills/inngest/references/upstream.md"),
    reference,
  );
  return { root, reference };
}
function refresh(root: string) {
  const result = spawnSync(
    process.execPath,
    ["--import", "./mock-fetch.mjs", "scripts/refresh-inngest-skills.mjs"],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 10_000,
      env: Object.fromEntries(
        Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
      ),
    },
  );
  expect(result.status, result.stdout + result.stderr).toBe(0);
}
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});
describe("Inngest generated provenance", () => {
  it("retains the reviewed refresh note and documents every installed adapter after repeated offline refresh", async () => {
    const { root, reference } = await fixture();
    refresh(root);
    const first = await readFile(reference, "utf8");
    expect(first).toContain("## Reviewed refresh 2026-10-22");
    expect(first).toContain("only API and API-CLI add Cloud MCP-first routing");
    expect(first).toContain("all twelve installed skills");
    expect(first).toContain("shared expressions links");
    expect(first).toContain("Cloud OAuth");
    expect(first).toContain("../../inngest-api-cli/references/cli-commands.md");
    expect(first).not.toContain("It applies one repo overlay");
    for (const name of names) {
      const skill = await readFile(
        path.join(root, "docs/ai/skills", name, "SKILL.md"),
        "utf8",
      );
      expect(skill).toContain("## Repository Workflow");
      expect(skill).toContain("../inngest/references/expressions.md");
      if (name === "inngest-api" || name === "inngest-api-cli") {
        expect(skill).toContain(
          "prefer available connected Inngest Cloud MCP tools",
        );
        expect(skill).not.toContain(cloudRoute);
      }
      if (name === "inngest-agents")
        expect(skill).toContain("plugins/inngest/examples/durable-agent");
    }
    const rest = await readFile(
      path.join(root, "docs/ai/skills/inngest-api/references/rest-api-v2.md"),
      "utf8",
    );
    expect(rest).toContain(
      "../../inngest-api-cli/references/cli-commands.md#insights-sql-over-execution-data",
    );
    refresh(root);
    expect(await readFile(reference, "utf8")).toBe(first);
  });
});
