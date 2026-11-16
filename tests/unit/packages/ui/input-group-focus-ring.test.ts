import { describe, expect, it } from "vitest";

import { inputGroupInputStyles } from "../../../../packages/ui/lib/input-styles";

describe("Input group control focus", () => {
  it("leaves the focus ring to the group, with no inner ring or offset", () => {
    // The global :focus-visible rule adds ring-2 and ring-offset-2. Inside an
    // InputGroup the group draws the ring; an inner offset would add a second
    // outline over the icon, clipped at the group edges (Web Studio's
    // template search in round 9).
    const classes = inputGroupInputStyles.split(" ");
    expect(classes).toContain("focus-visible:ring-0");
    expect(classes).toContain("focus-visible:ring-offset-0");
  });
});
