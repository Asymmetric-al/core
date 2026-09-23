> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 R04 — Personal giving and giving you help manage

> **Founder accepted, 7 September 2026:** Conrad accepted all recommendations. A and its surrounding safeguards are settled grooming requirements. This original question/research record is preserved; no implementation or new permissions are implied.

Research/question brief, 7 September 2026. **Recommendation only; awaiting founder answer.** This is grooming evidence, not a PRD, formal specification, implementation plan or ticket.

## R03 acceptance and brief adversarial check

Conrad accepted the reviewed guided replacement direction and directed the session to proceed. R03's C01–C22 and the explicitly presented A1–A3 owner refinements are accepted grooming requirements. Their source-contract updates and real implementation/provider proof remain required; no implementation or publication was authorized.

## Adversarial check

### What could go wrong with this answer?

Acceptance could be confused with permission to use the current mock wallet or assume the new request/authorization contracts exist. Keep the accepted design and implementation readiness separate.

### What hidden assumptions are we making?

The donor's selected set does not pool authority across represented donors, accounts or groups. Current rights and exact individual results still govern.

### How does this affect the whole product?

The reviewed owner refinements preserve one source of financial truth. Staff gain no bulk binding power, and the parent request owns only exact scope/provenance.

### How does this affect the end-user experience?

One clear replacement workspace, preserved context and truthful partial results are settled. A donor should not have to repeat a successful repair or guess what remains.

### Does this follow modern best practices?

Yes as reviewed: secure collection, explicit review, bounded effects and durable recovery. The synthetic database checks remain research proof, not certification of Core's implementation.

### Does this fit Asym’s existing repo and product direction?

Yes with the accepted explicit owner amendments and exact Maia/Base UI. Existing source and provider gates remain unchanged.

### Should we adjust the recommendation?

No further R03 scope change. Move to the unresolved presentation of personal and represented giving, which affects several remaining donor journeys.

## Why this question comes next

R03 deliberately keeps a payment-method replacement within the right donor/represented context. Giving history, statements, recurring management and profile actions need the same clarity. The source contracts already define who may see or change each resource, but they do not choose how the portal presents multiple legitimate giving contexts to one signed-in person.

Illustrative scenario, not an observed donor record: **Alex personally supports Hope Missions. He also has separately verified access to specified donations and commitments made by Oak Church to Hope Missions.** He signs in to Hope Missions' portal. There is one receiving organization, one login and two distinct giving contexts—Alex's personal giving and Oak Church's giving. His church job title alone grants nothing; the example assumes the relevant access has already been proved.

The decision concerns an ordinary entry without a specific gift/document destination. It does not override a valid deep link, a provider return or the ratified direct Ministry Updates journey.

## The one question and practical options

**When a person has personal giving and separately authorized giving they help manage, what should the portal show on an ordinary visit?**

<!-- prettier-ignore -->
| Option | What Alex sees | Benefits | Costs and risks |
| --- | --- | --- | --- |
| **A. Separate views, personal giving first — recommended** | His personal giving opens immediately. A clearly labeled control lets him open Oak Church's permitted giving; the active context stays visible. | Fast personal self-service with deliberate movement into someone else's records. Keeps financial tasks and their owners easy to understand. | The switch must be obvious enough for representatives to find; a tiny avatar-only affordance is insufficient. |
| **B. Choose whose giving first** | A compact choice between My giving and Oak Church before entering the giving area. | Makes the initial context explicit, useful when visits frequently serve different represented donors. | Adds a step to each neutral visit for people with multiple contexts. It must not obstruct single-context donors or known destination links. |
| **C. One overview with separate labeled sections** | Personal giving and each authorized represented context have clearly separated summaries on one overview; tasks open their own scoped views. | One scan of all permitted responsibilities and visible access to the represented contexts. | More aggregation, disclosure and layout work; adjacent sums/actions can still be mistaken for personal giving. It must not merge official totals, documents or wallet authority. |

