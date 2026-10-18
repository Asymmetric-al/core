# D13 — regional browsing and world map with tenant control

**Disposition: Accept with required amendments.** The founder selected **B —
Region browsing plus a world map**, adding tenant control to turn the feature
on or off and requiring clean, clear, easy UX without needless complexity.
Recorded October 16, 2026 UTC against baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

The map/list feature and tenant control are selected. [D46](phase28-d46-regional-discovery-default-decision.md)
now explicitly selects initial Off for new organizations. Other detailed
recommendations, including List-first presentation and control composition,
remain reviewed design, not separately ratified wording or implementation.
Earlier decisions retain their individual statuses. This is research-only work.

## Decision

> Provide regional browsing and a world map of the organization's qualified,
> currently Listed public ministry information. A useful accessible list and the
> map use the same admitted information and region selection. Locations are shown
> through independently approved broad regions; no private worker location or
> device location is needed.
>
> Give authorized organization managers one Regional ministry discovery On/Off
> control for both new views in the missionary workspace. Off removes their entry
> points and blocks their server responses. It does not withdraw independently
> published ministry pages, change public reach, or disable the resource library.
>
> Keep the setting and missionary journey truthful and small. Enabling consumes
> current qualified information; it grants no new data rights. Ordinary missionaries
> have no personal override. Map failures preserve usable list browsing when the
> feature and its source remain available.

B deliberately replaces the prior list-only recommendation. The strongest simpler
alternative remains the list, but a permanently missing map would not fulfill the
selected scope. No new map vendor, package, geocoding service or private directory
is selected. P22's own map exclusion stays intact: P28 needs a bounded, explicitly
qualified geography/map consumer, not a general change to public-page authoring.

## The smallest complete journey

**Organization control.** In the existing tenant settings area for the missionary
workspace, show one plainly labeled control:

```text
Regional ministry discovery                         On / Off
Let missionaries explore approved public ministries by region,
using a list or world map.
```

Recommended behavior is a single-action, immediately submitted switch using the
existing source-command settings pattern, without a second global Save or routine
confirmation dialog. Show Updating while pending and the actual saved state after
authoritative readback. On a known failure, restore the confirmed state with an
inline explanation; on an uncertain result, automatically check status before
retrying. Read-only authorized settings viewers see state as text rather than a
misleading disabled edit control. Do not expose the setting to unauthorized readers.

[D46](phase28-d46-regional-discovery-default-decision.md) selects **Off until
authorized staff enable it** for new organizations. Preserve existing explicit
tenant choices; do not reset them on rollout. Unknown legacy policy requires
qualified migration treatment. Missing or unreadable policy cannot imply On. An unavailable source/profile gives authorized managers
a concise reason and a real owner setup/recovery entry where one exists; no
configuration matrix, fictitious working switch or new approval queue. An ordinary
On within an already qualified profile is not a field-policy widening operation;
actual safety/permission changes retain their existing owner rules.

**Missionary entry.** When available, one **Explore ministries** entry opens a
calm page naming the organization, with one region selector and **List / Map**
controls. Recommend List as the initial lightweight view, with Map one action
away. Both views preserve the same region selection and qualified result meaning.
The list loads independently; map code/assets load when Map is selected. Returning
from a public ministry page preserves browsing position, subject to fresh access.

**World map.** Present an actual world overview with approved broad-region shapes
or highlights. Selecting a region selects the same region as the ordinary selector
and exposes the same eligible ministry results. Keep controls limited to useful
selection, reset and accessible navigation. Do not place person pins at invented
centroids or imply residence, travel or current deployment. A concise helper says
**Locations are shown by broad region.** Map viewport movement does not silently
change the selected region or create an undisclosed second result filter.

**List and missing geography.** Rows show approved public titles/aliases, permitted
region labels and a direct public-page link. A listing with no approved region
can remain in the unfiltered list only when its source permits, with neutral
**Region not shown**. Never infer a location or place it at `0,0`. Explain that
the map covers listings with approved region information. If multiple region
memberships are admitted, deduplicate listing results by source identity; region
counts must not be presented as additive unique ministry or people totals.

**Off and recovery.** Off removes the new navigation entry and stops new regional
data releases. Old links show **Regional discovery is unavailable for this
organization**, with useful navigation back to the workspace. Mounted clients
clear reached results when they learn the change, discard stale responses and
stop further map work. Previously delivered bytes/knowledge cannot be recalled.
Re-enabling is a valid deliberate setting change; it reloads currently eligible
information instead of restoring an old dataset. This is not a terminal sharing
episode like D8 coaching.

