# Phase26 implementation and qualification checklist

All tasks below are future work. This planning publication performs none of them. Each story task uses the complete identified story, exact REQ/AC suite and G01–G15 contracts; writing a mock that echoes a command is not completion. Implement one bounded goal at a time with red/green behavior proof, then its necessary authorization, negative and recovery cases. If an accepted owner capability is not qualified yet, stop that dependent activation while retaining the dependency evidence; do not invent a replacement owner.

The numbered groups identify delivery order within Support. Shared owner qualifications in group1 precede their dependent actions; later refinements are already part of every earlier story and must be implemented together where they constrain the same boundary. In particular, D27-C guides depend on P23 publication, D29-X01 depends on P23 action/runtime accessibility, external communication depends on P17/P6, all private drafts/notes share the D35–D38 source rules, and D39/D40 overlay the entire reader/intake lifecycle. These are not optional follow-on changes.

## 1. Existing-owner qualification and proof foundation

- [ ] 1.1 Record actual legacy Support sources, active writers, demo fallbacks and native CRM ownership; bind each source/capability gap to the accepted requirement that resolves it. Prove no Twenty integration is introduced.
- [ ] 1.2 Qualify current authenticated session, tenant/profile and per-capability paths; establish disposable local Supabase identities and real-role API/database fixtures without production credentials or public fixture endpoints.
- [ ] 1.3 Add the separate integration invocation around existing test frameworks and canonical command/intake/job seams; prove it rejects wrong targets, demo fallback and absent required fixtures while the normal unit lane stays offline.
- [ ] 1.4 Establish deterministic external-I/O substitutes, independent database connections and event/clock controls; demonstrate repeatable duplicate, late, crash, contention and ambiguous-result scenarios through real domain boundaries.
- [ ] 1.5 Qualify the existing P17 immutable whole-message preparation and P6 sealed envelope/recovery interfaces, including the local in-product no-provider-artifact contract; record actual supported provider limits as distinct qualification evidence.
- [ ] 1.6 Qualify canonical inbound receiving/occurrence custody, durable jobs, private attachments and restricted-source projections. Record receiving-purpose/provider and retention prerequisites before enabling external intake.
- [ ] 1.7 Establish authenticated Playwright on the same local backend, with genuine source/tenant assertions and no intercepted success substitutes; add keyboard/accessibility and visible failure helpers using established tooling.
- [ ] 1.8 Record schema expansion, mixed-writer fencing and safe rollback order with preserved source/receipt identities; prove migration fixtures cover unknown provenance rather than guessing it.

## 2. D1 — Independently verifiable user outcomes

- [ ] 2.1 US26-D01-01: Continue an ordinary help request by email. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 2.2 US26-D01-02: Compose a correctly attributed reply using only permitted context. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 2.3 US26-D01-03: See truthful work, file availability and CRM context in one conversation. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 2.4 US26-D01-04: Qualify and recover the canonical Support service. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 3. D2 — Independently verifiable user outcomes

- [ ] 3.1 US26-D02-01: Save my tenant-specific initial reply preference. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 3.2 US26-D02-02: Review and deliberately change an exact reply audience. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 3.3 US26-D02-03: Send one native group reply with truthful member outcomes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 3.4 US26-D02-04: Activate explicit audiences without rewriting old sends. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 4. D3 — Independently verifiable user outcomes

- [ ] 4.1 US26-D03-01: Record exactly what Support currently owes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 4.2 US26-D03-02: Set and manage one dependable shared follow-up. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 4.3 US26-D03-03: Change work through the same guarded command from every entry point. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 4.4 US26-D03-04: Retain my place while using complete work and CRM views. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 4.5 US26-D03-05: Migrate and qualify work and reminder behavior. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 5. D4 — Independently verifiable user outcomes

- [ ] 5.1 US26-D04-01: Send a reply with an explicitly chosen work effect. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 5.2 US26-D04-02: Use governed reusable wording and authorized facts. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 5.3 US26-D04-03: Deliver the exact approved native email envelope. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 5.4 US26-D04-04: Enforce prepared-content custody and current capacity. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 5.5 US26-D04-05: Qualify the one canonical human-reply path. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 6. D5 — Independently verifiable user outcomes

