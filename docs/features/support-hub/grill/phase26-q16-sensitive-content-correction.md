# Phase 26 Q16 — Correcting accidentally shared sensitive content

**Selection update — 11 September 2026:** The founder selected A and fully ratified [D16 and the complete reviewed amendment package](phase26-d16-adversarial-review.md), 11 September 2026. Question-stage unanswered/recommendation-only language below is historical and superseded as to current selection. D1–D15 remain ratified.

11 September 2026. **D1–D15 are fully founder-ratified. Q16 is unanswered.** This is one researched product decision about ordinary staff correction of sensitive Support content. It does not choose a platform-wide retention schedule, replace required erasure, or authorize deletion now. The [evidence record](phase26-q16-evidence.md) contains repository authority, primary comparisons and independent challenge.

## The next single decision

**How should authorized staff correct sensitive information accidentally included in a Support message?**

Illustrative example: Maya asks about a receipt, but accidentally includes an unrelated private paragraph and attaches the wrong document. Alex needs the legitimate receipt question to remain understandable while the private material stops appearing in ordinary Support and its derived views. This is an example for testing the design, not evidence of measured ministry incidents.

The distinction is between removing selected content, removing the whole affected content unit, and hiding content while a separately authorized original remains recoverable. The fact that a communication happened, its legitimate remaining work and its owning domain's records must remain truthful under every choice.

## Three meaningful options

| Option                                              | What staff can do                                                                                                                                                                                                                             | Strongest benefit                                                                                              | Main tradeoff                                                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Selective permanent redaction (recommended)** | Select specific sensitive text and/or whole attachments, inspect the exact proposed removal, then commit an irreversible source-owned correction. The useful remainder stays readable. Whole-body removal remains available when appropriate. | Removes unnecessary sensitive material while preserving the context needed to help the requester.              | Requires reliable text/HTML/source mapping and correction of managed copies and derived views. Mistakes must be caught before commitment.  |
| **B — Whole-message or attachment redaction**       | Remove an entire affected message body or selected whole attachment, with an explanatory marker and retained permitted communication facts. No partial text selection.                                                                        | Simpler targeting and less risk of removing the wrong text range.                                              | A small private detail can require losing the useful remainder of that message, causing reconstruction or another request for information. |
| **C — Controlled masking before disposal**          | Hide selected content from ordinary views while qualified custodians can reveal a policy-permitted original until its owner-defined disposal.                                                                                                 | Allows correction of mistaken masking and preserves legitimate controlled access when that is actually needed. | Retains sensitive material and introduces reveal authority, custody, expiry and audit complexity. Masking is not erasure.                  |

These are alternatives for the ordinary correction experience. C is available only where retaining the original is permitted and useful; it never creates a password/secret vault or overrides a required irreversible removal. Mandatory erasure, immediate qualified containment, holds and owner-controlled retention apply under every option. A/B cannot destroy material contrary to a valid hold; an authorized restricted-custody path handles that case. This question does not change those platform obligations.

## Single best recommendation

**A — Selective permanent redaction, with clear pre-commit review and honest removal status.**

It best fits Support's purpose: keep the legitimate request usable while removing material that does not belong there. B is the strongest smaller alternative because whole-body/file targeting is easier to make dependable. C is appropriate when preserving a revealable original solves a demonstrated need, but that has not been established for routine Asym Support mistakes.

Prefer a message action such as **Remove sensitive content…**. An explicit selection state marks text and whole files; the user can unmark or cancel before commitment. The review names the exact scope and explains that permanent removal cannot be undone after completion. The timeline then uses a calm **Content removed** marker without repeating the removed value. No routine warning appears on every ordinary message, and there is no automatic AI/regex scan bundled into A.

Selecting text and reviewing it before irreversible redaction is a documented native Zendesk Agent Workspace workflow. Its documented limitations also show what must be avoided: copied merge content and already-delivered external messages may retain values. Asym's original-source design must cover its managed derivatives rather than merely paint a black box over one view. [Zendesk redaction](https://support.zendesk.com/hc/en-us/articles/4408846470170-Redacting-ticket-content)

Help Scout demonstrates C's different data model: its **early-access** Advanced Privacy Controls retain a revealable original temporarily before disposal. This establishes an alternative, not proven industry consensus or an Asym dependency. Its documented attachment-permission exception would not fit Core. [Help Scout Advanced Privacy Controls](https://docs.helpscout.com/article/1754-advanced-privacy-controls)

## What remains settled under every option

- Support owns its message content and source correction; P6 preserves permitted body-free communication facts. Redaction does not delete a CRM person, alter a gift, complete a task, improve response metrics or mark the conversation resolved.
- Current tenant/source permission and a qualified correction capability govern the action. Viewing, assignment, following, matching email or CRM association alone cannot confer redaction or reveal authority.
- D9 CRM discovery, D10 merge/Undo and D12 related/referral context remain source-aware. A correction must not be undone by a merge reversal, retained managed copy, stale notification preview, prepared reply or delayed replay.
- D15 source corrections invalidate unsafe previews/destinations/unstarted dispatch without generating routine correction emails. Existing P17 prepared material and Recent copy are separately governed; their 7/30-day choices are not a Support transcript retention policy.
- Ordinary content restriction, completed redaction, pending managed-copy cleanup, permitted held custody and external-copy limitations must have truthful states. A cosmetic mask cannot be labelled permanent erasure.
- No promise is made to recall already-delivered email or erase independent downloads outside Asym's control. Provider and backup cleanup follow their actual qualified owner contracts and evidence.
- The routine path must have an authorized recovery/containment route when immediate irreversible disposal is disallowed or cannot yet be proved. It must not require routine direct SQL, silently expose held content, or authorize an unrelated platform DSAR project.

## What the selected answer's review must settle

The complete answer review must resolve exact source scope and capability; text/HTML/Unicode mapping; repeated quoted occurrences; subjects/headers; inline images and whole attachments; draft/prepared material and original-email access; affected indexes/caches/exports/notifications; current-client invalidation; merge/Undo/referral provenance; holds and policy-permitted custody; external/provider/backup limits; concurrency/idempotency; truthful audit without the removed secret; and eventual cleanup/recovery proof.

This question selects the ordinary correction posture first. It does not prematurely select attachment-region editing, automatic detection, a universal retention duration, a legal interpretation, a database schema or an unqualified irreversible tool. Technical facts and owner boundaries should be researched rather than sent back to the founder as implementation questions.

## Record status

D15's exact decision, 26 clauses, 54 proof groups, four event classes, all23 categories, complete UX/template/evidence, twenty-seven adopted corrections, four glossary concepts and nine operational controls are fully ratified. Its substantive review, UX, terms and historical source/proof evidence remain preserved. [Ratification and Q16 validation](d15-ratification-q16-validation.json) verifies current recording separately from the historical D15 review validation.

**Q16 remains unanswered.** A is the single recommendation; B and C are real alternatives with different costs. No D16 answer, ADR0016 or accepted new glossary vocabulary, formal specification, ticket, implementation or external change is inferred.
