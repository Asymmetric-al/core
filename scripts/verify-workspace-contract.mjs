import fs from "fs/promises";

import { globSync } from "glob";

const rootPkg = JSON.parse(await fs.readFile("package.json", "utf8"));
const requiredGlobs = ["apps/*", "packages/*", "packages/env", "tooling/*"];
const globs = Array.isArray(rootPkg.workspaces) ? rootPkg.workspaces : [];
const violations = [];

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
      if (name.startsWith("@asym/") && version !== "workspace:*") {
        violations.push(
          `${pkgPath}:1: ${depType}.${name}: '${version}' != 'workspace:*'`,
        );
      }
    }
  }
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
  if (missingGlobs.length) {
    violations.push(
      `package.json:workspaces missing required globs: ${missingGlobs.join(", ")}`,
    );
  }
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
    violations.push(`workspace '${requiredPath}' is missing package.json; expected '${pkgPath}' to exist`);
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

if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("Workspace contract verified.");
