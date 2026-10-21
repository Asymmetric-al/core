# D18 — Current source, shared AI foundation and newsletter writing UX

Research only, 16 October 2026. The founder selected optional newsletter AI
writing help using organization-managed keys/limits, missionary opt-in, a small
action set and preservation of the author's voice. This note records static
source evidence and proposed qualification clauses; it does not implement the
feature, activate a provider or revise a formal owner contract.

**Catalog supersession:** this note's preliminary three-action catalog and its
illustrative sketch are superseded by the [main D18 six-action synthesis](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d18-newsletter-writing-assistance-adversarial-review.md:158):
Fix spelling & grammar, Rephrase, Simplify, Shorten, Lengthen and Make more
compelling. The founder's examples informed that synthesis; the exact six labels
are proposed product wording, not independently founder-ratified labels. The
earlier sketch remains below as research history, not a competing action limit.

## Scope and confidence

Read root and relevant missionary/admin/API/auth/database/UI/Supabase/Eve
instructions; the local Supabase skill was already read in this research session.
Inspected missionary Email Studio, admin Email Studio and shared React Email/
Tiptap adapters, template persistence and merge-tag handling; Eve model-policy
API/store/schema/evaluator/permissions, relevant SQL, admin panel and runtime
entry points; environment schema, manifests/lockfile and selected installed
package metadata/types; existing editor/model-policy test sources. Read ADR-0099,
ADR-0133, the founder brief and Q18 owner-frontier note. Only this file is edited.

Searches of `apps`, `packages`, and forward migration names/content for tenant AI
provider/credential/capability-binding/egress/invocation and newsletter-assistance
terms did not locate an implemented P21 D10 tenant-purpose execution path or
missionary newsletter AI endpoint. These are bounded searches, not an absence
claim for all branches, operational scripts or hosted systems. No environment
secret values, actual provider accounts, live grants, runtime request traffic,
model quality or deployed feature state were inspected. No app, schema,
dependency, provider, upload, model invocation, message or live setting changed.

## Accepted target is different from current Eve configuration

The accepted [P21 D10 foundation](/workspace/core/docs/adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md:37)
separates provider connection, write-only encrypted credential revision and
immutable purpose binding. Binding includes the exact certified model/region,
data-use posture, input/output and prompt contract, budget/rate envelope. Each
invocation requires a minimum-data egress manifest and evidence. Its
[administration contract](/workspace/core/docs/adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md:65)
is purpose-first Settings → AI features, with separate management, replacement,
activation, usage, invocation and acceptance capabilities. This is accepted
intent, not current implementation proven by this inspection.

The [Public Page Writing Assistant](/workspace/core/docs/adr/0133-source-bounded-public-page-writing-assistance.md:31)
is an accepted consumer of that foundation for its own saved Page source,
comparison and explicit apply. Its Page purpose, actions, translation rider and
24-hour suggestion lifetime do not automatically apply to newsletters. Useful
shared architecture is its
[editor-neutral authoring port](/workspace/core/docs/adr/0133-source-bounded-public-page-writing-assistance.md:89),
not a fork of Page source authority. D18 needs an exact newsletter purpose and
source adapter, preserving D7's independent draft, audience and sending owners.

