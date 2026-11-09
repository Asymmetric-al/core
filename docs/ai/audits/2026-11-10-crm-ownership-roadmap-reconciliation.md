# CRM ownership and roadmap reconciliation — 2026-11-10

This record reconciles Phase 1 (Source-of-Truth Ownership Matrix), the 45-phase
roadmap and the related GitHub issues with ADR-0001: Twenty CRM is retired and
Asym Postgres owns Asym-owned CRM truth. Other systems keep their own authority
(Supabase Auth, Stripe, bank sources, QBO/Xero and delivery providers). It is a
documentation and ticket reconciliation. It claims no new implementation,
migration application, deployment, qualification or credential revocation.

## Scope and evidence

- Baseline: `develop` at `f7e94db17`. The retirement stack #1328 → #1327 →
  #1325 is an ancestor of it; #1325 merged at
  `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` on 2026-08-19.
- Corpus: every tracked Markdown, JSON and YAML file under `docs/` and
  `openspec/` plus root instructions, mapped to a roadmap phase and scanned for
  Twenty identifiers, retired machinery, retired ticket references,
  link/merge/audit tables, CRM-entity sync/cutover/rollback language and
  ownership-matrix references (about 4,100 candidate lines). Each phase was then
  screened for semantic dependence on Phase 1, not only for the word Twenty.
- Issues: a snapshot of all 1,967 issues (bodies) taken 2026-11-09; issue
  amendments re-read the live body immediately before editing.
- Runtime: code, migrations, tests and the data-boundary guard were classified
  read-only; no code changed.
- External: a names-only Vercel inventory on 2026-11-09 (below).

Limits: grill, research and captured-evidence files were classified by pattern
and sampling rather than line by line. Some very large PRDs were read around
their hits and ownership sections only. Hosted database state, custom Vercel
environments and Twenty Cloud were not inspected.

## Phase coverage

Every phase was screened. "Routed" means the new Phase 1 routing section now
points to that phase's ratified ownership source.

