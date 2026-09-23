# Q19 gap review — accountable review of held inbound mail

**Historical question-stage record.** On 12 September 2026 the founder selected A and fully ratified the [complete D19 review and every adopted amendment](phase26-d19-adversarial-review.md). Original unanswered/recommendation statements below describe the earlier question stage.

**Independent review input:** The final question and reconciled evidence govern the alternatives and current status; source line corrections are preserved below.

Date: 11 September 2026. Read-only question-selection research. D18 is founder-ratified by the latest user instruction; the parent owns its recording. No decision below is accepted. No runtime, database, provider, DNS, or GitHub state was changed.

## Recommended next founder decision

**Who should be responsible for reviewing messages that Asym has accepted but cannot yet admit to an ordinary Support conversation?**

Use the concrete public term **Intake review** in the question. Define it as a place to decide eligible held mail, not another normal conversation status and not permission to bypass safety. Avoid collapsing spam, ambiguous destination, failed body fetch, confirmed malware, and unknown-tenant evidence into one universal Recover action.

Example: a church emails the giving-help address. The receiving service accepts it, but a safety/routing check needs human review before staff can work it as an ordinary conversation. Alex recognizes the request and needs a clear, authorized way to release that one message. The person reviewing must also know when the problem instead belongs to the inbox administrator or platform operations. This is an illustrative scenario, not a measured ministry workflow.

### Meaningful options

| Option                                                | Practical meaning                                                                                                                                                        | Tradeoff                                                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A — Designated reviewers for each inbox (recommended) | The tenant chooses eligible staff responsible for the inbox's routine Intake review. One person/team can cover several inboxes; authorization remains separately scoped. | Keeps ordinary review close to the staff who understand the work without making it everybody's background chore. Requires visible coverage and backup. |
| B — One central tenant review team                    | A tenant-wide operational team handles ordinary Intake review before material is released to the responsible inbox.                                                      | Consistent decisions and simpler staffing ownership, but adds a handoff and requires carefully qualified access across the serviced inboxes.           |
| C — Tenant administrators handle Intake review        | Ordinary staff report or refer held messages; administrators make release/disposition decisions.                                                                         | Lowest additional delegation complexity and suitable for a very small team, but makes administrators a recurring bottleneck.                           |

A is the strongest product recommendation because work remains close to its actual context and review can be delegated without granting account administration. B is a valid larger-organization alternative. C is a valid small-team/strict-delegation alternative, not an unsafe strawman. A can allow the same qualified team to cover multiple inboxes; do not create mutually exclusive infrastructure or three parallel review engines. These are operating defaults and accountability choices. The selected answer should allow sensible tenant configuration without bypassing current access or preservation rules.

**Question scope is accountability and operating model.** It does not ask whether quarantine exists, whether an administrator can override malware/classification, what numeric spam threshold is correct, how RLS works, or which vendor API to use. Those are established constraints or research/implementation qualification work.

## Why this comes before the other candidates

1. Roadmap `docs/prds/sitestacker-parity/roadmap.md:2895–2954` expressly requires the safety layer before real domains open, including a recoverable review queue. This is a prerequisite to the trusted inbox experience, not optional competitor parity.
2. The current coverage log `docs/features/support-hub/grill/phase26-grill-log.md:598–619` still lists safety/quarantine, release/replay, parsing and abuse as open. D1 settles accepted-input responsibility but not the regular tenant review operating model.
3. D13 settles automatic confirmation suppression, deadlines and release qualifications. A held input may become eligible only within its original window; review must not cause historical acknowledgments. D13 does not allocate daily review responsibility.
4. Search/saved views is useful but lower priority: D3 already fixes complete authorized predicates/counts/pagination, D14 reporting semantics, and D15 Following. Its unresolved question is mainly personal/team organization, similar to the library scope just settled.
5. Sender onboarding is a strong later branch, but much is discovery/qualification under D1/P17/Resend rather than a new founder product choice. Do not ask the founder to choose API facts or current provider abilities.
6. General reporting would reopen large parts of D14 unless narrowly scoped. CSAT/AI/new channels are explicit later scope choices, not prerequisites to safely admitting email.

## Verified repository evidence and preserved boundaries

- Read root AGENTS and canonical grill-with-docs, grilling, domain-modeling skills. Verified execution cwd `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`.
- D1 R3 (`phase26-d1-adversarial-review.md:509–515`): every accepted input has a durable identity and recoverable disposition; unknown/ambiguous tenant ownership has separately authorized platform recovery, never candidate-tenant exposure.
- D1 R4 (`:518–524`): conflicting references cannot choose arbitrary first match; sender+subject does not merge requests; unmatched mail stays serviceable by safe resolution.
- D1 R5 (`:526–533`): each read/link/mutation/retry/download/export/send must prove current owner authority. Assignment does not itself establish access.
- D13 R05 (`phase26-d13-adversarial-review.md:39`): anti-loop/automatic suppression cannot be cleared by changing templates or toggling policy. Legitimate inbound responsibility survives a suppressed confirmation.
- D13 R16 (`:83`): prequalification hold can qualify only within original window; release cannot revive terminal exclusion or revoked artifact.
- Actual `packages/api/src/admin/support-hub/inbound-retry.ts:16–20,64` declares staff body/file retry and permits admin/staff/super_admin. This is a technical-recovery path, not proof of a finished held-mail review domain.
- Actual `packages/api/src/admin/support-hub/inbound-routes.ts:45–49,88` combines reviewed route saving and continuation, including broader future recipient/alias/domain-default effects. The existing handler is not authority for making a one-message release quietly update future routing policy. Read roles are admin/super_admin while write roles include staff; do not inherit this as the intended final permission design.
- Roadmap distinguishes care-classified subjects from ordinary Support; a review destination cannot leak restricted care content to an ordinary inbox. Phase10 owns classification, Phase38 the actual care surface.
- D17 content policy governs ordinary ended work; pre-admission held mail needs its own explicit bounded owner class/clock in the answer's review, not an invented application of Resolved-based ordinary expiry.

