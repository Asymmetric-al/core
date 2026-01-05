# Email Studio

A professional drag-and-drop email editor powered by Unlayer, integrated with SendGrid for email delivery.

## Overview

Email Studio provides a visual email builder that enables non-technical users to create beautiful, responsive email templates. The editor is embedded via the `react-email-editor` package and supports multiple display modes, merge tags, and export options.

## Current Implementation Status

| Feature | Status | Location |
|---------|--------|----------|
| Unlayer Editor Integration | Complete | `src/components/studio/UnlayerEditor.tsx` |
| Email Studio Page | Complete | `src/app/(admin)/mc/email/page.tsx` |
| Configuration System | Complete | `src/config/email-studio.ts` |
| Type Definitions | Complete | `src/types/email-studio.ts` |
| Setup Status Component | Complete | `src/components/studio/EmailStudioSetupStatus.tsx` |
| HTML Export | Complete | Via `exportHtml()` method |
| PDF Export | Complete | Via `exportPdf()` method |
| Template Save | Partial | UI complete, API stubbed |
| SendGrid Integration | Complete | `src/lib/email/sendgrid.ts` |
| Template Database Storage | Planned | Requires Supabase table |
| Campaign Management | Planned | Bulk sends with scheduling |

---

## Architecture

### Component Hierarchy

```
EmailStudio (page.tsx)
├── EmailStudioSetupStatus
├── Header (toolbar)
│   ├── Undo/Redo controls
│   ├── Preview toggle (desktop/mobile)
│   ├── Export dropdown
│   └── Save button
└── UnlayerEditor
    └── react-email-editor (EmailEditor)
```

### File Structure

```
src/
├── app/(admin)/mc/email/
│   └── page.tsx                    # Email Studio page
├── components/studio/
│   ├── UnlayerEditor.tsx           # Core editor wrapper
│   └── EmailStudioSetupStatus.tsx  # Setup status badge
├── config/
│   └── email-studio.ts             # Configuration & constants
├── types/
│   └── email-studio.ts             # TypeScript definitions
└── lib/email/
    ├── index.ts                    # Public exports
    ├── constants.ts                # API endpoints, error codes
    └── sendgrid.ts                 # SendGrid service
```

---

## Tenant Setup Guide

### Prerequisites

1. **Unlayer Account** - Required for advanced features
2. **SendGrid Account** - Required for email delivery
3. **Verified Sender** - Domain or single sender verification

### Step 1: Unlayer Configuration

#### Free Mode (No Setup Required)

Email Studio works out-of-the-box in free mode with these features:
- Drag-and-drop editor
- Basic templates
- HTML export
- Mobile preview

#### Paid Mode (Recommended for Production)

