# D30 evidence — representative transfers and assignment rules

Research appendix, 2026-10-11 UTC. Direction under review: review existing
relationship transfers by default, with explicit tenant opt-in for approved rules
to transfer existing rule-managed assignments. This is evidence and proposed
safeguards, not a formal specification, implementation proof or new ratification.

## Assessment and authority

The combined direction is credible. Current systems distinguish initial routing
from replacing an owner, expose deliberate reassignment, and provide controls for
rule effects. The evidence supports those distinctions; it does not establish that
automatic transfers improve ministry relationships or that every missions agency
needs them. Review by default need not mean one approval per supporter: an
authorized person can deliberately review a finite group.

Core's governing boundaries remain stronger than these comparisons. P9 owns
role-qualified staff-assignment relationships and derived portfolios; D5 separates
the supporter representative from the partnership lead. Request/task owners,
access, cultivation admission and communications remain independently governed.
The [Q30 continuation note](../phase27-q30-assignment-rule-changes.md) supplies
those inherited boundaries. Vendor account ownership, actionable-list assignment
and territory membership are different objects, not interchangeable implementations.

## Fresh primary evidence

All sources below were opened and read on **2026-10-11 UTC**. “Undated” means no
publication/update date was established from the retrieved page. Documentation
describes supported behavior; vendor benefit statements and fictional training
organizations are not measured efficacy or practitioner interviews.

### E1 — explicit permission to replace an existing owner

