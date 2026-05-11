# Email Studio

Email Studio authors tenant email templates with React Email Editor and sends through the existing Resend integration. Resend remains the delivery provider; the editor runtime is separate from delivery, webhook ingestion, tenant validation, and audit logging.

## Triggers

Use this guide when changing:

- Admin Email Studio UI, template save/load/export, preview, image upload, or test-send.
- Email template database schema, template versions, or generated database types.
- Merge-tag definitions, validation, substitution, or campaign send behavior.
- Resend delivery behavior that is called from Email Studio.
- Legacy Unlayer template handling.

## Architecture

```txt
Editor/runtime        React Email Editor or legacy Unlayer adapter
Template model        Asym provider-neutral builder envelope
Personalization       Asym merge-tag registry and renderer
Persistence           Supabase email_templates + email_template_versions
Delivery              Existing Resend service layer
Events/audit          email_send_logs + Resend webhook ingestion
```

Primary files:

- `apps/admin/app/email/page-client.tsx` - admin Email Studio shell.
- `packages/ui/components/studio/EmailStudioEditor.tsx` - provider switch.
- `packages/ui/components/studio/ReactEmailEditor.tsx` - React Email Editor wrapper.
- `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx` - controlled legacy email path.
- `packages/email/email-builder-types.ts` - provider-neutral builder contract.
- `packages/email/merge-tags.ts` and `packages/email/merge-tag-render.ts` - merge-tag registry, validation, and substitution.
- `packages/api/src/email/templates.ts` and `packages/api/src/email/template-store.ts` - template CRUD/versioning.
- `packages/api/src/email/template-test-send.ts` - actual-template test-send through Resend.
- `packages/api/src/email/assets.ts` - authenticated image upload.

## Runtime Flags

```env
NEXT_PUBLIC_EMAIL_STUDIO_BUILDER=react_email
NEXT_PUBLIC_EMAIL_STUDIO_LEGACY_UNLAYER_ENABLED=true
```

`react_email` is the default for new templates. `unlayer` is allowed only for existing legacy templates or rollback. `auto` may be used during rollout to choose React Email for new templates and legacy Unlayer for rows already stored with `builder='unlayer'`.

Legacy Unlayer env vars are retained only while legacy templates or PDF Studio still depend on Unlayer:

```env
NEXT_PUBLIC_UNLAYER_PROJECT_ID=
NEXT_PUBLIC_UNLAYER_WHITE_LABEL=false
NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS=
UNLAYER_API_KEY=
```

## Template Model

Templates are provider-neutral:

- `builder`: `react_email` or `unlayer`.
- `builder_version`: editor package/runtime version.
- `design_json`: editor JSON source of truth.
- `html_content` and `text_content`: cached export used by preview/test-send/campaign sends.
- `default_subject` and `default_preheader`: persisted delivery metadata.
- `email_template_versions`: immutable versions used for audit and rollback.

Manual save exports the current editor output, validates merge tags, writes the template row, and creates a version. Local storage may be used only for transient draft recovery; it is not a production template store.

`tests/unit/packages/api/email/templates.test.ts` covers the tenant-scoped template route contract: create, list, read, patch, delete, duplicate, export, version list, version restore, missing-template handling, missing-export handling, invalid restore versions, and merge-tag rejection before persistence.

## Merge Tags

Merge tags are Asym domain primitives, not editor-vendor features. The canonical token syntax remains:

```txt
{{first_name}}
{{donation_amount}}
{{unsubscribe_link}}
```

Server sends must validate known tags, required marketing tags, and URL safety before calling Resend. Substitution escapes values by default. Marketing sends must include `unsubscribe_link`.

The React Email editor uses `packages/ui/components/studio/merge-tag-extension.tsx` to insert merge tags as atomic inline nodes. The node renders as a protected pill in the editor and serializes back to `{{tag_key}}` for exported HTML/text and server-side validation.

## Preview And Test Send

Preview exports the current editor HTML/text and renders HTML in a sandboxed iframe. The test-send flow sends the current edited template through `sendEmail(...)` in `packages/email/resend.ts`; it does not call the generic Resend connection-test email.

Generic connection testing remains at `/api/email/test-send`. Actual template testing uses:

- `POST /api/email/templates/test-send`
- `POST /api/email/templates/[templateId]/test-send`

## Image Upload

React Email Editor image upload calls `POST /api/email/assets/upload`. The route requires admin/super_admin auth, validates MIME/size, and stores assets under tenant-scoped paths. Cloudinary is used only when enabled; otherwise Supabase Storage bucket `email-assets` is used.

## Legacy Unlayer

Existing Unlayer email templates must not be silently converted. They open through `packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx` while the legacy flag is enabled. PDF Studio uses `packages/ui/components/studio/legacy/UnlayerDocumentEditor.tsx` until a separate PDF/document migration removes that dependency.

Do not remove the `react-email-editor` dependency until:

1. No active email template needs the legacy Unlayer adapter.
2. PDF Studio has been migrated or explicitly disabled.
3. Static grep shows no active references outside the approved legacy allowlist.

Use `bun run verify:email-studio-legacy` during rollout. For the final decommission PR, run `EMAIL_STUDIO_UNLAYER_MODE=zero bun run verify:email-studio-legacy` and expect zero references.

## Checklist

- [ ] Read the current Next.js docs for App Router routes/components before changing route or page code.
- [ ] Keep App Router route files thin; put business logic in `packages/api/src/email/*`.
- [ ] Keep Resend delivery in the existing `packages/email/resend.ts` path.
- [ ] Persist React Email designs with `builder='react_email'`, HTML, text, subject, preheader, and a version row.
- [ ] Validate and render merge tags server-side before sending.
- [ ] Keep legacy Unlayer explicit and isolated.
- [ ] Update `.env.example`, `docs/env-var-audit.md`, and runtime-map docs when adding routes/env vars.
- [ ] Run focused unit/component tests, the Email Studio Playwright smoke, typecheck, and `bun run verify:email-studio-legacy` before release.

Focused regression tests:

- `tests/unit/packages/email/email-builder-types.test.ts`
- `tests/unit/packages/email/merge-tags.test.ts`
- `tests/unit/packages/email/merge-tag-render.test.ts`
- `tests/unit/packages/api/email/templates.test.ts`
- `tests/unit/packages/api/email/template-test-send.test.ts`
- `tests/unit/packages/api/email/assets.test.ts`
- `tests/unit/packages/ui/studio/react-email-editor.test.tsx`
- `tests/unit/packages/ui/studio/email-studio-preview.test.tsx`
- `tests/e2e/admin-email-studio.spec.ts`
