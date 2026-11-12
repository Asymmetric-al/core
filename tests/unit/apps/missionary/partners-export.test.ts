import { describe, expect, it } from "vitest";

import {
  partnersCsvFilename,
  partnersToCsv,
} from "../../../../apps/missionary/app/donors/partners-export";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

const donor = (overrides: Partial<Donor>): Donor =>
  ({
    id: "d1",
    name: "Grace Community Church",
    initials: "GC",
    type: "Church",
    status: "Active",
    total_given: 32_600,
    last_gift_date: "2026-01-30T00:00:00.000Z",
    last_gift_amount: 5_000,
    frequency: "Monthly",
    email: "office@grace.example",
    phone: "+1 555 0100",
    preferred_contact: "email",
    location: "Portland, OR",
    address: {
      street: "1 Main St",
      city: "Portland",
      state: "OR",
      zip: "97201",
    },
    joined_date: "2024-03-01",
    tags: ["monthly-partner"],
    score: 80,
    activities: [],
    recurring_donations: [],
    has_active_pledge: true,
    ...overrides,
  }) as Donor;

describe("partnersToCsv", () => {
  it("exports unqualified scalar amounts as unavailable, never as USD", () => {
    const csv = partnersToCsv([donor({})]);
    const [header, row] = csv.trim().split("\r\n");
    expect(header).toBe(
      '"Name","Status","Email","Phone","Lifetime giving (currency unknown)","Last gift (currency unknown)","Last gift date","Giving frequency","Recurring gift","Street","City","State","ZIP","Tags"',
    );
    expect(row).toBe(
      '"Grace Community Church","Active","office@grace.example","\'+1 555 0100","Unavailable","Unavailable","2026-01-30","Monthly","Yes","1 Main St","Portland","OR","97201","monthly-partner"',
    );
  });

  it("quotes commas, quotes and line breaks", () => {
    const csv = partnersToCsv([
      donor({ name: 'Ada "Annie" Lovelace, PhD', tags: ["a", "b"] }),
    ]);
    expect(csv).toContain('"Ada ""Annie"" Lovelace, PhD"');
    expect(csv.trim().endsWith(',"a; b"')).toBe(true);
  });

  it("neutralises values a spreadsheet would run as formulas", () => {
    const csv = partnersToCsv([
      donor({ name: '=HYPERLINK("http://x")', phone: "+1 555", email: "@me" }),
    ]);
    const row = csv.trim().split("\r\n")[1]!;
    expect(row.startsWith("\"'=HYPERLINK")).toBe(true);
    expect(row).toContain(',"\'@me",');
    expect(row).toContain(',"\'+1 555",');
  });

  it.each([" =1+1", "\u00a0=1+1", "+1+1", "-1+1", "+(1+1)", "\n=1+1"])(
    "neutralises formula-shaped partner data %j",
    (name) => {
      const csv = partnersToCsv([donor({ name })]);
      expect(csv).toContain(`"'${name}"`);
    },
  );

  it("keeps anonymous partners anonymous", () => {
    const csv = partnersToCsv([
      donor({
        name: "Anonymous partner",
        email: "",
        phone: "",
        is_anonymous: true,
      }),
    ]);
    expect(csv).toContain('"Anonymous partner","Active","","","Unavailable",');
  });

  it("names the file by date", () => {
    expect(partnersCsvFilename(new Date(2026, 10, 10))).toBe(
      "partners-2026-11-10.csv",
    );
  });
});
