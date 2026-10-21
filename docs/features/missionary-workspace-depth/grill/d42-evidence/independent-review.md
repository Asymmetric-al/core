# D42 independent adversarial challenge

October 18, 2026. Static review of the new D42 decision and its Auth, owner,
database, UX and behavioral-model evidence. This reviewer did not execute or
import an earlier program, the new model, application code or database state.
The model and its recorded results were inspected as research artifacts only.

## Initial finding requiring correction

### IR01 — Private subscription reads need the same address-assurance boundary

**Material concern: yes. High severity; plausible if the read endpoint accepts
the ordinary current account email.** This is an ambiguity in the proposed
contract, not a demonstrated deployed disclosure.

**Evidence and conflict.** D42-C02 properly rejects a confirmation timestamp,
administrative marking and autoconfirm alone as mailbox assurance for immediate
admission. The inspected initial D42-C17 wording instead allowed self-service
reads through “the exact current address/purpose or narrow receipt authority”.
It did not expressly require qualified mailbox evidence for an address-keyed
membership lookup. A signed-in user can therefore satisfy the literal weaker
read wording with an account address that C02 correctly refuses to trust for
joining. The review's local Auth configuration and administrative seeding facts
are concrete reasons this distinction matters.

**What could go wrong.** An unqualified account with someone else's address
could learn an existing subscription, withdrawal or restriction state, or be
offered management actions, even though it cannot enter the immediate Join
branch. Newsletter membership can reveal a sensitive ministry association.
Authentication makes a response private to that account; it does not prove the
account controls the mailbox. A public pending-request receipt must likewise
not become authority to read or withdraw a pre-existing membership merely
because its submitted address matches.

**Effect on the selected decision.** This narrows reads and result recovery; it
does not reject B, require another confirmation for a qualified reader, or add
a tenant setting. The existing qualified-evidence boundary can be reused.

**Required exact correction to D42-C17 and matching proof:**

> Address-keyed private membership, restriction and management reads SHALL
> require P4-qualified current evidence for that exact address or a still-valid
> source capability explicitly authorizing the exact disclosed fact/action.
> An authenticated current address without that assurance SHALL NOT enumerate
> existing membership or receive broader management authority. A pending public
> request receipt may reveal only its own permitted request outcome; it SHALL
> NOT reveal, withdraw or otherwise manage a pre-existing membership by address
> equality. Current authority is rechecked for recovery.

Add a negative case using an autoconfirmed/admin-marked account naming an
already subscribed third-party address: no membership/restriction disclosure,
unsubscribe authority or exact-state feedback follows. The ordinary
non-enumerating confirmation path remains usable. Add a positive case where
qualified same-address proof or an expressly scoped source capability permits
the intended own-result/read/action without repeated entry.

**Resolution verified in the final reviewed text.** Root incorporated this
boundary in C17: address-keyed status, manage/rejoin and recovery require
qualified same-address proof or an exact authorized source capability; an
unqualified authenticated address cannot reveal prior membership, and a guest
receipt covers only its own operation result. P24 expressly tests the
autoconfirm/admin-marked account and narrow guest receipt. This resolves IR01
at the decision-contract level. Real read/mutation authorization still needs
the stated applied-source tests.

### IR02 — Valid historical mailbox proof cannot qualify an unadmitted login

The parallel Auth reviewer identified this concern; this reviewer independently
checked the resulting correction. **High severity; plausible** where a newly
linked but unqualified provider authenticator reaches the same native subject
that already has legitimate earlier mailbox evidence. Trusting only the subject
and old proof could bypass P4's independent credential-admission gates.

**Resolution verified.** C02 now expressly requires the current authentication
and credential-admission path to satisfy the applicable native/provider gates;
prior mailbox evidence cannot qualify an otherwise unadmitted attached
authenticator. P06 tests that exact counterexample while preserving a qualified
independent native path. This narrows current reader assurance without imposing
another confirmation or blocking B for legitimate qualified readers. It does
not claim that the deployed provider path has been qualified.

## Other independently challenged areas