- [ ] 6.1 US26-D05-01: End further follow-up for an honestly unanswered remaining need. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 6.2 US26-D05-02: Choose a local ending or an optional final human reply. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 6.3 US26-D05-03: Recover, correct and report an ending truthfully. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 6.4 US26-D05-04: Activate the bounded manual ending capability. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 7. D6 — Independently verifiable user outcomes

- [ ] 7.1 US26-D06-01: Configure shared coverage and qualified receiving pools. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 7.2 US26-D06-02: Control receipt of new automatic assignments and understand my limit. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 7.3 US26-D06-03: Apply one fair and guarded first-assignment policy. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 7.4 US26-D06-04: Save, pause and resume assignment policy with an honest impact. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 7.5 US26-D06-05: Qualify and recover assignment without a second identity or workflow system. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 8. D7 — Independently verifiable user outcomes

- [ ] 8.1 US26-D07-01: Start temporary coverage for reviewed inboxes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 8.2 US26-D07-02: Retain or hand off a particular covered conversation deliberately. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 8.3 US26-D07-03: Change or end coverage at a clear instant. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 8.4 US26-D07-04: Enforce coverage independently of CRM and message ownership. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 8.5 US26-D07-05: Keep coverage understandable and recoverable at scale. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 9. D8 — Independently verifiable user outcomes

- [ ] 9.1 US26-D08-01: Reconcile work affected by confirmed loss of handling access. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 9.2 US26-D08-02: Choose the fixed access-loss handoff policy. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 9.3 US26-D08-03: Settle current shared or review-first handoffs. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 9.4 US26-D08-04: Preserve separate data, CRM and sending authority during access loss. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 9.5 US26-D08-05: Inspect complete handoff progress and qualify rollout. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 10. D9 — Independently verifiable user outcomes

- [ ] 10.1 US26-D09-01: Add or remove optional peer CRM context. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 10.2 US26-D09-02: Find relevant Support conversations and genuine communication history. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 10.3 US26-D09-03: Correct links and attribution through owner lifecycle changes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 10.4 US26-D09-04: Move between the same conversation and owner actions. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 10.5 US26-D09-05: Recover and qualify the shared projections. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 11. D10 — Independently verifiable user outcomes

- [ ] 11.1 US26-D10-01: Merge a reviewed pair of duplicate requests. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 11.2 US26-D10-02: Continue handling merged work and original email routes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 11.3 US26-D10-03: Undo a specific current merge relationship. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 11.4 US26-D10-04: Inspect combined and original history with clear provenance. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 11.5 US26-D10-05: Operate and qualify source-preserving merge and Undo. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 12. D11 — Independently verifiable user outcomes

- [ ] 12.1 US26-D11-01: Request or reuse bounded accountable internal assistance. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 12.2 US26-D11-02: Admit assistance with one durable source binding. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 12.3 US26-D11-03: Review returned work and deliberately end my interest. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 12.4 US26-D11-04: Collaborate through a clear private task and CRM journey. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 12.5 US26-D11-05: Qualify and recover assistance under realistic load. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 13. D12 — Independently verifiable user outcomes

- [ ] 13.1 US26-D12-01: Create independent related work from an exact source message. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 13.2 US26-D12-02: Review both resulting work and custody plans. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 13.3 US26-D12-03: Start a deliberate native email thread for the new issue. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 13.4 US26-D12-04: Refer an old-route update and navigate related work. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 13.5 US26-D12-05: Correct relationships, context or unused tracking. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 13.6 US26-D12-06: Qualify the complete related-work lifecycle and performance. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 14. D13 — Independently verifiable user outcomes

- [ ] 14.1 US26-D13-01: Enable a clear New request confirmation policy. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 14.2 US26-D13-02: Apply exact safe confirmation eligibility. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 14.3 US26-D13-03: Publish a bounded truthful Support request received message. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 14.4 US26-D13-04: Admit and recover one current automatic confirmation. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 14.5 US26-D13-05: See honest automatic correspondence and operational readiness. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 15. D14 — Independently verifiable user outcomes

