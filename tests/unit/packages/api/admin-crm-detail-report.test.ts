import { describe, expect, it, vi } from "vitest";
import { serializeAdminCrmReportCsv } from "../../../../packages/api/src/admin/crm/reports/export-projection";
import { policies } from "./projection/fixtures";

import { getAdminCrmDonorDetail } from "../../../../packages/api/src/admin/crm/detail/service";
import {
  buildAdminCrmReport,
  buildAdminCrmExportGroups,
} from "../../../../packages/api/src/admin/crm/reports/service";

type Row = Record<string, unknown>;

class QueryBuilder implements PromiseLike<{ data: Row[]; error: null }> {
  private filters: Array<(row: Row) => boolean> = [];
  private limitCount: number | null = null;
  private orderColumn: string | null = null;
  private orderAscending = true;
  private rangeWindow: { from: number; to: number } | null = null;

  constructor(private readonly rows: Row[]) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  not(column: string, operation: string, value: unknown) {
    if (operation !== "is" || value !== null)
      throw new Error("Unexpected not filter");
    this.filters.push((row) => row[column] != null);
    return this;
  }
  or(conditions: string) {
    const fields = conditions.split(",").map((term) => term.split(".eq."));
    this.filters.push((row) =>
      fields.some(([column, value]) => column && row[column] === value),
    );
    return this;
  }
  gte(column: string, value: string) {
    this.filters.push((row) => String(row[column] ?? "") >= value);
    return this;
  }

  lte(column: string, value: string) {
    this.filters.push((row) => String(row[column] ?? "") <= value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeWindow = { from, to };
    return this;
  }

  async single() {
    const [row] = this.resolveRows();
    return row
      ? { data: row, error: null }
      : { data: null, error: { message: "not found" } };
  }

  async maybeSingle() {
    return { data: this.resolveRows()[0] ?? null, error: null };
  }

  then<TResult1 = { data: Row[]; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: Row[];
          error: null;
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({ data: this.resolveRows(), error: null }).then(
      onfulfilled,
      onrejected,
    );
  }

  private resolveRows() {
    let rows = this.rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );
    if (this.orderColumn) {
      const column = this.orderColumn;
      const direction = this.orderAscending ? 1 : -1;
      rows = [...rows].sort(
        (left, right) =>
          String(left[column] ?? "").localeCompare(
            String(right[column] ?? ""),
          ) * direction,
      );
    }
    if (this.rangeWindow) {
      rows = rows.slice(this.rangeWindow.from, this.rangeWindow.to + 1);
    }
    return this.limitCount == null ? rows : rows.slice(0, this.limitCount);
  }
}

function createSupabaseFixture(tables: Record<string, Row[]>) {
  return {
    rpc: vi.fn(
      async (
        name: string,
        args: {
          p_ids?: string[];
          p_profile_ids?: string[];
          p_tenant_id: string;
        },
      ) => {
        if (name === "tenant_member_directory")
          return {
            data: (tables.profiles ?? [])
              .filter((row) => args.p_profile_ids?.includes(String(row.id)))
              .map((row) => ({ ...row, profile_id: row.id })),
            error: null,
          };
        if (name === "crm_missionary_labels")
          return {
            data: (tables.missionaries ?? [])
              .filter(
                (row) =>
                  row.tenant_id === args.p_tenant_id &&
                  args.p_ids?.includes(String(row.id)),
              )
              .map((row) => ({
                id: row.id,
                profile_id: row.id,
                member_profile_id: row.id,
                ...(row.profile as Row),
              })),
            error: null,
          };
        throw new Error("Unexpected RPC " + name);
      },
    ),
    from: vi.fn((table: string) => new QueryBuilder(tables[table] ?? [])),
  };
}

