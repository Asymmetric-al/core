# ADR-0195: Owner-cleared Tenant domain disconnection

**Status:** Accepted with required amendments (Phase 24 D74 — 2026-08-30)

Stopping a hostname's website role is not the same as disconnecting that
hostname from Core's hosting project. A former Primary or Redirect Site Domain
may need to remain connected while Giving, authentication, callback, protected,
provider-control, or other independently owned routes still use it. Even after
those current uses end, provider detachment can replace Core's controlled
neutral response with a browser or hosting-provider error when DNS still points
at Vercel.

Mature hosted products make this a separate self-service action and distinguish
site detachment from registration cancellation or transfer. Core follows that
model. It does not disconnect automatically when the last public role stops,
and normal disconnection does not require Asym support.

## Decision

An authorized Tenant human may disconnect one exact Tenant-controlled custom
hostname from one Site only after a complete current finite owner manifest
proves that no current behavior requires Core hosting. The ordinary row action
is **Disconnect from this Site** and the confirmation action is **Disconnect
domain**. Staff-facing copy never calls this delete, unregister, transfer,
release, or removal from Vercel.

The action applies only when the hostname:

- is not a current Primary or Redirect Site Domain;
- has no current direct Giving, checkout, authentication, callback, API,
  protected, provider-return, or other source-owned route requiring the host;
- has no pending Primary change, activation, disconnection, provider move, or
  unresolved ownership/safety operation;
- is an exact custom hostname, not a Core-owned handle, platform wildcard,
  preview host, provider-generated hostname, Donor Portal host, or other
  independently governed origin; and
- has complete, current, compatible clearance evidence from every registered
  finite owner.

Historical binding intervals, receipts, audits, attribution, D9–D15 address
reservations, provider-validation paths that end with detachment, and Core's
current neutral adverse response are not positive hosting dependencies. They
survive disconnection and do not make clearance impossible. Missing, stale,
truncated, contradictory, unauthorized, or unknown owner evidence blocks.

The action affects one canonical exact hostname only. It never cascades to an
apex, `www`, wildcard, sibling subdomain, another Site, another environment, or
another Tenant.

## Authoritative transition

Disconnection is one durable business operation with two short local commits
around external work. It is not one distributed transaction.

1. Outside a lock, Core compiles the exact current owner-clearance and provider-
   association manifests.
2. In one short deterministic-order PostgreSQL transaction, Core reauthorizes
   the current human and exact scope, reloads and compare-and-set checks every
   relevant head, records one immutable operation/receipt/outbox, and advances
   the current binding to a monotonic **Disconnecting** barrier. No network call
   occurs under lock.
3. Every favorable host, role, route, publication, and reattachment writer must
   reject that barrier. Core projects and reads back the adverse host-admission
   fence before provider removal begins.
4. The provider worker removes only Core-controlled routing associations for the
   exact hostname from the pinned Vercel team/project. It then performs current
   authenticated readback over the applicable project-domain, deployment-alias,
   branch, redirect, and wildcard associations.
5. Only proved absence of every applicable Core-controlled provider association
   permits a final short transaction to end the current Site-binding interval
   and current platform-wide occupancy claim. Canonical hostname identity,
   immutable history, and every protected reservation remain.

The human command supplies only the stable domain candidate, expected review
basis, and semantic idempotency identity. Tenant, environment, Site, canonical
ASCII hostname, actor, capability, owner-registry version, current claim and
binding generations, provider team/project/association identifiers, policy,
timestamps, and audit attribution derive from trusted server context.

Same-key/same-meaning replay returns or reconciles the original operation.
Changed hostname, Site, owner digest, claim, provider generation, or intended
effect conflicts. Once the Disconnecting barrier commits, the operation is
forward-only: there is no cancellation or automatic rollback. Reconnection is
fresh setup and proof, never Undo.

