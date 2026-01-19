# PDF Studio

A professional drag-and-drop document editor powered by Unlayer, optimized for creating PDF documents like tax receipts, donation statements, and letters.

## Overview

PDF Studio provides a visual document builder using Unlayer's `displayMode: 'document'` configuration. It enables non-technical users to design professional PDF templates that can be populated with dynamic data via merge tags.

## Current Implementation Status

| Feature                    | Status   | Location                                         |
| -------------------------- | -------- | ------------------------------------------------ |
| Unlayer Editor Integration | Complete | `src/components/studio/UnlayerEditor.tsx`        |
| PDF Studio Page            | Complete | `src/app/(admin)/mc/pdf/page.tsx`                |
| Configuration System       | Complete | `src/config/pdf-studio.ts`                       |
| Type Definitions           | Complete | `src/types/pdf-studio.ts`                        |
| Setup Status Component     | Complete | `src/components/studio/PDFStudioSetupStatus.tsx` |
| HTML Export                | Complete | Via `exportHtml()` method                        |
| PDF Export                 | Complete | Via `exportPdf()` method (requires project ID)   |
| Template Save (API)        | Complete | `src/app/api/pdf-templates/route.ts`             |
| Template CRUD              | Complete | Create, Read, Update, Delete                     |
| Database Storage           | Complete | `pdf_templates` table in Supabase                |
| Template Categories        | Complete | Tax receipt, donation receipt, statements, etc.  |
| Page Size Options          | Complete | Letter, A4, Legal                                |
| Orientation Options        | Complete | Portrait, Landscape                              |

---

## Architecture

### Component Hierarchy

```
PDFStudio (page.tsx)
├── PDFStudioSetupStatus
├── Header (toolbar)
│   ├── Undo/Redo controls
│   ├── Preview toggle (desktop/mobile)
│   ├── Export dropdown (PDF/HTML)
│   └── Save button
└── UnlayerEditor (mode="document")
    └── react-email-editor (EmailEditor)
```

### File Structure

```
src/
├── app/(admin)/mc/pdf/
│   └── page.tsx                    # PDF Studio page
├── app/api/pdf-templates/
│   ├── route.ts                    # List & Create templates
│   └── [templateId]/route.ts       # Get, Update, Delete template
├── components/studio/
│   ├── UnlayerEditor.tsx           # Core editor wrapper
│   └── PDFStudioSetupStatus.tsx    # Setup status badge
├── config/
│   └── pdf-studio.ts               # Configuration & constants
└── types/
    └── pdf-studio.ts               # TypeScript definitions
```

---

## Tenant Setup Guide

### Prerequisites

1. **Unlayer Account** - Required for PDF export functionality
2. **Supabase** - Required for template storage (already configured)

### Step 1: Unlayer Configuration

#### Free Mode Limitations

PDF Studio works in free mode with limitations:

- Drag-and-drop editor works
- HTML export works
- **PDF export requires a configured Unlayer project ID**

#### Configuring for PDF Export (Required)

