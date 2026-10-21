# D32 finite combined-purpose counterexamples

**October 18, 2026 UTC.** D32 selects one compatible follow-up that can show and
deliberately handle gift and fixed-pledge-fulfillment purposes together. This
artifact illustrates the proposed owner contracts for distinct purpose identity,
organization Combine/Separate policy, pending placement and exact coverage.
It does not establish ratification, source-producer availability or implementation.

[Model](combined-counterexamples.py) and [deterministic results](combined-counterexamples.json)
contain 18 counterexample families and 7 positive controls. The JSON records the
exact outcome-assertion count and script SHA-256. Only this new standard-library
Python model is executed; no earlier model or database probe is rerun.

The root's code audit found four material gaps in the initial model: fulfillment
residue retained the gift-group slot, attachment lacked a causal gift proof,
global policy revisions rejected unaffected gift handling, and amount equality
was too restrictive. The revised cases below address them. The initial artifacts
are preserved as [source](initial-model.py.txt), [output](initial-model.json) and
[readme](initial-model-readme.md); those snapshots were not rerun or rewritten.

## Reproduce

From the repository root:

```bash
python3 docs/features/missionary-workspace-depth/grill/d32-evidence/combined-counterexamples.py > /tmp/d32-combined-counterexamples.json
cmp /tmp/d32-combined-counterexamples.json docs/features/missionary-workspace-depth/grill/d32-evidence/combined-counterexamples.json
```

The script prints deterministic JSON and writes no files. An outcome mismatch
raises an assertion. Preserve the serializer's exact output bytes rather than
formatting generated JSON separately.

## Contract illustrated

Gift follow-up and whole fixed-pledge fulfillment retain separate stable purpose
identities. The latter belongs to one continuing fixed-pledge identity, regardless
of source revisions, lines, deliveries or correction/restoration. Qualification
requires a qualified live money-caused milestone and positive capacity on every
applicable line, each fully supported by conserved received applications in the
exact currency. These facts come from the financial owner. Applied money may
exceed current reduced terms while the original proved milestone remains valid;
the model uses at-least coverage plus that independent causal proof, not amount
equality as a domain rule. A valid promise amended from 100 to 90 when 80 was
applied can be completed by a later applied 10 under the same accepted 90 terms.
The model supplies that crossing as an owner-qualified input. Zero Remaining caused by
release, donor end, ordinary term reduction or recurring schedule end is not that
milestone. One paid installment, aggregate offsets and unknown source evidence
cannot establish whole-pledge fulfillment. Fulfillment does not independently
classify the final payment as a special gift.

The effective organization policy changes only current pending placement.
Combine attaches eligible unhandled fulfillment to the compatible current D20
gift anchor only when a pending gift member intersects the owner's current
completing/restoring contribution set. Shared scope alone cannot establish that
relationship. Separate detaches fulfillment to its own task. The gift anchor and
both purpose identities remain stable while that gift group remains current. The owner
maintains one active placement per purpose. An empty shell created by rerouting
is Superseded, not Done. No financial fact, actual interaction or coverage is
created by moving work. A finished anchor stays finished when new work arrives.
Fulfillment-only residue may retain its container but relinquishes the current
gift-group slot, so unrelated future gifts get their next D20 group. A late
milestone whose completing gift was already handled remains separate from
unrelated pending gifts.

The review binds a nonempty exact selected purpose set, relevant source and
purpose versions, relevant current placement, responsibility, completion authority
and current actor authority. After any wait, the joint command rechecks those
facts and current Combine permission before making all per-purpose coverage
effects, including when policy acceptance precedes placement repair. A policy
revision alone does not invalidate unchanged single-purpose handling. The review
retains its captured policy revision as receipt payload context, not as a global
conflict condition. A selected change or a
concurrently handled selected purpose rejects the entire new command. A
deliberate nonempty subset is valid; silently applying only the still-valid part
of a larger reviewed set is not. Unrelated arrivals neither invalidate selected
unchanged work nor become covered.

