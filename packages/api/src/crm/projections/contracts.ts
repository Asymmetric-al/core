import type { CrmProjectionContract } from "@asym/database/types";

export const CRM_PROJECTION_CONTRACTS = [
  {
    projectionName: "donor_crm_detail",
    label: "Donor CRM Detail",
    context: "donor",
    targetSurface: "donor",
    roleScope: "donor_self",
    allowedRoles: ["donor"],
    sourceOwnership: {
      crm: "Twenty CRM owns donor relationship context and safe touch history.",
      asym: "Asym owns donor identity, gifts, recurring state, receipts, statements, payment methods, and permissions.",
      excluded: [
        "staff notes",
        "duplicate review controls",
        "payment internals",
        "care records",
      ],
    },
    visibleFields: [
      "relationship summary",
      "safe recent touch label",
      "giving summary owned by Asym",
      "missionary/project affinity label",
    ],
    blockedFields: [
      "staff-only CRM notes",
      "raw Twenty record links",
      "payment processor ids",
      "merge candidates",
      "care activity",
    ],
    shadowMode: {
      enabled: true,
      userVisibleDependency: false,
    },
    rollback: {
      disableProjectionName: "donor_crm_detail",
      restoreReadModel:
        "Donor portal keeps using existing Asym donor history and giving read models.",
    },
  },
  {
    projectionName: "missionary_crm_detail",
    label: "Missionary CRM Detail",
    context: "missionary",
    targetSurface: "missionary",
    roleScope: "missionary_assigned",
    allowedRoles: ["missionary"],
    sourceOwnership: {
      crm: "Twenty CRM owns safe supporter relationship context scoped to assigned missionaries.",
      asym: "Asym owns missionary identity, support progress, donor giving truth, tasks, public page permissions, and publication rules.",
      excluded: [
        "organization-wide CRM controls",
        "staff notes",
        "donor payment internals",
        "care records",
      ],
    },
    visibleFields: [
      "supporter relationship label",
      "last safe touch date",
      "support summary owned by Asym",
      "assigned missionary scope",
    ],
    blockedFields: [
      "tenant-wide relationship graph",
      "staff-only CRM controls",
      "duplicate merge queue",
      "payment processor ids",
      "care activity",
    ],
    shadowMode: {
      enabled: true,
      userVisibleDependency: false,
    },
    rollback: {
      disableProjectionName: "missionary_crm_detail",
      restoreReadModel:
        "Missionary workspace keeps using existing supporter and support-progress read models.",
    },
  },
  {
    projectionName: "cms_linkage_status",
    label: "CMS Linkage Status",
    context: "cms",
    targetSurface: "cms",
    roleScope: "cms_editor",
    allowedRoles: ["staff", "admin", "super_admin"],
    sourceOwnership: {
      crm: "Twenty CRM owns operational entity context for missionaries, projects, churches, and relationships.",
      asym: "Asym CMS owns public page content, page structure, publish state, moderation, and release rules.",
      excluded: [
        "public content authority moving to Twenty",
        "publish bypasses",
      ],
    },
    visibleFields: [
      "linked operational entity",
      "CMS publish state",
      "link health",
      "moderation state owned by Asym",
    ],
    blockedFields: [
      "raw Twenty write controls",
      "public publish authority in CRM",
      "tenant release-rule bypass",
    ],
    shadowMode: {
      enabled: true,
      userVisibleDependency: false,
    },
    rollback: {
      disableProjectionName: "cms_linkage_status",
      restoreReadModel:
        "CMS continues using existing Asym content and publication state.",
    },
  },
  {
    projectionName: "event_attendee_crm_context",
    label: "Event Attendee CRM Context",
    context: "event",
    targetSurface: "event",
    roleScope: "event_staff",
    allowedRoles: ["staff", "admin", "super_admin"],
    sourceOwnership: {
      crm: "Twenty CRM owns attendee relationship context and organization linkage.",
      asym: "Asym owns event registration, attendance scope, tenant membership, and event permissions.",
      excluded: ["cross-event broadening", "care records", "payment internals"],
    },
    visibleFields: [
      "attendee CRM relationship label",
      "organization/church link",
      "event-scoped attendance state",
      "tenant scope",
    ],
    blockedFields: [
      "tenant-wide donor graph outside event scope",
      "care activity",
      "payment processor ids",
    ],
    shadowMode: {
      enabled: true,
      userVisibleDependency: false,
    },
    rollback: {
      disableProjectionName: "event_attendee_crm_context",
      restoreReadModel:
        "Event surfaces continue using existing Asym event attendee read models.",
    },
  },
  {
    projectionName: "project_fund_crm_detail",
    label: "Project And Fund CRM Detail",
    context: "project_fund",
    targetSurface: "reporting",
    roleScope: "reporting_staff",
    allowedRoles: ["staff", "admin", "super_admin"],
    sourceOwnership: {
      crm: "Twenty CRM owns relationship context for projects, funds, churches, organizations, and partner networks.",
      asym: "Asym owns fund/project designation, giving totals, finance truth, CMS publish state, and public release rules.",
      excluded: [
        "payment execution",
        "receipt internals",
        "CMS publish authority moving to Twenty",
        "care records",
      ],
    },
    visibleFields: [
      "project or fund CRM relationship label",
      "linked church or organization context",
      "Asym-owned designation summary",
      "source-system label",
    ],
    blockedFields: [
      "payment processor ids",
      "receipt internals",
      "refund state",
      "CMS publish controls",
      "care activity",
    ],
    shadowMode: {
      enabled: true,
      userVisibleDependency: false,
    },
    rollback: {
      disableProjectionName: "project_fund_crm_detail",
      restoreReadModel:
        "Project and fund reporting keeps using existing Asym designation, finance, and CMS read models.",
    },
  },
  {
    projectionName: "relationship_reporting_context",
    label: "Relationship Reporting Context",
    context: "reporting",
    targetSurface: "reporting",
    roleScope: "reporting_staff",
    allowedRoles: ["staff", "admin", "super_admin"],
    sourceOwnership: {
      crm: "Twenty CRM owns relationship segmentation, organization context, and safe relationship activity.",
      asym: "Asym owns finance, donation ledger, campaign totals, receipts, statements, refunds, reconciliation, and report permissions.",
      excluded: [
        "finance truth moving to Twenty",
        "care records",
        "CMS publish state",
      ],
    },
    visibleFields: [
      "relationship segment",
      "source-system label",
      "Asym-owned giving totals",
      "shadow parity and duplicate counts",
    ],
    blockedFields: [
      "payment processor ids",
      "receipt internals",
      "care activity",
      "CMS publish controls",
    ],
    shadowMode: {
      enabled: true,
      userVisibleDependency: false,
    },
    rollback: {
      disableProjectionName: "relationship_reporting_context",
      restoreReadModel:
        "Reporting keeps using existing Asym finance and relationship reports.",
    },
  },
] as const satisfies readonly CrmProjectionContract[];

export function getCrmProjectionContract(projectionName: string) {
  return CRM_PROJECTION_CONTRACTS.find(
    (contract) => contract.projectionName === projectionName,
  );
}
