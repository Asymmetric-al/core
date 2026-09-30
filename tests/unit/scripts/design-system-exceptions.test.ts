import { readFileSync } from "node:fs";
import path from "node:path";

import parser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compile } from "tailwindcss";
import { describe, expect, it, vi } from "vitest";

import {
  ChartLegend,
  ChartTooltip,
} from "../../../packages/ui/components/primitives/chart-wrappers";
import {
  ChartContainer,
  ChartLegendContent,
} from "../../../packages/ui/components/shadcn/chart";
import { designSystemConfig } from "../../../tooling/eslint-config/design-system.mjs";

import type * as Recharts from "../../../packages/ui/node_modules/recharts";

vi.mock(
  "../../../packages/ui/node_modules/recharts",
  async (importOriginal) => ({
    ...(await importOriginal<typeof Recharts>()),
    ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
  }),
);

const root = process.cwd();

it("does not let external marker allowances hide misspelled variants", async () => {
  const engine = eslint();
  const [result] = await engine.lintText(
    'export const Example = () => <div className="not-prose hovr:not-prose payload-admin-wrapper hovr:payload-admin-wrapper" />;',
    {
      filePath: path.join(root, "apps/admin/src/cms-ui/root/Header.tsx"),
    },
  );
  const messages = result.messages.filter(
    (message) => message.ruleId === "shadcn/no-unknown-classes",
  );
  expect(messages).toHaveLength(2);
});
const runtimeCases = [
  {
    file: "packages/ui/components/shadcn/data-grid/data-grid.tsx",
    properties: [
      "maxHeight",
      "height",
      "width",
      "minWidth",
      "maxWidth",
      "transform",
    ],
  },
  {
    file: "packages/ui/components/shadcn/data-table/data-table-body.tsx",
    properties: ["maxHeight", "width", "height"],
  },
  {
    file: "packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx",
    properties: ["maxHeight", "width", "height"],
  },
  {
    file: "packages/ui/components/shadcn/rich-text-editor/image-view.tsx",
    properties: ["width"],
  },
  {
    file: "packages/ui/components/primitives/ripple-button.tsx",
    properties: ["top", "left"],
  },
  {
    file: "packages/missionary/components/task-kanban-board.tsx",
    properties: ["transform", "transition"],
  },
  {
    file: "apps/missionary/app/profile/profile-primitives.tsx",
    properties: ["width", "height", "transform"],
  },
  {
    file: "apps/missionary/app/profile/profile-preview.tsx",
    properties: ["width", "height"],
  },
  {
    file: "apps/admin/components/dashboard/charts/revenue-chart.tsx",
    properties: ["height"],
  },
  {
    file: "apps/admin/components/dashboard/charts/weekly-chart.tsx",
    properties: ["height"],
  },
  {
    file: "apps/admin/app/(app)/reports/reports-charts.tsx",
    properties: ["height"],
  },
];
const libraryCases = [
  {
    file: "apps/donor/components/openpolicy/cookie-policy.tsx",
    component: "CookiePolicy",
  },
  {
    file: "apps/donor/components/openpolicy/privacy-policy.tsx",
    component: "PrivacyPolicy",
  },
  {
    file: "apps/donor/components/openpolicy/terms-of-service.tsx",
    component: "TermsOfService",
  },
];

function eslint() {
  return new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.tsx"],
        languageOptions: { parser },
        rules: { "no-debugger": "error" },
      },
      ...designSystemConfig(),
    ],
  });
}

async function findings(file: string, source: string) {
  const [result] = await eslint().lintText(source, {
    filePath: path.join(root, file),
  });
  expect(result.fatalErrorCount).toBe(0);
  return result.messages;
}

const styleSource = (properties: string[], component = "div") => `
  export const Probe = ({ value }: { value: number }) => <${component} style={{ ${properties.map((property) => `${property}: value`).join(", ")} }} />;
`;

