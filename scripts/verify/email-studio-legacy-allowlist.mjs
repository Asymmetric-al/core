import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const mode =
  process.env.EMAIL_STUDIO_UNLAYER_MODE === "zero" ? "zero" : "legacy";
const searchPattern =
  "Unlayer|unlayer|react-email-editor|NEXT_PUBLIC_UNLAYER|UNLAYER_API_KEY|UnlayerDesignJSON|UnlayerExportHTML|unlayer-editor-wrapper";

const legacyAllowedPathPatterns = [
  /^\.env\.example$/,
  /^apps\/admin\/app\/email\/page-client\.tsx$/,
  /^apps\/admin\/app\/pdf\/page-client\.tsx$/,
  /^apps\/admin\/lib\/pdf-studio\.ts$/,
  /^apps\/donor\/openpolicy\.ts$/,
  /^bun\.lock$/,
  /^docs\/ai\/OPENPOLICY-[A-Z-]+\.md$/,
  /^docs\/ai\/stack-registry\.md$/,
  /^docs\/env-var-audit\.md$/,
  /^docs\/guides\/development\/getting-started\.md$/,
  /^docs\/guides\/features\/email-studio\.md$/,
  /^docs\/guides\/features\/openpolicy-legal-pages\.md$/,
  /^docs\/guides\/features\/pdf-studio\.md$/,
  /^packages\/api\/src\/email\/template-store\.ts$/,
  /^packages\/api\/src\/email\/template-test-send\.ts$/,
  /^packages\/api\/src\/email\/templates\.ts$/,
  /^packages\/config\/email-studio\.ts$/,
  /^packages\/config\/pdf-studio\.ts$/,
  /^packages\/database\/types\/database\.ts$/,
  /^packages\/email\//,
  /^packages\/env\/src\/schema\.ts$/,
  /^packages\/ui\/components\/studio\/EmailStudioEditor\.tsx$/,
  /^packages\/ui\/components\/studio\/EmailStudioProviderStatus\.tsx$/,
  /^packages\/ui\/components\/studio\/PDFStudioSetupStatus\.tsx$/,
  /^packages\/ui\/components\/studio\/legacy\//,
  /^packages\/ui\/package\.json$/,
  /^packages\/ui\/styles\/globals\.css$/,
  /^scripts\/verify\/email-studio-legacy-allowlist\.mjs$/,
  /^supabase\/migrations\/20260511023547_email_studio_react_email_builder\.sql$/,
  /^supabase\/schema\.sql$/,
  /^tests\/unit\/packages\/email\//,
  /^tests\/unit\/packages\/ui\/studio\/react-email-editor\.test\.tsx$/,
];

function normalizePath(filePath) {
  return filePath.replace(/^\.\//, "");
}

function parseRgLine(line) {
  const first = line.indexOf(":");
  if (first === -1) return null;
  const second = line.indexOf(":", first + 1);
  if (second === -1) return null;

  return {
    path: normalizePath(line.slice(0, first)),
    lineNumber: line.slice(first + 1, second),
    text: line.slice(second + 1),
  };
}

const result = spawnSync(
  "rg",
  ["-n", "--no-heading", "--color", "never", searchPattern, "."],
  {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
  },
);

if (result.error) {
  console.error(`error: Failed to run rg: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0 && result.status !== 1) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const hits = result.stdout
  .split(/\r?\n/)
  .filter(Boolean)
  .map(parseRgLine)
  .filter(Boolean);

if (mode === "zero") {
  if (hits.length > 0) {
    console.error(
      "Email Studio Unlayer decommission check failed: residual references found.",
    );
    console.error(
      hits
        .map((hit) => `${hit.path}:${hit.lineNumber}:${hit.text.trim()}`)
        .join("\n"),
    );
    process.exit(1);
  }

  console.log(
    "Email Studio Unlayer decommission check passed: zero references.",
  );
  process.exit(0);
}

const violations = hits.filter(
  (hit) =>
    !legacyAllowedPathPatterns.some((allowedPath) =>
      allowedPath.test(hit.path),
    ),
);

if (violations.length > 0) {
  console.error(
    "Email Studio legacy Unlayer allowlist check failed. Move these references into an approved legacy/PDF/decommission path or remove them:",
  );
  console.error(
    violations
      .map((hit) => `${hit.path}:${hit.lineNumber}:${hit.text.trim()}`)
      .join("\n"),
  );
  process.exit(1);
}

console.log(
  `Email Studio legacy Unlayer allowlist check passed: ${hits.length} references are inside approved legacy/decommission paths.`,
);
