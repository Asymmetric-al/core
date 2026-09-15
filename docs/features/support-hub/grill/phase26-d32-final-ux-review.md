# D32 — Independent final UX and fidelity review

**13 September 2026. Review of the actual proposed D32 package.** Founder selected C; detailed amendments remain proposed. This is a document/contract review, not browser, accessibility, renderer, load or usability proof.

**Final status: Pass. All five findings are resolved in the actual package.** Initial findings and intermediate checks below are retained as review history; they do not describe remaining defects.

## Reviewed artifacts

- [Main decision, R01–R28](phase26-d32-adversarial-review.md)
- [Actual reader journey](phase26-d32-ux-blueprint.md)
- [Data/preview contract](phase26-d32-data-contract.md)
- [Email Studio/CRM/Document Studio seam](phase26-d32-email-studio-integration.md)
- [Release proof and operations, P01–P40 and O01–O06](phase26-d32-proof-and-operations.md)
- [Independent UX research and primary evidence](phase26-d32-ux-research.md)

## Initial disposition

**Accept with the five precise corrections below.** The package otherwise provides a coherent and bounded broader reader. These findings concern truthful interpretation of the already-selected modes; they do not propose another editor, new file formats, another workflow or more settings.

| Finding                                          | Severity / likelihood                 | Actual ambiguity and necessary correction                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX-F01 — DOCX caption                            | Medium / plausible confusion          | The UX caption **Tracked changes and comments are not shown** can imply that revision effects are absent, even though no-markup shows the resulting text. Replace with **Revision markup and comments are not shown**; where useful add **Pending revisions remain in the original**. R10's no-markup definition itself is sound. P06 must verify the rendered result without accepting/rejecting source revisions.                                                                         |
| UX-F02 — Pivot results versus pivot features     | High / plausible implementation error | R12/UX/P11 say pivots are omitted while the profile preserves visible saved cell values. Clarify that **pivot definitions, refresh and interactivity are omitted; visible saved pivot-result cells remain ordinary represented saved cells, without refresh or new synthesis from pivot caches**. Otherwise valid visible values may be stripped or the limitation notice may make a false claim about what was omitted. Add that fixture to P11.                                           |
| UX-F03 — Animated variants of listed image types | Medium / plausible                    | R14 explicitly defines GIF's still frame, but listed PNG/WebP can also be animated. Either explicitly decline animated variants or use a defined first composited still frame with the same animation-not-shown notice. Do not accidentally autoplay or imply complete representation. This is format qualification of existing listed types, not a request for animation playback. Cover APNG/animated WebP in P03.                                                                        |
| UX-F04 — Find and unloaded content               | Medium / plausible false negative     | Find is scoped to represented content, but bounded initial loading could be implemented as DOM-only search. Clarify that **Find covers the declared represented preview scope, including not-yet-loaded pages/sheets, or explicitly identifies the searched subset while incomplete**. A no-match result cannot imply that unloaded represented content was searched. Add a later-page/sheet match and incomplete-search state to P29. This does not add D22 indexing or OCR.               |
| UX-F05 — Cached-value freshness proof            | High / plausible misleading claim     | P09 says cache presence, absence and stale data are distinguishable. Presence/absence can be known; arbitrary input bytes do not establish whether a saved value is stale. Replace with **Cache presence/absence is distinguishable; a fixture with intentionally stale caches shows those exact saved values with Saved values—not recalculated provenance, never a fresh/current result claim.** No recalculation or external truth service should be added to satisfy the mistaken test. |

Each correction was sent to the parent before writing this report. Their application must be verified from the actual files before the final Pass is appended.

## Complete journey checks that already pass document review

The actual package consistently separates permitted metadata, Preview and Download original. It does not auto-fetch every attachment or turn a failed render into a download bypass. Filename identity remains subordinate to the source occurrence and current rights. Unscanned, restricted, unsupported, oversized and failed states are distinguished without leaking secret paths or claiming missing bytes.