## Primary external research checked now

1. **Zendesk — Viewing, recovering, and deleting suspended tickets**, edited 7 May 2026. https://support.zendesk.com/hc/en-us/articles/4408893392922-Viewing-recovering-and-deleting-suspended-tickets
   - Verified dedicated view with cause filtering and role-controlled recovery. Non-Enterprise access requires all-ticket visibility; Enterprise has custom-role control. View permission also permits deleting suspended tickets even without ordinary ticket deletion permission. Manual recovery can create a plain-text copy lacking attachments while leaving the original suspended.
   - Adopt: named review destination, reasons, explicit scoped recovery capability. Reject: copying that broad visibility/deletion bundling or lossy new-copy behavior. Edition matters; not a vendor architecture claim.
2. **Zendesk — Understanding suspended tickets and spam**, edited 15 April 2026. https://support.zendesk.com/hc/en-us/articles/4408889141146-Understanding-suspended-tickets-and-spam
   - Verified held input is not necessarily spam and needs a review process. Documentation describes automatic deletion after fourteen days and unrecoverable rejection classes.
   - Adopt distinction between held and rejected/accepted states; do not copy its numerical period or infer accepted Asym input may silently disappear.
3. **Zendesk — Can I edit the suspended tickets view?**, edited 11 April 2025, with dated user comments. https://support.zendesk.com/hc/en-us/articles/4408883533850-Can-I-edit-the-suspended-tickets-view
   - Official behavior says fixed view; historical comments ask for per-private-group review without all-ticket access. These are reported friction, not proof of current plan behavior or prevalence. Current May2026 documentation takes precedence.
4. **HubSpot — Manage the allow and deny list**, updated 22 April2026. https://knowledge.hubspot.com/inbox/manage-your-allow-and-deny-list
   - Account Access governs allow/deny changes; automatic categories and some non-overridable guards are documented; Not spam and future sender behavior can interact. Historical received time is used on automatically created recovered tickets.
   - Adopt separation between present input and future policy authority. Do not import known-CRM-contact trust, role-address exclusions, or automatic Party/ticket creation semantics.
5. **HubSpot — Manage tickets in help desk**, current September2026 checked page. https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk
   - Marking spam requires Delete ticket permission and selecting all associated conversations deletes the ticket. This is useful negative evidence: Asym's message disposition, account blocking, CRM deletion, and conversation lifecycle must stay distinct.

These examples support a deliberate operational choice rather than proving a universal vendor consensus for A. No tenant account, provider runtime, physical quarantine data, or ministry user study was inspected.

## Boundaries the chosen answer must flesh out, not extra founder questions now

- Exact holding reasons grouped by what the authorized reviewer can actually do; masked/minimal lists, safe read previews, safe attachment handling.
- Single-message release preserving original identity and source timestamps; separate future routing/trust changes; no hidden resend, confirmation, CRM contact creation, or full-history disclosure.
- Unknown tenant/platform fault and truly restricted classification stay with their owners. Technical retry is not a security override.
- Named responsibility/backup, quiet pending age/count, no broad content leakage and no continuous per-item email noise.
- Durable currently authorized disposition, per-item results for bulk operations if admitted, concurrent release/reject/replay protection, immutable evidence, bounded pre-admission retention and current D16 restrictions.
- Current capability and separate source/destination authority; being a reviewer never grants unrelated CRM/financial/member-care visibility.

## Conclusion

Q19 Intake review ownership is the strongest unresolved single founder fork. The parent can simplify the wording to a two-option question if the central-team option feels like merely configuring A, but must retain an explicit alternative to delegated operational review. My preferred three options above are meaningful organizational defaults, not three separately implemented products. Do not record any as accepted before the founder answers.

### Exact owner-operation follow-up

Verified line numbers after the first report pass: retry wrapper roles are `inbound-retry.ts:64`; route-save wrapper roles are `inbound-routes.ts:88` (not the earlier estimated68/105). Actual `packages/api/src/workflows/adapters/inbound-routing.ts:266` exports `saveInboundRouteAndResume`: it changes an active persistent route, appends audit, resolves the input review, requests workflow dispatch, then resumes other matching pending reviews. This shows why a one-message release is a distinct semantic effect from saving a future rule. Actual `packages/api/src/workflows/adapters/inbound-email.ts:501` exports `requestInboundEmailRetryDispatch`: it loads tenant-bound input, uses a work claim and ledger dispatch, then updates pending/retrying status. Treat these as current technical operations requiring later qualification, not a proved complete safety review feature.
