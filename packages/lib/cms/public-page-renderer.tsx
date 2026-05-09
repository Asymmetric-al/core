import type { ReactNode } from "react";

type LexicalNode = {
  children?: unknown;
  format?: unknown;
  tag?: unknown;
  text?: unknown;
  type?: unknown;
  url?: unknown;
};

const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export function renderPublicCmsPageContent(
  content: unknown,
  pageId: string,
): ReactNode[] | null {
  if (!content || typeof content !== "object") {
    return null;
  }

  const root = (content as { root?: unknown }).root;
  if (!isLexicalNode(root)) {
    return null;
  }

  const children = getChildren(root);
  if (!children.length) {
    return null;
  }

  const rendered = children.flatMap((node, index) => {
    const result = renderLexicalNode(node, `${pageId}-${index}`);
    return result ? [result] : [];
  });

  return rendered.length ? rendered : null;
}

function renderInlineText(node: LexicalNode, key: string): ReactNode {
  let content: ReactNode = typeof node.text === "string" ? node.text : null;
  const format = typeof node.format === "number" ? node.format : 0;

  if ((format & 1) === 1) {
    content = <strong key={`${key}-strong`}>{content}</strong>;
  }

  if ((format & 2) === 2) {
    content = <em key={`${key}-em`}>{content}</em>;
  }

  return content;
}

function renderChildren(node: LexicalNode, key: string) {
  return getChildren(node).map((child, index) =>
    renderLexicalNode(child, `${key}-${index}`),
  );
}

function renderLexicalNode(node: LexicalNode, key: string): ReactNode {
  switch (node.type) {
    case "text":
      return renderInlineText(node, key);
    case "linebreak":
      return <br key={key} />;
    case "link":
      return (
        <a key={key} href={sanitizePublicCmsHref(node.url)}>
          {renderChildren(node, key)}
        </a>
      );
    case "heading":
      return renderHeading(node, key);
    case "ul":
      return <ul key={key}>{renderChildren(node, key)}</ul>;
    case "ol":
      return <ol key={key}>{renderChildren(node, key)}</ol>;
    case "listitem":
      return <li key={key}>{renderChildren(node, key)}</li>;
    case "quote":
      return <blockquote key={key}>{renderChildren(node, key)}</blockquote>;
    case "paragraph":
      return <p key={key}>{renderChildren(node, key)}</p>;
    default:
      return getChildren(node).length ? (
        <div key={key}>{renderChildren(node, key)}</div>
      ) : null;
  }
}

function renderHeading(node: LexicalNode, key: string) {
  const children = renderChildren(node, key);

  switch (node.tag) {
    case "h1":
      return <h1 key={key}>{children}</h1>;
    case "h3":
      return <h3 key={key}>{children}</h3>;
    case "h4":
      return <h4 key={key}>{children}</h4>;
    case "h5":
      return <h5 key={key}>{children}</h5>;
    case "h6":
      return <h6 key={key}>{children}</h6>;
    default:
      return <h2 key={key}>{children}</h2>;
  }
}

function sanitizePublicCmsHref(value: unknown) {
  if (typeof value !== "string") {
    return "#";
  }

  const href = value.trim();
  if (!href || href.startsWith("//")) {
    return "#";
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return href;
  }

  const protocolMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(href);
  if (!protocolMatch) {
    return "#";
  }

  const protocol = protocolMatch[1]?.toLowerCase();
  return protocol && SAFE_LINK_PROTOCOLS.has(`${protocol}:`) ? href : "#";
}

function isLexicalNode(value: unknown): value is LexicalNode {
  return Boolean(value && typeof value === "object");
}

function getChildren(node: LexicalNode) {
  return Array.isArray(node.children)
    ? node.children.filter(isLexicalNode)
    : [];
}
