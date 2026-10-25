# Identity claim and invitation tables

Owner: #2255 (#506 slice b). Migration:
`supabase/migrations/20261025090000_account_claim_and_invitation_tables.sql`.
Rollback: `supabase/migrations/rollback_20261025090000_account_claim_and_invitation_tables.sql`.

Two tenant-scoped tables are the durable record for the later claim (#509) and
invitation (#510) flows. This slice is schema only: no app code reads or writes
them yet.

- `public.account_claim_requests` is one request to claim a donor record.
- `public.legacy_account_invitations` is one single-use, revocable, expiring
  invitation bound to a legacy donor. It is the lifetime record of the minted
  Supabase link or OTP, stored as a hash only (see
  [Link token rule](#link-token-rule-q16)).

## Columns

Both tables share these columns and keys:

| Column                     | Rule                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `tenant_id`                | `uuid NOT NULL`, references `tenants(id)`                                                      |
| `id`                       | `uuid NOT NULL DEFAULT gen_random_uuid()`; primary key `(tenant_id, id)`                       |
| `donor_id`                 | composite FK `(tenant_id, donor_id)` to `donors(tenant_id, id)`                                |
| `email`                    | `text NOT NULL`, the raw value as entered                                                      |
| `email_normalized`         | generated: `public.normalize_email(email)` (#2254); a blank email is rejected (`23514`)        |
| `created_at`, `updated_at` | `timestamptz NOT NULL DEFAULT now()`; no trigger, so the writers in #509/#510 set `updated_at` |

`email_normalized` is `GENERATED ALWAYS … STORED`, so it follows every change
to `email` and can't be written directly (`428C9`). The rule is the one in
[identity-email-normalization.md](identity-email-normalization.md); nothing here
applies a second rule.

`account_claim_requests` also has:

| Column                           | Rule                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `donor_id`                       | nullable: a claim may not have a matched donor yet                                |
| `requested_by`                   | the requester's `auth.users.id`, that is `auth.uid()` (Q15); `ON DELETE SET NULL` |
| `status`                         | `pending` (default), `verified`, `approved`, `denied` or `expired`                |
| `match_type`, `match_confidence` | nullable `text`; the matcher (#508/#509) adds their value sets later              |
| `reason`                         | nullable `text`                                                                   |
| `resolved_by`, `resolved_at`     | the resolving staff user (`auth.users.id`, `ON DELETE SET NULL`) and time         |

`legacy_account_invitations` also has:

| Column                      | Rule                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| `donor_id`                  | `NOT NULL`: every invitation is bound to one donor                          |
| `invited_by`                | nullable `auth.users.id`, `ON DELETE SET NULL`, so later bulk issuance fits |
| `link_token_sha256`         | `bytea`, exactly 32 bytes, unique where set                                 |
| `link_token_expires_at`     | set if and only if `link_token_sha256` is set                               |
| `status`                    | `sent` (default), `accepted`, `expired` or `revoked`                        |
| `expires_at`                | `timestamptz NOT NULL DEFAULT now() + interval '7 days'`                    |
| `revoked_at`, `accepted_at` | nullable                                                                    |

Statuses are `text` with a `CHECK`, not native enums; any other value fails with
`23514`. Status transitions and lifecycle rules (such as `accepted_at` set only
when `accepted`) belong to #509/#510, not to this schema.

A row can never reference a donor in another tenant: the donor FK includes
`tenant_id`, and FK checks ignore RLS, so the key itself is the guard (`23503`).

## Access

Both tables have ENABLE and FORCE row level security. Every policy is
`FOR SELECT TO authenticated`.

| Role            | `account_claim_requests`                                                                                      | `legacy_account_invitations`                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `anon`          | no privilege (`42501`)                                                                                        | no privilege (`42501`)                                                  |
| `authenticated` | `SELECT` only. Rows where `authz.has_staff_membership(tenant_id, NULL)`, or where `requested_by = auth.uid()` | `SELECT` only. Rows where `authz.has_staff_membership(tenant_id, NULL)` |
| `service_role`  | `ALL` (bypasses RLS)                                                                                          | `ALL` (bypasses RLS)                                                    |

The policies are `account_claim_requests_staff_select`,
`account_claim_requests_requester_select` and
`legacy_account_invitations_staff_select`.

The contract the acceptance suite checks:

1. **Staff isolation.** A user with an active `staff` membership in tenant A
   sees every A claim request and invitation and none of tenant B's. Inactive
   staff see nothing. `INSERT`, `UPDATE` and `DELETE` by any signed-in user fail
   with `42501`, so B's rows can't change.
2. **Own requester.** A signed-in user sees exactly the claim requests where
   `requested_by = auth.uid()`, with or without a membership, and none of
   anyone else's. They see the whole row, including match fields and
   `resolved_by`. They can't insert a request (`42501`).
3. **Non-staff and anon.** A non-staff user sees zero invitations. `anon` holds
   no privilege on either table, and `authenticated` holds `SELECT` and nothing
   else.
4. **Link token.** See the rule below.

The migration runs `REVOKE ALL … FROM PUBLIC, anon, authenticated` before its
grants. Hosted Supabase otherwise gives new `public` tables default grants to
`anon` and `authenticated`, which CI's plain Postgres doesn't show.

## Link token rule (Q16)

An invitation stores only a **SHA-256** hash of the link token plus that
token's expiry. It **never** stores the raw link, OTP or token.

- `link_token_sha256` is SHA-256 over the UTF-8 bytes of the exact token the
  redemption endpoint will receive. `CHECK (octet_length(...) = 32)` rejects
  anything else with `23514`: a raw URL, a 6-digit OTP, a hex string, or
  Supabase's 28-byte `hashed_token`.
- Supabase's `hashed_token` (the `token_hash` that `verifyOtp` accepts) is
  itself a bearer credential: it signs a user in. So it must be hashed again
  with SHA-256 before it is stored; storing it raw breaks this rule.
- `action_link` and `email_otp` from `generateLink` are never stored.
- The hash and `link_token_expires_at` are both set or both NULL (`23514`).
  The link's own expiry is shorter than the 7-day `expires_at` of the
  invitation, so they are separate columns.
- A hash is globally unique (`23505`).
- No other column on either table names a token, OTP, link, secret or URL.

## Writers

Only server-side code writes these tables. The claim flow (#509) writes
`account_claim_requests`, and the invitation flow (#510) writes
`legacy_account_invitations`, both through `service_role`. `service_role`
bypasses these policies, so those writers must scope every query by tenant in
code (the service-role allowlist and `tenant_guard`). The schema gives no
protection against a mis-scoped service-role write.

## Rollback and order

- Apply after #2254: the generated columns call `public.normalize_email`.
- Roll back with
  `rollback_20261025090000_account_claim_and_invitation_tables.sql`, which
  drops both tables and with them their policies, indexes and grants. Nothing
  else changes.
- Roll this back **before** #2254's rollback. Dropping `public.normalize_email`
  fails while these generated columns exist.
- Once #509/#510 write real rows, the rollback deletes them. Decide before
  running it.
