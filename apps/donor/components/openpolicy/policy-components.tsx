import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import Link from "next/link";

import type {
  BoldNode,
  DocumentSection,
  HeadingNode,
  ItalicNode,
  LinkNode,
  ListNode,
  TextNode,
} from "@openpolicy/core";
import type { PolicyComponents } from "@openpolicy/react";
import type { ReactNode } from "react";

const headingTagByLevel = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

const headingClassByLevel = {
  1: "text-3xl font-semibold tracking-tight sm:text-4xl",
  2: "text-2xl font-semibold tracking-tight sm:text-3xl",
  3: "text-xl font-semibold tracking-tight sm:text-2xl",
  4: "text-lg font-semibold tracking-tight sm:text-xl",
  5: "text-base font-semibold tracking-tight sm:text-lg",
  6: "text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground",
} as const;

function PolicySection({
  section,
  children,
}: {
  children: ReactNode;
  section: DocumentSection;
}) {
  return (
    <section id={section.id} className="scroll-mt-28">
      <Card className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-5 p-6 sm:gap-6 sm:p-8">
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

function PolicyHeading({ node }: { node: HeadingNode }) {
  const level = node.level ?? 2;
  const Comp = headingTagByLevel[level];

  return (
    <Comp
      className={cn(
        "scroll-mt-28 text-balance text-foreground",
        headingClassByLevel[level],
      )}
    >
      {node.value}
    </Comp>
  );
}

function PolicyParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
      {children}
    </p>
  );
}

function PolicyList({
  node,
  children,
}: {
  children: ReactNode;
  node: ListNode;
}) {
  const Comp = node.ordered ? "ol" : "ul";

  return (
    <Comp
      className={cn(
        "flex flex-col gap-3 pl-5 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8",
        node.ordered
          ? "list-decimal marker:text-foreground"
          : "list-disc marker:text-foreground",
      )}
    >
      {children}
    </Comp>
  );
}

function PolicyLink({ node }: { node: LinkNode }) {
  const className =
    "rounded-sm text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  if (node.href.startsWith("/")) {
    return (
      <Link href={node.href} className={className}>
        {node.value}
      </Link>
    );
  }

  return (
    <a
      href={node.href}
      className={className}
      rel="noreferrer noopener"
      target="_blank"
    >
      {node.value}
    </a>
  );
}

function PolicyText({ node }: { node: TextNode }) {
  return <>{node.value}</>;
}

function PolicyBold({ node }: { node: BoldNode }) {
  return (
    <strong className="font-semibold text-foreground">{node.value}</strong>
  );
}

function PolicyItalic({ node }: { node: ItalicNode }) {
  return <em className="italic">{node.value}</em>;
}

export const policyComponents: PolicyComponents = {
  Section: PolicySection,
  Heading: PolicyHeading,
  Paragraph: PolicyParagraph,
  List: PolicyList,
  Link: PolicyLink,
  Text: PolicyText,
  Bold: PolicyBold,
  Italic: PolicyItalic,
};
