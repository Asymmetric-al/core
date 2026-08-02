# Proposal: Implement Eve's governed GitHub read and review path

## Why

Eve needs to respond to pull-request events with useful review summaries and
inline findings without receiving the broader mutation authority owned by #431
and #432. This is an external write and must be authenticated, attributable,
policy-gated, redacted, audited, and disabled by default.

## What changes

- Author Eve 0.25.1's native GitHub App channel at `/eve/v1/github`.
- Support Vercel Connect credentials with direct GitHub App credentials as the
  server-only fallback; neither credential path exposes a token to the sandbox.
- Dispatch opened, reopened, synchronized, and ready-for-review PR events only
  after persisted GitHub-action governance authorizes the turn.
- Accept bot mentions only in PR timelines and review threads.
- Require a strict JSON decision summary plus bounded inline findings.
- Reject sensitive external output and derive protected-area visibility from
  GitHub's observed changed-file set rather than model claims.
- Consult #423 before one `COMMENT` review transaction posts its summary and
  inline findings.
- Audit the bot actor, verified GitHub sender, policy, head SHA, counts,
  protected-area rules, and fingerprints in #419's shape.
- Disable Eve's default reaction and fallback comments because they would be
  external writes outside Core policy.
- Record ADR-0063, an operator runbook, configuration, and focused tests.

## Authority and release posture

The channel cannot label, rerun CI, push, create issues/branches/PRs, change PR
state, approve, request changes, or merge. #431 and #432 retain those
authorities. The master Eve release switch remains off.