| Current evidence                                                                                                                                                 | Actual behavior and reuse boundary                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Missionary route](/workspace/core/apps/missionary/app/email-studio/page.tsx:10), [page](/workspace/core/apps/missionary/app/email-studio/page-client.tsx:41)    | Route mounts a feature-description page advertising AI-powered content. At line 83 it says Coming Soon; the line-101 button is disabled. It is not a functioning missionary newsletter editor or AI producer.                                                                                                                                           |
| [Eve policy schema](/workspace/core/packages/api/src/eve/model-policy/schema.ts:73), [types](/workspace/core/packages/api/src/eve/model-policy/types.ts:62)      | Current policy document accepts only `scope: platform`; named model roles, Gateway primary, direct fallbacks, evaluation and role/subagent limits. There is no credential revision or newsletter purpose field in this schema.                                                                                                                          |
| [Model policy store](/workspace/core/packages/api/src/eve/model-policy/store.ts:96)                                                                              | Loads policies without a tenant predicate; this matches the platform-policy API, not a tenant-purpose credential store. The separate grant lookup at line 139 is tenant/profile-scoped. Do not relabel platform policies as organization connections.                                                                                                   |
| [Model policy SQL](/workspace/core/supabase/migrations/20260718005737_eve_model_policy_tracer.sql:26)                                                            | SQL structurally allows platform/tenant rows; current API document still permits platform only. At line 103 it enables RLS and revokes table access from anon/authenticated, with service-role grants. This is a policy control-plane migration, not proof of hosted configuration or tenant BYOK. Full later grant precedence was not re-audited here. |
| [Policy permissions](/workspace/core/packages/api/src/eve/model-policy/permissions.ts:9), [route](/workspace/core/packages/api/src/eve/model-policy/route.ts:38) | Admin route uses shared server operation; management needs super-admin or a dedicated active AI-settings grant. Generic admin is explicitly insufficient for policy changes. Reuse the distinction, not the exact broad Eve capability as newsletter invoke/apply permission.                                                                           |
| [Policy evaluation](/workspace/core/packages/api/src/eve/model-policy/evaluator.ts:18)                                                                           | Checks document schema, named roles, Gateway-primary routing, fallback consistency, judge separation and declared limits. A passed evaluation is not a live credential connection test, prose-quality test, data-use certification or newsletter safety qualification.                                                                                  |
| [Model resolver](/workspace/core/packages/api/src/eve/model-policy/resolver.ts:27)                                                                               | Pure resolver examines active/evaluated policy and a supplied usage snapshot, rejecting exhausted rate/spend/token limits. It does not by itself reserve shared tenant spend atomically or prove complete provider accounting. D18 cannot rely on a per-browser count.                                                                                  |
| [Admin policy UI](</workspace/core/apps/admin/app/(app)/admin/eve/model-policy-panel.tsx:462>)                                                                   | Offers versioned policy JSON editing and evaluation/activation actions. Useful governance concepts; unsuitable ordinary organization newsletter setup. Staff should not author JSON, judge roles or tenant system prompts to enable this feature.                                                                                                       |
| [Admin Eve panel](/workspace/core/apps/admin/app/eve/global-panel.tsx:184)                                                                                       | Requires an authenticated admin context; its conversation is a different product and source boundary. Do not mount it in missionary authoring or give newsletter text to its tools.                                                                                                                                                                     |
| [Root runtime agent](/workspace/core/packages/eve-runtime/agent/agent.ts:4)                                                                                      | Uses `mockModel` and a verification response, not newsletter generation. [Specialist activation](/workspace/core/packages/eve-runtime/src/specialists/runtime-policy.ts:46) separately loads persisted governance/model policy and release gates for engineering specialists. Neither is D18 readiness.                                                 |
| [Runtime activation adapter](/workspace/core/packages/eve-runtime/src/governance-boundary.ts:56)                                                                 | Converts decisions to configuration, explicitly performs no provider call, and rejects disabled release/model/budget states. Its existence does not bind an organization key.                                                                                                                                                                           |
| [Environment schema](/workspace/core/packages/env/src/schema.ts:111)                                                                                             | The inspected explicit schema contains application/provider infrastructure settings; searches did not locate D10 tenant-purpose key binding here. Process-global credentials, an SDK's implicit environment lookup or a platform Gateway route cannot silently supply a missing tenant connection. No actual environment values were read.              |

No new provider/model selector, per-feature secret column, browser-side provider
call, direct fallback, arbitrary endpoint or global “AI key” is justified by D18.
Use the accepted shared foundation and a bounded newsletter consumer. If that
foundation is not operationally qualified, keep the helper unavailable and the
manual newsletter journey complete. Do not pretend the coming-soon screen is a
qualified manual baseline either: D7 authoring remains its own delivery work.

## Concrete editor and draft evidence

The admin [Email Studio page](</workspace/core/apps/admin/app/(app)/email/page.tsx:3>)
mounts a real editor path. Its shared
[EmailStudioEditor](/workspace/core/packages/ui/components/studio/EmailStudioEditor.tsx:20)
uses React Email exclusively; legacy Unlayer designs remain outside the visual
editing path. This is reusable authoring infrastructure, not a missionary
newsletter source service.

