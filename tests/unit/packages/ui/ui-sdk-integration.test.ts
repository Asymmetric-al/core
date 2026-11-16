import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { firstNonCommentLine } from "../../../../scripts/verify/shadcn-config-guardrails.mjs";

// UI SDK (`@ui-sdk/*`) complements Base UI. These checks hold the integration
// contract in packages/ui/AGENTS.md: exact pins owned by @asym/ui, one shared
// runtime, apps consuming narrow @asym/ui wrappers, no optional `web.css`, and
// the SDK's injected `ui-sdk` cascade layer ranked below Core's styles.

const repoRoot = path.resolve(import.meta.dirname, "../../../..");
const uiManifestPath = path.join(repoRoot, "packages/ui/package.json");
const uiRequire = createRequire(uiManifestPath);
const dashboards = ["apps/admin", "apps/donor", "apps/missionary"] as const;
const sdkPackages = ["@ui-sdk/core", "@ui-sdk/react"] as const;

const readJson = (file: string) =>
  JSON.parse(readFileSync(path.join(repoRoot, file), "utf8"));
// Tracked plus untracked, not ignored: a new file is checked before staging.
const trackedFiles = (...pathspecs: string[]) =>
  execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      ...pathspecs,
    ],
    { cwd: repoRoot, encoding: "utf8" },
  )
    .split("\0")
    .filter((file) => file && existsSync(path.join(repoRoot, file)));
const importsSdk = (source: string) =>
  /from\s+["']@ui-sdk\/|import\s*\(\s*["']@ui-sdk\/|require\(\s*["']@ui-sdk\//.test(
    source,
  );

describe("UI SDK integration in @asym/ui", () => {
  it("is declared only by packages/ui, exactly pinned to one installed release", () => {
    const manifest = readJson("packages/ui/package.json");
    const pins = sdkPackages.map((name) => manifest.dependencies[name]);
    expect(pins[0]).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/);
    expect(pins[1]).toBe(pins[0]);
    for (const name of sdkPackages) {
      expect(
        JSON.parse(
          readFileSync(uiRequire.resolve(`${name}/package.json`), "utf8"),
        ).version,
      ).toBe(pins[0]);
    }

    const declaringWorkspaces = trackedFiles(
      "package.json",
      "apps/*/package.json",
      "packages/*/package.json",
      "tooling/*/package.json",
    ).filter((file) => {
      const workspace = readJson(file);
      return sdkPackages.some((name) =>
        [
          "dependencies",
          "devDependencies",
          "peerDependencies",
          "optionalDependencies",
        ].some((field) => workspace[field]?.[name] !== undefined),
      );
    });
    expect(declaringWorkspaces).toEqual(["packages/ui/package.json"]);

    // UI SDK requires React 19; the shared package must not advertise 18.
    expect(manifest.peerDependencies.react).toBe("^19.0.0");
    expect(manifest.peerDependencies["react-dom"]).toBe("^19.0.0");
  });

  it("shares one physical SDK core and one React with every dashboard", () => {
    const reactAdapter = uiRequire.resolve("@ui-sdk/react/package.json");
    const coreFromUi = realpathSync(
      uiRequire.resolve("@ui-sdk/core/package.json"),
    );
    const coreFromAdapter = realpathSync(
      createRequire(reactAdapter).resolve("@ui-sdk/core/package.json"),
    );
    expect(coreFromAdapter).toBe(coreFromUi);

    const reactFromAdapter = realpathSync(
      createRequire(reactAdapter).resolve("react/package.json"),
    );
    for (const app of dashboards) {
      const appRequire = createRequire(
        path.join(repoRoot, app, "package.json"),
      );
      expect(realpathSync(appRequire.resolve("react/package.json")), app).toBe(
        reactFromAdapter,
      );
    }
  });

  it("reaches every dashboard through the narrow @asym/ui primitive export", () => {
    const wrapper = realpathSync(
      path.join(repoRoot, "packages/ui/components/primitives/rating.tsx"),
    );
    for (const app of dashboards) {
      const appRequire = createRequire(
        path.join(repoRoot, app, "package.json"),
      );
      expect(
        realpathSync(
          appRequire.resolve("@asym/ui/components/primitives/rating"),
        ),
        app,
      ).toBe(wrapper);
    }

    // Every SDK wrapper is a primitive with its own export, never re-exported
    // by a barrel, so `optimizePackageImports` barrel imports stay SDK-free.
    const wrappers = trackedFiles("packages/ui")
      .filter((file) =>
        importsSdk(readFileSync(path.join(repoRoot, file), "utf8")),
      )
      .filter((file) => /\.(?:[cm]?[jt]sx?)$/.test(file));
    expect(wrappers).toContain("packages/ui/components/primitives/rating.tsx");
    for (const wrapper of wrappers) {
      expect(wrapper).toMatch(
        /^packages\/ui\/components\/primitives\/[^/]+\.tsx$/,
      );
    }
    for (const barrel of [
      "packages/ui/index.ts",
      "packages/ui/components/primitives/index.ts",
      "packages/ui/components/shadcn/index.ts",
      "packages/ui/hooks/index.ts",
      "packages/ui/lib/index.ts",
    ]) {
      const source = readFileSync(path.join(repoRoot, barrel), "utf8");
      expect(importsSdk(source), barrel).toBe(false);
      for (const wrapper of wrappers) {
        const name = path.basename(wrapper, ".tsx");
        expect(source, `${barrel} re-exports ${name}`).not.toMatch(
          new RegExp(`["'](?:\\./|.*/primitives/)${name}["']`),
        );
      }
    }
  });

  it("keeps SDK imports inside packages/ui and never loads the optional stylesheet", () => {
    const sourceFiles = trackedFiles("apps", "packages").filter((file) =>
      /\.(?:[cm]?[jt]sx?|css)$/.test(file),
    );

    const appImports = sourceFiles.filter(
      (file) =>
        file.startsWith("apps/") &&
        importsSdk(readFileSync(path.join(repoRoot, file), "utf8")),
    );
    expect(appImports).toEqual([]);

    const optionalStylesheet = sourceFiles.filter((file) =>
      /@ui-sdk\/core\/(?:dist\/)?web\.css/.test(
        readFileSync(path.join(repoRoot, file), "utf8"),
      ),
    );
    expect(optionalStylesheet).toEqual([]);
  });
});

