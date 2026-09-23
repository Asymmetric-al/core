# Independent Q18 gap review — 11 September 2026

**Independent research input:** The [final Q18 comparison](phase26-q18-reusable-reply-library.md) and [reconciled evidence](phase26-q18-evidence.md) govern any differences in candidate wording. Q18 is unanswered; no new decision is accepted. In particular, C still requires deliberate publication and does not automatically expose unpublished drafts.

Read-only scope: canonical Phase26 worktree at /home/conrad/code/core-worktrees/grill-with-docs-2026-09-10; cwd verified, root AGENTS and canonical grill-with-docs/grilling/domain-modeling read. D17 was fully ratified by the founder in the current turn; older in-file pending labels are being reconciled by the parent. No product, provider, GitHub or repository mutation performed by this reviewer.

## Recommended next fork

**Who should be able to keep reusable Support wording, and who can make it available to the team?**

This is a real launch product/governance choice. Do not re-ask whether reusable replies exist, their picker/insertion behavior, or whether a macro builder exists: D4 already settles eligible Email Studio content, copy on insertion, editing, exact send review and no implicit work effects. Phase34 excludes a new configurable Support action engine.

Concrete example (illustrative, not an established ministry study): a worker writes a useful neutral explanation of how to request a corrected receipt. They want to reuse the wording. Decide whether it must first enter the organization library, can remain their own working wording, or immediately becomes team-shared content. Actual receipt issuance and any donor-specific facts remain owner actions, not saved text authority.

A — **Shared curated replies only.** Staff use a common published library; authorized library editors maintain it. Smallest model and strongest consistency; workers cannot keep private reusable variants in-product and may resort to outside snippets. Curated does not mean every edit needs another reviewer or only administrators may edit.

B — **Personal replies plus a curated shared library.** Staff keep reusable wording for their own use; designated capable editors publish shared wording, with an explicit path to promote a personal candidate. Most flexible with modest extra scope/ownership complexity. The product should avoid calling this confidential private storage: tenant governance, source restrictions, retention and administrator capabilities remain explicit.

C — **One collaboratively maintained shared library.** Eligible Support authors can publish ordinary shared wording under the same owner safety rules; no personal library. Fast collective reuse, but wider team-visible churn and more duplicate/inconsistent entries. This must remain a scoped capability policy, never automatic permission from conversation assignment.

**Best recommendation: B**, subject to primary vendor research supplied by the parallel researcher. It respects individual working style while keeping organization-approved wording discoverable. Its justification is a product judgment about the user-requested flexible, frictionless shared inbox, not a measured ministry preference. A is the strongest simpler alternative and should receive equal practical clarity in the presentation.

## Exact repository support

- `docs/prds/sitestacker-parity/roadmap.md:2954` includes macros/canned responses; `:2956–2963` preserves Phase17 preparation and Phase34 sole configurable automation vocabulary. The roadmap's old CRM exact-email and lifecycle statements are superseded by current grill decisions.
- `docs/features/support-hub/grill/phase26-d4-adversarial-review.md:53–65` (D4-R04/R05): Use template, Saved reply wording distinct from presentation/macro/system template, insertion never changes recipients/status/identity/CRM, full templates require qualification, publication rights distinct from compose/send.
- `docs/features/support-hub/grill/phase26-d4-send-template-blueprint.md:47–49`: same permitted library, preview, insertion at caret, explicit replace with Undo, library outage does not block otherwise-qualified plain reply. These are settled, not options.
- `docs/features/support-hub/CONTEXT.md:90–92`: Saved reply wording already established, so reuse that term.
- `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md:930–934`: Saved Sections are tenant-owned, copy on insertion, no hidden live fanout, destination publication/protected-content revalidation. No discovered personal/shared Support library policy is specified there.
- Same Phase17 PRD `:103` and `:215`: ordinary authorized editors self-publish safe changes; protected changes require independent review. Q18 cannot impose a mandatory second approval on every harmless text edit under the banner of curation.
- `docs/adr/0030-canonical-message-document-and-presentation-dependencies.md` fixes canonical structured content and dependency principles; personal Support wording must not create a parallel HTML or variable engine.
- `supabase/migrations/20260515025814_support_hub_core_modules.sql:384–402` already has nullable owner_agent_id and uniqueness by tenant/owner/short_code. This is evidence of scaffolding, not accepted privacy/security behavior.
- `packages/api/src/admin/support-hub/adapter/supabase.ts:1008–1027` current canned list reads all tenant rows and save receives ownerAgentId; this does not establish current actor-derived personal ownership or publication controls. Do not claim personal privacy currently works.
- `apps/admin/features/support-hub/lib/macro-runner.ts:125–279` sequential actions/default continue-on-error are known current deficiencies covered by D1/D4; do not reopen them as optional safety.

## Invariants and consequences regardless of selection

