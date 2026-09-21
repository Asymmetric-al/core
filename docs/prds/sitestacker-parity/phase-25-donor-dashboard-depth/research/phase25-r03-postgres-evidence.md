> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# R03 — Synthetic PostgreSQL research evidence

7 September2026. **26 assertions passed on PostgreSQL17.10.** These tested synthetic counterexamples and boundary protections. They did not run Core migrations, the recurring service, actual authorizer policies or provider payments.

The runner used a uniquely named/labeled temporary Docker container from the already-cached `postgres:17-alpine` image, `--pull never`, no network, no exposed ports, a128 MB temporary data filesystem and a256 MB memory limit. Its invented rows, role and SQL functions contained no Core/env/provider data. Internal trust authentication applied only inside that network-disabled disposable container. The exact created container name/label was checked before removing it; existing containers remained untouched.

The concurrent experiments used separate real PostgreSQL sessions. A control session observed actual Lock waits before the blocking transaction committed. No unbounded sleeps or provider calls were used. The simulated partial-progress cases wrote fixture state and resumed through another session; they did not kill an actual Core worker or reproduce a live provider outage.

## Results and meaning

<!-- prettier-ignore -->
| Family | Result | Limit |
| --- | --- | --- |
| Mask identity | A same-mask query selected2 uses; exact method scope selected1. | A counterexample to last-four matching, not proof of Core lineage. |
| Scoped relationships | Poisoned FK rejected; referenced method could not be physically deleted. | The fixture's constraints only. |
| Unsafe removal race | A new use inserted after an unused check survived retirement:1 invalid live reference. | Reproduces the check-then-retire hazard without provider detach. |
| Shared use/removal fence | Retirement-first rejected late binding; binding-first rejected retirement. | Both orderings used actual lock waits. All real writers must obey the eventual owner protocol. |
| Competing replacement | First revision update won; stale second changed0 rows; amount/currency unchanged. | The fixture's CAS/lock behavior, not the target command. |
| Admission atomicity | Simulated failure rolled back the whole partial accepted set. | No financial effect was attempted. |
| Durable partial progress | A fresh session found the exact two-child set, with one confirmed and one accepted. | Simulated interruption, not an end-to-end process crash. |
| Replay and immutability | Changed payload rejected; same identity reused; duplicate effect suppressed; accepted selection immutable. | Does not establish Stripe or Core idempotency beyond this fixture. |
| Access | Foreign-tenant row hidden; browser-like role had no internal-journal SELECT or binding UPDATE privilege. | Static fixture policy, not actual Supabase session/representation proof. |

## Recorded assertions

- **mask_match_overselects_same_tenant:** actual `"2"`; expected `"2"`; passed.
- **exact_identity_selects_one_use:** actual `"1"`; expected `"1"`; passed.
- **cross_scope_fk_rejects:** actual `"0"`; expected `"0"`; passed.
- **naive_unused_check:** actual `"0"`; expected `"0"`; passed.
- **naive_check_then_retire_leaves_live_reference:** actual `"1"`; expected `"1"`; passed.
- **bind_waits_for_shared_retirement_fence:** actual `true`; expected `true`; passed.
- **retirement_admitted_without_uses:** actual `"t"`; expected `"t"`; passed.
- **late_bind_rejected_after_retirement:** actual `["f"]`; expected `["f"]`; passed.
- **safe_retirement_has_zero_new_uses:** actual `"0"`; expected `"0"`; passed.
- **new_use_admitted_first:** actual `"t"`; expected `"t"`; passed.
- **retirement_waits_for_binding_fence:** actual `true`; expected `true`; passed.
- **retirement_rejected_while_use_remains:** actual `["f"]`; expected `["f"]`; passed.
- **first_replacement_cas:** actual `"1"`; expected `"1"`; passed.
- **second_replacement_waits:** actual `true`; expected `true`; passed.
- **stale_replacement_does_not_overwrite:** actual `["0"]`; expected `["0"]`; passed.
- **winning_binding_and_money_unchanged:** actual `"new1:2:1000:USD"`; expected `"new1:2:1000:USD"`; passed.
- **partial_admission_rolls_back:** actual `"0"`; expected `"0"`; passed.
- **accepted_set_survives_partial_progress:** actual `"g1:confirmed,g2:accepted"`; expected `"g1:confirmed,g2:accepted"`; passed.
- **same_request_same_set_is_replay:** actual `"f"`; expected `"f"`; passed.
- **same_request_changed_set_rejected:** actual `"g1+g2"`; expected `"g1+g2"`; passed.
- **durable_effect_not_duplicated:** actual `"1"`; expected `"1"`; passed.
- **accepted_selection_immutable:** actual `"g1+g2"`; expected `"g1+g2"`; passed.
- **in_use_physical_delete_restricted:** actual `"1"`; expected `"1"`; passed.
- **rls_hides_other_tenant:** actual `"0"`; expected `"0"`; passed.
- **internal_journal_not_directly_readable:** actual `"f"`; expected `"f"`; passed.
- **caller_cannot_mutate_binding:** actual `"f"`; expected `"f"`; passed.

## Reproduction and required next proof

The runner is a research artifact, not an application migration or implementation. Run it only in an environment with Docker and the existing indicated image. It creates/removes only its own labeled disposable container and writes its synthetic results beside the script. It must not be adapted to a Core or hosted database without separately scoped work.

Actual release proof must use Core's owning schema/services, current roles/grants, two-connection command races, exact test account/provider contracts, media/auth redirects where relevant, accessible donor journeys, capacity and migration evidence. The full review provides T01–T16. No provider, browser, load or production test is claimed here.

Primary references: [PostgreSQL17 row locking](https://www.postgresql.org/docs/17/explicit-locking.html), [transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html), [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

[Reproducible synthetic runner](phase25-r03-postgres-experiments.py) · [Full R03 review](phase25-r03-adversarial-review.md)
