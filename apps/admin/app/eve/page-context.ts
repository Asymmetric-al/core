import type { PrepareSend } from "eve/react";

const SAFE_ROUTE_IDENTITIES = {
  "/": "Mission Control dashboard",
  "/admin": "Administration",
  "/automations": "Automations",
  "/care": "Member care",
  "/contributions": "Contributions",
  "/crm": "CRM",
  "/email": "Email Studio",
  "/events": "Event Hub",
  "/feed": "Ministry updates",
  "/mobilize": "Mobilize",
  "/pdf": "PDF Studio",
  "/reports": "Reports",
  "/sign": "Sign Studio",
  "/support": "Support Hub",
  "/tasks": "Tasks",
  "/web-studio": "Web Studio",
} as const;

type SafeRoute = keyof typeof SAFE_ROUTE_IDENTITIES;

interface EvePageContextInput {
  panelOpen: boolean;
  pathname: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface EvePageContext {
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  pageIdentity: string;
  route: SafeRoute;
  ui: {
    panel: "closed" | "open";
    surface: "mission-control";
  };
}

function toSafeRoute(pathname: string): SafeRoute {
  if (pathname === "/") {
    return "/";
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const candidate = `/${firstSegment ?? ""}`;
  return candidate in SAFE_ROUTE_IDENTITIES ? (candidate as SafeRoute) : "/";
}

/**
 * Builds an explicit allowlist for Eve. Dynamic URL segments, client records,
 * table state, form values, and DOM content have no path into this object.
 */
export function buildEvePageContext({
  panelOpen,
  pathname,
  tenant,
}: EvePageContextInput): EvePageContext {
  const route = toSafeRoute(pathname);

  return {
    organization: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        }
      : null,
    pageIdentity: SAFE_ROUTE_IDENTITIES[route],
    route,
    ui: {
      panel: panelOpen ? "open" : "closed",
      surface: "mission-control",
    },
  };
}

export function prepareEveSend(pageContext: EvePageContext): PrepareSend {
  return (input) => ({
    ...input,
    clientContext: { ...pageContext },
  });
}