const baseTables: Record<string, Row[]> = {
  donor_merge_candidates: [
    {
      id: "candidate-1",
      tenant_id: "tenant-1",
      status: "open",
      existing_donor_id: "donor-1",
      incoming_donor_id: "donor-2",
      existing: { id: "donor-1", name: "Ada Donor" },
      incoming: { id: "donor-2", name: "Pat Partner" },
    },
  ],
  donation_crm_links: [
    {
      donation_id: "donation-1",
      id: "link-1",
      link_status: "active",
      staged_gift_id: "staged-gift-1",
      tenant_id: "tenant-1",
      twenty_record_id: "twenty-gift-1",
    },
  ],
  donations: [
    {
      amount: 12500,
      created_at: "2026-05-10T00:00:00.000Z",
      currency: "usd",
      donation_type: "one_time",
      donor_id: "donor-1",
      fund_id: "fund-1",
      id: "donation-1",
      is_recurring: false,
      missionary_id: "missionary-1",
      status: "completed",
      tenant_id: "tenant-1",
    },
  ],
  donor_activities: [
    { id: "unrelated", donor_id: "donor-2", type: "note", title: "unrelated" },
    {
      "owner.tenant_id": "tenant-1",
      amount: null,
      created_at: "2026-05-11T00:00:00.000Z",
      date: "2026-05-11T00:00:00.000Z",
      description: "Called after receipt send.",
      donor_id: "donor-1",
      id: "activity-1",
      title: "Care call",
      type: "call",
    },
  ],
  donor_pledges: [
    {
      amount: 5000,
      donor_id: "donor-1",
      frequency: "monthly",
      fund_id: "fund-1",
      id: "pledge-1",
      missionary_id: "missionary-1",
      next_payment_date: "2026-01-01",
      status: "active",
      tenant_id: "tenant-1",
      updated_at: "2026-05-11T00:00:00.000Z",
    },
  ],
  donors: [
    {
      email: "ada@example.test",
      id: "donor-1",
      last_gift_date: "2026-05-10T00:00:00.000Z",
      missionary_id: "missionary-1",
      name: "Ada Donor",
      notes: "Prefers a call after major gifts.",
      organization: null,
      phone: "555-0100",
      profile_id: "profile-1",
      status: "active",
      tenant_id: "tenant-1",
      total_given: 12500,
      type: "individual",
    },
  ],
  funds: [{ id: "fund-1", tenant_id: "tenant-1", name: "General Fund" }],
  missionaries: [
    {
      tenant_id: "tenant-1",
      id: "missionary-1",
      profile: {
        display_name: "Mina Missionary",
      },
    },
  ],
  staged_gifts: [
    {
      created_at: "2026-05-10T00:00:00.000Z",
      crm_post_status: "posted",
      donation_id: "donation-1",
      fund_id: "fund-1",
      id: "staged-gift-1",
      missionary_id: "missionary-1",
      posted_at: "2026-05-10T00:01:00.000Z",
      receipt_status: "sent",
      status: "posted",
      tenant_id: "tenant-1",
      twenty_record_id: "twenty-gift-1",
    },
  ],
};

