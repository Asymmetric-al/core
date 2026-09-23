> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Final Phase25 identity, representation and personal-contact audit

9 September 2026. Q01–Q30 product scope is accepted. This is a read-only implementation-incongruency audit, not a new feature vote, source patch or activation certificate. The source checkout remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; the five pre-existing setup paths remain dirty and unchanged. This lane changed only its `work/phase25-final` research artifacts. No account, token, live identity, provider configuration, database row, GitHub issue or canonical source was changed. No target runtime test was run.

**Disposition:** preserve the ratified journeys and close the eight implementation contracts below. The profile/representation/callback fixes are discoverable owner work. **G01 remains a real native Auth integration blocker after new current documentation, Management API schema and release-source research.** It is no longer supported merely by the older v2.188.1 observation. The public evidence still does not establish the needed native control. A supported upstream resolution or an explicitly reconsidered authentication architecture is required; a portal/RLS workaround cannot be certified as its fix.

## I01 — G01: current native linking evidence still fails the required contract

**Concern:** an unqualified new provider identity can attach to an existing shared principal before Core admits that identity, potentially reaching Auth's own credential operations as well as any weak private-data door. **Severity: Critical. Likelihood: conditional on enabling the affected automatic-linking path; not an observed live attack. Effect:** preserves Q14 A4's release block, rather than reversing the desired social scope.

### What was refreshed now

