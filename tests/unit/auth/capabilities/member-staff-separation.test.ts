import { describe, expect, it } from "vitest";

import {
  CAPABILITY_BUNDLES,
  ROLE_DEFAULT_BUNDLES,
} from "../../../../packages/auth/capabilities/bundles";

const held = (subject: keyof typeof ROLE_DEFAULT_BUNDLES) =>
  new Set(
    ROLE_DEFAULT_BUNDLES[subject].flatMap(
      (bundle) => CAPABILITY_BUNDLES[bundle] as readonly string[],
    ),
  );

const SUBJECTS = Object.keys(ROLE_DEFAULT_BUNDLES) as Array<
  keyof typeof ROLE_DEFAULT_BUNDLES
>;
const MEMBER = SUBJECTS.filter((subject) => subject.startsWith("member:"));
const STAFF = SUBJECTS.filter((subject) => !subject.startsWith("member:"));

describe("member and staff capabilities never meet, so a member row never passes a staff check (AL-2678 WP5 rest, D-16 ruling on Add Partner item 9)", () => {
  it("no capability is held by both a member subject and a staff subject or the tenant administrator", () => {
    const staff = new Set(STAFF.flatMap((subject) => [...held(subject)]));
    const shared = MEMBER.flatMap((subject) =>
      [...held(subject)].filter((capability) => staff.has(capability)),
    );
    expect(shared).toEqual([]);
  });

  it("partners.add is held by member:missionary alone; member:donor holds nothing", () => {
    expect(
      SUBJECTS.filter((subject) => held(subject).has("partners.add")),
    ).toEqual(["member:missionary"]);
    expect([...held("member:missionary")]).toEqual(["partners.add"]);
    expect([...held("member:donor")]).toEqual([]);
  });
});
