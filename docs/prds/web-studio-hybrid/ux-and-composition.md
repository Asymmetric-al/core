Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-visual-composition"></a>

# UX, visual controls and composition contract

<a id="web-h-the-staff-experience"></a>

## The staff experience

Web Studio opens at the current Site and exact locale with its normal Content/Pages/Media navigation. Do not require repository setup before editing. The Page workspace has a consistent top bar with scope, title, persistent save state, Preview and the existing publication action. A left panel holds outline/insert controls, the center shows the page, and a right inspector shows the selected node's Content and Appearance tabs. At narrow widths these become deliberately switched panels; basic content editing remains usable without dragging or a desktop-sized canvas.

Keep default work simple: select, type, see, save, preview, publish under the applicable existing policy. Never label a field “Payload,” display a provider lock as authority, or expose a second sign-in. Advanced developer information belongs in Site design/developer settings, not on every Page.

<a id="web-h-selection-and-feedback"></a>

### Selection and feedback

Selection uses the declared document/node/field mapping. Outline selection and canvas selection stay coherent. Inline text editing is a convenience over the same inspector field, not another HTML storage format. An opaque mapping ID is not access authority. Do not emit private source paths, repository links, or editing metadata to ordinary public visitors.

Only the server's exact revision receipt establishes Saved. UI vocabulary: Unsaved changes; Saving…; Saved just now; Published · Unpublished changes; and a cause-specific recovery state. Do not show a success toast per autosave. Local visual feedback may precede save but must not suggest it is durable. Preview/release preparation waits for the intended acknowledgement or clearly uses an explicitly selected saved checkpoint. (R07.)

<a id="web-h-consequences"></a>

### Consequences

A Page instance setting changes that instance. Editing a reusable section changes a separately authorized shared resource. Site appearance controls explain that all relevant locales are affected. Show the difference before the action, not after a global change. “Sync” is not a publication button. Merge, build, qualified, reviewable, deployed and live remain separate states.

<a id="web-h-composition-v1-stays-valid"></a>

## Composition v1 stays valid

Keep existing v1 grammar, node identity, family restrictions and source references intact. The current intended D7 catalog contains Hero, Rich Text, Media, Gallery, CTA, Cards, FAQ, Quote and Impact Statistics; D14 separately owns the Dynamic Content List extension. Specialized forms and ministry-family placements require their owning catalog contracts, not guessed new block types. (R06.)

The new profile adds layout authoring only under HA-A1 after the applicable implementation qualification. It does not coerce every Page to v2, automatically wrap old sections, or expand Article into a general landing-page designer.

<a id="web-h-proposed-asym-page-composition-2-grammar"></a>

## Proposed `asym.page-composition/2` grammar

This is an explicit bounded successor, not an undocumented Puck data format.

| Node                   | Allowed placement                            | Children/slots                                                            | Permitted controls                                                        |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Hero                   | Root only, first when present, at most one   | Leaf; existing semantic fields                                            | Registered visual variant, qualified media/action bindings                |
| Ordinary semantic leaf | Root or allowed layout slot                  | No composition children; bounded semantic repeaters only                  | Content plus admitted finite variant/settings schema                      |
| Reusable reference     | Root only                                    | Exact same-Site/locale compatible reusable revision                       | Selection; editing opens its own resource                                 |
| Stack                  | Root or Split slot; max two container levels | `items`: eligible leaves; at root may also contain Split or Grid          | Width role, gap scale, surface role, content alignment                    |
| Split                  | Root or root Stack                           | `start` and `end`: eligible leaves or one Stack per slot if depth permits | Equal/wide-start/wide-end ratio, gap scale, vertical alignment            |
| Grid                   | Root or root Stack                           | `items`: eligible leaves only                                             | Two/three/four column intent and gap scale; responsive collapse from code |

No container may contain Hero, reusable references, arbitrary HTML or arbitrary selectors. Root Stack may contain Split or Grid exactly as the table permits. Grid contains eligible leaves only; Split contains eligible leaves or one Stack in each slot. Stack-in-Stack is prohibited because it adds depth without a distinct launch requirement. Split cannot contain Split/Grid. Every container must have content to publish; empty editing shells may remain in a structurally valid draft with diagnostics.

**Initial engineering bounds for this selected planning profile:** 64 root entries; 128 total composition nodes including reusable expansion; two container levels; 16 children per Stack or Split slot; 12 Grid items; one reusable expansion level; 512 KiB maximum canonical document JSON. Existing semantic field/repeater/prose limits remain owner-defined and can be stricter. These are engineering caps to qualify, not measured capacity claims or limits retroactively imposed on old valid documents. The reference validator checks the structural subset and does not claim to implement the complete existing semantic catalog.

<a id="web-h-responsive-layout-and-design-settings"></a>

### Responsive layout and design settings

