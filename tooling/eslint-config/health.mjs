import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { ESLint } from "eslint";

import { uiWorkspaces } from "./design-system.mjs";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const ruleIds = [
  "shadcn/no-restyle",
  "shadcn/no-raw-colors",
  "shadcn/no-arbitrary-values",
  "shadcn/no-inline-styles",
  "shadcn/no-unknown-classes",
  "shadcn/require-static-classes",
];

function setupFailure(workspace, message) {
  return new Error(
    `Core design-system health failed for ${workspace}: ${message}. Inspect the effective ESLint config, shared component exports and CSS imports; restart editor ESLint after repairing discovery.`,
  );
}

function severity(rule) {
  const value = Array.isArray(rule) ? rule[0] : rule;
  return value === "error" ? 2 : value;
}

/**
 * Exercise the real exported config with ephemeral lintText consumers.
 * The probes need no tsconfig entry; only their parser project service is
 * disabled. Normal source linting retains the workspace's type-aware parser.
 * Operational warnings remain on stderr for the command wrapper to handle.
 */
export async function verifyDesignSystemHealth({
  rootDir = repositoryRoot,
  workspace,
  configFile,
} = {}) {
  if (workspace && !uiWorkspaces.includes(workspace)) {
    throw new Error(`Unsupported design-system health workspace: ${workspace}`);
  }
  const root = path.resolve(rootDir);
  const scopes = workspace ? [workspace] : uiWorkspaces;
  const cwd = workspace ? path.join(root, workspace) : root;
  const resolvedConfig = configFile
    ? path.resolve(cwd, configFile)
    : path.join(cwd, "eslint.config.mjs");
  const configured = new ESLint({
    cwd,
    overrideConfigFile: resolvedConfig,
    cache: false,
  });
  const probes = new ESLint({
    cwd,
    overrideConfigFile: resolvedConfig,
    cache: false,
    overrideConfig: [
      {
        name: "core/design-system-health/synthetic-parser",
        languageOptions: {
          parserOptions: { projectService: false, project: false },
        },
      },
    ],
  });
  const results = [];

  for (const scope of scopes) {
    const consumerPath = path.join(
      root,
      scope,
      "components/core-design-system-health.tsx",
    );
    const effective = await configured.calculateConfigForFile(consumerPath);
    if (!effective) {
      throw setupFailure(
        scope,
        "the synthetic consumer is ignored or has no config",
      );
    }
    for (const ruleId of ruleIds) {
      if (severity(effective.rules?.[ruleId]) !== 2) {
        throw setupFailure(scope, `${ruleId} must be configured as error`);
      }
    }

    async function lintProbe(name, source) {
      const filePath = consumerPath.replace(".tsx", `-${name}.tsx`);
      const [result] = await probes.lintText(source, { filePath });
      if (!result || result.fatalErrorCount) {
        throw setupFailure(
          scope,
          `${name} probe could not be parsed: ${result?.messages.map((item) => item.message).join("; ") ?? "no result"}`,
        );
      }
      return result.messages.filter((item) =>
        item.ruleId?.startsWith("shadcn/"),
      );
    }

    const appearance = await lintProbe(
      "component",
      'import { Button } from "@asym/ui/components/shadcn/button"; export const Probe = () => <Button className="p-8">Check</Button>;',
    );
    if (
      !appearance.some(
        (item) =>
          item.ruleId === "shadcn/no-restyle" &&
          item.message.includes("p-8") &&
          item.message.includes("icon-xs"),
      )
    ) {
      throw setupFailure(
        scope,
        "Button definition discovery failed: p-8 must report no-restyle with the real icon-xs size",
      );
    }

    const valid = await lintProbe(
      "theme",
      'import { Button } from "@asym/ui/components/shadcn/button"; export const Probe = () => <><Button size="icon-xs" aria-label="Check" /><div className="bg-background text-foreground border-border bg-chart-1 press-feedback prose animate-in tiptap node-columns" /></>;',
    );
    if (valid.length > 0) {
      throw setupFailure(
        scope,
        `semantic theme, custom utility, Tailwind plugin or loaded external CSS probe failed: ${valid.map((item) => `${item.ruleId}: ${item.message}`).join("; ")}`,
      );
    }

    const invalid = await lintProbe(
      "tailwind",
      'export const Probe = () => <div className="hovr:flex bg-core-health-undeclared" />;',
    );
    if (
      !invalid.some(
        (item) =>
          item.ruleId === "shadcn/no-raw-colors" &&
          item.message.includes("bg-core-health-undeclared"),
      )
    ) {
      throw setupFailure(
        scope,
        "the undeclared semantic theme color was not rejected",
      );
    }
    if (
      !invalid.some(
        (item) =>
          item.ruleId === "shadcn/no-unknown-classes" &&
          item.message.includes("hovr:flex"),
      )
    ) {
      throw setupFailure(
        scope,
        "Tailwind-backed analysis is inactive: invalid variant hovr:flex passed on plain HTML (a grammar fallback is insufficient)",
      );
    }

    results.push({
      workspace: scope,
      configFile: resolvedConfig,
      checks: [
        "blocking-policy",
        "component-definitions",
        "theme-and-plugins",
        "tailwind-compiler",
      ],
    });
  }
  return { workspaces: results };
}

// The normal lint adapter runs health in a short-lived process, so its project
// and Tailwind caches are released before the type-aware source lint starts.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const { values } = parseArgs({
      options: {
        root: { type: "string" },
        "config-file": { type: "string" },
        workspace: { type: "string", multiple: true },
      },
    });
    for (const workspace of values.workspace ?? [undefined]) {
      await verifyDesignSystemHealth({
        rootDir: values.root,
        configFile: values["config-file"],
        workspace,
      });
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