- Official latest `supabase/auth` release is **v2.196.0**, published 18 August 2026, commit **`0204331ca41a5b49f076b6fa3dc6c0d20b996590`**. Official master resolves to **`0907af9bd6be3c76f472c40a7dcc0dc34abeffaf`**. Neither is claimed as Core's hosted Auth deployment. Public source and release metadata are saved under `work/phase25-final/auth-upstream`.
- Current official [identity-linking docs](https://supabase.com/docs/guides/auth/auth-identity-linking) retain automatic email linking; manual linking is still documented beta. A manual-link UI or enablement flag does not establish that the ordinary native login endpoint cannot automatically link.
- Current [Before User Created](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook) and [Auth hooks](https://supabase.com/docs/guides/auth/auth-hooks) docs do not expose a before-identity-link hook. Latest source `internal/api/hooks.go:74–92` calculates the linking decision and returns without invoking the creation hook unless it is `CreateAccount`.
- Latest `internal/api/external.go:204–289` performs linking/account handling inside a transaction. Its PKCE branch records user and provider state and commits before returning the code; token issuance occurs on the later exchange. `:304–329` has the existing-user LinkAccount branch. A later Core callback or token hook is not a demonstrated rollback of the prior native identity attachment.
- Latest `internal/api/provider/google.go:20–26,110–129` still accepts the verification boolean for email evidence. Although the parser has `HostedDomain`, the returned ordinary metadata does not carry it. Latest `provider/facebook.go:87–99` still marks a returned email verified without a separately returned mailbox-verification fact. [Google's current identity guidance](https://developers.google.com/identity/gsi/web/reference/html-reference) still distinguishes authoritative Gmail/Workspace claims from a third-party mailbox whose ownership may have changed; stable provider `sub` and mutable email are different facts.
- The experimental mechanism evolved: `internal/conf/configuration.go:321–366` has `ProviderLinkingDomains`; the previous `ProvidersWithOwnLinkingDomain` is deprecated into it. It is **still in ExperimentalConfiguration**. `external.go:345–355` explicitly uses `is_sso_user` for the nondefault domains to permit native email-identity isolation. It is not merely a safe checkbox that preserves Core's current principal/uniqueness semantics.
- The current public [Management API OpenAPI](https://api.supabase.com/api/v1-json) `UpdateAuthConfigBody` exposes `security_manual_linking_enabled`, BeforeUserCreated and CustomAccessToken settings, but no automatic-link disable, provider-linking-domain or pre-link-hook setting. The inspected schema hash is `4F22C16BEBD2DE05A35E056FA075ADF1E5C8BEB5F395BBFA727430F6FDAC9751`. This is a precise public-surface absence observation, **not proof that Supabase can offer no supported arrangement whatsoever**.
- The current changelog was fetched and scanned. It adds passkeys beta and other Auth/platform changes, but does not establish G01's required control. A passkey is not a replacement for the three requested social providers and is outside this implementation fix.

### Candidate resolutions actually tested against the contract

<!-- prettier-ignore -->
| Candidate | Result of current evidence |
| --- | --- |
| BeforeUserCreated hook | Cannot intercept existing-user LinkAccount in the inspected current source. |
| Disable signup | Does not stop the separate existing-user linking branch. |
| Manual linking only in Core UI | Native automatic login remains separately reachable; no documented disable was found. |
| Custom Access Token hook alone | Generic `authentication_method=oauth` and identity inventory do not provide the exact trusted current provider-subject/possession context needed here; PKCE linkage may already be committed. A complete selective native guarantee has not been established. |
| Token claims, P12 or coarse RLS gate | Can protect appropriately mediated Core data; cannot retrospectively protect native Auth linkage or Auth credential mutations. Putting a second identity engine in RLS also conflicts with P12. |
| Experimental linking domains | Real source mechanism, but no stable target-hosted management guarantee; changes native account/uniqueness and SSO-like semantics. Q14 explicitly rejects adopting experimental isolation as the permanent foundation. |
| Custom OIDC/OAuth mapping or new broker | No documented native isolation guarantee established, and a broker/alternate principal system exceeds Q14's accepted architecture. |

### Exact permanent implementation language

> **I01.** Before any affected social route is enabled, the P4/shared Auth owner SHALL qualify an officially supported control in the exact target deployment that prevents a new provider assertion from acquiring an existing principal's authenticator or usable native credentials until Q14's account/possession policy is satisfied. The evidence SHALL cover native authorize/ID-token/manual-link/code-exchange/refresh and credential-management endpoints, not only the Core callback. Exact existing provider-subject sign-in is distinguished from attaching a new identity by email. Provider metadata, provider inventory, a hidden button, Core-only admission or experimental configuration cannot satisfy this requirement.

The concrete upstream question is: **what supported target-deployment control can require deliberate current-account proof before adding an email-matching OAuth identity, while leaving exact already-bound provider-subject sign-in usable and preventing every direct native bypass?** Required response evidence must identify the supported setting/hook/API, reliable input provenance, transaction point, direct endpoint coverage, refresh/recovery/link/unlink behavior and version/deployment support. It must address the Google nonauthoritative-mailbox case and missing/changed provider email.

Prepare that bounded contract for the platform identity owner; do not send external messages without authorization. If no supported native resolution exists, the founder must explicitly choose a revised Auth architecture or a changed release scope. The audit must not silently choose either, drop Facebook/Apple, add a broker, or label email-only completion as completion of Q14. Email-first work can be qualified independently. This is the one remaining **potentially genuine founder architecture decision**, after the upstream contract is established, not another preference/layout question.

## I02 — One active authorization context; role and profile fallbacks are not P12

**Concern:** the proxy, server API and direct data paths can disagree on Tenant or role. A failed membership read may become an empty array while a stale profile role still allows access. **Severity: Critical. Likelihood: concrete current source mismatch; hosted reachability not tested. Effect:** required adoption of existing P12, no new rights or PDP.

Evidence:

- P12 `phase-12-full-role-permission-configuration.md:168–184,223,259` requires one `resolveProjection`, validated Active Tenant Assignment, one Tenant source, causal epochs and coarse RLS; role names and profile defaults do not authorize.
- `packages/auth/context.ts:281–305` derives Tenant from `profiles.tenant_id` with a superadmin demo fallback. `:317–325` reads `.schema("authz")` and ignores the error. `supabase/config.toml:13` exposes only public/graphql_public.
- `packages/auth/resolve-user-role.ts:81–103` explicitly documents why that schema path is not exposed and uses `public.current_user_memberships`; this is a useful narrow precedent, not the complete target PDP.
- `packages/auth/permissions.ts:61–115` still accepts profile-role compatibility and ambient superadmin fallbacks. P12 explicitly orders their retirement; preserving them while adding the new resolver would create a shadow authorization path.
- `supabase/migrations/20260227060000_auth_role_hardening.sql:62–85` fixes metadata role escalation by writing donor role but still assigns a metadata/demo Tenant. Auth-user creation is not proven personal claim or active assignment.

> **I02.** Resolve the human principal, verified host/Tenant and current assignment once through the existing P4/P12 boundary; propagate the exact context to routes, source commands, jobs, egress and the unified RLS source. Unknown/failed assignment resolution SHALL fail closed without profile-role or demo-Tenant fallback. Do not expose the whole authz schema. Any use of the narrow membership RPC must carry the correct caller Auth context; swapping a service-role client into a function pinned to auth.uid() is not a valid fix. Retire reached legacy role/capability fallbacks when the owner is adopted, and prove direct API/Data API/Storage/Realtime paths as well as page navigation.

Auth signature verification is necessary but does not prove current P12 grants. Current [Supabase SSR guidance](https://supabase.com/docs/guides/auth/server-side/nextjs) distinguishes signed `getClaims`, a current `getUser` lookup and non-revalidated session data. Keep shared `@supabase/ssr` request/response cookie handling; do not copy the skill's app-local paths or old middleware naming over Core's shared ownership. The vendor's general data-access example cannot replace P12's current source/epoch checks.

## I03 — Ordinary name/phone needs an explicit narrow owner contract

**Concern:** “profile” currently blends global Auth/account presentation, organization contact, legal/addressee and missionary data. A nice single form could silently acquire new powers or overwrite legal/public facts. **Severity: High. Likelihood: high in the current mixed implementation. Effect:** explicit finite P9 execution amendment requiring final review; no additional UX vote is needed merely to choose unsafe versus scoped behavior.

P4 A2 (`phase-04-identity-account-claiming-foundation.md:127–136`) separates operational CRM truth from Auth and leaves the person spine inert at that phase. P9 `:320–341,555–583,709–718` later owns person subtype/Party binding, plain contact writes and subtype-controlled display-name write-through; Party receives no inline contact fields. P9 does **not** mandate a two-part personal-name schema. Current `20250101000000_init_schema.sql:27–40,62–72` has nullable `profiles.full_name/display_name`, `donors.name` and several phone values, but these are competing legacy sources. A scoped migration search found no implemented `persons` name/contact table contract in the current forward migration tree. Therefore do not claim a canonical unsplit personal-contact field already exists merely because legacy text columns do.

### Proposed exact field/effect matrix

<!-- prettier-ignore -->
| Fact/action | Authoritative scope and permitted effect | Excluded effects |
| --- | --- | --- |
| Name used for this organization's ordinary personal contact | P9 owning person/contact subtype, exact Tenant + proved personal Party + personal-contact purpose. One unsplit source-authoritative value is used for that purpose; the owning service alone controls any intended Party label write-through. | No Auth identifier change; no copied update to another Tenant/represented person, legal-donor snapshot, issued/addressee fact, provider billing name, released missionary/public identity or independent structured legal-name facts. |
| Optional personal contact phone | Same P9 personal-contact owner; exact current field, nullable and deliberately clearable. Use for ordinary contact only under the separate current channel/purpose contactability grant. | Not Auth phone/MFA/recovery enrollment, SMS consent, opt-in, phone-possession proof, preferred channel, household/organization phone, missionary publication or provider billing phone. |
| Global sign-in email | Supabase Auth/P4/Q11, with bounded related-task coordination and Q14 native safety. | Not a generic Name/Phone PATCH or automatic Tenant contact propagation. |
| Organization email | Q11's exact personal-contact operation and possession/provenance rules. | No represented subject or cross-Tenant propagation; no standing topic permission merely from a usable address. |
| Personal mailing address | Ratified Q27 purpose/revision/use-withdrawal contract. | Name/phone edits do not reuse its mail-retirement clocks or silently retarget its reviewed addressee/destination. |
| Current legal identity, printed name, billing identity, public missionary identity | Their existing separately authorized source command/release/correction. | Ordinary contact editor supplies neither that authority nor a merge/reissue/publication command. |

> **I03.** Add the two finite donor self-service contact capabilities to the owning P9/P12 contract explicitly. Resolve the exact personal Party and field/purpose permission server-side. Scope acceptance alone grants no mutation rights. Persist one unsplit personal-contact name within the owning subtype/contact model; its precise physical field can be adopted from an existing qualified source or added narrowly there. Do not write contact columns directly onto Party, manufacture a generic contact_points platform, or treat legacy profiles/donors fallback text as dual authority. If structured fields remain for an independently owned legal or other purpose, they SHALL NOT be overwritten, inferred or used as an alternative authority for this current contact-name purpose.

This defines the missing implementation meaning, rather than silently choosing that an ordinary donor can change their legal identity. If a reached consumer truly needs a legal/addressee change, expose that exact separate owner path. P19 `:627–640` already makes addressee/artifact-affecting changes material while unrelated phone/display labels are not; every reached consumer must use the declared source purpose, not an unspecific “latest profile name.”

### Name and phone behavior

- Use one ordinary **Name** input with explanatory context that this is the name used for the organization's personal contact. Preserve Unicode, user order, mononyms, compound names, accents, punctuation and legitimate script shaping. No title/surname requirement, first-token/rest split, transliteration, forced capitalization or fake-family-name placeholder. If an actual source operation needs separate legal parts, it owns that separate explicitly explained collection; it cannot guess them from this input.
- A missing/unavailable name does not block unrelated donor work or create a profile-completion task. The owning field contract declares whether clearing is allowed; no blank input is silently replaced by an Auth email or an unrelated legal/public name. When changing a required current name, require a meaningful unsplit value, not two Western components. This is validation of the declared field, not a reason to force name entry across the portal.
- Phone remains optional; show why the organization may use it. Use `type=tel` and `autocomplete=tel`, not numeric input or rigid US masking. Preserve the submitted display value. A normalized dialing value is derived only from sufficient declared country/number evidence; no IP/locale/issuer guess. Extensions and incomplete regional interpretation must not be silently lost or reported as possession-verified. Unknown dialing usability affects the relevant contact action, not login, giving or saving unrelated fields.
- Bounds, normalization and Unicode control/markup handling must be a shared typed server/client contract, with no truncation and round-trip tests. Do not freeze the prototype's 120-character surname rule or add a phone-verification service merely to keep ordinary contact information.

Primary evidence: [W3C international spec guidance, names](https://www.w3.org/TR/international-specs/#names) warns against assumed name order and required family names; [GOV.UK names](https://design-system.service.gov.uk/patterns/names/) supports proportionate collection; [phone guidance](https://design-system.service.gov.uk/patterns/phone-numbers/) supports optionality, explaining use and avoiding confusing masks/reformatting. These sources inform input usability, not Core mutation authority.

## I04 — Reconcile every profile writer and result, not only the visible form

**Concern:** partial writes, inconsistent fields and a direct alternate API can defeat the corrected editor. **Severity: High. Likelihood: directly evidenced static control flow. Effect:** implementation reconciliation, not new product scope.

Exact current paths:

1. `packages/api/src/donor-portal/settings-patch.ts:22–55,96–117` splits the name, requires both first and last and recomposes a Western-order display name.
2. `donor-portal/index.ts:84–100,125–169` mirrors names/phone/avatar across profiles and donors through separate writes, then fetches the whole portal. The first write can commit while the second or unrelated read fails.
3. `packages/api/src/profile/index.ts:105–107,135–159` puts a phone in both profileUpdate and missionaryUpdate, writes the profile, then checks missionary access. A donor phone request through this route can therefore persist a profile change and return 403. This is a source-level partial-success finding, not a claim a live donor used that route.
4. `packages/graphql/handler.ts:418–461` has `updateMyProfile` using `atomic_update_profile_with_audit`. Its SQL (`20260223170000_atomic_rpc_and_donation_saga.sql:571–622`) updates only first/last/avatar and copies raw update JSON into generic audit. EXECUTE is correctly revoked from PUBLIC/anon/authenticated and granted to service_role at `:1389–1390`; retain that positive boundary. Its different field/audit semantics still need owner reconciliation.
5. `donor-portal/model.ts:444–456` chooses donor/profile name/email/phone through fallback order, including mobile. A successful clear can appear undone by an unrelated retained value; no fallback proves current selection.

> **I04.** Adopt one typed P9 personal-contact command/read contract across all reached REST, GraphQL, RPC, collection and direct-data entry paths. Validate the complete selected patch and all permissions before any write. One source transaction co-commits the accepted exact fields, monotonic revision and required P9 audit/activity. Return that durable operation result independently of a later full-page refresh. An unrelated read failure cannot turn a committed save into a reported failed save. No generic route may continue a broader mirror or missionary mutation as a fallback.

Use expected source revisions for contention and narrow operation correlation on the owning change/audit record if retry reconciliation needs it; do not instantiate the reserved `crm_command_logs` or provider-idempotency ledger. P9 A17's old client-only double-submit wording must be explicitly reconciled for the reached authoritative field command. Same operation/same payload returns its committed result; changed content conflicts. A stale expected revision never overwrites newer name/phone, even when text changed away and back. A source-proved no-op does not create a false changed fact. Preserve separately permitted partial outcomes only where the task actually spans independent owners, as in Q11; a single P9 contact transaction should not pretend independent partial success.

Retain only current contact values and needed governed source evidence. Generic activity/audit/telemetry should carry field IDs, actor, purpose, revisions and outcome, not copied raw names/phone numbers. Source identity/contact records and legally held/frozen artifacts retain their own record classes. Q27's postal 24h/365d limits and finance seven-year journals are not default name/phone retention rules. Do not create new raw before/after snapshots merely to make an Undo button.

## I05 — Personal, represented and authenticated contexts remain distinct

**Concern:** the legacy snapshot requires one donor owned by the login; this excludes representative-only and nonfinancial users or tempts fake personal donor creation. A represented gift context could also retarget personal contact/preferences. **Severity: High/Critical for leakage. Likelihood: current snapshot shape is observed; target misuse is conditional. Effect:** implementation of Q04/Q11/Q27, no new household/delegation system.

`donor-portal/service.ts:166–203` resolves a profile and exactly one donor by profile/Tenant before any portal result. `donor-portal/index.ts:42–62,73–78` is donor-role/snapshot-shaped. P4 A3/A7 and P9's negative stories `:268–278`, P12 exact assignment and Q04 explicitly require the stronger distinction.

> **I05.** Resolve the current human, Tenant assignment, exact personal contact subject and each represented financial subject separately. Personal Home/Updates/contact operations remain personal even when the donor is reviewing another Party's giving. A represented record grants only its specific capability/purpose, never personal claiming, account control or contact ownership. Do not create a fake personal donor/gift to make the snapshot succeed. If a legitimate person/contact record is needed, use the existing authorized identity/CRM flow without claiming historical gifts or forcing a donation. A record-only grant does not imply list access, and membership/shared email/recognition never supplies the missing grant.

Neutral entry and targeted links follow Q04: personal first ordinarily; preserve an exact active represented task when authorized; representative-only absence is not a fetch failure or an invitation to disclose another record. Test both independent context descriptors and permission contraction after the switch.

## I06 — Preserve legitimate auth return; distinguish email landing from OAuth callback

**Concern:** successful sign-in loses the promised task, while overapplying scanner rules can break a legitimate OAuth callback. **Severity: Moderate usability / High if a return becomes authority. Likelihood: role override is directly present. Effect:** required Q01/Q04/Q14 implementation clarification.

`packages/api/src/auth/callback.ts:15–41` sanitizes `next` but then returns a role-derived home first at `:35–37`; the valid selected ministry/document/arrangement destination is ignored whenever a role route exists.

> **I06.** The shared Auth callback SHALL consume the bounded trusted entry context, establish the qualified session, reauthorize the exact intended Tenant/task/subject, and return there before a neutral-home fallback. A path, host header, Site slug or provider metadata never grants access. Preserve safe filter/period/scroll context only as presentation. On revocation or unavailable target show the truthful safe outcome rather than selecting another donor.

Keep ordinary provider OAuth callback code exchange under its state/PKCE/nonce protocol. An emailed proof link follows P17's selector-plus-fragment, inert GET/HEAD, explicit same-origin POST contract; do not apply a blanket no-side-effect-GET rule to the normal OAuth callback or let email scanners consume proofs. Reconcile older #886/claim-message wording at formal owner adoption. No second per-app callback implementation.

## I07 — Cache/session invalidation must handle the same principal changing context

**Concern:** user-ID-only cache isolation leaves stale represented records, permission decisions or contact facts visible after same-user changes. **Severity: High. Likelihood: conditional; current helper only proves a narrower positive pattern. Effect:** implementation of existing Q11/P12 requirements.

`packages/auth/client-session.ts:131–188` has a useful monotonic async-load guard and signout/user isolation. It is not proof of same-principal Tenant/subject/epoch/credential transition handling. Q11's global credential change and P12 causal revocation affect sessions beyond the initiating donor tab without revealing other Tenant memberships.

> **I07.** Query/DB/store keys and async result fences bind current Tenant assignment, human, target subject/purpose and applicable source/access revisions. Cancel/clear affected state on signout, Tenant/represented-context change, assignment/permission contraction and qualified identity transition; discard late responses from obsolete contexts. Reauthorize each new request and egress. Do not promise recall of bytes already delivered, and do not replace causal server checks with browser notification timing. Refresh/focus and pending offline mutations never silently reapply an opt-in, contact update or financial command under another context.

## I08 — Permission/SQL proof and skill corrections

**Concern:** examples or tests may certify only role-local success while leaving raw mutation, column reassignment or audit attribution open. **Severity: Critical if bypass remains; likelihood unproved target. Effect:** mandatory proof of the already-owned architecture.

> **I08.** Verify table/column/EXECUTE grants, RLS old-row admission and effective new-row checks, composite Tenant/person/purpose relationships, guarded revisions, actor derivation and every privileged caller. Source writer authorization is checked before mutation and cannot transform an allowed row into another subject, purpose or Tenant. Donor clients cannot write Auth identity tables, case/grant/owner/approval fields or source audit actors. P12 remains the sole fine-grained PDP; RLS is its unified coarse Tenant backstop.

The invoked Supabase skill is useful routing but two absolute statements need correction: omitted `WITH CHECK` can inherit `USING`, so absence of an explicit clause alone does not prove reassignment is allowed; SECURITY DEFINER runs with the function owner's privileges and only bypasses RLS when those privileges/ownership/policies permit. Assess the effective policy/grants/role, not the keyword. The skill's schema-iteration recommendations are inapplicable to this read-only task and do not override Core migration governance.

## Required acceptance evidence, in order

1. **Native G01 target qualification:** supported configuration/contract plus direct-endpoint tests for new email-matched provider, already-bound subject, absent/changed/third-party mailbox, manual link, collision, refresh, credential change, unlink and recovery. Prove no native compromise before Core page admission. A source audit is not this test.
2. **One P12 admission spine:** normal donor, representative-only, dual donor/missionary, multi-Tenant principal, revoked assignment, missing membership/error, direct data/RPC and no profile/demo fallback. Actual migrated PostgreSQL grants/policies and runtime source context must agree.
3. **Profile seam closure:** mononym, family-first, multipart, punctuation/non-Latin and source-unavailable name; optional international phone/extensions/clear; prove one purpose/owner, no structured/legal/public/other-party change. REST/GraphQL/RPC/direct attempted bypasses produce the same authorized meaning.
4. **Atomicity/concurrency:** invalid second field writes nothing; audit/activity failure rolls back; save followed by refresh failure remains saved; same-operation lost-response reconciliation; stale two-tab update/ABA; operation result distinct from subsequently newer current values. Verify the current generic-profile phone 403-after-write failure is eliminated at the public seam.
5. **Consumer boundaries:** future contact use, issued/future legal addressee, Q27 mailing use, global email, provider billing and released missionary identity are independently admitted. Ordinary contact updates send no verification/marketing/security/receipt message and create no consent or claim unless their explicit owning task requires one.
6. **Whole return/cache journey:** exact recurring/document/ministry/represented link → auth → permitted return; session expiry during edit; context switch; same-user revocation; late response; low bandwidth; safe current result. Test keyboard/screen-reader/mobile without forcing profile completion.
7. **Adoption/records:** reconcile all four writer surfaces and fallback readers, source docs/OpenSpec/tasks and reached existing tickets before implementation; no dual authority after cutover. Preserve source history and record-class retention; do not backfill claims, merge people or send messages from provider metadata. Disable only an unqualified consumer rather than deleting data or silently weakening G01.

No new product feature is required by I02–I08. I03's finite field/effect semantics and I04's narrow source concurrency/audit amendment must be explicit in the final execution record rather than inferred from source accidents. The record can be implementation-complete about these requirements while truthfully naming G01's unsupported target contract as unresolved. If that upstream dependency cannot be satisfied, a separately explicit architecture/scope decision is required; this audit has not made it.