ADR-0196/D75 defines that fresh setup. Once D74 provider absence and final claim
release are proved, any Tenant may start the same Add domain flow. A Core-issued
exact-host DNS challenge is required; typing reserves nothing. Successful proof
is consumed in the same transaction that creates a new private binding
generation and current global claim. The former binding remains immutable, no
positive state follows, and D9–D15 adverse reservations remain in force. D75
does not let proof displace a current/ambiguous claim or simulate a live Site-to-
Site move.

ADR-0197/D76 owns that live same-Tenant move. It keeps platform occupancy and
provider association current, appends a new Site-scoped binding generation, and
uses an acknowledged adverse cutover barrier rather than D74 provider removal
or D75 claim acquisition. D74 is neither a prerequisite nor an implementation
shortcut for an eligible D76 move; a concurrent Disconnecting operation blocks.

## Vercel and external-system boundary

Vercel distinguishes a domain assigned to a project from a domain held in a
team/account. D74 uses the project-domain removal capability and only other
exact Core-owned routing cleanup proved necessary by the provider manifest. It
never invokes account-domain deletion, registrar transfer, provider `--force`,
or an automatic move to another project/team.

A successful removal response is submission evidence, not authoritative
completion. A timeout, lost response, `429`, `5xx`, malformed response, `403`,
or contradictory event is indeterminate. A provider not-found response counts
as absence only when current authenticated access proves the exact expected
team/project scope; otherwise it may mean lost authority or a wrong identifier.
Core retains the adverse fence and current claim until reconciliation proves the
business effect.

Signed Vercel domain webhooks may accelerate reconciliation. Core verifies the
raw-body HMAC in constant time, validates exact team/project/hostname,
deduplicates event identity, and treats duplicate, delayed, missing, and out-of-
order events as normal. Vercel retries failed webhook delivery for only a
bounded time, so webhook silence never proves absence. Current provider readback
remains required.

The provider adapter honors current rate-limit response headers and `429` reset
evidence rather than freezing a numeric provider limit into Core policy. It uses
one consolidated integration, not a webhook or polling loop per Site/domain.

D74 does not:

- cancel, sell, expire, transfer, unregister, renew, or change registrant
  ownership of a domain;
- delete a hostname or apex from the Vercel team/account;
- change DNS, nameservers, MX, DKIM, DMARC, CAA, DNSSEC, email, unrelated
  subdomains, or Tenant registrar configuration;
- promise that a browser, resolver, cache, search index, archive, certificate-
  transparency record, or third-party host forgets the former relationship;
- move the hostname to another Core Site or external destination; or
- automatically delete certificates, provider account facts, history, receipts,
  or D9–D15 reservations.

If DNS still points to Vercel after project detachment, visitors may see a
browser or provider error. Core states this before confirmation and recommends
preparing the destination and updating DNS first when continuity matters. DNS
change is advice, not a hidden prerequisite or a Core mutation.

## Database, RLS, and authorization invariants

The relational model must make these states impossible to violate:

- canonical hostname identity is immutable and never deleted;
- at most one platform-wide current occupancy claim exists for a canonical
  hostname across Tenants, environments, and Sites;
- at most one current Site-binding interval exists for that claim;
- a Disconnecting barrier blocks every new favorable host/route role and every
  claim transfer or release path;
- claim release requires a current adverse-fence acknowledgement and current
  provider-absence proof bound to the same operation and provider generation;
- caller input cannot assert owner clearance, provider absence, actor, scope,
  time, or audit attribution; and
- history and address reservations use restrictive deletion behavior and remain
  valid after the current binding interval ends.

Same-scope composite foreign keys include the required Tenant, environment,
Site, hostname identity, claim/binding generation, and operation identity.
Current-head uniqueness and check constraints enforce cardinality and valid
state combinations. Deletes are restricted; immutable facts expose no update or
delete policy. Current-claim, binding, operation, owner-manifest, and provider-
work lookups have supporting indexes.