| Existing seam                                                                                                                                                                                                                                                             | What D18 must not assume                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Neutral handle](/workspace/core/packages/email/email-builder-types.ts:45) exposes export/load, local undo/redo, focus and merge-tag insertion.                                                                                                                           | No semantic selected-source capture, immutable draft revision, eligible prose target, digest-bound replacement or source-backed apply receipt is exposed. Add a shared editor-neutral capability through the owning boundary; don't pass a DOM range or editor JSON object as authorization.                     |
| [React Email load](/workspace/core/packages/ui/components/studio/ReactEmailEditor.tsx:49) parses string JSON, falling back to an empty design on parse failure; `applyLoadedDesign` uses whole-document `setContent` at line 71.                                          | Loading a whole generated document can erase current work or silently convert invalid content to blank. AI should replace only its exact qualified target, not call `loadDesign` with model output.                                                                                                              |
| [Editor export/save](/workspace/core/packages/ui/components/studio/ReactEmailEditor.tsx:119) serializes JSON/HTML/text. `saveDesign` at line 152 returns exported design only.                                                                                            | A method named Save does not prove durable source storage. No “Saved” UI without actual draft-owner acknowledgment. Do not send HTML/text exports of the whole newsletter as a shortcut to selected prose.                                                                                                       |
| [Editor Undo](/workspace/core/packages/ui/components/studio/ReactEmailEditor.tsx:171) delegates to editor history; [design update](/workspace/core/packages/ui/components/studio/ReactEmailEditor.tsx:247) invokes a callback.                                            | Local history is not a multi-tab/server rollback. One applied suggestion should form one editor transaction, with source-owned save/undo semantics and stale-target protection.                                                                                                                                  |
| [Admin persistence](</workspace/core/apps/admin/app/(app)/email/email-studio-api.ts:49>) sends the full exported design/HTML/text plus subject/preheader to template POST/PATCH; response proves a template ID.                                                           | This is a template writer, not a newsletter issue revision/CAS command. Its payload has no expected source version or selected-text digest.                                                                                                                                                                      |
| [Template update](/workspace/core/packages/api/src/email/template-store.ts:438) reads current template, updates by tenant/id with `version + 1`, then separately inserts a [version row](/workspace/core/packages/api/src/email/template-store.ts:342).                   | The inspected update has no expected-version predicate; the history insertion is a separate request. Do not reuse it as proof of atomic compare/apply/history, conflict recovery or safe concurrent AI replacement. This is a concrete source-level reuse hazard, not a claim of a demonstrated hosted incident. |
| [Template API](/workspace/core/packages/api/src/email/templates.ts:155) is admin/super-admin and validates template merge tags; [mutation schema](/workspace/core/packages/api/src/email/templates.ts:37) accepts general design records and optional rendered strings.   | Passing schema validation is not permission for missionary editing, safe provider egress, source revision identity or a strict AI-output contract.                                                                                                                                                               |
| [Merge-tag extension](/workspace/core/packages/ui/components/studio/merge-tag-extension.tsx:14) makes tags atomic inline nodes rendered as `{{key}}`; [insertion](/workspace/core/packages/ui/components/studio/ReactEmailEditor.tsx:191) inserts such a node.            | Never resolve recipient samples for AI, let a model invent/drop/change tokens, or confuse token character positions with displayed selection offsets. Selection cannot silently include hidden attributes or personalization values.                                                                             |
| [Merge validation](/workspace/core/packages/email/merge-tag-render.ts:105) validates registry tags/required values and URL safety; [template validation](/workspace/core/packages/api/src/email/templates.ts:58) calls it for rendered content.                           | Useful defense, not rich-text sanitization or proof that an AI replacement preserved protected atoms/URLs, required footer, structure, quotation or meaning.                                                                                                                                                     |
| [Shared rich-text editor](/workspace/core/packages/ui/components/shadcn/rich-text-editor/rich-text-editor.tsx:17) exposes JSON-string value, `onChange`, disabled state, accessible name and extra extensions; effect at line 100 synchronizes content with `setContent`. | Another editor primitive, not another newsletter authority. Reuse shared capability design; don't fork it into a second composer or infer durable autosave from controlled React state.                                                                                                                          |
| [Email preview](/workspace/core/packages/ui/components/studio/EmailStudioPreview.tsx:133) displays HTML in an iframe and provides raw/text preview tabs.                                                                                                                  | This is newsletter preview, not the safe output comparison. Display AI output as bounded validated text/allowed source structure, never arbitrary model HTML in the preview iframe.                                                                                                                              |