1. Create account at [dashboard.unlayer.com](https://dashboard.unlayer.com)
2. Create a new project (select "Email" as project type)
3. Copy your Project ID from Project > Settings
4. Add to `.env.local`:

```bash
# Unlayer Project ID (numeric)
NEXT_PUBLIC_UNLAYER_PROJECT_ID=123456
```

5. Add production domain to allowed list:
   - Developer > Builder > Settings > Allowed Domains

#### White-Label Mode (Remove Unlayer Branding)

1. Upgrade to a paid plan at [unlayer.com/pricing](https://unlayer.com/pricing)
2. Enable white-label in Project > Settings > White Label
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_UNLAYER_WHITE_LABEL=true
```

### Step 2: SendGrid Configuration

See [SendGrid Integration](./sendgrid-integration.md) for complete setup instructions.

Quick setup:
1. Create SendGrid account at [signup.sendgrid.com](https://signup.sendgrid.com)
2. Create API key with `mail.send` permission
3. Verify sender email or authenticate domain
4. Connect via Settings > Integrations > SendGrid in the admin panel

### Step 3: Branding Configuration

Customize the editor experience:

```bash
# .env.local

# Organization name (used in merge tags)
NEXT_PUBLIC_BRAND_NAME=YourOrganization

# Primary brand color (hex)
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#0f172a

# Accent color for CTAs
NEXT_PUBLIC_BRAND_ACCENT_COLOR=#2563eb

# Optional: Logo URL for email headers
NEXT_PUBLIC_BRAND_LOGO_URL=https://yourdomain.com/logo.png

# Optional: Default footer text
NEXT_PUBLIC_EMAIL_FOOTER_TEXT=YourOrg | 123 Main St | City, ST 12345
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_UNLAYER_PROJECT_ID` | No | Unlayer project ID (enables paid features) |
| `NEXT_PUBLIC_UNLAYER_WHITE_LABEL` | No | Set `true` for white-label mode |
| `NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS` | No | Comma-separated list of allowed domains |
| `NEXT_PUBLIC_BRAND_NAME` | No | Organization name (default: "GiveHope") |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR` | No | Primary color hex (default: "#0f172a") |
| `NEXT_PUBLIC_BRAND_ACCENT_COLOR` | No | Accent color hex (default: "#2563eb") |
| `NEXT_PUBLIC_BRAND_LOGO_URL` | No | Logo URL for email headers |
| `NEXT_PUBLIC_EMAIL_FOOTER_TEXT` | No | Default footer text |
| `SENDGRID_WEBHOOK_VERIFICATION_KEY` | No | For webhook signature verification |
| `EMAIL_ENCRYPTION_KEY` | No | 32-byte base64 key for storing API keys |

---

## Developer Guide

### Using the UnlayerEditor Component

```tsx
import { UnlayerEditor, UnlayerEditorHandle } from '@/components/studio/UnlayerEditor'

function MyEmailEditor() {
  const editorRef = useRef<UnlayerEditorHandle>(null)

  const handleExport = async () => {
    const { html, design } = await editorRef.current.exportHtml()
    console.log('HTML:', html)
    console.log('Design JSON:', design)
  }

  return (
    <UnlayerEditor
      ref={editorRef}
      mode="email"
      editorId="my-editor"
      onReady={(config) => console.log('Editor ready', config)}
      onDesignUpdate={(design) => console.log('Design changed')}
      className="h-full"
      appearance={{
        theme: 'modern_light',
        panels: { tools: { dock: 'right' } }
      }}
    />
  )
}
```

### Editor Handle Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `exportHtml(options?)` | `Promise<UnlayerExportHTML>` | Export design as HTML |
| `exportPdf(options?)` | `Promise<UnlayerPdfExportResult>` | Export as PDF (requires project ID) |
| `exportDesign()` | `Promise<UnlayerDesignJSON>` | Get raw design JSON |
| `loadDesign(design)` | `void` | Load a design into the editor |
| `saveDesign()` | `Promise<UnlayerDesignJSON>` | Save current design |
| `setMergeTags(tags)` | `void` | Update merge tags dynamically |
| `showPreview(device)` | `void` | Show preview ('desktop' or 'mobile') |
| `undo()` | `void` | Undo last action |
| `redo()` | `void` | Redo last undone action |
| `getConfig()` | `StudioConfig` | Get current configuration |

### UnlayerEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'email' \| 'web' \| 'popup' \| 'document'` | `'email'` | Editor display mode |
| `initialDesign` | `UnlayerDesignJSON` | Blank template | Initial design to load |
| `projectId` | `number` | From env | Override Unlayer project ID |
| `editorId` | `string` | Auto-generated | Unique editor instance ID |
| `onReady` | `(config) => void` | - | Called when editor is ready |
| `onLoad` | `() => void` | - | Called when editor starts loading |
| `onDesignUpdate` | `(design) => void` | - | Called on any design change |
| `onSave` | `(data) => void` | - | Called when save is triggered |
| `onExport` | `(data) => void` | - | Called after HTML export |
| `className` | `string` | - | CSS classes for wrapper |
| `appearance` | `UnlayerAppearance` | Default | Editor appearance settings |
| `mergeTags` | `UnlayerMergeTags` | Default | Merge tags configuration |
| `user` | `{ id?, email?, name? }` | - | Current user info |
| `locale` | `string` | `'en-US'` | Editor locale |
| `customCSS` | `string[]` | `[]` | Custom CSS to inject |
| `customJS` | `string[]` | `[]` | Custom JS to inject |

### Export Options

```typescript
// HTML Export
const { html, design } = await editorRef.current.exportHtml({
  minify: true,      // Minify HTML output
  cleanup: true,     // Clean up CSS
  mergeTags: {       // Replace merge tags with values
    first_name: 'John',
    last_name: 'Doe'
  }
})

// PDF Export (requires Unlayer project ID)
const { url, design } = await editorRef.current.exportPdf({
  mergeTags: {
    first_name: 'John'
  }
})
```

---

## Merge Tags

Merge tags allow dynamic content insertion. The system provides pre-configured tags organized by category:

### Available Categories

| Category | Tags | Description |
|----------|------|-------------|
| `organization` | `org_name`, `org_address`, `org_phone`, `org_email`, `org_website` | Organization details |
| `recipient` | `first_name`, `last_name`, `full_name`, `email`, `salutation` | Recipient personalization |
| `donation` | `donation_amount`, `donation_date`, `donation_method`, `donation_id`, `ytd_giving`, `tax_receipt_number` | Donation details |
| `missionary` | `missionary_name`, `missionary_location`, `missionary_bio`, `support_level`, `support_goal` | Missionary info |
| `links` | `unsubscribe_link`, `view_in_browser`, `donate_link`, `profile_link`, `preferences_link` | Action links |
| `campaign` | `campaign_name`, `campaign_goal`, `campaign_raised`, `campaign_end_date` | Campaign details |

### Merge Tag Format

Tags use double curly brace syntax: `{{tag_name}}`

Example email content:
```html
<p>Dear {{first_name}},</p>
<p>Thank you for your gift of {{donation_amount}} on {{donation_date}}.</p>
```

### Custom Merge Tags

```typescript
const customMergeTags: UnlayerMergeTags = {
  custom: {
    name: 'Custom Fields',
    mergeTags: {
      custom_field: {
        name: 'Custom Field',
        value: '{{custom_field}}',
        sample: 'Sample Value'
      }
    }
  }
}

<UnlayerEditor mergeTags={customMergeTags} />
```

---

## Layout & Height Handling

The editor fills its container using CSS flexbox. The layout chain:

```
<main className="flex-1 flex flex-col min-h-0 overflow-hidden">
  <div className="flex-1 min-h-0 overflow-hidden">           // Page container
    <header className="h-12 md:h-14 shrink-0">               // Fixed toolbar
    <div className="flex-1 relative overflow-hidden">         // Editor container
      <UnlayerEditor className="absolute inset-0" />          // Editor fills container
    </div>
  </div>
</main>
```

Critical CSS in `globals.css`:

```css
.unlayer-editor-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  width: 100%;
}

.unlayer-editor-wrapper iframe {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Open save dialog |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + E` | Export HTML |
| `Esc` | Exit fullscreen mode |

---

## Feature Availability by Tier

| Feature | Free | Configured | White-Label |
|---------|------|------------|-------------|
| Drag-and-drop editor | Yes | Yes | Yes |
| Basic templates | Yes | Yes | Yes |
| HTML export | Yes | Yes | Yes |
| Mobile preview | Yes | Yes | Yes |
| Stock images | No | Yes | Yes |
| Custom blocks | No | Yes | Yes |
| Team collaboration | No | Yes | Yes |
| Remove Unlayer branding | No | No | Yes |
| AI writing assistant | No | No | Yes |
| Custom fonts | No | No | Yes |

---

## Troubleshooting

### Editor Shows Only 1/5 of Viewport Height

**Cause**: Missing height chain from parent containers.

**Solution**: Ensure parent elements use `flex-1 min-h-0` and the editor wrapper uses `absolute inset-0`.

### "Free mode - Limited features" Warning

**Cause**: No Unlayer project ID configured.

**Solution**: Add `NEXT_PUBLIC_UNLAYER_PROJECT_ID` to `.env.local`.

### PDF Export Fails

**Cause**: PDF export requires a valid Unlayer project ID.

**Solution**: Configure Unlayer project ID and ensure you're on a plan that supports PDF export.

### Hydration Errors

**Cause**: Client/server rendering mismatch, often from `ClientOnly` wrappers.

**Solution**: The editor uses `useSyncExternalStore` to handle SSR safely. Ensure no conditional rendering based on `typeof window`.

### Stock Images Not Available

**Cause**: Stock images require a configured Unlayer project.

**Solution**: Add your Unlayer project ID to enable stock image library.

---

## SendGrid Integration

Email Studio integrates with SendGrid for delivery. See [SendGrid Integration](./sendgrid-integration.md) for:

- API key setup
- Sender verification
- Test email sending
- Webhook configuration
- Error handling

---

## Security Considerations

1. **API Keys**: Never expose SendGrid API keys to the client. All email sending happens server-side.
2. **Merge Tags**: Sanitize merge tag values before rendering to prevent XSS.
3. **Content**: The editor allows HTML content; ensure proper sanitization if displaying user-generated emails.
4. **Domain Verification**: Always use authenticated domains in production for deliverability.

---

## Future Enhancements

1. **Template Database** - Persist templates to Supabase
2. **Campaign Management** - Schedule and send bulk emails
3. **A/B Testing** - Test different email variants
4. **Analytics Dashboard** - Track opens, clicks, bounces
5. **Suppression Management** - Handle unsubscribes and bounces
6. **Template Library** - Pre-built templates for common use cases
7. **Version History** - Track template changes over time

---

## API Reference

### Unlayer Official Documentation

- [React Component Guide](https://docs.unlayer.com/builder/react-component)
- [Options Reference](https://docs.unlayer.com/builder/options)
- [Export Methods](https://docs.unlayer.com/builder/export)
- [Merge Tags](https://docs.unlayer.com/builder/merge-tags)
- [Appearance](https://docs.unlayer.com/builder/appearance)

### SendGrid Documentation

- [Node.js Quickstart](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/quickstart-nodejs)
- [API Reference](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Event Webhooks](https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/event)
