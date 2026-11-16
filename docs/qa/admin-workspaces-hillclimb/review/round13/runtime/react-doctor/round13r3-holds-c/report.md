# Round13r3 holds C — individual Doctor exception recommendations

**Recommendations for root review only. No approval or final current-candidate acceptance.**

## Scope and result

- Checkout: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. Only new artifacts in `docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r3-holds-c/` are owned.
- Source: `docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/handback-proposal-review.json`, `remainingStaleRecords[130..194]`, zero-based inclusive: **65 records / 55 owner files**. The other130 records are not adjudicated.
- **62 exact-rebind recommendations; 0 retirements; 1 reject/repair; 2 holds.** All65 canonical records remain unmodified; no proposal is applied.
- Explicit unresolved qualification positions: **149,156,193**. The62 recommendations still require independent root review and current binding; they are not approvals.
- Exact previous identities/record hashes, selected candidate diagnostics, current whole/byte-context hashes, individual rationale/evidence/tests/limits/reconsideration and all151 input receipts are in `decisions.json`.
- Decisions JSON SHA-256: `cf38acc87dbcd0bd078dd8d32a4a947c740cf49505f0863b51380e445248f336`.

## Explicit unresolved records

### Position 149 — reject-repair

`packages/ui/components/shadcn/item.tsx:18` — ItemGroup / role="list".

Do not renew the role-over-tag exception as currently justified. The parent promises a list, but Item deliberately omits role=listitem whenever render is supplied; the real test renders an anchor inside ItemGroup and asserts that no listitem exists. Avoiding invalid ul/non-li markup explains why a blind tag swap is unsafe, but does not establish a coherent accessible-list contract for the supported custom-child path.

Reconsider: Reconsider after the owning group/item API has an explicitly supported list composition for default and custom-render children, regression tests assert it, and authorized native accessibility verification supports the chosen repair.

### Position 156 — hold

`packages/ui/components/shadcn/navigation-menu-component.tsx:123` — NavigationMenuPositioner / measured Popup dimensions.

The installed Base UI 1.9 implementation really measures and writes popup/positioner width and height variables, so the old reason is not invented. However, the candidate explicitly transitions width and height as well as transform/opacity, and the inspected tests cover active-link/indicator state, not resizing between open panels or the performance cost. Measurement ownership alone does not prove this layout animation should be excepted.

Reconsider: Reconsider after the owner justifies dimension transitions against a non-layout alternative and provides focused open-panel switching/geometry and reduced-motion behavior evidence for the installed primitive, without weakening Base UI ownership.

### Position 193 — hold

`packages/ui/components/view-transitions/shared-named-transition.tsx:38` — SharedNamedViewTransition / no-class fallback Fragment.

The fragment does preserve an inferred Element-shaped return while accepting arbitrary ReactNode children, but the function has no explicit Element return annotation and the inspected JSX consumer imposes no Element-only API constraint. Installed React19.3 FunctionComponent permits ReactNode or Promise<ReactNode>. These observations make the old type-preservation explanation plausible as an implementation description, not sufficient evidence of a required public compatibility boundary. Keep unresolved for root review rather than refreshing this exception or deleting the fragment here.

Reconsider: Provide a concrete supported Element-only consumer/API declaration plus a focused existing type/behavior regression, or authorize a fallback simplification with appropriate verification. Reassess if React types, feature gates or shared transition contracts change.

## Authority and historical limits

Read root/UI AGENTS, code-review and React Doctor skills, review policy, protected paths, the exact scanner/ledger guide/helper, adjacent round13r2 review/report, fresh report and installed contracts as needed. No nested AGENTS exists on the new-artifact ancestor chain. Current owner/source evidence outranks historical rationales.

The source list SHA is `b423332f2ecdf2844076be16eafa5f14422168dbeb1e4422f373dfb5def21474` (798889 bytes), checked historically at `2026-11-11T21:54:42.751Z`. All65 source-list previous-record hashes match the currently inspected canonical records. All65 selected identities occur exactly once in each retained strict/raw UI report;77 candidate-list occurrences collapse to65 unique identities. There is no retirement-by-absence.

Adjacent review recorded7 rebindings and41 retirements, leaving195 stale records. Those recommendations are historical and are not inherited as approval of this slice. Its binding records base `8368004b339384eb98129a086ca71b7db88534ed`, frozen1,038-entry manifest `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0`, diff `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b`, and inventory `a4b92ea2ba382845a752f0b64094632b40c6f8a4f35c370dabd7a8bb522e6cc3`. These are recorded historical values, **not a new Git/frozen-workspace verification**. The manifest hash is not the UI package manifest.

The fresh report is historical strict **FAIL**, exit1, concerning changed Eve evidence; raw exit0 is inventory only. Official strict `actionable.json` is absent, not zero. Historical eight-target totals are669 applicable /11,452 raw /629 independently unresolved. This review subtracts nothing from those totals. Retained UI strict is schema3/full/0.9.18, complete297 files, no skipped checks,200 diagnostics (4errors/196warnings), null score; raw has2,337 diagnostics. No current round13r3 scan exists from this work.

The exact ledger contract requires identity, whole-source/context/evidence hashes and concrete reason/reconsideration (`docs/guides/development/react-doctor.md:37`; `scripts/react-doctor-ledger.mjs:55`, `:100`, `:232`, `:245`). All7 assigned rules remain warn; ignore.rules is empty. Advisory blocking=none is not acceptance. Installed node_modules declarations below are framework-observation receipts only, never proposed ledger evidence paths.

## Temporal receipts and changed inputs

Retained observation: **2026-11-12T02:51:07.707Z–2026-11-12T02:51:07.855Z**. Final comparison: **2026-11-12T02:56:36.901Z–2026-11-12T02:56:37.041Z**. **151/151 retained inputs unchanged** in this bounded window. The55 owning sources match the source-list whole-source hashes. The PDF consumer remains `375ba25f50eca2a4ffbdb892b9b263ec50162bcd156b2fdb71167af1e47c8ee3`. This is not a workspace freeze: active grid/PDF/catalogue writers can change other inputs or these inputs after observation.

An earlier151-input comparison ended at02:29:11.236Z with zero changes. Following local JS state loss, already-authored65 note literals were recovered from this task transcript via a restricted AST data parser, not re-created by rule-group approval. **66 earlier per-file hashes are recoverable and unchanged;85 earlier per-file hashes are unavailable.** Do not infer earlier stability for those85. Every input now has explicit retained/final hash+time receipts; this recovery limitation is not hidden as current-candidate proof.

Historical ledger staleness is distinct from observed concurrent drift: all65 have evidence mismatches;8 record source hashes (7 distinct owners) and6 old-location context hashes differ from the old ledger. The UI manifest expected by the old ledger is `da7121681b3df3607b402b1077cdb6c93fd1f5b753f83882328ca5db9999a577`; observed is `65ba38f8461e2c2f506b2d1f7e082ace4f6aaca86d38473890c4387b5ba384f0`. No manifest/ledger hash was refreshed.

| Position | Owner                                                                 | Old ledger source SHA-256                                          | Observed source SHA-256                                            |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 130      | `packages/ui/components/shadcn/command.tsx`                           | `38e02be690ddef3e43d4fcf85bbc9c3354219e68e19e3d709907ab26cd265f41` | `9a1340cf10f4109bcc34da95cf54d1229b858dc628cd14e79287018bc439e639` |
| 138      | `packages/ui/components/shadcn/data-table/filters/filter-builder.tsx` | `bc9b9e1719a9b59716a7ca0fd7a11e33fc63e413d25f5162012d1d83f7faf513` | `9947e3236c5ae0436f8602f5870f2397a48bccb57174d6ef1378a5c5a39c5a87` |
| 165      | `packages/ui/components/shadcn/rich-text-editor/rich-text-editor.tsx` | `cd615a4a46128861d513bb269639a5651ab6d1c13f4e73be4826ca31c739252f` | `e898986d5e251dff35c1518aea22d5b3ff3e1f795c789c2a0c71aad406cfadf0` |
| 167      | `packages/ui/components/shadcn/searchable-select.tsx`                 | `8998cde4bd8ab7e90d66e79a9f0dea848eb399a5117372fa40c02361b7f03cc1` | `ae6bc315734281cb7d79ac96c64ccd2a1903ea70f89212f99ce62bd4a180bd54` |
| 170      | `packages/ui/components/shadcn/sheet.tsx`                             | `be2515f5a6cfd26288d598cdd82422cc879f33af3292a17e17ff3b27f789fac0` | `dae8e7d7478977256524b418192a4633ee5020f41cbd1970b7b030c3ca1b1d2d` |
| 171      | `packages/ui/components/shadcn/sidebar.tsx`                           | `e8460d41a0e6103a44139931eda27e54337603340212760bde97e243d722527c` | `75906b5ff3668ef6e02261914c1f94f0afb84b70c6d956c110ed70a0e4469910` |
| 172      | `packages/ui/components/shadcn/sidebar.tsx`                           | `e8460d41a0e6103a44139931eda27e54337603340212760bde97e243d722527c` | `75906b5ff3668ef6e02261914c1f94f0afb84b70c6d956c110ed70a0e4469910` |
| 192      | `packages/ui/components/studio/ReactEmailEditor.tsx`                  | `4def4c7c36efeba140b2448f3a22c9cfe818be2054a2a36df0074160879cbb56` | `7d2a28ecd74bc102e00256d3527cdc75b32ff218d524c92209a4b632188facb2` |

Other historical evidence mismatches (full values/positions in JSON):

- `packages/ui/package.json`: old `da7121681b3df3607b402b1077cdb6c93fd1f5b753f83882328ca5db9999a577` → observed `65ba38f8461e2c2f506b2d1f7e082ace4f6aaca86d38473890c4387b5ba384f0`; positions 130,131,135,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,162,163,165,166,167,168,169,170,171,172,173,174,176,177,178,179,180,181,182,183,184,185,186,187,193,194.
- `packages/ui/components/shadcn/data-table/index.ts`: old `7a7941fcf00f1ef305fb61a56765593d3afaa6a582a4127075df23cc3c16b393` → observed `11faf9f7075ce54223ee9e338f99a014dee511f2a6af4c10a8a3aaa1ada94d6e`; positions 132,133,134.
- `packages/ui/styles/globals.css`: old `25b7c076b52d7cdc5b16dd27fca9fa29a77bac8ac6dfb1fe4fcb6d993c622d1c` → observed `f15c78994f2d7554af170cfea9377b6db50d77b47de599749f1573ef16fabe60`; positions 136,156,161,175,188,189,190,191,192.
- `packages/ui/components/shadcn/rich-text-editor/extensions.ts`: old `aa604ff115ee739bbca1be7a213baabe945f0d8695ad9d6fc53a672004e5a388` → observed `87e7b032f40b416491b8fc6c788679864d82ec2a622b798691cb81c10223c30d`; positions 164.
- `packages/ui/components/studio/ReactEmailEditor.tsx`: old `4def4c7c36efeba140b2448f3a22c9cfe818be2054a2a36df0074160879cbb56` → observed `7d2a28ecd74bc102e00256d3527cdc75b32ff218d524c92209a4b632188facb2`; positions 192.

## Method and limits

Owner/source and installed-contract inspection was batched, but all65 judgments are separately authored below. Typed forwarding is qualified only for the actual host/state/provider boundary: no copied universal ref/render claim. Handler members are checked against their hook/merge owner. The image rationale is document geometry/serialization, not an unsupported assertion that Next Image cannot forward a ref.

All8 animation identities were checked independently. Shared `packages/ui/styles/globals.css:372` shortens non-exempt CSS animation to one0.01ms iteration; it does not mean animations are eliminated. Admin/donor import shared globals; missionary imports them through its package stylesheet. These8 elements lack spinner-essential. No computed style/media/cascade, browser timing or JavaScript-motion proof is claimed. `Spinner`177 is a spread record and its essential-motion policy is not approved here.

Twenty existing test/helper files were read, not run. Real primitive/editor seams and mocks are distinguished per record: Sonner and hosted/dynamic editors are mocked where noted. No test pass, runtime interaction, provider readiness, performance trace, PDF export or screen-reader proof is fabricated. No audit, scanner/helper execution, server/provider run, Git command, child/delegation or product/test/config/ledger/frozen-evidence mutation occurred.

**Execution deviation:** one unintended read-only UI surface-inventory call occurred; browser inventory was unavailable. A subsequent unrelated thread-wait attempt failed `thread_not_found`. No app/tab was selected/opened, no UI input occurred, and no child/provider run started. Neither call supplies review evidence. These calls were outside the requested workflow and are disclosed, not presented as authorized verification.

### Installed framework observations

- @base-ui/react 1.9.0: `packages/ui/node_modules/@base-ui/react/package.json`, SHA `29c2b0a1b941bdc5335ed31e31f40231dc0ad3b96343c92715029d18a32e42c3` (inspection only; ledger-ineligible).
- cmdk 1.1.1: `packages/ui/node_modules/cmdk/package.json`, SHA `00bb6d53974c8b1e4ae42c04fef75b07a94a69fae2fdb1095dd92a834cd6db71` (inspection only; ledger-ineligible).
- next 16.4.2: `packages/ui/node_modules/next/package.json`, SHA `e84ada0a68191fed192392bfb8ee35ad4ed8e7439f645a40dd48cf139588ddc5` (inspection only; ledger-ineligible).
- next-themes 0.4.6: `packages/ui/node_modules/next-themes/package.json`, SHA `e44cdac8c8fa4048a883f41dcdda2eb200e917ccbad68467b79418fb67df9ec4` (inspection only; ledger-ineligible).
- @tiptap/react 3.32.0: `packages/ui/node_modules/@tiptap/react/package.json`, SHA `4044ed198a1e3c2f8407edc8d82fd842555d5c113ec49900f3cae30a74fc0446` (inspection only; ledger-ineligible).
- react-resizable-panels 4.14.8: `packages/ui/node_modules/react-resizable-panels/package.json`, SHA `e2b65600c4ccd5098faf3f3e8f52b70e4e8a26ef9e4fd0574c1561893a583d86` (inspection only; ledger-ineligible).
- sonner 2.0.8: `packages/ui/node_modules/sonner/package.json`, SHA `da53b9769476028581eb6d6b5f90ed1c3f70bfef238147a2613b56829831b3ee` (inspection only; ledger-ineligible).
- react 19.3.1: `packages/ui/node_modules/react/package.json`, SHA `9cc9c3de5441a2eea7f41f52f3f2a15a4fc51f90c0b72741f0d7638643a85e67` (inspection only; ledger-ineligible).
- @types/react 19.3.0: `packages/ui/node_modules/@types/react/package.json`, SHA `505c0df4cd73d6a02c946bd9b81451584bd9c83ea72d75cff9b826efceaa19c2` (inspection only; ledger-ineligible).

