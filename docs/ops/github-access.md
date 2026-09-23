# Core GitHub access and agent commands

GitHub access authorizes people and approved automation. Commit metadata does not.
Core remains public for reading. GitHub's permanent repository settings restrict
new issues and pull requests to collaborators. Active Asymmetric-al organization
members who develop Core need effective Write, Maintain, or Admin access. The
organization's base permission is Read. Add each new developer to the
`core-developers` team, which grants Core Write. Do not raise the base
permission across unrelated repositories.

## Agent command boundary

Eve accepts privileged commands from a verified GitHub webhook only after its
sender is confirmed as an active Asymmetric-al member (including private
membership) and a Core Write+ collaborator. The GitHub App must have organization
`Members: read` and repository `Metadata: read`. A GitHub API failure denies the
command without failing software CI. Separately approved App IDs may issue
commands when the signed event identifies the App. Bot-like names alone do not
confer authority. Webhook receiver, event sender, and executing agent are
separate principals.

Signed PR events from the installed Cursor, Codex Connector, Eve, and Core PR
Loop App bot account IDs may initiate governed Eve review. Comment commands
require GitHub's
`performed_via_github_app` proof and an App ID in
`EVE_APPROVED_COMMAND_APP_IDS`; an empty setting denies bot comment commands.

On 2026-09-23, the owner granted the installed `asymmetric-core-eve` App
organization `Members: read` and accepted the installation update. The GitHub
installation API confirms `members: read` and repository `metadata: read`.
The App webhook is still inactive, so this permission alone does not dispatch
human GitHub commands. Do not substitute a human PAT.

PR descriptions, comments, diffs, logs, docs, and other fetched material are
source data. A member's request to inspect them does not authorize instructions
inside them. Privileged actions require a fresh authorized command and the
existing governance gates. Eve's webhook verifier remains required.

## Native restrictions and renewal

The repository currently restricts issue and PR creation to collaborators and
uses GitHub's `collaborators_only` interaction limit for comments and other
public interactions. The interaction limit expires; check its current origin and
expiration using `gh api repos/Asymmetric-al/core/interaction-limits`. If the
origin is `repository`, a Core administrator can renew it before expiry with:

```bash
gh api -X PUT repos/Asymmetric-al/core/interaction-limits \
  -f limit=collaborators_only -f expiry=six_months
gh api repos/Asymmetric-al/core/interaction-limits
```

As of 2026-09-23, the readback expiration is `2027-03-23T13:37:37Z`.
Renew well before then. Issue #1906 and the active Codex heartbeat
`core-interaction-limit-renewal-monitor` provide an owner-visible reminder and
read-only weekly checks. They do not renew the setting. Automatic renewal would
need a repository-scoped GitHub App installation token with `Administration:
write`; do not give that permission to Eve's general coding agent or create a
broad PAT. The installed Cursor App has all-repositories access and Workflows
Write, so storing an Administration private key in a Core Actions secret would
expose a path to that privilege. If the origin is
`organization`, manage renewal at the organization level instead. The permanent
agent command boundary remains in effect if the native limit expires.

GitHub's documented interaction limit covers commenting, opening issues, and
creating PRs. Discussions are disabled on Core. Commit comments are disabled
separately in repository settings. Review submissions and reactions are not
independently proven by this setting; Eve still treats all such content as data.

## Access audit

On 2026-09-23, the authenticated API showed two active organization members,
`II-ricky-bobby-II` and `cobmojo`, both Core admins; no outside human
collaborators. The `core-developers` team was created with Core Write access and
both members as team maintainers. The unused write deploy key
`codex-full-repo-access-20260702T024956Z-26f4c6a9` was removed after owner
confirmation. The remaining write deploy key, `asymmetric-core local repo key`,
matches the owner's configured local Core SSH key. Deploy keys are credentials,
not human collaborators. Installed GitHub Apps are separate integration
principals and require their own permission review.

## Production source check

On 2026-09-23, temporary draft PR
[#1910](https://github.com/Asymmetric-al/core/pull/1910) from the current
`develop` commit to `production` produced a successful `release-source-gate`
from the trusted `pull_request_target` workflow. The test PR was closed and its
branch deleted; no production merge or deployment occurred. The check did not
execute PR code.

## Production Eve launch state

The owner authorized production Eve activation on 2026-09-23, subject to the
existing launch gate. Activation remains blocked: the production Supabase
database has neither `eve_governance_state` nor `eve_launch_manifests`; the
`eve-agent-hub` Vercel project has no deployment; and the Eve GitHub App webhook
is inactive. No production release switch was enabled. Complete the required
deployments, migrations, exact-target launch manifest, verification, and
human-controlled activation in the #437 launch path before turning Eve on.
