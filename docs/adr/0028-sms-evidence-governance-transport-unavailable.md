# ADR-0028: SMS evidence governance with transport unavailable

**Status:** Accepted (founder ruling, Phase 17 grill session — D9)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D9).

## Context

Future SMS requires registration, consent provenance, immutable STOP/HELP
handling, preferences, and suppression evidence that cannot be retrofitted
safely after messages begin. Building an SMS transport in Phase 17 would,
however, create compliance and operational scope before a provider, registration
program, support model, and launch phase have been authorized.

## Decision

Phase 17 reserves provider-neutral SMS vocabulary and append-only evidence while
making platform SMS transport structurally unavailable. The model keeps five
truths separate:

1. platform transport capability;
2. tenant/route registration readiness;
3. channel-scoped consent and provenance;
4. recipient preference; and
5. carrier/provider suppression, including immovable STOP/HELP evidence.

No combination of readiness, consent, preference, catalog binding, import, API
input, feature flag, or tenant configuration can produce an SMS intent while
platform capability is unavailable. Phase 17 MUST NOT include an SMS provider
SDK, adapter, renderer, queue, test-send, template editor, activation control,
or recipient enrollment flow. Phase 3 owns consent governance and Phase 6 owns
the future communication seam; a later explicit transport phase must revalidate
current law, registration, consent, and suppression before enabling delivery.

## Consequences

- Product and APIs display SMS as unavailable, not as pending or silently
  eligible.
- Imports can preserve classified evidence but cannot manufacture consent or
  registration readiness.
- STOP/HELP and revocation evidence is append-only and tenant/Party/channel
  scoped even before transport exists.
- Negative tests prove no executable SMS path, dependency, secret, renderer,
  queue, or provider call ships in Phase 17.
