# Shared UI source inventory and material opportunities

Snapshot: 275 TS/TSX/CSS source files in packages/ui plus two packages/lib authored-content helpers. Static module graph includes explicit direct and transitive consumers; barrel reachability is an approximation, not a route/browser coverage claim.

No tracked source was edited by this audit agent. No tests or browser checks were run by this inventory agent. Root owns runtime, current ReUI MCP, licensing, baseline checks, and implementation decisions.

## Contract

Exact base-maia; @base-ui/react1.8.0; TanStack Table9.0.0-beta.9 through data-table/tanstack.ts; TanStackForm1.28.6; existingchart/editormediaengines; CoresemanticCSS/typography/Lucide/sharedexports retained.

## Findings

### SH-01 — Bulk action visibility loses and duplicates actions

Evidence: `packages/ui/components/shadcn/data-table/data-table-floating-bar.tsx:79`. Filtering hideOnMobile before slicing visible actions but slicing all actions for overflow can omit early hidden actions at every viewport and duplicate shifted visible actions.

Benefit: Retain responsive bulk action bar and repair reachability per viewport; do not change selected row payloads.

Acceptance: Array with early hideOnMobile action and >2 actions: wide each action once; narrow hidden-inline actions reachable in overflow; handlers receive same filtered selection.

Source: shadcn Button + DropdownMenu, existing Core composition — https://ui.shadcn.com/docs/components/button. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: behavior; transitiveappmoduleconsumers: 47.

### SH-02 — Sidebar shortcut collides with editor and input keyboard ownership

Evidence: `packages/ui/components/shadcn/sidebar.tsx:96`. Global Ctrl/Meta+B listener ignores editable target, defaultPrevented, IME composition and repeat, so editor bold or native input shortcut may also toggle sidebar.

Benefit: Scope keyboard shortcut using existing NavigationCommandPalette ownership pattern; keep body shortcut/sidebar state cookie intact.

Acceptance: Render public SidebarProvider seam with contenteditable/input; Cmd/Ctrl+B leaves editor/input alone, respects prevented/composing/repeated events, toggles from body.

Source: official shadcn Sidebar + Core NavigationCommandPalette guard — https://ui.shadcn.com/docs/components/sidebar. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: behavior; transitiveappmoduleconsumers: 5.

### SH-03 — Zero values disappear in chart tooltip

Evidence: `packages/ui/components/shadcn/chart.tsx:225`. Truthy condition suppresses numeric zero in default tooltip value branch.

Benefit: Render zero and preserve default formatting/custom formatter/Recharts.

Acceptance: ChartTooltipContent in ChartContainer renders 0, positive and negative values; null/undefined behavior preserved; custom formatter unchanged.

Source: official shadcn Chart existing owner — https://ui.shadcn.com/docs/components/chart. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: behavior; transitiveappmoduleconsumers: 0.

### SH-04 — Default image removal remains available when disabled or uploading

Evidence: `packages/ui/components/primitives/image-upload.tsx:161`. Default remove button has no disabled guard although disabled/isUploading are provided to the renderer; removal target is approximately20px and raw rose/white.

Benefit: Use shared Button with semantic destructive treatment and pending/disabled behavior.

Acceptance: Upload with existing value: disabled/pending prevents remove; enabled remove calls once; keyboard name/focus preserved; crop/network transport tests remain.

Source: official shadcn Button existing owner — https://ui.shadcn.com/docs/components/button. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: behavior-and-layout; transitiveappmoduleconsumers: 5.

### SH-05 — Shared reaction controls overflow narrow feed cards

Evidence: `packages/ui/components/ministry-update/reaction-bar.tsx:518`. Default four rich chip controls use h40/px20 and nonwrapping shared bar; minimum row width can exceed narrow feed viewport.

Benefit: Wrap/gap/compact chip composition responsively while preserving reaction counts, transport, rollback and readOnly branch.

Acceptance: Before/after same update at320/375px and wide; no horizontal page overflow; keyboard each control; touch interactions; existing engagement tests green.

Source: Core ReactionBar over existing buttons; permitted ReUI component composition only if matching local APIs — https://ui.shadcn.com/docs/components/button. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: layout; transitiveappmoduleconsumers: 10.

