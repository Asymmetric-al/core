"use client";

import { useConfig, useStepNav } from "@payloadcms/ui";

import {
  describeWebStudioStockRoute,
  documentCrumbFromStepNav,
  isWebStudioNativeTemplateRoute,
} from "./native-routes";
import { StudioNavRail } from "./studio-nav-rail";
import { StudioTopBar } from "./studio-top-bar";
import { usePathname } from "../routing";
import "./studio-stock-views.css";

function pluralLabel(label: unknown, fallback: string): string {
  if (typeof label === "string" && label.length > 0) return label;
  if (label && typeof label === "object") {
    const first = Object.values(label as Record<string, unknown>).find(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
    if (first) return first;
  }
  return fallback;
}

/**
 * Payload `admin.components.header`: the Studio top bar for stock Payload
 * screens inside the default template (stock collections, document versions,
 * API, account). Native screens render their own `StudioLayout`, so this
 * steps aside there.
 */
export function StudioTemplateHeader() {
  const pathname = usePathname() ?? "";
  const {
    config: { collections },
  } = useConfig();
  // Payload's own trail names the document on Versions and API.
  const { stepNav } = useStepNav();

  if (isWebStudioNativeTemplateRoute(pathname)) {
    return null;
  }

  const collectionLabels = Object.fromEntries(
    collections.map((collection) => [
      collection.slug,
      pluralLabel(collection.labels?.plural, collection.slug),
    ]),
  );

  return (
    <div data-web-studio-chrome="" className="contents text-base">
      <StudioTopBar
        {...describeWebStudioStockRoute(pathname, collectionLabels)}
        document={documentCrumbFromStepNav(stepNav, pathname)}
      />
    </div>
  );
}

/**
 * Payload `admin.components.Nav`: replaces Payload's collection sidebar with
 * the Studio rail on stock screens; native screens bring their own rail.
 */
export function StudioTemplateNav() {
  const pathname = usePathname() ?? "";

  if (isWebStudioNativeTemplateRoute(pathname)) {
    return null;
  }

  return (
    <div
      data-web-studio-chrome=""
      data-web-studio-template-nav=""
      className="contents text-base"
    >
      <StudioNavRail />
    </div>
  );
}
