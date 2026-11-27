import { describe, expect, it } from "vitest";

import { parseSettledLifetime } from "../../../../../packages/api/src/donor-portal/service";
import { ApiHttpError } from "../../../../../packages/api/src/shared/http-errors";

describe("AL-2681 part 2a fix round F9: the lifetime read is parsed into a named type", () => {
  it("reads the one aggregate row, numbers or numeric strings, and keeps a true zero", () => {
    expect(
      parseSettledLifetime([{ given_cents: 123_400, gift_count: 7 }]),
    ).toEqual({
      givenCents: 123_400,
      giftCount: 7,
    });
    expect(
      parseSettledLifetime([{ given_cents: "500", gift_count: "1" }]),
    ).toEqual({
      givenCents: 500,
      giftCount: 1,
    });
    expect(parseSettledLifetime([{ given_cents: 0, gift_count: 0 }])).toEqual({
      givenCents: 0,
      giftCount: 0,
    });
  });

  it("a malformed answer is an error, never zero", () => {
    for (const data of [
      null,
      [],
      [{}],
      [{ given_cents: null, gift_count: 0 }],
      [{ given_cents: "abc", gift_count: 1 }],
      [{ given_cents: 10.5, gift_count: 1 }],
      [{ given_cents: -1, gift_count: 1 }],
      [
        { given_cents: 1, gift_count: 1 },
        { given_cents: 2, gift_count: 1 },
      ],
    ]) {
      expect(() => parseSettledLifetime(data), JSON.stringify(data)).toThrow(
        ApiHttpError,
      );
    }
  });
});
