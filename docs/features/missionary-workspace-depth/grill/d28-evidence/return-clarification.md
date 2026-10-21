# D28 — explicit return clarification

Recorded **October 17, 2026 UTC**, after the initial D28 adversarial review.

The pending question asked whether preparation deliberately resumed before
expiry should remain subject to its departure deadline or become current work.
The founder answered:

> Keep resumed preparation as current work under the normal retention rules; end
> its departure deadline (recommended).

This selects the current-work outcome. It is not blanket ratification of the
remaining D28 amendments, a numerical retention period, permission to implement
or proof of an operating source capability.

## Reconciled meaning

- An authorized, deliberate Resume accepted before the controlling expiry admits
  only the selected same preparation to qualified normal current-work retention.
  Its departure schedule stops applying; original departure, policy and deadline
  history remain intact.
- Login, reactivation, viewing and resuming another entry do not renew unselected
  preparation. Current access and source rules remain required. Missing
  current-work retention qualification cannot cancel an existing obligation.
- Expired, held-only, erased or purged material cannot be recovered through this
  path. A hold that only prevents disposal does not itself remove independently
  valid ordinary access before expiry; any use restrictions still govern.
- The ended deadline is neither an active UI countdown nor authority for a stale
  worker to delete resumed work. Normal current-work rules govern instead.
- Archive state, authorship and previous membership remain truthful. Resume
  grants no new reader and restarts no sharing, tasks, sending or subscriptions.

The current [D27 decision and C07](../phase28-d27-resume-preparation-adversarial-review.md#d27-c07--retention-holds-and-erasure),
D27's F03/P09 and monitoring signal, [D28-C07](../phase28-d28-preparation-retention-adversarial-review.md#d28-c07--return-must-have-one-explicit-retention-meaning),
D28 expiry/UI/proof language, [Q28](../phase28-q28-preparation-retention-control-research.md),
the [session](../phase28-session.md#d28-return-clarification--selected) and the
[glossary](../../../../../CONTEXT.md) now use this meaning.

## Evidence chronology and verification

The [clarification manifest](clarification-evidence-sha256.json) preserves all
**13 initial D28 evidence artifacts** and **two pre-clarification decision
snapshots**. The initial verifier and result are preserved as
[verify-review-initial.py](verify-review-initial.py) and
[review-verification-initial.json](review-verification-initial.json). Their
unanswered/proposed flags correctly describe the earlier review state.

The original [D27 text](d27-before-return-clarification.txt) and
[D28 text](d28-before-return-clarification.txt) preserve the clauses being refined.
The initial model evaluated both return branches as hypothetical before the
answer; neither its output nor its supporting notes were rewritten to imply
that the founder had already chosen. All sixteen earlier D27 evidence artifacts
remain pinned by the unchanged [prior manifest](prior-evidence-sha256.json).

[Current verification](review-verification.json) checks current selection,
remaining-amendment status, local references and preserved evidence. No finite
model, database experiment, runtime, load or participant test was rerun for this
documentation clarification. No Q29 is posed.