[HubSpot: Assign and rotate record owners using workflows](https://knowledge.hubspot.com/workflows/assign-and-rotate-record-owners-using-workflows),
updated **2026-09-01**, Sales Hub/Service Hub Professional and Enterprise.
The rotation action offers an explicit setting to overwrite an existing owner.
Recipients must meet the documented user/seat eligibility requirements; changing
the recipient pool affects subsequent distribution. This supports separating
initial assignment from replacement. It does not demonstrate durable protection of
every manual exception, nor justify importing HubSpot subscriptions, workflow
infrastructure or rotation algorithms into Core.

### E2 — assignment ending does not resolve associated work

[Blackbaud Raiser’s Edge NXT: Fundraiser Assignments](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-solicitors-assign.html),
undated current help. Assignments have a type, dates and reason; previous
relationships can remain visible. Ending the constituent assignment removes the
constituent from that fundraiser's portfolio, while related action assignments
and opportunities remain so the fundraiser can resolve them. This is strong
nonprofit evidence for distinguishing relationship responsibility from associated
work. The vendor's administrative “end relationship” terminology should not imply
that a church's friendship or partnership has ended. This page does not establish
an automatic handoff policy.

### E3 — nonprofit future assignment and deliberate reassignment coexist

[Salesforce Trailhead: Manage an Actionable List](https://trailhead.salesforce.com/content/learn/projects/fundraising-portfolios-with-actionable-lists/manage-an-actionable-list),
undated current nonprofit fundraising tutorial using Actionable Lists and Data
Processing Engine, with current Agentforce Nonprofit branding; not NPSP guidance.
It configures future list members to inherit an assignment and separately permits
selecting one or several existing members to change assignee. Its fictional
fundraising example illustrates portfolio balancing, not observed agency practice.
This supports understandable future-routing versus existing-transfer controls.
Its automatic list admission, donor qualification stages and data-processing
architecture are not Core requirements.

### E4 — assignment rules have specific triggers and activation effects

[Microsoft: Create and activate assignment rules](https://learn.microsoft.com/en-us/dynamics365/sales/wa-create-and-activate-assignment-rule),
updated **2026-06-15**, Dynamics 365 Sales, sales accelerator work assignment.
Rules consider records created or updated after activation; ordering determines
the first matching rule. Recipient choices have eligibility requirements. Saving
creates and activates the rule, and processing can be delayed. This demonstrates
that trigger, precedence and activation semantics matter. It does not support
assuming every policy edit immediately sweeps all existing relationships.
The page identifies feature availability from version 9.1.23074.10021; this is not
verification of a tenant's installed edition or entitlement.

### E5 — editing a rule is not necessarily retrospective

[Microsoft: Edit assignment rules](https://learn.microsoft.com/en-us/dynamics365/sales/wa-edit-assignment-rule),
updated **2026-04-30**, the same Dynamics work-assignment feature. Changes apply
to records connected to the segment going forward; previously connected records
are unaffected by that edit. This is a specific edit behavior, not a guarantee
that no other trigger or explicit reprocessing can affect those records.
Inference: policy maintenance and deliberate application to existing assignments
need distinguishable effects.

### E6 — preview is useful without being a guarantee

[Microsoft: Create and activate a segment](https://learn.microsoft.com/en-us/dynamics365/sales/wa-create-and-activate-a-segment),
updated **2025-09-05**, Dynamics work assignment. Optional simulation displays
records matching conditions, with an explicit warning that results may differ
from records actually eligible for application. Segment save and activation are
separate here, unlike E4's assignment-rule save behavior. This supports truthful
preview language and checking current conditions at execution. It does not
authorize copying communication sequences or an additional segmentation engine.

### E7 — failures and reprocessing need understandable outcomes

[Microsoft: View and assign records](https://learn.microsoft.com/en-us/dynamics365/sales/wa-manage-unassigned-records),
updated **2026-04-30**, Dynamics work assignment. The management view exposes
assignment details, previous/current owner and reasons such as unavailable
eligible recipients or permissions; it supports reassignment and reprocessing
history. This documents repair visibility, not proof that Core needs the same
statuses, batch limits or recurring jobs. Some vendor “Needs attention” cases
reflect historical-version handling rather than a current assignment failure;
Core should explain the actual unresolved condition.

### E8 — deactivation stops future behavior rather than undoing history

[Microsoft: Delete or deactivate assignment rules](https://learn.microsoft.com/en-us/dynamics365/sales/wa-delete-deactivate-assignment-rule),
updated **2026-04-30**, Dynamics work assignment. Deactivation stops new rule
assignments while existing assignments remain; deletion also does not undo them.
This supports making “stop automation” distinct from a corrective transfer. It
does not establish what Core should do with previously queued work; that needs
current authorization and policy checks, not an assumed vendor guarantee.

### E9 — planning previews preserve rule/manual distinctions

[Salesforce: Preview Territory Assignments for Accounts](https://help.salesforce.com/s/articleView?id=sales.tm2_preview_account_assignments.htm&language=en_US&type=5),
undated current Sales Territories help. Available in the documented Performance
and Developer editions and Enterprise/Unlimited with Sales; interface availability
differs between Classic and Lightning. In a planning model, administrators can run
rules before activation and inspect assignments, including whether they arose by
rule or manually. This is a useful preview/provenance pattern. Territory membership
can affect sharing, so it is not a model for Core's assignment/access separation.
The page's permission to see certain account identifiers without account details
also does not authorize equivalent disclosure in Core.

### E10 — manual exceptions are a legitimate operating case

[Salesforce: Assign Accounts Directly to Territory Records](https://help.salesforce.com/s/articleView?id=sf.tm2_assign_accounts_manually.htm&language=en_US&type=5),
undated current Sales Territories help, same edition scope as E9. Direct assignment
handles accounts that do not fit normal assignment rules. This establishes a
supported exception mechanism, not a blanket guarantee that every manual
assignment survives every later automated action. Core's protected-exception
requirement comes from its own decision, not an inferred Salesforce guarantee.

## Material concerns and exact proposed safeguards

Severity and likelihood below are qualitative product judgments. They identify
plausible failure conditions, not measured incident frequencies. The proposed
clauses refine the selected operating direction without adding a new approval
engine or changing a domain's ownership.

### P1 — “automatic” silently includes deliberate exceptions

**High severity; plausible whenever existing assignments are mixed.** An imported
or manually chosen representative could be treated as rule-managed merely because
the record now matches a rule. This would erase the difference the policy promises.

**Clause:** “Automatic replacement applies only to the explicitly enabled staff
role and scope and to assignments established as rule-managed. A matching rule
does not silently convert a deliberate exception or an assignment of unknown
management status into an automatically replaceable assignment. Authorized staff
can deliberately return an exception to rule management.”

This preserves genuine automation; it does not require a person to approve every
subsequent compliant transfer. Provenance should explain present responsibility
in ordinary language, without requiring staff to understand technical event types.

### P2 — policy editing conceals its effect on established responsibility

**High severity; plausible during boundary or staffing changes.** Enabling a rule,
editing it, reprocessing a chosen set and normal record changes are not equivalent
actions. E4–E6 demonstrate differing, explicit vendor semantics.

**Clause:** “Before enabling or changing automatic transfers, explain the affected
role, eligible scope, triggering changes and whether existing assignments will be
reconsidered. Show understandable expected impact. Application to existing work
must follow the enabled policy's explicit semantics; a preview does not reserve
authority or guarantee its later result.”

A finite reviewed transfer remains a finite reviewed transfer. It must not become
a standing policy through a hidden default. Conversely, an approved automatic
policy should not be represented as requiring repeated ordinary approvals.

### P3 — a representative change falsely claims a complete handoff

**High severity; plausible where several responsibilities coexist.** A church may
have an agency representative, a missionary partnership lead and an open hosting
Request assigned to different people. This is an illustrative case, not a reported
agency workflow. E2 makes the separation particularly concrete.

**Clause:** “Changing this staff assignment does not by itself change partnership
leads, Request/task owners, access, financial responsibilities or communications.
Show affected open work and its actual responsible owner; fulfill any applicable
source-owned handoff condition before claiming that handoff is complete.”

Do not impose a universal receiving-person acknowledgment. Where an existing
qualified workflow requires acceptance, preserve it. Staff departure still
requires timely access revocation; unfinished handoff cannot justify retaining
access or pretending abandoned obligations are resolved.

### P4 — rule failure chooses an arbitrary substitute or removes responsibility

**High severity; plausible when recipients leave, permissions change or rules
overlap.** E7 shows why explicit diagnosis matters, but a transient sales-lead
availability model is not evidence for clearing a long-term representative.

**Clause:** “Recheck current eligibility, assignment state, protected exceptions
and applicable handoff conditions before transfer. Unresolved conflicts or an
ineligible destination produce an understandable, source-owned repair condition;
they do not authorize an arbitrary substitute, unrelated role change or silent
loss of accountability.”

Use existing repair ownership. This does not require a second portfolio store,
generic routing-error product or new staff availability/capacity system.

### P5 — stopping or retrying automation misrepresents what happened

**High severity; plausible during correction and partial failures.** Staff must
distinguish a recommendation, an attempted transfer and the assignment that
actually exists. E8 is a useful precedent for avoiding magical rollback language.

**Clause:** “Report actual changed, protected, unchanged and blocked outcomes for
the reviewed or processed scope, with attributable assignment history. Stopping
automatic transfers prevents later unauthorized effects; it does not silently
reverse completed assignments. Corrections are deliberate current-authority
actions, and re-enabling does not silently apply an undisclosed backlog.”

Preserve enough explanation to investigate a result, without duplicating private
relationship notes in general policy previews. Partial results must not claim
that every selected relationship moved successfully.

### P6 — organization routing is mistaken for personal allegiance

**High severity; context-dependent likelihood.** A church's geographical region
could change while its trust in a particular missionary remains unchanged.
Neither that illustrative possibility nor CRM feature documentation establishes
the agency's actual transfer policy.

**Clause:** “Describe transfers as changes in the organization's recorded staff
responsibility. They do not assert supporter assent, replace a ministry target,
alter recorded donor intentions, require missionary reporting, or send an
announcement. Preserve the independently governed relationship and privacy
boundaries.”

Use restrained language such as “Current representative,” “Proposed
representative” and “Why this would change.” Avoid “move donor” language that
suggests the organization owns the person or their allegiance.

## Strongest alternative and proof still needed

The credible smaller alternative is **no additional automatic replacement
behavior**: retain required initial routing, manually protected exceptions,
assignment history and deliberate individual/finite-group transfers. It has less
policy and recovery complexity. Its cost is recurring review when an organization
actually wants established rule-managed assignments to follow changing routing
conditions. This is a fair alternative, not a reason to reverse the selected
tenant flexibility or pretend required initial assignment is optional.

No source establishes how often intended tenants change regional responsibilities,
how many protected exceptions they need, or whether automation saves them time.
Those remain empirical questions. A bounded usability exercise with intended
staff should ask them to distinguish new routing from existing replacement,
protect a deliberate exception, understand a policy preview, and explain what
happens to an open Request when the representative changes. Observe confusion;
do not invent success percentages, practitioner quotes or mandated cohort sizes.

Later implementation proof should cover: a manual change after preview; an
ineligible proposed recipient; concurrent rule/manual changes; one blocked item
within a reviewed group; policy deactivation before execution; a retry after
partial completion; and a transfer with independently owned open work. Expected
results are faithful current responsibility, preserved exceptions/history,
truthful affected-work status and no unintended access or communication effects.
These are proposed proof cases; this research did not execute live CRM changes,
runtime tests or contact any people.