**Recommendation: A.** It best preserves the established no-extra-ceremony personal donor journey while making representation available when needed. The active represented name is visible in relevant financial pages and consequential reviews. Choosing whose giving is on screen does not change who is signed in.

The strongest alternative is C, a genuinely separated overview rather than mixed unlabeled transactions. It could help a frequent representative scan responsibilities, but requires additional cross-context summary contracts and still needs exact context before actions. There is no measured Asym evidence showing that this added overview is worth its complexity. B is also viable, but makes everyone with multiple contexts choose again on neutral entry.

## Proposed behavior around A

These explain the recommendation; they are not an answer already received.

- **Personal-first applies to neutral entry only.** Within an active journey, preserve the deliberate selection. A valid link to Oak Church's document or an accepted R03 operation returns to that exact permitted context; do not reset it to Alex's personal records.
- **No meaningful choice, no chooser.** A person with only personal access sees ordinary self-service. Someone with one represented context and no personal donor context enters that permitted view directly; do not fabricate an empty personal donor record. Multiple represented contexts without a personal context require a clear initial choice.
- **Visible context, stable login.** Illustrative labels are **My giving**, **Giving you help manage**, and **Viewing: Oak Church**. Exact copy/control composition remains to be tested within shared Maia/Base UI. Account security and login details still belong to Alex; opening church giving does not impersonate the church or another person.
- **Narrow access stays narrow.** A grant for one commitment or document does not open an entire organization's wallet, history or profile. Context names/options, counts and displayed facts are themselves source-qualified. Every read/action keeps its own authorization.
- **Distinct owners remain distinct.** Commitment Party, legal donor, recognition, financial authorizer and document recipient are not collapsed into one account-owner field. Each source selects its appropriate records for the requested context. A new display grouping grants nothing.
- **Switching has no business side effect.** It changes no giving, card default, consent, identity, document ownership, Site or brand. Pending or accepted R03 work remains bound to its original context. A switch cannot retarget an unfinished financial instruction.
- **No unnecessary confirmations.** Ordinary context navigation needs no extra confirmation. Warn only when leaving genuinely unsaved work would lose something, and preserve recoverable accepted operations through their existing status resource.
- **Current access wins.** Re-prove the selected context, invalidate obsolete responses and do not show old records beneath a new heading. A revoked context yields a truthful unavailable state and safe navigation, never a silent fallback that makes the old action operate on personal giving.
- **Keep Ministry Updates easy.** R01/R02 direct reading and link behavior remain intact. Switching financial views is not a subscription/filter/consent change or an inferred supporter-content grant. The source still determines the human reader's current audience/purpose/history rights.
- **No premature persistence product.** This question does not add a cross-device last-used preference or new account-management system. R04's personal-first recommendation is a product choice for neutral entry, not a claim that a repository default rule already mandates it.

## Governing facts that must not be re-asked

