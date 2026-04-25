# Delta for Document Template Data Binding

## ADDED Requirements

### Requirement: Typed Variable Registry

The document template system SHALL provide a typed variable registry for all
variables exposed to templates.

Each variable definition SHALL include a stable key, display name, group, type,
required flag, formatter, fallback policy, sample value, and allowed template
contexts.

#### Scenario: Staff inserts a donor name variable

- GIVEN a staff user is editing a donor letter template
- WHEN they search for the donor full name variable
- THEN the editor shows a typed variable definition from the registry
- AND inserting the variable creates a safe variable chip rather than raw
  unchecked text

#### Scenario: Variable key is removed from the registry

- GIVEN a published template references a variable that is later deprecated
- WHEN staff edit or validate the template
- THEN the system reports the deprecated variable reference
- AND it does not silently replace the value with unrelated data

### Requirement: Merge Tag Domains Preserve Current PDF Studio Knowledge

The variable registry SHALL preserve current PDF Studio merge tag domains for
`organization`, `recipient`, `donation`, `document`, `missionary`, and
`tax_receipt`.

The registry SHALL add first-class domains for `financial_report`, `statement`,
and `invoice` as needed for reports, annual giving statements, and billing
documents.

#### Scenario: Legacy receipt merge tags are represented

- GIVEN a legacy PDF Studio tax receipt uses organization, recipient, donation,
  document, missionary, and tax receipt merge tags
- WHEN a native template is rebuilt
- THEN equivalent typed variable domains are available in the builder
- AND staff do not need to invent custom variables for core receipt data

#### Scenario: Financial report variables are needed

- GIVEN a finance user creates a financial report template
- WHEN they browse variables
- THEN financial report and statement variables are available as first-class
  groups
- AND the user can bind report periods, funds, balances, totals, and line item
  rows without abusing donation-only tags

### Requirement: Variable Chips Are Safe Editor Elements

The editor SHALL represent variables as safe variable chips backed by typed
definitions. Variable chips SHALL keep display labels, stable keys, formatter
settings, and fallback settings visible or inspectable.

The system MUST NOT require staff to type raw template syntax for normal
variable insertion.

#### Scenario: Staff changes a variable fallback

- GIVEN a donor address variable can be missing for some records
- WHEN staff selects the variable chip and sets a fallback value
- THEN the fallback policy is stored with the chip or binding
- AND preview uses the fallback when sample data lacks the address

#### Scenario: Raw unsupported merge tag is pasted

- GIVEN staff paste text containing an unsupported merge tag
- WHEN the editor parses the content
- THEN the system flags the unsupported tag for review
- AND it does not treat it as a trusted typed variable

### Requirement: Required Variables And Missing Data Are Validated

The data binding system SHALL support required variables and missing variable
validation before publish, preview, and production rendering.

Production rendering SHALL fail affected documents when required data is
missing, unless an explicit approved fallback policy applies.

#### Scenario: Tax receipt lacks receipt number

- GIVEN a tax receipt template marks receipt number as required
- WHEN production rendering is requested without a receipt number
- THEN the render is blocked for that document
- AND the error identifies the missing required variable

#### Scenario: Optional missionary location is missing

- GIVEN a missionary report template includes an optional missionary location
  variable with fallback text
- WHEN preview data lacks the location
- THEN preview uses the configured fallback
- AND validation does not block publish for that optional variable

### Requirement: Formatting Is Structured And Locale-Aware

The data binding system SHALL provide structured formatting for currency,
dates, numbers, percentages, addresses, receipt ids, document numbers, fiscal
periods, and tax periods.

Formatters SHALL be explicit in template bindings so production documents do
not depend on ad hoc string formatting in source data.

#### Scenario: Donation amount is formatted as currency

- GIVEN a donation line item includes a numeric amount
- WHEN the amount is rendered in a receipt
- THEN the selected currency formatter produces the configured display format
- AND the original numeric value remains available for totals validation

#### Scenario: Annual statement period is formatted

- GIVEN an annual giving statement covers January 1 through December 31, 2025
- WHEN the statement period variable is rendered
- THEN the formatter produces the configured fiscal or calendar period display
- AND the same date range is used for donation selection and totals

### Requirement: Conditional Sections Use Structured Rules

The data binding system SHALL support conditional sections driven by structured
rules, not arbitrary unsafe code.