The catalog supersession does not alter the inspected persistence finding:
[template update](/workspace/core/packages/api/src/email/template-store.ts:438)
has no expected-version predicate, and its history insertion is a separate
request. That static source gap remains; this documentation change neither fixes
it nor establishes a hosted concurrency incident.

## Installed versions are materially different from manifests

Committed [UI manifest](/workspace/core/packages/ui/package.json:72) and
[lockfile](/workspace/core/bun.lock:1429) declare React Email editor **1.7.12**;
Tiptap core/react/pm/starter-kit **3.31.4**; Base UI **1.9.0**.
[Eve manifest](/workspace/core/packages/eve-runtime/package.json:22) declares
Eve **0.25.1** and AI SDK **7.0.131**. Export metadata is hardcoded to
[builderVersion 1.7.12](/workspace/core/packages/ui/components/studio/ReactEmailEditor.tsx:136).

Read-only package inspection in this workspace instead found:

| Package path                                                                                                                              | Installed version observed |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [UI React Email editor](/workspace/core/packages/ui/node_modules/@react-email/editor/package.json:3)                                      | 1.5.3                      |
| [UI Tiptap core](/workspace/core/packages/ui/node_modules/@tiptap/core/package.json:4), and sibling react/pm/starter-kit package metadata | 3.22.3                     |
| [UI Base UI](/workspace/core/packages/ui/node_modules/@base-ui/react/package.json:3)                                                      | 1.8.0                      |
| [Eve AI SDK](/workspace/core/packages/eve-runtime/node_modules/ai/package.json:3)                                                         | 7.0.31                     |
| Eve package metadata under its workspace `node_modules`                                                                                   | 0.25.1                     |

Installed [editor types](/workspace/core/packages/ui/node_modules/@react-email/editor/dist/index.d.mts:7)
expose a Tiptap editor reference plus JSON/HTML/text methods. They describe the
observed **1.5.3** package, not proof of the manifest version's behavior. Therefore
neither a remembered SDK API nor an existing local test would qualify the
declared production dependency graph. Implementation must reconcile/install the
approved lock graph through ordinary repository workflow and qualify the actual
editor adapter/serialization. This research does not install or upgrade anything.
No new AI editor extension, diff library, provider SDK, primitive system or
package is selected by this note.

## Eight material concern dimensions and candidate clauses

These clauses are recommendations for the D18 synthesis. Severity is conditional
on implementing the shortcut described; none asserts a current deployed D18 hole.