<!-- prettier-ignore -->
| Fact | Exact evidence | Classification |
| --- | --- | --- |
| Same login does not grant a cross-tenant view; claims and donor records remain tenant-isolated. | [Phase4 A7–A8](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md#L133) | **Durable pattern:** intentional isolation. R04 stays within one receiving Tenant. |
| Household membership grants no implicit portal visibility. | [Phase9](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L268) | **Durable pattern:** explicit access rather than inferred family relationships. |
| Authenticated donors are Tenant humans; the active Tenant assignment is validated server-side. | [Phase12](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md#L177), [issue669](https://github.com/Asymmetric-al/core/issues/669) | **Durable pattern:** membership/acting assignment and represented Party are different axes. Do not union assignments or require staff status for donor representation. |
| Ordinary self-giving asks no extra question; representation and payment authority are separately proved. | [Phase16 roles368–381](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L368), [D14](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L999), [issue810](https://github.com/Asymmetric-al/core/issues/810) | **Durable pattern:** no artificial representative record for personal giving; limited representative grants remain limited. |
| Official document subjects and object-specific access remain separate from display grouping. | [Phase19 subject definitions182–185](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md#L182), [portal authorization547](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md#L547), [1017](https://github.com/Asymmetric-al/core/issues/1017)/[1023](https://github.com/Asymmetric-al/core/issues/1023) | **Durable pattern:** navigation does not create a joint statement or disclose another subject's documents. |
| One account brand and verified donor host span the receiving organization's Sites. | [Phase24 host/brand347–353](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/prds/sitestacker-parity/phase-24-multi-site-management.md#L347), [ADR0185](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/adr/0185-tenant-owned-donor-portal-host.md#L5) | **Durable pattern in active planning:** changing giving context does not select a new Tenant, Site skin or credential host. |

Current develop was refreshed unchanged at **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. Phase24 remains the previously reviewed active planning snapshot, not shipped proof. The actual bodies of issues669/810/1017/1023 were checked. Issue669's older staff-versus-anonymous wording is superseded by Phase12's explicit authenticated-donor principal rule; its allowance for a revalidated persisted default does not settle donor presentation or last-used behavior.

Current [portal resolution](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/service.ts#L166) finds a single donor by profile and Tenant. [Donor navigation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/DonorSubNav.tsx#L18) has section links but no represented-giving selector. **Classification: Temporary bridge/current implementation evidence**, not a prohibition on the already-modeled representative use case. No real representative journey or authorization test was run.

## Current primary product research

Official documentation accessed 7 September 2026. These are documented precedents, not signed-in vendor tests or measured Asym usability.

<!-- prettier-ignore -->
| Source | Useful lesson | Limitation / disconfirmation |
| --- | --- | --- |
| [Salesforce external account switcher](https://help.salesforce.com/s/articleView?id=platform.networks_external_managed_accounts.htm&language=en_US&type=5) | Explicitly permitted target accounts, a visible current selection and a distinct own-account label separate the user from the selected context. Components must use the intended effective account. | This includes delegated account administration. Asym adopts no password-reset, user-management or broad account powers from this precedent. |
| [Shopify B2B customer journey](https://help.shopify.com/en/manual/b2b/customer-login-and-accounts) | One company location proceeds directly; multiple locations require selection before the ordering task. Person profile and location information are distinct. | This is commercial ordering, not a complete donor representation model. |
| [Shopify personal-order terminology](https://help.shopify.com/en/manual/b2b/getting-started/terminology) | The documentation explicitly exposes an important limitation: an email associated with B2B needs an alternative email for personal orders. | **Conflict with Asym if copied:** this is not evidence of seamless personal/business switching under one identity, and does not justify making Asym users create duplicate logins. |
| [Planning Center joint donors](https://help.planningcenter.com/en/138371-joint-donors.html), September 2026 | Its explicit joining workflow produces combined giving history and statements. | **Conflict if silently imported:** joining donors is an authority/data treatment, not a harmless display toggle. Asym's separate legal subjects and explicit grants remain governing. |

Additional official Salesforce B2B and Microsoft organization-switching documentation was reviewed in the research lane. It reinforced explicit active context and separation of account security; those products' administrative privileges and cross-tenant models were not adopted. The recommendation relies on the directly inspected sources above and Core's governing contracts.

## Decision boundary and evidence still required later

R04 chooses the neutral-entry presentation for multiple already-authorized giving contexts. It does not grant representation, establish legal donor identity, authorize a payment, replace a context-specific source query or change Ministry Updates access. This is not a Stripe-dependent capability question; R03's account/provider qualification gates remain unchanged and no new financial operation is proposed.

After the answer, the selected direction must be tested against limited grants, representative-only users, similar/long organization names, personal/represented records with different source subjects, targeted links, revoked access, two tabs, interrupted edits, accepted R03 operations, keyboard/screen-reader/mobile navigation and slow networks. Required actual authorization, concurrency and end-to-end evidence remains implementation work; no claim of successful runtime or user-testing proof is made here.

No new schema, permission engine, generic impersonation feature, formal glossary/ADR or provider integration is needed merely to decide the presentation. Record the founder's answer before treating A or its proposed labels/default as settled.
