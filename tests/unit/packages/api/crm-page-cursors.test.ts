import { describe, expect, it } from "vitest";

import {
  decodeCrmNoteCursor,
  encodeCrmNoteCursor,
  parseAdminCrmNotesParams,
} from "../../../../packages/api/src/admin/crm/notes/query";
import {
  decodeCrmRelationshipCursor,
  encodeCrmRelationshipCursor,
  parseAdminCrmRelationshipsParams,
} from "../../../../packages/api/src/admin/crm/relationships/query";

const TOP = 2_147_483_647;

describe("a CRM page cursor beyond the database's integer range reads as the first page, never a 500 (AL-2678 WP5 rest, fix round F10)", () => {
  it.each([TOP + 1, 2 ** 53 - 1])(
    "an offset of %d decodes to no cursor for notes and relationships (red: it is passed on)",
    (offset) => {
      expect(decodeCrmNoteCursor(encodeCrmNoteCursor({ offset }))).toBeNull();
      expect(
        decodeCrmRelationshipCursor(encodeCrmRelationshipCursor({ offset })),
      ).toBeNull();
      const after = new URLSearchParams({
        after: encodeCrmNoteCursor({ offset }),
      });
      expect(parseAdminCrmNotesParams(after).cursor).toBeNull();
      expect(parseAdminCrmRelationshipsParams(after).cursor).toBeNull();
    },
  );

  it("the top of the range itself is kept, for the database to answer an empty page with the exact total (guard)", () => {
    expect(decodeCrmNoteCursor(encodeCrmNoteCursor({ offset: TOP }))).toEqual({
      offset: TOP,
    });
    expect(
      decodeCrmRelationshipCursor(encodeCrmRelationshipCursor({ offset: TOP })),
    ).toEqual({ offset: TOP });
  });
});
