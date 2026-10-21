# D15 — Supabase, standards and accessibility evidence

**Subsequent status — October 16, 2026 UTC:** the founder explicitly ratified the
[corrected D15 decision](../phase28-d15-connected-email-adversarial-review.md)
and its required amendments. That synthesis governs where this original research
contribution leaves options open or uses provisional wording. This note remains
evidence of the research performed; ratification proves no runtime capability.

Inspected October 16, 2026 UTC. These are public documentation facts and design
inferences, not a deployed database, OAuth or accessibility assessment. The
Supabase skill and current runtime/network instructions were consulted. No live
Supabase project, account connection, provider credential or email was used.

## Database and authorization

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
  separates accessible rows from API grants. UPDATE needs the relevant SELECT
  visibility. `USING` tests the old row; `WITH CHECK` constrains the resulting row;
  when omitted, applicable PostgreSQL inheritance rules can reuse `USING`.
  Therefore absence of an explicit clause alone is not proof of a bypass. Test
  effective policies and role grants, including permissive-policy composition.
- [Column security](https://supabase.com/docs/guides/database/postgres/column-level-security)
  explains why row access does not restrict every writable column. A table-wide
  UPDATE grant can defeat an intended column-only restriction. D15 author, tenant,
  connection, recipient authority, grant generation and accepted outcome fields
  must not remain arbitrarily mutable behind an apparently safe row predicate.
- [Database functions](https://supabase.com/docs/guides/database/functions)
  distinguishes invoker and definer execution. Prefer invoker where sufficient;
  a necessary privileged command needs a fixed safe search path, qualified names,
  restricted EXECUTE grants and explicit current caller/source checks. Security
  definer is neither inherently safe nor inherently a demonstrated vulnerability.
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
  supports composite uniqueness/foreign keys, checks and non-null constraints.
  Same-tenant relationships require keys that actually include tenant identity;
  separate globally valid IDs do not prove same-tenant ownership. Nullable scope
  must be a closed branch, not a null-as-wildcard convention. Check constraints
  cannot be used to enforce arbitrary changing cross-row authorization.
- [Supabase API grant change](https://github.com/orgs/supabase/discussions/45329)
  documents a move away from automatically exposing new tables. Inspect this
  installation's real schema grants; neither old nor new defaults prove its
  current exposure. RLS, table/column grants, RPC execution, views and storage
  must agree. Service-role access still requires the domain authorization gate.

**Design inference:** use existing P9/native-source, P6/P17 and P31 commands with
an atomic source authorization, complete release and body-free audit. Do not
invent a second message queue, credential table exposed to browser clients, or
client-writeable permission flags. Current P12 authority must be checked both
at acceptance and final admission to the external effect. A browser choosing a
tenant context is a selector, not proof that it belongs to the tenant.

## OAuth and message construction

[OAuth Security BCP, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)
is the current standards baseline: authorization-code flow, PKCE where supported
by the qualified provider flow, exact redirect validation, transaction binding,
issuer/mix-up defenses and secure refresh-token handling. Bind a one-use,
expiring state transaction to the initiating Asym identity, tenant and requested
purpose; validate OIDC issuer/audience/nonce/subject as applicable. Do not expose
client secrets, refresh tokens or message content in redirect URLs, browser
storage, traces or logs. An ordinary same-grant token refresh is distinct from
account replacement or renewed consent. The provider note establishes the
specific Gmail/Graph scope and shared-grant consequences.

[RFC 5322](https://www.rfc-editor.org/rfc/rfc5322.html) defines message syntax;
[RFC 6531](https://www.rfc-editor.org/rfc/rfc6531.html) covers SMTP internationalized
email. Support Unicode display names and body text without ASCII-only name rules.
Validate internationalized address support against each actual provider profile;
never transliterate, truncate, change local parts, remove plus tags or merge
people to make an address fit. Reject CR/LF header injection. Let the server build
an allowlisted message envelope and safe HTML/plain text from the accepted source
schema. Caller-provided MIME, Reply-To, Bcc, tracking or arbitrary HTML is not an
authorization mechanism. A Message-ID or request ID is correlation, not a
provider promise to deduplicate sends.

## Contact purpose and current nonprofit guidance

[Current ICO electronic-mail guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/)
distinguishes solicited/unsolicited marketing, subscriber types and separate
products/services versus charitable-purpose soft opt-ins. Its current guidance
includes a charitable-purpose route subject to conditions. Older blanket claims
that charities can never use a soft opt-in are unsafe to copy. Neither owning a
mailbox nor sending just one message establishes the applicable basis.

The [FTC CAN-SPAM guidance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
uses primary purpose and specific transactional/relationship categories. A CRM
label such as personal follow-up is not itself a legal classification; do not
assert every nonprofit email is commercial or every personal email exempt.

**Repository precedence:** preserve the existing P6 canonical contactability,
consent and suppression floor, including all-email `do_not_contact`/
`do_not_email` gates. The source qualifies its purpose and applicable organization
policy. Current external legal guidance informs that policy; this review does
not quietly weaken Core's stricter floor. Required identity/preference controls
must be visible in the compiled preview and cannot be removed by editing a
signature. A newsletter-topic unsubscribe is not automatically a global email
stop, and absence of a stop is not positive source authority.

## Accessibility and useful feedback

- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html):
  saved, sending, error and outcome updates need programmatic announcement where
  applicable without unnecessarily moving focus. Persistent readable status
  complements announcements and toasts.
- [Redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html):
  retain valid entered information within the flow, including return from
  connection setup and recoverable validation errors. This does not authorize
  retaining protected content after loss of access or expiry.
- [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
  the AA criterion uses 24 by 24 CSS pixels with defined exceptions, not an
  invented universal 44-pixel AA mandate. Aim for comfortable touch controls;
  test actual target spacing, reflow, keyboard operation and screen readers.
- [Error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
  does not prescribe a second modal for every ordinary personal email. Visible
  recipient/sender/content plus deliberate Send is the appropriate initial
  review; changed identity or destructive provider removal merits specific review.

No real missionary usability interviews, mobile sessions, assistive-technology
runs or quantitative satisfaction findings were collected. Comparable CRM and
MPDX documentation supports patterns, not claims that this design already works
for field conditions. Proposed acceptance must validate those actual tasks.

## Current Supabase upgrade awareness

The [October 12 CBC TLS announcement](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)
schedules removal no earlier than November 10, 2026. The
[Postgres 15.19/17.11 change notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
identifies specific extension/legacy-crypto/operator compatibility issues.
Neither establishes the version or affected usage of Core's deployed database.
Use supported clients and ordinary upgrade qualification; do not add a new
crypto/connection abstraction or claim a present production defect from these
announcements. Explicit schema/grant migrations and real-role tests matter more
for D15 than speculative infrastructure changes.