Store intent rather than per-device coordinates. Width roles: narrow/content/wide; spacing: compact/comfortable/roomy; surface: default/muted/emphasis; inline alignment: start/center. Actual CSS values and responsive collapse live in the qualified presentation implementation, using Site brand tokens where applicable. No custom `style`, CSS string, `className`, selector, media query, JS expression, arbitrary breakpoint array, hidden alternate mobile tree or visual-only reading order is allowed in canonical content.

The same logical start/end order becomes DOM, keyboard, screen-reader and collapsed mobile order. RTL changes logical alignment, not content identity. Editor viewports are inspection tools, not separate stored layouts. A code developer still has detailed layout/typography/motion control in qualified source; the visual editor intentionally exposes a safe, comprehensible subset.

Per-instance package settings must be a finite typed schema admitted with the package. For launch permit booleans, bounded numeric ranges, finite enums and references selected by platform fields; any additional text input is content semantics and belongs in a catalog-approved content field. The source package cannot install arbitrary inspector code or a hidden data-fetching field.

<a id="web-h-editor-implementation-decision"></a>

## Editor implementation decision

> **Integration note:** The cited Puck release is the source package’s dated evaluation candidate, not a freshly approved dependency pin. Qualify the actual coherent toolchain. The current slot documentation also requires an outline-path restriction test; see [IG-10](../program-roadmap/integration-guide.md#ig-10) and [Research](../program-roadmap/source-2026-09-22/supplied-roadmap.md#research-refresh).

Qualify the current coherent Puck core cohort; 0.23.0 is the source package’s September 12 evaluation candidate, not an approved dependency pin. Use its composition API, custom fields, dictionary/localization and slots through one adapter. Do not build a general-purpose editor from scratch unless the qualification explicitly establishes that Puck cannot satisfy the mandatory contract. Puck's highly experimental override APIs are allowed only as a small documented adapter surface with contract and upgrade tests. Its default publish callback must never activate public output. (E07–E16.)

`decodeAsym -> toCanvas -> edit intents -> validateIntent -> candidate document -> Asym save` is the data path. `toCanonical(toCanvas(document))` must preserve the canonical semantic value and stable IDs for every supported fixture. Runtime data is revalidated at the server; Puck toggles are UX only.

The approved rich-text editor remains the qualified D11/Lexical adapter. An alternative Puck editor must not introduce another prose format. A custom media field selects owner-qualified IDs and placement metadata. External-data selectors store qualified reference intent, not a snapshot of operational source records (E14).

<a id="web-h-origin-and-trust-arrangement"></a>

## Origin and trust arrangement

Puck needs a coherent client React context and its own preview can be same-origin with that composer (E15). Do not pretend its Preview component is a security sandbox. Place the **whole composer microfrontend** on a separate, ephemeral Site/session-scoped composer origin, themed with shared Maia assets. It receives only the authorized Page subset and explicit safe control descriptors. The trusted Asym shell owns scope, receipt handling, repository credentials, global settings entry and publication controls.

The composer reports bounded draft edit intents to a narrow shell bridge. Shell/server revalidate every edit and exact scope. No message type publishes, grants permissions, fetches arbitrary URLs, installs packages, obtains provider credentials or opens an unqualified source preview. The composer cannot directly call raw CMS operations. Custom renderers may run here only after first-party admission; unreviewed source runs with synthetic fixtures elsewhere.

**Residual trust stated plainly:** origin isolation prevents privileged-shell access; it does not prove a malicious admitted renderer cannot manipulate the authorized document presented to its own composer. Admission, content/setting validation, draft history, bound edit scope and independent review address that residual risk. Do not represent an origin check as proof of human intent or arbitrary-code safety.

Where cross-origin/browser constraints fail, use the same isolated full-page composer with a return-to-Web-Studio action, not a same-origin downgrade. This browser integration is gate Q03; the chosen qualified mode must preserve the complete staff workflow. No silent product fallback to stock Payload UI.

<a id="web-h-accessibility-and-handoff-acceptance"></a>

## Accessibility and handoff acceptance

Every insert/move/delete action must work with a pointer without dragging and with keyboard alone. Provide move controls, legal-destination menus, focus restoration, structural announcements and accessible labels. Color cannot be the only invalid/selected/shared signal. Canvas errors must offer the fully usable outline/inspector path, not strand the user.

Test 320px reflow, 400% zoom, touch, reduced motion, forced colors, screen readers, RTL, CJK, long translations, missing media and low bandwidth. Keep editorial accessibility advice distinct from required platform/package structural invariants; do not create an arbitrary scoring system that blocks content publication. (R06/R07; E30.)

Before calling a site handed over, a representative staff user must independently create the agreed Page type, change media, rearrange a section, identify unpublished changes, preview, publish if permitted, and recover a mistake. Record observed friction. Do not claim a successful developer demo proves staff usability.

---
