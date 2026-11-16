import {
  filterStaff,
  loadedStaff,
  loadedFollowUps,
  openCarePlan,
  openPdfExport,
  qualifiedSetup,
  SUPPORTED_SETUPS,
  unconnectedEvents,
  unconnectedMobilize,
} from "./catalogue-setups.mjs";
import { MODULE_FIXTURE_IDS } from "./fixtures/module-fixtures.mjs";
import {
  ALL,
  DESKTOP_MOBILE,
  waitForEnabledButton,
} from "./workspace-states.mjs";

const D = ["desktop"];

export const UNAVAILABLE_MODULE_WORKFLOWS = [
  ["admin-team-manage", "Staff directory has no team-management dialog."],
  ["admin-team-create", "Staff directory has no team-creation workflow."],
  [
    "mobilize-candidate",
    "Mobilize pipeline is not connected; no candidate detail.",
  ],
  [
    "mobilize-add",
    "Mobilize pipeline is not connected; no candidate creation.",
  ],
  ["events-venues", "Events is not connected; no venue configuration."],
  ["events-speakers", "Events is not connected; no speaker workflow."],
  [
    "events-attendees",
    "Events is not connected; no attendance or registration totals.",
  ],
  [
    "tasks-drawer",
    "Tasks shows linked follow-ups, not the historical task drawer.",
  ],
  ["tasks-new", "Team to-dos are not available; no task-creation dialog."],
].map(([name, reason]) => ({
  name,
  reason,
  status: "NOT_EXERCISED",
  equivalentWorkflow: false,
}));