- [ ] 15.1 US26-D14-01: Configure reply targets. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 15.2 US26-D14-02: See the correspondence still owed. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 15.3 US26-D14-03: Settle and correct reply obligations. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 15.4 US26-D14-04: Find due work in its current home. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 15.5 US26-D14-05: Interpret performance correctly. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 15.6 US26-D14-06: Retain cross-domain authority. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 15.7 US26-D14-07: Operate and qualify reply targets. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 16. D15 — Independently verifiable user outcomes

- [ ] 16.1 US26-D15-01: Choose my exact follow scope. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 16.2 US26-D15-02: Receive useful permitted activity. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 16.3 US26-D15-03: Control optional email and attention. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 16.4 US26-D15-04: Preserve interests through source changes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 16.5 US26-D15-05: Find followed work accessibly. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 16.6 US26-D15-06: Operate private follow evidence. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 17. D16 — Independently verifiable user outcomes

- [ ] 17.1 US26-D16-01: Remove exact sensitive content. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 17.2 US26-D16-02: Make restriction effective once. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 17.3 US26-D16-03: Preserve independent work and records. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 17.4 US26-D16-04: Keep drafts and outgoing copies safe. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 17.5 US26-D16-05: Prove cleanup and lawful recovery. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 18. D17 — Independently verifiable user outcomes

- [ ] 18.1 US26-D17-01: Publish finite retention policy. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 18.2 US26-D17-02: Keep content for real work purposes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 18.3 US26-D17-03: Retain useful truthful context after expiry. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 18.4 US26-D17-04: Enforce expiry before cleanup. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 18.5 US26-D17-05: Operate complete source retention. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 19. D18 — Independently verifiable user outcomes

- [ ] 19.1 US26-D18-01: Find and personalize useful wording. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 19.2 US26-D18-02: Save My replies privately. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 19.3 US26-D18-03: Curate Shared replies deliberately. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 19.4 US26-D18-04: Retire and restrict wording correctly. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 19.5 US26-D18-05: Operate one secure library. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 20. D19 — Independently verifiable user outcomes

- [ ] 20.1 US26-D19-01: Maintain viable intake review coverage. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 20.2 US26-D19-02: Inspect and decide one held input. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 20.3 US26-D19-03: Recover technical and mistaken decisions. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 20.4 US26-D19-04: Apply honest held-content deadlines. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 20.5 US26-D19-05: Follow accountable review attention. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 20.6 US26-D19-06: Qualify one secure intake path. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 21. D20 — Independently verifiable user outcomes

- [ ] 21.1 US26-D20-01: Open and adjust useful views. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 21.2 US26-D20-02: Save the exact reviewed query. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 21.3 US26-D20-03: Maintain Shared views without data grants. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 21.4 US26-D20-04: Personalize navigation and return. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 21.5 US26-D20-05: Keep live results and action targets truthful. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 21.6 US26-D20-06: Operate reliable view definitions. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 22. D21 — Independently verifiable user outcomes

- [ ] 22.1 US26-D21-01: Apply optional readable labels. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 22.2 US26-D21-02: Maintain a stable vocabulary. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 22.3 US26-D21-03: Use label views and reports honestly. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 22.4 US26-D21-04: Preserve label privacy across surfaces. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 22.5 US26-D21-05: Operate reliable label membership. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 23. D22 — Independently verifiable user outcomes

- [ ] 23.1 US26-D22-01: Search authorized content literally. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 23.2 US26-D22-02: Open the exact match. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 23.3 US26-D22-03: Exclude restricted sources from discovery. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 23.4 US26-D22-04: Recover complete bounded search. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 23.5 US26-D22-05: Keep future search governed. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 24. D23 — Independently verifiable user outcomes

- [ ] 24.1 US26-D23-01: Use the correct professional signature. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 24.2 US26-D23-02: Maintain signatures in Email Studio. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 24.3 US26-D23-03: Compose with canonical rich text. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 24.4 US26-D23-04: Preserve source and identity authority. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 24.5 US26-D23-05: Qualify editor and email output. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 25. D24 — Independently verifiable user outcomes

