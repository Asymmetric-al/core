# Eve GitHub operator operations

The #431 operator is implemented but remains inert while Eve's master release
switch is off. Do not enable release as part of setup.

## GitHub App permissions

In addition to #430's review permissions, grant only the permissions required
by the seven allowed operations:

- Contents: write — create branches and non-force safe-fix commits
- Issues: write — create issues and add labels
- Pull requests: write — open PRs and set PR state
- Actions: write — rerun failed workflow jobs
- Metadata: read — repository and installation context

Do not grant Administration, Deployments, Environments, Members, Organization,
Secrets, or Workflows write permissions. The operator has no merge endpoint and
must not receive a branch-protection bypass.

## Runtime configuration

Use #430's existing GitHub App, tenant-linked service principal, Vercel Connect
connector or direct server-only App credentials, and Supabase governance store.
No new secret belongs in the sandbox. Direct credentials use `GITHUB_APP_ID`
and `GITHUB_APP_PRIVATE_KEY`; the existing webhook channel retains its verifier
configuration.

Apply the Supabase migration that registers
`engineering.github_operation.write` and the dedicated `github-operator` hard
budget. Confirm the engineering trust-zone policy is explicitly configured
before any controlled verification.

## Verification before release

1. Build the runtime and confirm `github_operator` is a dynamic tool with no
   discovery diagnostics.
2. In an unauthenticated, admin, or non-Core session, confirm the tool is absent.
3. With release off, submit every operation and confirm GitHub is unchanged and
   governance records `release_disabled`.
4. In a controlled repository installation, create an issue, then an
   `eve/issue-<number>-<slug>` branch, push one ordinary text fix, and open a
   non-draft PR containing `Closes #<number>`.
5. Confirm labels, one failed-job rerun, and PR close/reopen work under policy.
6. Confirm a direct branch/PR without an issue, business-data text, a sensitive
   path, an undeclared sandbox path, and a protected path without approval are
   each withheld.
7. Confirm product-direction work without an `openspec/` change is withheld.
8. Redeliver each durable operation and confirm no duplicate issue, branch, PR,
   commit, or workflow attempt is created.
9. Confirm #419 audit identifies the bot, verified sender, operation, policy,
   stable evidence, and outcome without storing source or issue contents.

## Emergency response and rollback

Enable `disable GitHub actions`, the global automation kill switch, or the
emergency stop. If necessary, disable the runtime deployment or suspend the
GitHub App installation. Close an incorrect issue or PR, remove incorrect
labels, and revert an incorrect commit through the normal reviewed GitHub flow.
Never force-update an Eve branch as recovery. Revoke the operator permissions
to return the App to #430's read-and-review posture.
