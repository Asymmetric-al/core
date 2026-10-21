# D36 adversarial review: the renewed follow-up period

**October 18, 2026 UTC.** The founder selected the organization's configured
finite renewed period, with no per-continuation date adjustment. The root review
adopts the following proposed temporal contract for adversarial evaluation:
positive whole elapsed days, exactly 86,400 seconds each; actual authoritative
source acceptance after waiting anchors the renewed period; accepted cycles keep
their original terms; and ordinary missionary/staff continuation shares the
same period policy. These details remain review proposals, not ratification or
proof of an implemented source command.

No numerical organization default or supported product minimum/maximum is chosen
here. The owner must publish and enforce its supported finite whole-number range
and independently prove timestamp representability. The model's explicit toy
range is **1–400 days**, solely to exercise range behavior. It is not a proposed
production setting or substitute for that owner decision.

## Failures and minimal permanent corrections

| Case | Unsafe alternative | Required bounded outcome |
| --- | --- | --- |
| A01 | Add the configured period to the preview, request/transaction start, old expiry or eventual webhook delivery. | At the serialized native source acceptance boundary, sample authoritative current instant A after waits and compute E = A + N × 86,400 seconds. Capture actual A/E, N and policy revision with that accepted cycle. |
| A02 | A preview says one end date, but a long wait crosses midnight and silently commits a different displayed date. | Treat the preview as illustrative for fixed N. A materially changed displayed calendar end date or display-zone context returns changed-terms/no-effect and requires a fresh deliberate review; never silently substitute material terms. |
| A03 | Require the exact preview timestamp or offset to equal the actual endpoint, rejecting ordinary clock advance. | Ordinary seconds/minutes and DST offset changes are allowed when the relevant policy and explanatory date/zone remain unchanged. The actual accepted endpoint still gives the full configured period from A. No per-second fence or compulsory second modal is implied. |
| A04 | Add one local calendar day across DST, yielding 23 or 25 elapsed hours. | Perform elapsed arithmetic on the UTC instant. Local rendering may shift the displayed clock hour; it cannot change the duration. |
| A05 | An endpoint advances from 01:59 EST to 03:00 EDT while waiting; the result combines the actual clock time with the preview's stale EST offset. | Accept this ordinary offset advance when zone/date and policy remain consistent. Render actual time and offset together from the stored endpoint; mixing them misstates the instant by an hour. A different display-zone context still requires fresh review. |
| A06 | Store only the date or truncate to midnight at a leap day or year boundary. | Preserve the qualified source instant and supported precision, with an exclusive end boundary. A displayed date is a presentation of the instant, not a replacement for it. |
| A07 | Missing configuration becomes a guessed default; fractional/string/boolean values are coerced into days; an invalid restored value is trusted. | Require an explicit currently qualified positive whole number within the owner's supported range before acceptance. Reject unsupported input atomically; don't clear or fabricate a usable period. |
| A08 | A range-valid period overflows the supported timestamp and is clamped, wrapped or stored partially. | Independently check that E is finite, representable and later than A in the real owner precision/type. No source change may survive a failed endpoint calculation. Python's limits are only model limits. |
| A09 | A policy edit rewrites existing cycles, or an old reviewed command silently adopts the latest number. | Changes apply only to later accepted cycles. A relevant policy revision mismatch requires a fresh review; accepted A/E/N/revision remain fixed. |
| A10 | N changes to another value and back, so a stale review is treated as current because the number matches again. | Use the authoritative policy revision, including stable absence. A no-op save can preserve its current semantic revision; an intervening real change cannot be erased by returning to the old value. |
| A11 | Saving a period enables missionary continuation, or first configuration/enablement upgrades a request that observed no policy. | Period configuration and D35's missionary permission remain separate. Missing policy has a stable fence; first configuration and enablement need fresh current review. Independent staff action uses the same valid period without depending on missionary On. |
| A12 | Lost-response retry, a delayed delivery or a retry after later expiry computes a fresh endpoint from current time or current policy. | Recover the original historical accepted effect and endpoint under current safe result authority. Off or a later period edit cannot undo it; the old intent cannot start another cycle. The receipt does not claim that the source is still Active. |
| A13 | View, ordinary edit, login or an inactivity-warning algorithm pushes the end forward. | These actions do not continue the source or reset its clock. The recorded cycle end stays fixed. Neither the renewed window nor activity extends a grant, restores a purged body, changes old retention or supplies contact consent. |
| A14 | Active access persists at the exact endpoint until a nightly sweeper or the end of the local date. | Evaluate current source time using the stored interval: A ≤ now < E. At E the interval has ended. Display/cache/job lag provides no extra authority. |
| A15 | The caller submits the explanatory endpoint as an editable source deadline despite choosing A. | The source derives E from current configured N and actual A. A caller's date or override is not an admitted command term. |
| A16 | A definitive rejection while the source is active is forgotten, then time alone makes the old intent eligible without changing any revision or displayed date. | Preserve D35 terminal no-effect safety through narrow owner outcome evidence or an equivalent non-replay fence. New eligibility requires a fresh deliberate intent. Evidence retirement cannot make the old intent executable. |