| ID / dimension                                 | Material concern                                                                                                                                                                                                                    | Candidate requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U18-C1 — Product scope and voice               | High impact, plausible: whole-newsletter generation, tone/persona training or generic chat silently replaces the narrow writing aid. Polished text can invent ministry outcomes, theological positions, quotes or pressure tactics. | The preliminary **Fix spelling & grammar**, **Improve clarity**, **Shorten** catalog is superseded by the main D18 six-action synthesis linked above, including its source-faithful Lengthen and Make more compelling semantics. Preserve language, first-person stance, names/numbers/quotations and meaning; no retrieval, voice-profile corpus, hidden prior letters, invented persuasion, new factual details or autonomous sends. The earlier catalog was a proposed product profile, not an inherited Page contract. |
| U18-C2 — Authority, key and source isolation   | High impact, likely if current Eve is relabeled: platform policy/key or admin role substitutes for tenant purpose/credential, missionary opt-in or source access. Selection is mistaken for declassification.                       | Require current tenant connection and purpose binding, exact credential revision, source authority and classification/egress checks, missionary opt-in and deliberate invocation. Separate setup/invoke/apply capabilities. No platform-key fallback or cross-tenant reuse. Provider keys are never supplied by missionaries or read back.                                                                                                                                                                                 |
| U18-C3 — Draft integrity and rich text         | High impact, plausible on ordinary concurrent editing: delayed suggestion overwrites current text, another newsletter, footer, links or merge tags; invalid JSON becomes empty.                                                     | Capture a saved semantic source target and digest, not DOM offsets; output has a strict bounded text/structure contract. Compare exact original/result, preserve protected nodes and apply at most one ordinary successor draft via current authorization and target CAS. Never whole-document load of model output.                                                                                                                                                                                                       |
| U18-C4 — Async outcome, cost and revocation    | High impact, plausible on timeout/double click: duplicate model spend, automatic regeneration, result from an old key accepted after Off, or false “cancelled/refunded.”                                                            | Pin invocation/key/binding; reserve and reconcile costs through the shared foundation, including uncertain outcomes; no implicit retry/fallback. Cancel means stop local waiting/request cancellation as actually supported, not recall of transmitted text or guaranteed refund. Recheck Off/opt-in/source/permission before result access and Use; retain already accepted draft truth.                                                                                                                                  |
| U18-C5 — Complete UX and accessibility         | Medium–high, likely if floating selection is the sole entry: phone/keyboard users cannot select reliably, comparison loses original, focus jumps, disabled state blocks manual writing.                                             | One contextual Writing help entry, stable explicit source preview and the main synthesis's action catalog; paragraph/block action alternative; labelled original/suggestion, responsive stacked comparison, useful focus return and non-color change indication. Manual save/edit/send remain independent; generation never steals editor focus or locks the entire draft.                                                                                                                                                 |
| U18-C6 — Performance and data minimization     | High privacy/medium usability impact if whole-document export, recipient resolution, images or history enter each request. Unbounded generation/alternatives waste tenant limits.                                                   | Bound selection/output/request lifetimes through certified profile; send only the approved source package, not full HTML/JSON/recipient data. One active invocation/result per selected operation; cancel superseded display work; no background completion, automatic alternatives or hidden prefetch.                                                                                                                                                                                                                    |
| U18-C7 — Architecture, migration and debt      | High impact, likely if legacy template save/local Undo is reused: absent CAS, separate history write, misleading builder version, broad policy JSON UI and a second key store become permanent.                                     | Shared D10 execution with newsletter-specific semantic adapter; reuse base-maia components and editor-neutral source port. Reconcile actual versions and legacy source compatibility before activation; qualify source save, conflict and undo receipts. Don't migrate old template/AI data into the new audience without explicit owner rules.                                                                                                                                                                            |
| U18-C8 — Operational proof and failure honesty | High impact, likely if schema checks/mock runtime are called AI certification: false credential health, no prose evaluation, secret/body logs, incomplete usage or cleanup.                                                         | Separate config saved, synthetic connection test, feature qualification, enabled state and successful suggestion. Content-free operational evidence, private bounded result retention and safe support reference. Prove same-tenant/subject isolation, races, limits, data-use posture, language/voice, phone and assistive-technology outcomes on the actual adapter before release.                                                                                                                                      |

## Minimal complete setup and writing journey

The following is a source-qualified design proposal using existing Core Base UI/
base-maia components. It does not freeze a provider/model, arbitrary duration,
spend amount, retry count or new inbox. The tenant foundation must supply actual
status and allowed options; every visible button below needs that backing.

### Organization setup: one feature card, shared connection management

```text
Settings → AI features → Newsletter writing help

Newsletter writing help                                  Off
Let missionaries request suggestions for eligible newsletter text.
Each missionary chooses whether to use it.

AI connection             [Choose an approved connection]
                           Add connection
Spending limit            [amount + explicit currency and period]

Data sent                 The selected eligible newsletter text
Who pays                  [verified organization billing owner]
Processing and data use   [current certified region/posture summary]
                          View details

Save setup                Check connection
```

