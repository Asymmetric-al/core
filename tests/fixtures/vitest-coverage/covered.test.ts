import { expect, it } from "vitest";

import { coverageLabel } from "./covered";

it("executes a source function for the coverage lifecycle fixture", () => {
  expect(coverageLabel(true)).toBe("positive");
});
