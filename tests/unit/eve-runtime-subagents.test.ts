import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { EVE_SPECIALIST_IDS } from "../../packages/api/src/eve/subagent-catalog/types";

const root = path.resolve(import.meta.dirname, "../..");
const agentRoot = path.join(root, "packages/eve-runtime/agent");

describe("Eve declared specialist runtime", () => {
  it("authors every catalog entry as an isolated declared subagent", async () => {
    const specialistDirectories = (
      await readdir(path.join(agentRoot, "subagents"), {
        withFileTypes: true,
      })
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(specialistDirectories).toEqual([...EVE_SPECIALIST_IDS].sort());

    for (const specialistId of EVE_SPECIALIST_IDS) {
      const specialistRoot = path.join(agentRoot, "subagents", specialistId);
      const agent = await readFile(
        path.join(specialistRoot, "agent.ts"),
        "utf8",
      );
      const instructions = await readFile(
        path.join(specialistRoot, "instructions.md"),
        "utf8",
      );
      const sharedContext = await readFile(
        path.join(specialistRoot, "tools/shared_context.ts"),
        "utf8",
      );

      expect(agent).toContain(`createEveSpecialistAgent("${specialistId}")`);
      expect(instructions).toContain(`Eve's ${specialistId} specialist`);
      expect(instructions).toContain("Delegate no further");
      expect(sharedContext).toContain(
        `createEveSharedContextTool("${specialistId}")`,
      );
      for (const disabledTool of [
        "bash",
        "write_file",
        "web_fetch",
        "web_search",
      ]) {
        expect(
          await readFile(
            path.join(specialistRoot, `tools/${disabledTool}.ts`),
            "utf8",
          ),
        ).toContain("disableTool");
      }
      await expect(
        readdir(path.join(specialistRoot, "subagents")),
      ).rejects.toMatchObject({ code: "ENOENT" });
    }
  });

  it("records the confirmed design brief and keeps production selection policy-owned", async () => {
    const [brief, factory, resolver, sharedContextTool] = await Promise.all([
      readFile(path.join(agentRoot, "EVE-BRIEF.md"), "utf8"),
      readFile(path.join(agentRoot, "lib/specialist-agent.ts"), "utf8"),
      readFile(
        path.join(
          root,
          "packages/eve-runtime/src/specialists/runtime-policy.ts",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          root,
          "packages/eve-runtime/src/specialists/shared-context-tool.ts",
        ),
        "utf8",
      ),
    ]);

    expect(brief).toContain("Confirmation");
    expect(factory).toContain("defineDynamic");
    expect(factory).toContain("mockModel");
    expect(resolver).toContain("resolveEveModelRole");
    expect(resolver).toContain("engineering.subagent.delegate");
    expect(resolver).toContain("prepareEveRuntimeActivation");
    expect(resolver).not.toMatch(/anthropic\/|openai\/|google\//u);
    expect(sharedContextTool).toContain(
      "context.session.parent?.rootSessionId",
    );
    expect(sharedContextTool).toMatch(
      /resolveEveSpecialistIdentity\(\s*context\.session\.auth\.current/u,
    );
    expect(sharedContextTool).not.toMatch(/tenantId:\s*z\./u);
    expect(sharedContextTool).not.toMatch(/writerSubagentId:\s*z\./u);
  });
});
