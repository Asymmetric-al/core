# Delta for Platform Product Intent

## ADDED Requirements

### Requirement: Tenant-Facing Surfaces Live Only On Tenant-Owned Names

Every tenant-facing surface SHALL be served only on names the Tenant owns and Core has verified, with no Asym address on any tenant-facing path or as a required dependency; a name is verified before the Tenant's experience goes live, and dashboard paths are not security boundaries.

#### Scenario: An organization's website and dashboards share its own domain

- GIVEN a Tenant has a ready, activated home domain `ministry.org`
- WHEN a visitor, a donor, a missionary and a staff member each use the platform
- THEN the website, the donor account, the missionary workspace and Mission
  Control are each reached on `ministry.org`, the signed-in areas under paths
- AND sign-in, registration, recovery, mail links, API calls and assets work
  without any Asym address in the browser or as a required dependency

#### Scenario: A Tenant has no verified name yet

- GIVEN a provisioned Tenant whose own names have not passed Core's verification
- WHEN anyone tries to reach that Tenant's website or dashboards
- THEN nothing of that Tenant is served on any address
- AND no Asym-domain address is offered as a stand-in

#### Scenario: A Tenant loses its domain

- GIVEN a Tenant's home domain lapses or stops pointing to the platform
- WHEN visitors and signed-in people try to reach it
- THEN Core serves nothing private and issues no new links for that name
- AND no visitor is redirected to an Asym address

#### Scenario: A script runs on a public page of the same domain

- GIVEN a staff member is signed in on `ministry.org/admin`
- WHEN a page of the public website on `ministry.org` runs a script
- THEN authorization still comes only from the person's membership and the
  database's checks, never from the path the request names
- AND the controls that contain a same-domain script (a session cookie that page
  scripts cannot read, a content security policy, fresh proof for sensitive
  acts) apply on every page
