import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const targets = [
  "apps/admin",
  "apps/donor",
  "apps/missionary",
  "packages/auth",
  "packages/database",
  "packages/lib",
  "packages/missionary",
  "packages/ui",
];
const invalid = `import { useState, useEffect } from "react";
export function useConditional(enabled: boolean) { if (enabled) useState(0); }
export function useEarlyReturn(enabled: boolean) { if (!enabled) return; useEffect(() => {}, []); }
export function useRepeated() { for (let index = 0; index < 2; index++) useState(0); }
`;
const valid = `import { useState, useEffect } from "react";
export function useValid(enabled: boolean) { const [value] = useState(0); useEffect(() => { if (enabled) void value; }, [enabled, value]); return value; }
`;

describe("native Rules of Hooks coverage for non-JSX modules", () => {
  it.each(targets)(
    "checks actual %s configuration from root and workspace cwd",
    async (target) => {
      const filePath = path.join(root, target, "native-hook-policy-probe.ts");
      for (const cwd of [root, path.join(root, target)]) {
        const eslint = new ESLint({
          cwd,
          overrideConfig: {
            languageOptions: { parserOptions: { projectService: false } },
          },
        });
        const [bad] = await eslint.lintText(invalid, { filePath });
        const errors = bad.messages.filter(
          (message) => message.ruleId === "react-hooks/rules-of-hooks",
        );
        expect(errors, cwd).toHaveLength(3);
        expect(errors.every((message) => message.severity === 2)).toBe(true);
        const [good] = await eslint.lintText(valid, { filePath });
        expect(
          good.messages.filter(
            (message) => message.ruleId === "react-hooks/rules-of-hooks",
          ),
          cwd,
        ).toEqual([]);
      }
    },
  );
});
