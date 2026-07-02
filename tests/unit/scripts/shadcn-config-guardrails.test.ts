import { describe, expect, it } from "vitest";

import {
  SHADCN_RSC_OVERRIDE_ENV,
  firstNonCommentLine,
  validateShadcnConfigGuardrails,
} from "../../../scripts/verify/shadcn-config-guardrails.mjs";

const validComponentsConfig = {
  style: "base-maia",
  rsc: false,
  iconLibrary: "lucide",
  tailwind: {
    config: "",
    baseColor: "zinc",
    cssVariables: true,
  },
  aliases: {
    ui: "@/components/shadcn",
    utils: "@/lib/utils",
  },
};

const validGlobals = {
  "apps/admin/app/globals.css": '@import "@asym/ui/styles/globals.css";\n',
  "apps/donor/app/globals.css": '@import "@asym/ui/styles/globals.css";\n',
  "apps/missionary/app/globals.css": '@import "@asym/ui/styles/globals.css";\n',
};

describe("shadcn config guardrails", () => {
  it("accepts the pinned shared UI shadcn configuration", () => {
    const failures = validateShadcnConfigGuardrails({
      componentsConfig: validComponentsConfig,
      appConfigFiles: [],
      appGlobals: validGlobals,
      env: {},
    });

    expect(failures).toEqual([]);
  });

  it("reports every preserved components.json drift with path and expected value", () => {
    const failures = validateShadcnConfigGuardrails({
      componentsConfig: {
        ...validComponentsConfig,
        style: "new-york",
        iconLibrary: "tabler",
        tailwind: {
          config: "tailwind.config.ts",
          baseColor: "slate",
          cssVariables: false,
        },
        aliases: {
          ui: "@/components/ui",
          utils: "@/utils",
        },
      },
      appConfigFiles: [],
      appGlobals: validGlobals,
      env: {},
    });

    expect(failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "packages/ui/components.json#style",
          expected: '"base-maia"',
        }),
        expect.objectContaining({
          path: "packages/ui/components.json#tailwind.baseColor",
          expected: '"zinc"',
        }),
        expect.objectContaining({
          path: "packages/ui/components.json#tailwind.cssVariables",
          expected: "true",
        }),
        expect.objectContaining({
          path: "packages/ui/components.json#tailwind.config",
          expected: '""',
        }),
        expect.objectContaining({
          path: "packages/ui/components.json#iconLibrary",
          expected: '"lucide"',
        }),
        expect.objectContaining({
          path: "packages/ui/components.json#aliases.ui",
          expected: '"@/components/shadcn"',
        }),
        expect.objectContaining({
          path: "packages/ui/components.json#aliases.utils",
          expected: '"@/lib/utils"',
        }),
      ]),
    );
  });

  it("fails rsc drift unless the explicit override env is set", () => {
    const withoutOverride = validateShadcnConfigGuardrails({
      componentsConfig: {
        ...validComponentsConfig,
        rsc: true,
      },
      appConfigFiles: [],
      appGlobals: validGlobals,
      env: {},
    });
    const withOverride = validateShadcnConfigGuardrails({
      componentsConfig: {
        ...validComponentsConfig,
        rsc: true,
      },
      appConfigFiles: [],
      appGlobals: validGlobals,
      env: {
        [SHADCN_RSC_OVERRIDE_ENV]: "1",
      },
    });

    expect(withoutOverride).toContainEqual(
      expect.objectContaining({
        path: "packages/ui/components.json#rsc",
        expected: `false or ${SHADCN_RSC_OVERRIDE_ENV}=1`,
      }),
    );
    expect(withOverride).toEqual([]);
  });

  it("rejects app-local shadcn and tailwind config files", () => {
    const failures = validateShadcnConfigGuardrails({
      componentsConfig: validComponentsConfig,
      appConfigFiles: [
        "apps/admin/components.json",
        "apps/donor/tailwind.config.ts",
      ],
      appGlobals: validGlobals,
      env: {},
    });

    expect(failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "apps/admin/components.json",
          expected: "file must not exist",
        }),
        expect.objectContaining({
          path: "apps/donor/tailwind.config.ts",
          expected: "file must not exist",
        }),
      ]),
    );
  });

  it("requires shared globals import as the first non-comment app CSS line", () => {
    const failures = validateShadcnConfigGuardrails({
      componentsConfig: validComponentsConfig,
      appConfigFiles: [],
      appGlobals: {
        ...validGlobals,
        "apps/donor/app/globals.css": "@source './**/*.tsx';\n",
      },
      env: {},
    });

    expect(failures).toContainEqual(
      expect.objectContaining({
        path: "apps/donor/app/globals.css",
        expected: '@import "@asym/ui/styles/globals.css";',
      }),
    );
  });

  it("finds the first non-comment CSS line through block comments", () => {
    expect(
      firstNonCommentLine(
        [
          "",
          "/*",
          " * generated note",
          " */",
          '@import "@asym/ui/styles/globals.css";',
        ].join("\n"),
      ),
    ).toBe('@import "@asym/ui/styles/globals.css";');
  });
});
