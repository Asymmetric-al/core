# Destination-pinned provider-native authorization lifecycle

**Status:** Accepted (founder ruling, Phase 20 grill session — D14)

Phase 20 separates each stable, tenant- and Legal-Entity-scoped **Accounting
Destination Connection** from its replaceable, encrypted **Provider
Authorization Grant**. Every provider call remains pinned to the exact QBO
`realmId` or Xero `tenantId` and environment; reconnect may repair only that
same organization, while another organization requires a prospective
destination replacement that preserves prior Accounting Releases and provider
evidence.

Credential rotation follows each provider's actual grant semantics. QBO grants
are normally company-scoped, while one Xero user/app grant may authorize
several exact organization connections and a broad token revocation can remove
all of them. Asym therefore serializes grant rotation, fences stale workers,
uses the narrowest provider disconnect, quarantines new direct work before
remote revocation, keeps artifact delivery available, and exposes one quiet
connection surface rather than a generic OAuth or secrets product.