describe("UI SDK cascade layer", () => {
  it("is named before Tailwind in the shared global stylesheet", () => {
    const globals = readFileSync(
      path.join(repoRoot, "packages/ui/styles/globals.css"),
      "utf8",
    );
    expect(firstNonCommentLine(globals)).toBe("@layer ui-sdk;");
    const statements = globals
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    expect(statements.slice(0, 2)).toEqual([
      "@layer ui-sdk;",
      '@import "tailwindcss";',
    ]);
  });

  it("ranks below Tailwind's layers in admin's explicit layer order", () => {
    const order = readFileSync(
      path.join(repoRoot, "apps/admin/app/css-layer-order.css"),
      "utf8",
    );
    const names = (order.match(/@layer\s+([^;]+);/)?.[1] ?? "")
      .split(",")
      .map((name) => name.trim());
    const rank = (name: string) => names.indexOf(name);
    expect(rank("ui-sdk")).toBeGreaterThan(-1);
    for (const later of ["theme", "base", "components", "utilities"]) {
      expect(rank("ui-sdk"), later).toBeLessThan(rank(later));
    }
  });

  it("compiles to the lowest styled layer of the shared stylesheet", async () => {
    const rootRequire = createRequire(path.join(repoRoot, "package.json"));
    const tailwindPostcss = rootRequire("@tailwindcss/postcss");
    const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
      "postcss",
    );
    const stylesheet = path.join(repoRoot, "packages/ui/styles/globals.css");
    const { css } = await postcss([
      tailwindPostcss({ base: repoRoot, optimize: false }),
    ]).process(readFileSync(stylesheet, "utf8"), { from: stylesheet });

    const declaredOrder: string[] = [];
    for (const match of (css as string).matchAll(
      /@layer\s+([\w-]+(?:\s*,\s*[\w-]+)*)\s*;/g,
    )) {
      for (const name of match[1]!.split(",").map((part) => part.trim())) {
        if (!declaredOrder.includes(name)) declaredOrder.push(name);
      }
    }
    // Tailwind hoists only its `properties` fallback layer (custom-property
    // initial values) above the first statement.
    expect(declaredOrder.slice(0, 6)).toEqual([
      "properties",
      "ui-sdk",
      "theme",
      "base",
      "components",
      "utilities",
    ]);
  });
});
