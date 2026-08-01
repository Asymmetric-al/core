# Phase 20 Provider Authorization Lifecycle Research Evidence

**Research date:** 2026-07-26
**Decision status:** ratified as Phase 20 D14 on 2026-07-26

## Executive conclusion

The accounting integration cannot model "connected" as a boolean or treat every
OAuth failure as a request for the tenant to reconnect. QuickBooks Online and
Xero have materially different token rotation, connection, revocation,
multi-organization, quota, and outage behavior. An unsafe reconnect can bind an
Accounting Destination to the wrong books; an unsafe refresh can revoke the
working credential; and an unsafe retry after an authorization failure can
duplicate a provider posting whose earlier outcome is still unknown.

The strongest bounded option is:

> **Option C-prime-amended-and-hardened (C-prime-R) - one exact provider
> authorization lifecycle with provider-native serialized token rotation,
> proof-gated same-organization reconnect, a separate explicit destination
> replacement workflow, least-blast-radius disconnect and revocation,
> outage-aware quarantine and recovery, artifact-always continuity, and one
> quiet connection surface backed by cause-owned Accounting Exception Cases.**

The governing rule is:

> **A successful OAuth callback proves that the provider authorized something.
> It does not prove that the user authorized the same accounting organization
> that the tenant previously bound to the Legal Entity.**

For a reconnect, Asym must prove exact equality of the provider-owned stable
organization identifier before promoting new credentials:

- QBO: the callback `realmId`, followed by a successful read from that exact
  company;
- Xero: the exact `tenantId` returned by the Connections API for the current
  authorization event, followed by a successful Organisation read for that
  exact tenant.

Provider display names, legal names, tax numbers, connection IDs, browser user
identity, and staff attestations are useful evidence or labels, but none is a
safe substitute for the provider-owned organization identifier.

If the identifiers differ, Asym must not silently replace the destination. The
candidate is quarantined and the staff member receives two clear choices:

1. return to the provider and connect the expected organization; or
2. start the separately governed **Replace accounting destination** workflow.

This preserves Phase 20 D2's mutually exclusive delivery lanes, D3's
Legal-Entity boundary, D4-D8's immutable accounting meaning and provider-native
plan, D12's Accounting Release fence, and D13's cause-owned exception truth.
QBO or Xero remains authoritative for its books; Asym remains an integration,
evidence, and recovery system rather than a general ledger.

## Research method and limits

This review used current primary sources only:

- current Intuit QBO OAuth, token, revocation, scopes, technical review,
  security review, subscription-state, and status documentation;
- current Xero OAuth, token, Connections, Organisation, scopes, limits,
  connection-management, data-integrity, and status documentation;
- IETF RFC 9700, the current OAuth 2.0 Security Best Current Practice;
- current NIST SP 800-63-4 federation and session guidance;
- current OWASP OAuth 2.0 and secrets-management guidance; and
- Plaid's first-party update-mode guidance as a narrow comparable for repairing
  an existing financial connection instead of creating a duplicate one.

Provider documentation is mutable. Every lifetime, limit, scope, response
shape, app-review obligation, and revocation behavior in this evidence must be
revalidated against the official documentation and production app tier during
implementation and immediately before launch.

The evidence intentionally does not assume:

- that a provider supports two simultaneously active client secrets;
- that changing a provider app client secret preserves every existing token;
- that a provider status page is complete or authoritative for one tenant;
- that a display name, tax number, or provider user proves organization
  identity;
- that a `401` always means permanent revocation;
- that an OAuth token set belongs to exactly one Xero organization; or
- that a reconnect makes an ambiguous earlier provider write safe to retry.

## Canonical terms

### Provider Authorization Grant

An encrypted, provider-issued credential family that authorizes Asym's provider
app to act within a provider-defined scope. It owns the current token
generation, expiry evidence, granted scopes, provider user subject where
available, and rotation history. It is not tenant-visible financial truth.

For Xero, one token set belongs to the combination of the Xero user and Asym's
app and may authorize multiple organization tenants. Xero says that a repeated
authorization for the same user/app supersedes the previous token set and that
the most recent access token can access the user's connected tenants. Therefore
duplicating the same Xero token family into one mutable row per Asym tenant is
unsafe. The grant and destination binding must be distinct authorities.

