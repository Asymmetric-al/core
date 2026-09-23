> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Financial draft — independent owner review

9 September 2026. Read `financial-contract.md` and the document/receipt/export/annual/DAF/IRA stories against the ratified Q05/Q08/Q10/Q13/Q20/Q23/Q28/Q29 and final owner boundaries. This is a bounded material-correction review. No financial draft, source or canonical file was edited.

## Required amendment 1 — Keep legal-donor fact ownership with P13/P7

D01 currently says **“P14 owns legal donor/recognition/matching facts through its declared interfaces.”** That overstates P14 ownership: its Legal lens consumes the contribution source; it does not become the owner of immutable legal-donor contribution facts. The same paragraph already assigns headers/money to P13, so the current text leaves two plausible authorities.

Replace the owner sentence with:

> P13 owns the contribution's immutable legal-donor identity and monetary facts; P7 owns applicable donor/receipt eligibility and frozen receipt facts. P14 owns recognition and matching source facts and composes the permitted Legal/Recognition reads from their authoritative owners. The Legal read lens does not gain authority to rewrite P13's legal donor.

This is a governing-owner precision, not new product scope. No story needs a new donor capability. Ensure any cross-owner authority summary repeats the same distinction.

## Required amendment 2 — Make document response identity and ordinary retrieval explicit

D07 preserves successor and access distinctions but currently compresses the decisive byte guarantee into “Range/stream and current egress rules apply.” Story D31 already requires no splicing. Ratified Q08 C13/P06 and its storage invariants are more precise and should be carried into the normative contract so an implementer cannot independently resolve a new head for each chunk.

Add:

> Before each full, HEAD, Range or conditional response begins, re-prove current recipient authority, logical head, records/health eligibility and exact object metadata. Bind that response to one immutable object generation, digest and length throughout; a successor promotion never splices its bytes into the response. Every later request reauthorizes under current owner policy. A mismatched or unhealthy artifact is unavailable pending owner recovery, never a generic receipt or raw Storage fallback. Normal qualified view/download/local print is unmetered as a product capability, subject to the existing applicable security controls; it creates no copy request, donor download/read count or issuance event.

This makes D29/D31 directly falsifiable while preserving independent currentness, pending valid predecessor, withdrawn predecessor denial, guest assurance and source-copy request semantics. It does not hold a database transaction across human reading or waive P12's governed streaming rules.

## Material boundaries that pass

- D07 exact document grants remain narrower than dashboard/list/civil identity, and guest possession/forwarding limits are stated honestly. Ordinary authenticated assurance is not challenged redundantly.
- D08 receipt quieting is exact issuer/legal-donor/purpose, independent of represented payment or document access. The pre-occurrence not-requested decision, continuing documents, required notices, prospective On and already-admitted work preserve Q13.
- D09/D10 preserve reviewed current filters versus accepted frozen extraction, exact initiator/issuer/currency/date/measure, envelope/preparation/Ready clocks, no silent widening, immutable as-of bytes and current rights contraction. No profile update becomes an export or delivery authority.
- D12's informational monetary population remains separate from document populations. D15–D17 preserve DAF advisor versus sponsor legal giving, partial attribution versus complete grant, IRA owner/beneficiary versus custodian, intended QCD versus organization case versus personal tax outcome, and lawful separately admitted other-case successors. No new tax calculator, dark-purpose generic receipt or automatic financial mutation is introduced.
- D18 expressly keeps G01 and source/renderer/provider qualification open. Existing source/catalog tests are not presented as native target proof, and historical artifact access is independent from new issuance readiness.

## Identity trace self-check requested by parent

The identity trace currently has **276 records**, not277:147 normative definitions,55 proof/gate definitions,25 historical observations and49 unnumbered/final addenda. Forty stories target16 actual contract heading IDs. The mechanically checked families cover Q11 A1–A5/J01–J12/C01–C22/P01–P16; Q14 A1–A6/J01–J16/C01–C22/T01–T16/G01–G03; Q27 A1–A5/J01–J18/V01–V14/C01–C22/T01–T20/M1–M5. Q04's unnumbered controlling recommendation and ten behavior bullets are individually traced.

Normative A1/A2/A3 are not merged with historical OBS.A01/OBS.A02/OBS.A03. Historical observations have `historical_evidence_only` disposition, target proof is `required_unrun_target_proof`, and G01 explicitly remains `unresolved_native_qualification`. `incorporated` means incorporated into the draft normative specification, not implemented, deployed, canonically merged or a new runtime grant. Source line bounds, unique trace IDs and section/story links passed mechanical validation; that validation does not independently prove every semantic requirement or any runtime outcome.

No additional material contradiction was found in this bounded review. The two corrections above should precede publication of the consolidated specification.