### SH-06 — Reaction visual status is raw and hover transform is touch-sensitive

Evidence: `packages/ui/components/ministry-update/reaction-bar.tsx:104`. Raw rose/amber/rgb glow colors have no centrally controlled light/dark semantics; chip whileHover scale1.1/y-4 is not fine-pointer gated.

Benefit: Use existing tokens where semantically appropriate or justified purpose tokens; reduce/delegate motion to Core press/hover system.

Acceptance: Supported light/dark active status contrast; pointercoarse produces no hover lift; reducedmotion no particle/scale; count/pressed/readOnly semantics unchanged.

Source: Core semantic tokens + existing Button motion conventions — https://reui.io/docs/styling. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: layout-and-motion; transitiveappmoduleconsumers: 10.

### SH-07 — Overlay close touch targets too small

Evidence: `packages/ui/components/shadcn/dialog.tsx:74`. Dialog default Close has only icon16px geometry; sheet Close similarly16px. Focus exists but target is small.

Benefit: Compose Base UI Close with shared Button icon size preserving positioning, scroll, portal and focus semantics.

Acceptance: Dialog/Sheet dismiss via pointer, Enter, Escape; restore trigger focus; narrow/shortviewport target usable; nested overlays remain correct.

Source: official shadcn Button + Base UI Dialog Close — https://ui.shadcn.com/docs/components/dialog. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: layout; transitiveappmoduleconsumers: 131.

### SH-08 — Filter builder popover has fixed400px minimum

Evidence: `packages/ui/components/shadcn/data-table/filters/filter-builder.tsx:113`. 400px min width exceeds320/360px viewport and prevents content reflow.

Benefit: Use bounded width and responsive rows, retaining advanced filter adapters/schema instead of ReUI Filters migration.

Acceptance: Open400px composition at320/375px; select/operator/value/remove all reachable; same serializedAND/OR and saved filters behavior.

Source: Existing Core FilterBuilder; evaluate ReUI Filters API as composition reference only — https://reui.io/docs/components/base/filters. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: layout; transitiveappmoduleconsumers: 47.

### SH-09 — Saved Views trigger loses accessible name on narrow screens

Evidence: `packages/ui/components/shadcn/data-table/filters/saved-filters.tsx:125`. Hidden trigger label at mobile with decorative bookmark/no aria-label leaves count or no meaningful name.

Benefit: Add explicit stable name and ariahidden decorative icon preserving saved view behavior.

Acceptance: Find trigger by role/nameSavedViews at narrow/wide with empty and populated list; open/apply/delete keyboard checks.

Source: official shadcn Popover + Button existing owner — https://ui.shadcn.com/docs/components/popover. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: accessibility; transitiveappmoduleconsumers: 47.

### SH-10 — Exported saved view hook returns uncached external store snapshots

Evidence: `packages/ui/components/shadcn/data-table/filters/saved-filters.tsx:349`. JSON.parse or fresh[] for every getSnapshot and server snapshot violates useSyncExternalStore stable identity. No direct app usage found; exported API can loop if adopted.

Benefit: Cache immutable snapshot by storage string/key and keep storage event/local persist semantics and existing serialized schema.

Acceptance: Render hook with empty/stored views: settles without React infinite-render warning; same-tab write updates; cross-tab storage event updates; storage key unchanged.

Source: Existing Core useSavedFilters public seam; no external state stack — https://react.dev/reference/react/useSyncExternalStore. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: behavior-dormant-api; transitiveappmoduleconsumers: 47.

### SH-11 — Shared floating bars ignore reduced motion

Evidence: `packages/ui/components/shadcn/data-table/data-table-floating-bar.tsx:92`. FloatingBar spring transition and ActionBar entrance have no useReducedMotion gate; generic productbar spring violates repo motion convention.

Benefit: Use existing transitionStandard/useReducedMotion and keep fixedbar appearance/payload semantics.

Acceptance: Reducedmotion initialfalse/duration0 and no spring; normal entrance bounded; selection clearing/navigation unaffected.

Source: Core motion contract; shadcn controls retained — https://ui.shadcn.com/docs/components/button. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: motion; transitiveappmoduleconsumers: 47.

### SH-12 — Filter chip remove touch targets undersized

