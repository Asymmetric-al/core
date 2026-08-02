# ADR-0063: Use Eve's native GitHub channel for governed PR reviews

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #430

**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022, ADR-0024,
ADR-0026, and ADR-0030

## Context

Eve must automatically review pull requests and publish a decision summary plus
inline findings. This is the first Eve slice that writes to an external
collaboration surface. It therefore needs authenticated ingress, an accountable
bot identity, bounded repository context, policy and budget authorization,
data-boundary enforcement, audit, and a narrow GitHub permission set.

The installed Eve 0.25.1 package already provides a GitHub App channel. It
verifies webhooks, exchanges installation credentials outside the sandbox,
loads bounded PR metadata and patches, checks out the exact PR ref through the
sandbox firewall, and rebuilds GitHub API handles from durable channel state.
Reimplementing those mechanics in Core would create a second security boundary.

## Decision

Core authors Eve's native `githubChannel` at `/eve/v1/github`. It opts into
`pull_request` events for opened, reopened, synchronized, and ready-for-review
PRs. Bot mentions in PR timelines and review threads may also request a review.
Issue-only conversations are excluded from this slice.

Inbound events dispatch only when the tenant-linked service principal is
configured and persisted governance authorizes the `github_actions` domain.
The verified webhook sender becomes the accountable initiator; the GitHub App
slug is the executing bot identity. Missing configuration, unreadable
governance, release-off, emergency-off, or a relevant kill switch fails closed
before a model turn begins.

The model receives a turn-local contract requiring one bounded JSON decision
summary and zero to twenty-five inline findings. Core parses that output with a
strict schema, rejects sensitive output rather than posting it, requires every
finding path to be in GitHub's observed changed-file set, and derives
protected-area visibility independently from the model using ADR-0018/ADR-0030
path rules.

One GitHub pull-request review transaction publishes the summary and inline
findings with event `COMMENT`. This slice never emits `APPROVE` or
`REQUEST_CHANGES` and has no API for labels, CI reruns, pushes, issue/branch/PR
creation, state changes, or merges. GitHub documents that creating a review
requires installation-token `Pull requests: write`; the App should receive no
broader write permissions for this slice.

Before publication, Core consults #423's
`engineering.review_artifact.write` policy under the tenant-linked bot profile.
The effect starts only after a #419 audit record is durable. Audit evidence
contains stable identities, head SHA, counts, protected-rule identifiers, and a
review fingerprint, never raw output. A durable turn marker prevents replay of
the same GitHub review. Eve's default reaction and failure comments are
disabled because they would be external writes outside this policy boundary.

The GitHub App credential stays in the trusted runtime or Vercel Connect. Eve's
firewall broker injects installation authentication for checkout and API calls;
the token is never placed in the sandbox. The master release switch remains
off, and the verification model remains non-production until final launch.

## Consequences

- Verified webhooks and installation-token brokerage come from the installed
  Eve implementation rather than duplicate Core code.
- GitHub review writes are attributable, budgeted, audited, redacted, and
  fail-closed.
- Protected-area detection is visible even if the model omits it.
- The App needs only metadata read, contents read, and pull-requests write for
  this slice; later PR-operator permissions require separate review.
- A malformed, sensitive, unaudited, policy-denied, or replayed output is not
  posted.
- #431 owns GitHub mutations beyond review comments, and #432 owns merge.

## Operations

Setup, permissions, webhook subscription, environment, and verification steps
are documented in `docs/guides/operations/eve-github-review.md`.

## References

- Eve 0.25.1 installed docs: `packages/eve-runtime/node_modules/eve/docs/channels/github.mdx`
- [GitHub create-review endpoint](https://docs.github.com/en/rest/pulls/reviews#create-a-review-for-a-pull-request)
- [GitHub App permission guidance](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)
