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
function FileFixture({
  names,
  disabled,
}: {
  names: string[];
  disabled?: boolean;
}) {
  const [attachments, setAttachments] = React.useState(
    names.map((filename) => ({
      filename,
      contentType: "text/plain",
      sizeBytes: 20,
      blobRef: `local:${filename}`,
    })),
  );
  return (
    <AttachmentChips
      attachments={attachments}
      onAdd={(item) => setAttachments((prev) => [...prev, item])}
      onRemove={(index) =>
        setAttachments((prev) => prev.filter((_, i) => i !== index))
      }
      disabled={disabled}
    />
  );
}
describe("attachment removal focus", () => {
  it("moves focus to the next file's Remove button", () => {
    const view = render(<FileFixture names={["a.txt", "b.txt", "c.txt"]} />);
    const remove = view.getByRole("button", { name: "Remove a.txt" });
    remove.focus();
    fireEvent.click(remove);
    expect(document.activeElement).toBe(
      view.getByRole("button", { name: "Remove b.txt" }),
    );
  });
  it("moves focus to the previous file's Remove button when the last file goes", () => {
    const view = render(<FileFixture names={["a.txt", "b.txt"]} />);
    const remove = view.getByRole("button", { name: "Remove b.txt" });
    remove.focus();
    fireEvent.click(remove);
    expect(document.activeElement).toBe(
      view.getByRole("button", { name: "Remove a.txt" }),
    );
  });
  it("moves focus to Attach when no files are left", () => {
    const view = render(<FileFixture names={["a.txt"]} />);
    const remove = view.getByRole("button", { name: "Remove a.txt" });
    remove.focus();
    fireEvent.click(remove);
    expect(document.activeElement).toBe(
      view.getByRole("button", { name: "Attach" }),
    );
  });
  it("keeps the file and the focused Remove button while a send is pending", () => {
    const view = render(<FileFixture names={["a.txt"]} />);
    const remove = view.getByRole("button", { name: "Remove a.txt" });
    remove.focus();
    // mod+enter can start the send while Remove has focus; a natively disabled
    // button would drop that focus, so it is only marked unavailable.
    view.rerender(<FileFixture names={["a.txt"]} disabled />);
    expect(remove.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(remove);
    fireEvent.click(remove);
    expect(view.getByRole("button", { name: "Remove a.txt" })).toBe(remove);
    expect(document.activeElement).toBe(remove);
  });
});