1. Create account at [dashboard.unlayer.com](https://dashboard.unlayer.com)
2. Create a new project (select "Document" as project type)
3. Copy your Project ID from Project > Settings
4. Add to `.env.local`:

```bash
# Unlayer Project ID (numeric) - REQUIRED for PDF export
NEXT_PUBLIC_UNLAYER_PROJECT_ID=123456
```

5. Add production domain to allowed list:
   - Developer > Builder > Settings > Allowed Domains

> **Important**: The same Unlayer project ID is shared between Email Studio and PDF Studio. You only need one project configured.

### Step 2: Database Setup

The `pdf_templates` table should already exist in Supabase. If not, create it:

```sql
CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  design JSONB NOT NULL,
  html TEXT,
  thumbnail TEXT,
  category TEXT DEFAULT 'custom',
  tags TEXT[],
  page_size TEXT DEFAULT 'Letter',
  orientation TEXT DEFAULT 'portrait',
  margins JSONB DEFAULT '{"top": 72, "right": 72, "bottom": 72, "left": 72}',
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pdf_templates_tenant ON pdf_templates(tenant_id);
CREATE INDEX idx_pdf_templates_category ON pdf_templates(category);
CREATE INDEX idx_pdf_templates_status ON pdf_templates(status);
```

### Step 3: Branding Configuration

```bash
# .env.local

# Organization name (used in merge tags)
NEXT_PUBLIC_BRAND_NAME=YourOrganization

# Primary brand color (hex)
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#0f172a

# Accent color for CTAs
NEXT_PUBLIC_BRAND_ACCENT_COLOR=#2563eb

# Optional: PDF-specific footer text
NEXT_PUBLIC_PDF_FOOTER_TEXT=YourOrg | 123 Main St | City, ST 12345 | EIN: 12-3456789
```

---

## Environment Variables Reference

| Variable                              | Required                 | Description                             |
| ------------------------------------- | ------------------------ | --------------------------------------- |
| `NEXT_PUBLIC_UNLAYER_PROJECT_ID`      | **Yes** (for PDF export) | Unlayer project ID                      |
| `NEXT_PUBLIC_UNLAYER_WHITE_LABEL`     | No                       | Set `true` for white-label mode         |
| `NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS` | No                       | Comma-separated list of allowed domains |
| `NEXT_PUBLIC_BRAND_NAME`              | No                       | Organization name (default: "GiveHope") |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR`     | No                       | Primary color hex (default: "#0f172a")  |
| `NEXT_PUBLIC_BRAND_ACCENT_COLOR`      | No                       | Accent color hex (default: "#2563eb")   |
| `NEXT_PUBLIC_PDF_FOOTER_TEXT`         | No                       | Default footer text for PDFs            |

---

## Developer Guide

### Using the UnlayerEditor for Documents

```tsx
import {
  UnlayerEditor,
  UnlayerEditorHandle,
} from "@/components/studio/UnlayerEditor";

function MyPDFEditor() {
  const editorRef = useRef<UnlayerEditorHandle>(null);

  const handleExportPdf = async () => {
    const { url, design } = await editorRef.current.exportPdf({
      mergeTags: {
        first_name: "John",
        donation_amount: "$100.00",
      },
    });

    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <UnlayerEditor
      ref={editorRef}
      mode="document" // Critical: use "document" mode for PDFs
      editorId="pdf-editor"
      onReady={(config) => console.log("Editor ready", config)}
      onDesignUpdate={(design) => console.log("Design changed")}
      className="h-full"
    />
  );
}
```

### PDF Export via Unlayer API

The `exportPdf()` method calls Unlayer's cloud-based PDF generation:

```typescript
// Client-side export (via editor)
const { url, design } = await editorRef.current.exportPdf({
  mergeTags: {
    first_name: "John",
    last_name: "Doe",
    donation_amount: "$500.00",
  },
});

if (url) {
  // URL is a temporary link to the generated PDF
  window.open(url, "_blank");
}
```

For server-side PDF generation, use Unlayer's Cloud API:

```typescript
// Server-side (requires Unlayer API key)
const response = await fetch("https://api.unlayer.com/v2/export/pdf", {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(`${UNLAYER_API_KEY}:`).toString("base64")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    displayMode: "document",
    design: templateDesign,
    mergeTags: {
      first_name: "John",
      donation_amount: "$500.00",
    },
  }),
});

const { url } = await response.json();
```

---

## Template Categories

PDF Studio supports predefined template categories for common nonprofit use cases:

| Category         | Value              | Description                         |
| ---------------- | ------------------ | ----------------------------------- |
| Tax Receipt      | `tax_receipt`      | Year-end tax receipts for donors    |
| Donation Receipt | `donation_receipt` | Individual donation acknowledgments |
| Annual Statement | `annual_statement` | Yearly giving statements            |
| Letter           | `letter`           | General correspondence letters      |
| Certificate      | `certificate`      | Certificates and awards             |
| Report           | `report`           | Financial or ministry reports       |
| Invoice          | `invoice`          | Billing and invoice documents       |
| Custom           | `custom`           | Custom document templates           |

---

## Page Sizes and Orientations

### Supported Page Sizes

| Size      | Dimensions    | Use Case               |
| --------- | ------------- | ---------------------- |
| US Letter | 8.5" x 11"    | Standard US documents  |
| A4        | 210mm x 297mm | International standard |
| US Legal  | 8.5" x 14"    | Legal documents        |

### Orientations

| Orientation | Use Case                              |
| ----------- | ------------------------------------- |
| Portrait    | Standard documents, letters, receipts |
| Landscape   | Reports, certificates, wide tables    |

---

## API Endpoints

### List Templates

```http
GET /api/pdf-templates?category=tax_receipt&status=published
```

Query parameters:

- `category` - Filter by category
- `status` - Filter by status (draft, published, archived)

### Create Template

```http
POST /api/pdf-templates