Use the shared connection editor for first setup: supported provider choice,
write-only key entry, certified model/region options and a recognizable
connection name. Hide unnecessary options when only one is certified; do not
hide a material data-processing or billing difference. An ordinary organization
administrator should not see policy JSON, model reasoning levels, judge roles,
system prompts or environment-variable names. Advanced operational details are
progressive disclosure, not missionary UI.

`Check connection` uses an explicit bounded synthetic request only after the
authorized setup action; explain that provider usage may be charged. It must
not sample a real newsletter or claim end-to-end readiness from a key-format
check. After successful qualification show **Ready to enable** and one deliberate
**Enable newsletter writing help** action. Saving a new key or successful test
does not turn the feature on. Initial Off is the recommended default, consistent
with optional use; the exact D18 default remains a synthesis choice here.

Once enabled, show status, current usage versus the exact configured envelope,
and **Manage connection**, **Change limit**, **Turn off** only to appropriate
roles. Connection replacement/revocation uses the shared lifecycle and identifies
other affected purposes without exposing their content. A key used by Page
writing need not be duplicated for newsletters. No automatic provider/model
switch to repair failures. An unavailable/expired key says **Needs attention**,
not “Connected” merely because a secret was saved. Usage uncertainty is explicit;
no false exact bill or reset promise when the shared producer cannot supply one.

### Missionary opt-in and choose an action

```text
Newsletter draft                                        Saved
[author's ordinary editor]

[Writing help]                 [normal editing and newsletter actions]

First deliberate use:
Turn on writing help for your newsletters?
You choose the text and review every suggestion before using it.
Eligible text you select is sent to your organization's configured AI service.
View data-use details

Keep writing manually                                  Turn on
```

Store opt-in only for the approved person/tenant purpose; organization enabling,
another tenant's opt-in, a coach relationship or a staff action cannot imply it.
Do not generate on opt-in. After it is on, each request still requires a deliberate
selected action. Provide an unobtrusive **Turn off writing help** in the same
newsletter/editor preferences. A repeated legalistic confirmation before every
grammar fix is unnecessary if the source/action preview and current disclosure
remain clear. Changed material processing terms need the foundation's required
review; silence never broadens an old opt-in.

The following three-action picker is the **superseded preliminary sketch**;
use the main synthesis's six labels and action meanings for the proposed product.

```text
Writing help
Selected text                                  Change selection
“[exact eligible paragraph or selected words]”

Fix spelling & grammar
Improve clarity
Shorten

Suggestions should keep your meaning and voice. Review before using.
```

Offer a block/paragraph menu action as well as selected-text access, so phone
users need not manipulate tiny handles. That action must visibly select one
eligible paragraph; it cannot silently send the whole newsletter. Empty or
unsupported selections show a simple remedy. A minimal initial profile can
reject selections crossing protected personalization, links, footer or structural
boundaries rather than flattening them. Rich text may be supported where the
adapter proves exact protected-node/mark preservation; the screen must not
claim an unsupported selection is editable. No arbitrary instruction textbox,
tone/persona setup, translation, new story generation or image rewriting is
needed for the bounded writing actions. The original three-action count does not
constrain the main synthesis.

Pin a saved source revision through the ordinary draft service. Do not use the
admin editor's `saveDesign` as evidence. If the draft is unsaved, use D7's real
save behavior: save and acknowledge it before the request, or explicitly offer
**Save draft and continue**. This note does not invent autosave. A save failure
keeps all local writing and sends no model request. The author can continue
manual work during generation; source/target changes are checked again on Use.

### Compare and use

The historical sketch uses the superseded **Improve clarity** label; the main
synthesis supplies the current proposed action labels. The comparison journey
and source-integrity findings remain applicable.

```text
Improve clarity

Your text                         Suggested wording
[exact original]                  [one complete suggestion]

Check that this still says what you mean.

Keep my text                                     Use suggestion
```

Use a calm side panel/section on larger screens and a full-width stacked view
on phones. Reuse shared [Dialog](/workspace/core/packages/ui/components/shadcn/dialog.tsx:44)
or [Sheet](/workspace/core/packages/ui/components/shadcn/sheet.tsx:39) as appropriate,
without nesting modal dialogs or creating a new comparison design system. If
highlighted word changes are shown, preserve an accessible reading view labelled
“Your text” and “Suggested wording”; differences cannot rely on red/green alone.
Focus goes to the comparison heading when deliberately opened, not to changing
streamed words. Announce **Suggestion ready** once. No model output enters the
document while it streams or before validation finishes.

