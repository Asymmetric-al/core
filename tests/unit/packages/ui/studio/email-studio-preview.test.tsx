/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EmailStudioPreviewDialog } from "../../../../../packages/ui/components/studio/EmailStudioPreview";

describe("@asym/ui EmailStudioPreviewDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders exported HTML in a sandboxed iframe and exposes preview tabs", () => {
    render(
      <EmailStudioPreviewDialog
        open
        onOpenChange={() => {}}
        subject="May update"
        preheader="A short note"
        html="<h1>Hello {{first_name}}</h1>"
        text="Hello {{first_name}}"
      />,
    );

    expect(screen.getByText("May update · A short note")).toBeTruthy();

    const iframe = screen.getByTitle("Email preview") as HTMLIFrameElement;
    expect(iframe.getAttribute("sandbox")).toBe("allow-same-origin");
    expect(iframe.getAttribute("srcdoc")).toBe("<h1>Hello {{first_name}}</h1>");

    expect(screen.getByRole("tab", { name: /html/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /text/i })).toBeTruthy();
  });

  it("shows merge-tag validation warnings for unresolved unknown tags", () => {
    render(
      <EmailStudioPreviewDialog
        open
        onOpenChange={() => {}}
        subject="Broken tag"
        html="<p>{{made_up_tag}}</p>"
        text="{{made_up_tag}}"
      />,
    );

    expect(screen.getByText("Unknown merge tag: made_up_tag")).toBeTruthy();
  });
});