{
  "name": "Annual Tax Receipt",
  "description": "Year-end tax receipt template",
  "design": { /* Unlayer design JSON */ },
  "html": "<html>...</html>",
  "category": "tax_receipt",
  "page_size": "Letter",
  "orientation": "portrait",
  "status": "draft"
}
```

### Get Template

```http
GET /api/pdf-templates/:templateId
```

### Update Template

```http
PUT /api/pdf-templates/:templateId

{
  "name": "Updated Template Name",
  "design": { /* Updated design */ },
  "status": "published"
}
```

### Delete Template

```http
DELETE /api/pdf-templates/:templateId
```

---

## Merge Tags for Documents

PDF Studio includes document-specific merge tags in addition to standard tags:

### Document-Specific Tags

| Category       | Tags                                                                                                                         | Description                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `organization` | `org_name`, `org_address`, `org_phone`, `org_email`, `org_website`, `org_ein`                                                | Organization details including EIN |
| `recipient`    | `first_name`, `last_name`, `full_name`, `email`, `address_line1`, `address_line2`, `city`, `state`, `zip`, `country`         | Full address support               |
| `donation`     | `donation_amount`, `donation_date`, `donation_method`, `donation_id`, `ytd_giving`, `tax_receipt_number`, `gift_designation` | Donation details                   |
| `document`     | `document_date`, `document_number`, `fiscal_year`, `tax_year`, `statement_period`                                            | Document metadata                  |
| `missionary`   | `missionary_name`, `missionary_location`, `missionary_id`, `support_account`                                                 | Missionary info                    |
| `tax_receipt`  | `receipt_number`, `receipt_date`, `total_contributions`, `goods_services_value`, `tax_deductible_amount`, `tax_statement`    | IRS-compliant receipt fields       |

### Tax Receipt Example

```html
<p><strong>{{org_name}}</strong></p>
<p>{{org_address}}</p>
<p>EIN: {{org_ein}}</p>

<h2>Official Tax Receipt</h2>
<p>Receipt #: {{receipt_number}}</p>
<p>Date: {{receipt_date}}</p>

<p>Dear {{full_name}},</p>
<p>
  Thank you for your generous contributions totaling
  <strong>{{total_contributions}}</strong> during the {{tax_year}} tax year.
</p>

<p>{{tax_statement}}</p>
```

---

## Keyboard Shortcuts

| Shortcut               | Action               |
| ---------------------- | -------------------- |
| `Cmd/Ctrl + S`         | Open save dialog     |
| `Cmd/Ctrl + Z`         | Undo                 |
| `Cmd/Ctrl + Shift + Z` | Redo                 |
| `Cmd/Ctrl + E`         | Export HTML          |
| `Cmd/Ctrl + P`         | Export PDF           |
| `Esc`                  | Exit fullscreen mode |

---

## Layout & Height Handling

PDF Studio uses the same layout pattern as Email Studio:

```
<main className="flex-1 flex flex-col min-h-0 overflow-hidden">
  <div className="flex-1 min-h-0 overflow-hidden">           // Page container
    <header className="h-12 md:h-14 shrink-0">               // Fixed toolbar
    <div className="flex-1 relative overflow-hidden">         // Editor container
      <UnlayerEditor
        mode="document"
        className="absolute inset-0"
      />
    </div>
  </div>
