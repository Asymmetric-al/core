# Delta for Platform Surfaces

## ADDED Requirements

### Requirement: Multi-Site Management Lives In Staff Surfaces While Donor Accounts Stay Tenant-Wide

Mission Control and Web Studio MUST present one connected Site-management experience: Mission Control owns operational Site, domain, locale, currency, availability, and owner-status work; Web Studio owns Site presentation and content authoring through Payload.

Every clause in `openspec/contracts/platform-surfaces.md#contract-dcc8f4ecc746abb36547` MUST apply without exception.

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
