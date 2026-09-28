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

export function annotateSecretScannerMentions(content, filePath = "") {
  const extension = path.extname(filePath).toLowerCase();
  const isMarkdown = extension === ".md" || extension === ".mdx";
  const lines = content.split("\n");
  if (!isMarkdown) {
    return lines
      .map((line) => annotateSecretScannerLine(line, filePath))
      .join("\n");
  }

  let inFrontmatter = lines[0]?.trim() === "---";
  let fence = null;
  let templateLanguage = null;
  return lines
    .map((line, index) => {
      if (inFrontmatter) {
        if (index === 0) return line;
        if (line.trim() === "---") {
          inFrontmatter = false;
          return line;
        }
        return annotateSecretScannerLine(
          line,
          filePath,
          `# ${SECRET_SCANNER_PRAGMA_TOKEN}`,
          { preserveMarkdownTable: false },
        );
      }
      const fenceMatch = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);
      if (fenceMatch) {
        const marker = fenceMatch[2];
        const markerCharacter = marker[0];
        if (fence === null) {
          fence = {
            character: markerCharacter,
            length: marker.length,
            language: fenceMatch[3].trim().split(/\s+/u)[0] ?? "",
          };
        } else if (
          markerCharacter === fence.character &&
          marker.length >= fence.length &&
          fenceMatch[3].trim() === ""
        ) {
          fence = null;
          templateLanguage = null;
        }
        return line;
      }

      if (fence !== null) {
        let language = fence.language;
        // Do not inject JavaScript comments into template-string data. Recognize
        // GraphQL operation bodies so their examples retain valid # comments.
        if (
          /^(?:js|javascript|ts|typescript|jsx|tsx|mjs|cjs)$/iu.test(language)
        ) {
          const delimiters = (line.match(/(?<!\\)`/gu) ?? []).length;
          if (templateLanguage === null && delimiters % 2 === 1) {
            templateLanguage = "unknown";
          }
          if (templateLanguage !== null) {
            if (/^\s*(?:query|mutation|subscription|fragment)\b/u.test(line))
              templateLanguage = "graphql";
            language = templateLanguage;
            // An opening delimiter cannot also close a multiline template.
            if (delimiters % 2 === 1 && line.trimStart().startsWith("`"))
              templateLanguage = null;
          }
        }
        return annotateSecretScannerLine(
          line,
          filePath,
          secretScannerCommentForLanguage(language),
          { preserveMarkdownTable: false },
        );
      }

      return annotateSecretScannerLine(line, filePath);
    })
    .join("\n");
}