describe("scoped design-system runtime boundaries", () => {
  for (const { file, properties } of runtimeCases) {
    it(`permits measured properties only in ${file}`, async () => {
      expect(
        (await findings(file, styleSource(properties))).filter(
          (message) => message.ruleId === "shadcn/no-inline-styles",
        ),
      ).toEqual([]);
      expect(await findings(file, styleSource(["color"]))).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "shadcn/no-inline-styles" }),
        ]),
      );
      const neighboring = path.join(path.dirname(file), "new-consumer.tsx");
      expect(await findings(neighboring, styleSource(properties))).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "shadcn/no-inline-styles" }),
        ]),
      );
    });
  }

  for (const { file, component } of libraryCases) {
    it(`permits only the library style API in ${file}`, async () => {
      expect(
        (
          await findings(
            file,
            styleSource(
              ["display", "flexDirection", "gap", "maxWidth"],
              component,
            ),
          )
        ).filter((message) => message.ruleId === "shadcn/no-inline-styles"),
      ).toEqual([]);
      expect(await findings(file, styleSource(["display"]))).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "shadcn/no-inline-styles" }),
        ]),
      );
      expect(await findings(file, styleSource(["color"], component))).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "shadcn/no-inline-styles" }),
        ]),
      );
    });
  }

  it("keeps token checks blocking within runtime and primitive boundaries", async () => {
    for (const file of [
      runtimeCases[0].file,
      "packages/ui/components/shadcn/chart.tsx",
    ]) {
      expect(
        await findings(
          file,
          'export const Probe = () => <div className="bg-red-500" />;',
        ),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ruleId: "shadcn/no-raw-colors",
            severity: 2,
          }),
        ]),
      );
    }
  });

  it("exempts only the known ImageResponse renderer while preserving unrelated lint", async () => {
    const source =
      'debugger; export const Icon = () => <div className="bg-red-500" style={{ background: "#fff", width: 180 }} />;';
    const rendered = await findings(
      "apps/missionary/app/apple-icon.tsx",
      source,
    );
    expect(rendered.map((message) => message.ruleId)).toEqual(["no-debugger"]);
    const adjacent = await findings(
      "apps/missionary/app/ordinary-icon.tsx",
      source,
    );
    expect(adjacent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "shadcn/no-inline-styles" }),
        expect.objectContaining({ ruleId: "shadcn/no-raw-colors" }),
      ]),
    );
  });

  it("permits the typography exclusion marker in all five workspaces without accepting misspellings", async () => {
    for (const scope of [
      "apps/admin",
      "apps/donor",
      "apps/missionary",
      "packages/ui",
      "packages/missionary",
    ]) {
      const messages = await findings(
        `${scope}/typography-probe.tsx`,
        'export const Probe = () => <div className="not-prose not-prooze" />;',
      );
      const unknown = messages.filter(
        (message) => message.ruleId === "shadcn/no-unknown-classes",
      );
      expect(unknown).toHaveLength(1);
      expect(unknown[0].message).toContain("not-prooze");
    }
  });

  it("permits only sourced external CSS classes at their real entrypoints", async () => {
    for (const [file, classes] of [
      ["apps/admin/src/cms-ui/root/Header.tsx", "payload-admin-wrapper"],
      ["apps/admin/src/cms-ui/root/Nav.tsx", "payload-admin-wrapper"],
      [
        "apps/admin/src/cms-ui/web-studio/shell/studio-layout.tsx",
        "payload-admin-wrapper",
      ],
      [
        "apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx",
        "payload-native-edit",
      ],
      [
        "packages/ui/components/shadcn/rich-text-editor/image-view.tsx",
        "image-resizable image-selected",
      ],
    ]) {
      expect(
        (
          await findings(
            file,
            `export const Probe = () => <div className="${classes}" />;`,
          )
        ).filter((message) => message.ruleId === "shadcn/no-unknown-classes"),
      ).toEqual([]);
      expect(
        await findings(
          path.join(path.dirname(file), "new-consumer.tsx"),
          `export const Probe = () => <div className="${classes}" />;`,
        ),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "shadcn/no-unknown-classes" }),
        ]),
      );
    }
    expect(
      await findings(
        "apps/admin/src/cms-ui/root/Header.tsx",
        'export const Probe = () => <div className="payload-table-native" />;',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "shadcn/no-unknown-classes" }),
      ]),
    );
  });

  it("keeps chart marker colors dynamic through a real Tailwind CSS-variable utility", async () => {
    const compiler = await compile("@tailwind utilities;");
    expect(compiler.build(["bg-(--legend-color)"])).toContain(
      "background-color: var(--legend-color)",
    );
    for (const value of ["var(--chart-1)", "var(--chart-2)"]) {
      const surfaces = [
        createElement(ChartLegend, {
          items: [{ label: "Giving", color: value }],
        }),
        createElement(ChartTooltip, {
          active: true,
          payload: [{ name: "Giving", fill: value }],
        }),
        createElement(ChartContainer, {
          config: { giving: { label: "Giving" } },
          children: createElement(ChartLegendContent, {
            payload: [{ value: "giving", color: value, type: "circle" }],
          }),
        }),
      ];
      for (const surface of surfaces) {
        const rendered = renderToStaticMarkup(surface);
        expect(rendered).toContain("bg-(--legend-color)");
        expect(rendered).toContain(`--legend-color:${value}`);
        expect(rendered).not.toContain("background-color:");
      }
    }
    const file = "packages/ui/components/shadcn/chart.tsx";
    expect(
      await findings(
        file,
        'export const Probe = () => <div className="bg-(--legend-color)" style={{ "--legend-color": "#f00" }} />;',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "shadcn/no-inline-styles" }),
      ]),
    );
    expect(
      await findings(
        file,
        'export const Probe = () => <div style={{ backgroundColor: "#f00" }} />;',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "shadcn/no-inline-styles" }),
      ]),
    );
  });

  it("limits generated-style exceptions to the two audited expressions", async () => {
    for (const file of [
      "packages/ui/components/shadcn/chart.tsx",
      "apps/admin/app/(payload)/layout.tsx",
    ]) {
      const source = readFileSync(path.join(root, file), "utf8");
      const original = await findings(file, source);
      expect(
        original.filter(
          (message) =>
            message.ruleId === "shadcn/no-inline-styles" &&
            message.message.startsWith("A <style>"),
        ),
      ).toEqual([]);
      const expanded = await findings(
        file,
        `${source}\nexport const UnapprovedStyle = () => <style>{"div { color: red }"}</style>;`,
      );
      expect(
        expanded.filter(
          (message) =>
            message.ruleId === "shadcn/no-inline-styles" &&
            message.message.startsWith("A <style>"),
        ),
      ).toHaveLength(1);
    }
  });
});
