# Delta for Platform System Boundaries

## ADDED Requirements

### Requirement: Document Production Consumes Domain-Owned Contexts

Statement Studio MUST remain a document production subsystem rather than a
competing operational truth store. Giving, CRM, Missionary, Reports, Events,
Care, Tasks, Legal/Signing, and CMS MUST retain ownership of their source facts,
authorization, redaction, and versioned render-context builders.

Production document routes MUST resolve those contexts server-side through the
owning domain. App-level routes SHOULD remain thin delegates to shared server
modules.

#### Scenario: A care packet requests private notes

- GIVEN the Care domain has not authorized and redacted the requested notes
- WHEN Statement Studio receives a packet render request
- THEN it cannot query or include the private notes itself
- AND the request remains blocked until Care returns an approved context

#### Scenario: CMS supplies document branding

- GIVEN CMS exposes approved tenant branding or published content
- WHEN Statement Studio renders a document
- THEN it may consume that approved content through a render-safe adapter
- AND CMS does not supply contribution, receipt, or other operational truth

### Requirement: Generated Document Access Follows Surface Roles

Mission Control MUST own staff document administration and operational depth.
Donor and missionary surfaces MUST expose only recipient/subject-authorized
artifacts through their own BFF boundaries. A shared artifact table or Storage
bucket MUST NOT collapse those surface roles.

#### Scenario: Missionary portal requests a monthly statement

- WHEN an authenticated missionary requests a statement
- THEN the missionary BFF verifies the artifact's tenant and authorized
  missionary subject
- AND does not expose tenant-wide Statement Studio administration or artifacts