| Phase | Phase 1 dependency                                            | Result                                                                                                                                                                  | Remaining                                                                                 |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 0     | Evidence discipline                                           | No change; its Built/Live/Confirmed discipline governs the #602 evidence                                                                                                | Founder Lane 2 live checks                                                                |
| 1     | Itself                                                        | Evidence, retirement and open items updated; guard wording; merge row (Q7/Q8); interim `crm_notes`; Files row; provider-link carrier state; routing section             | #602 external cleanup; carrier-owner decision                                             |
| 2     | Attribution in the ledger; tenant-wide CRM                    | No change; routed                                                                                                                                                       | —                                                                                         |
| 3     | Projections, export floor                                     | Dated notes: the shadow `crm/projections` code is deleted; issue amendment #497                                                                                         | —                                                                                         |
| 4     | Merge, identity, provider links                               | Q8 recorded in five PRD clauses plus a provider-link note; #2257 link-value note; issue amendments #503/#512/#513/#514/#515; routed                                     | Carrier generalization; confidence vocabulary; Q7 versus ADR-0216 redirect reconciliation |
| 5     | Payload references; Phase 4 identity                          | No change (A7/A11 consistent)                                                                                                                                           | —                                                                                         |
| 6     | Person keys, provider links, suppressions                     | A12 and wiring no longer build on the deleted `CrmProjectionContract`; issue amendments #552/#557/#558/#560; routed                                                     | —                                                                                         |
| 7     | Party spine, credit model                                     | T3 #2257 note; issue amendments #570/#571; routed with Phase 14                                                                                                         | Party-row provider links wait for the carrier                                             |
| 8     | Merge count, command audit                                    | PRD stops reusing the dropped `crm_reconciliation_runs` and reads the Q8 store; issue amendments #587/#588/#589/#592/#596/#601; routed                                  | Phase 8 build and evidence                                                                |
| 9     | Party, graph, notes, audit                                    | PRD: re-groom complete, `crm_command_logs` not provider-reserved, interim `crm_notes`, Q8 banner; issue amendments #604/#605/#610/#613/#616/#617/#620/#623/#626; routed | Interim-notes carryover; Audit-tab socket content                                         |
| 10    | Restricted Party data                                         | No change; routed                                                                                                                                                       | —                                                                                         |
| 11    | Custom data on CRM records                                    | No change; routed                                                                                                                                                       | —                                                                                         |
| 12    | Authorization                                                 | Routed (#666 owes full rows); #2295 dropped-table note                                                                                                                  | #2295 revoke                                                                              |
| 13    | Legal donor, ledger, provider IDs                             | D2 note: the Twenty-bound `donation_crm_links` is replaced, not re-targeted; issue amendment #695; routed (#691 owes rows)                                              | Cutover disposition of `staged_gifts` compatibility columns                               |
| 14    | Credits, provider links                                       | Stale "provider-locked" anchor corrected in the PRD and #739; routed                                                                                                    | Carrier-owner decision                                                                    |
| 15    | Phase 13 ledger                                               | No change; routed                                                                                                                                                       | —                                                                                         |
| 16    | Commitment Party, Stripe evidence                             | No change; provider-control language is legitimate Stripe authority                                                                                                     | —                                                                                         |
| 17    | Communication history, provider rule                          | Platform-scope records routed                                                                                                                                           | —                                                                                         |
| 18    | Receipt facts, generated documents                            | No change                                                                                                                                                               | —                                                                                         |
| 19    | Legal-donor statement subjects                                | No change; dated amendment consistent                                                                                                                                   | —                                                                                         |
| 20    | Money rows, no contact sync                                   | No change; dated amendment consistent                                                                                                                                   | —                                                                                         |
| 21    | Party, money, provider handoffs                               | No change; rows consistent (partial read of 28 decisions)                                                                                                               | —                                                                                         |
| 22    | Party, Ministry Assignment                                    | No change; rows consistent                                                                                                                                              | —                                                                                         |
| 23    | Public content, Payload as adapter                            | Routed                                                                                                                                                                  | —                                                                                         |
| 24    | Site, domain, locale                                          | Routed                                                                                                                                                                  | —                                                                                         |
| 25    | Donor identity, CRM contact                                   | Decision-log pointer (crm-core already reconciled)                                                                                                                      | EX04 preference owner                                                                     |
| 26    | Native CRM, intake, provider evidence                         | No normative change; issue amendments #1834/#1859                                                                                                                       | —                                                                                         |
| 27    | Party, assignments                                            | Roadmap status corrected; routed                                                                                                                                        | —                                                                                         |
| 28    | Party, provider links                                         | Routed; issue amendment #2085                                                                                                                                           | Carrier-owner decision                                                                    |
| 29    | Files row, provider rule                                      | Files row updated; routed                                                                                                                                               | Provider allocation qualification                                                         |
| 30    | Identity, bindings, merge                                     | Roadmap status, chapter pointer and settled open-decisions corrected; owner constraint Q11; routed                                                                      | Carrier-owner decision; non-D17 staged-content custody                                    |
| 31    | Hard dependency on Phase 1 (provider links, connectors)       | No change; rows owed at grooming                                                                                                                                        | Carrier-owner decision                                                                    |
| 32–44 | Provider rule, Workflow row, Files row, merge, identity, care | No Twenty dependency found; rows owed at grooming or binding qualification                                                                                              | —                                                                                         |

## Corrections by theme

1. **Retirement closeout.** Phase 1's evidence item, retirement section and
   open items; `complete-twenty-crm-retirement` (task 4.5 evidence, proposal);
   `docs/ai/document-authority.md`; the archived integration proposal's broken
   ADR and matrix links; the historical old-Phase-1 banner.
2. **Guard wording.** The broad "rejects restoration" and "CI grep" wording now
   describes the implemented scan: fixed known markers in `apps/`, `packages/`,
   `scripts/` and `.env.example`, plus the ESLint client-import ban. The
   `crm-core` prohibition still forbids restoration that no marker detects.
3. **Duplicate candidates (2026-10-24 Q8).** The ruling moved candidates to
   `donor_merge_candidates`, leaving `crm_merge_candidates` dormant. It had not
   reached the Phase 1 merge row, ADR-0001 or the Phase 4, 8 and 9 PRDs.
4. **Provider-link carrier.** `crm_record_links` is the ratified carrier (Phase
   30 D9) but is still Twenty-shaped. Phase 1, `CONTEXT.md` and the Phase 14 PRD
   now state the real state and the use conditions instead of implying a
   generalized table.
5. **Removed runtime cited as a foundation.** Phase 3 and Phase 6 no longer
   build on the deleted shadow projection contracts; Phase 8 no longer reuses a
   dropped table; Phase 9 no longer reserves `crm_command_logs` for provider
   commands and records the interim `crm_notes` shape; Phase 13 no longer
   carries the Twenty-bound `donation_crm_links` into the ledger.
6. **Phase 1 completeness.** A routing section points every ratified phase that
   introduced record types to its owner source, adds no new ruling, and marks
   Phases 31–44 as owed at grooming.
7. **Status indexes.** Roadmap status for Phases 27 and 30 (projections
   regenerated), the Phase 30 chapter pointer and settled open decisions, and
   the Phase 30 owner constraint on importer build-versus-adopt.
8. **Instructions.** `data-access-boundary.md` no longer asks agents to remove
   already-removed client code; the TanStack guide no longer lists removed CRM
   handlers; both MCP templates drop the ready-to-uncomment Twenty server block.

## Deliberately unchanged

- Class B guardrails ("Twenty is retired", static checks forbidding Twenty)
  across Phases 25–30 and their issues.
- Class C history: grill, research and captured evidence; archived OpenSpec
  content (except the repaired links and status note on the archived
  integration proposal); `docs/ops/**` evidence; ADR-0001's decision and
  consequence text, now followed by a dated amendment; #466–#476 (closed not
  planned, with their retirement comment).