- [ ] 25.1 US26-D24-01: Stage a useful reply-and-work shortcut. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 25.2 US26-D24-02: Admit reply and work together. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 25.3 US26-D24-03: Curate exact shortcut revisions. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 25.4 US26-D24-04: Inspect use and protect copied sources. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 25.5 US26-D24-05: Qualify bounded shortcuts and later AI. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 26. D25 — Independently verifiable user outcomes

- [ ] 26.1 US26-D25-01: Complete the appropriate receiving path. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 26.2 US26-D25-02: Prove actual addresses and message paths. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 26.3 US26-D25-03: Maintain routes without losing mail. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 26.4 US26-D25-04: Isolate provider authority. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 26.5 US26-D25-05: Recover and dispose setup material. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 26.6 US26-D25-06: Qualify both setup paths. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 27. D26 — Independently verifiable user outcomes

- [ ] 27.1 US26-D26-01: Record a real non-email Support need. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 27.2 US26-D26-02: Give manual work a real home. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 27.3 US26-D26-03: Work every justified request from CRM. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 27.4 US26-D26-04: Contact someone later deliberately. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 27.5 US26-D26-05: Correct and retain original work honestly. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 27.6 US26-D26-06: Operate one secure manual source. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 28. D27 — Independently verifiable user outcomes

- [ ] 28.1 US26-D27-01: As a Support worker, I want to find a selected public guide in the right Site and language, so that I can consult relevant information without losing my reply. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 28.2 US26-D27-02: As a Support worker, I want to insert a public guidance link at my intended selection, so that I can share useful information in one clear action. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 28.3 US26-D27-03: As an authorized curator, I want to maintain the tenant's public guidance selection, so that staff receive useful current sources without another CMS. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 28.4 US26-D27-04: As a Support worker, I want to consult clearly labelled Internal staff guides, so that I can follow reusable procedures while keeping them out of outgoing content. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 28.5 US26-D27-05: As an authorized guide maintainer, I want to draft, publish and maintain an Internal guide, so that common instructions can improve without accidental publication. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 28.6 US26-D27-06: As a tenant security owner, I want to keep Public and Internal guidance within their actual source boundaries, so that source reuse cannot expose protected material. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 28.7 US26-D27-07: As a Support worker, I want to use Guidance through the same authorized Support and CRM context, so that I avoid re-entry without changing other domains. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 28.8 US26-D27-08: As a platform operator, I want to activate and operate qualified Guidance, so that staff get complete safe lookup and manageable recovery. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 29. D28 — Independently verifiable user outcomes

- [ ] 29.1 US26-D28-01: As an authorized feedback manager, I want to enable a small automatic feedback policy, so that the tenant can sample feedback without staff selecting favored recipients. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 29.2 US26-D28-02: As a Support operator, I want to select feedback opportunities once from genuine completed work, so that sampling and reporting remain honest through repeated completion and merging. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 29.3 US26-D28-03: As a requester, I want to receive feedback invitations sparingly at a justified endpoint, so that the invitation does not repeatedly interrupt me or misrepresent my identity. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 29.4 US26-D28-04: As a requester, I want to submit a short neutral response and stop future invitations, so that I can express my experience without creating an account or giving marketing consent. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 29.5 US26-D28-05: As an authorized feedback reviewer, I want to review every submitted response in context, so that feedback leads to appropriate human attention without automatic promises. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 29.6 US26-D28-06: As a Support analyst, I want to see accurate feedback cohorts and exclusions, so that sampling and response rates cannot hide uncertainty. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 29.7 US26-D28-07: As a platform owner, I want to deliver and operate feedback through shared contact, content and transport owners, so that a survey feature cannot bypass communication or privacy controls. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 30. D29 — Independently verifiable user outcomes

