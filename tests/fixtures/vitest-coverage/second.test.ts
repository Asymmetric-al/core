import { expect, it } from "vitest";

import { coverageDouble } from "./covered";

it("collects a different export after isolated module reload", () => {
  expect(coverageDouble(3)).toBe(6);
});