- Durable `crm-core` scenarios that still say "domain cutover", "projection
  shadow mode" or "the transform prepares CRM data". They are compatible with
  retirement and exclude Twenty; rewording needs its own OpenSpec change.
- The dated note in `docs/ci.md`, whose bytes are pinned by acceptance tests.

## Remaining runtime dependencies

None calls Twenty or reads a retired variable. These are retained compatibility
reads or vendor-era vocabulary with an owner:

| Surface                                                                                                                  | Owner and tracking                                          |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `crm_record_links` Twenty-shaped columns and staff write policies                                                        | Carrier owner (open decision); revoke #2295; Phase 30 #2554 |
| `crm_merge_candidates` reads in CRM detail duplicate warnings                                                            | Phase 4 #513/#514/#515 (Q8 store); Phase 9 #626             |
| Contribution detail "CRM post status", "Historical CRM posting", the CRM post-state filter, `crm_post_failed` vocabulary | Phase 13 cutover #695; contribution-operations owner        |
| `staged_gifts.twenty_record_id`/`crm_post_status`, `donation_crm_links` reads                                            | Phase 13 #695                                               |
| CRM reports `sync-failures` slice; `reconciliation.crmWriteMode`                                                         | Phase 9 #623 or Phase 13 #695                               |
| Interim `crm_notes` (not party-keyed)                                                                                    | Phase 9 #616                                                |

## Open decisions (last agreed behavior preserved)

