# D26 independent review and resolution

Reviewed October 17, 2026 UTC. Three independent agents researched governance,
UX/primary evidence, and database/authorization, then separately reviewed the root
draft. The root reconciled their findings. This records design review, not an
application security certification, runtime test or user study.

## Material amendments made to the draft

| Review                    | Finding                                                                                                         | Exact resolution in the main record                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance                | Same-occurrence reopening wording could permit reopening a source-controlled predecessor contrary to ADR0183.   | C06/P08 limit same-occurrence reopening to owner-permitted Independent follow-up. Source-controlled renewed work is a successor requiring new selection.                               |
| Governance                | “Meaning-bound” could let an implementer silently exempt cosmetic title/body changes.                           | C05/P04 invalidate on every source title/description change and registered meaning-bearing fields; no AI/semantic/cosmetic exemption. Only irrelevant private-note changes are exempt. |
| Security                  | Restoring the original title/scope could restore an approval if only current text equality is tested.           | C05/P04 require durable revision-based invalidation and fresh deliberate review even after original wording/scope returns.                                                             |
| Security                  | A shared Share/Stop validator could require the unavailable source or valid draft before permitting revocation. | C11/P16 explicitly permit authorized Stop for the exact share without loading protected source or validating draft text.                                                               |
| UX                        | Reassignment may remove Maya's authority, making an unconditional Review action wrong.                          | Corrected decision, Maya journey and C05 require current sharing authority before offering re-review; otherwise safe unavailable/Stop only.                                            |
| UX                        | “Updated as of” confused read freshness and actual task changes.                                                | Jordan journey uses Current as of with authorized source-read time; any Task updated field requires separate source qualification. Neither uses re-render time.                        |
| UX                        | Time-zone city labels could reveal restricted location.                                                         | Jordan journey requires an admitted safe zone/offset; no protected IANA city disclosure.                                                                                               |
| Security/UX clarification | Completed/cancelled list wording did not accommodate other truthful source endings.                             | Closed next steps preserves separately mapped completed/cancelled/superseded/withdrawn/no-longer-required meaning; unknown states withheld.                                            |
| Root synthesis            | A multiple-recipient share needs defined partial-failure behavior.                                              | C04 requires atomic reviewed recipient-set addition; an ineligible recipient adds no new audience and leaves existing valid shares intact.                                             |

All reviewers found A compatible with the owning contracts after these
amendments. B remains fairly represented. No indispensable new founder choice
was identified; SQL/source qualification is an engineering responsibility and
does not justify an unqualified permission expansion.

## Independent reproduction and evidence boundaries

The root inspected and reran the finite design falsifier once. Its deterministic
JSON exactly matched the agent's prior result: **9 unsafe counterexamples and 3
positive controls**, with [hash evidence](root-reproduction.json). The cases
demonstrate why stale permission, live raw wording, series pointers and equality-
only consent are insufficient. They do not implement or test actual Core,
Supabase RLS, HTTP races or browser behavior.

No previous phase or D25 experiment was rerun or altered. The
[prior-evidence manifest](prior-evidence-sha256.json) pins 20 artifacts, including
the ratified D25 review and its evidence. Q26's original unanswered research is
preserved as [a text snapshot](q26-before-answer.txt). Current session/Q26/glossary
records distinguish selected A from amendments awaiting ratification.

Remaining qualification gates are explicit in C17/C18 and P01–P24: actual source
producer and P12 policy, role/grant/function behavior, retained data/retention,
concurrency, migration/restore, rendered accessible UX and measured capacity.
Those are not claimed completed by this documentation review.
