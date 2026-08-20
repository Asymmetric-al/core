// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ANONYMOUS_DONOR_LABEL } from "../../../../packages/api/src/missionary-portal/redaction";
import { toPartnerSafeDonor } from "../../../../apps/missionary/app/donors/donors-page-model";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

function createPoisonedAnonymousDonor(): Donor {
  return {
    id: "anon-1",
    name: "Jane Secret",
    initials: "JS",
    type: "Individual",
    status: "Active",
    total_given: 500,
    last_gift_date: null,
    last_gift_amount: null,
    frequency: "One-time",
    email: "jane@secret.test",
    phone: "555-0199",
    preferred_contact: "email",
    avatar_url: "https://cdn.example/jane.jpg",
    location: "Denver, CO",
    address: { street: "123 Hidden St" },
    website: "https://janesecret.test",
    joined_date: "2026-01-01T00:00:00.000Z",
    tags: ["vip"],
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
    is_anonymous: true,
  };
}

function PartnerIdentityPreview({ donor }: { donor: Donor }) {
  const safe = toPartnerSafeDonor(donor);

  return (
    <article>
      <h1>{safe.name}</h1>
      {safe.email ? <p>{safe.email}</p> : null}
      {safe.phone ? <p>{safe.phone}</p> : null}
      {safe.location ? <p>{safe.location}</p> : null}
      {safe.website ? <p>{safe.website}</p> : null}
    </article>
  );
}

afterEach(() => {
  cleanup();
});

describe("Partners roster anonymity", () => {
  it("does not render leaked identity after sanitizing an anonymous partner row", () => {
    render(<PartnerIdentityPreview donor={createPoisonedAnonymousDonor()} />);

    expect(screen.getByText(ANONYMOUS_DONOR_LABEL)).toBeTruthy();
    expect(screen.queryByText("Jane Secret")).toBeNull();
    expect(screen.queryByText("jane@secret.test")).toBeNull();
    expect(screen.queryByText("555-0199")).toBeNull();
    expect(screen.queryByText("Denver, CO")).toBeNull();
    expect(screen.queryByText("https://janesecret.test")).toBeNull();
  });
});
