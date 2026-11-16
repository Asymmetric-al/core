// Role tool and path policy, evaluated by the PreToolUse guard for every tool
// call a factory role makes. Fail closed: no context, unknown node, unknown
// tool or unresolvable path is a denial.
import path from "node:path";

const posix = path.posix;

export const ROLE_TOOLS = {
  samson: ["Read", "Grep", "Glob", "TodoWrite"],
  ezra: [
    "Read",
    "Grep",
    "Glob",
    "TodoWrite",
    "Write",
    "Edit",
    "mcp__core-check__run_check",
  ],
  bezalel: [
    "Read",
    "Grep",
    "Glob",
    "TodoWrite",
    "Write",
    "Edit",
    "NotebookEdit",
    "mcp__core-check__run_check",
  ],
  micaiah: ["Read", "Grep", "Glob", "TodoWrite", "mcp__core-check__run_check"],
  luke: ["Read", "Grep", "Glob", "TodoWrite", "mcp__core-check__run_check"],
  agabus: ["Read", "Grep", "Glob", "TodoWrite", "mcp__core-check__run_check"],
  analyst: [],
};

const WRITE_TOOLS = new Set(["Write", "Edit", "NotebookEdit"]);

function pathArgument(tool, input) {
  switch (tool) {
    case "Read":
    case "Write":
    case "Edit":
      return input?.file_path;
    case "NotebookEdit":
      return input?.notebook_path;
    case "Glob":
    case "Grep":
      return input?.path;
    default:
      return undefined;
  }
}

export function globToRegExp(glob) {
  let source = "";
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === "*") {
      if (glob[index + 1] === "*") {
        const slash = glob[index + 2] === "/";
        source += slash ? "(?:.*/)?" : ".*";
        index += slash ? 2 : 1;
      } else source += "[^/]*";
    } else if (char === "?") source += "[^/]";
    else source += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${source}$`);
}

const within = (candidate, root) =>
  candidate === root ||
  candidate.startsWith(root.endsWith("/") ? root : `${root}/`);

// Glob patterns (Glob's `pattern`, Grep's `glob`) are paths; Grep's
// `pattern` is a regular expression and is not checked here.
function unsafePattern(pattern) {
  return (
    typeof pattern === "string" &&
    (posix.isAbsolute(pattern) ||
      pattern.includes("..") ||
      pattern.startsWith("~"))
  );
}

// realpath fails on a dangling symlink exactly as on a missing file, but a
// write through the link creates its target wherever it points. A write
// target is new only when lstat (which does not follow the final link)
// confirms nothing exists there; without lstat the answer is unknown.
function entryAt(lstat, file) {
  if (typeof lstat !== "function") return { state: "unknown" };
  try {
    return { state: "present", stat: lstat(file) };
  } catch (error) {
    return { state: error?.code === "ENOENT" ? "absent" : "unknown" };
  }
}

// A new file may need new directories. When its parent does not resolve,
// walk up to the nearest existing ancestor, which must be a real directory
// (not a link); the path is resolved from that ancestor's real path plus the
// lexical remainder (already free of '..').
function newWriteTarget(lexical, { realpath, lstat }) {
  const target = entryAt(lstat, lexical);
  if (target.state === "present")
    return { deny: "Write target is a link that does not resolve" };
  if (target.state === "unknown") return { deny: "Path does not resolve" };
  try {
    return {
      real: posix.join(
        realpath(posix.dirname(lexical)),
        posix.basename(lexical),
      ),
    };
  } catch {}
  const rest = [posix.basename(lexical)];
  let ancestor = posix.dirname(lexical);
  let found = entryAt(lstat, ancestor);
  while (found.state === "absent" && ancestor !== "/") {
    rest.unshift(posix.basename(ancestor));
    ancestor = posix.dirname(ancestor);
    found = entryAt(lstat, ancestor);
  }
  if (found.state === "unknown") return { deny: "Path does not resolve" };
  if (found.state === "absent")
    return { deny: "Parent directory does not resolve" };
  if (rest.length > 1) {
    if (found.stat?.isSymbolicLink?.() !== false)
      return { deny: "Parent directory is a link" };
    if (found.stat?.isDirectory?.() !== true)
      return { deny: "Parent directory does not resolve" };
  }
  try {
    return { real: posix.join(realpath(ancestor), ...rest) };
  } catch {
    return { deny: "Parent directory does not resolve" };
  }
}

// `context` is the trusted per-run file written before any role runs.
// `role` is that file's entry for the calling node.
export function decide({
  context,
  nodePath,
  tool,
  input,
  cwd,
  realpath,
  lstat,
}) {
  const deny = (reason) => ({ decision: "deny", reason });
  if (!context || context.v !== 1) return deny("No trusted run context");
  const entry = context.nodes?.[nodePath];
  if (!entry)
    return deny(`Node ${nodePath ?? "(unknown)"} has no factory role`);
  // StructuredOutput is how a node returns its declared result; every role
  // needs it and it touches no files.
  if (tool === "StructuredOutput")
    return { decision: "allow", reason: "result channel" };
  const allowed = ROLE_TOOLS[entry.role] ?? [];
  if (!allowed.includes(tool)) return deny(`${entry.role} may not use ${tool}`);
  if (tool.startsWith("mcp__")) {
    if (!entry.check) return deny(`${entry.role} has no check workspace`);
    return { decision: "allow", reason: "qualified check executor" };
  }
  if (tool === "TodoWrite") return { decision: "allow", reason: "planning" };
  if (
    (tool === "Glob" && unsafePattern(input?.pattern)) ||
    unsafePattern(input?.glob)
  )
    return deny("Search patterns must be relative without '..'");
  const requested = pathArgument(tool, input);
  if (requested === undefined && WRITE_TOOLS.has(tool))
    return deny("Write tool without a path");
  const base = typeof cwd === "string" && posix.isAbsolute(cwd) ? cwd : null;
  if (requested === undefined && !base) return deny("No working directory");
  if (
    requested !== undefined &&
    (typeof requested !== "string" || requested.includes("\0"))
  )
    return deny("Malformed path");
  const lexical = posix.resolve(base ?? "/", requested ?? ".");
  let real;
  try {
    real = realpath(lexical);
  } catch {
    if (!WRITE_TOOLS.has(tool)) return deny("Path does not resolve");
    const created = newWriteTarget(lexical, { realpath, lstat });
    if (created.deny) return deny(created.deny);
    real = created.real;
  }
  if (real.split("/").includes(".git") || /\/\.git$/.test(real))
    return deny("Git metadata is factory-owned");
  if (WRITE_TOOLS.has(tool)) {
    const roots = entry.write ?? [];
    const permitted = roots.some(({ root, globs }) => {
      if (!within(real, root)) return false;
      const relative = posix.relative(root, real);
      return (globs ?? []).some((glob) => globToRegExp(glob).test(relative));
    });
    const excluded = (entry.denyWrite ?? []).some(({ root, globs }) => {
      if (!within(real, root)) return false;
      const relative = posix.relative(root, real);
      return (globs ?? []).some((glob) => globToRegExp(glob).test(relative));
    });
    if (!permitted || excluded)
      return deny(`${entry.role} may not write ${real}`);
    return { decision: "allow", reason: "assigned path" };
  }
  const readable = (entry.read ?? []).some((root) => within(real, root));
  if (!readable) return deny(`${entry.role} may not read ${real}`);
  return { decision: "allow", reason: "allowed root" };
}
