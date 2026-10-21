# D27 independent review and resolution

Reviewed October 17, 2026 UTC. These are independent reasoning/static research
reviews of the proposed decision, not a certification of implemented behavior.

| Workstream                       | Challenge                                                                                                                                                          | Resolution in the root decision                                                                                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance and current source    | Resume cannot mean merely opening a page, copying a record or restoring old authority. Same membership ID may conceal ended participation.                         | C02–C05 define current source-history authority and deliberate same-record current-context inclusion, with immutable origin and one independent Active/Archived state. Temporary withholding does not force unnecessary reselection; ended participation does.              |
| UX and primary research          | Generic restoration would add ceremony and import conflicting archive/relationship/retention behavior from other products.                                         | Small Earlier preparation list and familiar detail/editor. Resume selects current work; explicit D4 Return may atomically include and unarchive. No redundant confirmation, staff body-review queue, relationship-status mutation or perpetual storage promise.             |
| Database and authorization       | Existing staff CRM note attribution, generic role snapshots and static portal keys do not qualify private source history. JWT/row ownership alone is insufficient. | C02/C03/C09–C12 require exact current admission, tenant-aware identity relationships, command/privilege/RLS invariants and scoped result recovery. Current session validation and existing user-switch cache clearing are acknowledged; no deployed D27 exploit is claimed. |
| Finite counterexample workstream | Unsafe alternatives can satisfy the happy-path language while failing reuse, scope, revocation, retention or retry cases.                                          | Executable synthetic comparators cover 14 unsafe alternatives and five positive controls, with 94 assertions. Root reproduced identical output. Abstract locks, grants, time and durable state are explicit assumptions, not actual runtime proof.                          |

The governance reviewer read the corrected decision, C01–C18, all 22 categories,
P01–P24 and synthesis and reported no material contradiction. The UX reviewer
read the same core artifact and reported no material usability/evidence blocker;
its earlier alternative **Continue preparation** label was design guidance, not
a competing requirement. The database reviewer read the decision, authorization
clauses, monitors, gates and finite model and reported no material contradiction.

The database reviewer requested an explicit grant/body-retention-expiry test
during row/authorization lock waits. The root captured it in **C11/P12**: check
current time at acceptance after waits, not transaction-start time. The root also
made temporary-withholding preservation explicit in **C04/P03**, and append-only
accepted effect/audit history within qualified retention explicit in **C16**.
No new product right or implementation mechanism was added by those refinements.

The root independently executed the final finite model and compared exact output
bytes with the agent's result. [Reproduction evidence](root-reproduction.json)
records script/result hashes. [Verification](review-verification.json) records
document structure, local references, evidence hashes and selected/unratified
status. No prior D26 evidence was edited or rerun.

No actual missionary interview, authenticated competitor test, hosted database,
production role test, browser/a11y run, load test or real concurrency test occurred.
Their required proof is separately named in P01–P24. The review is complete for
the bounded product decision; no Q28 or formal-spec/ticket transition is implied.
