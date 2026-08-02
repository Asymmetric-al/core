# Design: Eve GitHub read and review path

## Status

Accepted for implementation by issue #430. Canonical decision: ADR-0063.

## Native channel boundary

Core uses the installed Eve 0.25.1 GitHub channel for webhook verification,
installation-token brokerage, bounded PR context, durable conversation state,
and firewall-brokered sandbox checkout. Hosted deployments may use Vercel
Connect. Direct App credentials remain a server-only fallback.

## Ingress and identity

Automatic PR events and PR-scoped bot mentions dispatch only after persisted
governance authorizes the `github_actions` domain. The executing actor is the
GitHub App bot; the verified current webhook sender and delivery are the
accountable trigger. A configured platform profile links the action to #423's
tenant budget without replacing the sender identity.

## Output contract

The turn must return one strict JSON object: a bounded decision summary and up
to twenty-five inline findings. Core rejects malformed or sensitive output,
requires finding paths to appear in the server-observed changed-file set, and
derives protected-area rules independently. Review output always surfaces the
protected-area scan and accountable sender.

## Effect boundary

One GitHub `COMMENT` review carries the summary and inline findings. Core
consults #423, persists a #419 start audit, and only then calls the GitHub API.
A durable turn marker prevents replay. Default Eve reactions and failure
comments are disabled. No API for PR mutation or merge exists in this slice.

## Boundaries

#419 owns the audit shape, #420 governance and kill switches, #421 model
policy, #423 approval and budgets, #425 the runtime, and #429 the sandbox.
#431 owns issue-first GitHub mutation and #432 owns merge. Release stays off.
