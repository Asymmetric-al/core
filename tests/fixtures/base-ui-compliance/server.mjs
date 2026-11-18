import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import tailwind from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";

import {
  copyMaplibreWorkerAssets,
  resolveMaplibreDistDir,
} from "../../../scripts/copy-maplibre-worker-assets.mjs";

const fixtureDirectory = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(fixtureDirectory, "../../..");
// Stub ids use forward slashes so a stub aliased from a workspace import and the
// same stub imported relatively by an entry stay one module on Windows too.
const fixturePath = (file) =>
  resolve(fixtureDirectory, file).replaceAll("\\", "/");
const outputDirectory = resolve(
  repositoryRoot,
  "test-results/base-ui-compliance/assets",
);
const cssPath = resolve(repositoryRoot, "packages/ui/styles/globals.css");
const compiledCssPath = resolve(outputDirectory, "globals.css");
// Use the repository's installed dependency graph without adding another Vite or PostCSS version.
// Resolved paths become file URLs so the ESM loader accepts Windows drive paths.
const vitestRequire = createRequire(import.meta.resolve("vitest"));
const { build, preview } = await import(
  pathToFileURL(vitestRequire.resolve("vite")).href
);
const postcssRequire = createRequire(
  import.meta.resolve("@tailwindcss/postcss"),
);
const { default: postcss } = await import(
  pathToFileURL(postcssRequire.resolve("postcss")).href
);
await mkdir(outputDirectory, { recursive: true });
const compiled = await postcss([tailwind()]).process(
  await readFile(cssPath, "utf8"),
  { from: cssPath },
);
await writeFile(compiledCssPath, compiled.css);

