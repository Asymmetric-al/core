import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { fetchPublishedCmsPage } from "@/lib/cms/client";

type PageProps = {
  params: Promise<{
    cmsSlug: string[];
  }>;
};

export default async function CmsPublicPage({ params }: PageProps) {
  const { cmsSlug } = await params;
  const page = await fetchPublishedCmsPage(cmsSlug);

  if (!page) {
    notFound();
  }

  const renderedContent = renderLexicalDocument(page.content, page.id);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
          Site Studio Page
        </p>
        <h1 className="text-balance text-4xl font-bold text-zinc-900 sm:text-5xl">
          {page.title}
        </h1>
        {page.summary ? (
          <p className="text-lg text-zinc-600">{page.summary}</p>
        ) : null}
      </header>

      <section className="prose prose-zinc max-w-none">
        {renderedContent ? (
          renderedContent
        ) : (
          <p>
            Content is available in Site Studio but has no published rich-text
            blocks yet.
          </p>
        )}
      </section>
    </article>
  );
}

type LexicalNode = {
  children?: LexicalNode[];
  format?: number;
  tag?: string;
  text?: string;
  type?: string;
  url?: string;
};

function renderInlineText(node: LexicalNode, key: string): ReactNode {
  let content: ReactNode = node.text ?? null;

  if (node.format && (node.format & 1) === 1) {
    content = <strong key={`${key}-strong`}>{content}</strong>;
  }

  if (node.format && (node.format & 2) === 2) {
    content = <em key={`${key}-em`}>{content}</em>;
  }

  return content;
}

function renderChildren(children: LexicalNode[] | undefined, key: string) {
  return (children ?? []).map((child, index) =>
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
        <a key={key} href={node.url ?? "#"}>
          {renderChildren(node.children, key)}
        </a>
      );
    case "heading":
      return renderHeading(node, key);
    case "ul":
      return <ul key={key}>{renderChildren(node.children, key)}</ul>;
    case "ol":
      return <ol key={key}>{renderChildren(node.children, key)}</ol>;
    case "listitem":
      return <li key={key}>{renderChildren(node.children, key)}</li>;
    case "quote":
      return (
        <blockquote key={key}>{renderChildren(node.children, key)}</blockquote>
      );
    case "paragraph":
      return <p key={key}>{renderChildren(node.children, key)}</p>;
    default:
      return node.children?.length ? (
        <div key={key}>{renderChildren(node.children, key)}</div>
      ) : null;
  }
}

function renderHeading(node: LexicalNode, key: string) {
  const children = renderChildren(node.children, key);

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

function renderLexicalDocument(content: unknown, pageId: string) {
  if (!content || typeof content !== "object") {
    return null;
  }

  const root = (content as { root?: LexicalNode }).root;
  if (!root?.children?.length) {
    return null;
  }

  const rendered = root.children
    .map((node, index) => renderLexicalNode(node, `${pageId}-${index}`))
    .filter(Boolean);

  return rendered.length ? rendered : null;
}
