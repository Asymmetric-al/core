// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NativeDocumentSubtitle } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/document-subtitle";

afterEach(cleanup);

describe("NativeDocumentSubtitle", () => {
  it("reads the type and its record as one phrase", () => {
    render(
      <NativeDocumentSubtitle
        readOnly={false}
        reference={<span>for Grace Okafor</span>}
        slug={null}
        titleSingular="Giving Page"
      />,
    );
    const type = screen.getByText("Giving Page");
    const reference = screen.getByText("for Grace Okafor");
    // One group, so the space between "Page" and "for" matches the space
    // inside "for Grace Okafor" instead of the wider gap between notes.
    expect(type.parentElement).toBe(reference.parentElement);
    expect(type.parentElement?.className).toContain("gap-1");
  });

  it("keeps each separator with the note it introduces", () => {
    render(
      <NativeDocumentSubtitle
        readOnly
        reference={null}
        slug="/local-missionary-giving"
        titleSingular="Giving Page"
      />,
    );
    for (const text of [
      "/local-missionary-giving",
      "You can view but not save changes.",
    ]) {
      const note = screen.getByText(text).parentElement;
      const dot = note?.firstElementChild;
      expect(dot?.textContent).toBe("·");
      expect(dot?.getAttribute("aria-hidden")).toBe("true");
      // On phones the note takes its own line and drops the dot, so a dot
      // never ends or starts a wrapped line.
      expect(dot?.className).toContain("hidden");
      expect(dot?.className).toContain("sm:inline");
      expect(note?.className).toContain("basis-full");
      expect(note?.className).toContain("sm:basis-auto");
    }
  });

  it("omits notes it does not have", () => {
    const { container } = render(
      <NativeDocumentSubtitle
        readOnly={false}
        reference={null}
        slug={null}
        titleSingular="Navigation"
      />,
    );
    expect(container.textContent).toBe("Navigation");
  });
});
