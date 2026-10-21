import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const pinPath = new URL("../../.node-version", import.meta.url);

export function validateNodeVersion(version, approved) {
  const minimum = /^(\d+)\.(\d+)\.(\d+)$/.exec(approved);
  if (!minimum)
    throw new Error("Invalid approved Node.js pin in .node-version");
  const current = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
  const valid =
    current &&
    Number(current[1]) === Number(minimum[1]) &&
    (Number(current[2]) > Number(minimum[2]) ||
      (Number(current[2]) === Number(minimum[2]) &&
        Number(current[3]) >= Number(minimum[3])));
  if (!valid) {
    throw new Error(
      `Core requires Node.js ${minimum[1]}.x >= ${approved}; found ${version}. Use the version in .node-version.`,
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const approved = readFileSync(fileURLToPath(pinPath), "utf8").trim();
    validateNodeVersion(process.versions.node, approved);
    console.log(
      `Node.js ${process.versions.node} satisfies the approved runtime`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
