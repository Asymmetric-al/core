# eve-autonomous-operations normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-975e8e19f3d6f639a54a"></a>

## Engineering Work Initiation And PR Operations Are Policy-Gated

<!-- BEGIN CONTRACT {"id":"975e8e19f3d6f639a54a","name":"Engineering Work Initiation And PR Operations Are Policy-Gated"} -->

Eve MUST NOT initiate engineering work unless release and GitHub-action controls
allow it. When allowed, Eve MAY create or update an issue, create an isolated branch, open a
pull request, reviewing or commenting, labeling, rerunning CI, pushing a safe
fix, and updating PR state. Every operation MUST use an accountable identity
and initiator, remain within approved repository and task scope, satisfy
permission and budget policy, and emit the required audit evidence.

Eve-invented work MUST follow issue-first flow. Product-direction changes MUST
follow the spec-first OpenSpec path before implementation or merge. Permission
to perform a PR operation MUST NOT imply permission to merge. An action that
mutates beyond scope, would modify a protected area, lacks required evidence,
or needs broader product or production authority MUST be withheld and escalated
to a human. Separately authorized inspection, review, or comment on a protected
PR MAY proceed: inspection MUST remain read-only, while posting a review or
comment MUST be treated as a separately gated and audited, non-code-changing
GitHub write. Neither MUST grant permission to modify branch contents or merge
the protected change.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0ecdf7d3f90bd2a244af"></a>

## Protected Areas Block Autonomous Merge

<!-- BEGIN CONTRACT {"id":"0ecdf7d3f90bd2a244af","name":"Protected Areas Block Autonomous Merge"} -->

Eve MUST NOT autonomously merge changes that touch auth, permissions, tenant
resolution, donations or payments, secrets or environment configuration,
migrations or RLS, production deployment, data-access boundaries, GitHub
workflows, Vercel configuration, agent instructions, Eve configuration,
packages, dependencies, runtime behavior, or other repository-designated
protected areas. Protected changes MUST follow their required human review
path even when the release gate is enabled.

For changes outside protected areas, autonomous merge MUST remain
deny-by-default. It MAY be eligible only when release and GitHub-action controls
allow it, the action is within the accountable actor's policy and budget, all
required checks and reviews pass, branch protection and repository policy are
satisfied, and no unresolved blocking finding or stricter approval applies.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c925bdd56e1feba50a1c"></a>

## Autonomous Activation Uses One Disabled Release Gate

<!-- BEGIN CONTRACT {"id":"c925bdd56e1feba50a1c","name":"Autonomous Activation Uses One Disabled Release Gate"} -->

Eve implementation MUST remain inactive while it is delivered incrementally;
autonomous activation uses one app-owned release gate that defaults to disabled. Merging a spec or
implementation slice MUST NOT enable Eve. Emergency-off and any more
restrictive kill-switch or policy result MUST take precedence over an enabled
release gate.

An independently runnable slice MUST also ship behind a capability-specific
flag or disabled configuration until coordinated launch. A slice control MAY
restrict that capability further, but MUST NOT enable autonomy while the master
release gate is off or act as an alternative master release switch.

Only the final #437 launch verification MAY establish readiness, and only a
verified human using the authorized control path MAY enable the gate. Missing,
stale, mismatched, waived, or failing required evidence MUST keep it disabled.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f95bdaa16f5f0904e15a"></a>

## Governance State Is App-Owned

<!-- BEGIN CONTRACT {"id":"f95bdaa16f5f0904e15a","name":"Governance State Is App-Owned"} -->

Supabase-owned application data MUST be authoritative for release and
kill-switch state, audit, approvals, budgets, model policy, notification
records, run summaries, shared-run-context metadata, private admin memory,
replay metadata, and retention state. Large redacted replay or debug artifacts
MAY use Supabase Storage with relational metadata and access controls.

Eve's sessions and workflow durability MUST remain owned by the isolated Eve
runtime and its workflow host. Runtime or session state MUST NOT override
app-owned governance, identity, or authorization state.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-06bb2efd038b6b933ddf"></a>

## Eve Uses Accountable Execution Identities

<!-- BEGIN CONTRACT {"id":"06bb2efd038b6b933ddf","name":"Eve Uses Accountable Execution Identities"} -->

Eve MUST resolve actor identity and scope from trusted app-owned execution
boundaries. Mission Control actions MUST act as the current signed-in admin,
with user, tenant, role, and permissions derived from verified server-side
session context. Scheduled, background, and system work MUST act as a
configured service identity with explicit initiator or trigger metadata and
trusted scope from app-owned job or configuration state. GitHub operations MUST
use the configured bot identity while recording the accountable human, service
trigger, or GitHub event.

Prompts, model output, tool input, unverified remote payloads, memory, and
shared context MUST NOT establish or widen the actor, tenant, repository, role,
or permission scope. A signature-verified GitHub event MAY identify a target
only after the app maps its installation and repository to configured
allowlists; event-supplied identifiers MUST NOT be authority by themselves.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6bb80312b6caa118eded"></a>

## Eve Autonomy Is Spec-First And Governed

<!-- BEGIN CONTRACT {"id":"6bb80312b6caa118eded","name":"Eve Autonomy Is Spec-First And Governed"} -->

Eve MUST operate as a governed autonomous operations capability whose durable
product behavior is defined in OpenSpec before implementation. Runtime code,
prompts, models, tools, provider integrations, memory, or operational
convenience MUST NOT broaden the accepted contract.

For repository work, Eve MUST use `AGENTS.md` as the canonical instruction
router and the applicable OpenSpec specs as product intent. Runtime, GitHub, CI,
evals, and logs MUST be treated as evidence of current observed state;
version-matched official documentation MUST be used for API facts; memory MUST
remain non-authoritative context.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