const buildDirectory = resolve(outputDirectory, "dist");
await build({
  configFile: false,
  envDir: false,
  root: fixtureDirectory,
  cacheDir: resolve(outputDirectory, "vite-cache"),
  plugins: [
    {
      name: "base-ui-compliance-boundaries",
      enforce: "pre",
      resolveId(source, importer) {
        if (source === "virtual:base-ui-styles") return compiledCssPath;
        const workspaceFile = importer?.replaceAll("\\", "/");
        if (
          (source === "@tanstack/react-query" &&
            (workspaceFile?.endsWith(
              "/web-studio/flows/MissionariesHubView.tsx",
            ) ||
              workspaceFile?.endsWith(
                "/web-studio/flows/studio-missionaries.ts",
              ))) ||
          (source === "@asym/lib/mission-control/context" &&
            [
              "/admin/app/eve/global-panel.tsx",
              "/admin/app/(app)/admin/page-client.tsx",
              "/mission-control/components/tiles/tile-card.tsx",
            ].some((file) => workspaceFile?.endsWith(file))) ||
          (source === "eve/react" &&
            workspaceFile?.endsWith("/admin/app/eve/global-panel.tsx")) ||
          (source === "next/navigation" &&
            workspaceFile?.endsWith("/admin/app/eve/global-panel.tsx")) ||
          (source === "@payloadcms/ui" &&
            workspaceFile?.includes("/admin/src/cms-ui/web-studio/"))
        )
          return fixturePath("admin-shell-runtime-stub.tsx");
        if (
          source === "next/navigation" &&
          workspaceFile?.endsWith("/admin/src/cms-ui/web-studio/routing.ts")
        )
          return fixturePath("admin-shell-runtime-stub.tsx");
        // The fixture consumes the same public adapter as the UI workspace.
        // Resolve from that owner without adding unused root dependencies.
        if (
          source === "nuqs/adapters/react" &&
          workspaceFile?.endsWith("/ui-utilities-main.tsx")
        ) {
          return this.resolve(
            source,
            resolve(repositoryRoot, "packages/ui/index.ts"),
            { skipSelf: true },
          );
        }

        const usesAnalytics = workspaceFile?.endsWith(
          "/missionary/app/analytics/page-client.tsx",
        );
        if (
          source === "@asym/lib/hooks" &&
          (workspaceFile?.endsWith(
            "/donor/components/donor-portal-header.tsx",
          ) ||
            workspaceFile?.endsWith(
              "/missionary/components/sidebar-account-menu.tsx",
            ))
        )
          return fixturePath("donor-auth-stub.ts");
        if (
          source === "@asym/database/hooks" &&
          (workspaceFile?.endsWith(
            "/donor/components/donor-portal-header.tsx",
          ) ||
            workspaceFile?.endsWith("/missionary/components/app-sidebar.tsx"))
        )
          return fixturePath("donor-portal-stub.ts");
        if (source === "@asym/lib/hooks" && usesAnalytics)
          return fixturePath("analytics-metrics-stub.ts");
        if (source === "next/dynamic" && usesAnalytics)
          return fixturePath("analytics-chart-stub.ts");
        const usesTaskToolbarHooks =
          workspaceFile?.endsWith("/missionary/app/tasks/page-client.tsx") ||
          workspaceFile?.endsWith("/missionary/app/donors/donor-tasks.tsx") ||
          workspaceFile?.endsWith("/missionary/components/task-dialog.tsx");
        if (source === "@asym/lib/hooks" && usesTaskToolbarHooks)
          return fixturePath("task-toolbar-hooks-stub.ts");
        if (
          source === "@asym/database/supabase" &&
          workspaceFile?.endsWith("/missionary/components/task-dialog.tsx")
        )
          return fixturePath("task-toolbar-supabase-stub.ts");
        const usesMissionaryLayout = workspaceFile?.endsWith(
          "/missionary/app/_providers/missionary-layout-shell.tsx",
        );
        const sharedAliasPrefix = `${resolve(repositoryRoot, "packages/ui")}/`;
        if (
          usesMissionaryLayout &&
          (source.startsWith("@/") || source.startsWith(sharedAliasPrefix))
        )
          return this.resolve(
            resolve(
              repositoryRoot,
              "apps/missionary",
              source.startsWith("@/")
                ? source.slice(2)
                : source.slice(sharedAliasPrefix.length),
            ),
            importer,
            { skipSelf: true },
          );
        const usesWorkspaceSession = [
          "/donor/components/donor-portal-header.tsx",
          "/missionary/components/app-header.tsx",
          "/missionary/components/sidebar-account-menu.tsx",
          "/ui/hooks/retained-draft.tsx",
        ].some((file) => workspaceFile?.endsWith(file));
        if (source === "@asym/auth/client-session" && usesWorkspaceSession)
          return fixturePath("workspace-session-stub.ts");
        if (
          source === "next/navigation" &&
          (workspaceFile?.endsWith(
            "/donor/components/donor-portal-header.tsx",
          ) ||
            usesMissionaryLayout ||
            workspaceFile?.endsWith("/missionary/components/app-sidebar.tsx") ||
            workspaceFile?.endsWith("/missionary/components/app-shell.tsx") ||
            workspaceFile?.endsWith(
              "/missionary/components/navigation-search.tsx",
            ))
        )
          return fixturePath("workspace-navigation-stub.ts");
        if (
          source === "@asym/env" &&
          (workspaceFile?.endsWith("/view-transitions/flags.ts") ||
            workspaceFile?.endsWith("/config/site-client.ts"))
        ) {
          return fixturePath("view-transition-env-stub.ts");
        }
        // Next Image's framework module is outside this standalone Vite
        // fixture. Only the legacy search block's static demo imagery uses
        // native img here; its actual Dialog and trigger remain unchanged.
        if (
          source === "next/image" &&
          importer
            ?.replaceAll("\\", "/")
            .endsWith("/shadcn-studio/blocks/dialog-search.tsx")
        ) {
          return fixturePath("search-demo-image-stub.tsx");
        }
        if (
          importer
            ?.replaceAll("\\", "/")
            .endsWith("/where-we-work/map-wrapper.tsx")
        ) {
          if (source === "@asym/database/hooks")
            return fixturePath("shadscan-locations-stub.ts");
          if (source === "@asym/ui/components/primitives/map")
            return fixturePath("shadscan-map-stub.tsx");
        }
        if (
          source === "@asym/lib/view-transitions" &&
          importer?.replaceAll("\\", "/").endsWith("/primitives/page-shell.tsx")
        ) {
          return fixturePath("support-navigation-stub.ts");
        }
        if (
          source === "@asym/api/admin/support/loaders" &&
          importer?.replaceAll("\\", "/").endsWith("/support/tickets/page.tsx")
        ) {
          return fixturePath("support-loader-stub.ts");
        }
        if (
          workspaceFile?.match(
            /\/(ConversationAssigneeMenu|ReportFilters|ReportScopeSelect)\.tsx$/,
          ) &&
          /\/(use-support-agents|use-support-mutations|use-support-inbox-settings|use-support-labels|current-agent|report-state)$/.test(
            source,
          )
        ) {
          return fixturePath("support-layout-stubs.ts");
        }
        if (
          workspaceFile?.endsWith("/toolbar/LabelFilter.tsx") &&
          (source === "../../hooks/use-support-labels" ||
            source === "../labels/LabelManagerDialog")
        ) {
          return fixturePath("support-layout-stubs.ts");
        }
        if (
          workspaceFile?.endsWith("/macros/RunMacroPopover.tsx") &&
          (source === "../../hooks/use-support-macros" ||
            source === "../../hooks/use-support-mutations" ||
            source === "../../lib/current-agent")
        ) {
          return fixturePath("support-layout-stubs.ts");
        }
        if (
          workspaceFile?.endsWith("/macros/MacroPreviewLine.tsx") &&
          (source === "../../hooks/use-support-agents" ||
            source === "../../hooks/use-support-canned-responses" ||
            source === "../../hooks/use-support-labels")
        ) {
          return fixturePath("support-layout-stubs.ts");
        }
        // The Support composer fixture signs in one user, whom the real
        // current-agent hook matches to a seeded agent by email.
        if (
          source === "@asym/lib/mission-control/context" &&
          workspaceFile?.endsWith("/support-hub/lib/current-agent.ts")
        ) {
          return fixturePath("support-composer-identity-stub.ts");
        }
        // This real form's mutation stub records the submitted
        // value for assertions without issuing a request to an application API.
        if (
          source === "../../hooks/use-support-mutations" &&
          importer?.replaceAll("\\", "/").endsWith("/labels/LabelForm.tsx")
        ) {
          return fixturePath("label-mutation-stub.ts");
        }
      },
    },
    react(),
  ],
  resolve: {
    alias: { "@": resolve(repositoryRoot, "packages/ui") },
    dedupe: ["react", "react-dom"],
  },
  css: { postcss: { plugins: [] } },
  logLevel: "warn",
  build: {
    outDir: buildDirectory,
    emptyOutDir: true,
    target: "esnext",
    rolldownOptions: {
      input: {
        main: resolve(fixtureDirectory, "index.html"),
        modernization: resolve(fixtureDirectory, "modernization.html"),
        pdfModernization: resolve(fixtureDirectory, "pdf-modernization.html"),
        uiUtilities: resolve(fixtureDirectory, "ui-utilities.html"),
        kanban: resolve(fixtureDirectory, "kanban.html"),
        support: resolve(fixtureDirectory, "support.html"),
        supportComposer: resolve(fixtureDirectory, "support-composer.html"),
        workspace: resolve(fixtureDirectory, "workspace.html"),
        taskToolbar: resolve(fixtureDirectory, "task-toolbar.html"),
        faq: resolve(fixtureDirectory, "faq.html"),
        adminAvailability: resolve(fixtureDirectory, "admin-availability.html"),
        adminShell: resolve(fixtureDirectory, "admin-shell.html"),
      },
      onwarn(warning, warn) {
        // Every imported component runs in this client-only fixture. The bundler can
        // safely omit Next's module boundary directive, while other warnings remain visible.
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use client"')
        )
          return;
        warn(warning);
      },
    },
  },
});
copyMaplibreWorkerAssets({
  distDir: resolveMaplibreDistDir(
    resolve(repositoryRoot, "packages/ui/package.json"),
  ),
  publicDir: buildDirectory,
});
// Serve only the completed bundle: a fresh run cannot race dev dependency
// optimization or reload another test's page when a dependency is discovered.
const server = await preview({
  configFile: false,
  envDir: false,
  root: fixtureDirectory,
  build: { outDir: buildDirectory },
  preview: { host: "127.0.0.1", port: 5198, strictPort: true },
});
console.log("Base UI compliance fixture: http://127.0.0.1:5198");
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await new Promise((resolveClose) => server.httpServer.close(resolveClose));
    process.exit(0);
  });
}