**Keep my text** dismisses/discards the result under the actual retention rule;
it does not call a model or touch the draft. **Use suggestion** applies only the
displayed validated result to the pinned target after current checks. Its source
acknowledgment gives the ordinary draft successor identity; no newsletter is
sent, scheduled, published, enrolled or re-audienced. Return focus to the edited
text and show **Suggestion used**. “Saved” appears only if that successor is
durably acknowledged. An identical result may say **No changes needed** and
offer Done; it must not manufacture a content change or another billable retry.

### Undo, stale work and continued editing

Treat Use as one ordinary editor transaction. An immediate **Undo** can restore
the exact original when its source-owned inverse/ordinary draft edit is still
valid; preserve current surrounding content and record the resulting revision.
Do not implement Undo by loading the entire old newsletter. If intervening edits
make a targeted inverse unsafe, keep current work and allow ordinary manual
editing/history under the draft owner's policy. Do not offer a durable Undo that
actually changes only local React state. Undo never recalls provider egress,
refunds a generation, reopens sending or changes a delivered issue.

If source text/target changed while waiting, **Use** cannot overwrite it. Explain
**This text changed. Review your current text before requesting another
suggestion.** Return to the current draft and preserve changes. Do not silently
regenerate, relocate the replacement using matching words, or make every edit
throughout the newsletter wait for the AI request. Whether unrelated block edits
can coexist is determined by the qualified semantic target contract, not UI
offset guesses.

### Errors, Off and recovery

| Observed state                                           | Author-facing response and truthful action                                                                                                                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Organization has not enabled/qualified the feature       | Manual editor remains complete; omit active AI actions. If reached through an old link, say “Writing help isn't available for this organization.” No Coming Soon button that appears actionable.                                           |
| Missionary opts out or organization disables during work | Prevent new invocations and follow current source policy for unapplied results. Explain current unavailability without erasing already applied draft text. No claim that transmitted text was recalled.                                    |
| Generation in progress                                   | “Preparing a suggestion…” with Cancel/back to writing. Cancel prevents automatic application regardless of whether provider execution can stop.                                                                                            |
| Known unavailable/invalid connection or limit reached    | “Writing help is unavailable right now. You can keep writing.” Explain “Your organization's usage limit has been reached” only when known. Staff receives a safe existing operational signal; the missionary is not asked for a key.       |
| Request outcome uncertain                                | “We couldn't confirm the result. Your draft has not been changed by this request.” Inspect the same request through the foundation; no automatic repeat or provider fallback. Show Try again only when the source can safely authorize it. |
| Invalid/unsafe output                                    | “We couldn't make a usable suggestion. Your text is unchanged.” Show no partially valid HTML; allow normal writing and a deliberate safe later request.                                                                                    |
| Saving/applying outcome uncertain                        | Distinguish from generation failure: “We couldn't confirm the draft change.” Reconcile its receipt before Use/Undo/retry. Do not falsely state the original is unchanged.                                                                  |
| Session/tenant/source permission changed                 | Stop protected reads and apply, clear stale private caches, preserve authorized source truth. Reauthentication/resume rechecks the same draft and request; no automatic replay.                                                            |

Closing the comparison is not sending, applying or authorizing a later background
rewrite. A reopened editor may restore only currently permitted, unexpired
suggestion state from the qualified source, never a body in persistent browser
storage. Exact pending/result retention and expiry copy need a newsletter
decision; do not copy Page's 24 hours or D15's draft timeout by analogy.

## Primary UX references checked

