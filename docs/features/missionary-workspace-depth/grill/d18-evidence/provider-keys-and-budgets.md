# D18 evidence — tenant provider keys and bounded newsletter AI usage

Research date: **2026-10-16 UTC**. Research only; no application, migration,
formal owner contract, credential inventory, authenticated provider request,
billable generation or dependency change. The founder selected optional
newsletter writing help, tenant-supplied provider keys and limits, and an
explicit author-controlled process that preserves the author's voice. The
mechanics and defaults below are **review recommendations**, not additional
ratified choices or proof that an adapter is implemented.

## Recommendation and existing owner boundary

Use the **existing shared tenant AI foundation**, with one newly qualified,
closed newsletter-writing purpose and a small set of certified operations.
Start with whichever exact provider/model/endpoint can meet that purpose's
quality, egress, retention, authorization and cost contract. Reviewing OpenAI,
Anthropic and Google here does **not** select all three for release. Do not add
a second key vault, provider marketplace, generic prompt console or missionary
access to provider administration.

One tenant purpose card is sufficient: **Help write newsletters**, On/Off,
qualified connection/model, what text leaves Asym, verified data-handling
posture, billing owner, an **Asym estimated-usage limit** in a named currency
and period, current usage/reserved uncertainty, and a clear health state.
Connection management remains an advanced shared surface. The author sees a
simple request → review → use/discard interaction and the complete manual
editor, including when help is unavailable.

The minimum sound spending mechanism is an atomic reservation **before** one
durable dispatch admission, bounded input and complete billable output, finite
request/concurrency controls, and idempotent usage settlement. It controls
Asym-admitted newsletter requests. It is not a promise about the provider's
invoice, taxes, exchange conversion, another application using the same key,
or delayed provider-side charges. A possibly billable timeout retains its
conservative reservation. A deliberate **new** generation may proceed under
fresh source authority and remaining allowance; the old attempt is not silently
retried. No generic confirmation dialog is needed for ordinary generations.

### Source authority actually inspected

| Source                                                                                                                                                                                                                                            | Exact boundary and status                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR-0099](../../../../adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md:37), lines 37–78                                                                                                                                        | **Accepted** shared connection, write-only credential revisions, exact prospective purpose binding, certified capability, minimum egress, immutable invocation evidence, no silent fallback, separate P12 capabilities and manual continuity. It already rejects one global tenant key and one key column per feature (lines 116–122). |
| [P21 D10](../../../../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:3345), lines 3345–3409                                                                                                                                      | Defines stable provider account/environment/region identity, credential lifecycle and cryptographic-erasure state, capability certification, binding, egress, invocation and usage/cost owners. Reusing a credential across purposes is permitted; saving/testing it does not activate a purpose.                                      |
| [P21 D10 egress/retry](../../../../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:3411), lines 3411–3445                                                                                                                         | Classification precedes remote egress; prohibited context remains prohibited under BYOK; in-flight work pins its binding/credential; ambiguous outcomes require inspect-before-retry. Receipt-specific file/money rules here do not become newsletter fields.                                                                          |
| [P21 D10 administration](../../../../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:3489), lines 3489–3520                                                                                                                       | Purpose-first Settings; current authority for replacement/revocation; affected-purpose preview; stale-worker fencing; distinct connection/binding/cost/invocation/acceptance rights. No broad `admin` boolean.                                                                                                                         |
| [Field-account OpenSpec projection](../../../../../openspec/changes/add-field-account-operations/specs/field-account-operations/spec.md:694), lines 694–720                                                                                       | Active-change requirement restates separate connection/credential/binding/egress/idempotent invocation/suggestion objects and complete manual path. Publication of this contract does not establish runtime qualification.                                                                                                             |
| [Public-page OpenSpec](../../../../../openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md:851), lines 851–893; [ADR-0099 amendment](../../../../adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md:80) | Existing public-profile purpose is source-bounded and tenant-off by default. Its public-page actions, translation and 24-hour suggestion expiry are **not** automatically the newsletter contract. Its credential is reusable only through a separately authorized newsletter binding.                                                 |
| [Q18 frontier](../phase28-q18-newsletter-writing-assistance-research.md:31), lines 31–71                                                                                                                                                          | Newsletter extension does not admit D15 personal email, imports, CRM/donor/finance retrieval, recipient selection, autonomous sending or translation. The question note still says awaiting answer; current founder selection takes precedence over that stale status.                                                                 |