Browser/Data API roles receive no direct mutation grant. Applicable exposed
relations enable and force RLS; mutation policies constrain both the existing
row with `USING` and resulting row with `WITH CHECK`. Views/functions/RPCs,
Payload, imports, repairs, support, workers, table owners, secret/service roles,
and every `BYPASSRLS` path preserve the same command and scope invariants.
Security-definer functions use minimal execute grants, fully qualified objects,
and a pinned empty `search_path`. Provider credentials remain securely injected
and never enter caller input, durable business facts, logs, or user-visible
errors.

The normal protected effect belongs to current Site-domain administration.
Phase 12 registers `sites.disconnect_domains` as the one human-authorized
disconnection effect and includes it in the standard Domain Manager bundle
without requiring a second role, provider access, support approval, or direct
database authority. Custom least-privilege roles may withhold it. Existing
`sites.manage_domains` and `sites.activate_domains` retain their narrower setup
and public-role meanings.

## Staff, Tenant, and visitor experience

The Site name and production context remain visible in **Site → Domains**. Rows
have four truthful stages:

1. **Not used for website · Other uses remain** — no disconnect action; show one
   permission-safe owner handoff such as **Review current uses**.
2. **Not public · Connected for hosting** — no current positive use remains;
   show **Disconnect from this Site**.
3. **Disconnecting** or **Not public · Disconnection needs attention** — the
   adverse fence is active; show durable status and no second submit/cancel.
4. **Disconnected** — the current Site connection ended after provider absence;
   retain a permission-filtered history row and receipt.

Counts and owner details appear only from a complete viewer-authorized
inventory. Otherwise the UI says that some independently managed uses remain
without revealing identity, count, route, Tenant, or timing. Unknown clearance
says **Couldn't confirm this domain is ready to disconnect** and provides the
cause-owned next action; it never presents a disabled unexplained destructive
button.

The eligible action opens one short shared Base UI AlertDialog, not a wizard,
Sheet, route matrix, provider dashboard, or typed-hostname ritual:

> **Disconnect `www.hoperelief.org` from Hope Relief Website?**
>
> Hope Relief Website is already not public at this domain. Disconnecting removes
> its remaining website-hosting connection. It does not cancel or transfer the
> domain, change DNS or renewal, affect email, or delete Site content and history.
>
> If DNS still points to the current hosting service afterward, visitors may see
> a browser or hosting-provider error until you update it. Protected address
> reservations remain. Using this domain here again requires fresh setup.

Actions are **Keep connected** and **Disconnect domain**. Safe cancel receives
initial focus and restores focus to the exact row. There is no preselected
choice, checkbox, mandatory reason, second approver, countdown, schedule, bulk
action, live percentage, or toast-only result. The destructive visual treatment
is confined to the action and uses repository semantic tokens.

After acknowledgement, the row says:

> **Disconnecting**  
> Public use is already blocked. You can leave this page while the hosting
> connection is checked and removed.

An ambiguous outcome says not to resubmit or attach the hostname elsewhere and
retains the claim. Success says **Disconnected from this Site** and explicitly
repeats that registration, DNS, renewal, and email were not changed. Provider
IDs, account ownership, raw errors, rate counters, and hidden route details stay
out of ordinary staff UI.

Internationalized domains display a safe Unicode form plus canonical ASCII
form when they differ; technical values use left-to-right bidi isolation and
safe wrapping without hiding the registrable domain. The journey is proved at
320 CSS pixels, 400% zoom, keyboard, screen reader, touch, forced colors,
reduced motion, long localization, RTL/bidi, weak network, refresh/resume, and
session-expiry conditions. One polite status region announces meaningful
transitions; provider polling never repeatedly announces or steals focus.

Visitors receive only the governing host-admission result. Core never redirects
to another Site, serves a platform/Asym-branded fallback, injects client
JavaScript, emits analytics, or restores a former role because provider cleanup
failed.

## Consequences