| Area                            | Review result and limits                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actual selected B               | C01/C03/P01/P04 require a real immediate path from qualified ordinary native mailbox evidence. A fallback-only implementation explicitly fails. This preserves the selected convenience instead of replacing it with A through unattainable boilerplate.                                                                                                                                        |
| Currentness and feasibility     | C15 does not falsely claim a `getUser` read plus an unrelated write is atomic. It requires a P4-owned supported acceptance fence, direct native Auth mutation tests and explicit unavailable state until qualified. No distributed transaction engine or modified managed schema is prescribed. This remains an implementation qualification gate, not proof that an available adapter exists.  |
| Account versus newsletter proof | Intent, account-address evidence, native subscription, recipient eligibility, per-issue send authorization and delivery are separated. Guest confirmation cannot silently log in, create an account, claim a donor or upgrade credential assurance. No new material contradiction found.                                                                                                        |
| Tenant controls                 | One organization-wide narrowing option plus existing availability/Page controls gives the requested customization without per-person exceptions. On only for deliberately enabled, qualified capability and explicit preservation of stricter existing policy are clear recommendations. Missing policy is not On. These defaults remain reviewed amendments, not separately ratified settings. |
| Actual user journey             | Exact visible address, one Join/Rejoin, other-address path without logout, no required account for guests, clear success/recovery and no donation coupling form a coherent small flow. Qualified private status now includes IR01's correction. Browser, assistive-technology, localized and poor-network evidence remains future work.                                                         |
| Rejoin versus stale replay      | C10/C14 and the model distinguish a new deliberate instruction from a different transport key. Withdrawal fences old accepted and unsubmitted intent; active-identical joins converge. Stronger restrictions remain independent. No new material lifecycle conflict found within the stated model assumptions.                                                                                  |
| Pending work and disablement    | Proof-reuse Off changes future admissions without deleting accepted membership. Broader Page-entry pending completion and proof-retention constants remain explicitly unresolved D6 choices. No blanket D6 adoption is asserted.                                                                                                                                                                |
| Record and money ownership      | Scope keys, positive membership, immutable attribution, optional Auth linkage, tenant-aware relationships, grants/RLS and privileged writers are addressed. Joining creates no gift, commitment, money projection, CRM claim or required fundraising task. No new money precision rule is needed.                                                                                               |
| Failure and delivery            | Accepted consent, queued confirmation and delivery remain distinct. Same-operation recovery and source-owned secondary intent are required; provider success is not inferred. These are future actual-source requirements, not proved by in-memory behavior.                                                                                                                                    |
| Quantitative claims             | The five-minute and 1%-over-15-minutes alerts are explicitly proposed operating judgments rather than measured capacity or delivery SLAs. Real operating owners and measured release budgets remain required. The text makes no competitor conversion, ministry prevalence or actual load claim.                                                                                                |
| Governance/adoption             | Q42 B is selected; detailed amendments remain reviewed. C04/C05 completeness adoption is preserved; D6-C07/C15, E7/C-01 and formalization transitions remain separate. Temporary old Q42/session text during root editing is not treated as a completed-record inconsistency.                                                                                                                   |

## Category coverage and proof claims

The main review explicitly includes all **22 requested categories**, each with
a material-concern result or an explained no-additional-concern finding. Its
12 consolidated findings give harm, severity, likelihood, evidence, effect on B
and C/P prevention references. The 24 proposed clauses and 40 future proof cases
provide testable outcomes. A reference across categories does not itself prove
the implementation; the review consistently states that limit.

The behavioral model's claim is narrow: 35 recorded checks, including three
expected naive counterexamples and 32 revised finite cases. It explicitly
assumes an atomic in-memory commit, trusted current facts and human intent.
Its six serialized two-tab/withdrawal orders are not concurrent database tests.
The reviewer inspected those assumptions and model source without rerunning it.
No Auth/database atomicity, deployed grant safety, accessibility, email delivery
or representative-user result may be inferred from those recorded passes.

Primary product/technical evidence is presented as published documentation and
bounded static source observation. The review does not claim authenticated
competitor testing, fresh inbox control on every Join, legal compliance,
ministry interviews or production exploitation. No unsupported performance or
adoption gain was identified in the inspected text.

## Disposition

**Accept the corrected review, with no remaining material documentary finding
from this independent pass.** The selected B and the small
organization-control shape stand. Address assurance must qualify disclosure and
management as well as positive admission. No additional setting, identity store,
source domain, mandatory account step or automatic communication is needed.

Both IR01 and IR02 are incorporated in exact clauses and negative proof cases.
This is an independent documentary challenge with substantial implementation
and release qualification still outstanding. It is not a production security
audit, founder ratification or release approval.
