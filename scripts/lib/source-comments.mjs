import { parse } from "@typescript-eslint/parser";

import { bannedComments } from "../../tooling/eslint-config/no-comments.mjs";

const TYPESCRIPT_FILE = /\.[cm]?ts$/;

export function mayHoldComments(text) {
  return text.includes("//") || text.includes("/*");
}

export function parseSource(text, file) {
  try {
    return parse(text, {
      filePath: file,
      ecmaFeatures: { jsx: !TYPESCRIPT_FILE.test(file) },
      loc: true,
      range: true,
    });
  } catch (error) {
    throw new Error(`Cannot parse ${file}: ${error.message}`, { cause: error });
  }
}

export function bannedIn(ast, text, file) {
  return bannedComments(
    (ast.comments ?? []).map((comment) =>
      comment.range[0] === 0 && text.startsWith("#!")
        ? { ...comment, type: "Shebang" }
        : comment,
    ),
    file,
  );
}
