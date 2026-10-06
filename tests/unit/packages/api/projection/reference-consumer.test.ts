import { expect, it } from "vitest";

import { fixture } from "./fixtures";
import { resolveProjection } from "../../../../../packages/api/src/projection/index";

it("drops refused split lines before enumeration, pagination and totals (synthetic reference consumer)", () => {
  const x = fixture();
  const lines = [
    { amount: 1250, related: true },
    { amount: 9000, related: false },
    { amount: 750, related: true },
  ];
  const admitted = lines.flatMap(({ amount, related }) => {
    const result = resolveProjection({
      ...x,
      row: { ...x.row, amount },
      scope: {
        ...x.scope,
        relationship: {
          kind: "applicable",
          viewerId: "person-a",
          recordId: "record-a",
          related,
        },
      },
    });
    return result.kind === "allowed" ? [result.projection] : [];
  });
  expect({
    count: admitted.length,
    total: admitted.reduce((sum, row) => sum + (row.amount as number), 0),
    secondPage: admitted.slice(1, 2),
    serialized: JSON.stringify(admitted),
  }).toEqual({
    count: 2,
    total: 2000,
    secondPage: [{ display_name: "Ada", amount: 750 }],
    serialized:
      '[{"display_name":"Ada","amount":1250},{"display_name":"Ada","amount":750}]',
  });
});
