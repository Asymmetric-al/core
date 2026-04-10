# Web Studio Phase 2 — current parity status

## Goal

Expand the Phase 1 Pages-only native slice into a shared Web Studio shell and
shared list/document workspaces for the current editorial collections while
keeping Payload as the runtime and schema owner.

## Current scope

- Native shell: `apps/admin/src/cms-ui/web-studio/shell/*`
- Shared collection config + workspaces:
  - `apps/admin/src/cms-ui/web-studio/collections/config.ts`
  - `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/*`
  - `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/*`
- Native default list/edit surfaces:
  - `Pages`
  - `Navigation`
  - `MissionaryProfiles`
  - `MinistryUpdates`
  - `Media`

## Parity matrix

| Collection | Native list | Native default edit | Preview link | Draft/publish actions | Versions/API/live preview |
| ---------- | ----------- | ------------------- | ------------ | --------------------- | ------------------------- |
| Pages | Yes | Yes | Public donor page URL | Yes | Stock Payload nested subviews |
| Navigation | Yes | Yes | No public preview route | No drafts | Stock Payload nested subviews (API only practical) |
| MissionaryProfiles | Yes | Yes | No public preview route | No drafts | Stock Payload nested subviews |
| MinistryUpdates | Yes | Yes | Public donor home/update-adjacent surface only | Yes | Stock Payload nested subviews |
| Media | Yes | Yes | No public preview route | No drafts | Stock Payload nested subviews |

## Why nested subviews remain stock

`@payloadcms/next/views` publicly exposes root/list/dashboard surfaces, but the
server views for nested document routes (`api`, `versions`, `version`,
`livePreview`) are not exported through a stable public package surface. Direct
subpath imports from the installed package are blocked by package `exports` and
can also pull CSS/module behavior that is not safe to rely on in this repo.

Because of that, Phase 2 keeps those nested routes reachable through Payload’s
own document routing and tabs instead of cloning the underlying logic.

## Rollout / rollback

Every editorial collection can be disabled independently:

- `CMS_WEB_STUDIO_NATIVE_PAGES`
- `CMS_WEB_STUDIO_NATIVE_NAVIGATION`
- `CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES`
- `CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES`
- `CMS_WEB_STUDIO_NATIVE_MEDIA`

After changing flags:

```bash
NODE_ENV=test bun run cms:importmap
```

Then redeploy.

## Non-editorial collections

- `Tenants` and `CmsUsers` remain outside the Web Studio editorial shell in this
  phase. They are operational/admin surfaces and continue to use stock Payload.

## Shared preference keys

- Nav collapse: `web-studio.navCollapsed`
- Per-collection list UI:
  - `web-studio.pages.listUi`
  - `web-studio.navigation.listUi`
  - `web-studio.missionaryProfiles.listUi`
  - `web-studio.ministryUpdates.listUi`
  - `web-studio.media.listUi`
- Per-collection workspace UI:
  - `web-studio.*.documentWorkspace`
- Recent docs:
  - `web-studio.*.recent`

## Phase 3 setup

The current shared workspaces are intended to be extended with:

- dedicated nested wrappers for versions/API/live-preview if/when Payload
  exposes a safer integration point or if the repo chooses a controlled root
  takeover for specific collections
- richer collection-specific inspector panels
- future missionary/project/template page types without changing the shell
