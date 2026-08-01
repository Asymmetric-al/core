# ADR-0042: Truthful statement operations and minimized evidence

**Status:** Accepted (founder rulings, Phase 19 grill session — D10-D12, D14-D17)

> Full record:
> `docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md`

## Context

A statement run can be operationally finished while bounces, postal returns,
donor questions, corrections, incidents, and records work remain live. Automatic
completion or one global status would either keep runs open forever or hide real
exceptions. Mandatory dual approval for every run would slow ordinary finance
work without improving truth. A copied audit blob would duplicate PII and drift
from the domains that own documents, communications, and incidents.

Staff and donors also need one simple way to resolve a particular statement
without learning legal lifecycle, provider, version, serial, or retry mechanics.

## Decision

An authorized staff member decides when to mark a run operationally complete.
The command records one immutable numbered Completion Snapshot. Asym derives
**Completed** or **Completed with exceptions** from authoritative evidence;
staff cannot choose a false clean label. If executable work remains, the
combined action first settles the ADR-0041 stop fence and then completes.

Ordinary bounces, returns, missing contact data, donor questions, and other
known exceptions warn but do not create artificial blockers. Authorization or
scope failure, integrity/reconciliation failure, uncontained privacy risk,
unsettled stop, or stale/concurrent completion does block. Completion itself
sends, retries, cancels, rerenders, revokes, disposes, or closes incidents
nothing.

**At completion** remains immutable. **Follow-up now** continues to project
current owner truth. Exceptions automatically carry forward. A bounded
**Return to active review** appends evidence, preserves prior completion, and
never reactivates stopped or already-completed operations.

Statement work uses two service classes and owner-first fair claims: protected
critical/interactive capacity and seasonal bulk capacity. The initial
production-shaped certification is 50,000 Statement Subjects per run and
500,000 concurrently admitted operation equivalents. An over-cap run may build
and review its complete preflight, but release blocks atomically with the exact
count and active ceiling; it is never truncated, partially released, or
silently split. One optional **Target ready for review by** may inform rounded
estimates but cannot change queue share, safety, legal authority, provider
capacity, or critical-message protection. Progress shows separate durable axes
and freshness, never one blended percentage.

Ordinary ready runs use same-person **Start live run** with no approval
vocabulary. Exactly one different human is required only for a closed
contract-owned protection reason or the tenant-wide **Every live run** setting.
Review binds one exact preflight. **Approve and start live run** is one atomic
command; there is no approved-but-not-started state, quorum, chain, threshold
matrix, or admin bypass.

Party Giving and Year-End Operations open one logical **Help with this
statement** resource. Exact-current Open, Download, and Print come first.
Staff choose only one intent: provide another copy, change where it goes, the
statement is wrong, or giving is missing. The server resolves copy,
destination succession, source correction/replacement, or supplemental run.
There is no generic retry, regenerate, provider, serial, or version picker.

The optional `giving.summary.informational@1` Support overview is Off by
default, independently generated and delivered, and always labeled **Support
overview — Not a tax document**. Launch recognition is limited to source-proved
household support and sufficiently disclosed unambiguous DAF recommendations.
It never blends with official documents, creates a deductible total, or grants
missionary access.

Phase 19 retains one logical PII-minimized Run Evidence Record with distinct
sections:

- immutable **At release**;
- immutable **At completion**;
- referenced **Follow-up now — Current as of**;
- referenced **Records**.

The record stores closed codes, counts, digests, policy versions, actors,
timestamps, and owner references. It does not copy PDFs, message bodies, exact
destinations, raw provider payloads, mutable profiles, or downstream current
state.

An authorized auditor may prepare one fixed, scope-bound temporary Audit
Package. Review states contents, exclusions, expiry, and the requester's
responsibility for downloaded copies. Generation is resumable, bounded-memory,
nontruncating, and permanently idempotent. Every seal, view, and download
reauthorizes. Expiry invokes verified disposal; a hold preserves but never
authorizes. Lawfully disposed or restricted owner evidence is reported as
unavailable and is never reconstructed from current CRM data.

## Consequences

- Staff retain real control without being able to falsify completion.
- Completion and live delivery/recovery/incident/legal truth remain separate.
- Ordinary runs add no approval bureaucracy; protected runs have one exact
  review action.
- Seasonal fairness and critical-message protection are product policy, while
  Inngest and providers remain executors.
- Staff and donors use one current-first resource rather than several copies or
  technical operation menus.
- Recognition can improve stewardship without contaminating tax documents.
- Auditability does not require a second event store or permanent PII-rich
  export library.
- WCAG 2.2 AA, keyboard, screen-reader, reflow, forced-colors, long-locale/RTL,
  reduced-motion, and mobile proof are release gates.
