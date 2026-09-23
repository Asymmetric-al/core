import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import {
  primitiveFiles,
  uiWorkspaces,
} from "../../../tooling/eslint-config/design-system.mjs";

const root = process.cwd();

describe("Core design-system lint", () => {
  it("accepts existing motion token references and the pinned-table border seam only in its implementation", async () => {
    const eslint = new ESLint({
      cwd: root,
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const code =
      'export const Example = () => <div className="ease-[var(--ease-out-soft)] shadow-[1px_0_0_0_var(--color-border)] shadow-[-1px_0_0_0_var(--color-border)]" />;';
    const [table] = await eslint.lintText(code, {
      filePath:
        "packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx",
    });
    expect(
      table.messages.filter((message) => message.ruleId?.startsWith("shadcn/")),
    ).toEqual([]);
    const [consumer] = await eslint.lintText(code, {
      filePath: "apps/donor/components/new-consumer.tsx",
    });
    expect(
      consumer.messages.filter(
        (message) => message.ruleId === "shadcn/no-arbitrary-values",
      ),
    ).toHaveLength(2);
  });
  it.each(uiWorkspaces)(
    "keeps root and %s workspace decisions equivalent without erasing the parser or import boundary",
    async (workspace) => {
      const filePath = path.join(
        root,
        workspace,
        "components/new-consumer.tsx",
      );
      const source =
        'import { Button } from "@asym/ui/components/shadcn/button"; import forbidden from "../../apps/admin/private"; export const Example = () => <Button className="p-8 bg-zinc-500" />;';
      const decisions = [];
      for (const cwd of [root, path.join(root, workspace)]) {
        const eslint = new ESLint({
          cwd,
          overrideConfig: {
            languageOptions: { parserOptions: { projectService: false } },
          },
        });
        const config = await eslint.calculateConfigForFile(filePath);
        expect(config.languageOptions.parser.meta.name).toContain(
          "typescript-eslint",
        );
        const [result] = await eslint.lintText(source, { filePath });
        expect(
          result.messages.some(
            (message) => message.ruleId === "no-restricted-imports",
          ),
        ).toBe(true);
        decisions.push(
          result.messages
            .filter((message) => message.ruleId?.startsWith("shadcn/"))
            .map(({ ruleId, severity, line, column }) => ({
              ruleId,
              severity,
              line,
              column,
            })),
        );
      }
      expect(decisions[0]).toEqual(decisions[1]);
      expect(decisions[0].length).toBeGreaterThan(0);
    },
  );

  it("does not grant new shared feature files primitive authoring privileges", async () => {
    const eslint = new ESLint({ cwd: root });
    for (const file of [
      "components/dashboard/new-card.tsx",
      "components/shadcn/new-feature.tsx",
      "components/studio/ReactEmailEditor.tsx",
    ]) {
      const config = await eslint.calculateConfigForFile(
        path.join(root, "packages/ui", file),
      );
      for (const name of [
        "no-restyle",
        "require-static-classes",
        "no-inline-styles",
      ]) {
        expect(config.rules[`shadcn/${name}`][0]).toBe(2);
      }
    }
    for (const file of primitiveFiles) {
      const config = await eslint.calculateConfigForFile(
        path.join(root, "packages/ui", file),
      );
      expect(config.rules["shadcn/no-restyle"][0]).toBe(0);
      for (const name of [
        "no-raw-colors",
        "no-arbitrary-values",
        "no-inline-styles",
        "no-unknown-classes",
      ])
        expect(config.rules[`shadcn/${name}`][0]).toBe(2);
    }
  });

  it("does not apply web styling to backend and email output while preserving their lint", async () => {
    const eslint = new ESLint({ cwd: root });
    for (const file of [
      "packages/api/src/example.ts",
      "packages/email/templates/example.tsx",
      "packages/lib/cms/public-page-renderer.tsx",
    ]) {
      const config = await eslint.calculateConfigForFile(path.join(root, file));
      expect(config.rules["shadcn/no-inline-styles"]).toBeUndefined();
      expect(config.rules["no-restricted-imports"][0]).toBe(2);
      expect(config.languageOptions.parser.meta.name).toContain(
        "typescript-eslint",
      );
    }
  });

  it("distinguishes component placement, container composition, and owned controls", async () => {
    const eslint = new ESLint({
      cwd: root,
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const [result] = await eslint.lintText(
      `
      import { Button } from "@asym/ui/components/shadcn/button";
      import { CardContent, CardTitle } from "@asym/ui/components/shadcn/card";
      import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
      export const Example = () => <>
        <CardContent className="p-4 gap-2 flex h-full" />
        <CardTitle className="text-sm font-medium" />
        <Skeleton className="size-8 rounded-full" />
        <Button className="w-full mt-4" size="sm" />
        <Button className="h-8 active:scale-95 focus-visible:ring-0" />
      </>;
    `,
      { filePath: "apps/donor/app/design-system-probe.tsx" },
    );
    const messages = result.messages.filter((m) =>
      m.ruleId?.startsWith("shadcn/"),
    );
    expect(messages).toHaveLength(3);
    expect(
      messages.every(
        (m) =>
          m.ruleId === "shadcn/no-restyle" && m.message.includes("<Button>"),
      ),
    ).toBe(true);
  });

  it("keeps token and class checks inside explicit primitive authoring files", async () => {
    const eslint = new ESLint({
      cwd: root,
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const [result] = await eslint.lintText(
      `
      import { Button } from "@asym/ui/components/shadcn/button";
      export const Example = () => <Button className={buttonVariants()} />;
      export const Invalid = () => <div className="bg-zinc-500 hovr:flex p-[13px]" />;
      export const Focus = () => <div className="focus-visible:ring-[3px] press-feedback" />;
    `,
      { filePath: "packages/ui/components/shadcn/button.tsx" },
    );
    expect(
      result.messages
        .filter((m) => m.ruleId?.startsWith("shadcn/"))
        .map((m) => m.ruleId)
        .sort(),
    ).toEqual([
      "shadcn/no-arbitrary-values",
      "shadcn/no-raw-colors",
      "shadcn/no-unknown-classes",
    ]);
  });

  it("checks all six rules with the real theme, while accepting semantic classes", async () => {
    const eslint = new ESLint({
      cwd: path.join(root, "apps/donor"),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const [result] = await eslint.lintText(
      `
      import { Button } from "@asym/ui/components/shadcn/button";
      const opaque = getClasses();
      export const Example = () => <>
        <Button className="p-8" />
        <Button className={opaque} />
        <div className="bg-not-a-core-token p-[13px] hovr:flex" style={{ width: 13 }} />
      </>;
    `,
      { filePath: "app/design-system-probe.tsx" },
    );
    expect(
      [
        ...new Set(
          result.messages
            .filter((m) => m.ruleId?.startsWith("shadcn/"))
            .map((m) => m.ruleId),
        ),
      ].sort(),
    ).toEqual([
      "shadcn/no-arbitrary-values",
      "shadcn/no-inline-styles",
      "shadcn/no-raw-colors",
      "shadcn/no-restyle",
      "shadcn/no-unknown-classes",
      "shadcn/require-static-classes",
    ]);
    const [positive] = await eslint.lintText(
      `
      import { Button } from "@asym/ui/components/shadcn/button";
      export const Example = () => <div className="bg-background text-muted-foreground prose press-feedback animate-accordion-down data-open:flex">
        <Button variant="outline" size="icon-xs" className="mt-4" />
      </div>;
    `,
      { filePath: "app/design-system-probe.tsx" },
    );
    expect(
      positive.messages.filter((m) => m.ruleId?.startsWith("shadcn/")),
    ).toEqual([]);
  });

  it("protects the real shared Button in the donor workspace", async () => {
    const eslint = new ESLint({
      cwd: path.join(root, "apps/donor"),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const [result] = await eslint.lintText(
      'import { Button } from "@asym/ui/components/shadcn/button"; export const Example = () => <Button className="p-8" />;',
      { filePath: "app/design-system-probe.tsx" },
    );
    expect(
      result.messages.filter((m) => m.ruleId === "shadcn/no-restyle"),
    ).toEqual([expect.objectContaining({ severity: 2 })]);
  });
});