Conditional rules SHALL support presence checks, equality checks, numeric
comparisons, boolean checks, and approved enum values.

#### Scenario: Goods and services language changes

- GIVEN a tax receipt template includes separate language for gifts with and
  without goods or services
- WHEN the resolved data includes a goods/services value greater than zero
- THEN the matching conditional section renders the correct tax language
- AND the non-matching section is omitted

#### Scenario: Conditional rule references unknown variable

- GIVEN a conditional section references a variable not present in the registry
- WHEN staff attempts to publish the template
- THEN publish validation fails
- AND the invalid conditional rule is identified

### Requirement: Repeaters Render Data Arrays

The data binding system SHALL support repeatable data sections for donations,
invoice line items, report rows, missionary support rows, and other approved
data arrays.

Repeaters SHALL define item variables, empty states, sorting, grouping where
applicable, and page-safe rendering hints.

#### Scenario: Annual statement lists donation line items

- GIVEN a donor has multiple gifts in the statement period
- WHEN the annual statement renders the donation repeater
- THEN each gift appears as a line item with date, designation, amount, and
  receipt reference where configured
- AND totals use the same resolved line items

#### Scenario: Repeater data is empty

- GIVEN a report template includes a repeater for restricted fund activity
- WHEN the selected dataset has no rows
- THEN the configured empty state renders
- AND the system does not produce a misleading blank table

### Requirement: Financial Tables Are First-Class Bindings

The data binding system SHALL support data-bound financial tables with
grouping, totals, subtotals, formatting, empty states, summary rows, and
page-safe rendering.

Financial reports and annual giving statements SHALL be first-class use cases,
not custom one-off template hacks.

#### Scenario: Financial report groups rows by fund

- GIVEN a financial report template contains a table grouped by fund
- WHEN the renderer resolves report rows
- THEN rows are grouped by fund with subtotals per group
- AND the report includes configured grand totals

#### Scenario: Annual statement totals mismatch

- GIVEN donation line items sum to a different amount than the supplied annual
  total
- WHEN production rendering validates the annual statement
- THEN the document fails validation
- AND the system reports a totals mismatch rather than silently generating an
  incorrect donor statement

### Requirement: Computed Values Are Deterministic

The data binding system SHALL support computed values such as totals,
subtotals, deductible amounts, balances, fiscal period labels, and summary
rows.

Computed values SHALL be deterministic from the resolved dataset and SHALL be
recorded in the render data snapshot or metadata where needed for audit.

#### Scenario: Tax-deductible amount is computed

- GIVEN a receipt includes total contributions and goods/services value
- WHEN the resolver computes tax-deductible amount
- THEN the computed value equals contributions minus goods/services value
- AND the calculation is available for render validation and audit

#### Scenario: Carry-forward row is needed

- GIVEN a report table spans pages and requires carry-forward summaries
- WHEN the renderer computes page-safe summary rows
- THEN the summary rows use the resolved table data
- AND the PDF does not invent totals independently from the data snapshot

### Requirement: Sample And Real Record Preview

The data binding system SHALL support sample data preview and real authorized
record preview.

Real record preview SHALL enforce tenant and role permissions and SHALL not
expose donor, missionary, or financial data to unauthorized users.

#### Scenario: Staff previews with sample donor data

- GIVEN staff are designing an annual statement
- WHEN they select sample preview
- THEN the system resolves variables, repeaters, conditionals, and totals using
  safe sample donor data
- AND no real donor data is required for the preview

#### Scenario: Unauthorized user previews real donor record

- GIVEN a user lacks permission to view a donor's financial records
- WHEN they request real record preview for that donor
- THEN the system denies the preview
- AND no donor financial data is exposed

### Requirement: Publish Validation Covers Bindings

The data binding system SHALL validate variables, repeaters, conditionals,
formatters, computed values, financial tables, sample data, and required real
data contexts before a template can be published.

Publish validation SHALL produce actionable errors and warnings for staff.

#### Scenario: Template contains invalid table binding

- GIVEN a financial report template has a data table bound to an unknown report
  row collection
- WHEN staff attempts to publish the template
- THEN publish validation fails
- AND the error identifies the invalid table binding

#### Scenario: Template passes binding validation

- GIVEN a donation receipt template uses only valid variables, conditionals,
  formatters, and sample data
- WHEN staff validates the template for publish
- THEN binding validation passes
- AND the template can proceed to DocRaptor preview validation