- Tenants control the exact moment an unused hostname leaves Core hosting.
- Ordinary work stays self-service; support handles only provider-account,
  registrar, authority-loss, or corrupted-state exceptions.
- A current neutral response may become an external provider/browser error;
  staff receive an explicit continuity warning and DNS guidance.
- Provider ambiguity cannot create a cross-Tenant claim race because the current
  claim remains reserved until exact absence is proved.
- Historical and Giving-address safety survives without blocking legitimate
  hosting detachment.
- The two-commit operation adds durable reconciliation, but no scheduler,
  workflow engine, approval system, provider dashboard, DNS product, bulk
  cleanup, or generic lifecycle framework.

## Rejected alternatives

- **Automatic disconnection after last use:** minimizes idle provider objects but
  surprises staff, can remove a controlled neutral response, and makes migration
  timing implicit.
- **Support-only disconnection:** handles exceptional provider conflicts but
  creates a bottleneck and tribal knowledge for a mechanically provable normal
  operation.
- **Delete/remove domain wording:** incorrectly implies registrar, DNS, renewal,
  provider-account, or historical deletion.
- **One provider DELETE equals success:** cannot distinguish lost response,
  wrong scope, permission loss, or residual routing associations.
- **Release the claim before provider proof:** permits another current binding
  while stale provider state still exists.
- **Require DNS movement:** can improve continuity but turns an external Tenant
  choice into a circular hard gate and prevents intentional shutdown.
- **Automatic re-add rollback:** may revive a hostname whose authority or safety
  changed; recovery is forward-only and later use starts fresh.
- **Typed hostname, reason, or second approval:** adds friction without improving
  the structurally proved exact operation.

## References

- [D74 adversarial review](../prds/sitestacker-parity/phase-24-d74-owner-cleared-domain-disconnection-adversarial-review.md)
- [ADR-0196 — Fresh-proof clean-start Site domain claims](./0196-fresh-proof-clean-start-site-domain-claims.md)
- [D75 adversarial review](../prds/sitestacker-parity/phase-24-d75-fresh-proof-clean-start-domain-claim-adversarial-review.md)
- [ADR-0197 — Prepared same-Tenant Site Domain cutovers](./0197-prepared-same-tenant-site-domain-cutover.md)
- [D76 adversarial review](../prds/sitestacker-parity/phase-24-d76-prepared-same-tenant-site-domain-cutover-adversarial-review.md)
- [ADR-0193 — Primary and Redirect Site Domains](./0193-one-primary-site-domain-with-redirect-site-domains.md)
- [ADR-0194 — Explicit former-primary website disposition](./0194-explicit-former-primary-website-disposition.md)
- [Vercel — Removing a domain from a project](https://vercel.com/docs/domains/working-with-domains/remove-a-domain)
- [Vercel — Working with domains](https://vercel.com/docs/domains/working-with-domains)
- [Vercel — Transferring domains](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain)
- [Vercel — Claiming domain ownership](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership)
- [Vercel — REST API](https://vercel.com/docs/rest-api)
- [Vercel — REST errors](https://vercel.com/docs/rest-api/errors)
- [Vercel — Webhooks API](https://vercel.com/docs/webhooks/webhooks-api)
- [Vercel — Zero-downtime project move](https://vercel.com/kb/guide/how-to-move-a-domain-between-vercel-projects-with-zero-downtime)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL — Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Squarespace — Disconnect a third-party domain](https://support.squarespace.com/hc/en-us/articles/205812428-Disconnecting-a-third-party-domain)
- [Shopify — Remove a third-party domain](https://help.shopify.com/en/manual/domains/removing-domains/removing-third-party-domains)
- [WordPress.com — Manage domains](https://wordpress.com/support/domains/)
- [OWASP — Subdomain takeover prevention](https://cheatsheetseries.owasp.org/cheatsheets/Subdomain_Takeover_Prevention_Cheat_Sheet.html)
- [W3C APG — Alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