export function createModuleStates() {
  return [
    // ------------------------------------------------------------- shell ---
    { area: "shell", name: "home", route: "/", widths: ALL, full: true },
    {
      area: "shell",
      name: "home-search",
      route: "/",
      widths: D,
      setup: SUPPORTED_SETUPS["home-search"],
    },
    {
      area: "shell",
      name: "home-profile-menu",
      route: "/",
      widths: D,
      setup: SUPPORTED_SETUPS["home-profile-menu"],
    },
    {
      area: "shell",
      name: "home-mobile-nav",
      route: "/",
      widths: ["mobile"],
      freshPerWidth: true,
      setup: SUPPORTED_SETUPS["home-mobile-nav"],
    },
    {
      area: "shell",
      name: "admin",
      route: "/admin",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    {
      area: "shell",
      name: "admin-staff-directory",
      route: "/admin/teams",
      widths: DESKTOP_MOBILE,
      full: true,
      setup: loadedStaff,
    },
    {
      area: "shell",
      name: "admin-staff-search",
      route: "/admin/teams",
      widths: D,
      setup: (page) => filterStaff(page),
    },
    {
      area: "shell",
      name: "admin-staff-no-results",
      route: "/admin/teams",
      widths: D,
      setup: (page) => filterStaff(page, true),
    },
    {
      area: "shell",
      name: "admin-eve",
      route: "/admin/eve",
      widths: D,
      full: true,
    },
    {
      area: "shell",
      name: "email-delivery",
      route: "/settings/integrations/resend",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    { area: "shell", name: "about", route: "/help/about", widths: D },
    { area: "shell", name: "sign", route: "/sign", widths: D },
    { area: "shell", name: "no-access", route: "/no-access", widths: D },

    // ------------------------------------------------------------ people ---
    { area: "people", name: "care", route: "/care", widths: ALL, full: true },
    {
      area: "people",
      name: "care-directory",
      route: "/care/directory",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    {
      area: "people",
      name: "care-profile",
      route: `/care/directory/${MODULE_FIXTURE_IDS.carePersonnelId}`,
      widths: DESKTOP_MOBILE,
      full: true,
    },
    {
      area: "people",
      name: "care-profile-thread",
      route: `/care/directory/${MODULE_FIXTURE_IDS.carePersonnelId}`,
      widths: D,
      setup: SUPPORTED_SETUPS["care-profile-thread"],
    },
    {
      area: "people",
      name: "care-profile-plan",
      route: `/care/directory/${MODULE_FIXTURE_IDS.carePersonnelId}`,
      widths: DESKTOP_MOBILE,
      full: true,
      freshPerWidth: true,
      setup: openCarePlan,
    },
    {
      area: "people",
      name: "care-settings",
      route: "/care/settings",
      widths: D,
    },
    {
      area: "people",
      name: "mobilize-unconnected",
      route: "/mobilize",
      widths: DESKTOP_MOBILE,
      full: true,
      setup: unconnectedMobilize,
    },
    {
      area: "people",
      name: "locations",
      route: "/mobilize/locations",
      widths: D,
    },
    // Round 11: the List tab (shared grid, cards on phones) and the keyboard
    // path to a new location (Add location opens the editor directly).
    {
      area: "people",
      name: "locations-list",
      route: "/mobilize/locations",
      widths: DESKTOP_MOBILE,
      setup: SUPPORTED_SETUPS["locations-list"],
    },
    {
      area: "people",
      name: "locations-add",
      route: "/mobilize/locations",
      widths: D,
      setup: SUPPORTED_SETUPS["locations-add"],
    },
    {
      area: "people",
      name: "events-unconnected",
      route: "/events",
      widths: DESKTOP_MOBILE,
      full: true,
      setup: unconnectedEvents,
    },
    {
      area: "people",
      name: "feed",
      route: "/feed",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    {
      area: "people",
      name: "org-updates",
      route: "/feed/org-updates",
      widths: D,
      full: true,
    },
    {
      area: "people",
      name: "tasks-follow-ups",
      route: "/tasks",
      widths: ALL,
      full: true,
      setup: loadedFollowUps,
    },

    // ----------------------------------------------------------- support ---
    {
      area: "support",
      name: "support-inbox",
      route: "/support",
      widths: ALL,
      full: true,
    },
    {
      area: "support",
      name: "support-table",
      route: "/support",
      widths: D,
      setup: SUPPORTED_SETUPS["support-table"],
    },
    {
      area: "support",
      name: "support-conversation",
      route: `/support?id=${MODULE_FIXTURE_IDS.supportConversationId}`,
      widths: DESKTOP_MOBILE,
      // Opening a conversation may scroll the page to show the reply pane;
      // keep the app's own scroll rather than resetting it to the top.
      keepScroll: true,
    },
    {
      area: "support",
      name: "support-reports",
      route: "/support/reports/overview",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    {
      area: "support",
      name: "support-reports-agents",
      route: "/support/reports/agents",
      widths: D,
      full: true,
    },
    {
      area: "support",
      name: "support-settings-inbox",
      route: "/support/settings/inbox",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    {
      area: "support",
      name: "support-settings-sla",
      route: "/support/settings/sla",
      widths: D,
      full: true,
    },
    {
      area: "support",
      name: "support-settings-labels",
      route: "/support/settings/labels",
      widths: D,
      full: true,
    },
    {
      area: "support",
      name: "support-settings-automations",
      route: "/support/settings/automations",
      widths: D,
      full: true,
    },
    {
      area: "support",
      name: "support-settings-notifications",
      route: "/support/settings/notifications",
      widths: D,
      full: true,
    },

    // ------------------------------------------------------------- tools ---
    {
      area: "tools",
      name: "reports",
      route: "/reports",
      widths: ALL,
      full: true,
    },
    {
      area: "tools",
      name: "automations",
      route: "/automations",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    // Round 11: the failure card filters the rules to the failing ones.
    {
      area: "tools",
      name: "automations-failing",
      route: "/automations",
      widths: D,
      setup: SUPPORTED_SETUPS["automations-failing"],
    },
    {
      area: "tools",
      name: "workflows",
      route: "/workflows",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    { area: "tools", name: "email-studio", route: "/email", widths: ALL },
    {
      area: "tools",
      name: "pdf-studio",
      route: "/pdf",
      widths: ALL,
      // The editor loads after the page; Save enables once it is ready.
      settled: (page) => waitForEnabledButton(page, /save/i),
      setup: (page) => waitForEnabledButton(page, /^save$/i),
    },
    // Round 11: the Export menu, including the free-mode note.
    {
      area: "tools",
      name: "pdf-export-menu",
      route: "/pdf",
      widths: D,
      settled: (page) => waitForEnabledButton(page, /save/i),
      setup: openPdfExport,
    },
  ].map((state) =>
    state.setup
      ? { ...state, setup: qualifiedSetup(state.name, state.setup) }
      : state,
  );
}
