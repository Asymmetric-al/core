# PDF Studio Operator Guide

## Triggers

Use this guide when staff need to create, update, reopen, archive, export, or
recover Mission Control PDF templates.

## Workflow

1. Open Mission Control `/pdf`.
2. Use **New Document** for a fresh template or **Load Template** to reopen an
   existing active tenant template.
3. Edit the document in the legacy Unlayer document editor. Use the setup badge
   to confirm whether PDF export is configured.
4. Use **Save** to persist the template into the tenant-scoped
   `pdf_templates` store.
5. Use **Export as HTML** for provider-free output. Use **Export as PDF** only
   when `NEXT_PUBLIC_UNLAYER_PROJECT_ID` is configured for the admin domain.
6. Use **Archive Template** to remove a template from active lists without
   hard-deleting the row.

## Rollback

- Disable provider PDF export by unsetting `NEXT_PUBLIC_UNLAYER_PROJECT_ID` and
  redeploying admin.
- Archive a bad template from the UI, or set `status='archived'` for the
  affected tenant/template row.
- Restore the prior admin Vercel deployment if the API route itself regresses.
  Phase 10 does not add a migration, so existing `pdf_templates` rows remain
  compatible.

## Checklist

- [ ] Template belongs to the correct tenant.
- [ ] Template category, page size, and orientation are correct.
- [ ] No donor, payment, receipt, CRM, CMS, or missionary account facts were
      edited in PDF Studio.
- [ ] Provider PDF export was used only when the Unlayer document project is
      configured for the current domain.
- [ ] Bad templates are archived, not hard-deleted.