## Individual decisions

Each position is an exact source-array identity, not a batch waiver. Full identities and diagnostic fields are retained in JSON. The previous-record hash and byte-context hashes are guards, never a mechanical hash-refresh instruction.

### Record 130 — Command / cmdk root

**exact-rebind** — navigation-only ledger index201; `packages/ui/components/shadcn/command.tsx:28`; `react-doctor/jsx-props-no-spreading`.

Command consumes only className from ComponentProps<typeof CommandPrimitive> and forwards the remaining cmdk contract directly to that same primitive. CommandDialog supplies its accessible label to Command; replacing the remainder with a fixed visible subset would drop supported root inputs. Qualify only this cmdk adapter spread.

Prior rationale review: The old generic event/ref/render rationale is replaced by the actual cmdk type and accessible-label consumer; no Base UI render contract is invented for cmdk.

Binding: source `9a1340cf10f4109bcc34da95cf54d1229b858dc628cd14e79287018bc439e639`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `2679e6faf26e9e6ecaf336c2cbbdd153e6358d04084dc4eee24580d33c0fc27a`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/command.tsx:17` — Typed cmdk input and exact forwarding owner.
- `packages/ui/components/shadcn/command.tsx:60` — CommandDialog passes its label and children to the actual Command wrapper.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-overlay-contracts.test.tsx:102` — Real CommandDialog consumer asserts modal title and description; not every cmdk prop.

Limits: No cmdk search/ranking, all-ref, or browser keyboard certification; consumer test source only.

Reconsider: Requalify if cmdk props, label forwarding, class filtering, exports, or the installed cmdk dependency changes.

### Record 131 — ContextMenu / ContextMenuPrimitive.Root

**exact-rebind** — navigation-only ledger index202; `packages/ui/components/shadcn/context-menu.tsx:12`; `react-doctor/jsx-props-no-spreading`.

The wrapper receives ContextMenuPrimitive.Root.Props and passes those state, children and change-detail inputs to the non-DOM Root unchanged. The actual menu tests construct this root with defaultOpen. Enumerating only markup attributes would discard the state-root API.

Prior rationale review: Renew the narrow typed-root rationale, not the old blanket native/ref/render assertion: installed ContextMenuRoot renders no HTML element.

Binding: source `497f731377fb0898bdb0c95be5e994d3b2e8905d6ca98f540b91f415a5febf9b`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `80d898a0e38ca3f97f40adcbeb0fd4e9b0e56f0fd80191d14f64ec9ab022e136`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/context-menu.tsx:3` — Exact ContextMenu root type and spread.
- `packages/ui/node_modules/@base-ui/react/context-menu/root/ContextMenuRoot.d.ts:5` — Non-DOM root with menu state/change details and children. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-menu-label-context.test.tsx:33` — ContextMenu is the real parameterized Root; defaultOpen and named group/item ownership are asserted.

Limits: Tests do not establish context-menu long-press, browser focus, or arbitrary DOM-ref behavior.

Reconsider: Requalify if Root becomes DOM-bearing, its state/event contract changes, or the actual consumer is mocked.

### Record 132 — DataTableMobileCard / rowProps.onKeyDown

**exact-rebind** — navigation-only ledger index207; `packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx:436`; `react-doctor/jsx-handler-names`.

The mobile card forwards rowProps.onKeyDown from ReturnType<UseDataTableKeyboardReturn["getRowProps"]> alongside its tabIndex and ref. The owning hook uses that callback to call handleKeyDown(event,rowIndex); a view-owned renaming wrapper adds no behavior and can obscure row/event ownership.

Prior rationale review: The keyboard reason is independently supported at the hook and exact mobile card. This is not the separate data-grid keyboard API and no runtime keyboard result is claimed.

Binding: source `671f5c8a6349801b1a625329db4357b24ab41eb101a09bb7b527344694dabfd6`; candidate context `e8a9b22b2a2502563f6ff9766ec3cb31e462b930d9a05d35878aeea940aafb9e`; previous record `a41f3ff914f9cbcf81ccbc9d204004853126979d94d99959d8d4ebba3bcbf4e8`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx:406` — Typed row-props handoff and onKeyDown at 436.
- `packages/ui/components/shadcn/data-table/hooks/use-data-table-keyboard.ts:100` — Actual row keyboard activation/navigation owner.
- `packages/ui/components/shadcn/data-table/hooks/use-data-table-keyboard.ts:227` — getRowProps delegates onKeyDown with its row index.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/data-table-responsive-inner.test.tsx:1` — Responsive mode consumer inspected; does not directly test this mobile keyboard callback.
- `tests/unit/packages/ui/components/shadcn/data-table-behavior.test.tsx:204` — Real DataTable sorting/selection identity assertions, not a direct keyboard-hook test.

Limits: No direct getRowProps keyboard regression test was found in the targeted test inspection; no keyboard execution.

Reconsider: Requalify if this becomes a locally owned handler, row index/ref ownership changes, or event/cancellation semantics change.

### Record 133 — DataTableMobileCard / rowProps.onFocus

**exact-rebind** — navigation-only ledger index208; `packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx:437`; `react-doctor/jsx-handler-names`.

The exact onFocus prop forwards the hook-owned callback rather than constructing a new action. getRowProps.onFocus sets the focused row index, coordinated with roving tabIndex and the element ref; preserving this contract is distinct from the keydown site.

Prior rationale review: The actual focus callback is a row-index setter; old grouped prose is narrowed to that concrete action.

Binding: source `671f5c8a6349801b1a625329db4357b24ab41eb101a09bb7b527344694dabfd6`; candidate context `701cbc94b4506eeaa902ab7611c729926dd08ec0c2980051ae93ff2698c66c86`; previous record `e0870015063239233890fb6a21ef766be6087d0c2a67013db07684803ee5dfca`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx:416` — Return type and exact onFocus at 437.
- `packages/ui/components/shadcn/data-table/hooks/use-data-table-keyboard.ts:227` — onFocus sets focused row while row tabIndex/ref are supplied together.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/data-table-responsive-inner.test.tsx:1` — Responsive fixture read, not direct proof of focus transfer.

Limits: No mounted mobile focus/roving-tabIndex execution or direct hook test claim.

Reconsider: Requalify if focus ownership moves to the card, the setter contract changes, or the row identity mapping changes.

### Record 134 — DataTableMobileCard / rowProps.onBlur

**exact-rebind** — navigation-only ledger index209; `packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx:438`; `react-doctor/jsx-handler-names`.

The card forwards the onBlur member of its typed getRowProps result without adopting view-side handler ownership. That member is currently an empty callback; the qualification is only the callback-name convention at a typed forwarding boundary.

Prior rationale review: Correct the overbroad grouped keyboard rationale: onBlur performs no focus reset, cleanup or persistence in the inspected source.

Binding: source `671f5c8a6349801b1a625329db4357b24ab41eb101a09bb7b527344694dabfd6`; candidate context `b033574c638f1adf01f5883fb9f8bbbda16492ec306550a60a0d97b2208e640b`; previous record `fa037e85302585630acc57db8b6bd3fcea22a94191bf411d393d94944febe604`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/data-table/data-table-responsive-chrome.tsx:416` — Typed row-props boundary and onBlur at 438.
- `packages/ui/components/shadcn/data-table/hooks/use-data-table-keyboard.ts:227` — Current onBlur is explicitly a no-op at 233.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/data-table-responsive-inner.test.tsx:1` — Nearest responsive test source does not assert blur effects.

Limits: No functional benefit or focus-reset behavior is attributed to the no-op; removing/changing it is not authorized.

Reconsider: Requalify if onBlur acquires behavior, becomes view-owned, or disappears from getRowProps.

### Record 135 — DataTableResponsiveBody / DataTableResponsiveInner

**exact-rebind** — navigation-only ledger index210; `packages/ui/components/shadcn/data-table/data-table-responsive.tsx:36`; `react-doctor/jsx-props-no-spreading`.

DataTableResponsiveBodyProps omits urlState from the public generic responsive-table props. The body derives tableState from the controlled callbacks and initial state, then forwards the remaining typed table options with its owned tableState supplied after the spread. This preserves options rather than hiding an untyped DOM payload.

Prior rationale review: The old generic forwarding argument is refined to the generic table/state boundary and deliberate last-write ownership of tableState.

Binding: source `c62c84eb4c196d2a47a6dca79f413e096809d727c0d3f30e34bacbc676d7c7da`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `a62a357b1b9d43fd92b71a8e73af1792cc4d5c41005dd90500a228f6163841c5`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/data-table/data-table-responsive.tsx:16` — Omitted urlState, controlled callbacks and the exact inner handoff.
- `packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx:384` — Actual responsive inner and skeleton branch, not a fabricated consumer.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/data-table-responsive-inner.test.tsx:1` — Real responsive inner fixture and media-mode expectations; no certification of every forwarded option.

Limits: This site does not waive URL-state behavior, inner control complexity or all responsive interactions.

Reconsider: Requalify if responsive props, urlState separation, state derivation, callback ownership or spread ordering changes.

### Record 136 — DataTableLoadingOverlay / Loader2 animate-spin

**exact-rebind** — navigation-only ledger index211; `packages/ui/components/shadcn/data-table/data-table-skeleton.tsx:100`; `react-doctor/no-ungated-tailwind-animation`.

The exact spinner is rendered only for the table loading overlay and remains paired with visible loading text. Shared globals apply a 0.01ms, one-iteration reduced-motion override to all elements; this Loader2 has no spinner-essential class. The class-only warning misses the inspected Core application stylesheet chain.

Prior rationale review: Renew only this CSS spinner under the verified source policy, not an essential-motion or JavaScript-animation exception.

Binding: source `585b4e87562de6d959413ec4d3e2cb7b131ed97beba76c73d497f16f9738bb51`; candidate context `abcf8147a4446d39b8938ea19c3f5637308a238c2d6cd9250c153217e2abc17b`; previous record `c3d2ecde07b3cd50c2b824726f3e7df8f6ba987169e4f0e3696906e90fb61fa1`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/data-table/data-table-skeleton.tsx:87` — Conditional overlay, exact spinner and Loading data text.
- `packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx:136` — Actual overlay consumer passes loading state.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/data-table-responsive-inner.test.tsx:1` — Responsive rendering consumer read; no computed-style assertion.

Limits: Source-policy qualification only; no media emulation, CSS cascade execution, or external-package-consumer guarantee.

Reconsider: Requalify if the loader classes, shared reduced-motion rule/import chain, loading gate or animation ownership changes.

### Record 137 — DataTable / URL-state body boundary

**exact-rebind** — navigation-only ledger index212; `packages/ui/components/shadcn/data-table/data-table.tsx:86`; `react-doctor/jsx-props-no-spreading`.

DataTable removes urlState, normalizes true to a configuration object, and forwards the generic typed table remainder to DataTableBodyWithUrl with normalized urlState supplied last. Whitelisting currently visible options would narrow the public column/data/selection callback contract.

Prior rationale review: The reason is the concrete generic body dispatch, not an arbitrary DOM/ref forwarding claim. This exact candidate is the URL-enabled branch at 86, not the other spread at 89.

Binding: source `b642700b0482a3637ce50b8709b004cb6cc42dd5d542aefdd1d067993ed92188`; candidate context `10fc25f4c587e96471e6642a625db49cfe328fe30a363cd69d9744b11be74be6`; previous record `311f5a9dbd50659b169999756578ca0df5e3c2a774a44bc8329f346f1957e771`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/data-table/data-table.tsx:40` — Public generic table options and explicit urlState normalization/dispatch.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/data-table-behavior.test.tsx:30` — Actual public DataTable value import.
- `tests/unit/packages/ui/components/shadcn/data-table-behavior.test.tsx:204` — Sorting preserves selection identity; tests are concrete consumers, not proof of URL serialization.

Limits: No URL/history behavior, authenticated data, keyboard or all-options runtime acceptance.

Reconsider: Requalify if DataTableProps, body dispatch, URL normalization or controlled callback routing changes.

### Record 138 — FilterTriggerButton / Button render target

**exact-rebind** — navigation-only ledger index213; `packages/ui/components/shadcn/data-table/filters/filter-builder.tsx:158`; `react-doctor/jsx-props-no-spreading`.

FilterTriggerButton consumes activeCount and className, forwarding the Button-typed remainder to the real Button. Base UI PopoverTrigger and SheetTrigger use it as a render target, so their handlers, ref and ARIA wiring must reach Button. Removing the spread can sever the trigger interaction.

Prior rationale review: The actual render consumers and both trigger tests support this site independently; the move from old line 146 to 158 is not alone sufficient.

Binding: source `9947e3236c5ae0436f8602f5870f2397a48bccb57174d6ef1378a5c5a39c5a87`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `4c48a5c6519ef4d775a2342e34ace7aec64718cc464914f53136697598470a84`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/data-table/filters/filter-builder.tsx:143` — Button props extend the trigger adapter; only activeCount/className are consumed.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/filter-builder-trigger.test.tsx:1` — Real FilterBuilder tests exercise popover and sheet trigger click/aria-expanded transitions.

