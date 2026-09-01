# Phase 24 D23 — Source-Owned Proportional Independence Primary Research

> **Research date:** 2026-08-28  
> **Question:** May a person complete the review of a Default Site Locale Plan
> they created or materially edited?  
> **Founder choice under review:** Option 2 — enforce the source-owned
> proportional independence floor.  
> **Research disposition:** **Accept with required amendments.** The direction
> is the strongest permanent choice, but “source-owned,” “strictest,”
> “independent,” “material,” and policy-change behavior must be exact before
> implementation.

## Executive conclusion

Current primary evidence supports a **policy-specific separation-of-duties
floor**, not either universal extreme:

- NIST AC-5 tells organizations to identify the duties that require separation
  and define authorizations that enforce that separation. It does not say that
  every review in every workflow needs a second human.
- GitHub and GitLab enforce different-human review where configured and bind
  that rule to protected branches, changed files, commit participation, or
  policy conditions. They also demonstrate that a new material change can stale
  an earlier approval.
- HubSpot, Contentful, and Blackbaud attach review behavior to a content type,
  workflow step, or payment-risk tier rather than treating every action in the
  product identically.
- None of those products proves the exact policy Core needs for a Default Site
  Locale Plan. Their administrator bypasses, permission behavior, financial
  thresholds, and generic workflow features are not safe to copy.

Core's own governing work is more decisive. Phase 17 already specifies two
fixed publication floors: standard changes may use a qualified self-publish
path, while protected changes require another authorized human. It also says a
Tenant may strengthen but not weaken the platform floor. D16 keeps public
default activation separate from private Plan review. A universal second-person
gate would therefore add ceremony where the accepted source policy says it is
not necessary; universal self-review would bypass accepted protected-review
rules.

The permanent D23 rule should be:

> For each exact D20 Plan review action, the server derives one
> candidate-bound independence evaluation from the complete effective Plan
> candidate, every applicable source-owned closed predicate and version, every
> permitted Tenant-strengthening policy version, and the source-owned material
> participant lineage. The strictest applicable result wins:
> **qualified self-review permitted** or **a different human is required**.
> Route membership, role labels, client input, support access, service identity,
> elapsed time, notification engagement, and administrative convenience never
> lower the result.
>
> When a different human is required, the reviewer must be a currently
> authorized, stepped-up, stable human principal whom every applicable source
> evaluator proves is independent of its exact disqualifying participation set.
> When no applicable source requires another human, a creator or editor may
> complete the Plan review only if the ordinary source action independently
> authorizes that exact actor at commit time.
>
> The candidate pins its evaluated floor and policy generations. A later
> tightening can make the candidate or review stale; a later weakening never
> relaxes an in-flight candidate. A fresh candidate is required to use a
> weaker current policy. Any unknown, incompatible, corrupt, or incomplete
> evaluation fails closed. The D23 evaluation itself has no public or financial
> effect. A zero-public re-review command remains zero-public. Only D17's
> separately authorized **Review and make default** source command may consume
> a favorable D23 evaluation and atomically perform the D16 activation after
> re-proving every current activation fence. D23 never publishes a Page, changes
> Navigation, sends a communication, or affects Giving or finance.

This is a **product and architecture judgment derived from repository
authority plus primary evidence**. No external standard independently proves
that exact wording.

## What was researched

The research tested six questions:

1. Is risk-proportional independent review a defensible modern control, or
   should Core always ban or always permit self-review?
2. Which owner must decide that a change is protected?
3. Which human participation facts disqualify a reviewer?
4. What must happen when content, authority, or policy changes during review?
5. How can solo ministries complete safe ordinary work without giving them a
   protected-review bypass?
6. What language and interaction make the rule understandable before staff
   click?

Only current first-party documentation, governing repository artifacts, and
current repository source were treated as facts. Vendor behavior is
comparative evidence, not a specification for Core.

## Evidence labels

- **Repository fact:** directly stated in a governing Core artifact or current
  source.
- **Verified external fact:** directly stated in current official
  documentation.
- **Reasonable inference:** follows from facts but is not directly stated by
  the source.
- **Product judgment:** the recommended Core choice among defensible
  alternatives.
- **Assumption:** plausible but unverified for missions organizations.
- **Unresolved unknown:** needs a product decision, implementation proof, or
  representative-user evidence.

## Governing repository findings

### The developing specification already chooses proportional review

The Phase 17 System Messages PRD says:

- standard publication may be committed and published by the author after
  validation, preview, diff, and impact acknowledgement;
- protected publication requires a different currently authorized human;
- the strictest result across the full candidate and dependency fan-out wins;
- Tenant configuration may elevate an otherwise standard publication but
  cannot lower a protected one;
- role changes, split changes, client labels, and shared-dependency
  indirection cannot lower the floor;
- every substantive author or editor is not independent for that protected
  candidate;
- support impersonation, service accounts, shared identities, and “View as”
  cannot satisfy another-human review;
- a one-person Tenant may invite one candidate-scoped, non-editing reviewer who
  sees only a synthetic, privacy-minimized review projection; and
- review and publish are one exact atomic protected-publication action, while
  ordinary self-publish remains simple.

