import { existsSync } from "node:fs";
import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import {
  designSystemConfig,
  fixGuide,
} from "../../../tooling/eslint-config/design-system.mjs";

const root = process.cwd();
const linters = new Map<string, ESLint>();

async function lint(
  source: string,
  workspace = "apps/donor",
  relativeFile = "components/message-probe.tsx",
) {
  let eslint = linters.get(workspace);
  if (!eslint) {
    eslint = new ESLint({
      cwd: path.join(root, workspace),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    linters.set(workspace, eslint);
  }
  const [result] = await eslint.lintText(source, {
    filePath: path.join(root, workspace, relativeFile),
  });
  expect(result.fatalErrorCount).toBe(0);
  return result.messages.filter((message) =>
    message.ruleId?.startsWith("shadcn/"),
  );
}

function only(messages: ESLint.LintResult["messages"], ruleId: string) {
  return messages.filter((message) => message.ruleId === ruleId);
}

// Every configured message string, including contract and category messages.
function configuredMessages() {
  const found: string[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object")
      for (const [key, entry] of Object.entries(value)) {
        if (key === "message" && typeof entry === "string") found.push(entry);
        else if (key === "message" && entry && typeof entry === "object")
          found.push(...Object.values(entry as Record<string, string>));
        else visit(entry);
      }
  };
  for (const config of designSystemConfig()) visit(config.rules);
  return found;
}

describe("design-system lint messages for agents", () => {
  it("links every finding to the short fix guide", async () => {
    expect(existsSync(path.join(root, fixGuide))).toBe(true);
    const messages = await lint(
      'import { Button } from "@asym/ui/components/shadcn/button"; export const Probe = () => <Button className="p-8 bg-zinc-500 max-w-[200px]">Save</Button>;',
    );
    expect(messages.length).toBeGreaterThanOrEqual(3);
    for (const message of messages)
      expect(message.message.endsWith(`Fix guide: ${fixGuide}.`)).toBe(true);
  });

  it("keeps upstream's size and variant guidance for restyled controls", async () => {
    const [spacing] = only(
      await lint(
        'import { Button } from "@asym/ui/components/shadcn/button"; export const Probe = () => <Button className="p-8">Save</Button>;',
      ),
      "shadcn/no-restyle",
    );
    expect(spacing.message).toContain('"p-8"');
    expect(spacing.message).toContain("icon-xs");
  });

  it("sends new colors to the shared theme, never an app stylesheet", async () => {
    const messages = only(
      await lint(
        'export const Probe = () => <div className="bg-emerald-600 text-zinc-500">Saved</div>;',
      ),
      "shadcn/no-raw-colors",
    );
    expect(messages).toHaveLength(2);
    for (const message of messages) {
      expect(message.message).toContain("packages/ui/styles/globals.css");
      expect(message.message).not.toMatch(/apps\/[a-z]+\/app\/globals\.css/);
      expect(message.message).not.toContain("app/globals.css");
      expect(message.message).toMatch(/success, warning, info or destructive/);
    }
    expect(messages[0].message).toContain("bg-emerald-600");
    expect(messages[1].message).toContain("text-zinc-500");
    expect(messages[1].message).toContain("text-muted-foreground");
  });

  it("keeps currentColor guidance for raw SVG colors", async () => {
    const [message] = only(
      await lint(
        'export const Probe = () => <svg><path fill="#ff0000" /></svg>;',
      ),
      "shadcn/no-raw-colors",
    );
    expect(message.message).toContain('fill="#ff0000"');
    expect(message.message).toContain("currentColor");
  });

  it("points dialog height and overflow at the scrollable API", async () => {
    const messages = only(
      await lint(
        'import { DialogContent } from "@asym/ui/components/shadcn/dialog"; export const Probe = () => <DialogContent className="max-h-96 overflow-y-auto">Body</DialogContent>;',
      ),
      "shadcn/no-restyle",
    );
    expect(messages).toHaveLength(2);
    for (const message of messages) {
      expect(message.message).toContain("<DialogContent scrollable>");
      expect(message.message).not.toContain("put layout classes on a parent");
    }
  });

  it("tells sheets and popovers to scroll their content instead", async () => {
    for (const [component, module] of [
      ["SheetContent", "sheet"],
      ["PopoverContent", "popover"],
    ]) {
      const [message] = only(
        await lint(
          `import { ${component} } from "@asym/ui/components/shadcn/${module}"; export const Probe = () => <${component} className="h-96">Body</${component}>;`,
        ),
        "shadcn/no-restyle",
      );
      expect(message.message).toContain(`<${component}>`);
      expect(message.message).toContain("inside it");
      expect(message.message).not.toContain("scrollable>");
    }
  });

  it("still lets popups take caller-owned width", async () => {
    const messages = await lint(
      'import { DialogContent } from "@asym/ui/components/shadcn/dialog"; import { SheetContent } from "@asym/ui/components/shadcn/sheet"; export const Probe = () => <><DialogContent className="max-w-lg">A</DialogContent><SheetContent className="w-96 sm:max-w-md">B</SheetContent></>;',
    );
    expect(only(messages, "shadcn/no-restyle")).toEqual([]);
  });

  it("keeps upstream's exact scale replacement for arbitrary values", async () => {
    const [message] = only(
      await lint(
        'export const Probe = () => <div className="max-w-[200px]">x</div>;',
      ),
      "shadcn/no-arbitrary-values",
    );
    expect(message.message).toContain(
      'Use "max-w-50" instead (same value, on the scale).',
    );
  });

  it("accepts the motion tokens the fix guide recommends", async () => {
    const messages = await lint(
      'export const Probe = () => <div className="transition-colors duration-(--duration-standard) ease-(--ease-out-soft)">x</div>;',
    );
    expect(messages).toEqual([]);
  });

  it("keeps every configured message within upstream's 500-character limit", () => {
    const messages = configuredMessages();
    expect(messages.length).toBeGreaterThan(0);
    for (const message of messages)
      expect(message.length).toBeLessThanOrEqual(500);
  });
});
