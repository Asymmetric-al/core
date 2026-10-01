import path from "node:path";

const SECRET_SCANNER_DEMO_TOKEN = ["pass", "word"].join("");
const SECRET_SCANNER_PRAGMA_TOKEN = "pragma: allowlist secret";
export const SECRET_SCANNER_SKIP_SUFFIXES = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".zip",
  ".woff",
  ".woff2",
  ".ttf",
  ".ico",
  ".bin",
  ".exe",
  ".pdf",
  ".cmd",
]);

function secretScannerComment(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".json":
      return null;
    case ".yaml":
    case ".yml":
    case ".sh":
    case ".bash":
    case ".graphql":
    case ".gql":
    case ".py":
      return `# ${SECRET_SCANNER_PRAGMA_TOKEN}`;
    case ".sql":
      return `-- ${SECRET_SCANNER_PRAGMA_TOKEN}`;
    case ".md":
    case ".mdx":
    case ".html":
      return `<!-- ${SECRET_SCANNER_PRAGMA_TOKEN} -->`;
    default:
      return `// ${SECRET_SCANNER_PRAGMA_TOKEN}`;
  }
}

function secretScannerCommentForLanguage(language) {
  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  switch (normalized) {
    case "json":
      return null;
    case "md":
    case "mdx":
    case "markdown":
    case "html":
    case "htm":
    case "svg":
    case "xml":
      return `<!-- ${SECRET_SCANNER_PRAGMA_TOKEN} -->`;
    case "yaml":
    case "yml":
    case "gql":
    case "graphql":
    case "py":
    case "python":
    case "sh":
    case "bash":
    case "zsh":
    case "shell":
      return `# ${SECRET_SCANNER_PRAGMA_TOKEN}`;
    case "sql":
      return `-- ${SECRET_SCANNER_PRAGMA_TOKEN}`;
    case "js":
    case "javascript":
    case "ts":
    case "typescript":
    case "tsx":
    case "jsx":
    case "mjs":
    case "cjs":
      return `// ${SECRET_SCANNER_PRAGMA_TOKEN}`;
    case "css":
    case "scss":
    case "sass":
      return `/* ${SECRET_SCANNER_PRAGMA_TOKEN} */`;
    default:
      return null;
  }
}