Source:
[Phase 17 System Messages — Draft, commit and publication](./phase-17-system-messages-template-management.md#draft-commit-and-publication)
and
[Derived publication floor and exact approval protocol](./phase-17-system-messages-template-management.md#derived-publication-floor-and-exact-approval-protocol).

The active SiteStacker OpenSpec delta says the same high-level split:
standard copy may use qualified self-publish, protected meaning requires a
different authorized human, the whole effective graph determines the floor,
Tenant policy may only strengthen, and changes or authority loss stale review.
Source:
[active outbound-communications delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#requirement-publication-review-is-proportional-and-independent-where-required).

**Consequence for D23:** Option 2 conforms to the accepted product direction.
Option 1 would silently replace proportional review with a global
different-human rule. Option 3 would silently weaken the protected floor.

### There is one material repository contradiction to resolve

The primary Phase 17 PRD and its traceability register require a protected
reviewer to be different from **every substantive author/editor**. The active
OpenSpec delta currently says different from the **latest material editor**.
Those are not equivalent:

- “latest only” allows Alice to make a protected change, Bob to make the last
  protected edit, and Alice to approve;
- “every substantive participant” disqualifies both Alice and Bob for that
  exact candidate.

Sources:

- [Phase 17 exact approval protocol](./phase-17-system-messages-template-management.md#derived-publication-floor-and-exact-approval-protocol)
- [Phase 17 D11 traceability](./phase-17-decision-test-traceability-2026-07-19.md#d11-clause-register)
- [active OpenSpec protected-review requirement](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#requirement-publication-review-is-proportional-and-independent-where-required)

**Research judgment:** D23 can establish that the source owner supplies an
exact disqualifying-participation predicate, but implementation cannot proceed
with contradictory predicates for the same Phase 17 source. The next founder
decision should resolve this to every substantive participant for protected
work, with a precise definition of “material.”

### Route responsibility is not authority

D21 and D22 already make the review-responsibility route a private attention
policy. It grants no access or approval. A routed person must still pass the
source's exact view, action, and D23 conflict checks; any independently
authorized actor can discover the action from the source even without a
notification.

Sources:

- [D21 adversarial review](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 corrected decision](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md#corrected-decision)
- [Core glossary](../../../CONTEXT.md)

**Consequence for D23:** do not add an “allow self-review” flag to a route and
do not infer authority from being selected. D23 eligibility participates in
recipient resolution. A selected creator who cannot perform an independent
review receives no actionable D19 item for that episode.

### Plan review and public activation remain different actions

D17 makes the Default Site Locale Plan private. D19 and D20 make its
Needs-attention item navigation-only. D16 alone owns the later explicit,
freshly authorized activation of the Site Root Entry.

Sources:

- [D16 locale-neutral Site root](./phase-24-d16-locale-neutral-site-root-adversarial-review.md)
- [D17 private Plan](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
- [D19 state-driven attention](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D20 review-required episodes](./phase-24-d20-every-review-required-episode-adversarial-review.md)

**Consequence for D23:** zero-public **Review changes** and **Review changed
default** commands must never imply publication or activation. D17's final
**Review and make default** is deliberately the one separately authorized D16
activation command; its UI must state that consequence before commit. D23 alone
never activates anything, and no D23 outcome can imply or approve Giving.
Existing public behavior remains unchanged while review is blocked, stale,
failed, unavailable, or completed only through a zero-public re-review command.

### Current runtime does not implement this model

Current source still reserves the unified Site resolver by returning
“siteId: null” in
[resolve-tenant.ts](../../../apps/admin/src/cms/public/resolve-tenant.ts).
Current Payload collections expose draft/published behavior, but repository
search found no operational Default Site Locale Plan independence evaluator,
material-participant lineage, D20 recipient resolver, or D23 review command.

**Consequence:** D23 describes intended behavior, not current behavior.
Existing CMS behavior is evidence to reconcile and migrate, not proof that the
new rule already works.

## Current primary external evidence

### NIST SP 800-53 Revision 5.1 — separation is duty-specific

[NIST SP 800-53 Rev. 5.1, AC-5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
requires an organization to identify and document the duties that require
separation and to define authorizations that support that separation. Its
discussion connects separation to reducing abuse of authorized privileges and
conflicts across mission and system domains.

What this supports:

- separation of duties should be explicit and enforceable;
- the protected duty is selected by the owning policy, not inferred from a
  notification or role label;
- different business functions can use different separation requirements.

What it does **not** support:

- that every website review always needs a second person;
- that ordinary self-review is always safe;
- Core's exact source predicates, actor-lineage rule, UI wording, or fallback.

**Inference:** an organization-defined, source-specific floor is closer to
AC-5 than either universal extreme. This is an analogy, not a claim that a
Default Site Locale Plan is a NIST-controlled system.

### GitHub — independence can be exact, scoped, and stale

GitHub's current official documentation states:

- pull-request authors cannot approve their own pull requests;
- protected-branch rules can require code-owner review only when changed files
  have a designated owner;
- rulesets can require approval from someone other than the person who made the
  most recent reviewable push;
- stale approvals can be dismissed after the reviewed diff changes; and
- required reviewers can be associated with file patterns.

Sources:

- [Approving a pull request with required reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews)
- [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

What this supports:

- stable actor conflict and current authority matter;
- changed protected scope can select a stricter reviewer rule;
- a review must bind the exact reviewed candidate;
- a material change after review must not inherit stale approval.

What it does not support:

- permitting self-review in Core's ordinary Plan flow;
- using “latest editor only” for every Core source;
- copying repository administrator bypasses into Core;
- treating source code review as identical to ministry website review.

GitHub is important counterevidence to pretending universal different-human
review is inherently unusable. It is still not evidence that Core should impose
that cost on every private planning review.

### GitLab — conflict policy is configurable, and unsafe invalid rules exist

[GitLab merge-request approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/)
separately support:

- preventing approval by the merge-request creator;
- preventing approval by every user who adds commits;
- preventing per-request rule overrides; and
- requiring reauthentication.

[GitLab merge-request approval policies](https://docs.gitlab.com/user/application_security/policies/merge_request_approval_policies/)
can apply those restrictions conditionally to policy scope and findings.
GitLab also documents that new commits can reset approvals.

What this supports:

- “creator,” “committer/material participant,” and “currently authorized
  approver” are distinct predicates;
- a source can choose a stronger all-contributors conflict rule;
- policy scope and candidate changes must be durable and testable.

Important negative evidence:

- GitLab documents configuration in which an impossible non-policy approval
  rule may be marked automatically approved, while policy-created impossible
  rules block as Action required;
- override behavior depends on product settings.

Core must use the fail-closed behavior: no eligible reviewer is an honest
blocker, never auto-approval. Tenant policy can strengthen but cannot override
the platform floor.

### HubSpot — content-type policy exists, but admin bypass is not acceptable

[HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
can be enabled per supported content type. Staff select designated approvers
and explicitly choose whether all selected approvers or only one must approve.
HubSpot also says Super Admins can skip approvals.

What this supports:

- approval policy can belong to the content/source type;
- “one reviewer completes” and “everyone approves” are different workflows;
- desktop and mobile must expose the current approval state and action.

What Core must not import:

- a global administrator bypass;
- requestor-selected approvers as action authority;
- due dates, messages, reassignment workflow, or all-of approval for D20;
- the assumption that one vendor's content types match Core's Page,
  Navigation, publication, and Site-default boundaries.

Core's platform principle places permission correctness above convenience.
Therefore “Super Admin” cannot make an interested reviewer independent.

### Contentful — step policy and permission policy remain separate concerns

[Contentful workflow step management](https://www.contentful.com/help/ai-automations/workflows/workflows-steps-management/)
lets a workflow define who may change a step and which users or teams may edit
or publish. It also states that an explicit space-level deny overrides a
workflow allow.

[Contentful multiple workflows](https://www.contentful.com/help/ai-automations/workflows/workflows-management/multiple-workflows-to-content-types/)
allows separate workflows for distinct governance jobs on the same content
type.

What this supports:

- governance behavior can attach to an exact workflow step or source;
- explicit deny must win over a local allow;
- legal, translation, and other review purposes should not collapse into one
  vague approval flag.

What Core must not import:

- workflow rules that grant content permission;
- dynamic teams as D21 attention routes;
- multiple generic workflow engines for one D20 review.

D23 must call the existing source authorization boundary. It must not become a
new permission engine.

### Blackbaud — proportional oversight is real, but financial tiers do not transfer

[Blackbaud Payment Assistant approval tiers](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
lets an organization use different approval rules for payment amount tiers and
choose all, one, or a defined number of approvers. Blackbaud explains that
larger payments may receive greater oversight while smaller payments process
more quickly.

[Blackbaud Financial Edge approval rules](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-settings-approval-rules.html)
routes different expense request types and amounts to defined reviewer levels.

What this supports:

- nonprofit administration products use source- and consequence-specific
  oversight rather than one universal approval depth;
- the clean path should remain fast while consequential work receives stronger
  review.

What it does not support:

- amount thresholds, finance roles, or payment approval semantics for a Site
  Locale Plan;
- self-review in website publication;
- a Tenant-authored risk-scoring language.

Giving, Stripe, Legal Entity, bank, settlement, currency, and accounting
identity remain entirely outside D23.

### W3C — explain the rule and the next action in visible text

Relevant current W3C guidance:

- [WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
  requires enough visible instruction for users to know what an input or choice
  means, while warning that too much instruction can also harm usability.
- [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
  requires a detected error to be identified and described in text.
- [WCAG 3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)
  says known correction suggestions should be provided unless that would
  jeopardize security or purpose.
- [WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
  requires programmatic exposure of status changes without unnecessary focus
  movement.
- [WAI Alert Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
  warns against frequent, auto-disappearing interruptions.

What this supports:

- always show whether the current user can act;
- explain a safe reason and the literal next step;
- do not rely on color, a disabled button, a tooltip, or hover;
- announce an asynchronous eligibility change politely;
- reserve assertive alerts for important, time-sensitive failures;
- do not reveal protected reason detail merely to provide an error suggestion.

W3C does not choose Core's policy. It constrains how Core communicates the
chosen policy.

## Evidence synthesis: strongest alternative comparison

| Choice                                    | Strongest case for it                                                                                                           | Material defect in Core                                                                                                                                                            | Disposition            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Always require another person             | Simple rule; strong maker-checker separation; GitHub pull-request authors cannot approve their own work                         | Conflicts with Phase 17's accepted standard self-publish path, strands ordinary work in one-person Website teams, and treats a private Plan review as if it were public activation | Reject                 |
| Source-owned proportional floor           | Matches NIST's duty-specific framing, Core's fixed standard/protected floors, and scoped controls in GitHub/GitLab/CMS products | Brittle unless source ownership, participant lineage, policy versioning, strictest aggregation, and unknown-state behavior are exact                                               | Accept with amendments |
| Always permit self-review when authorized | Lowest ordinary friction and easiest for solo staff                                                                             | Route/role membership could bypass protected publication or Tenant-strengthened separation; conflicts with Phase 17 and platform safety                                            | Reject                 |

Option 2 solves the root problem at the correct level: the domain that owns the
consequence decides whether another human is necessary. D23 aggregates those
decisions for one Plan review; it does not classify risk independently.

## Exact recommended D23 contract

### D23-R1 — one typed independence result

Each current Plan candidate has exactly one derived result:

1. **qualified self-review permitted**, or
2. **different human required**.

There is no caller-selected Boolean, “maybe,” score, confidence, severity
slider, or free-form risk label. Unknown or incompatible evaluation is an
adverse state and exposes no completion action.

### D23-R2 — source owners provide closed facts

Every applicable Page, Navigation, publication, safety, locale, and
default-change owner provides:

- exact source scope and immutable head/candidate identity;
- evaluator contract and version;
- one fixed result;
- zero or more closed reason codes;
- its exact definition of material participation;
- the stable human principals disqualified for that candidate, or an
  authoritative source-side predicate that checks the actor without copying
  protected identities;
- the authority and governance epochs needed at action time; and
- a privacy-safe reason projection.

The Plan owner may aggregate and freeze those facts. It may not reinterpret,
weaken, or become the write authority for them.

### D23-R3 — strictest applicable unsatisfied obligation wins

If any applicable source requires a different human, the whole current Plan
review requires a different human. Missing source coverage, a changed source
head, unknown reason code, incompatible evaluator generation, incomplete
dependency fan-out, or conflicting result fails closed.

A source obligation is applicable only when its typed authoritative contract
explicitly binds it to this exact D20/D17 action and proves that the obligation
is still unsatisfied. A Page, Navigation, or publication that already received
its own current independent review does not automatically require the same
independence review again at the Plan/default layer. Conversely, Plan/default
review never satisfies, transfers, or weakens another source owner's review.

Splitting a visible change, renaming it, changing a UI label, moving it through
a shared dependency, editing from another role, or selecting another route
cannot lower the result.

If future product design creates separately atomic Plan candidates with
separately owned effects, each may be evaluated separately. D23 does not build
partial approval into one otherwise atomic review.

### D23-R4 — route and authorization remain independent

The D21/D22 route selects possible attention recipients only. It cannot:

- permit self-review;
- grant Page, Navigation, Communications, Site, or publication access;
- waive current capability, assignment, step-up, or conflict checks;
- prevent another independently authorized actor from acting at the source; or
- select a weaker evaluator.

Recipient resolution applies D23 after current source authorization. A routed
person who is disqualified receives no actionable review item. If no routed
person can act, D21 fallback or the honest no-recipient state applies; Core
never sends the item back to the interested creator merely to avoid a blocker.

### D23-R5 — stable human identity and participation

When another human is required:

- the actor is one current authenticated stable human principal;
- aliases, multiple Tenant Assignments, multiple emails, linked login methods,
  support impersonation, “View as,” service credentials, shared accounts, AI,
  automation, or a renamed role cannot manufacture a second person;
- actor, Tenant, environment, Site, candidate, policy versions, authority
  epochs, and action time come from trusted server context;
- source-owned participation, not a caller's “material” flag, determines
  conflict; and
- a person who becomes a material participant before commit cannot finish the
  protected review.

Comments, reading, opening, route configuration, notification engagement, and
non-substantive accessibility-preserving metadata do not become material
merely to inflate the conflict set. Each source must define its boundary
without relying on UI convention.

### D23-R6 — candidate-bound, monotonic policy behavior

The independence evaluation freezes:

- Plan candidate and source-head identities;
- complete dependency graph digest;
- source evaluator versions;
- Tenant-strengthening policy versions;
- reason-code set;
- material-participant proof or digest; and
- authorization/governance epochs required by the source contract.

The completion command re-proves current compatibility. Policy behavior is
monotonic for an in-flight candidate:

- a tighter current platform/source floor stales or raises the candidate;
- the candidate's already-frozen stronger floor remains binding if a later
  setting weakens;
- weakening applies only to a fresh successor candidate;
- material edits, dependency changes, source-head changes, participant
  changes, authority loss, or incompatible evaluator changes stale review; and
- no background job silently rewrites a pending candidate's decision.

This prevents an administrator from weakening policy immediately before
self-review. It also keeps historical interpretation stable.

### D23-R7 — Tenant strengthening is bounded

A Tenant may strengthen only through a versioned, source-owned bounded setting
whose meaning is fixed by code. D23 introduces no generic approval-workflow
builder, risk formula, amount threshold, conditional language, role matrix,
quorum, weighted vote, timer, escalation, or exception override.

Tenant strengthening cannot:

- weaken a platform/source floor;
- change who counts as a distinct human;
- turn a route into permission;
- authorize a source action; or
- modify an in-flight candidate retroactively in the favorable direction.

### D23-R8 — evaluation creates no independent public or financial authority

D23 evaluates who may perform the exact source-owned action; it does not create
another mutation path. A zero-public re-review acknowledges the exact current
private Plan basis only. D17's separately authorized **Review and make default**
command may activate the D16 Site default only after the same transaction
re-proves D23 and every D16 fence. D23 never independently:

- activates the D16 Site default or bypasses that command;
- publishes or edits a Page;
- changes Navigation;
- sends or schedules a communication;
- creates a Mission Control task, due date, email, SMS, or reminder;
- changes a Giving URL or Giving availability; or
- selects or changes Legal Entity, Stripe, settlement, bank, currency,
  contribution, receipt, ledger, or accounting identity.

The existing public Site remains authoritative while review is pending,
blocked, stale, failed, or unavailable.

## Staff UX: the rule should be obvious before the action

### Product-language rule

Keep “self-review,” “separation of duties,” “maker-checker,” “predicate,”
“floor,” and “principal” out of ordinary staff UI.

Use two stable states:

- **You can complete this review**
- **Another person must review this change**

Use **Independent review required** as the protected-state heading because it
explains why a different person is necessary. Do not say “You are not allowed”
without the source-owned reason and next step.

### Ordinary one-person journey

Hope Ministries has one Website staff member, Maria. She prepares an ordinary
French default-language Plan. No applicable source requires another human.

Before Maria submits:

> **Review required**  
> You can complete this zero-public review. This check updates the Plan's
> current review basis; it will not change the live website.

On the review surface:

> **Check the planned change**  
> French (Canada) would become the Site default after a separate authorized
> activation. Existing language URLs remain unchanged.

Actions:

- **Complete review**
- **Go back and edit**

After success:

> **Review complete**  
> The Plan is ready for its next step. The live website has not changed.

There is no “Approve & publish,” green live badge, countdown, or automatic
activation. When the next step is D17's final activation, the distinct
consequence-led action is **Review and make French (Canada) default** and its
confirmation plainly says that success changes `hope.org/`.

### Protected journey

Maria edits protected Navigation meaning as part of the Plan. The source owner
requires a different human.

Before she submits:

> **Independent review required**  
> Someone who did not make the protected change must review this Plan.  
> **Why:** This Plan includes protected Navigation changes.  
> The live website stays unchanged until the separate activation step.

If Maria can manage the route:

- **Choose a reviewer**
- secondary link: **View what the reviewer will see**

If she cannot manage it:

- **Ask a Website administrator**
- show the responsible route name only when Maria is authorized to see it.

Do not render a disabled **Complete review** button as the only explanation.
Do not expose another staff member's permissions, absence, unread state, or
private assignment.

### Selected reviewer journey

Ana receives one personal Needs-attention item:

> **Review Hope's French default-language Plan**  
> An independent review is required because the Plan includes protected
> Navigation changes. Reviewing does not change the live website.

The source review page shows:

- exact Site and locale;
- safe before/after consequence;
- exact current candidate revision;
- source-owned safe reasons;
- current validation/readiness;
- current-live reassurance;
- **Request changes** and **Complete review**;
- no donor, missionary, Giving, credential, or unrelated staff data.

If Ana makes a material edit, Core warns before save:

> **Saving this protected change means someone else must review it.**

The safe primary action becomes:

- **Save changes and request another reviewer**

Core does not let Ana edit protected content and then keep a stale review
button.

### Solo ministry with protected work

A one-person ministry can still:

- complete ordinary Plan reviews itself;
- keep the current safe public default;
- revise or cancel the Plan; and
- use an exact source-owned candidate-scoped reviewer path where that source
  has already defined and authorized one.

For Phase 17 protected publication, the existing source contract supports one
distinct, verified, candidate-scoped reviewer with a synthetic,
privacy-minimized projection.

D23 must not generalize that into an all-purpose external Plan reviewer.
If Page, Navigation, or default activation does not own an equivalent delegated
review contract, the UI says:

> **Another reviewer is required, but no eligible reviewer is available.**  
> Your current website remains unchanged. Ask a Website administrator to add
> an eligible reviewer.

The state is blocked, not auto-approved, expired, failed, or “waiting on Core.”
No recurring email is created.

### Policy or candidate changes while the page is open

If another actor edits the candidate, the source head changes, authority is
lost, or policy tightens:

> **Review requirements changed**  
> Refresh the Plan before continuing. Nothing was published.

Use a polite programmatic status message for an asynchronous change. Preserve
the user's place and any non-conflicting draft note. Focus does not jump unless
the user initiates navigation or a blocking dialog is genuinely required.

If someone else completes review first:

> **Review already completed**  
> The Plan was reviewed using the current candidate. The live website has not
> changed.

Attribute the reviewer only when the viewer is independently authorized to see
that audit fact.

### Reason-copy contract

Internal reason codes map to short, localized, privacy-safe explanations. Good
examples:

- **Protected Navigation changed**
- **Protected publication wording changed**
- **A protected language version changed**
- **A shared protected dependency changed**
- **Your organization's policy requires another reviewer**

Avoid:

- “Risk score 72”
- “Policy predicate failed”
- “You lack REVIEW_SOURCE_V4”
- “Super Admin required”
- names of disqualified people
- sensitive classification facts not needed for the next action
- a generic “Something went wrong”

When several reasons apply, show the most consequence-relevant safe reason
first and make the full safe list available on the review page. The first
screen must still answer who can act and what happens next.

### Accessible interaction requirements

The D23 surface must:

- use native heading, list, status, button, and link semantics through Core's
  Base Maia system;
- expose visible labels and instructions, not icon-only policy;
- preserve visible keyboard focus;
- put field-specific text beside any route or reviewer error;
- programmatically announce changed eligibility with a polite status region;
- never place ordinary eligibility changes in an assertive live region;
- work at 320 CSS pixels, 400 percent zoom, high contrast, forced colors,
  reduced motion, keyboard-only, screen reader, RTL, long translations, CJK,
  combining characters, and long personal names;
- preserve the exact state on weak or interrupted networks; and
- never optimistically show Review complete before the authoritative commit.

### End-user and donor experience

Visitors and donors see no D23 workflow. Until a separately authorized D16 or
source publication command succeeds:

- the current public homepage and explicit locale URLs remain unchanged;
- Giving intent and URLs remain unchanged;
- no redirect, fallback, public banner, preview, or draft is exposed; and
- no review failure leaks Site, staff, or protected-content existence.

That quiet continuity is part of the UX, not merely a backend safeguard.

## Source of truth and domain ownership

| Fact                                      | Authoritative owner             | D23 may retain                                  | D23 must never own                                |
| ----------------------------------------- | ------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Page content and protected meaning        | Page/publication source         | immutable head reference, typed evaluation      | copied editable Page truth                        |
| Navigation content and protection         | Navigation source               | exact head and safe reason reference            | Navigation state or risk classification           |
| Communication publication floor           | Phase 17 source                 | evaluator/version/result reference              | a second publication policy                       |
| Current Site default and root behavior    | D16                             | expected head/reference only                    | public default activation                         |
| Private Plan candidate and review episode | D17/D20                         | complete candidate, episode, review result      | source facts or public state                      |
| Attention route                           | D21/D22                         | route revision and recipient result             | permission or independence rule                   |
| Material participation                    | exact source owner              | protected reference or digest                   | caller-authored editor list                       |
| Human identity and current authority      | Phase 12 identity/authorization | stable principal reference and frozen evidence  | email/name equality as identity                   |
| Tenant strengthening                      | exact source policy owner       | versioned policy reference                      | generic Tenant-authored rule language             |
| Review occurrence                         | source/Plan review boundary     | append-only actor/candidate/evaluation evidence | publication, activation, Giving, or finance truth |

### Domain invariants

1. One current Plan candidate resolves to one complete independence evaluation.
2. Every applicable source and dependency is either represented or the result
   is adverse.
3. The strictest source result wins.
4. Route membership never changes the source result.
5. A different-human result can be satisfied only by a stable human principal
   outside every applicable disqualifying set.
6. Current authorization and conflict are re-proved at action time.
7. One successful review occurrence binds one exact candidate/evaluation.
8. A material change never inherits a prior review.
9. A weaker later policy never relaxes an in-flight candidate.
10. D23 evaluation and zero-public re-reviews have no public,
    communication-delivery, Giving, or financial effect. Only the separately
    authorized D17/D16 final command may activate the default after consuming
    current favorable D23 evidence.

## Data, RLS, and authorization implications

This research does not authorize a schema, but the permanent design must make
invalid states structurally difficult.

### Recommended shape

Use one immutable Plan independence-evaluation header with normalized,
source-owned coverage rows rather than a mutable JSON Boolean.

The header should bind:

- Tenant, environment, Site, Plan candidate, and D20 episode;
- complete coverage count and digest;
- aggregate result;
- evaluator-generation manifest;
- created-by server operation and trusted timestamp; and
- lifecycle state: prepared, current, stale, or superseded.

Each coverage row should bind:

- source family, source scope, source head/candidate;
- evaluator kind/version;
- source result and closed reason codes;
- source-owned participant-proof reference or digest;
- source authorization/governance epochs; and
- privacy-safe reason-projection version.

The source review occurrence should append:

- exact evaluation and candidate;
- stable human actor from authenticated server context;
- exact authorization/conflict decision and epochs;
- idempotency/business-effect key;
- outcome; and
- safe audit reason.

### Structural safeguards

- Composite foreign keys repeat Tenant, environment, Site, and candidate scope
  where applicable.
- Same-Tenant and same-environment relationships are enforced in the database,
  not inferred from UUID shape.
- There is exactly one current evaluation per current candidate and one
  successful review occurrence per required review business effect.
- Candidate/evaluation/source rows are append-only after release.
- Source coverage count/digest must match the normalized row set before release.
- Direct table writes are revoked; one server mutation boundary derives scope,
  actor, time, result, and source coverage.
- Row-level policies cover both visibility and mutation with equivalent USING
  and WITH CHECK scope.
- An allowed update cannot move a row to another Tenant, Site, candidate, actor,
  source, or policy version.
- Service-role, Payload Local API, owner, security-definer function, support,
  worker, import, and replay paths receive the same poison-matrix tests.
- Delete behavior is restrictive; historical evidence is never cascaded away
  because a user, route, Plan, or source object changes.
- Index current candidate, active review episode, source head, stable actor,
  route membership, and reverse participant conflict without placing names,
  email, or protected reason text in index/log labels.

### What not to store

- a route-level “self review allowed” Boolean;
- caller-provided actor, author, editor, Tenant, Site, or policy result;
- copied full source content or protected facts;
- raw permission sets;
- a generic risk score;
- peer notification read/open data;
- a mutable list of approver names as authority; or
- Giving, Stripe, Legal Entity, bank, settlement, currency, or accounting
  identifiers.

## Lifecycle, temporal correctness, concurrency, and idempotency

### Meaningful states

1. **Evaluation unavailable** — complete source proof cannot be produced.
2. **Self-review permitted** — current actor may still act only after source
   authorization.
3. **Different human required, eligible reviewer exists.**
4. **Different human required, no eligible reviewer exists.**
5. **Review in progress** — UI state only; no claim or lock authority.
6. **Review committed** — one exact append-only source/Plan outcome.
7. **Stale** — candidate, source, participant, policy, authority, or evaluator
   changed.
8. **Terminal Plan state** — activated, cancelled, or superseded under its
   owning contract.

Opening, reading, previewing, receiving a notification, selecting a route,
starting step-up, or typing an uncommitted note does not create an authoritative
review state.

### Required race behavior

| Race                                                  | Safe result                                                                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review versus material edit                           | One expected-head/CAS boundary wins. If edit wins, review rejects as stale. If review wins, later edit creates a successor candidate and cannot mutate reviewed evidence. |
| Review versus policy tightening                       | Tightening or generation mismatch stales/rejects review; no favorable last-write-wins result.                                                                             |
| Review versus policy weakening                        | Existing stronger candidate remains stronger; weakening needs a fresh candidate.                                                                                          |
| Two reviewers complete simultaneously                 | One business effect wins; retry/loser sees current completed truth.                                                                                                       |
| Actor loses capability or Active Tenant Assignment    | Commit reauthorization fails; no review occurrence.                                                                                                                       |
| Reviewer becomes a material editor in another session | Participant lineage and candidate head invalidate the action.                                                                                                             |
| Same human uses another account or Assignment         | Stable-principal conflict still rejects.                                                                                                                                  |
| Route changes during review                           | Route changes attention only; source action rechecks authority/conflict and does not inherit notification state.                                                          |
| Source dependency changes out of order                | Complete graph/version mismatch stales the evaluation; prior live public state remains.                                                                                   |
| Network response is lost after commit                 | Same business-effect key reconciles the authoritative occurrence; it never performs a second review.                                                                      |

### Idempotency

The durable idempotency identity must bind at least the Tenant, environment,
Site, Plan candidate, evaluation, D20 episode/meaning, source review effect,
and intended actor principal. Reusing the key with different meaning rejects.
Transport retries return the already committed result. A key never floats to a
successor candidate or another actor.

## Failure modes and recovery

| Failure                                | Staff truth                                                              | Permanent recovery                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Source evaluator unavailable           | Review unavailable; live website unchanged                               | Retry bounded source evaluation; owner repairs source, not Plan data by hand                         |
| Unknown/incompatible evaluator version | Review unavailable                                                       | Deploy compatible evaluator or create a compatible successor; never downgrade silently               |
| No eligible independent reviewer       | Another reviewer is required; current website remains                    | Authorized route repair or exact source-owned candidate-scoped delegation                            |
| Candidate changed                      | Review requirements changed                                              | Refresh exact current candidate; preserve non-conflicting draft context                              |
| Authorization lost                     | You can no longer complete this review                                   | Re-resolve authorized recipient; no historical access revival                                        |
| Concurrent completion                  | Review already completed                                                 | Show current source truth; do not retry as another effect                                            |
| Ambiguous response                     | Checking review result                                                   | Reconcile by business-effect key before exposing another action                                      |
| Projection/item lag                    | Source page is authoritative                                             | Repair/rebuild item projection; never let item state complete the source                             |
| Policy configuration corrupt           | Review unavailable                                                       | Quarantine policy revision and restore a proven compatible current revision as a new governed action |
| Rollout disabled                       | New D23 actions stop; existing public state and immutable history remain | Roll forward with compatible evaluator; no destructive rollback                                      |

## Realistic edge cases

1. The Plan creator did no material edit but selected the target locale.
   Whether that selection is disqualifying belongs to the D16/Plan source
   predicate, not to a generic “creator” column.
2. A reviewer corrects a protected typo. If the source defines that as material,
   they become an editor and another person must review; Core warns before save.
3. A reviewer only comments or requests changes. They remain independent unless
   a source proves that action altered protected meaning.
4. Alice edits, Bob edits last, and Alice tries to review. D24 Option 2 now
   rejects this because Alice remains a substantive participant in the complete
   exact protected-candidate lineage; synchronized implementation proof remains
   required before Live.
5. Alice owns two accounts or multiple Tenant Assignments. Stable human identity
   prevents fake independence.
6. A shared account is used by two people. Shared identities can never prove
   another human and are rejected for independent review.
7. Support staff impersonates a Tenant user. Impersonation grants no review
   identity.
8. AI drafts the change for Maria. The initiating/accepting human and source
   provenance remain attributable; AI cannot review.
9. An import changes a protected dependency. The import actor/source operation
   records material participation; import does not bypass evaluation.
10. A Tenant policy is weakened after the creator discovers they are blocked.
    The pending candidate stays blocked; a new candidate uses the new lawful
    policy only if the platform floor permits.
11. A Tenant policy is strengthened after a candidate is prepared. The current
    completion path cannot use stale weaker evidence.
12. A source changes from ordinary to protected in a new contract generation.
    The current compatibility recheck raises/stales the candidate.
13. A protected component is removed entirely. A successor candidate is
    evaluated from the full new graph; removing the actual consequence may
    legitimately remove that reason, but audit prevents label-only laundering.
14. One of several source evaluators is unavailable. The aggregate is unknown,
    not ordinary.
15. The routed reviewer is qualified for Page but not Navigation. They receive
    no actionable whole-Plan item when Navigation independence is required.
16. The only eligible reviewer leaves the Tenant while the item is unread. The
    item ends without fabricated read; fallback/current authorization resolves.
17. Two co-responsible recipients act at once. One source commit wins and both
    items end from source truth.
18. A Plan lives for years with no target date. Elapsed time never changes the
    independence result; source/policy/head events do.
19. Locale copy requires a reviewer who can assess that locale. Language
    competency remains a separate source qualification; route membership does
    not infer it.
20. A protected reason itself is sensitive. Staff see the minimum safe reason
    and next action; detailed evidence requires the narrower source permission.
21. An already reviewed Plan later changes only its route. Review remains bound
    to candidate truth; route changes do not stale content review unless the
    owning policy explicitly makes responsibility part of the candidate.
22. Public activation races review projection repair. D16 must require exact
    authoritative review evidence, never the absence of an attention item.

## Proof required before implementation is called complete

### Positive and ordinary-path proof

1. A currently authorized creator completes an ordinary self-review when every
   source returns self-review permitted.
2. A different currently authorized human completes protected review.
3. A Tenant-strengthened ordinary source requires another human.
4. One successful review ends the exact D20 episode without changing public
   state.
5. A routed qualified reviewer receives one personal item.
6. An independently authorized non-routed reviewer can act from the source.
7. The exact Phase 17 delegated-review path exposes only its synthetic allowed
   projection.

### Negative and authorization proof

8. A protected material participant cannot complete review.
9. Route membership cannot bypass the conflict.
10. Super Admin, support, impersonation, “View as,” service, AI, automation, and
    shared identities cannot satisfy different-human review.
11. Cross-Tenant, cross-environment, cross-Site, wrong-candidate, and
    wrong-policy identifiers fail with privacy-safe responses.
12. Caller-controlled actor, author, editor, material flag, reason, result, or
    Tenant is ignored/rejected.
13. Unknown, missing, partial, conflicting, or incompatible source coverage has
    no positive path.
14. A Tenant cannot weaken a platform/source floor.
15. A routed but disqualified person receives no actionable item.
16. Review cannot activate default, publish content, send communication, or
    affect Giving/finance.

### Boundary and lineage proof

17. Material and non-material source actions are exhaustively classified by
    closed tests.
18. Multi-editor candidates follow the final D24 conflict predicate.
19. Linked accounts and multiple Tenant Assignments resolve to one human.
20. Removing a real protected consequence through a successor re-evaluates the
    full graph; renaming/splitting does not lower it.
21. Shared protected dependencies and locale variants participate in the
    strictest result.
22. Exact source reason privacy is proved for every permission level.

### Concurrency and idempotency proof

23. Review/edit, review/policy, review/authority-loss, two-reviewer, route-change,
    source-head, and rollout-generation races match the table above.
24. Same-key same-meaning retry returns the same effect.
25. Same key with different actor/candidate/evaluation/meaning rejects.
26. Lost-response reconciliation cannot create two review occurrences.
27. A material edit after review creates a successor/stale state and never
    mutates history.

### Migration and rollout proof

28. Migration does not infer historical reviewer independence from role,
    notification, author name, or current permissions.
29. Legacy records remain honestly unproven rather than receiving fictional
    reviewers.
30. Old-code/new-schema and new-code/old-schema combinations fail closed.
31. Rollback stops new actions while preserving public state and append-only
    evidence.
32. One source/evaluator generation cannot be partially activated without the
    complete compatible manifest.

### UX and accessibility proof

33. Representative staff can predict whether they or another person must act
    before opening the review.
34. Staff understand that review does not change the live website.
35. Blocked staff can identify one lawful next action without discovering
    another person's private permission/read state.
36. Keyboard, screen reader, zoom/reflow, high-contrast, forced-color, RTL,
    long-name, long-translation, weak-network, stale, and concurrent-completion
    paths pass.
37. Asynchronous eligibility changes are announced once, politely, without
    focus theft or alert storms.
38. Mobile action labels and consequences match desktop.

## Named production and release signals

| Signal                                                            | Threshold                                                                                                             | Owner                         | Required response                                                                                                                                       |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| site_default_plan_protected_self_review_commit_total              | Any value above 0                                                                                                     | Security + owning source      | Stop D23 commits for affected source, preserve evidence, prove no public effect, reconcile every candidate, and repair actor predicate before re-enable |
| site_default_plan_nonhuman_independent_review_commit_total        | Any value above 0                                                                                                     | Security + Identity           | Disable path, revoke affected evidence as valid review, investigate identity binding, and require fresh human review                                    |
| site_default_plan_route_granted_authority_total                   | Any value above 0                                                                                                     | Authorization + Site          | Stop rollout; remove route-as-authority path; reauthorize/reconcile affected actions                                                                    |
| site_default_plan_incomplete_floor_positive_total                 | Any value above 0                                                                                                     | Site Platform + source owner  | Fail closed, quarantine evaluator generation, and reconcile every favorable result                                                                      |
| site_default_plan_unknown_reason_positive_total                   | Any value above 0                                                                                                     | Source owner                  | Block candidate and deployment generation until the reason is registered and tested                                                                     |
| site_default_plan_stale_review_commit_total                       | Any value above 0                                                                                                     | Site Platform                 | Disable commit seam, preserve current public state, and reconcile stale occurrences                                                                     |
| site_default_plan_policy_weakened_inflight_total                  | Any value above 0                                                                                                     | Governance + Security         | Stop policy rollout; restore monotonic version selection and recreate affected candidates                                                               |
| site_default_plan_same_human_alias_pass_total                     | Any value above 0                                                                                                     | Identity + Security           | Stop independent review path, merge/fix principal binding, and re-review affected candidates                                                            |
| site_default_plan_disqualified_recipient_active_total             | Any authoritative sampled active item whose recipient currently cannot act                                            | Communications + Site         | End/repair the projection without marking it read and rerun exact recipient resolution                                                                  |
| site_default_plan_zero_eligible_independent_reviewer_active_total | Any active protected episode                                                                                          | Tenant Website owner          | Show one in-product Needs-action state and lawful route/delegation action; no automatic email or approval                                               |
| site_default_plan_review_public_effect_total                      | Any value above 0                                                                                                     | Site Runtime + Security       | Incident-stop the path, restore last valid public head, and reconcile cache/search/redirect effects                                                     |
| site_default_plan_review_giving_or_finance_effect_total           | Any value above 0                                                                                                     | Giving/Finance + Security     | Sev-1 stop, isolate affected Tenant, reconcile provider/ledger truth, and remove coupling                                                               |
| site_default_plan_delegated_projection_forbidden_field_total      | Any value above 0                                                                                                     | Privacy + source owner        | Disable delegation, revoke projection access, investigate disclosure, and rebuild minimized evidence                                                    |
| D23 pre-Live staff comprehension protocol                         | Fewer than 90 percent correctly identify who can act, or any participant believes review itself changes the live Site | Product Design + Site Product | Revise wording/flow and repeat representative testing before cohort activation                                                                          |

The 90-percent comprehension target is a **Core product judgment**, not an
industry statistic. The zero-tolerance thresholds protect structural
invariants. The no-eligible-reviewer signal is a product state, not an
automatic incident or reminder trigger.

Performance targets for the complete evaluator and route resolver remain an
unresolved implementation input. A production-shaped latency and capacity
budget must be named before Live rather than invented in this research.

## Assumptions and unresolved unknowns

### Assumptions requiring representative evidence

- Some missions organizations have only one Website-capable staff member.
- Those staff can distinguish Plan review from public activation when Core
  states the difference plainly.
- Protected changes occur infrequently enough that candidate-scoped independent
  review is tolerable.
- “Another person must review” plus one safe reason is clearer than permission
  jargon.

Verify with representative one-person, small multilingual, multi-Site, and
restricted-access ministry teams. Do not recruit only experienced CMS
administrators.

### Known unknowns

- Which exact Phase 24 Page, Navigation, and default-change facts are material.
- Whether the protected conflict set is latest editor or every substantive
  participant; repository artifacts currently disagree.
- Which sources, beyond Phase 17, own a candidate-scoped delegated reviewer
  path.
- Exact source reason codes and privacy projections.
- Production cardinality, latency, and throughput limits.
- Baseline rate of no-eligible-reviewer states.
- Whether “Independent review required” translates clearly in every supported
  locale.

These unknowns do not invalidate Option 2. They prevent a claim that the exact
implementation contract is already complete.

## Required order of work

1. Record D23's source-owned strictest-floor decision and its no-public/no-
   financial boundary.
2. Reconcile the Phase 17 “latest editor” versus “every substantive
   author/editor” contradiction.
3. Inventory every source that can contribute to a Default Site Locale Plan and
   require an exact evaluator, version, material-participation rule, reason-code
   set, and privacy projection from each.
4. Define the one Plan aggregation and monotonic candidate/policy-version
   contract; do not create a generic policy engine.
5. Define stable-human identity and authorization proof through Phase 12.
6. Prototype and test the ordinary, protected, no-reviewer, policy-changed,
   stale, and concurrent-completion journeys in Base Maia.
7. Specify composite data constraints, RLS/grants/RPC boundaries, append-only
   review evidence, and projection repair.
8. Implement with red-green tests at the source review command and recipient
   resolver seams.
9. Run migration census without inventing historical independence.
10. Activate one compatible manifest generation behind a cohort fence; monitor
    zero-tolerance signals; roll forward rather than destructively rewriting
    evidence.

## Final research disposition

**Accept with required amendments.**

Option 2 is the best permanent path because it:

- keeps the safety rule with the source that understands the consequence;
- preserves all existing protected-review floors;
- keeps ordinary one-person ministry work operable;
- avoids a second permission or workflow engine;
- gives staff one clear answer about who acts next; and
- preserves the existing public Site and all Giving/financial boundaries.

It is acceptable only with the exact D23-R1 through D23-R8 contract above,
monotonic policy behavior, fail-closed complete graph evaluation, stable-human
conflict proof, and the explicit Phase 17 lineage reconciliation.

## Resolved subsequent Grill decision — D24 protected participant boundary

### Why this required a decision

Core currently has two incompatible statements for protected work:

- the active OpenSpec delta excludes only the **latest material editor**;
- the Phase 17 primary PRD excludes **every substantive author/editor**.

This changes real outcomes and could not be left to implementation.

**Hope example:** Maria makes the protected Navigation change. Ana later fixes
one protected label. Maria is no longer the latest editor. The decision was
whether Maria should then be allowed to perform the independent review.

### Option 1 — exclude only the latest material editor

Maria may review after Ana makes the last material edit.

**Benefit:** more people remain eligible.  
**Cost/risk:** participants can rotate the final edit and review each other's
combined work; “independent” no longer means independent of the whole candidate.

### Option 2 — exclude every substantive participant — recommended

Maria and Ana are both disqualified for that exact candidate. A third qualified
human must review. Reading, commenting, routing, or requesting changes does not
disqualify; making a source-defined material edit does.

**Benefit:** clearest permanent rule, matches Phase 17's primary PRD and
GitLab's stronger all-committers control, and prevents last-editor laundering.  
**Cost/risk:** a reviewer who fixes protected content must hand review to
someone else; solo/small teams need the exact bounded delegation path.

Staff copy before such an edit:

> Saving this protected change means someone else must review it.

### Option 3 — source-subgraph participation only

A person may review untouched protected subgraphs but not the exact subgraph
they edited.

**Benefit:** theoretically most proportional.  
**Cost/risk:** introduces partial approvals, graph-level attribution, and
explanations that are brittle for one atomic Plan review.

### Recommendation and founder answer

Choose **Option 2 — exclude every substantive participant for the exact
protected candidate**. It is the easiest safe rule for staff to predict:
**If you materially change protected work, another person reviews it.**

The founder chose **Option 2 — exclude every substantive participant**. The
completed [D24 primary research](./phase-24-d24-every-substantive-participant-primary-research.md)
and [D24 adversarial review](./phase-24-d24-every-substantive-participant-adversarial-review.md)
record the exact source-owned candidate-lineage, materiality, stable-human,
identity, authorization, concurrency, data, UX, and proof amendments.
[D25](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
now closes recovery when no qualified internal reviewer remains, under
[ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md).
D26 now closes when that external option may appear despite an eligible
internal reviewer. D27 now closes one source-owned responsibility lane with
deliberate takeover. D28 now closes explicit decline/expiry next-lane recovery;
D29 next decides its bounded recovery-responsibility route.

## Primary source index

### Core

- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [active outbound-communications OpenSpec delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Phase 12 role and permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 17 System Messages](./phase-17-system-messages-template-management.md)
- [Phase 17 D11 traceability](./phase-17-decision-test-traceability-2026-07-19.md)
- [D16 locale-neutral Site root](./phase-24-d16-locale-neutral-site-root-adversarial-review.md)
- [D17 private Plan](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
- [D19 state-driven attention](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D20 review-required episodes](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D21 responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)

### External official sources

- [NIST SP 800-53 Revision 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- [GitHub approving required reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews)
- [GitHub available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [GitHub code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitLab approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/)
- [GitLab approval policies](https://docs.gitlab.com/user/application_security/policies/merge_request_approval_policies/)
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [Contentful workflow step management](https://www.contentful.com/help/ai-automations/workflows/workflows-steps-management/)
- [Contentful multiple workflows](https://www.contentful.com/help/ai-automations/workflows/workflows-management/multiple-workflows-to-content-types/)
- [Blackbaud Payment Assistant approval tiers](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
- [Blackbaud Financial Edge approval rules](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-settings-approval-rules.html)
- [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [WCAG 3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)
- [WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [WAI Alert Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