Limits: Source tests inspected, not executed; no browser focus/geometry claim or other filter finding waived.

Reconsider: Requalify if the render target, Button prop type, trigger wiring, activeCount filtering or interaction tests change.

### Record 139 — Dialog / DialogPrimitive.Root

**exact-rebind** — navigation-only ledger index216; `packages/ui/components/shadcn/dialog.tsx:13`; `react-doctor/jsx-props-no-spreading`.

Dialog directly accepts DialogPrimitive.Root.Props and forwards them to the same non-DOM state root. Controlled open/defaultOpen, children and change details belong to the primitive; reducing the wrapper to a static prop subset would narrow that root contract.

Prior rationale review: Installed DialogRoot explicitly renders no HTML element; do not carry forward the generic assertion that every shared wrapper exposes native/ref/render props.

Binding: source `91d77a99cdc21ccc50653db1df2a165bdc513e7b5440aade359a3e6421f30350`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `853027f1f77fc714eea387e35aab2d4893854535e62f42c71cb5b9ab28cbf1b0`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/dialog.tsx:3` — Root wrapper and typed state handoff.
- `packages/ui/node_modules/@base-ui/react/dialog/root/DialogRoot.d.ts:1` — Installed root declaration distinguishes state root from DOM popup. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-overlay-contracts.test.tsx:41` — Actual dialog primitive state/class consumer.
- `tests/unit/packages/ui/base-ui-overlay-contracts.test.tsx:102` — CommandDialog consumes the real Dialog open/root composition.

Limits: No modal focus-trap, escape-key, provider or screen-reader runtime certification.

Reconsider: Requalify if Root props/control semantics or the wrapper-to-popup separation changes.

### Record 140 — Drawer / normalized swipe-direction root

**exact-rebind** — navigation-only ledger index217; `packages/ui/components/shadcn/drawer.tsx:30`; `react-doctor/jsx-props-no-spreading`.

Drawer consumes legacy direction and current swipeDirection, resolves the supported swipe value, then forwards only the remaining Drawer Root props. The root is state-bearing rather than native markup; preserving open/change/snap-point/children inputs does not leak the legacy direction onto a DOM host.

Prior rationale review: The current normalization helper is verified: explicit swipeDirection wins; top/bottom map to up/down. The old blanket root rationale is insufficient without this filtering.

Binding: source `c97aecb1bfc13be7acf14540ba74f2715dec9c15bb78859c711a639da58e2eef`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `ae4cc8f360cb384d0e474fb9a186a111944aebfe092fc2a89a5abb3246071c12`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/drawer.tsx:9` — Exact legacy/current direction filtering before the Root spread.
- `packages/ui/lib/drawer-swipe-direction.ts:1` — Explicit precedence and supported legacy mapping.
- `packages/ui/node_modules/@base-ui/react/drawer/root/DrawerRoot.d.ts:7` — Installed non-DOM Root and controlled open/change contract. [Framework observation; not ledger evidence.]

No direct applicable consumer test is claimed; see limits.

Limits: Direction helper assertions are inspected separately below; no actual swipe/gesture execution or full drawer lifecycle proof.

Reconsider: Requalify if direction precedence, Root prop shape, snap-point callbacks or the underlying Drawer API changes.

### Record 141 — DropdownMenu / MenuPrimitive.Root

**exact-rebind** — navigation-only ledger index218; `packages/ui/components/shadcn/dropdown-menu.tsx:13`; `react-doctor/jsx-props-no-spreading`.

DropdownMenu passes MenuPrimitive.Root.Props directly to the menu state root. The real menu test opens it via defaultOpen and mounts labelled action groups; preserving state-root inputs and event details is the reason for this exact spread.

Prior rationale review: Installed MenuRoot is non-DOM. Generic native/ref/render language from the old reason must not be mistaken for the contract of this particular root.

Binding: source `746440eea5f7a2d040c573643385a0cd68d4c48ec2389fafe2b4f6df3e7a045c`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `004117d27e46f2b690700e268749181ae5b2e5bebd2468d4b406ff29d4f6f681`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/dropdown-menu.tsx:3` — Typed Menu root handoff.
- `packages/ui/node_modules/@base-ui/react/menu/root/MenuRoot.d.ts:1` — Installed non-DOM state-root declaration. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-menu-label-context.test.tsx:33` — Actual DropdownMenu root and group/item ownership assertions.

Limits: No pointer/keyboard navigation, submenu, browser focus or all-root-props certification.

Reconsider: Requalify if menu state/event props, wrapper scope, or actual tests/imports change.

### Record 142 — Empty / native div container

**exact-rebind** — navigation-only ledger index219; `packages/ui/components/shadcn/empty.tsx:13`; `react-doctor/jsx-props-no-spreading`.

Empty consumes className from React.ComponentProps<"div"> and forwards the native remainder to its actual div. A real admin route error view relies on role="alert" at this boundary; fixed markup-only forwarding would lose a concrete accessible-state input.

Prior rationale review: The native-container rationale is supported by the current role-bearing consumer, not a generic historical AST claim.

Binding: source `cadc76423ecab8a462b4283722ba457c4314b5793ccbef6877feb99ee74e9983`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `b58b650cdf61901eaa8d485b6e072029d0851f92657ae0faf08aca39a263eccb`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/empty.tsx:5` — Native div props reach the Empty element.
- `apps/admin/app/(app)/error.tsx:32` — Actual route error consumer supplies alert role and error copy.

No direct applicable consumer test is claimed; see limits.

Limits: No direct Empty event/ref test was identified; error reporting and retry correctness are outside this spread qualification.

Reconsider: Requalify if the host element, native props, class filtering, or alert consumer contract changes.

### Record 143 — FieldSet / native fieldset

**exact-rebind** — navigation-only ledger index220; `packages/ui/components/shadcn/field.tsx:22`; `react-doctor/jsx-props-no-spreading`.

FieldSet is explicitly typed as ComponentProps<"fieldset"> and sends the remainder to the native fieldset after consuming className. The boundary preserves disabled/form/name/native event and child association inputs; it is not a Base UI Field root despite the adjacent re-export.

Prior rationale review: Narrow the old shared-wrapper explanation to this native fieldset host and avoid attributing Base UI Field validation to this site.

Binding: source `79665628da174c1248c42c4392716397eab4f1221add368bfa478ba26eaa29ae`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `f2ebf968db8861b85a67f89d1ec03c53b640f15f3485e5e84aa508cb117a1aaa`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/field.tsx:11` — Distinguishes FieldPrimitive re-export from native FieldSet implementation.

No direct applicable consumer test is claimed; see limits.

Limits: No dedicated FieldSet disabled/form regression suite was located in the inspected consumer set; no form runtime claim.

Reconsider: Requalify if FieldSet changes host/type, disabled/form semantics, class filtering, or children ownership.

### Record 144 — HoverCard / PreviewCardPrimitive.Root

**exact-rebind** — navigation-only ledger index221; `packages/ui/components/shadcn/hover-card.tsx:8`; `react-doctor/jsx-props-no-spreading`.

HoverCard uses PreviewCardPrimitive.Root.Props and forwards those open/close/children inputs to the installed PreviewCard state root. It intentionally does not enumerate trigger or popup DOM props on a root that renders no HTML element.

Prior rationale review: Retain only the non-DOM preview-card root contract; historical generic ref/native/render wording is not the actual evidence.

Binding: source `478bb5e58ac9d53443f102cbe9910541b379918fd660eb019533835b1494e29d`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `5928967047094ccc8f8efd33a4b26dacb3edff677b3aea752921670f3ed7b6a6`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/hover-card.tsx:3` — Exact PreviewCard root adapter.
- `packages/ui/node_modules/@base-ui/react/preview-card/root/PreviewCardRoot.d.ts:6` — Installed non-DOM root with controlled/uncontrolled open state. [Framework observation; not ledger evidence.]

No direct applicable consumer test is claimed; see limits.

Limits: No direct HoverCard open-delay/pointer test was identified in the inspected suites; no popup interaction execution.

Reconsider: Requalify if PreviewCard Root props, state ownership, delay behavior, or adapter filtering changes.

### Record 145 — AppIcon / nonanimated icon branch

**exact-rebind** — navigation-only ledger index222; `packages/ui/components/shadcn/icons/AppIcon.tsx:53`; `react-doctor/jsx-props-no-spreading`.

AppIconProps extends SVG ComponentPropsWithoutRef, while AppIcon consumes icon, animated, size, strokeWidth and className before forwarding the supported SVG remainder to Icon in the nonanimated branch. Callers retain ARIA/native SVG data without sending those wrapper-only inputs to the SVG.

Prior rationale review: This branch has no ref promise: ComponentPropsWithoutRef is deliberate. The exception is not for the separately implemented animated branch or its motion policy.

Binding: source `049e966fe3116cb2510af9463ed2819e42808d813cc24a1849ac0de0ec5e371d`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `eb87cdb8c88f4ebdd62818aa159c6ea2c976ca7f7fb8c7ce963ecad432132b4f`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/icons/AppIcon.tsx:8` — Declared SVG-without-ref public icon inputs.
- `packages/ui/components/shadcn/icons/AppIcon.tsx:37` — Wrapper prop filtering and exact nonanimated forwarding branch.

No direct applicable consumer test is claimed; see limits.

Limits: No AppIcon-specific mounted event/ARIA/ref test was identified; animation, reduced motion and all icon implementations remain outside scope.

Reconsider: Requalify if SVG input type, selected icon API, prop filtering, or animated branch dispatch changes.

### Record 146 — InputGroup / native group container

**exact-rebind** — navigation-only ledger index223; `packages/ui/components/shadcn/input-group.tsx:37`; `react-doctor/jsx-props-no-spreading`.

InputGroup accepts native div props, consumes its styling className, and forwards the remainder to the role=group container. Container id/ARIA/children/native input events are distinct from the nested Input primitive and cannot be replaced by a fixed control-only subset.

Prior rationale review: The native-container rationale is distinct from the adapter test: that test exercises input state classes, not every group event.

Binding: source `da29a691092c1b973a468eade0b3ae1826ff4661938c5e6a454c61efbddf144f`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `2c889bffbf176fa2aed3a9b0eda863b689b023fc883d03ce66d3a8781e84e166`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/input-group.tsx:12` — Native group host and exact remainder forwarding.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-input.test.tsx:17` — Real input-group adapter consumer preserves input state callbacks; limited support for the container boundary.

Limits: Container refs/events are supported by the declared type, not individually runtime-tested here.

Reconsider: Requalify if the group host/type, native event boundary, child routing or adapter contract changes.

### Record 147 — InputOTP / OTPField.Root

**exact-rebind** — navigation-only ledger index224; `packages/ui/components/shadcn/input-otp.tsx:19`; `react-doctor/jsx-props-no-spreading`.

InputOTP accepts OTPField.Root.Props, consumes the class callback and forwards the primitive remainder. Slot count, controlled value, normalization/completion callbacks and hidden form inputs are primitive-owned; keeping only visual props would break the tested code-entry contract.

Prior rationale review: Qualification is tied to the installed OTPField adapter and actual normalized paste/FormData consumers rather than historical input-otp assumptions.

Binding: source `4a1b7d484a17342691d2720dc209fdfbfb3975fc2563a7faadb3da7490cbb85a`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `819a579635f511a823b2ee96e6a70e51f2e03b4d5538b23c3ee5029fdf9862a8`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/input-otp.tsx:3` — Exact OTPField Root type and style-only filtering.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-otp.test.tsx:46` — Real OTP slots are labelled; paste normalization, form serialization, controlled value and completion are asserted.

Limits: No native mobile OTP/autofill, browser paste or every callback runtime certification; tests were not run.

Reconsider: Requalify if OTPField Root props, slot wiring, normalization/completion ownership, or form-input behavior changes.

### Record 148 — Input / InputPrimitive

**exact-rebind** — navigation-only ledger index225; `packages/ui/components/shadcn/input.tsx:14`; `react-doctor/jsx-props-no-spreading`.

Input removes className and type from InputPrimitive.Props, then forwards the supported remainder to the actual primitive, not a replacement native input. The existing tests deliberately combine native onChange and Base UI controlled onValueChange and compose refs/render.

Prior rationale review: The public input forwarding reason is corroborated by real current consumers and installed Input props, not a blanket shared-component rationale.

Binding: source `20b1a367e411d2729bb180bd0440f30454fe365bc785c82209a693faba69d106`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `0101829886d9cfac19f587afd5e42817c08f0b58e9f35abbaef111629a88bcff`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/input.tsx:3` — Type and className are handled explicitly; remaining Input props reach InputPrimitive.
- `packages/ui/node_modules/@base-ui/react/input/Input.d.ts:1` — Installed primitive input event and controlled API declaration. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-input.test.tsx:40` — Native/controlled callbacks and custom render with both input refs are exercised in existing test source.

Limits: No all-input-types, browser IME/autofill, or test-execution claim.

Reconsider: Requalify if the primitive changes, native/controlled event mapping changes, type filtering changes, or composed refs stop reaching the input.

### Record 149 — ItemGroup / role="list"

**reject-repair** — navigation-only ledger index226; `packages/ui/components/shadcn/item.tsx:18`; `react-doctor/prefer-tag-over-role`.

Do not renew the role-over-tag exception as currently justified. The parent promises a list, but Item deliberately omits role=listitem whenever render is supplied; the real test renders an anchor inside ItemGroup and asserts that no listitem exists. Avoiding invalid ul/non-li markup explains why a blind tag swap is unsafe, but does not establish a coherent accessible-list contract for the supported custom-child path.

Prior rationale review: The old polymorphic/default-div rationale and inline scanner disable are not proof of sound semantics. The consumer test exposes the unsupported list-child path rather than proving the waiver. Root review should choose a coherent grouping/list-item composition and add regression coverage before repair; no product edit is authorized here.

Binding: source `59c89c79fcb119038b16c729e82d6c52482b5c6bdfb09f2ad423363a1396f0e6`; candidate context `239581b8429708126d779c1b81d8a2636277cecea3c83483e51c96a4d0ad51a9`; previous record `a7d0861f2a641e63009db18d20eeb775a92bbf7bde054850f959927d13a82200`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/item.tsx:11` — Parent always supplies role=list unless caller overrides it; inline disable is not evidence.
- `packages/ui/components/shadcn/item.tsx:61` — Item adds role=listitem only without render, preserving custom anchor semantics otherwise.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/item-group-a11y.test.tsx:16` — Default branch asserts listitems; custom anchor branch explicitly asserts no listitem under ItemGroup.

Limits: Source-level accessible-role inconsistency, not a browser/axe or screen-reader finding. Neither a mechanical ul swap nor silently changing custom anchors is recommended.

Reconsider: Reconsider after the owning group/item API has an explicitly supported list composition for default and custom-render children, regression tests assert it, and authorized native accessibility verification supports the chosen repair.

### Record 150 — ItemGroup / native div props spread

**exact-rebind** — navigation-only ledger index227; `packages/ui/components/shadcn/item.tsx:21`; `react-doctor/jsx-props-no-spreading`.

Independently of its role finding, ItemGroup consumes only className from ComponentProps<"div"> and passes native id/ARIA/children/ref/event props to that same div. Enumerating a static subset narrows the exported native-container API. Only the spread convention is qualified.

Prior rationale review: This is not ratification of the neighbouring role=list exception at position149. That semantic inconsistency remains an explicit reject/repair recommendation.

Binding: source `59c89c79fcb119038b16c729e82d6c52482b5c6bdfb09f2ad423363a1396f0e6`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `c9f20aee56be505c3c512f50078289dc69dfe42f27fe5109eacb97e1796f746e`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/item.tsx:11` — Exact native div type and spread; role is a separate diagnostic.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/item-group-a11y.test.tsx:16` — Real ItemGroup composition with default/custom children; proves usage, not all forwarded native props.

Limits: The ItemGroup accessible-list repair remains unresolved; this rebind must never be applied as component-wide approval.

Reconsider: Requalify if the group host/type, children composition, role repair or native-prop routing changes.

### Record 151 — Kbd / native keyboard-annotation element

**exact-rebind** — navigation-only ledger index228; `packages/ui/components/shadcn/kbd.tsx:13`; `react-doctor/jsx-props-no-spreading`.

Kbd is typed as ComponentProps<"kbd">, consumes its styling className and forwards the native remainder to kbd. Text/icon children and caller-supplied title/ARIA/id remain part of the public keyboard-annotation wrapper; a visual-only whitelist would narrow that API.

Prior rationale review: Qualification concerns Kbd at13, not the separately declared KbdGroup type or generic interactive keyboard handlers.

Binding: source `18a41f27e84f79bba58bdace8dc820d6d2165a3690dfcc8d60517d23cf515b15`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `481f61981f5454bcfe4d71df2ca2ad487ee6ef12db7532393d9becf3abce7ee2`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/kbd.tsx:3` — Native kbd wrapper and exact spread.
- `packages/ui/package.json:6` — Public shadcn component subpath export, not evidence of a fabricated runtime consumer.

