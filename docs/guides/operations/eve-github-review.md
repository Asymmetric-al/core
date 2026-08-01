# Eve GitHub review operations

The Eve GitHub review channel is implemented but remains inert while the global
Eve release switch is off. Configure and verify it before launch; do not enable
release as part of setup.

## GitHub App permissions

Grant the smallest repository permission set for #430:

- Metadata: read (implicit GitHub App repository metadata)
- Contents: read (PR ref and base checkout)
- Pull requests: write (one `COMMENT` review containing summary and inline
  findings)

Subscribe the App to `pull_request`, `issue_comment`, and
`pull_request_review_comment`. Point the webhook at
`https://<eve-runtime-host>/eve/v1/github`.

Do not grant Actions, Checks, Issues, Administration, Deployments, Environments,
Secrets, or Workflows write permissions for #430. Later GitHub operations must
arrive through their separately reviewed slices.

## Runtime configuration

Preferred hosted configuration uses Vercel Connect as described by the
installed Eve 0.25.1 GitHub-channel documentation. Set
`EVE_GITHUB_CONNECT_UID` to the attached connector UID; Core then delegates
installation-token rotation and inbound verification to Connect. Direct GitHub
App credentials are the supported fallback through server-only values:

- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_APP_SLUG` (or `EVE_GITHUB_APP_SLUG` as the display override)
- `EVE_GITHUB_TENANT_ID`
- `EVE_GITHUB_ACTOR_PROFILE_ID`

The tenant and profile IDs must identify the platform-owned profile whose
policy budget is charged. They never replace the verified GitHub sender: every
audit retains that sender as the accountable initiator.

The runtime also requires the existing Supabase server configuration so it can
read governance and persist #419/#423 records. No GitHub credential, Supabase
service-role value, or environment file is mounted into the sandbox.

## Verification before release

1. Run `bun run --cwd packages/eve-runtime info` and confirm `channels/github.ts`
   resolves to `/eve/v1/github` with zero discovery diagnostics.
2. Run `bun run --cwd packages/eve-runtime build`.
3. Deliver a signed `ping`; expect a successful acknowledgement and no model
   turn.
4. With release off, deliver a signed PR event; expect no GitHub review and a
   blocked governance decision.
5. In a non-production verification environment with every required gate
   deliberately enabled, use a synthetic PR containing one ordinary file and
   one protected path. Confirm one bot `COMMENT` review contains the summary,
   inline finding, visible protected-area scan, and accountable sender.
6. Confirm #419 contains started/succeeded records with the bot actor, GitHub
   sender initiator, review role, head SHA, policy result, and fingerprints but
   no review text.
7. Enable `github_actions`, `all_automation`, or emergency-off and confirm the
   next trigger produces no review.
8. Redeliver the same event/turn and confirm the durable review marker prevents
   a duplicate.

## Emergency response

Set the global emergency stop or `disable GitHub actions` in Mission Control.
If the runtime itself must be isolated, disable the Vercel deployment or detach
the GitHub App trigger. Dismiss an incorrect bot review in GitHub; no #430 path
can merge or modify PR state.