Keep No matching ministries distinct from a failed/unavailable source and from
organization-disabled discovery. If only rendering/assets fail, show **The map
couldn't load. You can still browse the list.** with List and Retry map actions.
Do not show successful map readiness on an error or hide a source failure behind
a misleading empty world map.

**Accessible visual quality.** Preserve Core's `base-maia`, Base UI and semantic
tokens. Use a readable single-column phone layout, restrained map colors, text
selection state, clear focus and ample targets. Keep the list fully useful for
keyboard/screen-reader users. Every map action needs keyboard and single-tap
alternatives; dragging, pinching, hover or color cannot be the only way to use it.
Avoid trapping page scrolling. Preserve 320 CSS-pixel reflow, 400% zoom, localized
long labels, reduced motion and focus on view changes. Any retained pan/zoom has
equivalent button controls. Include required map-data/style attribution rather
than removing it for a cleaner appearance. No geolocation permission prompt or
Find me control belongs in this journey.

## Exact requirements and source boundaries

**C01 — One scoped tenant control.** Qualify one source-owned tenant setting under
current P12 authority. Its scope is both P28 regional views, not public page reach,
D12 resources, other tenants or other map consumers. The switch is a subtractive
availability condition, never a permission grant. Formal design must register
the exact setting/consumer with P3/P10/P12 and reconcile P22 consumption; no shadow
flag store, per-view permission matrix or new role is required.

**C02 — One approved source corpus.** Serve only currently Listed, disclosure-safe
P22 releases for one exact Tenant × Legal Entity × environment × Site × locale
context. Qualify the context binding; do not choose an arbitrary default Site or
fall back across Sites/locales when data is missing. Region mapping and geometry
meaning require an independently approved bounded P28 consumer contract. Neither
a public label elsewhere nor a tenant On setting admits new geographical facts.

**C03 — Generalize before release.** Derive all map/list results, tooltips, region
membership, counts, accessibility text, indexes, URLs, logs and provider requests
from the same admitted projection. Apply safety before grouping or counting.
Never send raw private coordinates and merely round/hide them in the browser.
Do not geocode internal addresses, Party data or operational locations. Hidden or
Shared-by-link entries affect no visible totals, regions or ordering. Unknown
region has no sensitive fallback; no device-location capture is needed.

**C04 — Off and adverse changes govern every path.** Recheck current setting and
source/safety authority before each new regional release; stale caches and queued
responses cannot bypass Off or withdrawal. Bind caches to the exact scope and
current setting/source versions, remove unsafe projections and discard late client
responses. Off blocks only this consumer; independently valid public page/directory
routes remain available. Returning On recomputes current eligibility, not a stored
permission snapshot. Distinguish source unavailability from deliberate Off.

**C05 — Safe settings mutations.** Use a trusted actor and validated tenant context,
version-checked source command, durable retry identity, atomic attributed audit
and authoritative outcome/readback. Both old and proposed states must be permitted.
An old On request cannot undo a newer Off; an authorized fresh On is allowed.
No caller-controlled tenant/publisher/audit fields, fixed tenant IDs, raw frontend
preferences or service-role shortcut. If qualification becomes invalid, release
fails closed even while the saved tenant preference still says On.

**C06 — Supabase/data integrity.** Preserve coarse tenant isolation and the single
server authorization/projection boundary. Inspect actual grants/RLS old-row and
new-row behavior, views/functions/RPCs, privileged routes and any derived stores.
Enforce source/version and same-scope references structurally where persisted.
Do not create a shadow missionary-location database or let client geometry become
an authoritative source. Unknown legacy settings are not automatically enabled;
no database schema, numeric limits or extension is prescribed by this decision.

**C07 — Reuse without importing unsafe defaults.** Existing MapLibre is a candidate
renderer, not source authority or provider approval. Qualify actual worker/assets,
style/tile/font/image/network requests, licensing/attribution, accessible controls,
error handling and supported-device behavior. Disable location capture. Do not
adopt a new dependency or a new map vendor from the historical attachment.
Release no private user/worker payload to a map provider. A map library alone does
not establish that all network requests stay local or that the journey works.