## Illustrative orders

1. **Ordinary wait:** preview at 12:00 → accept at 12:05 with the same displayed
   end date/zone → E uses 12:05, retaining the full N elapsed days.
2. **Date changes:** preview at 23:59:50 → wait 20 seconds → the end date changes
   → known no-effect → fresh review/new intent may accept the now-explained date.
3. **Offset changes:** preview a New York endpoint at 01:59:59 EST on March 8,
   2026 → wait two seconds at the acceptance anchor → computed endpoint becomes
   03:00:01 EDT on the same day and zone → accept the full period, rendering
   actual time and its actual offset together. Do not force review for offset
   advance alone.
4. **Period edit first:** review N under revision r → staff configures a different
   period under r+1 → old intent has no effect. A subsequent deliberate review
   can use r+1; old accepted cycles retain r.
5. **Acceptance first:** accept and capture A/E/N/r → response is lost → period
   changes, permission turns Off and the cycle later expires → same-intent
   recovery returns only the original currently permitted acceptance evidence.
6. **Time-only source eligibility:** submit while the source is still active →
   definitive no-effect → time passes beyond source expiry with the same policy
   and displayed terms → original intent remains rejected, never automatic work.

The witness uses a source-qualified display context solely to explain terms.
It is not a new locale/timezone setting, a caller-selected deadline, a source
permission token or proof of UI authenticity. A timezone database, localization
or display-context change still needs the real owner/UI integration to resolve
materiality and current response safety.

## Owner anchors and limits

- [Q36 research](../phase28-q36-referral-window-policy-research.md) separates the organization-period choice from numerical defaults/bounds, initial-referral timing, retention and consent.
- [Ratified D35](../phase28-d35-referral-continuation-adversarial-review.md) owns deliberate current continuation, source-cycle identity, current acceptance, terminal rejected/accepted intent safety and independent staff authority.
- [P9 native source owner](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md) and [native CRM contract](../../../../../openspec/specs/crm-core/spec.md) own lifecycle/provenance and the command/audit seam; no timer engine or new provider journal is implied.
- [P12 current authority](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md) continues to govern current scope, purpose, fields, privacy and contactability; the renewed period is not a grant duration.
- [Founder referral boundary](../phase28-founder-brief.md) keeps expiry, provenance, privacy and deliberate continuation separate.

The [model](temporal-counterexamples.py) demonstrates finite synthetic semantic
differences, including actual Python/IANA timezone arithmetic for selected dates.
It is not SQL/RLS, actual transaction/concurrency, clock, source-producer, UI,
retention or release proof. It does not establish that current production inputs
or timestamp types satisfy this proposed contract. No older model, probe or
verifier is run, and no numerical product default or cap is inferred from the
toy examples or other phases' conventions.