No direct applicable consumer test is claimed; see limits.

Limits: No dedicated Kbd ref/attribute test was identified; no keyboard interaction is claimed for a noninteractive annotation.

Reconsider: Requalify if the host/type, child annotation contract, exports or attribute filtering changes.

### Record 152 — Label / native label association

**exact-rebind** — navigation-only ledger index229; `packages/ui/components/shadcn/label.tsx:15`; `react-doctor/jsx-props-no-spreading`.

Label accepts ComponentProps<"label"> and forwards every remaining native prop to the label after handling its styling className. In particular htmlFor/id/ref and native event inputs belong to the real label association, not to a parallel Base UI label implementation.

Prior rationale review: The actual host is a native label. Preserve its declared contract rather than automatically importing old primitive-specific reasoning.

Binding: source `82e654877ffff9fee069f91a5c327551d2cf901835b19e0ca7e4bdb84bd58a27`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `90cbc901d63ee4c204232d653466c770b686c71356a89a1c7748b855a5f0053c`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/label.tsx:7` — Native label contract, htmlFor-capable type and exact spread.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:420` — Real form-control label/description/error association consumer; not every Label ref/event is asserted.

Limits: No direct exhaustive native Label/ref test or screen-reader execution; form association test source only.

Reconsider: Requalify if the label host/type, htmlFor routing, native event behavior or form label consumers change.

### Record 153 — Menubar / MenubarPrimitive

**exact-rebind** — navigation-only ledger index230; `packages/ui/components/shadcn/menubar.tsx:33`; `react-doctor/jsx-props-no-spreading`.

Menubar consumes its class callback from MenubarPrimitive.Props and forwards the supported remainder to the actual primitive. It is a DOM-bearing menubar adapter, unlike the nested Menu roots; orientation/keyboard/native state inputs must stay with their owner.

Prior rationale review: The real parameterized menu suite actually wraps MenubarMenu in Menubar. It supports this wrapper rather than merely exercising an unrelated dropdown.

Binding: source `a9b55204c50c7afe1c745fa271b5e3809fc89908924091ff2d572e237074312f`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `d74c9026062d2e05a7a9155e591ae9f1ebef41a0c5f60d0b1160815f43d67765`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/menubar.tsx:25` — Exact Menubar primitive type and remainder forwarding.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-menu-label-context.test.tsx:19` — Actual Menubar import and wrapping of the menu root, with labelled action-group assertions.

Limits: The suite does not demonstrate complete browser roving focus or all Menubar props.

Reconsider: Requalify if Menubar primitive props, keyboard orientation ownership, class callbacks or nested menu composition changes.

### Record 154 — Meter / bounded-measurement root

**exact-rebind** — navigation-only ledger index231; `packages/ui/components/shadcn/meter.tsx:15`; `react-doctor/jsx-props-no-spreading`.

Meter consumes className from MeterPrimitive.Root.Props and forwards numeric bounds/value/formatting/accessibility inputs to the meter root while owning the track/indicator children. The real consumer asserts value7/max20 and role=meter, explicitly not progressbar; that distinction must survive the wrapper.

Prior rationale review: Narrow the old generic forwarding explanation to an installed bounded measurement contract, not task completion.

Binding: source `de5ba112fb844340a1eedca7a74e218a148b4ced3a64e814a7c4cefbc4601d5a`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `0eb13f5d6f7327156d182ae9b7cc9443d6de2119819feedee946c825302f6e38`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/meter.tsx:7` — Exact meter root, style filtering and owned track.
- `packages/ui/node_modules/@base-ui/react/meter/root/MeterRoot.d.ts:6` — Installed bounded numeric measurement and formatting inputs. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:234` — Actual named meter asserts numeric bounds and absence of progressbar.

Limits: Children remain wrapper-owned; no blanket claim that every primitive child is forwarded. No test execution.

Reconsider: Requalify if numeric/formatting inputs, meter-vs-progress semantics, track ownership or primitive type changes.

### Record 155 — NavigationMenu / Root state boundary

**exact-rebind** — navigation-only ledger index232; `packages/ui/components/shadcn/navigation-menu-component.tsx:26`; `react-doctor/jsx-props-no-spreading`.

NavigationMenu accepts the actual Root props plus Positioner align, consumes align/className/children and forwards only the Root remainder. Children and the shared Positioner are rendered explicitly; the test supplies controlled value and asserts the actual indicator state attribute.

Prior rationale review: The Root forwarding contract is separate from the performance concern on Popup at position156. No popup layout-transition waiver follows from this spread.

Binding: source `a242a37989af69aae31737feb19003004b439d589ed1d060632e5f2856ff6070`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `9541237b5c6484694fb466962300345b78f9e27d986444c18a88b31694129fa0`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/navigation-menu-component.tsx:12` — Typed Root/align separation and explicit Positioner ownership.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/navigation-menu.test.tsx:37` — Actual controlled NavigationMenu consumer toggles indicator popup-open state.

Limits: Does not certify switching panel geometry, hover/focus performance or the unresolved layout-transition exception.

Reconsider: Requalify if Root props, controlled value, align-to-Positioner routing, children or popup owner changes.

### Record 156 — NavigationMenuPositioner / measured Popup dimensions

**hold** — navigation-only ledger index233; `packages/ui/components/shadcn/navigation-menu-component.tsx:123`; `react-doctor/no-tailwind-layout-transition`.

The installed Base UI 1.9 implementation really measures and writes popup/positioner width and height variables, so the old reason is not invented. However, the candidate explicitly transitions width and height as well as transform/opacity, and the inspected tests cover active-link/indicator state, not resizing between open panels or the performance cost. Measurement ownership alone does not prove this layout animation should be excepted.

Prior rationale review: Historical Base UI/version arguments are insufficient for renewed performance acceptance. Global reduced-motion shortening is source evidence for preference handling, not proof that an animated width/height layout path is needed or inexpensive.

Binding: source `a242a37989af69aae31737feb19003004b439d589ed1d060632e5f2856ff6070`; candidate context `0fdb4ec228a5816b66ebd435dadeb706abf59d03ef20403b6e0b0b2d3aeace27`; previous record `40e8b80022caffa678c1540661457163e4570aabef0dc3a7b587cf5fe8aa8997`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/navigation-menu-component.tsx:102` — Exact Popup width/height utilities and transition property list.
- `packages/ui/styles/globals.css:372` — Reduced-motion policy shortens duration, not normal-motion layout work.
- `packages/ui/node_modules/@base-ui/react/navigation-menu/utils/setSharedFixedSize.js:1` — Installed helper writes measured popup/positioner variables. [Framework observation; not ledger evidence.]
- `packages/ui/node_modules/@base-ui/react/navigation-menu/trigger/NavigationMenuTrigger.js:153` — Installed trigger measures panel sizes, schedules updates and restores auto sizing. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/navigation-menu.test.tsx:17` — Actual tests assert link and indicator attributes only; no panel dimensions/performance assertions.

Limits: No performance trace, browser panel-switching test, current audit, or new benchmark was run; that gap is why this remains unresolved.

Reconsider: Reconsider after the owner justifies dimension transitions against a non-layout alternative and provides focused open-panel switching/geometry and reduced-motion behavior evidence for the installed primitive, without weakening Base UI ownership.

### Record 157 — NumberField / NumberFieldPrimitive.Root

**exact-rebind** — navigation-only ledger index234; `packages/ui/components/shadcn/number-field.tsx:14`; `react-doctor/jsx-props-no-spreading`.

NumberField consumes only className and forwards the actual Root props to its numeric-state owner. This retains nullable empty drafts, controlled callbacks, bounds, step precision and native form inputs instead of coercing the wrapper into a zero-only display.

Prior rationale review: The actual current tests cover empty=null rather than claiming all empty edits are zero; installed NumberField distinguishes typed drafts from step clamping.

Binding: source `8aa2aa60494dd67bba859cfbc967757cf8e2620e91195b2940f8de70c1af8e4c`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `2c894e7e30b8ab5021e8f562aeaac2fa9d66e72937c93c8255a76a957d144a6d`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/number-field.tsx:3` — Exact numeric root adapter.
- `packages/ui/node_modules/@base-ui/react/number-field/root/NumberFieldRoot.d.ts:7` — Installed Root and distinct direct-entry vs step bounds contract. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-number-field.test.tsx:17` — Existing real primitive consumer exercises decimal steps, bounds/FormData and empty controlled values.

Limits: No financial rounding, every locale, IME or browser number-entry certification.

Reconsider: Requalify if null/empty drafts, bounds/precision, callback mapping, form serialization or the installed NumberField contract changes.

### Record 158 — Pagination / native nav container

**exact-rebind** — navigation-only ledger index235; `packages/ui/components/shadcn/pagination.tsx:18`; `react-doctor/jsx-props-no-spreading`.

Pagination forwards ComponentProps<"nav"> after consuming className. Its default aria-label is intentionally before the spread, permitting caller naming/localization along with native id/children/ref props. A fixed default-only whitelist would remove a meaningful landmark override.

Prior rationale review: The exact claim is native nav props; DataTable pagination behavior is not substituted for direct coverage of this separate Pagination component.

