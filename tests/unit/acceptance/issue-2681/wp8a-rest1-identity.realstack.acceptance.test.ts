import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  attempt,
  claimEvent,
  core,
  coreOutcome,
  existingDonor,
  failEvent,
  giftIntake,
  giftOf,
  identityRows,
  inTx,
  intakeRow,
  pay,
  paymentIntent,
  person,
  recordReference,
  role,
  seedTwoTenants,
  storeEvent,
  tryApply,
  uniqueEmail,
  work,
} from "./wp8a-rest1-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 1: who gave, plan 5.4's six rows through the real apply (closes :1155; W8-R25; the rule of 27 November; real stack, every test rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const count = (rows: unknown[]) => rows.length;

    it("row 268, a guest with an unknown email: one new unclaimed Party and donor named as typed, the gift and the intake carry it, no link, no membership, no hold", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          contact: {
            email: uniqueEmail(),
            first: " Ann ",
            last: "Lee",
            address: { street: "1 Main St", city: "Springfield", zip: "11111" },
          },
        });
        const { outcome } = await pay(db, intake);
        expect(outcome).toMatchObject({ outcome: "applied", holds: [] });
        const after = await identityRows(db, fx.A.tenant);
        expect(count(after.parties) - count(before.parties)).toBe(1);
        expect(count(after.donors) - count(before.donors)).toBe(1);
        expect(after.links).toEqual(before.links);
        expect(after.memberships).toEqual(before.memberships);
        const donor = after.donors.at(-1)!;
        expect(donor).toMatchObject({
          name: "Ann Lee",
          email: intake.contact!.email,
          profile_id: null,
          party_id: after.parties.at(-1)!.id,
        });
        expect(after.parties.at(-1)!.display_name).toBe("Ann Lee");
        expect((await giftOf(db, intake.donationId))!).toMatchObject({
          donor_id: donor.id,
          donor_match_status: "matched",
          review_reason: "awaiting_review",
        });
        expect((await intakeRow(db, intake.donationId)).donor_id).toBe(
          donor.id,
        );
      }));

    it("row 269, a guest whose email one donor has: attribution to that donor and nothing else; the email is compared normalized", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const email = uniqueEmail();
        const donorId = await existingDonor(db, fx.A, {
          name: "Ann Lee",
          email,
        });
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          contact: {
            email: `  ${email.toUpperCase()} `,
            first: "ann",
            last: "LEE",
          },
        });
        const { outcome } = await pay(db, intake);
        expect(outcome).toMatchObject({
          outcome: "applied",
          donor_id: donorId,
          holds: [],
        });
        expect(await identityRows(db, fx.A.tenant)).toEqual(before);
      }));

    it("row 270, signed in with no link and an unknown confirmed email: a new unclaimed Party and donor by the session's email, no link, no membership, no profile on the donor", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A);
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: true },
          contact: {
            email: uniqueEmail("typed"),
            first: "Sam",
            last: "Signed",
          },
        });
        await pay(db, intake);
        const after = await identityRows(db, fx.A.tenant);
        expect(count(after.parties) - count(before.parties)).toBe(1);
        expect(after.donors.at(-1)).toMatchObject({
          email: login.email,
          profile_id: null,
        });
        expect(after.links).toEqual(before.links);
        expect(after.memberships).toEqual(before.memberships);
      }));

    it("row 271, signed in with no link and the session's email on one donor: attribution only, no link, no membership", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A);
        const donorId = await existingDonor(db, fx.A, {
          name: "Sam Signed",
          email: login.email,
        });
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: true },
          contact: { email: login.email, first: "Sam", last: "Signed" },
        });
        const { outcome } = await pay(db, intake);
        expect(outcome).toMatchObject({ donor_id: donorId });
        expect(await identityRows(db, fx.A.tenant)).toEqual(before);
      }));

    it("row 272, signed in and linked: the gift on the linked Party's donor, no new Party, donor, link or membership; no email is compared", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A, {
          link: true,
          donor: true,
          donorName: "Someone Else Entirely",
        });
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: true },
          contact: { email: uniqueEmail(), first: "Not", last: "Matching" },
        });
        const { outcome } = await pay(db, intake);
        expect(outcome).toMatchObject({ donor_id: login.donor, holds: [] });
        expect(await identityRows(db, fx.A.tenant)).toEqual(before);
      }));

    it("row 273, linked to a Party with no donor: one donor on that Party named from parties.display_name, never the typed name, and one donor membership; no new Party or link", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A, {
          link: true,
          partyName: "Party Display Name",
        });
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: true },
          contact: { email: uniqueEmail(), first: "Typed", last: "Legal Name" },
        });
        await pay(db, intake);
        const after = await identityRows(db, fx.A.tenant);
        expect(after.parties).toEqual(before.parties);
        expect(after.links).toEqual(before.links);
        expect(count(after.donors) - count(before.donors)).toBe(1);
        expect(after.donors.at(-1)).toMatchObject({
          party_id: login.party,
          name: "Party Display Name",
          profile_id: null,
          email: null,
        });
        expect(after.memberships).toEqual([
          ...before.memberships,
          { user_id: login.user, role: "donor", is_active: true },
        ]);
      }));

    it("a login with no link but a worker row gives on the worker's Party (the writer's order), with no link and no membership", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A, {
          worker: true,
          partyName: "Worker Party",
        });
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: true },
        });
        await pay(db, intake);
        const after = await identityRows(db, fx.A.tenant);
        expect(after.parties).toEqual(before.parties);
        expect(after.donors.at(-1)).toMatchObject({ party_id: login.party });
        expect(after.links).toEqual(before.links);
        expect(after.memberships).toEqual(before.memberships);
      }));

    it("a session whose email Auth has not confirmed is matched as a guest, by the typed email; the session's email matches nothing", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A, { confirmed: false });
        const sessionDonor = await existingDonor(db, fx.A, {
          name: "Session Donor",
          email: login.email,
        });
        const typed = uniqueEmail("typed");
        const typedDonor = await existingDonor(db, fx.A, {
          name: "Typed Donor",
          email: typed,
        });
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: false },
          contact: { email: typed, first: "Typed", last: "Donor" },
        });
        const { outcome } = await pay(db, intake);
        expect(outcome.donor_id).toBe(typedDonor);
        expect(outcome.donor_id).not.toBe(sessionDonor);
      }));

    it("a typed email that differs from a confirmed session's is contact evidence only: the session's email decides and the typed one stays on the contact row", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A);
        const typed = uniqueEmail("typed");
        await existingDonor(db, fx.A, { name: "Typed Donor", email: typed });
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: true },
          contact: { email: typed, first: "Sam", last: "Signed" },
        });
        const { outcome } = await pay(db, intake);
        const after = await identityRows(db, fx.A.tenant);
        expect(
          after.donors.find((d) => d.id === outcome.donor_id),
        ).toMatchObject({
          email: login.email,
        });
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT email FROM public.donation_intake_contacts WHERE donation_id = $1",
              [intake.donationId],
            )
          ).rows[0].email,
        ).toBe(typed);
      }));

    it("another organization's identical donor never matches: organization A writes its own Party and donor", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const email = uniqueEmail();
        const other = await existingDonor(db, fx.B, { name: "Ann Lee", email });
        const intake = await giftIntake(db, fx.A, {
          contact: { email, first: "Ann", last: "Lee" },
        });
        const { outcome } = await pay(db, intake);
        expect(outcome.donor_id).not.toBe(other);
        expect(
          (await identityRows(db, fx.A.tenant)).donors.map((d) => d.email),
        ).toContain(email);
      }));

    it("an evaluation that raises midway writes nothing and leaves the event retryable: a Party with two donors refuses 21000; once fixed, the retry applies once", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const login = await person(db, fx.A, { link: true, donor: true });
        await role(db, null);
        const twin = (
          await db.query(
            "INSERT INTO public.donors (tenant_id, party_id, name) VALUES ($1, $2, 'Twin') RETURNING id",
            [fx.A.tenant, login.party],
          )
        ).rows[0].id as string;
        const before = await identityRows(db, fx.A.tenant);
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: true },
        });
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const event = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        await claimEvent(db, event.id);
        const refused = await tryApply(db, event.id, 1);
        expect([refused.ok, refused.code]).toEqual([false, "21000"]);
        expect(await failEvent(db, event.id, 1)).toMatchObject({
          outcome: "failed",
        });
        expect(await identityRows(db, fx.A.tenant)).toEqual(before);
        expect(await giftOf(db, intake.donationId)).toBeUndefined();
        expect(await intakeRow(db, intake.donationId)).toMatchObject({
          status: "pending",
          donor_id: null,
        });
        await role(db, null);
        await db.query("SET LOCAL session_replication_role = replica");
        await db.query("DELETE FROM public.donors WHERE id = $1", [twin]);
        await db.query("SET LOCAL session_replication_role = origin");
        await role(db, null);
        await db.query(
          "UPDATE public.stripe_connect_events SET next_attempt_at = now() - interval '1 second' WHERE id = $1",
          [event.id],
        );
        expect(await claimEvent(db, event.id)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
        expect((await tryApply(db, event.id, 2)).rows[0]!.r).toMatchObject({
          outcome: "applied",
          donor_id: login.donor,
        });
      }));

    it("a paid intake with no account to resolve and no email refuses 22023 giver_email_missing and writes nothing", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await giftIntake(db, fx.A, { contact: null });
        const before = await identityRows(db, fx.A.tenant);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const event = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        const r = await core(db, fx.A.tenant, event.id);
        expect([r.ok, r.code, r.message]).toEqual([
          false,
          "22023",
          "giver_email_missing",
        ]);
        expect(await identityRows(db, fx.A.tenant)).toEqual(before);
        expect(await giftOf(db, intake.donationId)).toBeUndefined();
      }));

    it("a replay writes no second Party: the same event again, and a second success event for the same PaymentIntent, change nothing", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await giftIntake(db, fx.A);
        const { pi, event } = await pay(db, intake);
        const after = await identityRows(db, fx.A.tenant);
        expect(
          coreOutcome(await core(db, fx.A.tenant, event.id)),
        ).toMatchObject({
          outcome: "no_change",
        });
        const second = await storeEvent(db, fx.A, {
          pi,
          amount: intake.amount,
        });
        expect(await work(db, second.id)).toMatchObject({
          outcome: "no_change",
        });
        expect(await identityRows(db, fx.A.tenant)).toEqual(after);
      }));

    it("a declined and an abandoned checkout leave no Party, donor, link or membership; neither writes the intake's donor or a gift (D-18, AL-2681 fix round F14: the two checkouts' own gifts are looked up, not a hold under the zero id)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const before = await identityRows(db, fx.A.tenant);
        const declined = await giftIntake(db, fx.A);
        const pi = paymentIntent();
        await recordReference(db, declined.donationId, pi);
        const failed = await storeEvent(db, fx.A, {
          type: "payment_intent.payment_failed",
          pi,
          amount: declined.amount,
        });
        expect(await work(db, failed.id)).toMatchObject({ status: "failed" });
        const abandoned = await giftIntake(db, fx.A);
        await role(db, null);
        await db.query("SET LOCAL session_replication_role = replica");
        await db.query(
          "UPDATE public.donations SET created_at = now() - interval '8 days' WHERE id = $1",
          [abandoned.donationId],
        );
        await db.query("SET LOCAL session_replication_role = origin");
        await role(db, "service_role");
        const swept = await attempt(
          db,
          "SELECT public.abandon_unpaid_intake($1) AS r",
          [abandoned.donationId],
        );
        await role(db, null);
        expect(swept.rows[0]!.r).toMatchObject({ outcome: "abandoned" });
        expect(await identityRows(db, fx.A.tenant)).toEqual(before);
        expect((await intakeRow(db, declined.donationId)).donor_id).toBeNull();
        expect((await intakeRow(db, abandoned.donationId)).donor_id).toBeNull();
        expect(await giftOf(db, declined.donationId)).toBeUndefined();
        expect(await giftOf(db, abandoned.donationId)).toBeUndefined();
      }));

    it("F1: who gave is not on donations: the giver's login, its address and whether it was confirmed sit on the intake's sealed contact row, which anon, authenticated and service_role cannot read", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await role(db, null);
        expect(
          (
            await db.query(
              `SELECT attname FROM pg_attribute
                WHERE attrelid = 'public.donations'::regclass AND NOT attisdropped
                  AND attname IN ('actor_user_id', 'actor_email', 'actor_email_confirmed')`,
            )
          ).rows,
        ).toEqual([]);
        expect(
          (
            await db.query(
              `SELECT r, c FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r,
                      unnest(ARRAY['actor_user_id', 'actor_email', 'actor_email_confirmed']) AS c
                WHERE has_column_privilege(r, 'public.donation_intake_contacts', c, 'SELECT')`,
            )
          ).rows,
        ).toEqual([]);
        const login = await person(db, fx.A, { confirmed: false });
        const intake = await giftIntake(db, fx.A, {
          actor: { user: login.user, email: login.email, confirmed: false },
        });
        await role(db, null);
        expect(
          (
            await db.query(
              `SELECT actor_user_id, actor_email, actor_email_confirmed
                 FROM public.donation_intake_contacts WHERE donation_id = $1`,
              [intake.donationId],
            )
          ).rows,
        ).toEqual([
          {
            actor_user_id: login.user,
            actor_email: login.email,
            actor_email_confirmed: false,
          },
        ]);
        const sealed = await attempt(
          db,
          "UPDATE public.donation_intake_contacts SET actor_email = 'other@example.test' WHERE donation_id = $1",
          [intake.donationId],
        );
        expect([sealed.code, sealed.message]).toEqual([
          "23514",
          "donation_intake_contact_sealed",
        ]);
      }));
  },
);
