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
  "missionary-profiles": {
    listUi: "web-studio.missionaryProfiles.listUi",
    workspace: "web-studio.missionaryProfiles.documentWorkspace",
  },
  "ministry-updates": {
    listUi: "web-studio.ministryUpdates.listUi",
    workspace: "web-studio.ministryUpdates.documentWorkspace",
  },
  "missionary-giving-pages": {
    listUi: "web-studio.missionaryGivingPages.listUi",
    workspace: "web-studio.missionaryGivingPages.documentWorkspace",
  },
  navigation: {
    listUi: "web-studio.navigation.listUi",
    workspace: "web-studio.navigation.documentWorkspace",
  },
  pages: {
    listUi: WEB_STUDIO_PREF_KEYS.pagesListUi,
    workspace: WEB_STUDIO_PREF_KEYS.pagesDocWorkspace,
  },
  "page-templates": {
    listUi: "web-studio.pageTemplates.listUi",
    workspace: "web-studio.pageTemplates.documentWorkspace",
  },
  "project-pages": {
    listUi: "web-studio.projectPages.listUi",
    workspace: "web-studio.projectPages.documentWorkspace",
  },
} as const;
