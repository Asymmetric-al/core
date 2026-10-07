/** @vitest-environment jsdom */
import * as React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AttachmentChips } from "../../../../apps/admin/features/support-hub/components/detail/composer/AttachmentChips";
afterEach(cleanup);
function Fixture() {
  const [attachments, setAttachments] = React.useState([
    {
      filename: "notes.txt",
      contentType: "text/plain",
      sizeBytes: 20,
      blobRef: "local:first",
    },
    {
      filename: "notes.txt",
      contentType: "text/plain",
      sizeBytes: 40,
      blobRef: "local:second",
    },
  ]);
  return (
    <AttachmentChips
      attachments={attachments}
      onAdd={(item) => setAttachments((prev) => [...prev, item])}
      onRemove={(index) =>
        setAttachments((prev) => prev.filter((_, i) => i !== index))
      }
    />
  );
}
describe("attachment identities", () => {
  it("keeps the remaining file's control and focus when equal-named earlier files are removed", () => {
    const view = render(<Fixture />);
    const buttons = view.getAllByRole("button", { name: "Remove notes.txt" });
    buttons[1]!.focus();
    fireEvent.click(buttons[0]!);
    expect(view.getByRole("button", { name: "Remove notes.txt" })).toBe(
      buttons[1],
    );
    expect(document.activeElement).toBe(buttons[1]);
    expect(view.getByText("40 B")).toBeTruthy();
  });
});
