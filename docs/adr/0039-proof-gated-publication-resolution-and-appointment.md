# ADR-0039: Proof-gated publication resolution and appointment

**Status:** Accepted (founder rulings, Phase 18 grill session — D15, D16)

> Full record:
> `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`
> (ratified decisions D15 and D16).

## Context

Always stopping on a broken tenant override makes customization an availability
hazard. Silently trying older, broader, cross-locale, or different-renderer
content can produce the wrong official document. The safe boundary is different
before and after a Generation Request freezes its executable publication.

Tenants also have legitimate future cutovers, but a full release calendar,
several queued versions, recurrence, scheduled unpublish, or auto-revert would
turn Document Studio into a release-management product.

## Decision

Before a Generation Request exists, one purpose-owned resolver checks a small,
closed, shallow list of complete immutable publications. Deliberate configured
assignment and configured ancestor inheritance first resolve the expected
primary; that is normal resolution, not recovery. Only when the expected primary
cannot be used and the purpose permits recovery does the resolver check, in one
code-owned order: first, at most one affirmatively current-compatible prior
publication at the same exact scope and locale; second, at most one purpose-
permitted ancestor publication for the same tenant, environment, issuer,
jurisdiction, document class, facts contract, output profile, and exact locale.
The first compatible candidate wins; if both are compatible, the same-scope prior
wins. Sibling, foreign-locale, and protected Asym system publications are never
recovery candidates. Dual-language output must be an explicitly published,
fully proved publication for that exact locale contract; it is not recovery from
another locale. Tenants cannot reorder or extend this priority through a routing
DSL or setting.

Compatibility is positive proof across tenant, environment, Site, issuer,
jurisdiction, purpose, document class, facts and correction semantics, legal
blocks and review, serial/signer authority, locale, output profile, renderer,
fonts/assets, dependencies, privacy, recipient authorization, quarantine, and
safety generations. Unknown is incompatible. The resolver selects one whole
publication graph or stops; it never mixes fragments or scores “what worked.”

Resolution and Generation Request freeze are one logical admission operation.
Expected-head and epoch fencing commit one winner and every dependency, or no
runnable request. Official identifier reservation occurs only afterward. Once
frozen, every transient retry uses the identical publication, renderer, locale,
assets, fonts, facts, signer, and output profile. A safety-live change may stop
unissued work but never mutate pins. Definitively unissued work may create one
linked, proof-gated successor request. Phase 18's D9/D11 identity contract owns
any reserved reference/serial nonreuse and disposition; the source contract
continues to authorize and determine issuance validity and correction/void/
cancel/replace effect. Issued bytes change only through that source-authorized
correction/replacement contract.

A proved compatible recovery remains ordinary **Ready** and proceeds without a
modal, warning, toast, email, or per-document task. Accountable setup and batch
surfaces may show one neutral effective-source line. A broken expected
publication creates one grouped repair item per root cause. Donors and
missionaries never see fallback mechanics.

Publication is **now first**. Once an immutable candidate and its complete proof
and required independent review are ready, authorized staff may appoint that
exact candidate to become current at one future instant. Each structurally
tenant-scoped publication head has at most one unresolved appointment. The
appointment binds the exact candidate, expected current head, civil date/time,
IANA zone, displayed offset, resolved UTC not-before instant, time-zone database
generation, impact evidence, completed approval, and governance generations.
The resolved UTC instant is the approved authority and never moves when time-zone
rules later change. A material interpretation change marks the appointment
**Needs attention** instead of silently recalculating it.

Completed approval survives ordinary reviewer offboarding and unrelated role or
account changes. Only a separately authorized, append-only security or governance
invalidation can revoke it, and an invalidated appointment cannot execute. If a
different candidate is published while an appointment is pending, staff must
explicitly choose **Keep scheduled change** or **Publish now and cancel scheduled
change**. The system never silently rebases the appointment to a different
candidate or head.

At due time, an idempotent head-local command re-proves a finite safety-live set
and advances the head by compare-and-set. Failure leaves the prior head current
and creates one grouped exception. Every request admitted after due time first
reconciles the appointment, preventing a delayed worker from creating a hidden
old-publication interval. Frozen requests and batch items retain their pins.

Scheduling has a five-minute minimum lead, five-year maximum horizon, and
bounded twenty-four-hour transient-recovery window. It supports explicit change,
cancel, and **Publish now instead** semantics with append-only supersession.
There is no recurrence, release bundle, scheduled unpublish, auto-revert,
condition, multi-head transaction, custom retry policy, or force-publish path.

## Consequences

- UI, API, one-off, scheduled, and batch work use the same resolver, freeze, and
  publication command.
- Recovery priority is code-owned and deterministic: same-scope exact-locale
  prior, then exact-locale permitted ancestor. No tenant routing DSL is created.
- Healthy resolution and appointments stay quiet. Staff see one current line,
  at most one scheduled line, and one cause-owned exception action.
- The scheduling sheet contains only publication date, time, and named time
  zone, followed by a full consequence summary. `Publish now` remains primary.
- Later material time-zone-data changes preserve the approved UTC instant and
  surface one quiet **Needs attention** exception; they never move publication
  time behind the user's back.
- Ordinary reviewer offboarding preserves completed approval evidence. Explicit
  security/governance invalidation is independently attributable and blocks
  execution.
- A different-candidate conflict requires the two explicit keep-or-cancel
  choices; neither API nor UI may silently rebase scheduled content.
- Head, quarantine, signer, locale, dependency, authorization, and safety races
  produce one atomic winner or a truthful block; they never create mixed pins.
- There is no renderer fallback after freeze and no automatic rerender or
  migration of queued work when a new publication becomes current.