**C08 — Coherent simple UI.** Implement the setting and browse/select/open/return/
Off/recovery journey above with current capability-shaped controls and one shared
selection state. List and map admit the same data; unmappable admitted listings
have explicit list-only representation. A failed map leaves the independent list
usable, but the initial qualified release must include a functioning map. Avoid
per-region enable switches, mandatory tours, per-user overrides, dashboards or
extra notifications. D46 selects the initial Off default for new organizations;
List-first presentation remains a design recommendation, not a new product selection.

**C09 — Bounded operation and migration.** Use bounded server projections,
pagination and approved generalized geometry; do not ship an entire internal
directory or full coordinate corpus. Avoid downloading all paginated details to
compute a map summary. Source-qualified map overview and paginated list must share
exact filtering/coverage semantics. Record setting changes and source/render
failures without sensitive location/query payloads. Validate mixed clients,
cache/index rebuilds and rollback/restore against latest Off and safety state.
Qualify real supported-workload budgets; do not invent limits or telemetry products.

**C10 — Proof and traceability.** Carry D13/C01–C10 and P01–P10 into later authorized
owner/OpenSpec/design/tests. Source registration, actual map/list operation,
current tenant setting enforcement and phone/accessibility proof precede activation.
Research cannot establish implementation, a secure deployed configuration or
measured user success. Product availability never depends on a new universal
feature-flag platform or completion of unrelated whole phases.

## Focused adversarial review

Likelihood is conditional engineering judgment, not measured incident frequency.
The clauses referenced below give exact prevention language.

| Concern                                                  | What could go wrong and why it matters                                                                           | Severity / likelihood without prevention | Evidence; effect on B                                                                                                | Permanent fix and exact amendment                                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| R01 — Toggle controls appearance only                    | Old links/caches still serve regional data, or Off wrongly unpublishes pages; tenant intent is violated.         | High / plausible                         | P22 source settings and P12 current context; narrows switch meaning.                                                 | One current server-enforced consumer condition and exact independent-source scope: C01/C04/C05, P01/P02/P05.          |
| R02 — Map reveals more than approved listings            | Raw coordinates, clusters, missing-region fallbacks or tooltips expose workers or suggest false precision.       | High / plausible                         | P10 discovery safety and P22 Listed corpus; requires independently qualified map projection.                         | Generalize/filter before every derived representation, same admitted corpus: C02/C03/C06, P03/P04.                    |
| R03 — Existing UI is mistaken for working authority      | Fixed-tenant settings, local-only Save, map error-as-ready or stale On falsely report success.                   | High / plausible                         | Inspected settings/map source; changes implementation qualification, not chosen feature.                             | Trusted versioned source mutation/readback and truthful map/setting states: C05/C07/C08, P02/P05/P06.                 |
| R04 — Map is difficult or expensive to use               | Drag-only controls, scroll capture, large downloads or unavailable WebGL prevent discovery.                      | Medium / likely if defaults are copied   | Existing marker/control code plus WCAG/MapLibre guidance; adds full alternate journey.                               | Equally useful list, lazy map, small controls and real recovery/accessibility proof: C07–C10, P06/P07/P09.            |
| R05 — New map product duplicates owners                  | New geography records, flags/provider/permission engines or broad settings matrices create permanent complexity. | Medium / plausible                       | P22 excludes maps from its launch catalog; P28 separately qualifies consumer; preserves B through bounded extension. | Reuse source contracts and installed renderer where qualified, one tenant control: C01/C02/C06/C07, P08/P10.          |
| R06 — External assets and retained state escape controls | Location button, provider requests, missing attribution or restored datasets leak context or break delivery.     | High / plausible                         | Current CARTO style/geolocation defaults and P10 adverse-first serving; requires network/rollout proof.              | Explicit renderer/network profile, no location capture, current rebuild/rollback state: C03/C04/C07/C09, P03/P08/P10. |