Binding: source `de036e132bba9173e3effe697f0d92475310ab07a497cf7b68477f16283a06f2`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `f751763fb612565c493c953baa8c90ddad3dfebfe26421b03f9c7377a0f7a437`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/pagination.tsx:12` — Default label and native spread ordering.
- `packages/ui/package.json:6` — Public native primitive subpath export.

No direct applicable consumer test is claimed; see limits.

Limits: No direct Pagination landmark/ref test was identified; no claim that DataTable pagination tests mount this wrapper.

Reconsider: Requalify if the nav host/type, label precedence, public export or child/attribute routing changes.

### Record 159 — Popover / PopoverPrimitive.Root

**exact-rebind** — navigation-only ledger index236; `packages/ui/components/shadcn/popover.tsx:11`; `react-doctor/jsx-props-no-spreading`.

Popover passes PopoverPrimitive.Root.Props to the same state root. Open/defaultOpen, change details and children are preserved; the real FilterBuilder trigger tests exercise the popover composition that depends on this boundary. It is not a DOM spread/ref contract.

Prior rationale review: Narrow the old generic primitive explanation to the actual non-DOM Popover root rather than claiming arbitrary HTML/render inputs.

Binding: source `585fbe08ffbb34cf684fd173bf05f4c7bbfa9140757d9b34273db6fd30a02a38`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `a3f9946b2e8ea2e3158f92b2a05c5af9ea37e62ad7a40ee96bb2de4d49702ff5`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/popover.tsx:3` — Root type and exact spread.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/filter-builder-trigger.test.tsx:21` — Actual popover trigger click and aria-expanded assertions.

Limits: Popover positioning, browser dismissal/focus and every root option were not executed here.

Reconsider: Requalify if Popover Root state/event props, render consumers or control ownership changes.

### Record 160 — Progress / ProgressPrimitive.Root

**exact-rebind** — navigation-only ledger index237; `packages/ui/components/shadcn/progress.tsx:20`; `react-doctor/jsx-props-no-spreading`.

Progress explicitly consumes value and className, maps only undefined to zero and leaves null as the primitive indeterminate value. The remaining typed inputs reach the Root, preserving max, accessible naming and supported callbacks while the wrapper owns track/indicator.

Prior rationale review: The source and current consumer distinguish null from undefined; do not reuse a generic rationale that conceals that data meaning.

Binding: source `9334f183fe0f826bd5287f0f73e06ec8c19e0c2cc7cd50682e50c3709d8602dc`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `cd1ebba7e15acc5248542c3a062f3421d3a6323b63e1a7230920e66ecc000609`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/progress.tsx:7` — Value normalization and precise remainder/track ownership.
- `packages/ui/node_modules/@base-ui/react/progress/root/ProgressRoot.d.ts:1` — Installed determinate/indeterminate root declaration. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:207` — Real Progress consumer asserts numeric30 and null/no aria-valuenow with state callback classes.

Limits: Does not waive the distinct animation site161 or arbitrary child forwarding; tests source only.

Reconsider: Requalify if null/undefined handling, numeric max, primitive state callbacks, track ownership or prop filtering changes.

### Record 161 — ProgressPrimitive.Indicator / indeterminate animate-pulse

**exact-rebind** — navigation-only ledger index238; `packages/ui/components/shadcn/progress.tsx:23`; `react-doctor/no-ungated-tailwind-animation`.

The candidate is the indicator whose pulse is conditional on the primitive indeterminate state, not the Progress root spread. Existing consumer assertions distinguish null indeterminate from numeric progress. Shared globals shorten this CSS animation to one 0.01ms iteration and the indicator lacks spinner-essential, so the local utility-only rule misses the Core stylesheet policy.

Prior rationale review: Renew only this conditional CSS pulse under the inspected import chain; neither treating it as essential nor extending the waiver to all pulse elements is justified.

Binding: source `9334f183fe0f826bd5287f0f73e06ec8c19e0c2cc7cd50682e50c3709d8602dc`; candidate context `5e71c43ab7f6407464d1c28561294edfd039f3689e3eff1f31968d1f5264d6f8`; previous record `05ce8036d206f013c2624b35857331841d097422e4d606965fbca508c0265b7b`. Scanner fingerprint differs from the ledger byte-context hash; both are intentionally retained separately in JSON.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/progress.tsx:15` — Exact data-indeterminate indicator class and value handling.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:207` — Actual determinate/indeterminate semantics; not a rendered CSS/media check.

Limits: No computed-style or reduced-motion execution. Scanner fingerprint is retained separately from the ledger byte-context hash for the multiline candidate.

Reconsider: Requalify if the indicator state/classes, shared reduced-motion policy/imports, essential exemption or animation technology changes.

### Record 162 — RadioGroup / RadioGroupPrimitive

**exact-rebind** — navigation-only ledger index239; `packages/ui/components/shadcn/radio-group.tsx:15`; `react-doctor/jsx-props-no-spreading`.

RadioGroup removes className from RadioGroupPrimitive.Props and forwards the primitive-owned value, name, disabled, callback and supported host inputs. The actual control suite changes radio selection and observes state-class updates, so this is a real state-input boundary rather than an arbitrary untyped spread.

Prior rationale review: Qualification is specific to RadioGroupPrimitive and not the adjacent individual Radio Root or their unrelated findings.

Binding: source `050697341410347d7362994e6d72466da0c856aa08e75132a54a5fd404d051dc`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `7d802fe8bd4e05f6730bdfd797741685662ed0a5d6a16c875c1a497fa93563e3`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/radio-group.tsx:3` — Exact radio-group type and forwarding owner.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:77` — Real checkbox/switch/radio/toggle fixture includes radio value/state interactions.

Limits: No browser arrow-key grouping or exhaustive form serialization execution was performed.

Reconsider: Requalify if RadioGroup value/name/callback semantics, host props, class callback merging or primitive dependency changes.

### Record 163 — ResizablePanelGroup / ResizablePrimitive.Group

**exact-rebind** — navigation-only ledger index240; `packages/ui/components/shadcn/resizable.tsx:19`; `react-doctor/jsx-props-no-spreading`.

The wrapper consumes className from the installed GroupProps contract and sends the remaining orientation, elementRef, layout callbacks, sizing and supported DOM inputs to the actual Group component. Replacing this spread with a guessed legacy PanelGroup subset would misrepresent the installed v4 API.

Prior rationale review: The generic forwarding reason is narrowed to the observed Group API; neither old PanelGroup terminology nor an assertion of every possible ref/event behavior is carried forward.

Binding: source `398389d2ce5b7838d1803995c26a0d86b54e7e61c2283a4f0b684c547519c31c`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `153f84faf2e079c5be62a8332d1740a9ee4550a4dac271208c388ea1144fb9df`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/resizable.tsx:8` — GroupProps remainder reaches Group after className ownership.
- `packages/ui/node_modules/react-resizable-panels/dist/react-resizable-panels.d.ts:481` — Installed v4 Group/GroupProps declarations expose elementRef, layout callbacks and orientation. [Framework observation; not ledger evidence.]

No direct applicable consumer test is claimed; see limits.

Limits: No focused Group consumer test was found in the inspected suites; no resize, drag, persistence or layout execution is claimed.

Reconsider: Requalify on GroupProps/dependency changes, prop filtering, host ownership, layout callbacks or a change to the installed resize API.

### Record 164 — ResizableImageNodeView / authored image

**exact-rebind** — navigation-only ledger index241; `packages/ui/components/shadcn/rich-text-editor/image-node-view.tsx:185`; `react-doctor/nextjs-no-img-element`.

This NodeView displays node.attrs.src with document-owned CSS width and intrinsic auto height, measures its actual rendered image and container for resizing, and persists width through the image extension. Authored remote sources and absent intrinsic geometry are materially different from a fixed application image: Next Image requires known dimensions or a deliberately positioned fill layout, and remote optimization has host configuration requirements. A direct conversion would change this document/layout contract without a replacement design.

Prior rationale review: The substantive authored-image reason survives source inspection, but arbitrary widths include nonempty CSS strings, not only pixel/100% values. The inline DOM-ref comment is not evidence that Next Image is impossible; ref support and unoptimized alone do not solve geometry or document serialization.

Binding: source `6a873a7d542ef61a13453b73b6264353a1c02e71fc19b05f36bbd055bdb93b78`; candidate context `0e81b1d4d5d99895fabe75368aa8a67693468b4e0d195b1e0aed28cd186a5916`; previous record `c92acb27929ca00a2e5a092f1badfcd995b954b396044b7b35ca8e25c7c51817`. Scanner fingerprint differs from the ledger byte-context hash; both are intentionally retained separately in JSON.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/rich-text-editor/image-node-view.tsx:162` — Document width, measured DOM geometry and exact authored img owner.
- `packages/ui/components/shadcn/rich-text-editor/image-resize.ts:20` — Width normalizer retains supported numeric and nonempty string inputs.
- `packages/ui/components/shadcn/rich-text-editor/image-extension.ts:9` — Image HTML width round-trip and NodeView registration.
- `packages/ui/node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md:71` — Installed Image documentation specifies remote configuration and width/height or fill sizing contracts. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/image-resize-a11y.test.tsx:17` — Read helper and resize-handle ARIA assertions, not a full image/resize pipeline.

Limits: No image network loading, remote host policy, real drag, HTML round-trip execution or LCP comparison was performed. This qualifies the exact authored NodeView img, not other img elements or a universal ban on Next Image.

Reconsider: Reconsider if authored-source constraints, persisted width/height schema, intrinsic metadata, resize measurement or a document-compatible Image adapter changes.

### Record 165 — EditorContent / TipTapEditorContent

**exact-rebind** — navigation-only ledger index242; `packages/ui/components/shadcn/rich-text-editor/rich-text-editor.tsx:185`; `react-doctor/jsx-props-no-spreading`.

EditorContent explicitly omits the editor prop from the public TipTapEditorContent input, consumes className, and forwards the remaining editor-content host inputs before assigning the context-owned editor and merged className. This preserves an intentional compound-editor boundary without letting ordinary typed callers replace the editor instance.

Prior rationale review: The generic reason is qualified for EditorContent only. Its original line 166 is historical; the retained matching diagnostic is line 185 and no waiver is inferred for EditorRoot or adjacent spreads.

Binding: source `e898986d5e251dff35c1518aea22d5b3ff3e1f795c789c2a0c71aad406cfadf0`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `e7f78f5c6509662c9c59ef4e997ae9cae16ef3c6304b1ec4904d5f132f3075db`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/rich-text-editor/rich-text-editor.tsx:177` — Omit<...,"editor">, remainder spread and later context-owned editor/className.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/rich-text-editor/rich-text-editor.test.tsx:233` — Actual EditorRoot/EditorContent fixture checks disabled/editable DOM and class integration.

Limits: The consumer suite was read, not run; it does not exhaustively exercise every forwarded HTML/content prop.

Reconsider: Requalify if TipTapEditorContent props, editor ownership, className merging or compound context behavior changes.

### Record 166 — ScrollArea / ScrollAreaPrimitive.Root

**exact-rebind** — navigation-only ledger index243; `packages/ui/components/shadcn/scroll-area.tsx:18`; `react-doctor/jsx-props-no-spreading`.

ScrollArea consumes className and children from Root.Props, forwards the supported root inputs to Root, and deliberately places children in the nested Viewport.Content observation container. Root-native inputs and a root ref belong on Root rather than silently migrating to Viewport during a spreading-rule cleanup.

Prior rationale review: The generic reason is narrowed to the root host. This does not promise a viewport ref API or certify the separate scrollbar spreads.

Binding: source `1c6592bf42e9250c0dd6314f9e5d220ea123876c1408a72da25bfc6a927ed440`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `f911656648212e32403aec7235a6b387cfeb31ed4c152256dff4773b56c6d47a`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/scroll-area.tsx:9` — Root forwarding and explicit Viewport/Content child ownership.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-overlay-contracts.test.tsx:119` — Real ScrollArea composition asserts the content observation container.

Limits: No actual scrolling, overflow measurement, pointer interaction or exhaustive ref test was executed.

Reconsider: Requalify if root/viewport ownership, children routing, primitive Root props or scroll content observation changes.

### Record 167 — SearchableSelect / Combobox state inputs

**exact-rebind** — navigation-only ledger index244; `packages/ui/components/shadcn/searchable-select.tsx:84`; `react-doctor/jsx-props-no-spreading`.

SearchableSelect already enumerates a limited public Pick of Combobox value, callbacks, name, disabled, readOnly and required. It consumes display options and trigger-specific ARIA/id/class inputs separately, then sends only the remaining typed state/form contract to Combobox alongside its derived stable-ID collection. The exact spread is not an unbounded DOM API.

Prior rationale review: The generic forwarding claim is replaced by this explicit state/form subset; trigger ARIA and collection ownership are not attributed to the root remainder.

Binding: source `ae6bc315734281cb7d79ac96c64ccd2a1903ea70f89212f99ce62bd4a180bd54`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `366fa8cc1821128ff913face4bb4d6d9d4f3d4ce0afc87d699850a6ff11bbb61`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/searchable-select.tsx:28` — Public root and trigger Pick contracts are explicit.
- `packages/ui/components/shadcn/searchable-select.tsx:57` — Trigger-only fields are consumed before the Combobox remainder and collection forwarding.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/searchable-select.test.tsx:23` — Actual selection fixture covers stable values/duplicate labels, no-results preservation and disabled options.

Limits: Read consumer tests are not current execution; readOnly/required and every form submission path are not established by these assertions.

Reconsider: Requalify if the picked root fields, derived collection/value mapping, trigger ARIA ownership or installed Combobox contract changes.

### Record 168 — Select<Value,Multiple> / SelectPrimitive.Root

**exact-rebind** — navigation-only ledger index245; `packages/ui/components/shadcn/select.tsx:14`; `react-doctor/jsx-props-no-spreading`.

This generic wrapper forwards SelectPrimitive.Root.Props<Value,Multiple> to the owning non-DOM Root without replacing its controlled/default values or multiple-selection type relationship. An arbitrary fixed list would narrow that installed primitive contract, while treating the root as a div would invent native/ref behavior it does not own.

Prior rationale review: The generic exception is narrowed to generic Select root state/form composition; it does not certify SelectTrigger, popup spreads or runtime multiple selection.

Binding: source `f6a5744a24bec07f002dff1d78839847e7eac6878bfd094f5c0a295b7e21a79c`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `a608a96ec3403bf9041ad476ca1c0a4580248efa6f49e2dac7b76eba3bb0868f`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/select.tsx:11` — Generic value/multiple contract and exact Root spread.
- `packages/ui/node_modules/@base-ui/react/select/root/SelectRoot.d.ts:11` — Installed SelectRoot is a grouping component with no own HTML element. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:251` — Real SelectCell composition supplies a single controlled value and callback.

Limits: Only single-value consumer source coverage was identified; multiple-mode, serialization and keyboard behavior were not executed.

Reconsider: Requalify if generic Value/Multiple props, controlled selection semantics, form ownership or the primitive root contract changes.

### Record 169 — Separator / SeparatorPrimitive

**exact-rebind** — navigation-only ledger index246; `packages/ui/components/shadcn/separator.tsx:20`; `react-doctor/jsx-props-no-spreading`.

Separator consumes orientation and className, preserves the orientation default and state-class merge, and forwards the primitive-owned decorative, render/ref and supported host inputs. The remainder reaches the separator owner rather than a new wrapper element, so removing it would narrow a supported polymorphic primitive contract.

