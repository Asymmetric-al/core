/** Payload preference keys for Web Studio UI state (namespace to avoid collisions). */
export const WEB_STUDIO_PREF_KEYS = {
  navCollapsed: "web-studio.navCollapsed",
  pagesListUi: "web-studio.pages.listUi",
  pagesDocWorkspace: "web-studio.pages.documentWorkspace",
} as const;

export const WEB_STUDIO_COLLECTION_PREFERENCE_MAP = {
  media: {
    listUi: "web-studio.media.listUi",
    workspace: "web-studio.media.documentWorkspace",
  },
  navigation: {
    listUi: "web-studio.navigation.listUi",
    workspace: "web-studio.navigation.documentWorkspace",
  },
  pages: {
    listUi: WEB_STUDIO_PREF_KEYS.pagesListUi,
    workspace: WEB_STUDIO_PREF_KEYS.pagesDocWorkspace,
  },
} as const;
