import { expect, it } from "vitest";

import { fundSchema } from "../../../../packages/database/collections/schemas/giving";
import { missionarySchema } from "../../../../packages/database/collections/schemas/people";

it("preserves giving target identity in browser collection rows", () => {
  const entity = "00000000-0000-4000-8000-000000000001";
  expect(
    fundSchema
      .pick({ legal_entity_id: true, system_purpose: true })
      .parse({ legal_entity_id: entity, system_purpose: null }),
  ).toEqual({ legal_entity_id: entity, system_purpose: null });
  expect(
    missionarySchema
      .pick({ legal_entity_id: true })
      .parse({ legal_entity_id: entity }),
  ).toEqual({ legal_entity_id: entity });
});

it("refuses a missionary row that names no legal entity", () => {
  expect(
    missionarySchema.pick({ legal_entity_id: true }).safeParse({}).success,
  ).toBe(false);
});