Prior rationale review: The generic reason is bounded by SeparatorPrimitive.Props and the actual orientation/render consumers; no component-wide accessibility approval follows.

Binding: source `0be376bfe749780ea2be4a60a8044d8f0a535773d8b77ea14206afbe1f927dcd`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `4dcb4bb64fe9a99997f546e385323ee8da93af5fdf3a058f2a70c0dbdc257893`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/separator.tsx:7` — Explicit orientation/className ownership followed by SeparatorPrimitive remainder.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-overlay-contracts.test.tsx:157` — Separator orientation/state-class callback assertion.
- `tests/unit/packages/ui/base-ui-composition.test.tsx:188` — Custom separator render and caller class composition.

Limits: No assistive-technology interpretation or all decorative/orientation combinations were executed.

Reconsider: Requalify when orientation/decorative behavior, render/ref forwarding or primitive host contracts change.

### Record 170 — Sheet / Dialog Root

**exact-rebind** — navigation-only ledger index247; `packages/ui/components/shadcn/sheet.tsx:13`; `react-doctor/jsx-props-no-spreading`.

Sheet is a thin typed adapter to the installed Dialog Root, preserving controlled/default open state, change callbacks, modal behavior and child composition at the non-DOM primitive owner. This exact root spread is necessary to retain that public adapter contract; it is not a native div forwarding argument.

Prior rationale review: The original generic rationale is corrected to the actual Dialog import. Drawer/swipe contracts and the adjacent Sheet portal/backdrop sites are outside this identity.

Binding: source `dae8e7d7478977256524b418192a4633ee5020f41cbd1970b7b030c3ca1b1d2d`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `fa33a4a10f4e4a604367e446fba9132afa570344153e229411f0d00c11e0e0a1`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/sheet.tsx:3` — Sheet uses Dialog.Root.Props and forwards them to Dialog.Root.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/filter-builder-trigger.test.tsx:43` — Sheet-mode FilterBuilder fixture asserts expanded state after opening.

Limits: The existing suite was inspected only; browser focus trapping, Escape dismissal and scroll locking were not verified.

Reconsider: Requalify if Sheet changes primitive, open/modal callback ownership, children composition or the installed Dialog Root API.

### Record 171 — SidebarProvider / native wrapper div

**exact-rebind** — navigation-only ledger index248; `packages/ui/components/shadcn/sidebar.tsx:154`; `react-doctor/jsx-props-no-spreading`.

SidebarProvider consumes its controlled/open defaults, change callback, className, style and children before forwarding the remaining React.ComponentProps<"div"> to the sidebar wrapper div. The context provider owns sidebar state separately; native attributes/events/ref must stay on the actual wrapper and not on the non-DOM context provider.

Prior rationale review: The generic rationale is restricted to this native wrapper remainder. The historical line153 is now154; state persistence and keyboard shortcut behavior are not independently waived by this spread exception.

Binding: source `75906b5ff3668ef6e02261914c1f94f0afb84b70c6d956c110ed70a0e4469910`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `0d25611a1e417f7dbec5f616c198cee915828298ae546d00a250b6a00da37034`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/sidebar.tsx:55` — Public div type and consumed domain/layout inputs.
- `packages/ui/components/shadcn/sidebar.tsx:139` — Remainder reaches wrapper div while children/context remain explicit.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-composition.test.tsx:126` — Actual SidebarProvider/trigger consumers cover button composition and cancelable toggle interaction.

Limits: No exhaustive native wrapper attribute/ref test or browser cookie/mobile behavior was executed.

Reconsider: Requalify if native wrapper ownership, provider props, style/class consumption, controlled state or primitive host semantics changes.

### Record 172 — SidebarTrigger / mergeProps(...).onClick

**exact-rebind** — navigation-only ledger index249; `packages/ui/components/shadcn/sidebar.tsx:301`; `react-doctor/jsx-handler-names`.

The flagged handler is the onClick returned by installed Base UI mergeProps, not an anonymous substitute for the toggle contract. With internal toggleSidebar on the left and public onClick on the right, the caller executes first and can cancel the internal toggle through preventBaseUIHandler. Naming this returned member differently or wrapping it without preserving the event contract is not a correctness improvement.

Prior rationale review: The old composition reason survives only with the actual right-to-left order and cancellation documented here. It is not evidence of internal-first behavior or general handler-name exemptions.

Binding: source `75906b5ff3668ef6e02261914c1f94f0afb84b70c6d956c110ed70a0e4469910`; candidate context `48d04eea79d32ef86d5819a856bb570c618031257d32bcf3bf09343a9391749b`; previous record `9fd943226e1328defcaf7511a59fa305d9c8efa3f7f59b82e4ba2266a8f16310`. Scanner fingerprint differs from the ledger byte-context hash; both are intentionally retained separately in JSON.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/sidebar.tsx:283` — Exact mergeProps member expression and left/right handler arguments.
- `packages/ui/node_modules/@base-ui/react/merge-props/mergeProps.d.ts:7` — Installed mergeProps documents right-to-left synthetic handlers and preventBaseUIHandler cancellation. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-composition.test.tsx:177` — Real caller uses preventBaseUIHandler and asserts onOpenChange is not called.

Limits: The test source was read only; no current click execution is claimed. Scanner fingerprint and ledger UTF8 context hash differ for this multiline expression and are retained separately.

Reconsider: Requalify if handler order, cancellation, public onClick ownership, Button event contract or installed mergeProps semantics changes.

### Record 173 — Skeleton / native div remainder

**exact-rebind** — navigation-only ledger index250; `packages/ui/components/shadcn/skeleton.tsx:8`; `react-doctor/jsx-props-no-spreading`.

Skeleton consumes className and forwards the remaining React.ComponentProps<"div"> to the same div that owns its skeleton slot. That exact native boundary retains caller id, ARIA, events and ref rather than forcing an arbitrary subset.

Prior rationale review: The generic forwarding reason is valid only for line8. The animate-pulse at line7 is a different diagnostic/site and is not approved by this spread recommendation.

Binding: source `24aaab61439bbfd327ecc917562ffe7c7fee11bc24dc12fdfb2c81ce6ac9b121`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `f73e532ed323efb9eae293b944ee7ccea2e0c9b9b1cc68ef146a8e3d75d4e2e3`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/skeleton.tsx:3` — Native div prop contract with className consumed before forwarding.

No direct applicable consumer test is claimed; see limits.

Limits: No direct Skeleton-specific consumer test was located in the inspected suites; no screen-reader or reduced-motion runtime proof is claimed.

Reconsider: Requalify if Skeleton host/type, prop filtering or caller class ownership changes; assess animation findings separately.

### Record 174 — Slider / SliderPrimitive.Root remainder

**exact-rebind** — navigation-only ledger index251; `packages/ui/components/shadcn/slider.tsx:39`; `react-doctor/jsx-props-no-spreading`.

Slider explicitly owns value/defaultValue, min/max, className and thumbProps, while forwarding the remaining primitive Root inputs such as state callbacks, orientation, disabled and form/native settings to Root. Thumb configuration is routed separately by index, so forwarding thumbProps to the root would be incorrect and enumerating an old subset would narrow the supported primitive.

Prior rationale review: The generic reason is replaced with this root-versus-thumb distinction. Existing assertions establish zero/range composition in source, not every gesture or the adjacent Thumb spread.

Binding: source `3a6bd23530ad17b9291d32c8217737272a471fd90e4580b3e0dc897f77c22c9a`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `ed2ef557195ba4b50cf24167c2701ef1ed82f7f4e0fd93c4766272b9fe411f97`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/slider.tsx:10` — Consumed root value/range/thumb inputs precede the exact remainder.
- `packages/ui/components/shadcn/slider.tsx:51` — Thumb props are resolved independently per index.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:143` — Real slider fixture covers controlled scalar zero and separately labelled range thumbs/value text.

Limits: No pointer drag, touch, keyboard range constraint or browser layout was executed.

Reconsider: Requalify if scalar/range precedence, thumb routing, root callback/form API or installed Slider contract changes.

### Record 175 — Toaster / default loading icon animate-spin

**exact-rebind** — navigation-only ledger index252; `packages/ui/components/shadcn/sonner.tsx:37`; `react-doctor/no-ungated-tailwind-animation`.

The exact loading icon is a CSS animate-spin default in the shared Sonner adapter. It has no spinner-essential exemption; the inspected Core shared reduced-motion media policy limits this animation to one 0.01ms iteration, and each app layout imports that policy and mounts Toaster. This addresses the class-local scanner warning for this default icon only.

Prior rationale review: The historical global-policy reason is supported by the actual icon and import owners, not by historical audit success. No exemption is inferred for caller-supplied icons, Sonner internal motion or third-party consumers without Core CSS.

Binding: source `ded1af6aa83bc47da81a3da56452ea8231b7f2cdea997efce6da0b85e299639c`; candidate context `42efa8f62257ec8a55aa321453ef404f59e8a970f228007221050d1821a1e564`; previous record `110a3efc491f2ae138d5df73bd1ce76a6918f80c6b2d5505a4623196b79029f9`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/sonner.tsx:28` — Default loading icon, caller overrides and body portal boundary.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/shadscan-toaster-portal.test.tsx:7` — Suite mocks Sonner, so it cannot prove real loading-icon CSS or vendor motion.
- `tests/unit/packages/ui/shadscan-toaster-portal.test.tsx:21` — Actual adapter context/SSR portal assertions, not motion execution.

Limits: Shared motion/import receipts are attached separately to this exact record. No computed style, media emulation, toast lifecycle or real Sonner loading rendering was executed.

Reconsider: Requalify if this icon class, CSS/import chain, portal host, essential exemption, caller-default precedence or animation technology changes.

### Record 176 — Toaster / Sonner ToasterProps adapter

**exact-rebind** — navigation-only ledger index253; `packages/ui/components/shadcn/sonner.tsx:47`; `react-doctor/jsx-props-no-spreading`.

The adapter accepts the installed Sonner ToasterProps, derives a default forcedTheme/theme value, sets standard icons/styles and then forwards caller props last to Sonner. This deliberately preserves caller configuration and override precedence at the framework boundary, rather than treating all defaults as immutable. The client mount gate and body portal are separate adapter behavior.

Prior rationale review: The generic forwarding reason is narrowed to Sonner props and actual last-write precedence; it does not certify vendor timers, notification delivery or default icon motion.

Binding: source `ded1af6aa83bc47da81a3da56452ea8231b7f2cdea997efce6da0b85e299639c`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `4d92cc9e97df1cc4772ca1e1c53fd4af833ae0e0e6d15e060c7f11c40705bec8`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/sonner.tsx:13` — Typed adapter, theme derivation, mount guard and last-position caller spread.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/shadscan-toaster-portal.test.tsx:7` — Sonner is mocked; the surrounding adapter/ThemeProvider remain real.
- `tests/unit/packages/ui/shadscan-toaster-portal.test.tsx:21` — Forced theme/body escape and SSR-null assertions.

Limits: The mocked vendor boundary means toast lifecycle, placement/layout, arbitrary callback/config props and browser hydration are not demonstrated.

Reconsider: Requalify if ToasterProps, portal/mount behavior, theme/default precedence, prop filtering or the installed Sonner contract changes.

### Record 177 — Spinner / SVG props on Loader2Icon

**exact-rebind** — navigation-only ledger index254; `packages/ui/components/shadcn/spinner.tsx:11`; `react-doctor/jsx-props-no-spreading`.

Spinner consumes className from React.ComponentProps<"svg"> and forwards the supported SVG attributes, events and ref to the icon owner. Its default role=status and aria-label=Loading precede the spread and are therefore caller-overridable; preserving that native SVG contract is more accurate than claiming the defaults can never change.

Prior rationale review: The generic forwarding rationale is qualified for the SVG site only. spinner-essential intentionally retains motion under the shared reduced-motion exception; this spread recommendation is not a reduced-motion approval.

Binding: source `b92bf7aa8d5b94047cfa0e9509bab37bba2de61ff6f24d89b16ee7b7730672ce`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `30def0137fd55e46f1b3e2e67bd7f2dfe8f4f89a50c01f4f3cdf16123de3e933`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/spinner.tsx:5` — SVG type, default semantic attributes and later caller spread.
- `packages/ui/styles/globals.css:372` — Separate spinner-essential animation exemption must not be conflated with this spread.

No direct applicable consumer test is claimed; see limits.

Limits: No direct Spinner-specific SVG/ref or assistive-technology test was found in the inspected suites; no loading announcement or animation execution is claimed.

Reconsider: Requalify if SVG/icon prop compatibility, default/caller semantic precedence, prop filtering or essential-animation policy changes.

### Record 178 — Switch / SwitchPrimitive.Root

**exact-rebind** — navigation-only ledger index255; `packages/ui/components/shadcn/switch.tsx:24`; `react-doctor/jsx-props-no-spreading`.

Switch consumes the Core size variant and state-aware className before forwarding the installed Root inputs for checked/defaultChecked, change handlers, name, disabled and supported host composition. Those inputs belong to the checked-state owner, while the visual thumb is explicitly nested and not a new public root API.

Prior rationale review: The generic forwarding reason is bounded to Switch Root. Existing real-control tests make the checked-state contract concrete, but neither adjacent thumb transitions nor every form case is waived.

Binding: source `5e918ada03ed42ee1b0b006f3ef76f15213025c415c0ad45b6a5aed3de6a6522`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `e123f74579b728763381254a690025f9e6a915e9d208835608c7d9d7dbf81ed1`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/switch.tsx:9` — Core size consumed, primitive root remainder preserved, thumb composed explicitly.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:77` — Real checkbox/switch/radio/toggle fixture exercises switch checked-state interaction.

Limits: No form serialization, all render/ref combinations, keyboard browser behavior or thumb-motion check was executed.