The single responsive reader preserves the Support draft, recipients, work intent, scroll and CRM return path. Reading or closing does not complete a request, send mail, publish a reusable asset or update CRM/giving. The full-height mobile treatment, clear close/back, meaningful page/sheet/cell coordinates and per-format controls are proportionate. Optional adjacent-file navigation remains bounded to the invoking message.

DOCX no-markup reading, static PPTX, the XLSX visible saved-value grid and literal TXT/CSV are materially different and are documented as such. Spreadsheets are not a print-area PDF. Missing cached results remain unavailable rather than false zero/blank; raw precision, workbook dates, hidden-state coordinates and literal CSV identifiers are preserved. The accepted per-view Comma/Semicolon/Tab selector solves real compatibility without a preference hierarchy or import wizard.

The current limits define binary MiB/GiB, actual streamed/expanded content, hidden-sheet/cell accounting, sparse allocation, decoded image memory, output and attempt budgets. Reaching a bound cannot produce a silent fake-complete truncation. These remain proposed engineering ceilings with maximum-plus-one and malicious-resource proof, not vendor capacity claims.

Accessibility is treated realistically: product controls and represented values require usable keyboard/assistive-technology paths, while an arbitrary scanned source is not declared accessible through a canvas or invented transcript. Text/grid alternatives remain within the same represented content. The package explicitly avoids impossible copy/screenshot prevention and remote erasure claims. Existing source restrictions still fence future reads and late output, with current-client invalidation and safe return.

Maintenance belongs to the shared file/preview owner. Staff do not maintain converter accounts, renderer plugins or quota settings. Fixed derivative custody, exact generation lineage, per-profile disablement, qualified retries and upgrade fixtures preserve original source authority. No current vendor or dependency is treated as automatically qualified. Every selected broader format must actually pass before C is called complete.

## Proof limits

P01–P40 are explicitly required and unexecuted. O01–O06 identify owners, signals, thresholds and responses without replacing preventive fidelity/security gates. The direct-source research, document checks and synthetic probes do not establish a successful renderer, private byte gateway, database/RLS implementation, browser experience, assistive-technology experience or real tenant task outcome. No perfect-UI or legal-compliance claim is made by this review.

## Applied-correction verification

Re-read the actual main, UX, data and proof files after the parent's corrections. UX-F01 is resolved by the revision-markup caption and explicit pending revisions in the original. UX-F03 is resolved by R14/P03's defined still frame for GIF and animated PNG/WebP. UX-F04 is resolved by R21, UX Find and P29's complete declared scope, later-page/sheet case and Search incomplete state. UX-F05 is resolved by P09's known-stale fixture without claiming arbitrary freshness detection.

UX-F02's substantive contract and proof are resolved in R12, the spreadsheet journey and P11: saved visible pivot-result cells remain, while definitions/refresh/interactivity are omitted. At this verification point, the initial UX matrix still says **charts/pivots**, so its short summary needs the same correction to **charts or pivot interaction** before an unqualified final Pass. This is the same finding, not a new scope request.

Also verified the cross-review lifecycle additions: R07/data/P32 atomically transfer accepted output out of tentative cleanup custody, and R17/data/P22 distinguish a stable input key from a fresh generation after rendition expiry without renewing old deadlines or extending original retention. These are coherent with the existing staff journey. No additional material UX issue was found.

## Final verification — Pass

A fresh read of the absolute Windows UX file confirms its XLSX matrix now says **charts or pivot interaction/refresh. Visible saved pivot-result cells remain.** This closes the last summary residue of UX-F02 and matches R12, the detailed spreadsheet journey and P11. UX-F01–UX-F05 are all resolved. The additional tentative-to-Ready custody and post-expiry generation clarifications remain consistent.

**Pass for the complete proposed D32 UX/fidelity contract. No material review findings remain.** The single viewer, declared format modes, complete-scope Find, literal CSV control, honest limits, CRM/draft return, maintenance and accessibility requirements are coherent without adding unrelated product scope. P01–P40 remain required unexecuted release proof; this Pass does not certify a running viewer or tested perfect UI.
