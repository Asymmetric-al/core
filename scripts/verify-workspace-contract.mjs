import fs from "fs/promises";

import { globSync } from "glob";
import ts from "typescript";

const rootPkg = JSON.parse(await fs.readFile("package.json", "utf8"));
const requiredGlobs = ["apps/*", "packages/*", "packages/env", "tooling/*"];
const globs = Array.isArray(rootPkg.workspaces) ? rootPkg.workspaces : [];
const violations = [];
const allowedVendoredAsymTarballs = new Map([
  ["@asym/docraptor-client", "asym-docraptor-client-0.0.0.tgz"],
  ["@asym/pdf-editor", "asym-pdf-editor-0.0.0.tgz"],
  ["@asym/pdf-renderer", "asym-pdf-renderer-0.0.0.tgz"],
  ["@asym/pdf-studio-adapter", "asym-pdf-studio-adapter-0.0.0.tgz"],
  ["@asym/pdf-template-schema", "asym-pdf-template-schema-0.0.0.tgz"],
]);

function getScriptKind(filePath) {
  if (filePath.endsWith(".tsx")) {
    return ts.ScriptKind.TSX;
  }

  if (filePath.endsWith(".jsx")) {
    return ts.ScriptKind.JSX;
  }

  if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) {
    return ts.ScriptKind.JS;
  }

  return ts.ScriptKind.TS;
}

function getExportedConstNames(content, filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );
  const exportedConstNames = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    const hasExportModifier = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );

    if (!hasExportModifier) {
      continue;
    }

    const isConstDeclaration =
      (statement.declarationList.flags & ts.NodeFlags.Const) !== 0;
    if (!isConstDeclaration) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name)) {
        exportedConstNames.push(declaration.name.text);
      }
    }
  }

  return exportedConstNames;
}

function verifyAsymDeps(pkg, pkgPath) {
  for (const [depType, deps] of Object.entries({
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
    peerDependencies: pkg.peerDependencies,
  })) {
    if (!deps) {
      continue;
    }
    for (const [name, version] of Object.entries(deps)) {
      if (
        name.startsWith("@asym/") &&
        version !== "workspace:*" &&
        !isAllowedVendoredAsymDependency(name, version)
      ) {
        violations.push(
          `${pkgPath}:1: ${depType}.${name}: '${version}' != 'workspace:*' or approved vendored tarball`,
        );
      }
    }
  }
}

function isAllowedVendoredAsymDependency(name, version) {
  const expectedTarball = allowedVendoredAsymTarballs.get(name);
  if (!expectedTarball || typeof version !== "string") {
    return false;
  }

  const filePrefix = "file:";
  if (!version.startsWith(filePrefix)) {
    return false;
  }

  const normalizedPath = version
    .slice(filePrefix.length)
    .replaceAll("\\", "/")
    .replace(/^(\.\.\/)+/, "");

  return normalizedPath === `vendor/react-pdf-packages/${expectedTarball}`;
}

const missingGlobs = requiredGlobs.filter((g) => !globs.includes(g));

if (!Array.isArray(rootPkg.workspaces)) {
  violations.push(
    `package.json:workspaces must be an array containing ${JSON.stringify(requiredGlobs)}; got ${JSON.stringify(rootPkg.workspaces)}`,
  );
}

if (missingGlobs.length) {
  violations.push(
    `package.json:workspaces must contain required entries: ${JSON.stringify(requiredGlobs)}`,
  );
  violations.push(
    `package.json:workspaces missing required globs: ${missingGlobs.join(", ")}`,
  );
}

verifyAsymDeps(rootPkg, "package.json");

for (const requiredGlob of requiredGlobs.filter((g) => g.includes("*"))) {
  const pkgPaths = globSync(`${requiredGlob}/package.json`);
  if (pkgPaths.length === 0) {
    violations.push(
      `workspace '${requiredGlob}' has no packages; expected at least one package.json matching '${requiredGlob}/package.json'`,
    );
  }
}

for (const requiredPath of requiredGlobs.filter((g) => !g.includes("*"))) {
  const pkgPath = `${requiredPath}/package.json`;
  try {
    await fs.access(pkgPath);
  } catch {
    violations.push(
      `workspace '${requiredPath}' is missing package.json; expected '${pkgPath}' to exist`,
    );
  }
}

for (const g of globs) {
  const pkgPaths = globSync(`${g}/package.json`);
  for (const pkgPath of pkgPaths) {
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    if (!pkg.name?.startsWith("@asym/")) {
      violations.push(`${pkgPath}:1: invalid name '${pkg.name || "missing"}'`);
    }
    verifyAsymDeps(pkg, pkgPath);
  }
}

const disallowedRouteSegmentConfigKeys = [
  "runtime",
  "dynamic",
  "dynamicParams",
  "revalidate",
  "fetchCache",
  "preferredRegion",
  "maxDuration",
];
const appSegmentConfigFilePaths = [
  ...new Set(
    globSync("apps/*/app/**/{route,layout,page}.{ts,tsx,js,jsx,mts,mjs}"),
  ),
];
const runtimeMapPath = "docs/guides/architecture/runtime-map.md";

function getRuntimeMapRouteEntries(runtimeMap) {
  return new Set(
    runtimeMap
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("|"))
      .filter((line) => !line.includes("| App"))
      .filter((line) => !line.includes("| ---"))
      .map((line) => line.split("|").map((part) => part.trim()))
      .map((parts) => [parts[1], parts[2]])
      .filter(([app, routeCell]) => app && routeCell)
      .map(([app, routeCell]) => `${app}: ${routeCell.replaceAll("`", "")}`),
  );
}

function getCurrentApiRouteEntries() {
  return [
    ...new Set(globSync("apps/*/app/api/**/route.ts")),
    ...new Set(globSync("apps/*/app/api/**/route.tsx")),
  ]
    .sort()
    .map((filePath) => {
      const normalized = filePath.replace(/\\/g, "/");
      const segments = normalized.split("/");
      const app = segments[1];
      const route = `/${segments.slice(3, -1).join("/")}`;
      return `${app}: ${route}`;
    });
}

for (const filePath of appSegmentConfigFilePaths) {
  const content = await fs.readFile(filePath, "utf8");
  const exportedConstNames = new Set(getExportedConstNames(content, filePath));

  for (const key of disallowedRouteSegmentConfigKeys) {
    if (exportedConstNames.has(key)) {
      violations.push(
        `${filePath}: disallowed route segment config export "${key}" while cacheComponents is enabled`,
      );
    }
  }
}

try {
  const runtimeMap = await fs.readFile(runtimeMapPath, "utf8");
  const runtimeMapEntries = getRuntimeMapRouteEntries(runtimeMap);
  const currentApiRoutes = getCurrentApiRouteEntries();
  for (const route of currentApiRoutes) {
    if (!runtimeMapEntries.has(route)) {
      violations.push(
        `${runtimeMapPath}: missing runtime map route entry '${route}'`,
      );
    }
  }
} catch {
  violations.push(`${runtimeMapPath}: missing runtime map documentation file`);
}

const disallowedPrivateCaptureRoutePaths = [
  ...new Set(globSync("apps/*/app/**/__*__/**/page.{ts,tsx,js,jsx,mts,mjs}")),
];

for (const filePath of disallowedPrivateCaptureRoutePaths) {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.includes("/__boneyard__/")) {
    violations.push(
      `${filePath}: private capture routes are not routable in Next.js App Router; move this page to a public segment like app/boneyard/...`,
    );
  }
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("Workspace contract verified.");
