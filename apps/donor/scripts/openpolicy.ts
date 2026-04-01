import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  expandOpenPolicyConfig,
  type OpenPolicyConfig,
  type OutputFormat,
  type PolicyInput,
  type ValidationIssue,
  validateCookiePolicy,
  validatePrivacyPolicy,
  validateTermsOfService,
} from "@openpolicy/core";
import { compilePolicy } from "@openpolicy/renderers";

import openPolicyConfig from "../openpolicy";

/**
 * Upstream note:
 * The published `@openpolicy/cli@0.0.17` tarball is incomplete on Bun/Windows and
 * currently cannot execute its `validate` / `generate` commands in this repo.
 * This donor-local script preserves the same workflows using the published
 * `@openpolicy/core` and `@openpolicy/renderers` packages.
 */

const scriptDir = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_LEGAL_OUTPUT_DIR = resolve(
  scriptDir,
  "../generated/policies",
);

type PlaceholderWarning = {
  message: string;
  path: string;
};

type ReviewMarkerPattern = {
  label: string;
  pattern: RegExp;
};

type ValidationSummary = {
  errors: string[];
  warnings: string[];
};

type GenerateOptions = {
  config?: OpenPolicyConfig;
  formats?: OutputFormat[];
  outDir?: string;
};

type GeneratedArtifact = {
  format: OutputFormat;
  path: string;
  policyType: PolicyInput["type"];
};

const REVIEW_MARKER_PATTERNS: ReviewMarkerPattern[] = [
  {
    label: "pending legal review",
    pattern: /\bpending legal review\b/i,
  },
  {
    label: "confirmation pending",
    pattern: /\bconfirmation pending\b/i,
  },
  {
    label: "human and legal review required",
    pattern: /requires human and legal review/i,
  },
  {
    label: "human review approval required",
    pattern: /human review should still approve/i,
  },
];

function validateInput(input: PolicyInput): ValidationIssue[] {
  switch (input.type) {
    case "privacy":
      return validatePrivacyPolicy(input);
    case "terms":
      return validateTermsOfService(input);
    case "cookie":
      return validateCookiePolicy(input);
  }
}

function collectPlaceholderWarnings(
  value: unknown,
  currentPath = "openPolicyConfig",
): PlaceholderWarning[] {
  if (typeof value === "string") {
    return REVIEW_MARKER_PATTERNS.flatMap((entry) =>
      entry.pattern.test(value)
        ? [
            {
              path: currentPath,
              message: `Unresolved review marker (${entry.label}) remains at ${currentPath}.`,
            },
          ]
        : [],
    );
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      collectPlaceholderWarnings(entry, `${currentPath}[${index}]`),
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, entry]) =>
      collectPlaceholderWarnings(entry, `${currentPath}.${key}`),
    );
  }

  return [];
}

export function validateOpenPolicyConfig(
  config: OpenPolicyConfig = openPolicyConfig,
): ValidationSummary {
  const inputs = expandOpenPolicyConfig(config);
  const issues = inputs.flatMap((input) =>
    validateInput(input).map((issue) => ({
      level: issue.level,
      message: `[${input.type}] ${issue.message}`,
    })),
  );

  const errors = issues
    .filter((issue) => issue.level === "error")
    .map((issue) => issue.message);

  const warnings = [
    ...issues
      .filter((issue) => issue.level === "warning")
      .map((issue) => issue.message),
    ...collectPlaceholderWarnings(config).map((warning) => warning.message),
  ];

  return {
    errors,
    warnings,
  };
}

function titleForPolicyType(type: PolicyInput["type"]): string {
  switch (type) {
    case "privacy":
      return "Privacy Policy";
    case "terms":
      return "Terms of Service";
    case "cookie":
      return "Cookie Policy";
  }
}

function wrapHtmlDocument(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.7;
        color: #1f2937;
        background: #f8fafc;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #ffffff 100%);
      }

      main {
        max-width: 960px;
        margin: 0 auto;
        padding: 48px 24px 72px;
      }

      article {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      section {
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.96);
        padding: 32px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      }

      h1, h2, h3, h4, h5, h6 {
        color: #0f172a;
        line-height: 1.2;
        margin: 0 0 12px;
      }

      p, ul, ol {
        margin: 0;
      }

      ul, ol {
        padding-left: 20px;
      }

      li + li,
      p + p,
      p + ul,
      p + ol,
      ul + p,
      ol + p {
        margin-top: 12px;
      }

      a {
        color: #0f172a;
        text-underline-offset: 3px;
      }
    </style>
  </head>
  <body>
    <main>
      <article>${bodyHtml}</article>
    </main>
  </body>
