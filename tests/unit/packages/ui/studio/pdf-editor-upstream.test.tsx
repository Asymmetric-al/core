/** @vitest-environment jsdom */

import { PdfEditor, type PdfEditorRef } from "@asym/pdf-editor";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

describe("PDF editor upstream compatibility", () => {
  it("loads stored content and serializes it through the real public editor", async () => {
    let editor: PdfEditorRef | undefined;
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
        onReady={(ready: PdfEditorRef) => {
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