Source:
[Xero Managing Tokens and IDs](https://developer.xero.com/documentation/best-practices/data-integrity/managing-tokens)

### Accounting Destination Connection

The effective-dated, tenant- and Legal-Entity-scoped binding from one Asym
Accounting Destination to one exact provider organization in one environment.
It preserves:

- provider;
- environment;
- exact provider organization identifier;
- provider display snapshot for human recognition;
- Legal Entity;
- authorized Provider Authorization Grant reference;
- required-scope and current immutable Posting Profile and mapping references;
  and
- binding history and non-secret provider-recognition snapshots.

It never stores provider tokens. Granted scopes and token usability belong to
the Provider Authorization Grant; provider service health, destination
verification evidence, D7/D8 capability certification, delivery outcome, and
reconciliation remain independent authorities from which the staff status is
derived.

### Reconnect Attempt

A short-lived, one-time, server-owned OAuth transaction for repairing an
existing Accounting Destination Connection. It is bound to:

- initiating Asym actor and authenticated session;
- tenant and Legal Entity;
- provider and environment;
- exact expected provider organization identifier;
- requested scopes;
- random state nonce;
- PKCE verifier when supported for the chosen provider/client type;
- creation and expiry time; and
- single-use callback status.

It cannot be reused as a general connect or destination-replacement request.

### Destination Replacement

A deliberate change from one provider organization identifier to another. It is
not reconnect. It must separately show the affected Legal Entity, unreleased
Accounting Releases, Posting Profile, mappings, provider-native references, and
what will require revalidation before the replacement can activate.

### Local Quarantine

An immediate Asym-side prohibition on new provider calls using a grant or
destination. Local quarantine is effective even when the provider's revocation
endpoint is unavailable. It does not falsely claim that provider-side
revocation has completed.

### Provider Revocation Evidence

Append-only evidence that a provider token or connection was revoked or
deleted, including provider, scope of revocation, request identity, response,
time, actor/cause, and any unresolved ambiguity. A local quarantine event is
recorded separately from provider-confirmed revocation.

## Current provider facts

## QuickBooks Online

### OAuth and token lifecycle

Current Intuit documentation establishes:

- QBO uses OAuth 2.0 authorization code flow, and the callback includes the
  selected company's unique `realmId`.
- Access tokens last 3,600 seconds.
- Refresh tokens have a rolling 100-day validity and a five-year hard maximum.
- Intuit periodically returns a new refresh-token value. Asym must store and use
  the latest value from the most recent response.
- Refresh attempts using the same token must be serialized. Intuit warns that
  concurrent exchanges can produce `invalid_grant` and may revoke the otherwise
  successful token family.
- A user revocation, refresh-token inactivity expiry, or hard expiry requires a
  new authorization flow.
- An Intuit service outage can also produce `invalid_grant`; the error alone is
  therefore insufficient proof that tenant action is required.

Sources:

- [Intuit OAuth authorization FAQ](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/faq)
- [Intuit OAuth 2.0 setup and revocation](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Intuit platform requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/platform-requirements)
- [Intuit Developer status](https://status.developer.intuit.com/)

Implications:

1. One distributed refresh lease and compare-and-swap token generation are
   mandatory per QBO grant.
2. A worker receiving `invalid_grant` first reloads the newest stored token
   generation. It does not refresh again with its stale copy.
3. If the newest generation also fails, Asym checks current provider status and
   applies a bounded provider-specific retry before asking staff to reconnect.
4. Tokens are refreshed when needed, not on every API call. A low-frequency
   provider-certified liveness read may preserve an intentionally persistent
   but otherwise idle connection within Intuit's rolling expiry window.
5. The refresh-token hard-expiry date is observable and produces a quiet,
   advance reconnect request rather than a surprise posting failure.

### Same-company proof

Intuit defines `realmId` as the unique QuickBooks company ID and requires it in
subsequent company API URLs. One Intuit user can administer multiple QBO
companies and is prompted to choose a company during authorization. Therefore:

- the Intuit user is not the Accounting Destination;
- the company name is not the Accounting Destination identity;
- the reconnect callback must equal the stored expected `realmId`; and
- a successful CompanyInfo read against that exact realm must complete the
  proof before candidate credentials are promoted.

Sources:

- [Intuit OAuth 2.0 callback and realm ID](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Intuit technical requirements for multiple companies](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/technical-requirements)
- [Intuit basic ID definitions](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
- [Intuit first CompanyInfo call](https://developer.intuit.com/app/developer/qbo/docs/get-started/build-your-first-app)

The CompanyInfo display fields may be shown to staff as recognition evidence,
but only exact `realmId` equality proves that a reconnect targets the existing
destination.

### Disconnect and revocation

Intuit provides a token revocation endpoint. Successful revocation returns
`200`; Intuit's technical requirements also require a clear in-product
disconnect affordance and a reconnect path. Disconnect invalidates the OAuth
tokens and prevents further data-service calls.

Sources:

- [Intuit OAuth revocation endpoint](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Intuit connection and disconnect UX requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/technical-requirements)

Asym must separate:

- immediate local quarantine;
- provider revocation requested;
- provider revocation confirmed; and
- provider revocation outcome unknown.

A provider outage must never leave a locally disconnected connection usable.
Conversely, Asym must not display "Revoked in QuickBooks" until Intuit provides
evidence.

### Scope and company-state changes

Intuit recommends incremental scope requests. Changing scopes requires the user
to repeat authorization. QBO can also reject calls because the company
subscription ended, was canceled, or has a billing problem (`6190`). That is a
company-state condition, not proof that tokens are bad.

Sources:

- [Intuit scopes](https://developer.intuit.com/app/developer/qbo/docs/learn/scopes)
- [Intuit subscription states](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/subscription-states)
- [Intuit API error codes](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/error-codes)

Scope expansion and company-subscription recovery therefore require different
cause-owned Accounting Exception Cases and different staff copy.

### Production compliance and support evidence

Intuit requires production apps to handle OAuth expiration, invalid grants,
CSRF errors, connect/disconnect/reconnect flows, and API errors. Intuit's current
platform requirements describe annual security assessments, and its support
guidance recommends retaining the `intuit_tid` response header and request
sequence for troubleshooting. Intuit prohibits exposing OAuth tokens or
customer-identifying information and prohibits logging credentials or
QuickBooks data.

Sources:

- [Intuit platform requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/platform-requirements)
- [Intuit security requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/security-requirements)
- [Intuit technical requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/technical-requirements)
- [Intuit annual compliance review](https://developer.intuit.com/app/developer/qbo/docs/go-live/list-on-the-app-store/maintaining-compliance)

The support evidence store may retain provider request IDs, classifications,
times, and redacted response metadata. It must not retain raw tokens or
unbounded provider financial payloads in application logs.

## Xero

### OAuth and token lifecycle

Current Xero documentation establishes:

- web-server apps use OAuth 2.0 authorization code flow;
- the authorization code expires after five minutes and can be exchanged once;
- access tokens expire after 30 minutes;
- `offline_access` is required to receive a refresh token;
- refresh tokens have rolling 60-day validity;
- each successful refresh returns a new access token and refresh token, both of
  which must be saved;
- if the refresh response is lost, the old refresh token can be retried during
  a 30-minute grace period;
- only one thread should refresh a token at a time; and
- token storage must be encrypted and tenant context must be explicit on every
  request.

Sources:

- [Xero authorization code flow](https://developer.xero.com/documentation/guides/oauth2/auth-flow/)
- [Xero token types and revocation](https://developer.xero.com/documentation/guides/oauth2/token-types)
- [Xero OAuth FAQ](https://developer.xero.com/faq/oauth2)
- [Xero Managing Tokens and IDs](https://developer.xero.com/documentation/best-practices/data-integrity/managing-tokens)

Implications:

1. Refresh is serialized by Provider Authorization Grant, not independently by
   every Accounting Destination Connection.
2. The new token pair is encrypted and atomically compare-and-swap promoted.
3. A lost refresh response is recovered using Xero's bounded old-token grace
   path, not an unbounded retry loop.
4. If the grace window expires, the connection needs proof-gated
   reauthorization.
5. The exact `xero-tenant-id` is passed explicitly to every API call. It is
   never stored in thread-local, global, or mutable ambient state.

### Xero user, token, connection, and organization are different identities

Xero distinguishes:

- Xero user;
- Provider Authorization Grant for that user and app;
- connection ID for one user-tenant connection;
- tenant ID for the Xero organization; and
- Organisation fields returned by the Accounting API.

Multiple Xero users can connect the same organization. One user can connect
multiple organizations. A repeated authorization for the same user and app
supersedes the earlier token set. Existing connected tenants can be accessed by
the most recent token set. The connection ID is not the organization ID.

Sources:

- [Xero Tenants and Connections](https://developer.xero.com/documentation/guides/oauth2/tenants/)
- [Xero Managing Tokens and IDs](https://developer.xero.com/documentation/best-practices/data-integrity/managing-tokens)
- [Xero Organisation API](https://developer.xero.com/documentation/api/accounting/organisation)

This creates a provider-mandated boundary:

- the encrypted token family is stored once as a Provider Authorization Grant;
- each Asym tenant and Legal Entity has a separate Accounting Destination
  Connection to an exact Xero `tenantId`;
- tenant-facing queries never enumerate other organizations authorized by the
  same grant;
- a refresh lock is shared by the grant;
- every provider operation still reauthorizes tenant, Legal Entity,
  destination, environment, and exact Xero tenant; and
- revocation or reconnection blast radius is calculated from the grant and
  connection relationship before action.

This is necessary complexity, not a general abstraction. Copying a mutable Xero
refresh token into one tenant row per destination would create stale-token
races, break other connections when the token set is superseded, and increase
cross-tenant posting risk.

A new Xero authorization result also cannot be treated as a harmless,
destination-local candidate. Xero may already have superseded the previous
token set for that user/app when the callback arrives. Asym must therefore:

1. encrypt and durably record the candidate token set immediately;
2. place every active destination backed by that grant family behind a short
   authorization fence;
3. enumerate the candidate grant's exact provider connections;
4. revalidate every previously attached active destination by `tenantId`;
5. atomically promote the new grant generation with the verified destination
   set; and
6. leave any missing destination in **Needs attention** without altering its
   provider organization identity or sending queued work elsewhere.

The UI remains scoped to the tenant that initiated the action. It must not
reveal the names or existence of other Asym tenants that happen to share the
same provider grant family. Platform observability may show the redacted grant
fanout to authorized operators.

### Same-organization proof

After authorization, Xero recommends calling `GET /connections`. The access
token contains an `authentication_event_id`; filtering Connections by the
corresponding `authEventId` identifies the tenants authorized during the
current flow. Xero's Organisation endpoint then returns the exact organization
selected by the `xero-tenant-id` header, including its provider-generated
`OrganisationID`, display name, legal name, base currency, country, status, and
other settings.

Sources:

- [Xero Tenants and current authorization event](https://developer.xero.com/documentation/guides/oauth2/tenants/)
- [Xero token claims](https://developer.xero.com/documentation/guides/oauth2/token-types)
- [Xero Organisation API](https://developer.xero.com/documentation/api/accounting/organisation)

For reconnect:

1. enumerate only the organizations attributable to the current authorization
   event;
2. require the stored expected `tenantId` to be present;
3. call Organisation using that exact tenant ID;
4. verify required scopes and capability probes;
5. compare base currency and other compatibility facts with the destination
   contract; and
6. only then promote the candidate grant generation.

`connectionId`, `tenantName`, `LegalName`, `ShortCode`, tax identifiers, and the
authorizing Xero user are not safe substitutes for exact `tenantId`.

### Narrow disconnect versus broad revocation

Xero exposes two materially different actions:

- `DELETE /connections/{connectionId}` removes one user-tenant connection but
  does not invalidate the token set; and
- the token revocation endpoint revokes the refresh token and removes all
  connections associated with that token.

Sources:

- [Xero Tenants - removing one connection](https://developer.xero.com/documentation/guides/oauth2/tenants/)
- [Xero token revocation](https://developer.xero.com/documentation/guides/oauth2/token-types)
- [Xero connection cleanup](https://developer.xero.com/documentation/best-practices/managing-connections/designing-and-implementing-connection-cleanup-routine)

Tenant-facing **Disconnect this organization** must use the least-blast-radius
provider operation available. Broad token revocation is reserved for an
explicit all-connections action or a security response with a complete impact
preview. A tenant must not unknowingly revoke another Accounting Destination
Connection merely because both use a token set authorized by the same
bookkeeper.

### Permission loss and inactive connections

Xero connections can disappear when:

- the user disconnects the app;
- the authorizing user is removed or loses sufficient organization permission;
- the connection is deleted;
- the token is revoked;
- the tenant is deleted; or
- the provider app is deleted.

Token expiry does not itself delete the connection. A connection can therefore
appear in provider connection records while Asym no longer has a usable token.

Sources:

- [Xero Tenants and connection deletion causes](https://developer.xero.com/documentation/guides/oauth2/tenants/)
- [Xero OAuth troubleshooting](https://developer.xero.com/documentation/guides/oauth2/troubleshooting)
- [Xero inactive connections](https://developer.xero.com/documentation/best-practices/managing-connections/identifying-inactive-connections)

Asym must expose authorization usability and provider connection existence as
separate evidence. Neither is a sufficient proxy for the other.

### Scopes, limits, and certification

Xero recommends minimum scopes. `offline_access` is required for background
refresh. Reducing already consented scopes requires revocation and a new
authorization. Current limits include:

- five concurrent calls per tenant;
- 60 calls per minute per tenant;
- 1,000 daily calls per tenant on Starter and 5,000 on higher tiers;
- 10,000 calls per minute across the app; and
- provider-tier connection limits for uncertified apps.

Xero returns `429` with `Retry-After` when a relevant limit is exceeded.

Sources:

- [Xero scopes](https://developer.xero.com/documentation/guides/oauth2/scopes)
- [Xero OAuth limits](https://developer.xero.com/documentation/guides/oauth2/limits/)
- [Xero rate-limit guidance](https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits)
- [Xero connection management](https://developer.xero.com/documentation/best-practices/managing-connections/connections)

Activation must therefore be capacity- and certification-aware. A `429`,
connection-tier limit, or provider outage is not a request for tenant
reauthorization.

### Provider status

Xero publishes status, component, unresolved-incident, incident-history, and
scheduled-maintenance endpoints. They are useful for classifying a broad
provider incident and suppressing reconnect storms.

Source:
[Xero Status API](https://status.xero.com/api)

The status page is supporting operational evidence, not proof that one
connection is healthy. Asym resumes a destination only after its own
authenticated provider probe succeeds.

## OAuth and security standards

### RFC 9700

RFC 9700, published as the OAuth 2.0 Security Best Current Practice, requires or
recommends:

- authorization-code protections against code injection;
- PKCE for public clients and PKCE downgrade protection;
- exact redirect URI matching;
- binding refresh tokens to the consented scope and resource servers;
- sender-constrained or rotated refresh tokens where applicable;
- protection from refresh-token replay;
- no implicit grant for new designs; and
- secure handling of authorization responses and browser redirects.

Source:
[RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700)

Asym must use each provider's supported authorization-code flow, an exact
allowlisted redirect URI, a one-time server-held state transaction, and PKCE
when supported for the provider and client type. Asym must not invent a
proprietary token exchange when a provider does not expose a standard
capability.

### NIST

Current NIST SP 800-63-4 guidance distinguishes an OAuth access token from proof
that a person is currently present. Access and refresh tokens may remain valid
after the user's interactive session ends. NIST also requires protected
channels, lifecycle termination, CSRF protection, restricted audience,
injection protection, and clear session termination controls in the relevant
federation/session contexts.

Sources:

- [NIST SP 800-63B-4 session management](https://pages.nist.gov/800-63-4/sp800-63b/session/)
- [NIST SP 800-63C-4 federation requirements](https://pages.nist.gov/800-63-4/sp800-63c/Federation/)
- [NIST federation security considerations](https://pages.nist.gov/800-63-4/sp800-63c/security/)

Consequently, possession of a working provider grant does not authorize the
current Asym staff member to replace or disconnect a destination. Sensitive
connection changes require current Asym authentication and the
`manage_accounting_connections` permission.

### OWASP

OWASP recommends protecting refresh tokens with sender constraints or rotation,
using authorization code with PKCE for applicable clients, avoiding the
implicit grant, restricting audiences and scopes, and managing secrets with
short lifetimes, rotation, access controls, and secure storage.

Sources:

- [OWASP OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

Provider access tokens, refresh tokens, authorization codes, client secrets,
and PKCE verifiers must never appear in browser storage, application logs,
analytics, error trackers, notifications, support tickets, communication
history, or tenant-visible audit payloads.

## Narrow comparable-product finding

Plaid's first-party financial connection guidance distinguishes repairing an
existing connection in "update mode" from creating a new Item and explicitly
recommends update mode to avoid duplicate Items. It also uses pending-expiration
and login-required signals to bring the user back only when input is needed.

Sources:

- [Plaid update mode](https://plaid.com/docs/link/update-mode/)
- [Plaid preventing duplicate Items](https://plaid.com/docs/link/duplicate-items/)
- [Plaid launch checklist](https://plaid.com/docs/launch-checklist/)

The transferable interaction principle is sound:

> Repair the known provider relationship in a context-bound flow; do not make
> the user create a second ambiguous relationship.

Asym must still perform its own exact QBO/Xero organization proof because Plaid
does not own Asym's Legal-Entity and Accounting Destination contracts.

## Options considered

### Option A - Reconnect replaces whatever was connected

The user selects **Reconnect**, completes provider consent, and Asym promotes
the returned tokens and provider organization.

Benefits:

- smallest implementation;
- shortest happy path; and
- no separate replacement concept.

Fatal weaknesses:

- one Intuit or Xero user can access multiple organizations;
- a user can select the wrong books;
- Xero token sets can cover multiple organizations;
- display-name matching is not identity proof;
- previously queued provider work can be released to a different destination;
  and
- a callback, popup replay, or cross-tenant mix-up can silently rebind financial
  delivery.

Verdict: reject.

### Option B - Manual credential and connection administration

Tenant admins paste provider keys or tokens, manually rotate them, manually
choose recovery behavior, and manually mark a connection healthy.

Benefits:

- gives the appearance of tenant control;
- avoids building a complete provider lifecycle; and
- can resemble simple API-key integrations.

Fatal weaknesses:

- QBO and standard Xero integrations use OAuth user consent, not tenant-pasted
  long-lived API keys;
- tenants cannot safely implement provider refresh-token rotation;
- tokens are exposed to additional people and surfaces;
- staff status toggles cannot prove provider authorization;
- manual rotation is incompatible with QBO and Xero refresh semantics; and
- first-class app review, revocation, support, and outage recovery remain
  unsolved.

Verdict: reject.

### Option C-prime - Exact connection repair with bounded replacement

Asym automatically owns provider-native token rotation. Reconnect is bound to
the existing destination and only succeeds after exact same-organization proof.
A different provider organization enters a separate replacement workflow.
Disconnect uses the narrowest provider action; security quarantine is immediate;
provider outages recover automatically; and the artifact remains available
without silently changing the selected delivery lane.

Benefits:

- prevents wrong-books rebinding;
- minimizes tenant work;
- supports bookkeepers who administer several provider organizations;
- follows provider-native rotation and revocation behavior;
- isolates outages and ambiguous outcomes;
- gives staff a clear, repair-first interaction; and
- preserves first-class QBO/Xero integration quality.

Cost:

- requires a real Provider Authorization Grant boundary;
- requires exact provider identity and capability probes;
- requires serialized token rotation and a callback state machine; and
- requires production drills for reconnect, revocation, outage, and shared Xero
  grants.

Verdict: recommended. The complexity is bounded to provider-mandated lifecycle
rules and does not create a generic identity or secrets platform.

## Hardened C-prime design

### Authority separation

| Authority                         | Owns                                                                                     | Must not own                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Provider Authorization Grant      | Encrypted token generation, provider user/app identity, scopes, expiry, rotation         | Tenant/Legal-Entity accounting meaning            |
| Accounting Destination Connection | Exact provider organization binding, Legal Entity, environment, capability compatibility | Raw tokens or provider financial facts            |
| Accounting Release                | Immutable accounting intent/effect and chosen delivery lane                              | Connection credentials                            |
| Delivery Operation                | Per-operation send/readback outcome                                                      | Organization identity or token lifecycle          |
| Accounting Exception Case         | Current cause-owned authorization or recovery condition and proof of clearing            | Mutable task completion as financial truth        |
| Mission Control task              | Human assignment, comments, due date, reminder, follow-up                                | Whether provider authorization is actually usable |
| QBO/Xero                          | Provider organization, permissions, accepted objects, provider books                     | Asym tenant authorization or source-domain truth  |

### Connection state

The product should expose three calm states:

- **Connected** - exact organization verified and required capability probes
  currently pass;
- **Needs attention** - a plain-language reason and one safe next action;
- **Disconnected** - locally quarantined and no new provider calls permitted.

Internal cause detail remains precise:

- access token expired, automatic refresh pending;
- transient provider outage;
- throttled;
- reconnect required;
- provider permission changed;
- company or organization inactive;
- scope change required;
- wrong organization authorized;
- provider revocation pending;
- provider revocation outcome unknown;
- security quarantine;
- grant-generation conflict; or
- capability drift.

Do not expose every internal substate as a badge. The detail panel and
Accounting Exception Case carry the exact evidence.

### Initial connect

1. Require current Asym authentication and
   `manage_accounting_connections`.
2. Bind the OAuth transaction to tenant, Legal Entity, destination, provider,
   environment, actor, requested scopes, nonce, and expiry.
3. Use a same-tab provider redirect. Do not depend on popups.
4. Validate exact state and, when supported, PKCE before exchanging the code.
5. Exchange the code only on the server.
6. Immediately redirect the browser to a clean URL that contains no code,
   state, token, or provider error secret.
7. Enumerate provider organizations attributable to the current authorization.
8. If more than one is eligible, show a concise selection/confirmation screen.
9. Read the exact provider organization and required capability evidence.
10. Show provider name, organization name, provider-owned ID suffix, base
    currency, Legal Entity, and permissions before activation.
11. Atomically activate the Accounting Destination Connection and record
    append-only evidence.
12. Run a read-only health and provider-native preview probe before the first
    Accounting Release can use the destination.

### Automatic token refresh

1. Load the current grant generation.
2. Acquire one short provider-grant refresh lease.
3. Reload the generation after acquiring the lease.
4. If another worker already promoted a usable generation, use it.
5. Otherwise perform exactly one provider-certified refresh request.
6. Encrypt and compare-and-swap the complete returned token set.
7. Record only redacted timing, generation, provider request ID, and outcome.
8. Wake waiting workers with the new generation.
9. On timeout or ambiguous response, use the provider's exact recovery rule:
   Xero's bounded old-token grace path where applicable; QBO reload/status
   classification and no concurrent second exchange.
10. Never expose a refresh button to ordinary staff.

A low-frequency liveness probe may keep an intentionally active connection
within the provider's rolling refresh-token window and discover revocation
before month-end. Its interval is provider-contract-owned, safely inside the
current inactivity window, quota-aware, and not tenant-configurable.

### Proof-gated reconnect

Reconnect always starts from the existing Accounting Destination Connection.
The UI states the expected organization before redirect:

> Reconnect **QuickBooks Online - Hope Mission (ending 6279)** for **Hope
> Mission US**. You will choose this same company in QuickBooks.

On callback:

- QBO requires exact stored `realmId` equality and a successful read against
  that realm.
- Xero requires the stored `tenantId` to appear in Connections for the current
  authorization event and a successful Organisation read against that tenant.
- required scopes and capability probes must pass;
- environment must match;
- the destination must still belong to the same tenant and Legal Entity;
- the initiating actor must still have permission; and
- pending provider operations must be reconciled before release.

Candidate credentials are staged encrypted and are not available to delivery
workers until all checks pass.

For Xero, candidate staging follows the shared-grant supersession fence above:
all destinations attached to that provider grant family are revalidated before
the new generation becomes available to delivery workers. A mismatch for the
initiating destination does not authorize a replacement, and a missing
previously connected tenant becomes its own exact authorization condition.

If the user authorized the wrong organization:

- do not mutate the current destination;
- do not show the wrong organization as connected;
- do not retry pending work;
- show expected and selected organizations without exposing secret IDs;
- offer **Try again**; and
- offer **Replace accounting destination** only to authorized staff.

### Explicit destination replacement

Replacement is rare and must not become a bureaucratic approval process. One
review screen shows:

- current and proposed provider organization;
- tenant and Legal Entity;
- base currency and environment;
- unreleased Accounting Releases;
- operations with unknown or accepted outcomes;
- mappings and Posting Profile that require revalidation;
- provider-native object references that remain tied to the old books;
- what stops, what remains available as artifacts, and what will resume; and
- the actor's exact requested action.

Replacement does not rewrite past Accounting Releases, artifacts, provider
readback, or reconciliation evidence. It creates a prospective destination
version. Unknown or accepted operations against the old destination are
resolved there; they are never blindly sent to the new destination.

### Disconnect and security revocation

**Disconnect this organization** is a secondary destructive action, not the
primary recovery action.

The confirmation states:

- no new direct provider operations will start;
- already accepted provider objects remain in QBO/Xero;
- generated artifacts and audit history remain available;
- queued Accounting Releases remain immutable but blocked from direct
  delivery;
- automatic token refresh stops for the affected scope;
- reconnect can restore the same destination; and
- provider revocation may be pending if the provider is unavailable.

On confirmation:

1. reauthorize the Asym actor;
2. set local quarantine atomically;
3. stop unreleased provider work at the destination fence;
4. reconcile in-flight and outcome-unknown operations;
5. invoke the narrowest provider disconnect/revocation action;
6. store provider evidence separately from local quarantine evidence; and
7. open one cause-owned exception only if provider confirmation or staff
   follow-up is required.

For Xero, ordinary tenant disconnect targets the exact connection ID rather
than revoking a token that may authorize several connections. Platform security
may perform broad revocation after calculating blast radius.

If compromise is suspected, local quarantine is immediate and cannot be
deferred. The secret/grant incident is routed to security operations; finance
sees a PII-minimized statement that the destination is safely paused.

### Provider outage recovery

Provider status APIs are cached operational signals. They influence retry
timing and incident grouping but never override destination evidence.

During a provider-wide OAuth or Accounting API outage:

- stop new direct calls to the affected provider component;
- preserve tenant-fair queues;
- continue source processing, Accounting Release preparation, immutable
  artifact creation, and unrelated providers/destinations;
- do not convert the selected delivery lane automatically;
- do not ask every tenant to reconnect;
- do not create one Mission Control task per operation;
- retain operation identities and ambiguity state;
- use provider `Retry-After` and bounded exponential backoff;
- resume only after provider status improves and a destination-specific
  authenticated probe succeeds; and
- read back outcome-unknown operations before any retry.

A provider outage may produce one platform incident plus destination-scoped
derived status. A tenant task exists only when the tenant must act.

### App client-secret lifecycle

The provider app client ID/secret belongs to Asym platform operations, not to a
tenant. It is stored in a managed secret service with:

- environment separation;
- least-privilege access;
- version identifiers;
- access auditing;
- no application-log exposure;
- deployment rollback material;
- documented emergency revocation; and
- a provider-certified rotation runbook.

Provider documentation reviewed here does not establish that both QBO and Xero
always permit two simultaneously active client secrets or that replacing a
secret preserves all token families. Asym must not assume either behavior.

Before each production rotation:

1. verify the provider's current client-secret capability;
2. prove the sequence in sandbox or an approved test app;
3. pause only the token-exchange seam if a single-secret cutover is required;
4. deploy code able to read the new secret version;
5. rotate the provider secret;
6. run token and read-only destination probes;
7. resume refresh and delivery;
8. revoke the old secret when provider capability permits; and
9. retain redacted evidence and rollback instructions.

This is an operator runbook, not a tenant workflow.

## UX and accessibility contract

### Connection card

Accounting settings show one card per Accounting Destination Connection:

- provider logo and full provider name;
- verified organization display name;
- Legal Entity;
- environment when not production;
- **Connected**, **Needs attention**, or **Disconnected** status with text and
  icon, never color alone;
- last provider verification time;
- exact scope/capability summary in progressive disclosure;
- queued/blocked release count when material;
- one primary next action; and
- an overflow menu for **View details**, **Reconnect**, **Replace
  destination**, and **Disconnect** as permitted.

Never show access tokens, refresh tokens, client secrets, authorization codes,
raw tenant IDs, or raw provider error payloads.

### Needs-attention copy

Copy is cause-specific:

- **QuickBooks is temporarily unavailable. No action is needed. We will try
  again.**
- **Reconnect QuickBooks to continue sending new accounting releases. Existing
  artifacts and accepted QuickBooks entries are unchanged.**
- **You connected a different QuickBooks company. Nothing was changed in Asym.**
- **Your Xero permissions no longer allow this posting plan. Ask a Xero
  administrator to reconnect.**
- **This Xero organization is connected, but its base currency no longer
  matches this Accounting Destination. Review before continuing.**

Do not say "token expired," "invalid_grant," "realm mismatch," or "401" in
primary staff copy. These remain available under **Technical details** with
provider request IDs and redacted evidence.

### Flow behavior

- Use a normal full-page redirect rather than a popup-only flow.
- Preserve the user's return route and unsaved non-secret UI context.
- Show the expected organization before leaving Asym.
- On return, move focus to the result heading.
- Announce success or error with a status message that does not steal focus.
- Provide a persistent error summary and field-level/actionable instructions.
- Do not rely on animation, toast-only feedback, or color.
- Preserve error text long enough to copy a support reference.
- At 200% zoom and narrow widths, use a stacked card and full-page detail rather
  than a clipped dialog or data grid.
- All actions are keyboard reachable, have visible focus, and meet WCAG 2.2
  target-size expectations.
- Destructive confirmation returns focus to the triggering control when
  canceled.
- Provider-denied consent, browser Back, callback expiry, and session expiry all
  return to a recoverable Asym page with **Try again**.

Relevant standards:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WCAG error prevention for financial actions](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)

## Edge-case catalog

The production design and tests must cover at least:

1. Two QBO workers try to refresh the same token generation concurrently.
2. A QBO refresh succeeds but the worker crashes before storing the response.
3. Intuit returns `invalid_grant` during a documented OAuth outage.
4. A stale worker retries with a QBO refresh token superseded by another worker.
5. A QBO access token expires during an operation.
6. The QBO user revoked access in QuickBooks.
7. The QBO refresh token was unused for 100 days.
8. The QBO refresh token reached its five-year hard limit.
9. The user reconnects the same QBO realm as a different QBO admin.
10. The user reconnects a different QBO realm with the same display name.
11. The QBO company name changes but `realmId` remains stable.
12. QBO returns company-subscription error `6190` with otherwise valid tokens.
13. QBO callback state is missing, expired, replayed, or belongs to another
    tenant.
14. The QBO authorization code appears in a URL that would otherwise load
    analytics or third-party scripts.
15. Xero refresh succeeds but the response is lost.
16. Xero old-token recovery occurs inside its 30-minute grace period.
17. The Xero grace period expires before recovery.
18. Two workers refresh the same Xero grant.
19. The same Xero bookkeeper connects organizations for two Asym tenants.
20. A new Xero auth flow supersedes the token set used by existing connections.
21. The latest Xero token can access several organizations.
22. `GET /connections` returns organizations from earlier auth events.
23. The expected organization is absent from the current `authEventId`.
24. The Xero connection ID changes while `tenantId` remains stable.
25. The Xero organization name changes while `tenantId` remains stable.
26. The authorizing Xero user loses permission, but another authorized user can
    reconnect the same tenant.
27. The Xero tenant is deleted or inactive.
28. Xero connection exists but the refresh token is unusable.
29. Xero token works but one required scope is missing.
30. Xero scope reduction requires revocation and new authorization.
31. A tenant clicks disconnect while the provider is unavailable.
32. A narrow Xero connection delete fails after local quarantine.
33. A broad Xero token revocation would affect multiple Asym destinations.
34. A staff member loses Asym permission while completing OAuth.
35. The tenant or Legal Entity is deactivated during OAuth.
36. The destination is replaced while an older reconnect callback is in flight.
37. Sandbox credentials or organization are returned to a production attempt.
38. Provider display fields are missing, duplicated, localized, or changed.
39. Provider base currency changes or disagrees with the destination contract.
40. An Accounting Release is queued before authorization loss.
41. A provider write was accepted immediately before authorization loss.
42. A provider write timed out and remains `Outcome unknown` through reconnect.
43. Provider status reports healthy while one tenant remains unauthorized.
44. Provider status reports an outage while one tenant probe still succeeds.
45. Xero returns `429` and `Retry-After`.
46. Provider `5xx` and network timeouts cause several retries across workers.
47. A client-secret rotation begins while token refreshes are active.
48. A new client secret fails and the old provider secret is already disabled.
49. A leaked token is found in a log, error tracker, or support attachment.
50. Database restoration revives an old encrypted refresh-token generation.
51. KMS access is unavailable while provider credentials remain otherwise
    valid.
52. The provider revocation response is ambiguous.
53. The same callback is submitted twice.
54. Browser Back returns to a completed OAuth transaction.
55. A screen-reader user returns from provider consent to a result that is only
    conveyed by toast or color.
56. A mobile browser loses the original tab during provider consent.
57. A reconnect is completed after its expected-organization contract changed.
58. One global outage would otherwise create thousands of tenant tasks.
59. A liveness probe approaches Xero or QBO rate limits.
60. App certification or connection-tier limits prevent new tenant activation.

## Adversarial risk matrix

| Category                    | Concern? | What could go wrong                                                                                                                                               | Why it matters                                                                                    | Severity | Likelihood     | Permanent control                                                                                                                                                   |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                 | Yes      | One generic refresh, reconnect, or revoke path assumes QBO and Xero share token and connection semantics.                                                         | Ideal-case code fails during ordinary rotation, multi-org, revocation, and outage conditions.     | Critical | High           | Provider-specific lifecycle contracts behind one bounded product vocabulary; exact provider fixtures and capability certification.                                  |
| Technical debt              | Yes      | Tokens, organization bindings, task state, and provider health are collapsed into one mutable `connected` record.                                                 | Every future provider change requires risky migrations and creates contradictory truth.           | High     | High           | Separate Provider Authorization Grant, Accounting Destination Connection, append-only evidence, and derived UX status; no generic secrets platform.                 |
| Edge cases                  | Yes      | Concurrent refresh, lost responses, stale callbacks, shared Xero grants, wrong organizations, and in-flight writes race.                                          | Working credentials can be revoked or postings can reach the wrong books.                         | Critical | High           | Refresh lease plus CAS generation, one-time callback state, staged candidates, exact-org proof, readback before retry, and complete fixture catalog.                |
| Footguns                    | Yes      | "Reconnect" silently replaces the destination; "Disconnect" broadly revokes several Xero connections; staff manually mark healthy.                                | One click can stop unrelated tenants or redirect financial postings.                              | Critical | Medium-High    | Repair-first reconnect, separate replacement, least-blast-radius disconnect, consequence preview, current authorization, and no manual health toggle.               |
| Tenant safety               | Yes      | A token or Xero tenant ID is paired with the wrong Asym tenant or Legal Entity.                                                                                   | Cross-tenant financial data exposure and wrong-books posting are catastrophic.                    | Critical | Low-Medium     | Server-derived tenant/entity scope, composite tenant-safe references, explicit provider context on every call, no ambient tenant IDs, and negative isolation tests. |
| Over-engineering            | Yes      | Asym builds a generic identity provider, vault product, approval engine, or per-provider custom UI maze.                                                          | Complexity obscures the few controls that actually prevent financial harm.                        | High     | Medium-High    | Four bounded concepts, three calm visible statuses, provider adapters only where semantics differ, and operator-only client-secret runbook.                         |
| UX/UI and friction          | Yes      | Raw OAuth errors, popups, repeated consent, unclear expected company, or hidden disconnect consequences confuse staff.                                            | Staff may connect the wrong organization or abandon recovery during close.                        | High     | High           | Same-tab repair flow, expected-org preview, plain-language cause copy, one primary action, clean callback URL, accessible result, and progressive technical detail. |
| Hidden coupling             | Yes      | Task completion, status-page health, token presence, or display-name equality is treated as provider authorization truth.                                         | A secondary signal can falsely release accounting work.                                           | Critical | Medium         | Cause-owned proof predicate; task and status page are follow-up/operational evidence only; exact provider ID and live capability probe own activation.              |
| Failure modes               | Yes      | Refresh or revoke succeeds remotely but Asym loses the response; local disconnect succeeds while provider revoke fails; client-secret rotation partially deploys. | Retrying or reporting the wrong outcome can compromise credentials or duplicate work.             | Critical | Medium-High    | Append-only phase evidence, ambiguity states, local quarantine, provider-specific recovery, outbox/CAS, rotation drill, and truthful UI.                            |
| Data integrity              | Yes      | Old token generations are restored, multiple current grants exist, accepted operations are retried, or destination history is overwritten.                        | Provider and Asym evidence diverge and audit cannot reconstruct events.                           | Critical | Medium         | Monotonic generations, unique current grant, backup-restore quarantine, immutable destination versions, exact operation identities, and readback.                   |
| Security and privacy        | Yes      | Tokens, codes, client secrets, tenant identifiers, or provider payloads leak to logs, URLs, analytics, tasks, or support.                                         | Bearer credential theft can expose or alter financial books.                                      | Critical | Medium         | Managed encryption, least privilege, clean callback redirect, log redaction, no browser storage, secret scanning, purpose-scoped evidence, and incident revocation. |
| Scalability and performance | Yes      | One grant is refreshed by many workers; liveness probes exhaust quotas; a global outage creates tenant retry and task storms.                                     | Seasonal posting and month-end recovery stall across tenants.                                     | High     | High           | Single-flight refresh, cached grants, quota-aware probes, provider circuit breakers, tenant-fair queues, `Retry-After`, and incident deduplication.                 |
| Operational burden          | Yes      | Staff must understand token lifetimes, monitor provider status, rotate credentials, or repeatedly reconnect transient outages.                                    | First-class integration becomes a fragile manual service.                                         | High     | Medium-High    | Automatic provider-native rotation/recovery, exception-only notifications, early expiry handling, operator runbooks, and tenant action only when proven necessary.  |
| Observability gaps          | Yes      | Refresh races, reconnect mismatch, revocation pending, shared-grant blast radius, or outage recovery is invisible.                                                | Security and finance cannot distinguish waiting, broken, compromised, or wrong-target conditions. | High     | Medium         | Structured redacted events, provider request IDs, generation-conflict metrics, mismatch/revocation queues, last verified time, and destination-specific probes.     |
| Dependency and integration  | Yes      | Provider lifetimes, limits, scopes, app tiers, review rules, or secret behavior change.                                                                           | A previously safe connection can become noncompliant or fail without code changes.                | High     | High over time | Versioned provider capability registry, official-doc revalidation, contract tests, app-tier monitoring, release-note ownership, and fail-closed unknown behavior.   |
| Migration and upgrade       | Yes      | A token-schema or encryption-key migration invalidates credentials or binds grants incorrectly.                                                                   | All tenants may require avoidable reauthorization or face cross-tenant risk.                      | Critical | Medium         | Envelope-encrypted versioned token format, online migration with read-old/write-new, restore quarantine, sampled provider probes, and rollback rehearsal.           |
| Other development hazards   | Yes      | Clock skew, DST, callback replay, stale authorization, KMS outage, deployment version skew, and partial rollback violate lifecycle invariants.                    | Failures can be silent and difficult to reproduce.                                                | Critical | Medium         | Server time, one-time TTL state, backward-compatible workers, generation fencing, chaos tests, clock/KMS faults, deployment gates, and explicit ownership.          |

## Ruthless synthesis

### What must be built first

1. **Exact authority boundary**
   - Provider Authorization Grant and Accounting Destination Connection are
     separate.
   - Exact provider organization ID is immutable identity.
   - Display fields are recognition evidence only.

2. **Secure callback and same-organization proof**
   - one-time server-side state;
   - exact redirect;
   - server code exchange;
   - PKCE when supported;
   - clean post-callback URL;
   - exact QBO realm/Xero tenant equality;
   - live organization and capability probe; and
   - staged promotion.

3. **Serialized provider-native token lifecycle**
   - grant-scoped lease;
   - token-generation CAS;
   - provider-specific lost-response recovery;
   - encrypted storage;
   - no refresh button; and
   - provider-contract liveness probe.

4. **Separate repair, replacement, and revocation**
   - reconnect repairs only the expected destination;
   - replacement is prospective and explicit;
   - disconnect uses minimum provider blast radius;
   - local quarantine is immediate;
   - provider confirmation remains independently truthful.

5. **Accounting-safe recovery**
   - authorization loss blocks only exact direct-delivery work;
   - artifacts continue;
   - accepted and unknown operations retain their original destination;
   - readback precedes retry;
   - outages do not create reconnect storms; and
   - D13 cases and Mission Control follow-up remain independent.

6. **Quiet staff experience**
   - one card;
   - three visible statuses;
   - one primary next action;
   - expected organization before provider handoff;
   - plain-language result on return;
   - progressive technical evidence; and
   - no routine token concepts exposed.

### What must not be built

- tenant-pasted QBO or Xero OAuth tokens;
- tenant-visible app client secrets;
- manual token rotation;
- a generic OAuth broker for hypothetical providers;
- organization matching by name, email, tax number, or user;
- reconnect that can replace a destination;
- a staff-editable "connected" or "healthy" flag;
- blind retry after authorization loss;
- automatic lane conversion from direct integration to artifact import;
- one connection/task per affected Accounting Release during an outage;
- provider status-page health as destination proof;
- broad Xero token revocation for an ordinary one-organization disconnect;
- a second task, incident, comment, or notification system; or
- token payloads in general audit logs.

## Production gates

Phase 20 direct QBO/Xero authorization is not production-ready until every gate
passes.

### Provider readiness

- QBO production credentials and required review obligations are satisfied.
- Xero app tier/certification and connection capacity support forecast pilot
  and seasonal volume.
- Required scopes are documented and least-privilege reviewed.
- Current provider token lifetimes, revocation semantics, limits, and status
  endpoints are reverified.
- Connect, disconnect, reconnect, and wrong-company flows pass in supported
  provider sandboxes/test organizations.

### OAuth security

- state missing, mismatch, expiry, replay, cross-session, cross-tenant, and
  cross-provider tests fail closed.
- Authorization codes are exchanged once on the server and immediately removed
  from the browser URL.
- Redirect URI matching and environment isolation are exact.
- PKCE behavior is tested wherever provider/client support exists.
- Tokens and secrets do not appear in browser storage, HTML, URLs, logs,
  analytics, error trackers, traces, notifications, tasks, or support exports.
- KMS access and encryption-key rotation are audited and tested.
- Current Asym authorization and role checks occur both before redirect and
  before candidate promotion.

### Token lifecycle

- QBO concurrent-refresh tests prove only one exchange occurs.
- QBO stale-generation and `invalid_grant` outage classification pass.
- Xero concurrent-refresh and 30-minute lost-response recovery pass.
- Xero same-user/multiple-organization token supersession tests pass.
- Monotonic token-generation and rollback fencing pass.
- Idle-connection liveness probes remain within quota and refresh windows.
- Database restore cannot reactivate an old token generation without
  revalidation.

### Same-organization and tenant safety

- wrong QBO realm never mutates the existing destination.
- wrong Xero tenant never mutates the existing destination.
- display-name collisions and renames do not affect identity.
- a different provider user can reconnect the same exact organization when
  provider authorization permits it.
- explicit tenant, Legal Entity, provider, environment, and destination context
  is required for every provider call.
- cross-tenant grant/destination/task/evidence link attempts fail at database
  and service boundaries.
- Xero shared-grant tests prove no tenant can enumerate, operate on, or revoke
  another tenant's destination.

### Accounting recovery

- queued releases remain immutable during authorization loss.
- accepted operations are never resent.
- outcome-unknown operations require readback.
- reconnect does not change the original destination of an existing operation.
- replacement creates a prospective destination version.
- provider outage does not auto-switch delivery lanes.
- unrelated Legal Entities, tenants, providers, and artifact generation
  continue.

### Disconnect and incident recovery

- local quarantine works while provider APIs are down.
- UI distinguishes local quarantine, revocation pending, confirmed revocation,
  and unknown revocation outcome.
- Xero narrow connection deletion and broad token revocation have separate
  tested actions and previews.
- suspected compromise triggers immediate quarantine and security routing.
- provider-wide outage produces one deduplicated incident rather than
  per-operation tasks.
- provider recovery requires an authenticated destination probe.

### UX and accessibility

- finance staff can identify the provider organization and Legal Entity without
  technical IDs.
- users reliably choose the expected organization in moderated tests.
- wrong-organization recovery requires no support intervention.
- connect/reconnect works on mobile, keyboard only, screen reader, browser Back,
  expired session, denied consent, and 200% zoom.
- status and results are not color- or toast-only.
- destructive actions show exact consequences and support cancel/return focus.
- technical evidence is discoverable without dominating the default surface.

### Observability and operations

- dashboards expose refresh success/failure by cause, lease conflict, token
  generation, last verified time, reconnect mismatch, revocation pending,
  provider outage, quota delay, and shared-grant fanout.
- logs retain QBO `intuit_tid`, Xero correlation/request evidence when
  available, operation identity, and redacted sequence without tokens or
  provider financial payloads.
- alerts distinguish platform-wide outage from tenant action required.
- client-secret rotation, emergency revocation, KMS outage, rollback, and
  backup restore are rehearsed.
- runbooks have named security, platform, finance-operations, and provider-app
  compliance owners.

## Ratified founder decision

The founder ratified:

> **C-prime-amended-and-hardened (C-prime-R) - one exact, provider-native
> authorization lifecycle separating encrypted Provider Authorization Grants
> from tenant- and Legal-Entity-scoped Accounting Destination Connections;
> with serialized rotation, same-organization proof-gated reconnect, explicit
> prospective destination replacement, least-blast-radius disconnect,
> immediate local quarantine, outage-aware automatic recovery, artifact-always
> continuity, append-only evidence, and one quiet accessible staff surface.**

This is the smallest design that safely supports first-class QBO and Xero
connections without making Asym an identity provider, secrets-management
product, or accounting system.
