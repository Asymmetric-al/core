# ADR-0239: A tenant's erasure of a person stops at that tenant; closing an account is the person's own act

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
What erasure and closure do to published content about a worker is the plan
section 15.1 default taken under the implementation record (D-06), not a fresh
owner ruling: erasure withdraws that content one way, and closure changes no
organization's records.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

One login is shared across organizations (ADR-0214), so ending it would lock a
person out of every other organization they belong to, and no organization may
change another's records. The Auth admin API's default hard delete would cascade
to the profile and is refused outright for anyone who wrote a care note (audit
NR-43). Stored avatar, cover and editor images sit in public buckets under the
person's folder, and no database row removes them (NR-51).

## Decision

1. **Erasure is a tenant command.** A tenant administrator with `people.erase`
   and a reason anonymizes that tenant's Party and the mutable records about it,
   removes that tenant's account link and the person's memberships there, and
   applies the retention rules. It first records a stop on the Party's live
   monthly commitments in the tenant and keeps the provider identifiers and the
   stop obligation until the provider confirms. It never changes the profile, the
   login, its sessions or another organization's records, and it is refused for
   the tenant's last administrator. Posted rows and receipt facts are untouched.
2. **Erasing a worker withdraws what is published about them, one way and in the
   same transaction:** the subject's live releases are withdrawn, as a
   restriction withdraws them, and the approved profile revision and updates are
   marked withdrawn. No command restores them. No image in custody is deleted.
3. **Closing an account is a platform command only the account's owner can call,**
   from their own session with fresh proof: a one-time code sent to the login's
   address and entered in the same session. It records a stop on the person's own
   live monthly commitments, anonymizes the profile, removes every account link
   and membership of that login, then soft-deletes the login through the Auth
   admin API and revokes its sessions. The `auth.users` row stays, so authorship
   keys survive. It is refused while the login is a tenant's last administrator.
   Each organization's Party stays until that organization erases it, and
   published content about the person stays until that organization withdraws it.
4. **Both queue the removal of the person's stored images:** erasure those under
   the tenant's folder, closure those under every tenant's. The addresses that
   named a removed object are cleared with it.
5. **Closure stamps the profile as closed,** and the profile's own-row policy
   refuses any write after that, because an access token already issued stays
   valid for up to an hour.
6. **A login is otherwise ended only when a platform operator locks a compromised
   one,** which is a ban, not a delete (ADR-0228).

## Consequences

- A closure whose Auth call failed is finished by re-running it; the soft delete
  and session revocation are safe to repeat.
- Release rows are immutable, so the stored body of a withdrawn page still holds
  what it said. What erasure does with those stored bodies is part of the owner's
  erasure decision (council record C.8, reservation 12).

## Source

- [Plan, section 5.5](../audits/core-crm-cms-database-target-architecture.md#55-revocation-sensitive-data-and-operators)
  and the erase and close-account rows of
  [section 8.1](../audits/core-crm-cms-database-target-architecture.md#81-which-operations-are-atomic-and-where-the-transaction-lives)
- Work package WP10
- Related: [ADR-0214](0214-path2-tenant-isolation-with-shared-native-credential.md),
  [ADR-0216](0216-non-destructive-source-governed-replayable-donor-merge.md),
  [ADR-0229](0229-per-page-releases-and-two-publish-commands.md)
