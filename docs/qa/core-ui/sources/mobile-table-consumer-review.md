# Responsive table consumer review

The read-only TypeScript AST/import scan covered 2,008 first-party TS/TSX files
and every 14 app consumer: eight direct `DataTableResponsive` surfaces and six
`DataTableWrapper` consumers. Five enable mobile cards; nine intentionally keep
horizontally scrollable tables. [The structured record](./mobile-table-consumer-review.json)
preserves the discovery/configuration snapshot, current source hashes and exact
owner test closures.

Four material omissions were implemented locally through Core’s existing
`DataTableResponsive` and pinned TanStack boundary:

| Surface                   | Improvement and preserved behavior                                                                                                                                                        | Substantive proof                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Donor History             | Actual transaction card reuses existing column cells for recipient, date, currency, category/status and receipt/statement actions. Query, filter, pagination and receipt bindings remain. | Two meaningful missing-field/action RED failures, then four files/eight tests passed.                                                                                                               |
| Missionary partner Giving | Actual gift card reuses all five existing cell renderers. Gift filtering, null/date/currency/method/status behavior and partner actions remain.                                           | Desktop passed and narrow missing-gift RED failed, then one file/two tests passed.                                                                                                                  |
| Admin Contributions       | Controlled shared Checkbox uses the actual Row state beside its separate named open button. Receipt selection, confirmation and batch payload remain.                                     | Three Contributions/Support missing-control RED failures; joint five-file/21-test GREEN verifies selection identity, reorder/deselect, no accidental detail open and exact confirmed receipt batch. |
| Support table             | Controlled shared Checkbox uses the actual Row state beside its separate conversation-open button. Existing selected-row status mutation and detail state remain.                         | Same joint five-file/21-test run; actual useSupportBulkActions applies the existing mutation to only the selected conversation. Counts overlap and are not summed.                                  |

The ten other consumers retain their reviewed contracts: the configured
non-selectable missionary partner roster, three explicit table-only CRM/Notes/
Relationships surfaces, and six wrapper consumers for Locations, Care,
Mobilize, Teams, Tasks and Event Attendees. All six wrappers retain their
existing table-only defaults (`mobileBreakpoint: 0`, no view toggle). This audit
found no additional material card/selection omission at this seam.

A custom `renderCard` bypasses the shared default selection/identity/action
wrapper. Each accepted app-local composition therefore retains exact domain
cells and explicitly supplies selection where enabled. Core does not infer
mobile cells from arbitrary data keys or introduce a parallel table engine.
The relevant [admin table guidance](../../../ai/ADMIN-UX-STANDARDS.md) is kept
aligned with that contract.

The focused tests mount actual shared tables and installed TanStack rows.
Inert component fixtures may use explicit synthetic input/auth/HTTP adapters;
they do not establish productive provider availability. Matching original/
current narrow captures and keyboard/selection review remain runtime-owned in
[before](../before-index.json), [after](../after-index.json) and
[interaction checks](../after-seam-checks.json). All four accepted omissions now
have individually attributed actual browser closure. Native History shows the
three existing E2E records and successful receipt links at both widths; its
main pairs restore the original document/table scroll state, with receipt focus
kept as separate after-only evidence. Giving original/current fixtures use the
real MotionProvider with visible bodies; final keyboard focus reveals the tab
inside its native horizontal rail while preserving page position and manual
Base UI activation.

Contributions and Support natural Tab/Space selection reaches the named
Checkboxes and existing bulk actions without opening a record. Real receipt
confirmation and held pending preserve the selected batch, while Support's local
HTTP adapter records only the selected conversation PATCH. The
[component review](./late-component-browser-review.json) records exact screenshot
identities and execution attribution. Hosted receipt delivery, realtime status
convergence and productive Giving partner records remain unverified; these
browser slices do not establish those provider workflows.
