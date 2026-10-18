# D4 technical research — reversible working state, stable source identity

Research date: October 16, 2026 UTC. No application schema, API, hosted project
or live record was changed. The existing Supabase/Postgres guidance was applied
with fresh primary-document checks. The same-day changelog review is retained
in [D3 technical research](../d3-evidence/technical-research.md); this change
introduces no new provider or managed-schema dependency. Exact D4 retrievals,
dates and hashes are in [technical-source-fetches.json](technical-source-fetches.json).

## Verified mechanics

| Primary source                                                                           | Verified behavior                                                                                                                                                                                          | D4 consequence                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html)       | Read Committed uses statement snapshots; concurrent UPDATE may wait and re-evaluate its condition. A prior ordinary SELECT is not a transaction-wide invariant.                                            | Archive/restore acceptance must bind current source revision and effective authority. Checking first and blindly updating later can overwrite a newer intent.                                                                                                               |
| [PostgreSQL 17 locking](https://www.postgresql.org/docs/17/explicit-locking.html)        | Conflicting row locks serialize relevant updates; inconsistent lock ordering can deadlock.                                                                                                                 | Reuse the source's ordered acceptance/revocation boundary. Keep the transaction small and use consistent ordering; no new tenant-wide lock or generic workflow coordinator is justified by archiving one entry.                                                             |
| [PostgreSQL 17 policies](https://www.postgresql.org/docs/17/sql-createpolicy.html)       | USING checks existing rows and WITH CHECK checks the proposed state. When omitted for UPDATE/ALL, WITH CHECK inherits USING. Permissive policies combine with OR.                                          | Validate both sides of archive/restore and all effective policies. Owner/tenant/author/visibility fields remain immutable except through their own authorized commands. A narrow archive policy cannot repair an older broad permissive reader.                             |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)    | Grants and policies are separate; user metadata is user-controlled, token metadata can be stale, and privileged roles may bypass RLS. Invoker views use caller privileges.                                 | Active/Archived is a working-list filter, not authorization. Archived reads, matching, result recovery, search/counts and source commands still require current tenant/source access. Do not broaden a view or service-role query merely to make Restore work.              |
| [Supabase functions](https://supabase.com/docs/guides/database/functions)                | Invoker is the default. Definer uses its owner's rights; safe search_path and explicit execution privileges matter. PUBLIC execution is a separate grant to inspect.                                       | A state toggle with trusted audit/retry evidence belongs behind the qualified source mutation boundary. Do not add a public privileged RPC or trust caller-provided actor/tenant/author. This does not prescribe a new SQL function or table name.                          |
| [PostgreSQL 17 partial indexes](https://www.postgresql.org/docs/17/indexes-partial.html) | A partial unique index enforces uniqueness only among rows satisfying its predicate. Planner use of a partial index depends on proving the query predicate; a generic parameter condition may not suffice. | Never change an all-lifecycle canonical invariant to active-only uniqueness simply to allow archive. Archived source identity still matters to safe matching. Measure actual filtered query plans and prepared execution; an index's existence is not a performance result. |

As in D1, view/definer bypass depends on actual owners and privileges, not just
the object keyword; filtered/RETURNING updates require the applicable SELECT
access. No broad claim that every omitted WITH CHECK is a vulnerability is
made. Existing D1 mechanics remain the evidence for those distinctions.

## Smallest sound transition contract

The preparation owner retains one source identity and an ordinary current-work
disposition: active or archived. Exact column, enum, timestamp and receipt shapes
are implementation choices. Reusing an existing qualified source lifecycle is
preferable to a new archive subsystem, but P9's global Party lifecycle cannot
stand in for this per-preparation meaning.

- Archive and restore are explicit current-state transitions of the same entry.
  They do not copy/delete the row, create another Party, change its author,
  transfer access or change a canonical person's lifecycle.
- Persist the transition and its required minimal source/audit/retry evidence
  atomically. A technical log is not the business receipt; a receipt must not
  copy private note/contact bodies into broader-readable logging.
- Bind each intended operation to its tenant, actor/source authority, target,
  requested operation and expected source version. Reject reuse with different
  meaning. Repeating an already accepted operation recovers its original effect;
  it does not reapply it after an intervening restore.
- A new archive after a restore is a new legitimate transition. Therefore an
  eternal uniqueness key of just `(entry, archive)` is also wrong. Conversely,
  a new transport request must not duplicate the same already-accepted transition
  or create an independent task/notice. Use the owner's durable business identity.
- If offered, convenience Undo is a newly authorized, conditional inverse of the specific accepted
  transition, not a rollback of the whole record. A stale Undo cannot reverse a
  later rearchive, correction or disclosure. Return the current authorized
  outcome or ask for a refreshed deliberate action rather than silently replay.
- Current state and historical operation outcome can differ: “the archive was
  accepted, and the entry was later restored” is coherent. Recovered historical
  receipts must not overwrite newer state in the UI. Unknown responses reconcile
  the original operation before the UI claims Saved/Archived/Restored.
- Order archive/restore/share against source correction and the revocation of
  authority required for that operation. Revoking an unrelated grant does not
  remove another valid authority path. Recheck the actual source context; a
  stale pre-archive Share must not silently bypass the updated review.

Sharing and working-list status remain separate. An already accepted D2 share
cannot be undone by archiving. A new deliberate, currently qualified share from
archived detail need not restore the entry to active prospects; its normal
review can say so. No archive state itself grants or revokes the sharing power.

## Data, indexing and retained-history boundaries

1. Keep tenant/source relationships exact; constrain valid state combinations
   and preserve stable canonical IDs. Do not invent a universal one-prospect-per-
   email rule or assume several legitimate preparation contexts must merge.
2. New qualified preparation has an explicit current-work state. Legacy backfill
   must establish source meaning before labeling rows private, shared or archived;
   absence of a legacy field is not evidence of any of those facts.
3. Authorized Active/Archived list views and counts apply access first, then
   working-state/filter/pagination. Archived discovery uses the same audience;
   no administrator archive browser or fallback owner is created.
4. Matching may need authorized archived evidence even when the ordinary list is
   active-only. A private matching service must preserve P4/P9 hidden-result
   boundaries and source cardinality. An archived result never auto-restores.
5. Index actual tenant/access/current-work/sort predicates, with stable tie-breaks
   and bounded pagination. Do not fetch the entire archive into a browser or
   compute complete counts/duplicates from a capped active page. No new numerical
   query/tenant budget is established by this review.
6. Retention/disposition remains source-owned. Archive/restore cannot invent a
   new deadline, extend retention indefinitely, revive erased bodies or reset a
   timer by accident. Any policy effect must be qualified explicitly by its owner.
7. Real reminders, appointments, managed partnerships, newsletters, commitments
   and gifts retain their own source state. Archiving is not cancellation,
   completion, unsubscribe, permission, pause or a trigger to replay work on
   restore. A future purpose that depends on working state must qualify that
   dependency rather than infer it from this generic action.

## Evidence limits and proof route

The [D4 PostgreSQL probe](postgres-probe/README.md) passed 19/19 expected outcomes
on PostgreSQL 17.11, including three controlled two-session races with observed
lock waits. Container and volume cleanup were verified. It tests selected
transition, retry, uniqueness and concurrency hypotheses in a synthetic schema. It is not
Core's final source schema, Supabase Auth/Data API/Storage authorization or a
browser workflow. The current preparation producer does not exist in the
inspected application paths; no passing synthetic example can qualify it.

The exact proof before activation must include actual grants/RLS/view/RPC roles,
source actor and revision checks, lost-response recovery, archive/restore/Undo
races, current-authority changes, archived matching, retained-data migrations,
client cache/late-result isolation, keyboard/mobile use and accessible recovery.
Use the existing P4/P9/P12 services and shared UI; do not introduce another
contact database, archive service, permission engine, notification channel or
external dependency to meet this decision.