- [ ] 30.1 US26-D29-01: As a person seeking help, I want to contact the tenant immediately, so that I can ask for help without a questionnaire or self-service barrier. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 30.2 US26-D29-02: As a person seeking information, I want to open a relevant optional public guide, so that I can get information without losing my contact form. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 30.3 US26-D29-03: As a signed-in requester, I want to review my own reply address and optional account context, so that staff can understand the request without receiving unauthorized account details. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 30.4 US26-D29-04: As a requester, I want to receive a dependable acknowledgment of my submitted request, so that I know whether the tenant actually accepted responsibility. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 30.5 US26-D29-05: As an authorized tenant manager, I want to optionally enable a neutral visitor email confirmation, so that browser receipt can be supplemented without duplicate or stale mail. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 30.6 US26-D29-06: As an authorized Help maintainer, I want to manage actual contact and guide placements through their owners, so that the tenant's contact path stays clear and supportable. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 30.7 US26-D29-07: As a requester using assistive technology or a narrow device, I want to complete the same contact journey accessibly, so that I can reach the tenant regardless of input method. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 31. D30 — Independently verifiable user outcomes

- [ ] 31.1 US26-D30-01: As a Support worker, I want to see current work without losing normal navigation, so that I can find the next legitimate action quickly. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 31.2 US26-D30-02: As a Support analyst, I want to review historical results under clear independent scope, so that each metric retains its actual meaning. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 31.3 US26-D30-03: As a Support analyst, I want to choose and inspect a precise reporting period, so that I understand the dates and partial interval behind the results. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 31.4 US26-D30-04: As a Support analyst, I want to open the exact source detail behind a result, so that I can inspect evidence without changing its denominator. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 31.5 US26-D30-05: As a Support worker, I want to refresh useful results without disruptive motion, so that I can trust freshness while continuing my task. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 31.6 US26-D30-06: As a platform reporting owner, I want to evolve a fixed overview toward future full configuration, so that the accepted long-term direction remains possible without a premature builder. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 31.7 US26-D30-07: As a platform security and operations owner, I want to serve complete authorized report results efficiently, so that derived views cannot leak or distort source truth. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 32. D31 — Independently verifiable user outcomes

- [ ] 32.1 US26-D31-01: As a Support worker, I want to choose a consistent quick follow-up time, so that I can schedule without doing calendar arithmetic. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 32.2 US26-D31-02: As a Support worker, I want to enter a custom date, time and zone directly, so that I can schedule an exact useful moment without endless calendar clicks. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 32.3 US26-D31-03: As a Support worker, I want to change or remove the shared reminder without altering unrelated work, so that follow-up remains understandable. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 32.4 US26-D31-04: As a Support worker, I want to recover an uncertain reminder change across views and CRM, so that a retry preserves the time I actually selected. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 32.5 US26-D31-05: As a platform operator, I want to execute follow-up reliably through the existing owners, so that a long horizon or outage cannot silently lose work. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 33. D32 — Independently verifiable user outcomes

- [ ] 33.1 US26-D32-01: As a Support worker, I want to preview an eligible attachment where I am working, so that I can understand the file without losing context. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 33.2 US26-D32-02: As a Support worker, I want to read document, slide and image previews with honest coverage, so that I can rely on what the preview actually shows. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 33.3 US26-D32-03: As a Support worker, I want to inspect spreadsheet and text values without changing them, so that file reading cannot recalculate or corrupt evidence. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 33.4 US26-D32-04: As a platform file owner, I want to create source-bound private renditions safely, so that untrusted files cannot escape their processing or permission boundary. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 33.5 US26-D32-05: As a platform operator, I want to enforce exact preview budgets and recovery, so that one difficult file cannot overwhelm other tenants. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 33.6 US26-D32-06: As a Support worker, I want to use files coherently across Support and CRM, so that the platform preserves both source meaning and my work. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 34. D33 — Independently verifiable user outcomes

- [ ] 34.1 US26-D33-01: As a Support worker, I want to choose my Compact or Full reading default where I read, so that I can use the presentation that suits me. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 34.2 US26-D33-02: As a Support worker, I want to read compact history without losing unique content, so that repeated email material does not overwhelm the conversation. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 34.3 US26-D33-03: As a Support worker, I want to find exact content and return without losing place, so that reading mode does not make work harder. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 34.4 US26-D33-04: As a platform owner, I want to store only the small qualified personal reading preference, so that presentation cannot become another authority or disclosure path. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 35. D34 — Independently verifiable user outcomes