</html>
`;
}

function normalizeGeneratedPolicyContent(
  content: string,
  format: OutputFormat,
): string {
  let normalized = content.replace(
    /Placer County, California\.\./g,
    "Placer County, California.",
  );

  if (format === "markdown") {
    normalized = normalized.replace(/\*\*([^*\r\n]+): \*\*/g, "**$1:** ");
  }

  return normalized;
}

export async function generateOpenPolicyArtifacts({
  config = openPolicyConfig,
  formats = ["markdown"],
  outDir = DEFAULT_LEGAL_OUTPUT_DIR,
}: GenerateOptions = {}): Promise<GeneratedArtifact[]> {
  const inputs = expandOpenPolicyConfig(config);
  await mkdir(outDir, { recursive: true });

  const generated: GeneratedArtifact[] = [];

  for (const input of inputs) {
    const outputs = await compilePolicy(input, { formats });

    for (const output of outputs) {
      const destinationPath = resolve(outDir, output.filename);

      if (typeof output.content === "string") {
        const normalizedContent = normalizeGeneratedPolicyContent(
          output.content,
          output.format,
        );

        if (output.format === "html") {
          await writeFile(
            destinationPath,
            wrapHtmlDocument(titleForPolicyType(input.type), normalizedContent),
            "utf8",
          );
        } else {
          await writeFile(destinationPath, normalizedContent, "utf8");
        }
      } else if (output.format === "html") {
        await writeFile(
          destinationPath,
          wrapHtmlDocument(titleForPolicyType(input.type), ""),
          "utf8",
        );
      } else {
        await writeFile(destinationPath, output.content);
      }

      generated.push({
        format: output.format,
        path: destinationPath,
        policyType: input.type,
      });
    }
  }

  return generated;
}

function readArgValue(args: string[], ...names: string[]): string | undefined {
  const index = args.findIndex((arg) => names.includes(arg));
  return index >= 0 ? args[index + 1] : undefined;
}

function parseFormats(args: string[]): OutputFormat[] {
  const rawValue =
    readArgValue(args, "--format", "--formats") ?? "markdown,html,pdf";
  const values = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean) as OutputFormat[];

  const validFormats = ["markdown", "html", "pdf"] as const;
  const invalid = values.filter((value) => !validFormats.includes(value));

  if (invalid.length > 0) {
    throw new Error(
      `Unsupported legal output format(s): ${invalid.join(", ")}.`,
    );
  }

  return values.length > 0 ? values : ["markdown"];
}

function printUsage(): void {
  console.log(`Usage:
  bun ./scripts/openpolicy.ts validate
  bun ./scripts/openpolicy.ts generate --format markdown,html,pdf
  bun ./scripts/openpolicy.ts generate --format markdown --out ./generated/policies`);
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  if (command === "validate") {
    const result = validateOpenPolicyConfig();

    if (result.errors.length === 0) {
      console.log("OpenPolicy validation passed without fatal errors.");
    }

    for (const error of result.errors) {
      console.error(`ERROR ${error}`);
    }

    for (const warning of result.warnings) {
      console.warn(`WARN  ${warning}`);
    }

    if (result.errors.length > 0) {
      process.exitCode = 1;
    }

    return;
  }

  if (command === "generate") {
    const outDir = resolve(
      process.cwd(),
      readArgValue(args, "--out") ?? "./generated/policies",
    );
    const formats = parseFormats(args);
    const generated = await generateOpenPolicyArtifacts({ formats, outDir });

    console.log(`Generated ${generated.length} artifact(s) in ${outDir}.`);
    for (const artifact of generated) {
      console.log(
        `${artifact.policyType}:${artifact.format} -> ${artifact.path}`,
      );
    }
    return;
  }

  throw new Error(`Unknown legal command: ${command}`);
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : "";

if (currentFile === invokedFile) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
