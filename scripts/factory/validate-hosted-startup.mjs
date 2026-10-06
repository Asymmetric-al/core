import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const roles = ["samson", "ezra", "bezalel", "micaiah", "luke", "agabus"];
const requiredTools = [
  "collaboration.spawn_agent",
  "collaboration.followup_task",
  "collaboration.wait_agent",
  "update_plan",
];
const markers = [
  "<!-- BEGIN Samson coordination policy -->",
  "<!-- END Samson coordination policy -->",
];

function blocked(reason) {
  throw new Error(`BLOCKED: ${reason}`);
}

function readAsset(file, label) {
  try {
    const bytes = readFileSync(file);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!text.trim()) blocked(`Empty ${label}: ${file}`);
    return { bytes, text };
  } catch (error) {
    blocked(`Cannot read valid ${label}: ${file} (${error.message})`);
  }
}

function policyBlock(text, label) {
  const lines = text.split(/\r?\n/);
  const positions = markers.map((marker) => lines.indexOf(marker));
  if (
    markers.some((marker) => text.split(marker).length !== 2) ||
    positions[0] < 0 ||
    positions[1] <= positions[0] ||
    !lines
      .slice(positions[0] + 1, positions[1])
      .join("\n")
      .trim()
  )
    blocked(`Malformed coordination policy in ${label}`);
  // Compare the owned bytes, without requiring identical surrounding guidance.
  const start = text.indexOf(markers[0]);
  const end = text.indexOf(markers[1]) + markers[1].length;
  return text.slice(start, end);
}

/** Read-only retained-asset/tool validation; no installation or handoff is performed.
 * nativeTools must be the caller's observed registered tool IDs. Returned role
 * settings are requested settings, not proof of runtime enforcement or isolation.
 */