Evidence: `packages/ui/components/primitives/filter-bar.tsx:82`. FilterBar native remove is12px icon with no padding; ActiveFilters remove is~16px; multi-select remove Button overridden to16px.

Benefit: Use supported shared Button icon-xs/compact inline controls with visible focus and appropriate touch target/spacing; preserve callbacks.

Acceptance: Narrow and longfilter labels wrap; Tab/Enter removal once; focus remains meaningful after remove; disabled/pending URL state unchanged.

Source: official shadcn Badge/Button existing owner — https://ui.shadcn.com/docs/components/badge. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: layout-and-accessibility; transitiveappmoduleconsumers: 17.

### SH-13 — Merge tag search has no accessible label

Evidence: `packages/ui/components/studio/EmailStudioMergeTagMenu.tsx:69`. Placeholder alone is the only user-facing search label; input has no aria-label/idlabel relation.

Benefit: Add explicit label and preserve query/default registry/onInsert behavior.

Acceptance: Open merge menu; search by role/name; filtered real registry tags; keyboard insertion and focus return.

Source: official shadcn Input/Menu existing owner — https://ui.shadcn.com/docs/components/input. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: accessibility; transitiveappmoduleconsumers: 3.

### SH-14 — PDF setup copy buttons have no name and claim premature clipboard success

Evidence: `packages/ui/components/studio/PDFStudioSetupStatus.tsx:169`. Two icon-only copy controls have no accessible name; writeText is not awaited before copied state. Long expanded setup can exceed short dialogviewport.

Benefit: Name copy controls with step context, await supported clipboard result, use shared scrollable dialog API. Do not alter Unlayer runtime/account activation.

Acceptance: Expanded setup at shortviewport all actions reachable; copy named per step; success after resolution; reject retains failurefeedback without success claim.

Source: Core PDF Studio chrome + official shadcn Dialog/Button — https://ui.shadcn.com/docs/components/dialog. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: behavior-and-accessibility; transitiveappmoduleconsumers: 2.

### SH-15 — Email preview controls do not reflow on narrow viewport

Evidence: `packages/ui/components/studio/EmailStudioPreview.tsx:89`. Three labeledtabs plus device toggle share nonwrapping row; fixed390px mobile iframe requires deliberate scrollcanvas, not clipping.

Benefit: Wrap controls and constrain viewport; retain fixed emailcanvas dimensions inside intentional scroll container and document outputdomain white background.

Acceptance: 320/375px narrow device/HTML/text/rendered tabs usable; emailcontent unmodified; wide preview dimensions preserved.

Source: official shadcn Tabs/ToggleGroup/Dialog existing owner — https://ui.shadcn.com/docs/components/tabs. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: layout; transitiveappmoduleconsumers: 2.

### SH-16 — Public chrome bypasses semantic tokens

Evidence: `packages/ui/components/public/navbar-client.tsx:101`. Navbar scrolled/hero, footer and CMS captions hardcodewhite/zinc; herocontrast needs intentional inverse semantic rather than blanket foreground swap.

Benefit: Map to centrally defined semantic/inverse surfaces while preserving transparenthero/scrolled branches; retain footer business scaffold/no invented orgtruth.

Acceptance: Public hero/solid/scrolled/mobile beforeafter; header/skipcontrast; supportedmode footercontrast; same links/tenantbranding.

Source: Existing Core public chrome; official shadcn Sheet/Button composition — https://ui.shadcn.com/docs/components/sheet. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: layout; transitiveappmoduleconsumers: 3.

### SH-17 — Long shared page titles can become unreadable or dominate narrow content

Evidence: `packages/ui/components/page-header.tsx:38`. PageHeader h1 istruncate at everyviewport, no titletooltip; PageShell defaultuppercase5xl/6xl dominates narrow screens. Need renderedconsumer evidence before accepting beyond layoutfix.

Benefit: Wrap title/action groups where beneficial; retain existing density props/header conventions and named routeviewtransition.

Acceptance: Long actual title at320/375/wide; actions wrap; h1 fully readable; routeVT instant/reducedmotion unchanged.

Source: Core PageHeader/PageShell, official shadcn Card/Breadcrumb composition — https://ui.shadcn.com/docs/components/breadcrumb. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: candidate-requires-browser; transitiveappmoduleconsumers: 15.

