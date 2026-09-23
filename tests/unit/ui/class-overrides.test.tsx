// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { cleanup, render, screen } from "@testing-library/react";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

describe("shared component class overrides", () => {
  it("lets callers override Maia button geometry and colors while preserving motion and focus", () => {
    render(
      <Button
        variant="maia"
        className="rounded-lg bg-secondary text-secondary-foreground px-6 hover:bg-secondary/80"
      >
        Save changes
      </Button>,
    );
    const classes = screen.getByRole("button", {
      name: "Save changes",
    }).classList;

    for (const className of [
      "rounded-lg",
      "bg-secondary",
      "text-secondary-foreground",
      "px-6",
      "hover:bg-secondary/80",
      "press-feedback",
      "hover-scale-subtle",
      "focus-visible:ring-[3px]",
      "focus-visible:ring-ring/50",
      "has-[>svg]:px-3",
    ]) {
      expect(classes.contains(className), className).toBe(true);
    }
    for (const className of [
      "rounded-md",
      "rounded-2xl",
      "bg-foreground",
      "text-background",
      "px-4",
      "hover:bg-foreground/90",
    ]) {
      expect(classes.contains(className), className).toBe(false);
    }
  });

  it("keeps caller colors and typography independent on an input", () => {
    render(
      <Input
        aria-label="Display name"
        className="h-12 bg-card text-lg text-foreground focus-visible:ring-4"
      />,
    );
    const classes = screen.getByRole("textbox", {
      name: "Display name",
    }).classList;

    for (const className of [
      "h-12",
      "bg-card",
      "text-lg",
      "text-foreground",
      "focus-visible:ring-4",
      "focus-visible:ring-ring/50",
      "border-input",
    ]) {
      expect(classes.contains(className), className).toBe(true);
    }
    for (const className of [
      "h-9",
      "bg-transparent",
      "text-base",
      "focus-visible:ring-[3px]",
    ]) {
      expect(classes.contains(className), className).toBe(false);
    }
  });

  it("lets a Card caller explicitly remove the default background behind a gradient", () => {
    render(
      <Card
        data-testid="gradient-card"
        className="bg-gradient-to-br from-primary/5 to-primary/10 bg-transparent"
      />,
    );
    const classes = screen.getByTestId("gradient-card").classList;

    expect(classes.contains("bg-card")).toBe(false);
    expect(classes.contains("bg-transparent")).toBe(true);
    expect(classes.contains("bg-gradient-to-br")).toBe(true);
    expect(classes.contains("text-card-foreground")).toBe(true);
  });
});

// Read the real callers' overrides so removing their explicit transparency is
// caught without mocking the application data, auth, routing, or motion layers.
function gradientOverride(file: string, componentName: string): string {
  const source = ts.createSourceFile(
    file,
    readFileSync(resolve(__dirname, "../../..", file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const matches: string[] = [];

  function visit(node: ts.Node): void {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(source) === componentName
    ) {
      for (const property of node.attributes.properties) {
        if (
          ts.isJsxAttribute(property) &&
          property.name.getText(source) === "className" &&
          property.initializer &&
          ts.isStringLiteral(property.initializer) &&
          property.initializer.text.includes("bg-gradient-to-br")
        ) {
          matches.push(property.initializer.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  expect(matches, `${file}: ${componentName} gradient override`).toHaveLength(
    1,
  );
  return matches[0]!;
}

describe("application gradient background regressions", () => {
  it.each([
    {
      name: "Resend connection card",
      file: "apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx",
      componentName: "Card",
      defaultBackground: "bg-card",
    },
    {
      name: "content moderation card",
      file: "apps/admin/app/(app)/feed/content-moderation-sections.tsx",
      componentName: "MotionCard",
      defaultBackground: "bg-card",
    },
    {
      name: "missionary feed avatar",
      file: "apps/missionary/app/feed/worker-feed-page-client.tsx",
      componentName: "AvatarFallback",
      defaultBackground: "bg-muted",
    },
  ])(
    "preserves the transparent background of the $name",
    ({ file, componentName, defaultBackground }) => {
      const className = gradientOverride(file, componentName);
      render(
        componentName === "AvatarFallback" ? (
          <Avatar>
            <AvatarFallback
              data-testid="gradient-surface"
              className={className}
            >
              GF
            </AvatarFallback>
          </Avatar>
        ) : (
          <Card data-testid="gradient-surface" className={className} />
        ),
      );
      const classes = screen.getByTestId("gradient-surface").classList;

      expect(classes.contains(defaultBackground)).toBe(false);
      expect(classes.contains("bg-transparent")).toBe(true);
      expect(classes.contains("bg-gradient-to-br")).toBe(true);
      for (const stop of className
        .split(/\s+/)
        .filter((value) => /^(from|via|to)-/.test(value))) {
        expect(classes.contains(stop), stop).toBe(true);
      }
    },
  );
});
