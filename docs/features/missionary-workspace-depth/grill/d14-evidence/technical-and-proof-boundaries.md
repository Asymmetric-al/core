# D14 technical research and proof boundaries

Research date: October 16, 2026 UTC. Primary documentation was inspected live;
this note does not establish the deployed Supabase version, live grants, working
calendar adapter or permission to run a live integration.

## Supabase and PostgreSQL

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security):
  grants and policies are separate controls. UPDATE considers the old row through
  USING and the proposed row through WITH CHECK; omitted WITH CHECK can inherit
  USING. Missing explicit syntax alone is not a vulnerability. A table policy is
  not field immutability or current source-purpose authorization. Inspect actual
  grants, all applicable policies and every exposed mutation path. Service-role
  execution can bypass RLS; a browser-hidden credential is not business authority.
- [Supabase functions](https://supabase.com/docs/guides/database/functions):
  invoker is the default; a necessary definer function needs restricted execution,
  a safe search path, qualified objects and explicit caller/source checks. Function
  privileges and return values need inspection independently of table RLS.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html):
  actual role, ownership and bypass status affect enforcement. Test non-owner
  roles and the real service path, not only a migration owner. A view must not
  provide a privileged alternate release path.
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html):
  a CHECK cannot safely enforce changing cross-table permission state. Use
  tenant-composite foreign keys and semantic uniqueness for durable structure;
  use an authoritative transaction for current permission/state transitions.
  NULL-aware uniqueness and NOT NULL requirements need explicit design. A valid
  foreign key alone does not prove a caller is permitted to use that reference.
- [PostgreSQL time types](https://www.postgresql.org/docs/current/datatype-datetime.html):
  timestamptz represents an instant; it does not retain the originating named
  timezone. Retain qualified appointment wall-time/zone meaning separately where
  required. A due date cannot silently become a meeting duration, and civil dates
  are not interchangeable with elapsed 24-hour periods.

Exact future requirements are in the D14 review C04–C09. No production schema,
column names, UUID version, provider SDK, queue package or retention duration is
selected by these notes. Existing owner infrastructure must be reused where
qualified; a small new source contract is still required where none exists.

## OAuth and browser boundaries

[RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html) supports authorization-code
flow with transaction-bound PKCE, exact callback handling and protections against
code injection, mix-up and token leakage. Apply this within P31's owner boundary,
not by reusing the current Supabase login callback as a calendar connection.

The connection attempt must bind the authenticated Asym principal and Tenant,
provider/issuer, allowed redirect and original UI continuation. Reject swapped,
expired or repeated callbacks. Verify provider account/calendar identity from
provider evidence, not display name or caller input. Missing or declined scopes
leave the connection unavailable; consent cancellation does not enqueue copies.
Secrets stay in existing server credential custody. UI, outbox payloads, logs,
analytics and deep links carry references, never access/refresh tokens.

## UX/accessibility evidence

- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html):
  expose saving, pending, success and error information programmatically without
  unnecessarily moving focus. A green icon or short toast alone is insufficient.
- [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html):
  prove the connection and appointment journey at narrow layouts/zoom rather than
  assuming a desktop modal is usable on a phone.
- [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
  test the applicable 24-by-24 CSS-pixel minimum/spacing exceptions, keyboard
  operation, focus and understandable labels. A larger comfortable touch target
  is a product choice, not a substitute for the complete accessibility criteria.
- [GOV.UK radios](https://design-system.service.gov.uk/components/radios/):
  use explicit mutually exclusive choices when a decision is needed; do not make
  a user decipher unrelated toggles. Borrow interaction reasoning only; Core's
  base-maia/Base UI/Zinc system remains governing.

Names, calendar labels and dates require Unicode, localized formatting and clear
zone labels. A provider account label is supporting context, not identity proof.
No country, postal address or donor identity is required for this personal copy.
Sensitive appointment data must not enter analytics, browser durable drafts or
client error telemetry as a convenience for interrupted mobile use.

## Evidence levels

1. Repository contracts establish intended ownership; current files establish
   only inspected implementation behavior.
2. Primary provider docs establish documented capabilities/limits, not this
   product's actual OAuth grants, API behavior or operational success.
3. The separate local protocol/time probes test a deliberately small model and
   standard-library timezone behavior. They do not run Core commands, PostgreSQL
   RLS, provider APIs, real parallel database sessions or browser UI.
4. Actual adapter, database/role, accessibility, migration and production-shaped
   performance proof remains a release requirement. This research does not
   substitute a passing mock for an unverified provider guarantee.

There is no supplied observation of Asym missionaries' preferred calendar
providers, appointment volume or refresh tolerance. Recommendations about the
first provider profile, minimal copied content and one-off timed scope are
product/engineering judgments. Validate them with representative missionary
journeys and actual supported-provider qualification; do not invent adoption,
latency, conversion or usability statistics.