| Review category                           | Material concern?              | Assessment                                                                                                                                           |
| ----------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, alternatives | Yes — R04/R05                  | B is the founder's selected visual-discovery scope; list-only is simpler but no longer the answer. No measured map demand or superiority is claimed. |
| Brittleness                               | Yes — R01/R03/R06              | Missing settings, absent regions, delayed responses and unsupported map runtime must have defined outcomes.                                          |
| Technical debt                            | Yes — R03/R05                  | Do not preserve fixed-tenant/local Save defaults or duplicate geography/flag authorities.                                                            |
| Edge cases                                | Yes — R01–R04                  | Off while viewing, no region, multiple regions, withdrawn listing, changed locale and failed map are addressed.                                      |
| Footguns                                  | Yes — R01/R02/R06              | An On switch, familiar map component or visible approximate marker cannot authorize extra data.                                                      |
| Tenant safety                             | Yes — R01/R02/R03              | Exact tenant/entity/Site/locale and trusted settings scope govern all results and mutations.                                                         |
| Database, RLS and authorization           | Yes — R01–R03                  | Structural scope and actual old/new mutation authority remain necessary; a browser toggle is insufficient.                                           |
| Overengineering                           | Yes — R05                      | One combined feature control; no custom geography platform, per-region flags or new provider selection UI.                                           |
| UX/UI and friction                        | Yes — R03/R04                  | One selection across List/Map, truthful states and accessible controls keep the journey coherent.                                                    |
| Source of truth and invariants            | Yes — R01/R02/R05              | P22 owns releases, P10 safety, P12 authority, P28 consumer/setting intent; geometry is not worker-location truth.                                    |
| Hidden coupling                           | Yes — R02/R05/R06              | No coupling to private Locations data, map vendor defaults or public-page publication settings.                                                      |
| Failure modes                             | Yes — R01/R03/R04              | Rendering failure allows list recovery; source failure/Off cannot masquerade as no matches.                                                          |
| Lifecycle, concurrency and idempotency    | Yes — R01/R03                  | Stale On/Off writes and rebuilt datasets cannot reverse newer narrowing; deliberate fresh re-enable is valid.                                        |
| Data integrity                            | Yes — R02/R03                  | Source identifiers, deduplicated results, approved region membership and exact scope prevent false placements/counts.                                |
| Security and privacy                      | Yes — R02/R06                  | Generalization occurs before release; metadata/provider/accessibility paths receive no excluded data.                                                |
| Scalability and performance               | Yes — R04/R06                  | Lazy renderer, bounded map summary and paginated lists avoid whole-directory client work; real budgets remain unmeasured.                            |
| Operational burden                        | Yes — R03/R05                  | Real tenant control, source-status diagnosis and asset qualification avoid manual database repair and fake settings.                                 |
| Observability and auditability            | Yes — R03/R06                  | Attribute setting changes and distinguish source/render failures without raw sensitive logs.                                                         |
| Dependencies and integrations             | Yes — R06                      | Installed MapLibre still needs worker/assets, external-request and attribution qualification. No new dependency is selected.                         |
| Migration, rollout and upgrades           | Yes — R01/R06                  | Missing settings, mixed clients and restoration must preserve current Off/source safety; old maps are not migration authority.                       |
| Testability, traceability and proof       | Yes — R01–R06                  | Concrete outcomes below must pass in actual source/UI paths before activation.                                                                       |
| Other development hazards                 | No additional material concern | Checked financial writes, donor consent, resource publication, mandatory geography and private staff directories; none follows from B.               |

## Acceptance scenarios

These are future outcome requirements, not test results from this research turn.

| Proof                              | Observable outcome                                                                                                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 — Tenant control               | An authorized manager turns both views On/Off in their own tenant; ordinary missionaries cannot override it. Independently valid pages/directories and D12 resources retain their separate behavior.                                              |
| P02 — Off during use               | Off before a new regional release blocks it, including stale/deep-link/cache paths; clients clear reached state when notified and discard late responses. Unknown configuration never acts as On.                                                 |
| P03 — Public-only geography        | Network payloads, DOM/accessibility text, tooltips, counts and provider calls contain only the approved corpus/geometry. Device geolocation is neither prompted nor collected.                                                                    |
| P04 — Same results                 | Selecting a region through either view yields identical eligible distinct listings. Missing region is not inferred or plotted; multi-region entries are not double-counted as people. Cross-Site/locale and hidden entries cannot affect results. |
| P05 — Settings races/recovery      | Concurrent On/Off, duplicate commands, lost responses, wrong-tenant input and changed authority preserve current intent and truthful readback; stale On cannot override a newer Off. Fresh authorized On reloads current safe data.               |
| P06 — Honest failure               | Renderer/assets failure leaves a functioning list and Retry map; source failure, empty result and disabled feature have distinct safe states. Map errors never count as successful rendering.                                                     |
| P07 — Complete accessible journey  | Users browse, select, switch, open and return on phone/keyboard/screen reader, with single-tap alternatives for any drag operation, clear focus, long labels, zoom/reflow and reduced motion.                                                     |
| P08 — Runtime and provider profile | The missionary app loads the qualified worker/assets, preserves necessary attribution and avoids unauthorized remote egress; unrelated admin map behavior is not proof of this consumer.                                                          |
| P09 — Supported load               | Real production-shaped corpora meet declared source/UI budgets; list readiness does not wait for map code or download every listing. Summary/list coverage stays consistent.                                                                      |
| P10 — Rollout and trace            | Mixed versions, restoration, index/cache rebuild and deployment disable cannot reinstate excluded data or enable an unconfigured tenant; source changes remain attributed.                                                                        |