The same request and payload recover the original accepted receipt under current
disclosure even after policy changes. A changed payload conflicts. A newly
arriving purpose cannot inherit earlier coverage. Source correction may withdraw
and restore the same unhandled fulfillment purpose; handled fulfillment never
automatically restarts. Each source-owned semantic purpose is deduplicated across
transport deliveries. Task handling records no new interaction, message, receipt
or financial application.

## Cases

| Cases   | Unsafe alternative                                                                                                                                      | Corrected modeled outcome                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| B01–B02 | Zero Remaining, one paid installment, an aggregate total, unknown evidence, mixed currency or unconserved applications treated as whole fulfillment.    | Require every applicable positive line and a qualified live money-caused fixed-pledge milestone.                     |
| B03–B05 | A purpose per line/delivery, one identity per task, duplicate active placement or Done for an emptied routing shell.                                    | Preserve distinct semantic purposes, one active placement, the current gift anchor and honest Superseded state.      |
| B06–B08 | Cached policy/source/placement/authority or best-effort coverage after a selected change or concurrent handling.                                        | Recheck relevant fences and accept all selected coverage effects or none.                                            |
| B09–B10 | Global group revision blocks a harmless arrival, latest-group completion consumes it, or a retry reevaluates the accepted command after policy changes. | Handle only the reviewed set; recover its immutable result under current disclosure; reject changed retry payloads.  |
| B11–B12 | Late purposes inherit Done, finished anchors reopen, or correction creates a new fulfillment purpose.                                                   | Preserve old coverage and history; restore only the same unhandled purpose.                                          |
| B13–B14 | Shared display name overrides scope/responsibility, fulfillment invents gift qualification, or empty selection passes vacuous validation.               | Exact compatibility, independently qualified purposes and explicit nonempty selection remain mandatory.              |
| B15–B16 | Fulfillment residue holds the gift slot indefinitely, or same-scope work joins without a pending causal gift.                                           | Preserve residue separately; use the next gift group and exact current completing/restoring evidence.                |
| B17–B18 | A global policy revision rejects unchanged gift handling, or amount equality rejects a preserved financial milestone.                                   | Recheck relevant placement and current joint permission; consume qualified causal proof with at-least line coverage. |

Controls cover complete money fulfillment across two lines; Combine/Separate
round trips and no-op policy saves; a deliberate subset; exact joint coverage
without source/interaction changes; separately handling both eligible purposes
under Separate; a valid amended promise completed by later money; and restoration
of the same unhandled purpose beside its current restoring gift.

## Limits

The records, placement maps, source versions and task states are synthetic
reasoning variables, not schema choices, a second ledger or a proposed task
implementation. Financial line facts, conservation, the original causal milestone,
its current completing/restoring contribution set, live qualification and
permissions are owner-supplied inputs. The model does not derive the financial
before/after milestone, original terms or causal application evidence. No actual
financial producer, matching, refund, FX, role mapping, policy store or privacy
surface is tested.

Selected sequential schedules assume serialized owner boundaries. They prove no
SQL/RLS, lock ordering, actual waits, transaction isolation, durable outbox,
database uniqueness, crash recovery or real concurrency. The model consumes one
effective organization setting; it does not implement multiple organizations'
policy administration, configuration retry, migrations, activation or mixed
version writers. The broader D20 responsibility lifecycle, Undo, pagination and
partially disclosed receipts remain outside this model.

There is no UI, actual interaction command, communication or consent model.
Existing interaction and financial fixture facts are checked for preservation
only. No application, database, provider, network, private data or old model is
accessed. Passing the finite examples establishes no deployed grant, runtime
enforcement or release readiness.

Relevant owner boundaries are [D20](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md),
[D21](../phase28-d21-explicit-gift-follow-up-adversarial-review.md),
[Q32 research](../phase28-q32-gift-and-fulfillment-follow-up-research.md), and
[Phase 16 F.1–F.7/M.2–M.3](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md).
