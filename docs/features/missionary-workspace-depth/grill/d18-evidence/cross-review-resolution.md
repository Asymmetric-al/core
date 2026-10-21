# D18 independent review reconciliation

October 16, 2026 UTC. This records corrections to the completed D18 research
synthesis, not application changes or newly ratified requirements.

Five independent final passes covered the full UX/catalog, source implementation,
owner boundaries, provider/budget lifecycle and database/proof claims. Their
material findings were resolved in the [main review](../phase28-d18-newsletter-writing-assistance-adversarial-review.md):

| Finding                                                                | Resolution                                                                                                                                                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic fine-grained RLS advice conflicts with P12                     | C17 follows coarse tenant RLS and the sole P12 resolver/source enforcement points. Direct body reads are closed; no second SQL authorization engine.                                                          |
| One live request could prohibit new work forever after unknown outcome | C12–13 separate the local applicable result from uncertain provider execution, retained cost and outstanding-work exposure. New generation needs fresh admission.                                             |
| Personal hide was both cosmetic and revocation                         | One personal Off setting consistently hides, denies new requests and withdraws pending/ready candidate access; accepted drafts, collaborators and usage are unaffected.                                       |
| Selected visible text could differ from saved source                   | Ordinary source save captures the exact visible selection before egress; failed/unknown save never substitutes an older revision.                                                                             |
| Transient input expiry anchored to completion could never start        | C14 gives input an admission-anchored one-hour maximum; candidate has fixed 24-hour completion-anchored lifetime. P25 and purge monitor cover both, with no retry renewal or expired dispatch reconstruction. |
| “Preserve vocabulary” conflicts with simplify/rephrase                 | C05 preserves significant terminology, meaning, perspective, language and certainty while allowing action-appropriate wording changes.                                                                        |
| “Draft unchanged” ignores concurrent manual writing                    | Timeout copy says writing help has not changed the draft.                                                                                                                                                     |
| Candidate Use always created a successor                               | C08/P12 allow an honest no-change outcome; effective accepted edit creates at most one ordinary successor. Manual editing remains independent.                                                                |
| A purpose-only reserve could evade configured shared ceilings          | C11 requires atomic admission under every applicable configured tenant/account/purpose envelope. No nonexistent global cap is inferred.                                                                       |
| Unknown pricing was merely disclaimed                                  | C11 blocks new dispatch until that profile's cost qualification is restored.                                                                                                                                  |
| Ordinary Undo could blindly restore a whole document                   | C07/P13 require current source-authorized conditional saved Undo, preserving intervening edits and resolving lost acknowledgments. It remains ordinary editing when AI is Off.                                |
| Existing writer gap was understated                                    | Current-behavior section now records the read/update without expected version and separate history write; existing template save is not a qualified apply boundary.                                           |
| Preliminary three-action catalog competes with synthesis               | The source/UX note labels its three-action proposal superseded by the six-action synthesis. Exact labels are not falsely called ratified.                                                                     |
| “No financial facts” wrongly excludes eligible authored goals/amounts  | C03 excludes unauthorized retrieval/injection/provenance, not every personal or financial topic in qualified authored prose. C04 remains controlling.                                                         |
| Synthetic budget test could imply safe limit lowering                  | Main proof explicitly excludes lowering below held exposure; the fixture's CHECK is not a final schema.                                                                                                       |

The final numeric profile uses Unicode scalar values with their exact UTF-8 maxima,
not mistaken KiB equivalence or a token estimate. These limits, periods, expiry
and operational thresholds are proposed D18 judgments requiring qualification.
The static NULL-input correction belongs to the disposable database fixture;
it is not a discovered Core production vulnerability.

No remaining material contradiction was reported by those bounded passes. This
means the recommendation was independently challenged; it does not establish
model quality, hosted Supabase behavior, provider billing, production retention,
restoration, accessibility or author usability. Those have explicit release proofs.