- [Mailchimp Write with AI](https://mailchimp.com/help/write-with-ai/), accessed
  16 October 2026: documents contextual editing of phrasing/length/tone and
  spelling/grammar; the page identifies beta and availability limits. This
  supports a small contextual writing aid, not wholesale adoption of its
  generation, data terms, tones, branding or provider.
- [W3C APG modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
  accessed 16 October 2026: focus enters a labelled dialog, keyboard navigation
  remains contained when modal, Escape closes, and focus returns appropriately.
  Use these interaction principles with Core's Base UI; a component import alone
  does not prove keyboard, screen-reader or phone selection behavior.

## Meaningful future proofs — not executed

1. **Current actor/source:** wrong tenant, copied newsletter ID, stale assignment,
   coach account, generic staff and permission-revoked tab cannot invoke/read/use
   outside the exact purpose. Opt-in in one tenant does not travel to another.
2. **Real connection:** missing/revoked key, platform environment key, wrong model/
   region or mismatched purpose never supplies a fallback. Synthetic test success
   and schema-policy evaluation never masquerade as newsletter qualification.
3. **Egress minimization:** actual request trace contains only the approved saved
   prose package plus the certified code-owned instructions and necessary request
   metadata; no recipient/merge samples, private/care notes, donor history, old
   letters, images, hidden HTML attributes, tenant-authored system instructions
   or credential data appears in model content.
4. **Rich-text identity:** repeated identical paragraphs, emoji/grapheme clusters,
   RTL text, nested formatting, links and merge tags cannot move or enlarge a
   selection. Model HTML/tokens/URLs are rejected or preserved by the exact
   qualified contract, never executed or silently substituted.
5. **Revision race:** edit, another tab's save, draft switch, discard, submit/send
   freeze, source revocation and delayed provider result cannot overwrite current
   source. Duplicate Use creates at most one intended successor; no lost updates.
6. **Voice/meaning:** representative missionary authors assess grammar/clarity/
   shortening for first-person voice, names, numbers, quotations, Scripture,
   culturally specific terms and meaning. Preserve language; do not pretend a
   model's fluency guarantees fidelity or support a language without evaluation.
7. **Usage race:** simultaneous requests reserve the actual configured tenant/
   purpose allowance without overspend from stale counters; unknown billable
   outcome, cancellation and retry reconcile evidence before another request.
8. **Apply/Undo truth:** successful Use, identical output, failed/unknown save and
   undo after intervening edits have accurate receipts/copy, preserve unrelated
   content and never alter recipients, consent or sending state.
9. **Off and recovery:** key rotation, organization Off, user opt-out, deletion,
   expiry and session changes stop the correct future actions without erasing
   accepted draft facts or resurfacing discarded bodies after restore/reconnect.
10. **Phone/a11y:** keyboard and screen-reader users select a paragraph without
    pointer drag, review both versions, choose Use/Keep, recover focus and Undo;
    mobile virtual keyboard/zoom/RTL do not hide controls or shift the target.
11. **Manual continuity/performance:** unavailable AI, low bandwidth, timeout and
    exhausted limit preserve ordinary editing/save/review/send. Opening the
    editor incurs no model request; bounded source/output does not stall it.
12. **Evidence hygiene:** logs, error reporting, analytics, broad Realtime/search,
    support screens and key-management readback contain neither bodies nor
    secrets. Private suggestion expiry and content-free evidence survive the
    actual owner retention/restore contract without replaying a model call.

Existing [editor adapter tests](/workspace/core/tests/unit/packages/ui/studio/react-email-editor.test.tsx:41)
mock the nested editor; a separate
[upstream editor test](/workspace/core/tests/unit/packages/ui/studio/react-email-upstream.test.tsx:13)
executes its schema/serializer for merge-tag round-trip. Existing
[model resolver tests](/workspace/core/tests/unit/packages/api/eve-model-policy-resolver.test.ts:61)
cover policy selection/limits on supplied snapshots. Those sources are useful
seams, not proofs of newsletter assistance, actual provider egress, tenant keys,
atomic budget admission, semantic source CAS, voice quality or complete UX.
No tests were run for this documentation-only evidence task; installed-version
drift further limits any inference from prior local editor results.

The smallest complete delivery is one shared tenant-purpose setup and one
opted-in contextual writing aid inside the real D7 editor. It requires the D10
execution foundation and a qualified newsletter draft/apply adapter; it does not
require the entire staff AI workbench, generic chat, new settings system or new
editor library.
