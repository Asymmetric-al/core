# D28 — independent review and resolution

Reviewed October 17, 2026 UTC against the current research working tree. Three
independent workstreams covered governance/current source, database/authorization,
and UX/primary documentation. A fourth built the finite counterexample model;
the root reviewed it and independently reproduced its final output. This is not
a production security assessment or legal/source activation approval.

| Finding                                                                                                     | Resolution                                                                                                                                                                                                            | Status                                                                                      |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Financial ADR0038 and Eve timers may be misused as universal retention ownership                            | D28 explicitly keeps P9 preparation and P12 authorization; scoped precedents do not import durations, readers, document classifications or external stores.                                                           | Resolved in C01–C02/C09/C12.                                                                |
| Staff review said departures confirmed after policy change, while source semantics depend on effective time | Review copy now describes departures taking effect after Save; accepted result supplies the server time. C04–C05 bind late events to historical policy.                                                               | Resolved; no scheduling picker introduced.                                                  |
| A later policy could be backdated/overlap history and alter late-event interpretation                       | Ordinary revisions use trusted server acceptance, forbid retroactive insertion/reordering, require unambiguous effective order and exact historical lookup.                                                           | Resolved in C04/C05/P07/P11.                                                                |
| A second departure could renew unselected old entries by using a different current context                  | Only preparation actually admitted to that participation may acquire its departure episode; only one episode controls a body at a time. Historical evidence remains.                                                  | Resolved in C05/C07/C09; actual repeated-participation proof remains required.              |
| P01 overbroadly denied an administrator who independently owns/has authority over preparation               | P01 now distinguishes policy administration from independent current source/history read authority.                                                                                                                   | Resolved without weakening privacy.                                                         |
| Original model selected today's policy for a late departure                                                 | Added a small effective revision history, B15 and P06; both shorter/longer wrong-policy outcomes and missing coverage are checked. Renamed the timestamp effective_at.                                                | Resolved in the finite model; real event/policy authority remains unproved.                 |
| Cleanup lag confused ordinary expiry with physical disposal                                                 | C02/C06/C12 distinguish strict ordinary cutoff, qualified physical deadlines and truthful copy outcomes. No delayed queue extends a privacy ceiling.                                                                  | Resolved.                                                                                   |
| Existing Eve timed deletion marker can be cleared by a later hold while an older worker may still delete    | Documented with exact static source references as an adjacent reuse hazard. D28 requires atomic DB disposition or a durable external irreversible boundary where actual copies require it.                            | D28 prevention captured; no unrelated production fix or incident claim.                     |
| Return before expiry conflicts with a literal D27 no-retention-reset rule                                   | Founder clarification was requested and remains unanswered. D28 supplies an exact recommended selected-entry current-work admission in C07, explicitly proposed pending ratification. D27 ratified text is unchanged. | Product recommendation complete; not an accepted founder choice or adopted owner amendment. |

## Reproduction and limits

The frozen model has **15 unsafe alternatives, six positive controls and 139
assertions**, with byte-identical independently reproduced output recorded in
[root-reproduction.json](root-reproduction.json). Both return branches are
hypothetical; the model selects neither. It uses synthetic identities/instants,
abstract atomic effects and assumed source authority. It does not execute actual
RLS, SQL transactions, locks, Auth, external deletion, backups or browser state.

No prior D27 evidence or earlier database experiment was changed or rerun.
[Prior hashes](prior-evidence-sha256.json) preserve all sixteen D27 evidence
artifacts. [Q28 before answer](q28-before-answer.txt) preserves the original
unanswered question. Current document verification checks the selected A status,
proposed amendments, all categories and proof obligations, references and hashes.

No participant feedback was obtained. Representative staff/missionary usability,
actual duration profile and source privacy obligations, installed/deployed
privileges, producer identity/history, realistic load and full recovery remain
explicit implementation/activation proof obligations. No app/schema/dependency,
provider, live data, external communication, formal specification or GitHub state
was changed.