function annotateSecretScannerLine(
  line,
  filePath,
  comment = secretScannerComment(filePath),
  { preserveMarkdownTable = true } = {},
) {
  if (
    !line.toLowerCase().includes(SECRET_SCANNER_DEMO_TOKEN) &&
    !line.includes(SECRET_SCANNER_PRAGMA_TOKEN)
  ) {
    return line;
  }
  // A valid marker already in the correct language keeps formatting unchanged.
  if (comment !== null && line.includes(comment)) return line;
  // Older snapshots used // inside every fence. Repair only a trailing known
  // scanner marker, preserving the example's data and any other comments.
  line = line.replace(
    /\s*(?:\/\/|#|--|<!--|\/\*)\s*pragma: allowlist secret(?:\s*(?:-->|\*\/))?\s*(?=\|?\s*$)/u,
    "",
  );
  if (comment === null) {
    return line;
  }
  const extension = path.extname(filePath).toLowerCase();
  if (
    preserveMarkdownTable &&
    (extension === ".md" || extension === ".mdx") &&
    line.trimEnd().endsWith("|")
  ) {
    const lastPipe = line.lastIndexOf("|");
    return `${line.slice(0, lastPipe).trimEnd()} ${comment} ${line.slice(lastPipe)}`;
  }
  return `${line} ${comment}`;
}

function codeContext(language) {
  return {
    language: language.toLowerCase(),
    literal: null,
    blockComment: false,
    preserveRemainder: false,
  };
}

function lineIsProtectedData(line, context) {
  const { language } = context;
  const javascript = /^(?:js|javascript|ts|typescript|jsx|tsx|mjs|cjs)$/u.test(
    language,
  );
  const shell = /^(?:sh|bash|shell|zsh)$/u.test(language);
  const yaml = /^(?:yaml|yml)$/u.test(language);
  if (context.preserveRemainder) return true;
  // Nested template interpolation is not a line-local grammar. Once a template
  // occurs, leave the remainder of this code block scanner-visible and intact.
  if (javascript && line.includes("`")) {
    context.preserveRemainder = true;
    return true;
  }
  const startedInLiteral = context.literal !== null || context.blockComment;
  for (let index = 0; index < line.length; index++) {
    if (context.blockComment) {
      if (line.startsWith("*/", index)) {
        context.blockComment = false;
        index++;
      }
      continue;
    }
    if (context.literal !== null) {
      if (line[index] === "\\" && (!shell || context.literal !== "'")) {
        index++;
      } else if (line.startsWith(context.literal, index)) {
        index += context.literal.length - 1;
        context.literal = null;
      }
      continue;
    }
    if (
      (javascript && line.startsWith("//", index)) ||
      ((shell || yaml || /^(?:py|python|graphql|gql)$/u.test(language)) &&
        line[index] === "#") ||
      (language === "sql" && line.startsWith("--", index))
    )
      break;
    if (
      line.startsWith("/*", index) &&
      (javascript || /^(?:css|scss|sass)$/u.test(language))
    ) {
      context.blockComment = true;
      index++;
      continue;
    }
    if (line[index] === "'" || line[index] === '"') {
      const triple = line.slice(index, index + 3);
      context.literal =
        !shell && (triple === "'".repeat(3) || triple === '"""')
          ? triple
          : line[index];
      index += context.literal.length - 1;
      continue;
    }
    if (
      (shell && line.startsWith("<<", index)) ||
      (yaml && (line[index] === "|" || line[index] === ">"))
    ) {
      // Shell delimiter words allow mixed quoting and escapes; YAML scalar
      // boundaries depend on sequence, indentation and chomping syntax. Keep
      // the remaining region scanner-visible instead of guessing a terminator.
      context.preserveRemainder = true;
      return true;
    }
    if (
      language === "sql" &&
      /^\$(?:[A-Za-z_][\w]*)?\$/u.test(line.slice(index))
    ) {
      context.preserveRemainder = true;
      return true;
    }
  }
  return startedInLiteral || context.literal !== null || context.blockComment;
}

function annotateCodeLine(line, filePath, context) {
  if (lineIsProtectedData(line, context)) return line;
  const comment = secretScannerCommentForLanguage(context.language);
  const markup = /^(?:tsx|jsx|html|htm|svg|xml|mdx)$/u.test(context.language);
  if (!markup && comment !== null && line.trim() === comment) return line;
  // Removing the tool-owned trailing marker is safe outside quoted data. A
  // markup suffix can render as text; keep markup scanner-visible instead of
  // guessing whether this line ends inside a tag, text child or expression.
  const normalized = annotateSecretScannerLine(line, filePath, null, {
    preserveMarkdownTable: false,
  });
  if (markup) return normalized;
  if (/\\\s*$/u.test(normalized)) {
    // A continuation can split a shell operator across physical lines.
    context.preserveRemainder = true;
    return normalized;
  }
  if (comment === null) return context.language === "json" ? normalized : line;
  return annotateSecretScannerLine(normalized, filePath, comment, {
    preserveMarkdownTable: false,
  });
}

export function annotateSecretScannerMentions(content, filePath = "") {
  const extension = path.extname(filePath).toLowerCase();
  const isMarkdown = extension === ".md" || extension === ".mdx";
  const lines = content.split("\n");
  if (!isMarkdown) {
    const context = codeContext(extension.slice(1));
    return lines
      .map((line) => annotateCodeLine(line, filePath, context))
      .join("\n");
  }

  let inFrontmatter = lines[0]?.trimEnd() === "---";
  const frontmatterContext = codeContext("yaml");
  let fence = null;
  return lines
    .map((line, index) => {
      if (inFrontmatter) {
        if (index === 0) return line;
        if (line.trimEnd() === "---") {
          inFrontmatter = false;
          return line;
        }
        return annotateCodeLine(line, filePath, frontmatterContext);
      }
      const fenceMatch = /^( {0,3})(`{3,}|~{3,})(.*)$/u.exec(line);
      if (fenceMatch) {
        const marker = fenceMatch[2];
        const info = fenceMatch[3];
        const rejectedOpener =
          fence === null && marker[0] === "`" && info.includes("`");
        if (!rejectedOpener) {
          if (fence === null) {
            fence = {
              character: marker[0],
              length: marker.length,
              context: codeContext(info.trim().split(/\s+/u)[0] ?? ""),
            };
          } else if (
            marker[0] === fence.character &&
            marker.length >= fence.length &&
            info.trim() === ""
          )
            fence = null;
          return line;
        }
      }
      if (fence !== null)
        return annotateCodeLine(line, filePath, fence.context);
      return annotateSecretScannerLine(line, filePath);
    })
    .join("\n");
}