describe("Phase 5 CRM donor detail and reports", () => {
  it("does not read old activities when the donor no longer belongs to the selected tenant", async () => {
    const client = createSupabaseFixture(baseTables);
    await expect(
      getAdminCrmDonorDetail({
        tenantId: "tenant-2",
        donorId: "donor-1",
        isTenantAdministrator: false,
        sessionClient: client as never,
      }),
    ).rejects.toMatchObject({ status: 404 });
    expect(client.from.mock.calls).toEqual([["donors"]]);
  });
  it("builds donor care detail without making Twenty payment truth", async () => {
    const detail = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "staff",
      sessionClient: createSupabaseFixture(baseTables) as never,
      tenantId: "tenant-1",
    });

    expect(
      detail.timeline.filter((entry) => entry.kind === "activity"),
    ).toHaveLength(1);
    expect(detail.donor.name).toBe("Ada Donor");
    expect(detail.giftHistory[0]).toMatchObject({
      currencyCode: "USD",
      stagedGiftId: "staged-gift-1",
      twentyRecordId: null,
    });
    expect(detail.giftHistoryTruncated).toBe(false);
    expect(detail.timeline.map((entry) => entry.kind)).toEqual(
      expect.arrayContaining(["gift", "activity"]),
    );
    expect(detail.duplicateWarnings[0]).toMatchObject({
      candidateId: "donor-2",
      candidateLabel: "Pat Partner",
      confidence: null,
      score: null,
      reason: "Possible duplicate of Pat Partner",
    });
    expect(detail.support).toMatchObject({
      activeRecurringCommitments: 1,
      atRiskCommitments: 1,
      lifetimeGivingCents: 12500,
    });
    expect(detail.privacy.missionaryContactDataExposed).toBe(false);
    expect(detail.reconciliation).toEqual({
      crmWriteMode: "disabled",
      platformPaymentTruth: true,
    });
  });

  it("says not found only when the tenant has no such record", async () => {
    const read = (sessionClient: unknown) =>
      getAdminCrmDonorDetail({
        donorId: "donor-missing",
        role: "staff",
        sessionClient: sessionClient as never,
        tenantId: "tenant-1",
      });

    await expect(read(createSupabaseFixture(baseTables))).rejects.toMatchObject(
      { status: 404 },
    );

    // A failed read is a server error, so the page can offer Retry instead
    // of calling the record missing.
    const failing = {
      from(table: string) {
        const builder = createSupabaseFixture(baseTables).from(table);
        if (table === "donors") {
          builder.maybeSingle = async () => ({
            data: null,
            error: { message: "connection reset" },
          });
          builder.single = builder.maybeSingle as never;
        }
        return builder;
      },
    };
    await expect(read(failing)).rejects.toMatchObject({ status: 500 });

    // A malformed id cannot name a record.
    const malformed = {
      from(table: string) {
        const builder = createSupabaseFixture(baseTables).from(table);
        if (table === "donors") {
          builder.maybeSingle = async () => ({
            data: null,
            error: { code: "22P02", message: "invalid input syntax" },
          });
          builder.single = builder.maybeSingle as never;
        }
        return builder;
      },
    };
    await expect(read(malformed)).rejects.toMatchObject({ status: 404 });
  });

  it("counts only settled gifts, in any stored spelling, in the support breakdown", async () => {
    const gift = (id: string, status: string | null) => ({
      ...baseTables.donations![0]!,
      amount: 1000,
      id,
      status,
    });
    const detail = await getAdminCrmDonorDetail({
      donorId: "donor-1",
      role: "staff",
      sessionClient: createSupabaseFixture({
        ...baseTables,
        donations: [
          gift("settled-legacy", "Succeeded"),
          gift("settled-padded", " completed "),
          gift("no-status", null),
          gift("pending", "pending"),
        ],
      }) as never,
      tenantId: "tenant-1",
    });

    const total = (rows: Array<{ amountCents: number }>) =>
      rows.reduce((sum, row) => sum + row.amountCents, 0);
    expect(total(detail.support.byFund)).toBe(2000);
    expect(total(detail.support.byMissionary)).toBe(2000);
  });

  it("titles each gift on the timeline by what happened to it", async () => {
    const gift = (id: string, status: string | null, extra: Row = {}) => ({
      ...baseTables.donations![0]!,
      id,
      status,
      ...extra,
    });
    const detail = await getAdminCrmDonorDetail({
      donorId: "donor-1",
      role: "staff",
      sessionClient: createSupabaseFixture({
        ...baseTables,
        donations: [
          gift("ok", "Succeeded"),
          gift("failed", "failed"),
          gift("pending", null),
          gift("refunded", "refunded", { refund_amount: 12500 }),
        ],
      }) as never,
      tenantId: "tenant-1",
    });
    const entry = (id: string) =>
      detail.timeline.find((item) => item.id === `gift:${id}`);

    expect(entry("ok")).toMatchObject({
      title: "Gift received",
      paymentStatus: "completed",
    });
    expect(entry("failed")).toMatchObject({
      title: "Gift failed",
      paymentStatus: "failed",
    });
    expect(entry("pending")).toMatchObject({
      title: "Gift pending",
      paymentStatus: "pending",
    });
    expect(entry("refunded")).toMatchObject({
      title: "Gift refunded",
      paymentStatus: "refunded",
    });
    expect(
      detail.timeline.find((item) => item.kind === "activity")?.paymentStatus,
    ).toBeNull();
  });

  it("D-18 (AL-2678 r3, plan line 997: the owner is named by the record's assignment key from the shared worker labels, so the member-directory call by profile goes): names the record owner from the worker labels the gift rows already load, with one call fewer", async () => {
    const donorWithOwner = {
      ...baseTables.donors![0]!,
      missionary_id: "profile-owner",
      ministry_assignment_id: "worker-owner",
    };
    const client = createSupabaseFixture({
      ...baseTables,
      donors: [donorWithOwner],
      missionaries: [
        ...baseTables.missionaries!,
        {
          tenant_id: "tenant-1",
          id: "worker-owner",
          profile: { display_name: "Priya Nair" },
        },
      ],
      profiles: [{ id: "profile-owner", display_name: "Someone Else" }],
    });
    const detail = await getAdminCrmDonorDetail({
      donorId: "donor-1",
      role: "staff",
      sessionClient: client as never,
      tenantId: "tenant-1",
    });

    expect(detail.donor.missionaryId).toBe("profile-owner");
    expect(detail.donor.missionaryName).toBe("Priya Nair");
    expect(detail.donor.ownerAssignmentId).toBe("worker-owner");
    expect(client.rpc.mock.calls.map(([name]) => name)).toEqual([
      "crm_missionary_labels",
    ]);
    expect(client.rpc.mock.calls[0]![1].p_ids).toContain("worker-owner");
  });

  it.each([
    ["has no assignment key", null],
    ["has a key the selected organization's labels do not return", "worker-b"],
  ])(
    "D-18 (AL-2678 r3, Q-r3-2): leaves the owner unnamed when the record %s, with no key in the response",
    async (_case, key) => {
      const detail = await getAdminCrmDonorDetail({
        donorId: "donor-1",
        role: "staff",
        sessionClient: createSupabaseFixture({
          ...baseTables,
          donors: [
            {
              ...baseTables.donors![0]!,
              missionary_id: "profile-owner",
              ministry_assignment_id: key,
            },
          ],
          missionaries: [
            ...baseTables.missionaries!,
            {
              tenant_id: "tenant-2",
              id: "worker-b",
              profile: { display_name: "Other Org Worker" },
            },
          ],
        }) as never,
        tenantId: "tenant-1",
      });

      expect(detail.donor.missionaryName).toBeNull();
      expect(detail.donor.ownerAssignmentId).toBeNull();
      expect(JSON.stringify(detail)).not.toContain("worker-b");
    },
  );

  it("exposes historical provider record ids only to provider operators", async () => {
    const detail = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "admin",
      sessionClient: createSupabaseFixture(baseTables) as never,
      tenantId: "tenant-1",
      viewerCapabilities: ["contributions.use_provider_actions"],
    });

    expect(detail.giftHistory[0]?.twentyRecordId).toBe("twenty-gift-1");
  });

  it("loads the tenant approval policy once and threads it into inline gift actions", async () => {
    const requestCapableViewer = [
      "contributions.view_detail",
      "contributions.request_corrections",
    ];

    // Without a policy row, the conservative default requires approval, so
    // request affordances surface for request-capable staff.
    let policyLoads = 0;
    const fixture = createSupabaseFixture(baseTables);
    const countingSupabase = {
      rpc: fixture.rpc,
      from(table: string) {
        if (table === "contribution_approval_policies") {
          policyLoads += 1;
        }
        return fixture.from(table);
      },
    };
    const conservative = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "staff",
      sessionClient: countingSupabase as never,
      tenantId: "tenant-1",
      viewerCapabilities: requestCapableViewer,
    });

    expect(policyLoads).toBe(1);
    // Provider-touching requests still require their direct provider
    // capabilities; request-only staff receive correction requests only.
    expect(
      conservative.giftHistory[0]?.inlineActions?.entries
        .map((entry) => entry.actionType)
        .sort(),
    ).toEqual(["amount_correction", "fund_correction"]);

    // A no_approval_required tenant must not offer request-only affordances
    // the operations route would reject with 403 (#270 gap 2).
    const relaxed = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "staff",
      sessionClient: createSupabaseFixture({
        ...baseTables,
        contribution_approval_policies: [
          {
            escalation_hours: null,
            ownership_mode: "no_approval_required",
            reminder_hours: 24,
            stronger_approval_categories: [],
            suppressed_gates: [],
            tenant_id: "tenant-1",
          },
        ],
      }) as never,
      tenantId: "tenant-1",
      viewerCapabilities: requestCapableViewer,
    });

    expect(relaxed.giftHistory[0]?.inlineActions?.entries).toEqual([]);
    expect(
      relaxed.giftHistory[0]?.inlineActions?.nextBestActionType,
    ).toBeNull();
  });

  it("keeps a legacy aggregate failure blocked after the gift is posted", async () => {
    const detail = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "staff",
      sessionClient: createSupabaseFixture({
        ...baseTables,
        donation_crm_links: [],
        staged_gifts: baseTables.staged_gifts.map((stagedGift) => ({
          ...stagedGift,
          crm_post_status: "failed",
          status: "posted",
        })),
      }) as never,
      tenantId: "tenant-1",
      viewerCapabilities: ["contributions.retry_crm_post"],
    });

    expect(
      detail.giftHistory[0]?.inlineActions.entries.find(
        (entry) => entry.actionType === "retry_staged_gift",
      ),
    ).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
      nextStep: expect.stringMatching(/historical evidence.*Asym/i),
    });
  });

  it("keeps paused staged-gift posting state historical and non-executable", async () => {
    const detail = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "staff",
      sessionClient: createSupabaseFixture({
        ...baseTables,
        donation_crm_links: baseTables.donation_crm_links.map((link) => ({
          ...link,
          link_status: "queued",
        })),
        staged_gifts: baseTables.staged_gifts.map((stagedGift) => ({
          ...stagedGift,
          status: "ready_to_post",
          crm_post_status: "blocked",
        })),
      }) as never,
      tenantId: "tenant-1",
      viewerCapabilities: ["contributions.retry_crm_post"],
    });

    expect(
      detail.giftHistory[0]?.inlineActions.entries.find(
        (entry) => entry.actionType === "retry_staged_gift",
      ),
    ).toMatchObject({
      actionType: "retry_staged_gift",
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
      nextStep: expect.stringMatching(/historical evidence.*Asym/i),
    });
  });

  it("marks gift history as truncated when the donor has more than 100 gifts", async () => {
    const donationTemplate = baseTables.donations[0]!;
    const donations = Array.from({ length: 101 }, (_, index) => ({
      ...donationTemplate,
      created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      id: `donation-${String(index + 1).padStart(3, "0")}`,
    }));

    const detail = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "staff",
      sessionClient: createSupabaseFixture({
        ...baseTables,
        donation_crm_links: [],
        donations,
        staged_gifts: [],
      }) as never,
      tenantId: "tenant-1",
    });

    expect(detail.giftHistory).toHaveLength(100);
    expect(detail.giftHistoryTruncated).toBe(true);
  });

  it("builds auditable report slices and CSV exports", async () => {
    const report = await buildAdminCrmReport({
      params: {
        filters: {
          dateFrom: null,
          dateTo: null,
          search: null,
        },
        slice: "funds",
      },
      sessionClient: createSupabaseFixture(baseTables) as never,
      tenantId: "tenant-1",
    });

    expect(report.rows).toEqual([
      expect.objectContaining({
        amountCents: 12500,
        donorCount: 1,
        giftCount: 1,
        label: "General Fund",
      }),
    ]);
    expect(report.audit.loggedEvents).toEqual([
      "actor",
      "tenant",
      "filters",
      "rowCount",
      "timestamp",
    ]);
  });

  it.each([
    [null, true],
    [{}, true],
    [
      { defaultAnonymousToRecipient: true, defaultAnonymousToPublic: false },
      false,
    ],
    [
      { defaultAnonymousToRecipient: false, defaultAnonymousToPublic: true },
      false,
    ],
    [
      { defaultAnonymousToRecipient: false, defaultAnonymousToPublic: false },
      true,
    ],
  ] as const)(
    "binds export groups and protects donor names before filtering: %j",
    async (preferences, named) => {
      const tables = {
        ...baseTables,
        donations: [
          ...baseTables.donations!,
          {
            ...baseTables.donations![0],
            tenant_id: "tenant-2",
            id: "other-gift",
            donor_id: "other-donor",
          },
        ],
        donors: [
          ...baseTables.donors!.map((donor) => ({
            ...donor,
            giving_preferences: preferences,
          })),
          { id: "other-donor", tenant_id: "tenant-2", name: "Other tenant" },
        ],
      };
      const report = (search: string | null) =>
        buildAdminCrmExportGroups({
          tenantId: "tenant-1",
          sessionClient: createSupabaseFixture(tables) as never,
          params: {
            slice: "donors",
            filters: { dateFrom: null, dateTo: null, search },
          },
        });
      for (const staffRole of ["finance", "development"] as const) {
        for (const isTenantAdmin of [false, true]) {
          const seesName = named || staffRole === "finance" || isTenantAdmin;
          for (const search of [null, "Ada"]) {
            const groups = await report(search);
            expect(groups.rows).toHaveLength(1);
            const exported = serializeAdminCrmReportCsv(
              groups,
              {
                assignmentId: "membership-1",
                userId: "user-1",
                tenantId: "tenant-1",
                revision: "v1",
                membershipRole: "staff",
                staffRole,
                isTenantAdmin,
              },
              policies("mission_control", "crm_report_groups", [
                { fieldKey: "label" },
                { fieldKey: "gift_count" },
              ]),
            );
            expect(exported.csv.includes("Ada Donor")).toBe(seesName);
            expect(exported.csv).not.toContain("Other tenant");
            // The row is in the file unless a search hides it. The audit
            // row, which every staff member reads, references a donor only
            // when they made no anonymous choice; one who did is a count, for
            // every audience (fix check G2, re-check H1).
            expect(exported.rowCount).toBe(!search || seesName ? 1 : 0);
            expect(exported.groupIds).toHaveLength(named ? 1 : 0);
            expect(exported.anonymousGroups).toBe(
              !named && (!search || seesName) ? 1 : 0,
            );
          }
        }
      }
    },
  );

  // F11(c), fix check G3: a group's source revision is a digest of its
  // tenant, slice, group and values, so a group whose values change after it
  // was built fails the export instead of leaving the file incomplete.
  it("fails the export when a group's values changed after the export bound them", async () => {
    const groups = await buildAdminCrmExportGroups({
      tenantId: "tenant-1",
      sessionClient: createSupabaseFixture(baseTables) as never,
      params: {
        slice: "funds",
        filters: { dateFrom: null, dateTo: null, search: null },
      },
    });
    const assignment = {
      assignmentId: "membership-1",
      userId: "user-1",
      tenantId: "tenant-1",
      revision: "v1",
      membershipRole: "staff",
      staffRole: "finance",
      isTenantAdmin: false,
    } as const;
    const fields = policies("mission_control", "crm_report_groups", [
      { fieldKey: "label" },
      { fieldKey: "net_amount_cents" },
    ]);
    expect(groups.rows).toHaveLength(1);
    const bound = serializeAdminCrmReportCsv(groups, assignment, fields);
    expect(bound.groupIds).toEqual(["funds:fund-1"]);
    expect(bound.csv).toContain('"General Fund","12500"');
    expect(() =>
      serializeAdminCrmReportCsv(
        {
          ...groups,
          rows: groups.rows.map((group) => ({
            ...group,
            row: { ...group.row, amountCents: group.row.amountCents + 1 },
          })),
        },
        assignment,
        fields,
      ),
    ).toThrow("A report group failed its binding");
  });

  it.each(["donors", "missionaries", "funds"] as const)(
    "does not label %s from another tenant",
    async (slice) => {
      const tables = {
        ...baseTables,
        [slice]: baseTables[slice].map((row) => ({
          ...row,
          tenant_id: "other",
        })),
      };
      const report = await buildAdminCrmReport({
        tenantId: "tenant-1",
        sessionClient: createSupabaseFixture(tables) as never,
        params: {
          slice,
          filters: { dateFrom: null, dateTo: null, search: null },
        },
      });
      expect(report.rows).toHaveLength(1);
      expect(report.rows[0]?.label).not.toMatch(
        /Ada Donor|Mina Missionary|General Fund/,
      );
    },
  );

  it("reports leftover CRM gift-link rows that still need reconciliation", async () => {
    const report = await buildAdminCrmReport({
      params: {
        filters: {
          dateFrom: null,
          dateTo: null,
          search: null,
        },
        slice: "sync-failures",
      },
      sessionClient: createSupabaseFixture({
        donation_crm_links: [
          {
            id: "link-1",
            link_status: "queued",
            scope: "parent",
            tenant_id: "tenant-1",
            updated_at: "2026-05-10T00:00:00.000Z",
          },
        ],
      }) as never,
      tenantId: "tenant-1",
    });

    expect(report.rows.map((row) => row.metadata.source)).toEqual([
      "donation_crm_links",
    ]);
    expect(report.rows[0]?.label).toMatch(/leftover|reconciliation/i);
  });
});