1. Reuse the qualified Email Studio structured-content/authoring capability, P17 compiler and normal send boundary; no provider template IDs, second CRM/template store, universal admin grant or private rendering path.
2. Shared publication permission is distinct from use and ordinary composition; follow existing proportional review, not mandatory bureaucracy.
3. Reusable wording is deliberately authored/reviewed. Saving a sent message cannot silently retain donor details, attachments, protected links or source-expiring content. This connects directly to D16/D17 and is important before allowing Save as reply from a transcript.
4. Promoting/copying between scopes creates a reviewed destination-owned candidate; it does not reveal every personal item, move historical sends or rewrite inserted drafts.
5. Personal and shared duplicate shortcode precedence, retirement/deactivation, departure, tenant switching, list/count/search privacy and editor recovery need the selected answer's adversarial review.
6. No shared template change retroactively edits a sent communication, updates CRM, changes active work or supplies current receipt/refund truth.
7. Existing safe typed variables are resolved only under current D4 audience/context boundaries; no CRM fact is committed from placeholder entry.

## Other uncovered branches, lower priority for this next turn

- Safety/quarantine product dispositions and block/release management remain open beyond D1/D13 baseline safeguards; root coverage checklist lines576 and roadmap safety section name them.
- Search/saved-view scope and authoring remain incompletely groomed; correctness of complete authorized search is already mandatory and should not be framed as an optional feature.
- Explicit phone/manual-recording, other channels, CSAT/AI/knowledge scope remains unresolved; none is automatically required because a competitor supports it.
- Inbound setup/Resend qualification and legacy retirement still need proof and some product decisions, but do not ask the founder to decide discoverable provider/runtime facts.

No new feature is selected by this report. The parent should present one researched question and wait for the founder before adversarial review/recording of Q18's selected answer.

## Additional owner and current-visibility challenge requested by parent

**Personal, non-published wording is not a settled Phase17 asset type.** ADR0030 lines18–41 establishes structured documents and copy-on-insert Saved Sections, while Phase17 PRD930–934 says tenant-owned Saved Sections without defining personal visibility or their own publish state. Do not claim that a Personal option already ships in Email Studio or that the system-message publication engine already supports this exact content scope. The selected design must qualify the existing authoring asset model with explicit personal/shared scope and lifecycle, without creating a new message catalog key, Layout Role, provider template store, or second compiler.

**Saving reusable personal wording is distinct from publishing a sendable system template.** D4 permits humans to compose and send without publishing each human reply, and says reusable library rights are distinct. A personal saved item can act as a bounded authoring input if qualified by the owner. Its existence must not grant direct runtime template-send authority or skip D4 server preparation/approval. Whether it uses a validated immutable saved revision, shared publication state, or another existing owner lifecycle is a design qualification, not a founder question about database tables.

**Do not invent curation approval bureaucracy.** Phase17 PRD810–824 says ordinary authors may self-publish after validation, preview, diff and impact acknowledgement, protected publication requires another authorized human, and the tenant has one existing stricter global another-reviewer setting. B's shared library can use explicit shared-publish capability and that existing floor; it should not create a Support-specific review engine or silently exempt shared wording from applicable owner policy. A proposed Share action may create a candidate for an authorized editor; authorized editors need no extra reviewer merely because the wording came from a personal item.

**Current UI does not prove personal privacy.** The current hook `apps/admin/features/support-hub/hooks/use-support-canned-responses.ts:19–35` returns the API collection as-is. Adapter1008–1027 lists tenant rows and accepts ownerAgentId on save. Current CannedResponseForm57 assigns new content ownerAgentId null; it offers no personal/shared choice. The schema's nullable owner alone is not an authorization boundary. These are static observations; no deployed exploit or runtime grant behavior was tested.

**Offboarding must not auto-publish or erase relevant evidence.** Schema395–399 currently cascades a saved response when its Support agent is deleted. A future personal library belongs to the tenant with exact current-user use/edit scope and a qualified records lifecycle; personal ownership must not mean global-account portability. Access loss denies personal use immediately. It does not transfer personal wording into Shared, widen access to a supervisor by assignment alone, recall inserted drafts, or erase actual sent-message provenance. Deliberate promotion before departure is an authorized independent operation; any later administrative recovery must use a named existing policy/capability, never hidden reassignment of owner IDs. Exact retention/horizon and disposition remain qualified owner requirements after selection, not Forever by absence of staff ownership.

**Most dangerous new coupling:** Save as reply on a past message could become a second indefinite transcript archive after D16/D17. Do not automatically copy messages/files/CRM facts into the library. A source-derived candidate requires deliberate review, safe generalized wording and a truthful dependency/retention treatment; copy-on-insert alone does not destroy the source restriction. A clean fresh-authoring entry is the simplest initial journey, with any transcript-derived shortcut earned only after its source/content rules are specified.