Reconsider: Requalify if checked-state callbacks, Root props, size filtering, render/ref handling or installed Switch contract changes.

### Record 179 — Table / native table inside scroll container

**exact-rebind** — navigation-only ledger index256; `packages/ui/components/shadcn/table.tsx:16`; `react-doctor/jsx-props-no-spreading`.

Table consumes className from React.ComponentProps<"table"> and forwards the remainder to the table itself, not to the surrounding overflow div. This distinction preserves native table attributes, events and ref/children ownership and avoids moving semantic inputs to the scrolling container during a spreading-rule repair.

Prior rationale review: The generic native-forwarding rationale is supported at the exact table owner only; it is not a qualification of DataTable engine behavior or other table-part spreads.

Binding: source `be5c0e747efb21aa219b4c6f18c78b75503b07d97c83493e8421d0d0dadf9ec7`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `631aac9b34700e9de2def7ff20f5992b9c8d4be91c473172d6121031bc126b90`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/table.tsx:7` — Remainder lands on table while the overflow div remains separate.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/data-table-behavior.test.tsx:170` — Public DataTable consumer asserts rendered headers/rows and empty content.
- `tests/unit/packages/ui/components/shadcn/data-table-behavior.test.tsx:365` — Public selection consumer inspects current-page row selection/count.

Limits: Consumer suites were read only and are indirect coverage; every native table prop/ref and scrolling behavior was not exercised.

Reconsider: Requalify if the native table host, overflow-wrapper ownership, public Table type or prop filtering changes.

### Record 180 — Tabs / TabsPrimitive.Root

**exact-rebind** — navigation-only ledger index257; `packages/ui/components/shadcn/tabs-component.tsx:26`; `react-doctor/jsx-props-no-spreading`.

Tabs consumes orientation and className, emits the matching orientation attribute and forwards the remaining primitive Root inputs for value/defaultValue, callbacks, activation behavior and supported host composition. Keeping those props at Root preserves the selected-tab owner instead of narrowing the wrapper to only the visual orientation inputs.

Prior rationale review: The generic forwarding claim is narrowed to Tabs Root; it does not waive tab triggers, indicators or panel transitions.

Binding: source `26b4ee5bed9594610bba3616121172ebf0aa01ba2422ade766dd9e826a45ee1e`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `9dc99d4ec15ca5f41eacf97a1effb4cf9d1fedbdc3456e1ea4cf72d2fd91d2de`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/tabs-component.tsx:12` — Orientation/className ownership followed by the exact Root remainder.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-overlay-contracts.test.tsx:58` — Actual Tabs root/trigger/panel composition asserts state-class behavior.

Limits: The suite was read only; full keyboard navigation, all activation modes and focus management were not executed.

Reconsider: Requalify if orientation/value ownership, root callbacks, host/render API or installed Tabs behavior changes.

### Record 181 — Textarea / native textarea

**exact-rebind** — navigation-only ledger index258; `packages/ui/components/shadcn/textarea.tsx:13`; `react-doctor/jsx-props-no-spreading`.

Textarea is typed directly as React.ComponentProps<"textarea">, consumes its merged className and forwards the remainder to the actual textarea. Controlled/uncontrolled value, onChange, rows, ARIA, form attributes and a textarea ref are part of that native input contract; listing only currently observed consumers would arbitrarily narrow the shared wrapper.

Prior rationale review: The original generic statement is valid only for a native textarea here. No Base UI render API or form-validation guarantees are invented.

Binding: source `42a4a880e24326c97d1d2795d11ffb51ca934f368a01a5b4297f03612a8ad100`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `c891baf18afe5e46839474ef743374121d5b457ee0bb8a9d1778ed48d586e5e6`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/textarea.tsx:5` — Native textarea type and same-host remainder after className consumption.

No direct applicable consumer test is claimed; see limits.

Limits: No direct Textarea-specific consumer test was identified in the inspected suites; controlled input, browser resizing and validation were not executed.

Reconsider: Requalify if the native host/type, value/event ownership, class filtering or form semantics changes.

### Record 182 — Toggle / TogglePrimitive

**exact-rebind** — navigation-only ledger index259; `packages/ui/components/shadcn/toggle-component.tsx:23`; `react-doctor/jsx-props-no-spreading`.

Toggle consumes the Core variant, size and className before passing the remaining TogglePrimitive.Props to TogglePrimitive. The primitive retains pressed/defaultPressed, onPressedChange and supported button/render/ref composition; domain style variants are not leaked through the remainder.

Prior rationale review: The generic forwarding reason is limited to the actual pressed-state primitive, not a native-only button contract or adjacent ToggleGroup behavior.

Binding: source `036a1554f0f9b377be5efb46b7e8f347d4603480865430351cb51cc0a745a2f4`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `92451d294a4f2b2b18c7082e473b34f2fae967df018a423a905185e3021d78f3`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/toggle-component.tsx:10` — Variant inputs consumed before the exact TogglePrimitive remainder.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:77` — Real controls fixture exercises Toggle pressed-state interaction and state classes.

Limits: No exhaustive button/render/ref, keyboard or all pressed-state consumer path was executed.

Reconsider: Requalify when Toggle props, pressed-state callbacks, variant filtering or primitive host composition changes.

### Record 183 — ToggleGroup / root remainder and style callback

**exact-rebind** — navigation-only ledger index260; `packages/ui/components/shadcn/toggle-group.tsx:56`; `react-doctor/jsx-props-no-spreading`.

ToggleGroup consumes variant, size, spacing, style, className and children before forwarding only the remaining ToggleGroupPrimitive.Props. It supplies the spacing CSS variable while preserving a caller state-style callback, then scopes visual defaults through its context. The remainder belongs to the primitive selection/navigation owner, not to that context or an item.

Prior rationale review: The generic forwarding rationale is narrowed to this root state contract and separate style/children ownership. Caller style is spread after --gap, so arbitrary user style overrides are not falsely described as prohibited.

Binding: source `4e016edcb7b35a329e75fadf986698dfe772cd8d20bdb4f9fe8c01d9c1b2232d`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `3c8d5f4d10a36e736f7f5e24c6edb0873b3b2ecc80cc0b6f7f2e4c61671e13be`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/toggle-group.tsx:23` — Consumed domain inputs, style callback merge, Root spread and explicit child context.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-controls.test.tsx:192` — Actual ToggleGroup fixture asserts the state-style callback and --gap composition.

Limits: No multiple-selection navigation, all item semantics or browser group focus behavior was executed.

Reconsider: Requalify if root selection callbacks, state-style merge, spacing/context ownership or the installed ToggleGroup contract changes.

### Record 184 — Toolbar / ToolbarPrimitive.Root

**exact-rebind** — navigation-only ledger index261; `packages/ui/components/shadcn/toolbar.tsx:15`; `react-doctor/jsx-props-no-spreading`.

Toolbar consumes its state-aware className and forwards the rest of ToolbarPrimitive.Root.Props to the roving-focus/layout owner. A real rich-text toolbar supplies aria-label="Text formatting" through this boundary; orientation and supported root host inputs must remain available rather than being inferred from an unlabelled visual wrapper.

Prior rationale review: The generic forwarding rationale is supported for Toolbar Root by an actual labelled consumer. It does not establish the correctness of every toolbar button, editor action or roving-focus implementation.

Binding: source `3d8b1a712ab339e11f83e3efcc3e1ef2249f1e65574393c7a3e58086c41b1dd5`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `8c101581b5ea4ce7766006f6cc7747c393ff08238599c7c3f79d6528b5131546`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/toolbar.tsx:7` — Root prop contract and exact remainder after class merging.
- `packages/ui/components/shadcn/rich-text-editor/toolbar.tsx:408` — Real rich-text consumer labels the shared Toolbar.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/components/shadcn/rich-text-editor/rich-text-editor.test.tsx:303` — Real disabled-editor fixture mounts EditorToolbar tools=[bold] and checks the disabled Bold control; not roving-focus execution.

Limits: The consumer source does not prove browser roving focus or every toolbar action; no such interaction was run.

Reconsider: Requalify if Toolbar Root props, orientation/focus grouping, host/ARIA forwarding or class callback merging changes.

### Record 185 — TooltipProvider / shared timing provider

**exact-rebind** — navigation-only ledger index262; `packages/ui/components/shadcn/tooltip.tsx:17`; `react-doctor/jsx-props-no-spreading`.

TooltipProvider owns Core delay=300 and forwards the installed Provider remainder, specifically children, closeDelay and grouping timeout, to the shared timing provider. These are provider inputs rather than DOM attributes/ref behavior; preserving the installed timeout default is relevant to grouped triggers.

Prior rationale review: The generic forwarding rationale is narrowed to the actual non-DOM Provider declaration. The source comment alone is not timing proof, and the adjacent Tooltip Root is outside this record.

Binding: source `9302151a7a547235a6b864ad21e99bc97f50084b1b5cdd65c304fa674c2077f7`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `7a3ee4fb9571799a93e07d09f7b532a22ee4109b19c4c20dc4e1640241e03f16`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/tooltip.tsx:7` — Owned delay and exact Provider remainder.
- `packages/ui/node_modules/@base-ui/react/tooltip/provider/TooltipProvider.d.ts:8` — Installed provider exposes children, delay, closeDelay and timeout with default400. [Framework observation; not ledger evidence.]

Consumer test source — **not executed**:

- `tests/unit/packages/ui/base-ui-composition.test.tsx:126` — Actual sidebar/menu compositions use the shared TooltipProvider.

Limits: No grouped-hover timers, instant reopen timing, real focus hover or browser rendering was executed.

Reconsider: Requalify if delay/timeout defaults, grouping behavior, provider prop shape or primitive dependency changes.

### Record 186 — VisuallyHidden / native span

**exact-rebind** — navigation-only ledger index263; `packages/ui/components/shadcn/visually-hidden.tsx:12`; `react-doctor/jsx-props-no-spreading`.

VisuallyHidden consumes className and forwards React.ComponentProps<"span"> to the same sr-only span. Caller semantic text/children, ARIA, id, events and ref remain at the native host. This is a narrowly typed public wrapper, not a reason to delete an exported primitive because a targeted consumer search found no direct JSX usage.

Prior rationale review: The generic forwarding reason is bounded to span semantics. Absence of a located direct consumer is disclosed, not turned into runtime proof, dead-code certainty or retirement.

Binding: source `25b3ee4479e5a98b6a2501f1cc07419673d57221ed85e551651e45a8fc3237a8`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `02ca4525f602c36e87692a959b02194bd3492dd34606db02bd83f061168de938`.

Evidence (hashes in JSON):

- `packages/ui/components/shadcn/visually-hidden.tsx:7` — Native span remainder with explicit export.
- `packages/ui/package.json:1` — Public component wildcard export includes the shared wrapper path.

No direct applicable consumer test is claimed; see limits.

Limits: No direct JSX consumer or dedicated suite was found in the targeted inspection; sr-only CSS behavior and screen-reader output were not executed.

Reconsider: Requalify if native host/type, export contract, className/visibility ownership or prop filtering changes.

### Record 187 — LegacyUnlayerDocumentEditor / fixed document-mode adapter

**exact-rebind** — navigation-only ledger index264; `packages/ui/components/studio/legacy/UnlayerDocumentEditor.tsx:22`; `react-doctor/jsx-props-no-spreading`.

The document adapter exposes Omit<LegacyUnlayerEmailEditorProps,"mode"> and the shared imperative handle, forwards caller editor configuration/events, then fixes ref and mode="document" after the spread. The inspected PDF Studio consumer actually supplies editorId, readiness/design callbacks, className, ref and appearance through this adapter; preserving those inputs is a real contract rather than a hypothetical spread justification.

Prior rationale review: The generic forwarding reason is qualified by a current source receipt and explicit mode override. Historical legacy tests exercise the email adapter with a mocked dynamic provider, not hosted PDF/document behavior.

Binding: source `18e15b077247712d740cae7e197961e45b839923a68f21ad07cfdddc7dcb077a`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `a111e9b68408cefa0de6ef3b4b09b0be16f3c93bc4f53ef8c32efd509f9abfcd`.

Evidence (hashes in JSON):

- `packages/ui/components/studio/legacy/UnlayerDocumentEditor.tsx:11` — Typed Omit boundary and later fixed document mode/ref.
- `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:96` — Shared imperative handle and legacy configuration/event prop surface.
- `apps/admin/app/(app)/pdf/page-client.tsx:1953` — Actual PDF Studio consumer passes document editor configuration and callbacks.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:28` — Hosted dynamic editor is mocked; tests are not document-provider execution.
- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:78` — Email-adapter readiness, design/listener and before-ready handle assertions.

Limits: PDF product writers are active: the consumer receipt is time-bounded and its whole-source hash must be compared at handback. No hosted provider, PDF export, document-mode initialization or live readiness test was executed.

Reconsider: Requalify if document-mode fixation, handle/config API, dynamic provider or PDF consumer usage changes; any concurrent consumer drift requires renewed semantic review.

### Record 188 — LegacyUnlayerEmailEditor / pre-mount decorative pulse

**exact-rebind** — navigation-only ledger index266; `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:331`; `react-doctor/no-ungated-tailwind-animation`.

The selected candidate is line331 in the !isMounted branch: a blurred decorative background behind the loading icon, not the separate line360 mounted overlay. It lacks spinner-essential and its CSS pulse is limited by the inspected shared reduced-motion media/import chain. Initialization remains represented by text and indeterminate progress rather than requiring decorative pulsing.

Prior rationale review: The global-policy rationale is independently tied to this pre-mount element. Four same-rule candidates are not interchangeable; this recommendation selects only331 and does not claim SSR/hydration or provider execution.

Binding: source `a20627ed47dae0e2385fdfa2825f0a7108dbbf363271cae866f408e89d680118`; candidate context `e5ad8b5fc37df4a7b20c2b33a85daee38e4f68ad20096396fa8ceb581f8b4f56`; previous record `0a0d31fb745f29acd0fb75091154c2f57fb2a23d4a1df9d930e9428087ea14f9`.