### SH-18 — Dormant DataGrid has nonwrapping toolbar and incomplete header roles

Evidence: `packages/ui/components/shadcn/data-grid/data-grid.tsx:112`. All toolbar actions/search share nonwrapping row; headerdivs lack row/columnheader while rowsgridcell have roles. No direct appusagefound. Grid is engine-owned; larger indexing/engine correctness changes should be separately scoped unless adopted.

Benefit: Responsive toolbar and semantic headerownership preserve tableboundary/virtualization. Do not replace DataTableResponsive or adopt upstream v9 APIs blindly.

Acceptance: Gridpublicseam at320/375/wide controls reachable; accessibility headernames/rowcounts; existing gridkeyboard/search tests unchanged.

Source: Core DataGrid + official shadcn controls; ReUI DataGrid compatibilitycomparison optional — https://reui.io/docs/components/base/data-grid. ExistingCore/shadcnMITcomposition; exactnewReUIitem/license approval pending ifimported. Kind: candidate-dormant-api; transitiveappmoduleconsumers: 0.

## Deliberate retention

- **generic-controls:** Existing Button/Input/Select/Checkbox/Switch/Radio/Slider/NumberField/Combobox/Tabs/Menu use currentBaseUI shared owner with render composition/state attrs, native semantic controls appropriate; no brand-driven replacement warranted.
- **forms:** TanStackForm Shell carries names/values/touched/dirty/validation/errors/help through BaseUI Field. Preserve dedicated complexform stack and native simpleforms; noReactHookForm import.
- **standard-tables:** DataTableResponsive retains v9beta tablefeatureboundary, URLbridge/manualpagination/keyboard/selection/mobilecards/virtualization/export/realtime hooks. An upstream replace is highrisk; improve sharedchrome.
- **charts:** Recharts2.15.4/ChartConfig/runtimelegend wrappers retain actualvalues/charttokens/loadingerrorsemantics; no engine migration or fabricatedmetrics.
- **specialized-editors:** Tiptap documentformat/extensions/sanitization/link/imageResize and ReactEmail/legacyUnlayer boundaries retained. Shared toolbars already use BaseUI Toolbar composition; vendor internals excluded.
- **media:** Imagecrop/download/upload helpers preserve dimensions/orientation/crop/transport; Maplibre engine/knowneditorcanvas retained; improve localcontrols only.
- **auth:** AuthButton and login/register flows have explicit pendingnative-submit lock and in-flight guard; existing behaviorstrong. Passwordcontrolgeometry can use InputGroup when useful, withoutstackmigration.
- **publiccms:** Serialized publicmedia allowlist/dimensions/altcaption and safeHTML/Lexicalrenderboundary are intentionally ordinaryHTML; no registry rewrite of authordocumentformats. Footer/socialcontent retains deliberate scaffolding.
- **viewtransitions-and-motion:** RouteMainViewTransitionBoundary and SharedNamedViewTransition preserve router/providermountstate/reducedmotion. PageShell gates entrance insideVT; retain boundaries.
- **legacy-registry-blocks:** Existing shadcnstudio specializeddemo/block files remain firstparty but mostlyno directappconsumer. Do not replace/import premiumtemplates to increaseregistrycount; use sharedmoduleledger for route-levelproof.
- **tokens-fonts-utilities:** CurrentInter/Syne/GeistMono, cn0.3.2/CVA/classfunctionadapter and :root/.dark Maia tokens retained. New semanticpurpose tokens only with lightdark/contrastproof; do notreplaceglobalpalette.

## Coverage and limitations

The JSON enumerates every shared source file, exported declarations, renderedcomponents, ownerdependencies, externalengines, rawcontrols and consumerreachability. Runtime/browser/test dispositions must be updated by the implementing/rootagent. Public registry candidate names, previews, sourcehashes, installcommands and rights are deliberately not invented.

Other shared product UI under packages/missionary/components and internal/charts is assigned to missionary audit. packages/lib providers, query/motion/transition contexts are nonvisual boundary code; safehtml/publiccmsrenderer are inventoried and retained. Binary fonts and generated/vendorinternals excluded.