</main>
```

---

## Feature Availability by Tier

| Feature                 | Free   | Configured | White-Label |
| ----------------------- | ------ | ---------- | ----------- |
| Drag-and-drop editor    | Yes    | Yes        | Yes         |
| HTML export             | Yes    | Yes        | Yes         |
| **PDF export**          | **No** | **Yes**    | **Yes**     |
| Document preview        | Yes    | Yes        | Yes         |
| Stock images            | No     | Yes        | Yes         |
| Custom blocks           | No     | Yes        | Yes         |
| Remove Unlayer branding | No     | No         | Yes         |
| AI writing assistant    | No     | No         | Yes         |
| Custom fonts            | No     | No         | Yes         |

---

## Troubleshooting

### PDF Export Fails

**Error**: "PDF export requires an Unlayer project ID"

**Cause**: No Unlayer project ID configured.

**Solution**:

1. Create a project at [dashboard.unlayer.com](https://dashboard.unlayer.com)
2. Add `NEXT_PUBLIC_UNLAYER_PROJECT_ID=123456` to `.env.local`
3. Restart the dev server

### PDF Export Returns Null URL

**Cause**: The PDF is still being generated or there was a server-side error.

**Solution**:

1. Check your Unlayer project has PDF export enabled (may require a paid plan)
2. Verify your domain is in the allowed domains list
3. Check browser console for API errors

### Editor Shows Unlayer Branding

**Cause**: Not on a white-label plan or misconfigured.

**Solution**:

1. Upgrade to an Unlayer plan with white-label
2. Enable white-label in Project Settings
3. Add `NEXT_PUBLIC_UNLAYER_WHITE_LABEL=true` to `.env.local`
4. Ensure your domain is whitelisted

### Template Save Fails

**Cause**: Database permission or tenant_id issue.

**Solution**:

1. Ensure Supabase RLS policies allow inserts
2. Verify the user has a valid tenant_id
3. Check browser Network tab for API error details

### Editor Height Issues

**Cause**: Missing flex height chain.

**Solution**: Ensure all parent containers use `flex-1 min-h-0` and the editor uses `absolute inset-0`.

---

## IRS Compliance for Tax Receipts

When creating tax receipt templates, include these required elements:

1. **Organization Information**
   - Legal name
   - Address
   - EIN (Tax ID Number)

2. **Donor Information**
   - Full name
   - Address (for records)

3. **Contribution Details**
   - Date of contribution
   - Amount
   - Description of contribution

4. **Required Statement** (no goods/services provided):

   > "No goods or services were provided in exchange for this contribution."

5. **Required Statement** (goods/services provided):
   > "The estimated fair market value of goods/services provided is $X.XX. The tax-deductible portion of your contribution is $Y.YY."

Example merge tag for tax statement:

```
{{tax_statement}}
```

Sample values:

- "No goods or services were provided in exchange for this contribution."
- "Goods or services valued at $50.00 were provided. Your tax-deductible amount is $450.00."

---

## Security Considerations

1. **Template Access**: Templates are scoped to tenant_id - users can only access their organization's templates.
2. **Merge Tags**: Sanitize all merge tag values to prevent injection attacks.
3. **PDF Storage**: Generated PDFs are temporary URLs from Unlayer. For permanent storage, download and upload to your own storage.
4. **PII in PDFs**: Tax receipts contain PII. Ensure proper access controls and audit logging.

---

## Future Enhancements

1. **Batch PDF Generation** - Generate multiple PDFs from a template with different data
2. **PDF Storage** - Store generated PDFs in Supabase Storage
3. **Template Versioning** - Track changes to templates over time
4. **Template Sharing** - Share templates between tenants (admin feature)
5. **Digital Signatures** - Add signature fields for official documents
6. **QR Codes** - Generate verification QR codes for tax receipts
7. **Scheduled Generation** - Auto-generate year-end receipts

---

## API Reference

### Unlayer Official Documentation

- [Document Builder Guide](https://docs.unlayer.com/builder/document-builder)
- [PDF Export](https://docs.unlayer.com/builder/export-pdf)
- [Cloud API](https://docs.unlayer.com/api)
- [Merge Tags](https://docs.unlayer.com/builder/merge-tags)
- [Options Reference](https://docs.unlayer.com/builder/options)

### Related Documentation

- [Email Studio](./email-studio.md) - Email template builder
- [SendGrid Integration](./sendgrid-integration.md) - Email delivery
