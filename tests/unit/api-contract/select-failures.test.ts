/**
 * #2708: a known-defects entry explains one specific failing select and
 * nothing else. Pure: no stack.
 */
import { describe, expect, it } from "vitest";

import {
  KNOWN_SELECT_DEFECTS,
  type KnownSelectDefect,
} from "../../integration/api-contract/known-defects";
import {
  triageFailures,
  type SelectFailure,
} from "../../integration/api-contract/select-failures";

const FILE = "packages/api/src/admin/comments/comment.ts";
const PGRST200_MESSAGE =
  "Could not find a relationship between 'post_comments' and 'profiles' in the schema cache";

const failure = (
  line: number,
  select: string,
  code = "PGRST200",
  message = PGRST200_MESSAGE,
): SelectFailure => ({
  sites: [
    {
      file: FILE,
      line,
      schema: null,
      table: "post_comments",
      select,
      returning: false,
    },
  ],
  code,
  message,
  details: "",
});

const authorEmbed = failure(
  58,
  "*, author:profiles!user_id(id, first_name, last_name, avatar_url, full_name)",
);
/** The tenant check's select in the same file, on the same table. */
const tenantCheck = failure(
  29,
  "*, post:posts!post_id(tenant_id)",
  "PGRST200",
  "Could not find a relationship between 'post_comments' and 'posts' in the schema cache",
);

const entry: KnownSelectDefect = {
  file: FILE,
  table: "post_comments",
  code: "PGRST200",
  match: "profiles!user_id",
  defect: "the author embed names a relationship that does not exist",
};

describe("triageFailures", () => {
  it("reports the failure an entry names as known", () => {
    const triage = triageFailures([authorEmbed], [entry]);
    expect(triage.unexpected).toEqual([]);
    expect(triage.known).toEqual([{ entry, failure: authorEmbed }]);
    expect(triage.stale).toEqual([]);
    expect(triage.ambiguous).toEqual([]);
  });

  it("does not let an entry mask another failing select in the same file and table", () => {
    const triage = triageFailures([authorEmbed, tenantCheck], [entry]);
    expect(triage.unexpected).toEqual([tenantCheck]);
    expect(triage.known.map((k) => k.failure)).toEqual([authorEmbed]);
  });

  it("matches the required text against the PostgREST message as well", () => {
    const byMessage = {
      ...entry,
      match: "between 'post_comments' and 'posts'",
    };
    const triage = triageFailures([tenantCheck], [byMessage]);
    expect(triage.known.map((k) => k.failure)).toEqual([tenantCheck]);
  });

  it("fails an entry that matches more than one distinct select", () => {
    const broad = { ...entry, match: "post_comments" };
    const triage = triageFailures([authorEmbed, tenantCheck], [broad]);
    expect(triage.ambiguous).toEqual([
      { entry: broad, failures: [authorEmbed, tenantCheck] },
    ]);
    expect(triage.known).toEqual([]);
  });

  it("reports an entry that no longer fails as stale", () => {
    expect(triageFailures([], [entry]).stale).toEqual([entry]);
  });

  it("requires every entry to name something specific to its select", () => {
    for (const known of KNOWN_SELECT_DEFECTS)
      expect(known.match.trim().length, known.file).toBeGreaterThan(3);
  });
});