No contradiction was found in the accepted shared owner boundaries. D18 still
needs the bounded newsletter purpose/source/acceptance extension and a concrete
shared budget/retry qualification profile. These are not evidence that a new
settings architecture or general billing engine is needed.

## Fresh primary provider evidence

All URLs below were fetched without credentials on **2026-10-16**, HTTP 200.
Facts describe the published contracts, not any tenant's actual configuration.
Account entitlements, negotiated terms, available models and provider behavior
must be qualified for the selected binding. No price, DPA, region or key was
verified against a live tenant account.

| ID  | Primary source                                                                                                                                                                                                                                                 | Material verified fact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | [OpenAI project administration](https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform)                                                                                                                                             | Service accounts are project-scoped; keys support All, Restricted and Read Only, with per-endpoint permissions. Service-account keys default to broad project read/write. A key's existence does not establish least privilege.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| E02 | [OpenAI Spend limits](https://developers.openai.com/api/docs/guides/spend-limits)                                                                                                                                                                              | Current developer docs support **alerts and enforced hard limits** at organization/project scope. Reached hard limits return specific 429 spend-limit codes. Enforcement is not instantaneous and recorded spend can slightly exceed the limit. E01 still contains older soft-only wording beside a newer link to this guide; use this specific current guide, not the blanket claim that OpenAI cannot stop spend.                                                                                                                                                                                                                               |
| E03 | [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)                                                                                                                                                                                | API content is not used for model training by default unless opted in. Default abuse logs may contain prompts/responses and are retained up to 30 days, with exceptions. ZDR/MAM require approval; endpoint/model exceptions remain. `store=false` does not itself mean zero abuse retention. Residency at rest and regional inference are distinct; system data and unsupported operations have separate treatment.                                                                                                                                                                                                                              |
| E04 | [OpenAI reasoning](https://developers.openai.com/api/docs/guides/reasoning) and [API pricing](https://developers.openai.com/api/docs/pricing)                                                                                                                  | Reasoning/nonvisible generated tokens can be billed; supported `max_output_tokens` bounds generated tokens including reasoning and nonvisible formatting. A capped incomplete response can incur input/reasoning cost without any visible answer. Current pricing distinguishes model, input, cache and output categories; modes/features/region can change the cost basis. Certify the exact mode rather than treating a visible word limit as the billable maximum.                                                                                                                                                                             |
| E05 | [OpenAI rate limits](https://developers.openai.com/api/docs/guides/rate-limits), [key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety), [background responses](https://developers.openai.com/api/docs/guides/background) | Rate limits are distinct from spend control; keys belong on the server. The background guide describes cancellation and temporary asynchronous storage, and says terminating the connection cancels a synchronous response. This is not a promise of zero charge for work already performed. Background/polling retention is an additional qualification, not an automatic recovery feature for D18.                                                                                                                                                                                                                                              |
| E06 | [Anthropic workspaces](https://platform.claude.com/docs/en/manage-claude/workspaces)                                                                                                                                                                           | Requests resolve to one workspace. Current personal/service-account keys may be single-workspace or multi-workspace; a multi-workspace key uses a workspace header. Legacy workspace keys behave differently. Workspace limits can be lower than organization limits; organization-wide limits still apply. The Default Workspace cannot receive custom workspace limits. Do not assume every Anthropic key is intrinsically single-workspace.                                                                                                                                                                                                    |
| E07 | [Anthropic rate/spend limits](https://platform.claude.com/docs/en/api/rate-limits)                                                                                                                                                                             | Separate spend and RPM/input/output-token controls exist. User-set organization/workspace spend limits stop requests; current docs distinguish error forms from ordinary throttling. Rate limits and cache accounting differ by model. A 429 alone does not identify the right retry or budget action.                                                                                                                                                                                                                                                                                                                                            |
| E08 | [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), [thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking), [streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)               | Published pricing is USD and distinguishes input/output, cache writes/reads, context and feature/region premiums. Manual thinking budgets are model-dependent and deprecated/unsupported for some models; `budget_tokens` is a target, while documented `max_tokens` bounds total output in the described mode. Thinking is billed. Stream `message_delta` usage counts are **cumulative**, and errors may occur inside an already-started stream. Summing cumulative snapshots double-counts usage.                                                                                                                                              |
| E09 | [Anthropic commercial retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data), [training](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)                                   | Retention article dated July 1, 2026: standard API inputs/outputs deleted within 30 days with contractual, service, policy and legal exceptions; covered-model requirements may differ. Training article dated August 18, 2026: commercial inputs/outputs not used for training by default, with feedback/opt-in exceptions. Neither is a blanket no-retention guarantee.                                                                                                                                                                                                                                                                         |
| E10 | [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)                                                                                                                          | Keys associate with Google Cloud projects; the current guide describes service-account binding, restrictions and backend secret storage. Rate limits apply per project, **not per API key**, and capacity is not guaranteed. Rotating a key does not produce a new quota account.                                                                                                                                                                                                                                                                                                                                                                 |
| E11 | [Gemini billing](https://ai.google.dev/gemini-api/docs/billing)                                                                                                                                                                                                | Current docs provide billing-account tier and project monthly spend caps. Project caps are **experimental**, with roughly ten-minute processing delay/possible overages; long-running tasks can exceed them. Spend caps are unavailable for invoiced/offline accounts. Moving a project to another billing account retains its configured cap but resets accumulated spend for the new billing cycle. Do not claim all Google controls are merely alerts or infer instantaneous enforcement.                                                                                                                                                      |
| E12 | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [thinking](https://ai.google.dev/gemini-api/docs/thinking), [tokens](https://ai.google.dev/gemini-api/docs/tokens)                                                                            | Pricing tables identify USD per-million-token costs and output including thinking. The current thinking guide describes combined thinking/output `max_output_tokens` for its documented model/endpoint and billing even when truncation leaves an empty answer. Endpoint/model token controls must be certified rather than transplanted between API generations.                                                                                                                                                                                                                                                                                 |
| E13 | [Gemini API additional terms](https://ai.google.dev/gemini-api/terms)                                                                                                                                                                                          | Unpaid-service terms permit product/ML improvement and human review, and warn against submitting sensitive/confidential/personal information. Paid API treatment is tied to a project with active billing, with stated geographic exceptions applying paid data-use treatment to some free use. Paid-service prompts/responses are not used to improve products but retain limited abuse/legal logging; transient/cached data may be in countries where Google/agents maintain facilities. A key alone proves neither paid posture nor chosen residency. Published price changes generally take effect after the notice described in these terms. |

The marketing URL `https://openai.com/api/pricing/` redirected to a business
pricing page in this fetch. E04 uses the actual developer API pricing document;
ChatGPT subscription prices are not used as API rates. Documentation copies and
HTTP/hash manifests were captured under `/tmp/phase28-d18-provider-primary/` as
temporary research evidence. No external docs were treated as instructions to
modify an account, expose a key or execute sample provider requests.

## Small permanent budget and request contract

1. **Purpose and accounting scope.** One stable tenant + newsletter-purpose
   budget scope has a named estimate currency and explicit admission period.
   A currency/period is part of the policy, not inferred from the missionary's
   home country or financial support currency. Each invocation pins its policy,
   price/capability/binding/credential revision and original admission period.
   New keys, bindings, models, On/Off toggles or workers do not reset the scope.
   Separate purpose limits remain separate; no tenant-wide total is claimed
   unless every included purpose actually consumes a shared qualified envelope.
2. **Admission before egress.** Authorize the exact actor, source revision,
   purpose, current classification and binding; bound the complete request,
   including system/schema framing. Atomically record one invocation identity,
   reserve its conservative estimate and consume applicable request/concurrency
   allowance. If admission fails, no provider request is released. The client
   cannot choose tenant, provider-account scope, rates or reservation amount.
3. **Conservative estimate, exact arithmetic.** The certified adapter supplies a
   finite upper estimate for all enabled billable categories, including hidden
   thinking, cache-write/region/mode premiums and complete output. Do not count
   only visible prose, assume a cache hit or treat reduced rate-limit accounting
   as reduced billing. Use bounded exact decimal/rational or sufficiently fine
   integer units with documented conservative rounding; floating point and
   per-request rounding down to whole cents are unsuitable. No mixed-currency
   sum or automatic FX is needed. If a complete bound/rate is unavailable or
   expired, that adapter is unavailable; the manual editor remains complete.
4. **Durable single dispatch admission.** One generation authorization can
   admit at most one provider attempt unless exact provider semantics prove a
   safe continuation/retry. A fresh transport idempotency key, worker lease or
   browser double click does not create a fresh authorization. Disable or bound
   SDK/proxy retries according to this adapter contract. A request ID or content
   hash by itself does not establish provider replay safety.
5. **Settlement and uncertainty.** Terminal, correlated usage replaces the
   reservation once. Append usage corrections with provenance; do not sum
   repeated/cumulative observations. A proved never-dispatched request may
   release its reservation. Missing final usage, cancellation or timeout after
   possible dispatch does not prove zero charge: keep conservative uncertain
   usage/reservation until supported settlement. A provider invoice discrepancy
   is not silently rewritten as a successful local estimate. A detected
   exceeded estimate invalidates further use of that cost profile pending
   correction; do not conceal the overrun.
6. **Usable recovery.** Inspect whatever exact provider evidence is available;
   do not wait forever for an unsupported lookup. An author can explicitly ask
   for a new suggestion after an unknown attempt if current source authority
   and allowance permit. Explain that the previous request may still count and
   the new one uses more allowance. This is a fresh invocation/reservation,
   never automatic replay, failover or fabricated resolution of the old one.
   Keep results tied to their generation; a late result cannot replace a newer
   chosen result or overwrite a source revision.
7. **Period boundary.** A monthly period is a reasonable proposed UI convention,
   not a founder-selected calendar, timezone or provider billing alignment.
   Show exact boundaries and use the agreed admission-period semantics. Old
   uncertain reservations retain their old period and remain visible in its
   usage history; rollover does not settle them as zero or move a late response
   into a fresh bucket. A newly authorized request may consume the new period's
   allowance. This is one reason the control cannot promise an invoice-period
   cash maximum. A new policy/cap cannot erase prior usage; lowering a cap below
   already committed allowance prevents new admissions, not completed charges.
8. **Separate current gates.** Feature Off, credential revoke, classification
   change and actor-source revocation fence new dispatch and later suggestion
   disclosure/application as applicable. Already transmitted bytes cannot be
   recalled by changing local settings. Terminal usage may be recorded as
   minimal body-free evidence without restoring suggestion access. Neither
   revocation nor backup restoration creates retry permission.

This is a bounded AI execution control, not a wallet, donor balance, expense
claim, accounting ledger or reconciliation of the tenant's whole provider bill.
No provider-management API integration, automatic key provisioning, automated
invoice import or cross-provider failover is necessary for D18.

## Material concerns: eight dimensions per finding

Severity is potential harm; likelihood is conditional design exposure, not a
measured production rate. Each finding includes harm, severity, likelihood,
trigger/root cause, evidence, implication, exact proposed clause and proof.
Proofs below are **required qualification tests**, not tests executed here.

### KB18-01 — A valid key becomes universal AI or cross-tenant authority

1. **Harm:** unauthorized billing or egress under another account/purpose.
2. **Severity:** critical for tenant isolation; high for unwanted external data.
3. **Likelihood:** high if client-selected keys/routes or a global enabled flag are trusted.
4. **Trigger/cause:** broad key accepted as product permission; credential/account/workspace IDs supplied without owner binding.
5. **Evidence:** ADR0099:37–72; P21:3354–3390; E01/E06/E10.
6. **Implication:** reuse the owner foundation; provider key scope is an additional boundary, not P12 authorization.
7. **Clause:** “Newsletter AI MUST resolve the current tenant, exact newsletter-source authority, closed purpose, active binding and credential revision server-side. A credential, connection test, provider role or another enabled AI purpose MUST NOT authorize invocation or content acceptance. Clients MUST NOT select arbitrary endpoints, account/workspace headers or model identifiers.”
8. **Proof:** cross-tenant key/binding substitutions and public-profile-purpose reuse fail before egress; qualified existing connection can support a separately activated newsletter binding; no admin/usage-audit rights arise for a missionary.

### KB18-02 — Readable secrets, broad provider authority or misleading rotation

1. **Harm:** leaked keys, unexpected account-wide powers, stale-key use after revocation.
2. **Severity:** critical for secret disclosure; high for scope/revocation failures.
3. **Likelihood:** high if credentials enter browser state, logs or broad generic settings.
4. **Trigger/cause:** per-feature plaintext key columns; uncontrolled decrypt/readback; replacing a key silently switches in-flight requests.
5. **Evidence:** ADR0099:37–45,60–72; P21:3503–3520; E01/E05/E06/E10.
6. **Implication:** write-only encrypted revisions, minimum supported provider privilege, exact account proof and fresh P12 administration. Key/provider rotation and local revocation are distinct from provider-side credential deletion.
7. **Clause:** “Provider credentials MUST remain write-only, encrypted and server-only. Each credential revision MUST bind its qualified provider account/environment/scope. Replacement and revocation MUST preview affected purposes and fence stale dispatch. Existing invocations MUST NOT silently adopt a replacement key. No body, key or authorization header may appear in general telemetry, support exports or error text.”
8. **Proof:** all browser/API/export/log paths cannot recover a secret; forged workspace selection fails; rotate/revoke versus dispatch tested in both orders; reactivation cannot revive stale admission; backup restoration cannot reactivate revoked credentials or replay admitted attempts. A least-privilege inference key is not upgraded to an organization-admin key merely to populate a cost dashboard.

### KB18-03 — BYOK is presented as private/no-retention by default

1. **Harm:** confidential draft text reaches an unqualified training, retention or regional processing regime.
2. **Severity:** high, potentially critical for prohibited source classes.
3. **Likelihood:** high if “tenant-owned key” or “paid” is used as a privacy assertion.
4. **Trigger/cause:** eligibility inferred from key syntax; regional storage confused with inference; user selection mistaken for declassification.
5. **Evidence:** ADR0099:47–63; P21:3413–3425; E03/E09/E13.
6. **Implication:** certify exact endpoint/model/account posture and minimum egress; no blanket free-tier, ZDR or country claim. Paid API no-training does not mean no retention.
7. **Clause:** “Activation MUST disclose and qualify the exact provider data-use/retention/processing posture. BYOK and selected text MUST NOT override P3/P10. A changed or unverified required posture MUST block new egress; original content and manual writing remain available. Newsletter feedback MUST NOT automatically submit draft/output content to provider training or support channels.”
8. **Proof:** eligible versus prohibited text, disabled training opt-in assumptions, unverified paid project, unsupported regional model and stale certification are denied correctly; safe errors/audit contain no forbidden text; switching to a nominally cheaper free tier cannot preserve activation silently.

### KB18-04 — Provider budget labels are mistaken for Asym's spending guarantee

1. **Harm:** surprise provider invoices and misleading tenant controls.
2. **Severity:** high for trust and avoidable financial exposure.
3. **Likelihood:** high under shared keys, delayed billing or a naive UI label.
4. **Trigger/cause:** project alert mistaken for enforcement; a provider's enforced cap assumed instantaneous; external usage counted as controlled by Asym.
5. **Evidence:** P21:3364–3368,3489–3501; E02/E07/E11.
6. **Implication:** distinguish purpose allowance, provider alert/hard-limit configuration and actual bill. Provider controls can supplement, not replace, local admission.
7. **Clause:** “The tenant limit MUST be labeled as Asym-controlled estimated usage for its named purpose, currency and period. It MUST NOT be represented as an all-provider-invoice cap. Provider hard caps/alerts MUST be described according to verified current semantics, including enforcement delay and scope. No key or billing-account change may reset Asym's accumulated purpose usage.”
8. **Proof:** same key used outside Asym is not reported as controlled spend; mixed currencies never sum; OpenAI hard-limit and ordinary throttling errors differ; Gemini cap-delay state is not claimed as zero exposure; local cap survives key/model/provider-binding toggles.

### KB18-05 — Concurrent requests, tiny amounts or pricing drift bypass the cap

1. **Harm:** simultaneous admissions overspend; rounding or missing categories understate usage.
2. **Severity:** high for a tenant's requested financial control.
3. **Likelihood:** high if the cap is checked in UI or after completion; medium with incompletely qualified model accounting.
4. **Trigger/cause:** check-then-dispatch races; visible-word estimates; floats/cent rounding; cache-hit assumptions; stale rates or premium modes.
5. **Evidence:** ADR0099:43–45; P21:3366–3376; E04/E08/E12.
6. **Implication:** a small atomic budget admission and exact arithmetic are necessary; a complete provider billing engine is not.
7. **Clause:** “Before egress, one atomic command MUST admit the invocation and reserve its certified complete estimate under all applicable current caps. The estimate MUST include complete bounded billable work and use exact currency-aware arithmetic with conservative rounding. Missing or invalid cost qualification MUST block that adapter. Request/token/concurrency bounds MUST also be enforced server-side.”
8. **Proof:** two real concurrent requests competing for one remaining allowance admit at most one; rollback produces no reservation-only or egress-only success; fractional sub-cent calls accumulate correctly; huge/nonfinite/negative inputs fail; hidden thinking, cache-write and region premiums cannot evade limits; policy/rate update races cannot mix versions.

### KB18-06 — Timeout recovery duplicates charges or permanently traps the author

1. **Harm:** duplicate charges, lost allowance or unusable writing after uncertainty.
2. **Severity:** high for billing correctness; medium for workflow blockage.
3. **Likelihood:** high if SDK retries or generic retry buttons are left unqualified.
4. **Trigger/cause:** network failure interpreted as provider rejection; unknown reservation freed; inspection requires a nonexistent lookup; retry identity changed by browser/worker.
5. **Evidence:** ADR0099:60–63; P21:3442–3445; E04/E05/E08/E12. These inspected docs do not establish a universal idempotent replay guarantee for every candidate generation endpoint.
6. **Implication:** separate retry of one admitted invocation from a deliberate fresh generation. An unknown old request need not make all new writing help unavailable forever.
7. **Clause:** “A possibly dispatched invocation MUST NOT be blindly replayed or silently failed over, and its uncertain cost MUST remain reserved. After inspecting available exact evidence, the author MAY deliberately request a distinct new generation under fresh authority and remaining allowance; the interface MUST explain additional possible usage without a routine confirmation dialog. A late old result MUST NOT replace a newer chosen result. Unsupported lookup MUST NOT create an endless waiting requirement.”
8. **Proof:** double click with different transport keys creates one attempt for one authorization; lost response plus automatic worker retry creates no second dispatch; explicit new request reserves separately; exhausted remaining allowance blocks it while manual editing works; late old response cannot overwrite; no-provider-evidence path remains usable.

### KB18-07 — Streaming, cancellation or late usage corrupts result/cost truth

1. **Harm:** partial text treated as final; double-counted or erased cost; revoked content disclosed.
2. **Severity:** high for disclosure and budget truth; medium for misleading completion.
3. **Likelihood:** high if success is inferred from HTTP headers, first token or browser cancellation.
4. **Trigger/cause:** cumulative usage summed; stream ends without terminal evidence; cancel treated as a refund; settlement coupled to rendering a suggestion.
5. **Evidence:** P21:3372–3376,3440–3445; E04/E05/E08/E12.
6. **Implication:** terminal result validity, current visibility/application and usage settlement are independent.
7. **Clause:** “Partial output, HTTP success, a closed stream or local cancellation MUST NOT establish a complete valid suggestion or zero cost. Usage observations MUST be correlated and settled idempotently according to their cumulative/delta semantics. Final authorization and source checks MUST govern disclosure/application independently of recording body-free usage evidence.”
8. **Proof:** truncated zero-visible-output reasoning still counts; stream error after first token cannot become usable final suggestion; cumulative usage 10→25 counts 25, not 35; repeated final evidence settles once; revoke/source-edit/Cancel versus completion in both orders cannot disclose or apply stale text; usage remains correct after text expires.

### KB18-08 — Controls become an unnecessary configuration and billing product

1. **Harm:** administrators cannot enable a small writing feature safely; missionaries face provider jargon, routine warnings or loss of manual continuity.
2. **Severity:** medium for adoption; high when complexity obscures egress or spending.
3. **Likelihood:** high if each provider exposes its full console or every request asks approval.
4. **Trigger/cause:** advanced model settings shown as user choices; copied public-page actions/timers; unlimited activation default; provider testing silently incurs generation charges.
5. **Evidence:** ADR0099:65–78; P21:3489–3520; public-page OpenSpec:851–879; Q18 source exclusions.
6. **Implication:** purpose-first card, qualified adapter defaults and explicit tenant allowance; no need to ask the founder to design rate algorithms or expose them to authors.
7. **Clause:** “Newsletter assistance SHOULD start Off until an authorized tenant activates a qualified binding with a finite allowance. Ordinary author requests MUST remain explicit and optional, with no automatic generation on typing, autosave or opening a draft. Administration MUST distinguish non-billable connection validation from any deliberately billable test. The manual editor MUST remain complete under every disabled, unsupported, throttled, exhausted or failed state.”
8. **Proof:** onboarding distinguishes saving a key, testing and activating this purpose; ordinary generation does not require a modal approval; no tests or autosave cause hidden generation; keyboard/phone users can continue manually under every failure; toggling Off does not alter newsletter sending eligibility or saved draft truth.

## Defaults and remaining qualification

**Product judgment proposed for this review:** tenant Off until deliberately
configured; finite, conservative per-request/input/output/concurrency bounds
supplied by the certified adapter; a modest finite monthly estimated-usage
allowance chosen by the tenant before activation; one clear outstanding
generation/result in the author interaction. A prior unknown invocation may
remain in cost evidence while the author deliberately requests another. Do not
silently convert “one visible generation” into “unknown provider work is zero.”

No numeric currency amount, token cap, retry interval, reset timezone, model,
provider, expiry duration or new suggestion-retention duration is selected by
this note. Numeric defaults require the chosen adapter's cost/latency/quality
qualification and realistic newsletter examples. They are bounded engineering
and product-calibration work, not a reason to ask the founder to design a billing
algorithm. The UI may propose a tested small allowance, with the named currency
and actual limit semantics visible before activation. An empty setting must not
mean unlimited.

Newsletter authority, output acceptance and eligibility remain source-owned.
Connection management, usage visibility and ordinary author invocation remain
separate P12 capabilities. Feature Off must not break the D7 manual authoring
and separately authorized sending flow. Public-page assistance is unaffected
except where a deliberately revoked shared connection actually supports both
purposes, which the existing affected-purpose preview must show.

Required implementation evidence is still absent: exact provider/account
qualification, current price/capability approval, model-output quality, actual
server authorization, transaction/concurrency behavior, encryption/rotation,
production retention and provider usage reconciliation. This note executed
**no** behavioral probe, database test, provider request or live credential
validation. The proposed proofs are acceptance obligations, not passing results.
