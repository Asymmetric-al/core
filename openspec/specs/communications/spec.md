# communications Specification

## Purpose

Define the current communications tooling for SendGrid email delivery plus the shared Unlayer-based Email Studio and PDF Studio editors in the admin app.

## Requirements

### Requirement: SendGrid validation is performed with a per-request API key

The SendGrid service SHALL validate email configuration using the API key supplied for the current operation instead of relying on a global process-wide tenant secret.

#### Scenario: API key format is invalid

- **WHEN** `validateSendGridApiKey()` receives a missing value or a value that does not start with `SG.`
- **THEN** it returns `valid: false`
- **AND** it reports the `invalid_api_key` error code

#### Scenario: API key is valid and has mail send permission

- **WHEN** `validateSendGridApiKey()` successfully reads SendGrid scopes
- **AND** the key includes the `mail.send` permission
- **THEN** it returns `valid: true`
- **AND** it includes the resolved scopes, verified sender identities, domain authentication state, and deliverability warnings

#### Scenario: API key is valid but lacks mail send permission

- **WHEN** `validateSendGridApiKey()` resolves scopes that do not include `mail.send`
- **THEN** it returns `valid: false`
- **AND** it reports the `forbidden` error code

### Requirement: SendGrid delivery uses explicit sender metadata and returns traceable result data

The SendGrid service SHALL send mail with caller-provided sender data and SHALL return structured send results.

#### Scenario: Sending a general email

- **WHEN** `sendEmail()` is called with a valid API key, recipients, sender, subject, and HTML body
- **THEN** it submits the message through SendGrid
- **AND** it returns `success: true` with a correlation identifier

#### Scenario: Sending a connection test email

- **WHEN** `sendTestEmail()` is called with a valid API key, recipient address, and verified sender information
- **THEN** it sends a branded connection-test email
- **AND** it disables open and click tracking for that test message

### Requirement: Unlayer account configuration controls editor capability flags

The shared studio configuration SHALL derive setup state from environment variables and expose capability flags accordingly.

#### Scenario: Unlayer project is not configured

- **WHEN** `NEXT_PUBLIC_UNLAYER_PROJECT_ID` is absent or invalid
- **THEN** `getUnlayerAccountConfig()` reports `isConfigured: false`
- **AND** the studio setup status reports free-mode messaging

#### Scenario: Unlayer project and white-label mode are configured

- **WHEN** a valid Unlayer project ID is present
- **AND** `NEXT_PUBLIC_UNLAYER_WHITE_LABEL` is enabled
- **THEN** account configuration reports `isConfigured: true`
- **AND** the derived studio features enable white-label-only capabilities such as AI assistant and custom fonts

### Requirement: Email Studio wraps the shared Unlayer editor in email mode

The admin Email Studio page SHALL provide a shared Unlayer editor configured for email composition with preview and HTML export controls.

#### Scenario: Email Studio loads

- **WHEN** `/email` renders in the admin app
- **THEN** it mounts the shared `UnlayerEditor` in `email` mode
- **AND** it shows Email Studio setup status in the header

#### Scenario: HTML export is requested from Email Studio

- **WHEN** the editor is ready and the user triggers HTML export
- **THEN** the page calls the shared editor `exportHtml()` handle
- **AND** it opens a dialog that exposes the generated HTML for copy or download

#### Scenario: Email Studio save is requested

- **WHEN** the user triggers save in Email Studio
- **THEN** the page opens a template metadata dialog for name, subject, and preheader
- **AND** the current implementation completes the save flow client-side without a canonical backend persistence contract

### Requirement: PDF Studio wraps the shared Unlayer editor in document mode

The admin PDF Studio page SHALL provide the shared Unlayer editor in document mode with PDF and HTML export controls.

#### Scenario: PDF Studio loads

- **WHEN** `/pdf` renders in the admin app
- **THEN** it mounts the shared `UnlayerEditor` in `document` mode
- **AND** it shows PDF Studio setup status in the header

#### Scenario: PDF export is requested from PDF Studio

- **WHEN** the editor is ready and the user triggers PDF export
- **THEN** the page calls the shared editor `exportPdf()` handle
- **AND** it opens the returned PDF URL when Unlayer provides one

#### Scenario: PDF Studio save is requested

- **WHEN** the user triggers save in PDF Studio
- **THEN** the page collects template metadata such as category, page size, and orientation
- **AND** it attempts to persist through `/api/pdf-templates`
- **AND** that route contract is not currently implemented in this repository