1. **Carrier generalization owner.** Who generalizes `crm_record_links` and owns
   its typed binding command: the Phase 4/9 owners (Phase 30 ticket #2554) or
   the Phase 31 connector registry (Phase 31 owner constraints)? Until ruled, no
   new binding is written to the Twenty-shaped table as trusted provenance.
   Phase 4's retention of a merged donor's second Stripe customer link (#512)
   and Phase 7 party-row provider links (#570) wait on this.
2. **Vendor-era contribution CRM-post surfaces.** Relabel or remove them now,
   or at the Phase 13 cutover? Current behavior: read-only historical display;
   retries fail closed.
3. **Interim CRM notes.** Map existing rows to `party_id` or drop them under the
   fresh-build posture when Phase 9 reshapes `crm_notes`.
4. **Phase 9 Audit-tab socket content.** The re-groomed Phase 8 defines none;
   the socket keeps rendering nothing until Phase 8 defines it.
5. **Phase 25 EX04 preferences.** No named system-of-record owner for the
   persistent "Show in my Updates" and post-email preference versions.
6. **Merge redirects (Phase 4).** The 2026-10-24 Q7 ruling (#512, #2254)
   keeps redirects in `donor_merge_redirects` with no
   `donors.merged_into_donor_id`, while ADR-0216 and Phase 4 A9/§D still
   describe that tombstone column. Phase 30 D10 routes this to Phase 4 owner
   reconciliation; this record does not decide it.
7. **`crm-core` gift-to-CRM link scenario.** Restate it through an OpenSpec
   change once Phase 13 retires `donation_crm_links`.

## External cleanup evidence (#602)

On 2026-11-09 at 14:35 UTC an authenticated Vercel CLI (64.5.0) listed
environment-variable names, never values, for team `asymmetric-al` projects
`admin`, `donor` and `missionary` in production, preview and development.
`admin` production still lists `TWENTY_API_URL`, `TWENTY_API_KEY`,
`TWENTY_WEBHOOK_SECRET` and five retired `CRM_SYNC_*` names. No other listed
environment contains a `TWENTY_*` or `CRM_SYNC_*` name, and runtime source reads
none of them. Removing those entries, revoking the Twenty development
credentials and resolving the proof workspace need separately authorized
access; Twenty Cloud was not accessible to this check.

## Validation

Run on Windows against the working tree on 2026-11-10:

| Check                                                              | Result                                                                                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run openspec:validate` (all, strict)                          | 87 passed, 0 failed                                                                                                                         |
| `bun run openspec:audit-archive`                                   | 46 passed, 0 failed                                                                                                                         |
| `bun run verify:openspec-deltas`                                   | 83 checked; Phase 24 authority valid; Phase 29 spec check passed                                                                            |
| `verify:program-roadmap` steps                                     | Phase projections, roadmap verifier (553 local links), extensions, Workflow Studio verifier and Web planning verifier passed                |
| Workflow Studio `render.py --check`                                | Fails only on Windows: text-mode stdin turns LF into CRLF before the contract view; no input is changed here                                |
| `node scripts/verify/data-boundary-check.mjs`                      | Passed                                                                                                                                      |
| Prettier on changed files                                          | Passed                                                                                                                                      |
| Relative links in changed Markdown                                 | 408 checked, 0 broken                                                                                                                       |
| Focused unit and acceptance tests reading changed files (21 files) | Passed, except 27 Phase 24 authority fixture tests that fail identically with `develop`'s copy of the only changed input (Windows baseline) |

## Issue updates

Each issue below receives a dated `Amendment (2026-11-10)` section that names
the text it supersedes and leaves the original body in place: #497, #503, #512,
#513, #514, #515, #552, #557, #558, #560, #570, #571, #587, #588, #589, #592,
#596, #601, #604, #605, #610, #613, #616, #617, #620, #623, #626, #695, #739,
#1834, #1859, #2085 and #2295. #505 already carries Samson's 2026-10-24
amendment comment and is left unchanged. #602's status sections are rewritten
around the evidence above, and its original scope is preserved verbatim.
#466–#476 stay closed as not planned.