Evidence (hashes in JSON):

- `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:321` — Exact pre-mount decorative pulse with initializing text and null-valued progress.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:28` — Dynamic hosted provider is mocked; no media-policy execution.
- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:78` — Adapter readiness consumer source, not pre-mount animation verification.

Limits: No computed-style, hydration, hosted embed or pre-mount screenshot proof was produced. Qualifies331 only; shared CSS receipt/import scope is mandatory and third-party unstyled consumers are not covered.

Reconsider: Requalify if the pre-mount branch, class/exemption, shared CSS/import chain or loading semantics changes.

### Record 189 — LegacyUnlayerEmailEditor / pre-mount initialization spinner

**exact-rebind** — navigation-only ledger index267; `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:338`; `react-doctor/no-ungated-tailwind-animation`.

The selected line338 spinner belongs to !isMounted and is paired with Initializing editor text and aria-labelled indeterminate Progress. It is CSS animate-spin without spinner-essential, so the shared reduced-motion policy applies even though the local utility scanner cannot follow app stylesheet imports.

Prior rationale review: This is not the line368 mounted-state spinner or an essential-motion exception. The old rationale is only retained for this identified CSS element under the inspected Core imports.

Binding: source `a20627ed47dae0e2385fdfa2825f0a7108dbbf363271cae866f408e89d680118`; candidate context `22dbef820e12d3878cbdde0824e4fd47e74c30f1fcf2c8e1570f5d9995cd415e`; previous record `8acb2c56e88e0eb6ec1aaf15b611dcde56d86f14886f4b22c111d86bdc6c609c`.

Evidence (hashes in JSON):

- `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:321` — Pre-mount spinner location, initializing label and null progress are distinct from the mounted overlay.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:28` — Mocked dynamic boundary cannot demonstrate hosted/CSS motion.
- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:151` — Readiness guard source asserts exports reject before ready, not that this spinner renders correctly.

Limits: No assistive-technology, pre-mount DOM or reduced-motion execution; status text/progress are source observations only. Qualifies338 only, not all similarly written spinners or provider readiness correctness.

Reconsider: Requalify if initialization branch/status representation, this class, essential marker, CSS/import chain or animation technology changes.

### Record 190 — LegacyUnlayerEmailEditor / mounted loading-overlay pulse

**exact-rebind** — navigation-only ledger index268; `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:360`; `react-doctor/no-ungated-tailwind-animation`.

The selected line360 is the decorative blur in the mounted loadingState!==ready overlay. Its visibility is controlled by actual adapter readiness, and the pulse has no essential exemption. The shared CSS policy therefore limits this particular animation under Core app imports; decorative pulse is not needed to convey preparing/loading text or indeterminate progress.

Prior rationale review: The old global-policy reason is checked against the mounted overlay rather than copied from its pre-mount twin. Candidate360 is separately retained, not inferred from331.

Binding: source `a20627ed47dae0e2385fdfa2825f0a7108dbbf363271cae866f408e89d680118`; candidate context `e5ad8b5fc37df4a7b20c2b33a85daee38e4f68ad20096396fa8ceb581f8b4f56`; previous record `d00b7475ef321fb81b16598d165143348783ef5547bfee7b6a833d559779bc27`.

Evidence (hashes in JSON):

- `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:354` — Mounted not-ready overlay, exact decorative pulse, visible text and null progress.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:78` — Readiness callback consumer source uses a mocked provider.
- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:133` — Listener lifecycle and before-ready handle tests do not render/measure the CSS policy.

Limits: No real hosted readiness timing, computed-style/media, overlay layout or PDF consumer execution. Qualifies360 only and only with the retained stylesheet/import receipts.

Reconsider: Requalify if mounted readiness gating, decorative class, essential exemption, CSS/import chain or overlay animation changes.

### Record 191 — LegacyUnlayerEmailEditor / mounted preparing-loading spinner

**exact-rebind** — navigation-only ledger index269; `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:368`; `react-doctor/no-ungated-tailwind-animation`.

The selected line368 spinner is in the mounted not-ready overlay, adjacent to the conditional Preparing editor/Loading components text and aria-labelled null Progress. It is a non-exempt CSS animate-spin site, independently covered by the inspected global reduced-motion policy and Core import chains.

Prior rationale review: The historical rationale is bounded to368 rather than to338 or the two decorative pulses; neither spinning nor a mocked readiness test is treated as provider/runtime proof.

Binding: source `a20627ed47dae0e2385fdfa2825f0a7108dbbf363271cae866f408e89d680118`; candidate context `22dbef820e12d3878cbdde0824e4fd47e74c30f1fcf2c8e1570f5d9995cd415e`; previous record `ff41af1962088694395ea57d7baad8fa2a0561082fc2d05dafff8530cae1623e`.

Evidence (hashes in JSON):

- `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:354` — Exact mounted spinner and branch-dependent text/indeterminate progress.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:28` — Hosted dynamic editor mock is an explicit test boundary.
- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:78` — Ready callback source constrains adapter behavior but is not motion verification.
- `tests/unit/packages/ui/studio/legacy-unlayer-editor.test.tsx:151` — Before-ready handle rejection source is separate from visual loading correctness.

Limits: No hosted editor, loading-state visual, screen-reader or reduced-motion runtime test was run. Qualifies368 only; no essential-motion or blanket legacy-editor waiver.

Reconsider: Requalify if mounted loading-state transitions/status copy, spinner class, essential marker, shared CSS/import chain or animation technology changes.

### Record 192 — ReactEmailEditor / not-ready CSS spinner

**exact-rebind** — navigation-only ledger index270; `packages/ui/components/studio/ReactEmailEditor.tsx:330`; `react-doctor/no-ungated-tailwind-animation`.

The current selected line330 spinner is guarded by !isReady inside an explicitly named polite role=status region, with visible loading text and indeterminate Progress. It lacks spinner-essential, and its CSS animation is limited by the same inspected Core shared reduced-motion import chain. This is not a reason to resurrect the legacy email provider or conflate the two editors.

Prior rationale review: The old line298 is historical after source movement. The rationale is tied to the actual ReactEmailEditor330 candidate and status owner; existing tests mock the nested editor and do not certify rendered media behavior.

Binding: source `7d2a28ecd74bc102e00256d3527cdc75b32ff218d524c92209a4b632188facb2`; candidate context `86136d53caedcd3b49e0274927a573e47fee27f92d490ef3456369ba22db57a3`; previous record `672d81d148d91d03caad6dc618d812ecae921e3acae0fe57d2608fc487d1c3e1`.

Evidence (hashes in JSON):

- `packages/ui/components/studio/ReactEmailEditor.tsx:317` — Exact not-ready spinner with labelled polite status and null progress.
- `packages/ui/styles/globals.css:372` — Universal reduced-motion CSS shortens animation/transition duration; only spinner-essential is exempt.
- `apps/admin/app/layout.tsx:19` — Admin layout imports application globals.
- `apps/admin/app/globals.css:1` — Admin globals import shared UI globals.
- `apps/donor/app/layout.tsx:17` — Donor layout imports application globals.
- `apps/donor/app/globals.css:1` — Donor globals import shared UI globals.
- `apps/missionary/app/layout.tsx:23` — Missionary layout imports application globals.
- `apps/missionary/app/globals.css:1` — Missionary globals import missionary package stylesheet.
- `packages/missionary/styles.css:2` — Missionary package stylesheet imports shared UI globals.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/studio/react-email-editor.test.tsx:59` — next/dynamic substitutes the nested editor, limiting integration proof.
- `tests/unit/packages/ui/studio/react-email-editor.test.tsx:448` — Queued design load before nested readiness is covered in test source, not real nested-editor/CSS execution.

Limits: No current nested editor/provider, computed-style, real readiness or screen-reader execution was performed. This qualifies only the330 CSS class under Core imports and not every notification/animation or the full editor.

Reconsider: Requalify if ready gate/status owner, spinner/exemption, shared stylesheet/imports, nested editor or animation mechanism changes.

### Record 193 — SharedNamedViewTransition / no-class fallback Fragment

**hold** — navigation-only ledger index271; `packages/ui/components/view-transitions/shared-named-transition.tsx:38`; `react-doctor/jsx-no-useless-fragment`.

The fragment does preserve an inferred Element-shaped return while accepting arbitrary ReactNode children, but the function has no explicit Element return annotation and the inspected JSX consumer imposes no Element-only API constraint. Installed React19.3 FunctionComponent permits ReactNode or Promise<ReactNode>. These observations make the old type-preservation explanation plausible as an implementation description, not sufficient evidence of a required public compatibility boundary. Keep unresolved for root review rather than refreshing this exception or deleting the fragment here.

Prior rationale review: The prior rationale is not adopted as a requirement merely because removing the fragment widens inference. No concrete consumer, declaration contract or focused type regression was found that requires this wrapper; installed React types undermine an assumption that all components must return Element.

Binding: source `ee66dc5340496065feae8fa41e849e190f4b22b5f5ed3afe771ef2805ff90dd4`; candidate context `24295a9c545a402da4f2cc833dae7b4f3b80182f7f803516d580ca07c0642b64`; previous record `2afb7129b1fc74827a4118bad4de5d1933ed19e93975c62291f3771702ca8a67`.

Evidence (hashes in JSON):

- `packages/ui/components/view-transitions/shared-named-transition.tsx:12` — ReactNode children, no explicit return annotation, gated no-class fragment fallback and named active transition.
- `packages/ui/components/page-header.tsx:15` — Inspected consumer uses ordinary JSX, not an Element-only return contract.
- `packages/ui/node_modules/@types/react/index.d.ts:1067` — Installed FunctionComponent accepts ReactNode or Promise<ReactNode>. [Framework observation; not ledger evidence.]

No direct applicable consumer test is claimed; see limits.

Limits: No TypeScript experiment, declaration build, direct return-value assignment test or browser/ViewTransition execution was performed. Targeted consumer inspection is not a proof that no external Element-only consumer exists; no automatic fragment removal or retirement is recommended.

Reconsider: Provide a concrete supported Element-only consumer/API declaration plus a focused existing type/behavior regression, or authorize a fallback simplification with appropriate verification. Reassess if React types, feature gates or shared transition contracts change.

### Record 194 — ThemeProvider / NextThemesProvider

**exact-rebind** — navigation-only ledger index272; `packages/ui/lib/theme-provider.tsx:10`; `react-doctor/jsx-props-no-spreading`.

ThemeProvider consumes children from React.ComponentProps<typeof NextThemesProvider> and forwards the remaining installed provider props to the actual next-themes provider with children explicit. App layouts use the wrapper, and an actual adapter test composes forcedTheme/defaultTheme/enableSystem through it. Retaining that framework-owned config contract is different from forwarding DOM attributes to an arbitrary element.

Prior rationale review: The generic forwarding rationale is narrowed to next-themes configuration and actual consumer context. It does not establish hydration, storage, system-media listener or theme-flash correctness.

Binding: source `6dfd8652d01c3bfba40acd556dbc97801c5aea4e627247dbf5639a9a4ef12984`; candidate context `d1f11af18a8c469f6772fb75db963103c578ebadc89e23f537fbe6d0bba5b711`; previous record `8c12321fa453ca3936c5a43b021896233b61fc5230176fb3f3d8643a10c7e5f1`.

Evidence (hashes in JSON):

- `packages/ui/lib/theme-provider.tsx:3` — Provider-typed remainder and explicit children.
- `apps/admin/app/layout.tsx:72` — Actual application ThemeProvider/Toaster composition.

Consumer test source — **not executed**:

- `tests/unit/packages/ui/shadscan-toaster-portal.test.tsx:7` — Only Sonner is mocked; ThemeProvider/next-themes context remains real.
- `tests/unit/packages/ui/shadscan-toaster-portal.test.tsx:21` — ForcedTheme/defaultTheme/enableSystem consumer and SSR-null Toaster assertions.

Limits: No browser hydration, storage persistence, system preference events or theme flash verification; test source read only.

Reconsider: Requalify if NextThemesProvider props, children handling, app theme configuration or installed next-themes contract changes.

## Root-review handback

- Separate explicit root authorization and independent semantic review are required; no ledger patch or approval is issued here.
- Use unchanged whole-ledger SHA plus exact previous identity AND JSON-record hash; indexes/line labels are navigation only. Abort and review anew if those guards change.
- Capture the actual current candidate source inventory, manifest/diff/config/installed contracts and complete pinned strict/raw diagnostics only through its authorized owner. These historical reports cannot certify active round13r3 writers.
- For every proposed rebind, match the exact candidate identity and actual source byte context; re-read the owner, affected consumers/tests/policy and every changed evidence input. Hash replacement is not renewed justification.
- Do not include node_modules framework receipts as ledger evidence. Preserve exact Base UI/base-maia, stylesheet, transition and public API ownership.
- Resolve149,156,193 individually as specified; no unknown/deferred finding qualifies. No retirement-by-absence is available in this slice.
- After any separately authorized ledger work, perform combined canonical validation and required current eight-target strict acceptance with official actionable.json. This review subtracts nothing from historical/global unresolved counts.

## Structural verification

- Exactly65 positions130–194;65 unique previous identities and65 unique selected candidates. All65 previous-record SHA checks match. All77 listed occurrences match exactly once in each historical inventory.
- Counts:62 exact-rebind /0 retirement /1 reject-repair /2 hold; unresolved149,156,193. Unlayer branches are188→331,189→338,190→360,191→368.
- Source/test/framework reference ranges were checked against retained text; installed node_modules evidence is explicitly ledger-ineligible. Candidate byte contexts preserve the separate fingerprint differences at161,164,172.
- Written JSON parsing, artifact byte comparison, all151 retained input hashes and the two-file destination listing passed at 2026-11-12T03:04:37.258Z. These are structural checks only; no runtime/audit result is implied.
