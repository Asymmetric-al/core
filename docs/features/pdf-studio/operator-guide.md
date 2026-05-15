# PDF Studio Operator Guide

## Triggers

Use this guide when staff need to create, update, reopen, archive, export, or
recover Mission Control PDF templates.

## Workflow

1. Open Mission Control `/pdf`.
2. Use **New Document** for a fresh template or **Load Template** to reopen an
   existing active tenant template.
3. Edit legacy templates in the Unlayer document editor. When
   `NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED=true`, use **New Native
   Document** for the native builder path.
4. Use **Save** to persist the template into the tenant-scoped
   `pdf_templates` store.
5. Use **Export as HTML** for provider-free output. Use **Export as PDF** only
   when `NEXT_PUBLIC_UNLAYER_PROJECT_ID` is configured for the admin domain.
   Native browser preview is authoring feedback only; official native output
   requires server-side DocRaptor rollout/config.
6. Use **Archive Template** to remove a template from active lists without
   hard-deleting the row.

## Native rollout

- Default mode is legacy Unlayer. Leave
  `PDF_STUDIO_LEGACY_UNLAYER_FALLBACK_ENABLED=true` until native production
  rendering has provider proof.
- Native authoring uses `engine='asym_pdf_document_builder'` and stores source
  JSON in `pdf_templates.design`; generated HTML is never the editable source of
  truth.
- `missionary_report` is available as a native/legacy category.
- Native version, render, artifact, audit, and batch tables are added by
  `20260515140948_native_pdf_studio_foundation.sql`, but the migration must be
  applied deliberately in each Supabase environment.
- DocRaptor keys and callback secrets are server-only. Do not add them to
  `NEXT_PUBLIC_*` variables.

## Rollback

- Disable provider PDF export by unsetting `NEXT_PUBLIC_UNLAYER_PROJECT_ID` and
  redeploying admin.
- Disable native authoring by unsetting
  `NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED` and
  `PDF_STUDIO_NATIVE_BUILDER_ENABLED`, or set
  `PDF_STUDIO_NATIVE_BUILDER_ROLLOUT=legacy_only`.
- Archive a bad template from the UI, or set `status='archived'` for the
  affected tenant/template row.
- Restore the prior admin Vercel deployment if the API route itself regresses.
  Existing Unlayer templates remain compatible because Unlayer stays available.

## Checklist

- [ ] Template belongs to the correct tenant.
- [ ] Template category, page size, and orientation are correct.
- [ ] No donor, payment, receipt, CRM, CMS, or missionary account facts were
      edited in PDF Studio.
- [ ] Provider PDF export was used only when the Unlayer document project is
      configured for the current domain.
- [ ] Native official render was used only after server-side DocRaptor rollout
      and callback config were verified.
- [ ] Bad templates are archived, not hard-deleted.