## Evidence and limits

- [Q13 research](phase28-q13-regional-discovery-research.md) and
  [founder brief](phase28-founder-brief.md:235) retain alternatives and independent
  geography qualification. The user's B plus tenant control is the new selection.
- [P22 D13](../../../prds/sitestacker-parity/phase-22-public-ministry-pages.md:524),
  [D23](../../../prds/sitestacker-parity/phase-22-public-ministry-pages.md:692),
  [P10 discovery safety](../../../prds/sitestacker-parity/phase-10-sensitive-data-safety.md:681),
  [P3](../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:104)
  and [identity OpenSpec](../../../../openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md)
  require exact current context, source settings and safe projections. P22 D20's
  map exclusion is reconciled by a bounded P28 consumer amendment, not silently erased.
- Current [MapLibre pin](../../../../packages/ui/package.json:98) is 6.13.0. The
  [shared map](../../../../packages/ui/components/primitives/map.tsx:48) uses CARTO
  styles; lines 231/243 disable built-in attribution and mark readiness on error;
  lines 367/655 show click-div markers and an enabled-by-default location button
  that requests location on click. These are reuse gaps, not proof of an active
  missionary leak. Admin worker-copy configuration is not missionary deployment proof.
- [Organization settings](../../../../packages/api/src/admin/org-settings.ts:9)
  targets a fixed tenant for post visibility, while [missionary settings Save](../../../../apps/missionary/app/settings/page-client.tsx:112)
  clears local dirty state. Neither is a qualified D13 setting. Bounded source
  inspection found no complete missionary regional flow; no hosted absence claim.
- Current primary [Carbon toggle guidance](https://www.carbondesignsystem.com/building-blocks/core/components/toggle/guidelines)
  supports one reversible immediately applied binary control; borrow the interaction
  rationale, not Carbon components. [WCAG dragging alternatives](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
  distinguishes pointer and keyboard alternatives. [MapLibre options](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/)
  and [W3C geolocation privacy](https://www.w3.org/TR/geolocation/#privacy_for_recipients)
  inform interaction/data-minimization review. Checked October 16, 2026; primary
  docs and package presence do not prove behavior at Core's installed pin.

Performed scoped repository/primary research and independent owner/UX review.
No application, database, map rendering, geolocation, network-payload, browser,
accessibility, real-user or load test ran. No map provider received user data;
no dependency, live tenant setting, public release or formal owner/spec changed.

## Synthesis and ordering

The B direction and combined tenant control are selected. D46 now also selects
initial Off for new organizations. The simple map/list journey, initial List
presentation and remaining detailed requirements retain reviewed status; D46
does not ratify the whole packet. The [original review](d46-evidence/d13-before-d46.txt)
is preserved.

During authorized specification, first qualify the exact P28 consumer, approved
region meaning, Site/locale binding and tenant-setting source with P22/P10/P12.
Then select the compatible existing renderer/assets profile and implement the
real setting plus complete map/list journey. Require C01–C10 and P01–P10 through
actual authorization, race, cache, deployment, accessibility and user-task proof
before activation. Do not ship list-only as permanent completion of B or turn a
provider choice into another user settings product.

Residual monitoring: **any confirmed regional release while Off or disclosure of
excluded location/identity** goes to the P12/security and P28 source owners for
immediate consumer containment and requalification. **Any reproducible map failure
on a supported device or misleading control state** goes to the P28 UI/runtime
owner for repair and affected-journey retest, preserving the list where safe.
These are concrete signal/threshold/owner/response rules, not substitutes for
the required prevention and initial map qualification.
