// @vitest-environment jsdom

import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { cleanup, render, screen } from "@testing-library/react";
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