- [ ] 35.1 US26-D34-01: As a Support worker, I want to see when a teammate is actively composing, so that I can coordinate without treating a hint as a lock. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 35.2 US26-D34-02: As a Support worker, I want to receive responsive composing cues without stale certainty, so that the interface does not lag behind actual collaboration. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 35.3 US26-D34-03: As a platform security owner, I want to authorize composing awareness through trusted source sessions, so that realtime transport cannot widen access. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 35.4 US26-D34-04: As a platform engineer, I want to integrate awareness without remounting or slowing the editor, so that typing and navigation remain stable. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 35.5 US26-D34-05: As a Support and CRM user, I want to keep awareness separate from my actual work and messages, so that coordination cues cannot accidentally cause an action. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 36. D35 — Independently verifiable user outcomes

- [ ] 36.1 US26-D35-01: As an original note author, I want to edit my own eligible posted Internal note simply, so that I can correct a mistake without adding needless process. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 36.2 US26-D35-02: As a Support reader, I want to inspect trustworthy note history, so that I can understand what was corrected. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 36.3 US26-D35-03: As a note author, I want to correct content without new file or mention side effects, so that minor editing remains predictable. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 36.4 US26-D35-04: As a note author, I want to recover Save without duplicate revisions or lost corrections, so that another tab or network failure cannot overwrite my intent. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 36.5 US26-D35-05: As a platform owner, I want to keep note correction within Support's authority, so that editing cannot leak or distort other domains. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 37. D36 — Independently verifiable user outcomes

- [ ] 37.1 US26-D36-01: As a Support worker, I want to write a new reply without automatic old-history bulk, so that my answer stays readable. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 37.2 US26-D36-02: As a Support worker, I want to add and edit a useful source quotation in place, so that adding context feels like ordinary writing. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 37.3 US26-D36-03: As a Support worker, I want to review quote disclosure when source or recipients change, so that I do not send context to an unintended audience. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 37.4 US26-D36-04: As a platform content and messaging owner, I want to compile the complete reviewed quote once, so that the sent message has the intended content and durable identity. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 38. D37 — Independently verifiable user outcomes

- [ ] 38.1 US26-D37-01: As a Support worker, I want to find my private saved Reply drafts in one place, so that I can resume interrupted work without reconstructing old filters. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 38.2 US26-D37-02: As a Support worker, I want to have meaningful Reply work saved quietly, so that I do not lose content or have to press Save repeatedly. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 38.3 US26-D37-03: As a Support worker, I want to resume the exact draft under current source authority, so that my text and audience are not silently retargeted. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 38.4 US26-D37-04: As a Support worker, I want to switch pages and recover uncertain saves safely, so that interruptions do not turn into duplicate or lost work. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 38.5 US26-D37-05: As a Support worker, I want to discard or send only the exact intended draft, so that one action cannot remove another person's or purpose's work. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 38.6 US26-D37-06: As a platform owner, I want to protect and operate personal Reply persistence, so that private interrupted work stays safe across source and schema changes. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 39. D38 — Independently verifiable user outcomes

- [ ] 39.1 US26-D38-01: As a Support worker, I want to find unfinished new Internal notes beside my Reply drafts, so that private work is easy to resume with a clear purpose. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 39.2 US26-D38-02: As a Support worker, I want to save incomplete note content and files honestly, so that I can pause before everything is ready. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 39.3 US26-D38-03: As a Support worker, I want to post a ready Internal note deliberately, so that my team sees only what I chose to publish. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 39.4 US26-D38-04: As a Support worker, I want to switch purposes and leave without losing either draft, so that the interface does not fight normal interruptions. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 39.5 US26-D38-05: As a platform owner, I want to apply the existing private draft lifecycle to Notes safely, so that the extension does not create another store or communication authority. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 40. D39 — Independently verifiable user outcomes

- [ ] 40.1 US26-D39-01: As a Support worker, I want to see which permitted conversation content is unread for me, so that I can orient myself without changing the team's work. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 40.2 US26-D39-02: As a Support worker, I want to catch up through one deliberate successful conversation opening, so that I do not need to scroll every historical original. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 40.3 US26-D39-03: As a Support worker, I want to mark a conversation read or unread deliberately, so that my own intent remains useful across tabs. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 40.4 US26-D39-04: As a platform owner, I want to derive personal orientation from committed source truth, so that concurrency and access changes cannot create false reads. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 40.5 US26-D39-05: As a Support and CRM user, I want to keep reading preferences and context separate from message authority, so that the same view is coherent across Asym. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 41. D40 — Independently verifiable user outcomes

