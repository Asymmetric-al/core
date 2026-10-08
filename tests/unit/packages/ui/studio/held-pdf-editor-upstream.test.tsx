/** @vitest-environment jsdom */

import { PdfEditor } from "@asym/pdf-editor";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { EmailEditorRef } from "held-pdf-email-editor-compat";

afterEach(cleanup);

describe("held PDF editor upstream compatibility", () => {
  it("loads stored content and serializes it through the real held editor", async () => {
    let editor: EmailEditorRef | undefined;
    render(
      <PdfEditor
        content={{
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Receipt verification " },
                {
                  type: "text",
                  text: "2026",
                  marks: [{ type: "bold" }],
                },
              ],
            },
          ],
        }}
        onReady={(ready: EmailEditorRef) => {
          editor = ready;
        }}
      />,
    );

    await waitFor(() => expect(editor).toBeDefined());
    const before = editor?.getJSON();
    expect(JSON.stringify(before)).toContain('"type":"bold"');
    const email = await editor?.getEmail();
    expect(email?.html).toContain("Receipt verification");
    expect(email?.html).toContain("2026");
    expect(email?.text).toContain("Receipt verification");
    expect(editor?.getJSON()).toEqual(before);
  });
});
