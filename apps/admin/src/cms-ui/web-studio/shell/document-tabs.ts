/** Import-map path of the Studio document tab (`studio-document-tab.tsx`). */
export const STUDIO_DOCUMENT_TAB_COMPONENT =
  "/src/cms-ui/web-studio/shell/studio-document-tab.tsx#StudioDocumentTab";

const studioTab = { tab: { Component: STUDIO_DOCUMENT_TAB_COMPONENT } };

/**
 * `admin.components.views.edit` for a Studio collection: its native editor
 * as the default view, and Payload's stock Versions and API views. Each view
 * draws its tab with the Studio document tab, so the tab list holds list
 * items. Versions and API carry no `Component`, so Payload keeps its own
 * views and its own conditions for showing them.
 */
export function studioDocumentEditViews(defaultComponent: string) {
  return {
    default: { Component: defaultComponent, ...studioTab },
    versions: studioTab,
    api: studioTab,
  };
}
