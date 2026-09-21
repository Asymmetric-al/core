# Delta for Platform Surfaces

## ADDED Requirements

### Requirement: Multi-Site Management Lives In Staff Surfaces While Donor Accounts Stay Tenant-Wide

Mission Control and Web Studio MUST present one connected Site-management
experience: Mission Control owns operational Site, domain, locale, currency,
availability, and owner-status work; Web Studio owns Site presentation and
content authoring through Payload. Cross-surface links MUST preserve exact
Tenant/Site context and authorization without duplicating source-owned settings,
readiness, lifecycle, or audit truth.

The authenticated Donor Portal MUST remain Tenant-wide with one Tenant Donor
Account Brand and, for each activated Tenant/environment, exactly one verified
Tenant-controlled host. Entry Site MAY provide validated secondary attribution
or a return action but MUST NOT create a Site-specific account, fragmented
history, or authorization boundary. Public Site and Giving surfaces MAY use
exact Site Brand and locale context while preserving one shared Tenant-wide
checkout product structure.

#### Scenario: Staff moves from Site readiness to content repair

- GIVEN a Site Locale blocker belongs to a Page or Navigation owner
- WHEN authorized staff follows the Site workspace action
- THEN Web Studio opens the exact Tenant/Site/locale/source context
- AND the Site surface retains no copied configuration or repair authority

#### Scenario: A donor enters account history from a regional Site

- WHEN a donor follows the validated account action
- THEN that environment's one Tenant portal host and the Tenant Donor Account
  Brand render all authorized cross-Site history
- AND the regional Site does not reskin, partition, or authorize the account