export function validateHostedStartup({
  sourceRoot,
  consumedRoleRoot,
  home,
  workspaceRoot,
  nativeTools,
  expectedNodeVersion,
  expectedBunVersion,
  execute = spawnSync,
} = {}) {
  for (const [name, value] of Object.entries({
    sourceRoot,
    consumedRoleRoot,
    home,
    workspaceRoot,
  }))
    if (typeof value !== "string" || !value.trim())
      blocked(`Explicit ${name} path is required`);
  for (const [tool, version] of [
    ["node", expectedNodeVersion],
    ["bun", expectedBunVersion],
  ])
    if (
      typeof version !== "string" ||
      !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)
    )
      blocked(`Explicit reviewed ${tool} version pin is required`);
  for (const tool of requiredTools)
    if (!Array.isArray(nativeTools) || !nativeTools.includes(tool))
      blocked(`Required registered native tool unavailable: ${tool}`);

  const assets = [];
  function matched(relative, installed, label) {
    const file = path.join(sourceRoot, relative);
    const source = readAsset(file, label);
    const personal = readAsset(path.join(home, installed), label);
    if (!source.bytes.equals(personal.bytes))
      blocked(`Mismatched retained and personal ${label}: ${file}`);
    assets.push({
      path: file,
      personalPath: path.join(home, installed),
      sha256: createHash("sha256").update(source.bytes).digest("hex"),
    });
    return source.text;
  }
  const skill = matched(
    "docs/ai/skills/samson-factory/SKILL.md",
    ".agents/skills/samson-factory/SKILL.md",
    "coordinator skill",
  );
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter || !/^#\s+\S/m.test(skill.slice(frontmatter[0].length)))
    blocked(
      "Malformed coordinator skill: expected samson-factory frontmatter and heading",
    );
  const protocol = matched(
    "docs/ai/skills/samson-factory/references/protocol.md",
    ".agents/skills/samson-factory/references/protocol.md",
    "coordinator protocol",
  );
  if (!/^#\s+\S/m.test(protocol))
    blocked("Malformed coordinator protocol: expected a Markdown heading");

  const roleAssets = roles.map((role) => {
    const file = path.join(sourceRoot, `.codex/agents/${role}.toml`);
    const consumedPath = path.join(consumedRoleRoot, `${role}.toml`);
    const source = readAsset(file, `${role} role source`);
    const consumed = readAsset(consumedPath, `${role} consumed role`);
    if (!source.bytes.equals(consumed.bytes))
      blocked(`Mismatched retained and consumed ${role} role: ${consumedPath}`);
    assets.push({
      path: file,
      consumedPath,
      sha256: createHash("sha256").update(consumed.bytes).digest("hex"),
    });
    return { role, text: consumed.text };
  });
  const policyFile = path.join(sourceRoot, ".codex/factory-AGENTS.md");
  const policy = readAsset(policyFile, "coordination policy");
  const workspaceFile = path.join(workspaceRoot, "AGENTS.md");
  const workspace = readAsset(workspaceFile, "workspace coordination policy");
  if (
    policyBlock(policy.text, policyFile) !==
    policyBlock(workspace.text, workspaceFile)
  )
    blocked(`Mismatched workspace coordination policy: ${workspaceFile}`);
  assets.push({
    path: policyFile,
    workspacePath: workspaceFile,
    sha256: createHash("sha256")
      .update(policyBlock(policy.text, policyFile))
      .digest("hex"),
  });

  function run(tool, args, input) {
    let result;
    try {
      result = execute(tool, args, {
        cwd: workspaceRoot,
        encoding: "utf8",
        shell: false,
        ...(input === undefined ? {} : { input }),
      });
    } catch (error) {
      blocked(`Required executable ${tool} failed: ${error.message}`);
    }
    if (result?.error || result?.status !== 0) {
      const diagnostic =
        result?.error?.message ||
        result?.stdout?.trim() ||
        (tool === "python3"
          ? "Role parsing requires Python 3.11 or later with tomllib; verify the required runtime is available."
          : "No safe executable diagnostic available.");
      blocked(
        `Required executable ${tool} failed (status ${result?.status ?? "unavailable"}): ${diagnostic}`,
      );
    }
    return result.stdout?.trim() ?? "";
  }
  const versions = {};
  for (const [tool, pattern] of [
    ["bash", /^GNU bash, version \d+\.\d+/],
    ["git", /^git version \d+\.\d+/],
    ["gh", /^gh version \d+\.\d+/],
    ["node", /^v\d+\.\d+\.\d+(?:-[\w.-]+)?$/],
    ["bun", /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/],
  ]) {
    const version = run(tool, ["--version"]);
    if (!pattern.test(version)) blocked(`Invalid ${tool} version output`);
    versions[tool] = version;
  }
  if (versions.node !== `v${expectedNodeVersion}`)
    blocked(
      `node version mismatch: expected ${expectedNodeVersion}, observed ${versions.node}`,
    );
  if (versions.bun !== expectedBunVersion)
    blocked(
      `bun version mismatch: expected ${expectedBunVersion}, observed ${versions.bun}`,
    );

  // The pinned runtime supplies YAML parsing without dependencies or installation.
  // Pass retained metadata through stdin, never interpolate it into executable code.
  let metadata;
  try {
    metadata = JSON.parse(
      run(
        "bun",
        [
          "-e",
          "process.stdout.write(JSON.stringify(Bun.YAML.parse(await Bun.stdin.text())))",
        ],
        frontmatter[1],
      ),
    );
  } catch (error) {
    blocked(`Malformed coordinator skill frontmatter: ${error.message}`);
  }
  if (
    metadata === null ||
    typeof metadata !== "object" ||
    Array.isArray(metadata) ||
    !Object.hasOwn(metadata, "name") ||
    metadata.name !== "samson-factory" ||
    !Object.hasOwn(metadata, "description") ||
    typeof metadata.description !== "string" ||
    !metadata.description.trim()
  )
    blocked(
      "Malformed coordinator skill frontmatter: expected name samson-factory and nonempty string description",
    );

  const parsed = run(
    "python3",
    [
      "-B",
      "-c",
      `import json, re, sys, tomllib
if sys.version_info < (3, 11):
    sys.exit("Python 3.11 or later is required")
settings = {}
instructions = {}
for asset in json.load(sys.stdin):
    role = asset["role"]
    try:
        data = tomllib.loads(asset["text"])
        for key in ("developer_instructions", "model", "model_reasoning_effort"):
            if not isinstance(data.get(key), str) or not data[key].strip():
                raise ValueError("missing nonempty own " + key)
        if not re.match(r"\\s*You are " + role + r"(?=[.,\\s]|$)", data["developer_instructions"], re.IGNORECASE):
            raise ValueError("incorrect role identity")
        instructions[role] = data["developer_instructions"]
        settings[role] = {key: data[key] for key in ("model", "model_reasoning_effort")}
    except (tomllib.TOMLDecodeError, ValueError) as error:
        print(role + " role: " + str(error))
        sys.exit(1)
print(json.dumps({"requestedRoleSettings": settings, "roleInstructions": instructions}))`,
    ],
    JSON.stringify(roleAssets),
  );
  let requestedRoleSettings;
  let roleInstructions;
  try {
    ({ requestedRoleSettings, roleInstructions } = JSON.parse(parsed));
    if (
      roles.some(
        (role) =>
          typeof roleInstructions?.[role] !== "string" ||
          !roleInstructions[role].trim() ||
          !new RegExp(`^\\s*You are ${role}(?=[.,\\s]|$)`, "i").test(
            roleInstructions[role],
          ) ||
          ["model", "model_reasoning_effort"].some(
            (key) =>
              typeof requestedRoleSettings?.[role]?.[key] !== "string" ||
              !requestedRoleSettings[role][key].trim(),
          ),
      )
    )
      blocked("Incomplete python3 role validation response");
  } catch (error) {
    blocked(`Invalid python3 role validation response: ${error.message}`);
  }
  return {
    assets,
    versions,
    nativeTools: [...requiredTools],
    requestedRoleSettings,
    roleInstructions,
  };
}
