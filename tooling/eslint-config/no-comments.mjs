import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

export const commentBaselineFile =
  "tooling/eslint-config/comment-baseline.json";

const SOURCE_FILE = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const JAVASCRIPT_FILE = /\.(?:[cm]?js|jsx)$/;
const BANNED_TREES = /^(?:(?:apps|packages|scripts|tooling|tests)\/|[^/]+$)/;
const GENERATED_OR_DATA = [
  /(?:^|\/)fixtures\//,
  /(?:^|\/)public\//,
  /\.generated\.[^/]+$/,
  /(?:^|\/)next-env\.d\.ts$/,
  /^apps\/admin\/payload-types\.ts$/,
  /^apps\/admin\/app\/\(payload\)\/web-studio\/importMap\.js$/,
  /^apps\/admin\/src\/migrations\//,
  /^apps\/[^/]+\/bones\//,
  /^scripts\/archon-factory\/pack\//,
];

const DIRECTIVES = [
  /^\s*eslint-(?:disable|enable)(?:-next-line|-line)?(?:\s|$)/,
  /^\s*(?:oxlint|react-doctor)-(?:disable|enable)(?:-next-line|-line)?(?:\s|$)/,
  /^\s*@ts-(?:expect-error|ignore|nocheck|check)\b/,
  /^\/\s*<(?:reference|amd-module|amd-dependency)\s/,
  /^\s*(?:prettier|oxfmt)-ignore\b/,
  /^\s*\*?\s*@(?:vitest|jest)-environment(?:-options)?\s/,
  /^\s*@vite-ignore\s*$/,
  /^\s*(?:webpack|turbopack)[A-Z]\w*:/,
  /^\s*(?:v8|c8|istanbul)\s+ignore\b/,
  /^\s*[@#]__(?:PURE|NO_SIDE_EFFECTS)__\s*$/,
  /^\s*\*?\s*@jsx(?:ImportSource|Runtime|Frag)?\s/,
];
const BLOCK_DIRECTIVES = [
  /^\s*eslint(?:-env)?\s/,
  /^\s*globals?\s/,
  /^\s*exported\s/,
  /^!/,
  /^\*?[\s*]*@(?:license|preserve)\b/,
];
const DEPRECATION = /^\*[^]*@deprecated\b/;
const JSDOC_TYPE =
  /^\*[^]*@(?:type|typedef|import|satisfies|template|callback|overload|param|returns?|this|enum|extends|augments|implements|property|prop)\b\s*\{|^\*[^]*@(?:typedef|import|template|overload)\b/;

export function inCommentBanScope(file) {
  return (
    !file.startsWith("../") &&
    SOURCE_FILE.test(file) &&
    BANNED_TREES.test(file) &&
    !GENERATED_OR_DATA.some((pattern) => pattern.test(file))
  );
}

function isMachineRead(comment, file) {
  if (comment.type === "Shebang") return true;
  if (DIRECTIVES.some((pattern) => pattern.test(comment.value))) return true;
  if (comment.type !== "Block") return false;
  return (
    BLOCK_DIRECTIVES.some((pattern) => pattern.test(comment.value)) ||
    DEPRECATION.test(comment.value) ||
    (JAVASCRIPT_FILE.test(file) && JSDOC_TYPE.test(comment.value))
  );
}

export function bannedComments(comments, file) {
  return comments.filter((comment) => !isMachineRead(comment, file));
}

function repositoryFile(root, filename) {
  const relative = path.relative(root, path.resolve(root, filename));
  if (!relative.startsWith("..")) return relative.replaceAll("\\", "/");
  try {
    return path
      .relative(realpathSync(root), realpathSync(filename))
      .replaceAll("\\", "/");
  } catch {
    return relative.replaceAll("\\", "/");
  }
}

export function readCommentBaseline(root = repositoryRoot) {
  return JSON.parse(readFileSync(path.join(root, commentBaselineFile), "utf8"));
}

export function createNoCommentsRule({ root = repositoryRoot, allowance }) {
  return {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Bans comments in first-party source; a file may keep at most the comments its baseline records.",
      },
      schema: [],
      messages: {
        banned:
          "Comments are banned in source. Delete it: a decision goes in an ADR, a workaround in an issue, and a restatement nowhere (docs/ai/skills/delete-comment/SKILL.md).",
        overBaseline:
          "This file has {{count}} comments and its baseline allows {{allowed}}. Comments are banned, so the count only goes down: delete the new one (docs/ai/skills/delete-comment/SKILL.md).",
      },
    },
    create(context) {
      return {
        Program() {
          const file = repositoryFile(root, context.filename);
          if (!inCommentBanScope(file)) return;
          const comments = bannedComments(
            context.sourceCode.getAllComments(),
            file,
          );
          const allowed = allowance(file);
          if (comments.length <= allowed) return;
          for (const comment of comments) {
            context.report({
              loc: comment.loc,
              messageId: allowed > 0 ? "overBaseline" : "banned",
              data: { count: comments.length, allowed },
            });
          }
        },
      };
    },
  };
}

let baseline;
const baselineAllowance = (file) => {
  baseline ??= readCommentBaseline();
  return baseline[file] ?? 0;
};

export const noComments = createNoCommentsRule({
  allowance: baselineAllowance,
});

export const noCommentsPlugin = {
  meta: { name: "core" },
  rules: { "no-comments": noComments },
};

export const noCommentsConfig = [
  {
    name: "core/no-comments",
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { core: noCommentsPlugin },
    rules: { "core/no-comments": "error" },
  },
];
