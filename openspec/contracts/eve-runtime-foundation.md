# eve-runtime-foundation normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-20a85720d7d6971fc2c3"></a>

## The Runtime Reads Installed Eve Docs Before Coding And Never Codes From Memory

<!-- BEGIN CONTRACT {"id":"20a85720d7d6971fc2c3","name":"The Runtime Reads Installed Eve Docs Before Coding And Never Codes From Memory"} -->

The runtime MUST **read and summarize the installed Eve (Vercel) framework docs after the package is added**,
before runtime coding proceeds. Runtime coding MUST NOT depend on memory of upstream APIs; official framework
and package docs are the **API-fact layer** of the source-of-truth order and MUST be consulted for API facts.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:363]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:401]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3f3c38f4df7180e8ca55"></a>

## The Runtime Owns Its Own Session And Workflow Durability

<!-- BEGIN CONTRACT {"id":"3f3c38f4df7180e8ca55","name":"The Runtime Owns Its Own Session And Workflow Durability"} -->

The Eve runtime MUST own **its own sessions and workflow durability** through the runtime and its host workflow
system. Governance persistence — audit, approvals, memory, model policy, budgets, notification records, run
summaries, shared run context metadata, kill-switch state, release switches, and retention state — MUST remain
**Supabase-owned app data** (#418); the runtime MUST NOT persist governance state itself.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:404]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:408]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f7575c53fcf5e197aeda"></a>

## Web Build Artifacts Are Separate From Eve Runtime Qualification

<!-- BEGIN CONTRACT {"id":"f7575c53fcf5e197aeda","name":"Web Build Artifacts Are Separate From Eve Runtime Qualification"} -->

Generic web builds MUST compile their Eve dependency without provisioning a
sandbox. Hosted preview Eve services MUST support the same explicit artifact
mode. These outputs MUST be treated as unqualified Release-Off previews and MUST
NOT activate Eve, change effect admission, or satisfy sandbox/launch evidence.
Build caches MUST distinguish artifact mode and MUST NOT reuse a cached result
as full sandbox qualification. Ordinary standalone and production service builds
MUST retain the full SDK prewarm path and propagate its failures.
Authored-source verification MUST exclude only the SDK's exact generated service
and deployment output directories, while retaining checks on authored code and
same-named directories outside those paths.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5c0af8b1f34465f31cc7"></a>

## The Runtime Follows The Layered Source-Of-Truth Order And Grants No New Authority

<!-- BEGIN CONTRACT {"id":"5c0af8b1f34465f31cc7","name":"The Runtime Follows The Layered Source-Of-Truth Order And Grants No New Authority"} -->

The runtime MUST follow the **layered source-of-truth order** — OpenSpec and repo instructions define intent
and rules; runtime, GitHub, CI, evals, and logs define current reality; official framework/package docs define
API facts; memory is helpful context only — and MUST preserve **AGENTS and OpenSpec as higher authority** than
agent memory or provider plugins. The runtime MUST only add an isolated, off-by-default host; it MUST NOT widen
Eve's authority, MUST NOT bypass #417 protected-area/production-write/approval limits or #418 emergency-off
precedence, and MUST read only persisted app-owned governance state, never a prompt/model/tool claim that a
switch is off. The foundation MAY include disabled local verification runtime code, but MUST NOT introduce a
live model/provider path, an app mount, deployment, or autonomous effect.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:399]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:339]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-44c9a3df3460598af941"></a>

## The Runtime Resolves Models Through #421 Policy And Spends Under #423 Budgets

<!-- BEGIN CONTRACT {"id":"44c9a3df3460598af941","name":"The Runtime Resolves Models Through #421 Policy And Spends Under #423 Budgets"} -->

The runtime MUST resolve **every model through the #421 shared model policy** (Gateway-primary; any direct
provider — including a partner GPU inference gateway — a controlled, non-default, revocable fallback) and MUST
NOT hardcode a model or provider in runtime code. All runtime work, including the minimal eval, MUST spend
**under #423 hard budgets and rate limits**. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:187]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-91e895d78f2de0084577"></a>

## The Eve Runtime Is An Isolated Dedicated Workspace Package

<!-- BEGIN CONTRACT {"id":"91e895d78f2de0084577","name":"The Eve Runtime Is An Isolated Dedicated Workspace Package"} -->

The Eve runtime MUST begin as a **dedicated workspace package** whose Node and dependency needs are isolated
from the three Next apps (admin, donor, missionary), so Eve's runtime footprint can be validated before admin
mounting. The runtime MUST remain **isolated from the three Next apps until the #428 admin mount is proven**
compatible with the installed Next.js version; it MUST NOT import app runtime code and no app MUST import the
runtime before that mount. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:367]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-49be335e7163e8f0fafd"></a>

## The Runtime Provides Local Verification With The Release Switch Off

<!-- BEGIN CONTRACT {"id":"49be335e7163e8f0fafd","name":"The Runtime Provides Local Verification With The Release Switch Off"} -->

The runtime MUST expose local verification that passes while the **release switch remains off** and the package
is **disabled by default**: an **`eve info`** command that reports runtime health and the read docs, an
**`eve build`** command, and a **minimal eval** that all pass locally. None of these MUST enable live autonomy,
admin mounting, or any production action. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:166]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
