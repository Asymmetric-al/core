/**
 * #2708: only Postgres refusing the swept relation itself counts as "refused
 * for lack of privilege"; any other 42501 is an error the sweep reports.
 * Pure: no stack.
 */
import { describe, expect, it } from "vitest";

import { isRefusalOf } from "../../integration/api-contract/isolation-probe";

const donors = { schema: "public", table: "donors" };
const denied = (message: string) => ({ code: "42501", message });

describe("isRefusalOf", () => {
  it("counts a refusal of the swept table or view", () => {
    expect(
      isRefusalOf(denied("permission denied for table donors"), donors),
    ).toBe(true);
    expect(
      isRefusalOf(denied("permission denied for view donors"), donors),
    ).toBe(true);
  });

  it("does not count a refusal of another relation, a function or a schema", () => {
    for (const message of [
      "permission denied for table profiles",
      "permission denied for table donors_archive",
      "permission denied for function is_super_admin",
      "permission denied for schema authz",
      "permission denied for sequence donors_id_seq",
    ])
      expect(isRefusalOf(denied(message), donors), message).toBe(false);
  });

  it("does not count other error codes", () => {
    expect(
      isRefusalOf(
        { code: "42703", message: "permission denied for table donors" },
        donors,
      ),
    ).toBe(false);
  });
});
