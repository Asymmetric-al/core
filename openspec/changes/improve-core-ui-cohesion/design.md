## Context

The integration base is develop at f49fc2e03bce9246f5d3dc22c16d0a6c794a8304.
Implementation is isolated from the original dirty checkout. Current ownership
is packages/ui; configured style is base-maia, primitives Base UI 1.8.0, table
engine TanStack 9.0.0-beta.9 through the existing compatibility boundary.

## Decisions

Use existing shared wrappers for generic controls and permitted public MIT
ReUI examples/APIs for compatible composition. Inspect current MCP schemas,
registry source and dependencies before acceptance. Do not import restricted
blocks/templates/icons into public source without a covering written agreement.
Retain notices for any incorporated MIT source.

Prioritize shared defects and high-visibility presentation. Keep product data,
queries, mutations, calculations, form names/validation and URL state unchanged.
Keep DataTableResponsive and its sorting, server pagination, saved filters,
selection, exports and mobile alternatives. Keep specialized boards, chart
engines, CMS/editor runtimes and their supported extension points.

Preserve the admin shell's Web Studio exception, Eve/route-transition boundaries
and forced light mode. Preserve role/tenant navigation and missionary footer.
Respect Cache Components, Suspense and Server/Client boundaries. Do not add
motion; repair existing motion only when necessary for accessibility or Core
conventions. Add semantic status/overlay tokens centrally only for real consumers,
with light/dark contrast evidence; preserve all existing global palette values.

## Verification

Behavioral defects use red-green tests at public seams. Visual changes use real
app/component browser fixtures, before/after matching viewports and states, and
keyboard/focus/overflow checks. Source inspection and browser coverage are
recorded separately. Missing database-backed runtime data is a verification
limit, not a passing interaction or invented fixture.

Preserve all existing enforcement and run proportional checks followed by the
required final preflight. Report original dependency-discovery failures separately
from the fresh frozen-install checks and any newly introduced failures.

## Risks and rollback

Shared geometry affects many consumers; integrate foundations before reviewing
dependent screens. ReUI current table examples may target newer v9 APIs than the
pinned beta; adapt at the existing boundary rather than migrating state. Public
distribution rules block premium source absent written agreement. Roll back app
slices before shared foundations; do not change data, visibility or credentials.