- [ ] 41.1 US26-D40-01: As an authorized Support worker, I want to mark truly unwanted admitted email correspondence aside, so that ordinary work views stay useful without misrepresenting service. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 41.2 US26-D40-02: As a Support worker, I want to restore current work and find unwanted history, so that a mistake is recoverable without rolling back reality. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 41.3 US26-D40-03: As a Support worker, I want to keep lawful drafts and explanatory notes useful after marking, so that cleanup does not destroy private work or prevent explanation. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 41.4 US26-D40-04: As an authorized receiving-inbox manager, I want to hold future email from one exact observed mailbox, so that repeated unwanted intake can receive accountable review without a person ban. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 41.5 US26-D40-05: As an authorized receiving-inbox manager, I want to inspect and stop sender holds simply, so that policy remains understandable after the original message is gone. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 41.6 US26-D40-06: As an intake owner, I want to apply future-mail policy at first durable acceptance, so that retries and worker delays cannot change what future means. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 41.7 US26-D40-07: As a platform owner, I want to keep unwanted handling separate from CRM and communications, so that cleanup cannot become a hidden consent or message action. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.
- [ ] 41.8 US26-D40-08: As a platform security and operations owner, I want to enforce and operate the two independent effects safely, so that mistakes remain bounded and diagnosable. Complete its mapped owner command/projection and user interaction with the full positive, negative and recovery acceptance suite; include every later amendment that qualifies this goal.

## 42. Cross-surface release qualification

- [ ] 42.1 Execute all independently authenticated tenant/role/capability and resulting-row transformation cases against real grants/RLS/views/RPC/Storage, including exact source revocation and privileged paths; retain denial and no-effect evidence.
- [ ] 42.2 Execute the full source/CRM journey: intake without duplicate Party creation, authorized link/context navigation, denied protected context, owning-domain action and history, merge/unlink/restriction and return to the preserved Support draft.
- [ ] 42.3 Execute every ratified commit-order, duplicate/replay, stale version/generation, expiry, close/reopen, source transfer and ambiguous external outcome case; retain the accepted effect/receipt evidence after recovery.
- [ ] 42.4 Execute reply/note/quote/signature/attachment and My drafts journeys across interruptions, two devices/tabs, permission changes, selected original changes and post/send ambiguity without externalizing private content.
- [ ] 42.5 Execute Compact/Full, personal read/unread, realtime composing, quick choices, contextual guides/direct contact and Unwanted/Restore/Release journeys with correct defaults, focus, navigation and independent underlying state.
- [ ] 42.6 Complete D29 original and X01 accessibility proof, keyboard and assistive-technology review, localization/time-zone fixtures, mobile keyboard and low-bandwidth journeys using the shared Base UI/base-maia and Tiptap profiles.
- [ ] 42.7 Qualify required real-provider behavior in an explicitly isolated authorized test environment; record plan/edition/version/date, complete envelope/custody boundaries and actual limitations. Substitutes and source inspection cannot pass this task.
- [ ] 42.8 Run production-shaped data/concurrency and per-tenant fairness workloads against the exact per-decision numerical requirements; publish measured budgets and avoid claiming unmeasured capacity.
- [ ] 42.9 Exercise restore/reconciliation, custody expiry, exact-pair future-mail holds, held-review failover and operational controls with named accountable operators and the accepted signal/threshold/response.
- [ ] 42.10 Rehearse migration/backfill, old/new writer fencing, scoped kill switches and roll-forward after accepted new writes; verify rollback cannot reactivate unsafe writers or duplicate external intent.
- [ ] 42.11 Run repository-required focused checks and the applicable CI preflight; reconcile any skipped/mocked lane separately from genuine backend, browser, provider and intended-user evidence.
- [ ] 42.12 Verify every US/REQ/AC/operational-control trace target has its actual release evidence and all dependency gates passed for the activation scope; record unresolved qualification as blocked scope, never as completed behavior.
