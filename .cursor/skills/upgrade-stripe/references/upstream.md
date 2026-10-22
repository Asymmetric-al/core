# Upstream: upgrade-stripe

- Source: https://docs.stripe.com/.well-known/skills/upgrade-stripe/SKILL.md
- Index: https://docs.stripe.com/.well-known/skills/index.json
- Reviewed date: 2026-10-22.
- Source type: official hosted distribution; no immutable source commit or separate license identifier is published.
- Raw upstream SKILL.md SHA-256: `30e6f0dd9bc353768b35d1a768ae58e31219ffa992d39bae347d8950c29b563b`.
- Raw index SHA-256: `05e1a41ba66b644ee5543c0fb8958e4bb3d41ab58aac12a2f8286438d975d406`.
- Outcome: updated from the complete installed subtree, without adding any other Stripe skills.
- Core adaptations: preserve approved API/SDK pins, client reuse, gift-quote payment-method and idempotency contracts, reviewed tax product classification, repository ownership and credential/provisioning boundaries.

Download the exact installed names and their declared files from the official index into temporary staging, record every raw hash, review the complete diff, and restore the marked Core overlay and in-place payment/tax corrections before transactional runtime replacement. Keep hosted content hashes distinct from Core-adapted bytes. Do not execute the install/provisioning examples during refresh. Run skills:sync and non-mutating skills:verify afterward.
