/** Payload preference keys for Web Studio UI state (namespace to avoid collisions). */
export const WEB_STUDIO_PREF_KEYS = {
  navCollapsed: "web-studio.navCollapsed",
  pagesListUi: "web-studio.pages.listUi",
  pagesDocWorkspace: "web-studio.pages.documentWorkspace",
  recentPages: "web-studio.pages.recent",
} as const;

export const WEB_STUDIO_COLLECTION_PREFERENCE_MAP = {
  media: {
    listUi: "web-studio.media.listUi",
    recentDocs: "web-studio.media.recent",
    workspace: "web-studio.media.documentWorkspace",
  },
  "missionary-profiles": {
    listUi: "web-studio.missionaryProfiles.listUi",
    recentDocs: "web-studio.missionaryProfiles.recent",
    workspace: "web-studio.missionaryProfiles.documentWorkspace",
  },
  "ministry-updates": {
    listUi: "web-studio.ministryUpdates.listUi",
    recentDocs: "web-studio.ministryUpdates.recent",
    workspace: "web-studio.ministryUpdates.documentWorkspace",
  },
  "missionary-giving-pages": {
    listUi: "web-studio.missionaryGivingPages.listUi",
    recentDocs: "web-studio.missionaryGivingPages.recent",
    workspace: "web-studio.missionaryGivingPages.documentWorkspace",
  },
  navigation: {
    listUi: "web-studio.navigation.listUi",
    recentDocs: "web-studio.navigation.recent",
    workspace: "web-studio.navigation.documentWorkspace",
  },
  pages: {
    listUi: WEB_STUDIO_PREF_KEYS.pagesListUi,
    recentDocs: WEB_STUDIO_PREF_KEYS.recentPages,
    workspace: WEB_STUDIO_PREF_KEYS.pagesDocWorkspace,
  },
  "page-templates": {
    listUi: "web-studio.pageTemplates.listUi",
    recentDocs: "web-studio.pageTemplates.recent",
    workspace: "web-studio.pageTemplates.documentWorkspace",
  },
  "project-pages": {
    listUi: "web-studio.projectPages.listUi",
    recentDocs: "web-studio.projectPages.recent",
    workspace: "web-studio.projectPages.documentWorkspace",
  },
} as const;
