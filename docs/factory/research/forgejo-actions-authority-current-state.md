# Forgejo, local CI, and code-authority handoff: current-state research

**Research ticket:** [Verify Forgejo LTS, Actions, API, and code-authority capabilities](https://github.com/Asymmetric-al/core/issues/1243)

**Evidence date:** 2026-08-12

**Validation result:** Current patch versions corrected; capability, trust-boundary, and handoff conclusions revalidated.

**Status:** Research input for Wayfinder. This is not an implementation specification or a production configuration.

## Question

Which current Forgejo release and supported features can safely implement private prepublication Git, protected local CI, and a one-way authority handoff to GitHub?

## Executive verdict

Forgejo can serve as the private Git store for unpublished cell branches, and its v15 API has the necessary repository primitives: branch protection, commit statuses, action-run queries, webhooks, scoped tokens, and explicit push-mirror management. The August 3 brief's choice of Forgejo 15 LTS remains a defensible first-pilot default, but its patch numbers are stale: the current releases are Forgejo `15.0.6` LTS and Forgejo `16.0.2`. Forgejo 16 is newer but non-LTS and has a much shorter support window. The current release pages list v15 support through 2027-07-15 and v16 support through 2026-10-29. ([releases](https://forgejo.org/releases/), [release schedule](https://forgejo.org/docs/latest/admin/release-schedule/))

Three material qualifications reopen parts of the brief:

1. **The staging repository cannot safely be its own workflow authority.** Forgejo's security guide explicitly says that anyone who can push a new branch can add an `on: push` workflow and execute arbitrary code, even when the default branch is protected. Forgejo also injects a repository-scoped automatic token with write permission into workflow steps. A protected workflow on `develop` is therefore not, by itself, a sufficient local-CI trust boundary. ([Actions deployment security](https://forgejo.org/docs/v15.0/admin/actions/security/), [automatic token](https://forgejo.org/docs/v15.0/user/actions/basic-concepts/#automatic-token))
2. **Inbound JWT Authorized Integrations are a v16 capability, not a v15 capability.** Forgejo's v16 announcement says v15 could generate JWTs for external validation, while v16 added Authorized Integrations that let Forgejo authenticate API and Git access using JWTs. The brief links the rolling `latest` documentation while recommending v15, which makes its proposed short-lived Forgejo authentication posture unavailable on the selected LTS line. ([Forgejo v16 announcement](https://forgejo.org/2026-07-release-v16-0/))
3. **The authority handoff is a cross-system saga, not an atomic Forgejo feature.** Forgejo can freeze a branch and GitHub can accept and verify an exact ref, but neither product provides an atomic transaction spanning Forgejo, the Factory state store, and GitHub. The Factory must own idempotency, compare-and-set state transitions, uncertainty reconciliation, and the invariant that only one side is writable.

The safest first-pilot shape is therefore:

- Forgejo v15 LTS for the private Git store;
- Actions disabled on the agent-writable staging repository;
- a separate, human/control-plane-owned CI workflow authority or an external Gate Service;
- untrusted candidate execution in a disposable VM or equivalent second security boundary with no Forgejo/GitHub token, no secrets, no host Docker socket, and narrowly filtered network access;
- a one-shot Publication Service push of one exact SHA to one new GitHub ref, never a Forgejo push mirror;
- a durable Factory evidence ledger outside Forgejo for gate results, handoff actions, and recovery.

## Method and evidence boundary

This review used the August 3 brief's sections 22–24, the canonical repo guidance, Forgejo's versioned v15 documentation and v15 OpenAPI schema, Forgejo's current release announcements, GitHub's official documentation, the checked-in Core CI guidance, and read-only GitHub API observations. Nia was not available in this client, so repository discovery used repo-scoped `rg`, direct file reads, and read-only `gh api` calls as the documented fallback.

No Forgejo instance was installed or configured. No workflow was executed. No GitHub state was changed.

## Release and support facts

| Component                 | Current fact on 2026-08-12                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Consequence                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Forgejo server 15 LTS     | `15.0.6`, released 2026-07-30; support ends 2027-07-15. The patch includes security fixes for Git hooks during diff patch generation, private-network host matching, arbitrary file reads in org-mode rendering, stored XSS in Actions pre-execution errors, and security dependency updates. ([releases](https://forgejo.org/releases/), [15.x releases](https://forgejo.org/releases/15.x/), [15.0.6 release notes](https://codeberg.org/forgejo/forgejo/src/branch/forgejo/release-notes-published/15.0.6.md)) | Best stability default for a first pilot. Pin `15.0.6` initially and establish a prompt patch-update lane; do not use a floating image tag. |
| Forgejo server 16         | `16.0.2`, released 2026-07-30; support ends 2026-10-29. This patch also includes security fixes affecting private-network host matching, file rendering, Actions pre-execution errors, and dependencies. ([releases](https://forgejo.org/releases/), [16.x releases](https://forgejo.org/releases/16.x/), [16.0.2 release notes](https://codeberg.org/forgejo/forgejo/src/branch/forgejo/release-notes-published/16.0.2.md), [v16 announcement](https://forgejo.org/2026-07-release-v16-0/))                      | Adds useful authentication and Actions APIs, but creates an immediate quarterly upgrade obligation. Pin the exact supported patch.          |
| Forgejo Runner            | The official release API reported `v13.0.0`, published 2026-08-03. Its release introduced breaking changes, removed legacy workflow commands and Gitea compatibility, raised the Docker minimum to 25, and included security-related checkout fixes. ([release API](https://data.forgejo.org/api/v1/repos/forgejo/runner/releases/latest), [v13 announcement](https://forgejo.org/2026-08-runner-release-v13/))                                                                                                   | The brief must pin and test the runner separately from the Forgejo server. “Forgejo 15 LTS” does not pin the execution engine.              |
| Forgejo API compatibility | Forgejo documents API compatibility within a major line and permits breaking API changes between major versions. The instance OpenAPI document is exposed at `/swagger.v1.json`. ([API usage](https://forgejo.org/docs/v15.0/user/api-usage/), [v15 OpenAPI](https://v15.next.forgejo.org/swagger.v1.json))                                                                                                                                                                                                       | Generate or test clients against the pinned v15 schema; rerun contract tests before every major upgrade.                                    |

### v15 versus v16 for the pilot

The LTS recommendation remains sound only if the first pilot does not depend on v16-only features. Two relevant v16 additions are:

- Authorized Integrations for short-lived JWT-authenticated Forgejo Git/API access; and
- API endpoints for downloading workflow/job logs and listing/downloading/deleting Actions artifacts, plus workflow-run cancellation. ([v16 announcement](https://forgejo.org/2026-07-release-v16-0/))

Neither is required if a separate Gate Service owns credentials, captures results outside the untrusted execution boundary, and writes durable evidence directly to the Factory store. If the design instead makes Forgejo Actions the evidence-export and short-lived-auth backbone, the v15 LTS decision must be revisited explicitly.

## Capability assessment

### 1. Private Git, permissions, and protected refs

Forgejo supports private repositories and collaborator roles `Read`, `Write`, `Administrator`, and `Owner`. `Write` can push and merge; `Administrator` can configure branch settings; `Owner` alone controls destructive repository settings. Organization teams can have unit-specific permissions, including separate Code and Actions access. ([repository permissions](https://forgejo.org/docs/v15.0/user/collaboration/repo-permissions/))

Forgejo v15 also supports tokens restricted to selected repositories. A selected-repository token can use only `read:repository`, `write:repository`, `read:issue`, and `write:issue`, and cannot perform repository-administration operations. ([access-token scopes](https://forgejo.org/docs/v15.0/user/authentication/token-scope/))

The v15 OpenAPI schema exposes:

- `GET|POST /repos/{owner}/{repo}/branch_protections`;
- `GET|PATCH|DELETE /repos/{owner}/{repo}/branch_protections/{name}`;
- protection fields for applying rules to administrators, push and merge allowlists, required approvals, signed commits, protected file patterns, status-check contexts, stale/rejected review behavior, and force-push posture; and
- commit-status creation and combined-status reads. ([v15 OpenAPI](https://v15.next.forgejo.org/swagger.v1.json))

This is enough to implement exact branch rules for `develop`, `production`, and frozen cell branches. It is not enough to make a database field named `code_authority` true in practice. Actual authority must be enforced jointly by branch protections, removal of writer leases, credential reachability, and negative tests showing that the former writer can no longer push.

Recommended credential split:

- human administrators: MFA, no routine automation use;
- Upstream Sync Service: narrowly held Forgejo write credential, able to update only allowlisted base refs through service policy;
- Git Coordination Service: selected-repository Forgejo write token, never exposed to Codex or candidate processes;
- worker/reviewer clones: read-only identity where private fetch is needed;
- local Gate Service: no candidate-visible write token; any status-writing token stays outside the candidate guest;
- Publication Service: no standing GitHub token; mint a short-lived installation token only for a publication attempt.

Forgejo v15 repository-specific tokens reduce blast radius but remain static secrets. They require rotation, revocation, and audit outside Forgejo. Do not claim v16 Authorized Integration behavior on the v15 line.

### 2. Actions and runner trust

Forgejo Actions is an RCE system by design. A repository-scoped runner is the narrowest registration scope, and v15 supports ephemeral runners that accept at most one job before Forgejo removes their registration. Forgejo notes that an ephemeral runner may wait indefinitely before it receives that one job, and only `forgejo-runner one-job` can be used in ephemeral mode. ([runner registration](https://forgejo.org/docs/v15.0/admin/actions/registration/), [Actions deployment security](https://forgejo.org/docs/v15.0/admin/actions/security/))

Ephemeral **registration** is not the same as ephemeral **compute**. The Factory must still destroy or reimage the runner VM, workspace, caches, Docker/LXC state, and any job-local credentials after the job. A persistent VM with a newly registered ephemeral runner can retain hostile state.

The brief correctly rejects host execution, privileged jobs, shared production secrets, and colocating Forgejo with a broadly privileged runner. Forgejo says:

- a host label has no isolation;
- privileged job containers can compromise host confidentiality, integrity, and availability;
- mounted volumes must be treated as readable and mutable by workflow code;
- a shared Docker socket allows jobs to inspect or mutate host containers and mount the host filesystem; and
- a dedicated VM removes many host-level risks, while LXC offers stronger Docker isolation but lacks service-container support. ([runner configuration](https://forgejo.org/docs/v15.0/admin/actions/configuration/), [Docker access](https://forgejo.org/docs/v15.0/admin/actions/docker-access/), [Actions deployment security](https://forgejo.org/docs/v15.0/admin/actions/security/))

The missing control is workflow authority. Forgejo explicitly warns that protecting the default branch does not stop a user with branch-push permission from creating another branch containing a matching `on: push` workflow. ([Actions deployment security](https://forgejo.org/docs/v15.0/admin/actions/security/#preventing-arbitrary-workflow-execution))

The v15 automatic workflow token compounds the risk: every step receives `FORGEJO_TOKEN`/`GITHUB_TOKEN`; it is restricted to the workflow's repository but has write permission there and can push commits or call write APIs. `actions/checkout` also persists credentials unless configured otherwise. ([automatic token](https://forgejo.org/docs/v15.0/user/actions/basic-concepts/#automatic-token), [workflow security notes](https://forgejo.org/docs/v15.0/user/actions/reference/#onpull_request_target))

#### Required correction to the brief's local-CI model

Do not enable Actions directly on the agent-writable Core staging repository. Use one of these patterns:

1. **External Gate Service:** the Factory scheduler dispatches a trusted gate definition outside the staging repository. A supervisor fetches the exact candidate SHA, removes/revokes fetch credentials, and executes the candidate in a disposable guest with a sanitized environment.
2. **Dedicated CI-control repository plus a second execution boundary:** only humans/control-plane services can write its workflow branch. A repository-scoped, one-job runner executes a trusted wrapper. The wrapper launches untrusted candidate code in a disposable VM/microVM that cannot access the outer job's `FORGEJO_TOKEN`, runner token, host network, or caches.

Merely dispatching `local-publication.yml@develop` in the staging repository is insufficient because arbitrary candidate workflows can still run on the same repository runner pool and the candidate can attempt to forge statuses, consume capacity, poison caches, or attack shared resources.

For both patterns:

- run one job per disposable compute instance;
- never use `host`, `container.privileged`, or host Docker-socket automount;
- pin runner, container, VM image, and action references by digest/SHA;
- do not place private registry credentials on an untrusted runner host;
- use capacity `1` when any Docker-in-Docker state is shared;
- prefer whole-VM destruction for high-risk tests;
- block management networks, Proxmox, worker credentials, Buzz, production product services, and Factory service-role interfaces;
- treat caches only as untrusted performance hints; and
- hash the gate definition, runner image, candidate SHA, Contract Pack, and produced evidence.

### 3. Statuses, checks, and what counts as evidence

Forgejo v15 can create statuses with `POST /repos/{owner}/{repo}/statuses/{sha}` and read individual or combined status for a commit/ref. A status includes context, state, target URL, timestamps, and creator. Branch protection records required status contexts as strings. ([v15 OpenAPI](https://v15.next.forgejo.org/swagger.v1.json))

That last detail matters: the v15 branch-protection schema names status contexts but does not bind a required context to a specific App identity. Because an in-repository Actions token has write permission, a malicious workflow may be able to publish a success status with the expected context. Therefore:

- a Forgejo status is useful UI and scheduling data, not self-authenticating publication authority;
- the Publication Service must verify the status creator, exact SHA, gate-definition SHA, runner identity/image digest, durable evidence hash, and the separate Factory Gate Service record;
- the Gate Service's status credential must never enter the untrusted candidate guest; and
- local evidence must remain outside the repository's write trust domain.

GitHub provides separate commit-status and Checks APIs. Commit statuses require `Commit statuses: write`; creating a check run requires a GitHub App with `Checks: write`. ([GitHub commit statuses](https://docs.github.com/en/rest/commits/statuses#create-a-commit-status), [GitHub check runs](https://docs.github.com/en/rest/checks/runs#create-a-check-run))

The Publication App should **not** receive either permission for the first pilot. Local Forgejo evidence should be linked in the PR as informational evidence, while GitHub Actions reruns the formal required checks. This prevents the publication credential or compromised local factory from minting the formal GitHub merge signal. If an informational GitHub check is later desired, use a separate evidence-only App and reserve context names that can never satisfy required merge checks.

### 4. Webhooks and reconciliation

Forgejo repository webhooks support a shared secret and `X-Forgejo-Signature`, computed with HMAC-SHA256. The UI supports test delivery and recent-delivery inspection. An optional authorization header is stored encrypted in the Forgejo database. ([Forgejo webhooks](https://forgejo.org/docs/v15.0/user/repository/webhooks/))

The Factory bridge should:

- verify the signature over the raw, unmodified request body before parsing;
- require an allowlisted event type and repository identity;
- assign its own idempotency key from delivery identity plus event coordinates;
- store the raw-event hash, normalized event, old/new SHA, receipt time, verification result, and processing outcome;
- make processing replay-safe; and
- periodically reconcile Forgejo refs, action runs, and statuses through the API because webhook delivery is not durable state.

After publication, the equivalent GitHub listener should verify `X-Hub-Signature-256`. GitHub exposes recent deliveries and redelivery APIs, but GitHub documents only a three-day delivery-inspection/redelivery window and does not automatically redeliver failures. ([validating GitHub webhooks](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks#failed-signature-verification), [delivery history](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/viewing-webhook-deliveries), [redelivery behavior](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/redelivering-webhooks))

Webhooks are notifications, not authority. The current ref and the durable Factory action ledger win when an event is missing, duplicated, delayed, or out of order.

### 5. Mirroring and Git semantics

The brief is correct to reject Forgejo's built-in push mirror for canonical Core publication. Forgejo documents that a push mirror force-pushes the destination and can overwrite remote changes. With no branch filter it uses `git push --mirror`; with a filter it periodically or synchronously pushes matching branches. The mirror stores a destination credential and is intentionally continuous rather than a one-shot authority transfer. ([repository mirrors](https://forgejo.org/docs/v15.0/user/repo-mirror/))

Those semantics violate the desired post-publication invariant: GitHub repairs could later be overwritten by a still-active Forgejo mirror. A branch filter reduces the ref set but does not change the authority problem.

The built-in pull mirror is also unsuitable for the writable staging repository. Forgejo permits pull-mirror configuration only when the repository is created, and the mirror is meant to track an upstream rather than host locally authored unpublished branches. Use a controlled Upstream Sync Service that fetches allowlisted GitHub refs and fast-forwards protected Forgejo base refs only. Divergence must fail closed; it must never trigger a force update. ([repository mirrors](https://forgejo.org/docs/v15.0/user/repo-mirror/))

### 6. Audit, export, backup, and recovery

Forgejo Actions stores job logs and artifacts on the Forgejo server. Its v15 defaults are 365 days for job logs and 90 days for artifacts, while cache remains runner-local. ([Actions administrator guide](https://forgejo.org/docs/v15.0/admin/actions/))

These records are operational evidence, not an immutable audit ledger. The v15 documentation and OpenAPI reviewed here expose logs, action runs, webhooks, statuses, and operational server logging but no dedicated append-only audit API. Forgejo v16 additionally permits administrators or `write:repository` tokens to remove completed workflow runs through UI/API. ([v15 OpenAPI](https://v15.next.forgejo.org/swagger.v1.json), [logging](https://forgejo.org/docs/v15.0/admin/troubleshooting/logging/), [v16 announcement](https://forgejo.org/2026-07-release-v16-0/))

Therefore export durable evidence during the run, not at retention expiry:

- exact candidate and base SHAs;
- workflow/gate definition SHA;
- runner and VM image digests;
- command manifest and environment profile;
- structured exit results and classifications;
- selected logs and artifacts with hashes;
- status creator and target URL;
- webhook delivery/event coordinates;
- publication attempt/action records; and
- off-host Git bundle/checkpoint.

Forgejo's upgrade guide says the reliable backup is a synchronized point-in-time snapshot of all Forgejo storage. When database, repositories, object storage, and queues are split, shutting down Forgejo may be the only way to make the backup consistent. The guide also warns that the database copy in `forgejo dump` has serious long-standing restore bugs and recommends a separate PostgreSQL/MySQL dump. ([upgrade and backup guide](https://forgejo.org/docs/v15.0/admin/upgrade/))

The backup set must include:

- PostgreSQL;
- repository Git storage, LFS, attachments/packages, Actions logs and retained artifacts where required;
- `app.ini`, secrets/encryption material, SSH host keys, and service certificates;
- webhook, branch-protection, status, and runner-control metadata represented in the database;
- independent off-host cell Git bundles; and
- Infrastructure-as-Code and runner/gate image manifests stored outside the failed host.

`forgejo dump` is supplementary, not the sole backup. A Git clone or bundle restores source objects but not Forgejo metadata. `dump-repo`/`restore-repo` can move selected repository units but are not a full instance-recovery plan. ([Forgejo CLI](https://forgejo.org/docs/v15.0/admin/command-line/))

Recovery acceptance must prove more than “the web UI starts”:

1. restore to an isolated replacement environment;
2. run `forgejo doctor check --all`;
3. verify protected-branch configuration and service identities;
4. verify exact base and unpublished-cell refs;
5. verify Actions/gate evidence links and webhook configuration;
6. restore one encrypted cell bundle and reproduce its candidate SHA; and
7. prove a frozen branch remains non-writable before declaring recovery complete.

## Exact one-way authority-handoff contract

### Invariants

For one logical cell branch, exactly one of these states may be writable:

```text
prepublication: Forgejo writable, GitHub ref absent
publication_frozen: Forgejo non-writable, GitHub ref absent
published: Forgejo non-writable, GitHub ref writable through the GitHub Operator
```

`code_authority` is a durable projection of those enforced facts, not the enforcement mechanism itself.

### Preconditions for freeze

The Publication Service must verify:

1. the cell and writer lease are current and owned as expected;
2. Forgejo base equals the Contract Pack's accepted GitHub base SHA;
3. Forgejo cell head equals the candidate SHA referenced by every required report;
4. the trusted Gate Service record is valid for the exact candidate, contract, gate, and runner-image hashes;
5. the off-host encrypted bundle exists and reproduces the candidate SHA;
6. no gate or writer job remains capable of updating the branch; and
7. the destination GitHub ref is absent.

Freeze then revokes/releases the writer lease, applies an exact Forgejo protection rule that also applies to administrators, removes service write reachability for the cell, and verifies a former writer's push is rejected. The service records the branch-protection snapshot and ref SHA. A changed Forgejo head invalidates the attempt.

### Publication action

Use a fresh promotion clone and fetch the candidate from Forgejo before minting GitHub credentials. Mint a GitHub App installation token narrowed to the Core repository and the current attempt. GitHub installation tokens expire after one hour and can be further narrowed by repository and permission. HTTP Git access requires `Contents`; changing `.github/workflows/**` also requires `Workflows`. ([installation token](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app), [Git permission selection](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app#choosing-permissions-for-git-access))

Push one non-force refspec:

```text
<approved-candidate-sha>:refs/heads/factory/<issue>-<slug>
```

Do not push tags, base branches, namespaces, notes, or any mirror ref. Refuse publication if the destination branch exists. GitHub's ref API supports reading, creating, and non-force updating refs; create/update requires `Contents: write`, optionally with `Workflows: write` when workflow files are involved. An update defaults to fast-forward when `force` is omitted or false. ([GitHub refs API](https://docs.github.com/en/rest/git/refs))

After the Git push:

1. read the GitHub ref through the API;
2. require its object SHA to equal the approved candidate SHA;
3. create the issue-linked PR with a separately scoped PR permission;
4. append the successful GitHub action and response to the Factory action ledger;
5. compare-and-set the cell from `publication_frozen` to `github_published` using the candidate SHA and attempt ID;
6. revoke/discard the installation token; and
7. permit all later repair writes only through the GitHub Operator.

Do not grant the Publication App `Checks: write` or `Commit statuses: write` for the pilot.

### Reconciliation rules

| Observation after an uncertain action                             | Required behavior                                                                                                           |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| GitHub ref absent; Forgejo head still frozen at expected SHA      | Retry the same idempotent publication attempt or cancel the freeze explicitly. Do not create a new candidate implicitly.    |
| GitHub ref exists at the expected SHA; Factory state still frozen | Complete PR/state reconciliation. Do not push again and do not reopen Forgejo writes.                                       |
| GitHub ref exists at another SHA                                  | Quarantine and require human investigation. Never overwrite or force-push it.                                               |
| Forgejo head changed after freeze; GitHub ref absent              | Invalidate the attempt and all gate evidence. Diagnose how the freeze was bypassed.                                         |
| Forgejo head changed after freeze; GitHub ref exists              | Treat as a dual-authority security incident. Freeze both automated writers and escalate.                                    |
| GitHub branch exists but PR creation failed                       | Keep the exact branch, reconcile/create the PR idempotently, and leave Forgejo frozen.                                      |
| Factory state and remote facts disagree                           | Remote refs plus the append-only action ledger are reconciliation inputs; fail closed until one consistent state is proven. |

There is no safe “blind retry” and no normal force-push path.

## Core's current GitHub authority posture

Read-only GitHub API observations on 2026-08-12 found:

- the repository is public and its default branch is `develop`;
- repository rulesets returned an empty list;
- `develop` protection applies to administrators, blocks force pushes/deletion, requires one approving review with stale dismissal, and requires strict GitHub Actions checks `ci-gate`, `e2e-smoke-gate`, `migrate`, and `smoke`;
- `production` protection applies to administrators, blocks force pushes/deletion, has no required review in the returned protection object, and requires strict GitHub Actions checks `ci-gate`, `e2e-gate`, `release-source-gate`, `migrate`, `smoke`, and `e2e-smoke-gate`; and
- repository auto-merge is disabled.

The Asymmetric-al organization now reports the GitHub Team plan. Its private `asym-factory` repository proves the useful custody controls are available: protected `main` applies to administrators, requires one independent approving review of the latest push with stale-review dismissal, requires linear history, blocks force pushes and deletion, and permits squash merge only. This is the right long-term authority posture for private Factory planning and control repositories. It does not make Forgejo CI evidence authoritative for Core merges and does not remove the need to reconcile Core's live required checks.

This live configuration does not match the checked-in rulebook, which says `develop` requires `ci-gate` and `integration-gate`, and `production` requires `ci-gate`, `integration-gate`, and `e2e-gate` (`docs/ai/rules/testing.md`, `docs/ci.md`). It also provides no live ruleset evidence for the brief's references to rulesets. The first factory pilot must treat this protection drift as a prerequisite reconciliation, not assume the architecture brief describes current GitHub enforcement.

GitHub can bind required checks to a specific App; the live required-check objects use GitHub Actions App ID `15368`. Preserve that identity binding for formal merge gates. Do not reuse those context names for local Forgejo evidence.

## August 3 brief: claim-by-claim disposition

| Brief claim or recommendation                                                  | Disposition                                      | Current evidence and required change                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Forgejo 15 LTS, latest patch                                                   | **LTS line confirmed; patch claim stale**        | The brief's `15.0.5` and `16.0.1` observations are stale. Current releases are `15.0.6` LTS and `16.0.2`; both arrived on July 30 with security fixes, and v16 retains the shorter support window. Pin the latest supported patch and monitor release drift. |
| Dedicated Forgejo VM; separate runner VM                                       | **Confirmed**                                    | Matches Forgejo's own recommendation to isolate runners from critical services.                                                                                                                                                                              |
| Private instance, closed registration, MFA, service identities                 | **Confirmed with implementation proof required** | Supported by configuration and permission model; MFA/service-account operational controls need verification and recovery drills.                                                                                                                             |
| Ordinary writable repository, not pull mirror                                  | **Confirmed**                                    | Pull mirrors are configured only at creation and do not fit local authored branches.                                                                                                                                                                         |
| Never configure automatic Forgejo-to-GitHub push mirror                        | **Confirmed strongly**                           | Push mirrors are continuous and force-pushing; a filter does not make them an authority-transfer primitive.                                                                                                                                                  |
| One exact-SHA Publication Service push                                         | **Confirmed**                                    | Normal Git push plus GitHub ref verification is the right primitive. It still needs a cross-system state machine and reconciliation.                                                                                                                         |
| Forgejo cell branch frozen before GitHub becomes authoritative                 | **Confirmed but order must be enforced**         | The freeze must remove writer reachability and be negatively tested before GitHub credentials are minted.                                                                                                                                                    |
| Prefer Authorized Integrations on Forgejo 15                                   | **Reopened / incorrect version assumption**      | Inbound Authorized Integrations arrived in v16. v15 needs scoped static tokens or an external credential broker.                                                                                                                                             |
| Actions enabled on the agent-writable Core staging repository                  | **Reopened / unsafe**                            | Any branch writer can add an arbitrary push workflow. Disable Actions there or create a separate workflow-authority boundary.                                                                                                                                |
| Protected `develop` workflow dispatched against candidate SHA is sufficient    | **Reopened / incomplete**                        | It protects the selected workflow definition, but does not prevent other candidate-authored workflows, writable auto tokens, cache poisoning, or runner attacks. Execute candidate code in a second disposable boundary with no outer token.                 |
| Repository-scoped, ephemeral, containerized runner with capacity 1             | **Confirmed as baseline, not sufficient**        | Ephemeral registration does not destroy compute; containers do not protect a shared Docker socket/host; candidate code remains untrusted.                                                                                                                    |
| Forgejo commit status can represent local CI                                   | **Confirmed as informational**                   | Contexts are not App-bound in v15 branch protection; publication must verify external Gate Service evidence and status creator, not context alone.                                                                                                           |
| Forgejo logs/artifacts plus selected durable copies                            | **Confirmed with v15 export limitation**         | v15 retains logs/artifacts but v16 adds the documented download APIs. Capture evidence from the Gate Service directly on v15.                                                                                                                                |
| Export audit and security logs                                                 | **Reopened / underspecified**                    | Forgejo provides operational logs, runs, events, and statuses but no reviewed append-only audit ledger. The Factory must create one externally.                                                                                                              |
| Off-host VM, PostgreSQL, repository, config, SSH-key backups and restore drill | **Confirmed strongly**                           | Use synchronized backups and separate PostgreSQL dumps; `forgejo dump` alone is insufficient.                                                                                                                                                                |
| GitHub required checks/rulesets/merge queue are the formal merge authority     | **Destination confirmed; current state drifted** | Formal checks must rerun on GitHub, but live Core has no repo rulesets and its protection checks differ from repo documentation. Reconcile before pilot merge.                                                                                               |

## Wayfinder decisions still required

Research supports, but does not settle, these choices:

1. Choose **v15 LTS plus external Gate Service** or accept the v16 upgrade cadence for Authorized Integrations and richer Actions evidence APIs.
2. Choose whether the first pilot uses Forgejo Actions only as a protected outer dispatcher or avoids it entirely for candidate execution.
3. Define the disposable execution boundary: dedicated throwaway VM, microVM, LXC profile, or another proven isolation mechanism.
4. Define the Factory's signed/durable Gate Result and append-only Action Record formats.
5. Define exact Forgejo branch-freeze rules and service-identity permissions, including negative authorization tests.
6. Define GitHub App separation: Publication, PR Operator, post-publication Repair, and any optional evidence/check App.
7. Reconcile live GitHub protection with checked-in CI policy before selecting the pilot's merge path.
8. Set backup RPO/RTO, evidence retention, and the mandatory restore-drill cadence.

## Proposed domain vocabulary

These are research-grade candidate terms, not yet a ratified `CONTEXT.md` glossary:

- **Code Authority:** the forge whose active logical branch can presently accept authorized writes.
- **Workflow Authority:** the protected source that defines which gate code is allowed to judge a candidate. It must be outside the candidate's write domain.
- **Gate Service:** the trusted controller that binds a protected gate definition to an exact candidate and records evidence outside the candidate's trust domain.
- **Candidate Guest:** the disposable compute boundary that executes untrusted repository code with no forge token or factory secret.
- **Publication Freeze:** an enforced state in which Forgejo can no longer accept writes for the cell and GitHub has not yet become writable.
- **Authority Handoff:** the reconciled, idempotent transition from a frozen Forgejo ref to an exact GitHub ref plus durable Factory state.
- **Formal Merge Evidence:** GitHub-hosted checks/reviews bound to the current GitHub SHA; local prepublication evidence does not substitute for it.
- **Recovery Checkpoint:** an off-host, integrity-verified bundle sufficient to reproduce an unpublished candidate independently of Forgejo's availability.

## Primary sources

### Forgejo

- [Current releases](https://forgejo.org/releases/)
- [Release schedule and support windows](https://forgejo.org/docs/latest/admin/release-schedule/)
- [Forgejo 15.x LTS releases](https://forgejo.org/releases/15.x/)
- [Forgejo v16 announcement and feature delta](https://forgejo.org/2026-07-release-v16-0/)
- [Current Forgejo Runner release API](https://data.forgejo.org/api/v1/repos/forgejo/runner/releases/latest)
- [Forgejo Runner v13 announcement](https://forgejo.org/2026-08-runner-release-v13/)
- [Forgejo v15 OpenAPI schema](https://v15.next.forgejo.org/swagger.v1.json)
- [Branch and tag protection](https://forgejo.org/docs/v15.0/user/repository/protection/)
- [Forgejo 15.0.6 release notes](https://codeberg.org/forgejo/forgejo/src/branch/forgejo/release-notes-published/15.0.6.md)
- [Forgejo 16.0.2 release notes](https://codeberg.org/forgejo/forgejo/src/branch/forgejo/release-notes-published/16.0.2.md)
- [Repository permissions](https://forgejo.org/docs/v15.0/user/collaboration/repo-permissions/)
- [Access-token scopes](https://forgejo.org/docs/v15.0/user/authentication/token-scope/)
- [Actions deployment security](https://forgejo.org/docs/v15.0/admin/actions/security/)
- [Runner registration and ephemeral mode](https://forgejo.org/docs/v15.0/admin/actions/registration/)
- [Runner configuration](https://forgejo.org/docs/v15.0/admin/actions/configuration/)
- [Docker access and isolation tradeoffs](https://forgejo.org/docs/v15.0/admin/actions/docker-access/)
- [Actions automatic token](https://forgejo.org/docs/v15.0/user/actions/basic-concepts/#automatic-token)
- [Actions workflow reference](https://forgejo.org/docs/v15.0/user/actions/reference/)
- [Repository webhooks](https://forgejo.org/docs/v15.0/user/repository/webhooks/)
- [Repository mirrors](https://forgejo.org/docs/v15.0/user/repo-mirror/)
- [Actions log/artifact retention](https://forgejo.org/docs/v15.0/admin/actions/)
- [Upgrade, backup, and recovery guidance](https://forgejo.org/docs/v15.0/admin/upgrade/)
- [Forgejo CLI dump/doctor/repository export](https://forgejo.org/docs/v15.0/admin/command-line/)

### GitHub

- [Git reference API](https://docs.github.com/en/rest/git/refs)
- [Choosing GitHub App permissions](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)
- [Installation access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)
- [Commit statuses API](https://docs.github.com/en/rest/commits/statuses)
- [Check runs API](https://docs.github.com/en/rest/checks/runs)
- [Rulesets and bypass actors](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Validating webhook deliveries](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks#failed-signature-verification)
- [Webhook delivery history](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/viewing-webhook-deliveries)
- [Webhook redelivery behavior](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/redelivering-webhooks)
