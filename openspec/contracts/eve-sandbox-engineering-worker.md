# eve-sandbox-engineering-worker normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-d9392847fe6cabef6b2c"></a>

## The Sandbox Grants No New Authority

<!-- BEGIN CONTRACT {"id":"d9392847fe6cabef6b2c","name":"The Sandbox Grants No New Authority"} -->

The sandbox MUST resolve **every model through #421's shared policy via the #425 runtime** (never hardcoding a
model or provider), MUST spend **under #423 hard budgets and rate limits**, and MUST stay **disabled by default
while the release switch is off**. It MUST NOT widen Eve's authority, MUST NOT bypass #417 protected-area /
production-write / approval limits or #418 emergency-off precedence, and MUST read only persisted app-owned
governance state. Live sandbox code MUST fail closed when those controls are unavailable.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5f17e0746f76d9128b21"></a>

## A Sandbox Networking Kill Switch And Emergency Stop Can Cut The Sandbox

<!-- BEGIN CONTRACT {"id":"5f17e0746f76d9128b21","name":"A Sandbox Networking Kill Switch And Emergency Stop Can Cut The Sandbox"} -->

The sandbox MUST honor #420's **`disable sandbox networking`** kill switch and an **emergency stop** that can cut
the sandbox instantly. The sandbox MUST **read the persisted switch state** from the app-owned governance store,
never a prompt/model/tool claim that networking is on, and MUST stop egress when the switch is set.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:512]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:184]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-946dffa4a8240cf6a491"></a>

## Allow-All Networking Is Permitted Only With Strong Containment

<!-- BEGIN CONTRACT {"id":"946dffa4a8240cf6a491","name":"Allow-All Networking Is Permitted Only With Strong Containment"} -->

Sandbox network access MAY be **allow-all**, but it MUST be paired with the full compensating-control set — no
mounted secrets/env/service-role keys/production dumps, egress and command audit, sensitive-file scanning,
protected-file detection, and a networking kill switch. Allow-all networking MUST NOT be permitted unless those
controls are active. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:262]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-65c1612e694842480c05"></a>

## The Sandbox Mounts No Secrets, Env Files, Service-Role Keys, Or Production Dumps

<!-- BEGIN CONTRACT {"id":"65c1612e694842480c05","name":"The Sandbox Mounts No Secrets, Env Files, Service-Role Keys, Or Production Dumps"} -->

The sandbox MUST be provisioned with **no mounted secrets, no environment files, no service-role keys, and no
production data dumps**. The exfiltration risk of allow-all networking MUST be compensated **structurally** — by
there being nothing sensitive present to exfiltrate — not by trusting the agent. No donor PII, payments,
secrets, one-time codes, or tenant facts MUST enter the sandbox.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:266]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:510]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-188426a769b56327f4eb"></a>

## The Sandbox Provides A Writable Repo Checkout For Engineering Work

<!-- BEGIN CONTRACT {"id":"188426a769b56327f4eb","name":"The Sandbox Provides A Writable Repo Checkout For Engineering Work"} -->

The Eve sandbox MUST provide a **writable repo checkout** in which Eve can **inspect, edit, test, commit, and
prepare pushes** for engineering work. Push authentication and GitHub write authority remain separately gated
by #430 and #431. The checkout MUST be a disposable working copy contained within the sandbox, and the
sandbox MUST be the **contained environment the #425 runtime executes in**, never the runtime package itself.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:259]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
