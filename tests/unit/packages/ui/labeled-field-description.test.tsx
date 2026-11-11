/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { LabeledField } from "../../../../packages/ui/components/primitives/labeled-field";

afterEach(cleanup);

// Descriptions often hold their own paragraphs or a counter row, so the
// description must be a block that may contain them (a <p> may not).
it("lets a field description hold paragraphs and describe the control", () => {
  render(
    <LabeledField
      label="About you"
      description={
        <>
          <p>Your story for your giving page.</p>
          <p>39 words</p>
        </>
      }
    >
      <textarea />
    </LabeledField>,
  );
  const textbox = screen.getByRole("textbox", { name: "About you" });
  const description = document.getElementById(
    textbox.getAttribute("aria-describedby") ?? "",
  );
  expect(description?.tagName).toBe("DIV");
  expect(description?.querySelectorAll("p")).toHaveLength(2);
  expect(description?.getAttribute("data-slot")).toBe("field-description");
});
