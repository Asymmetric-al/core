import { DocumentTabLink, VersionsPill } from "@payloadcms/ui";

import type { DocumentTabServerProps } from "payload";

type Translate = DocumentTabServerProps["req"]["i18n"]["t"];

/**
 * `DocumentTabLink` puts its `baseClass` on the link. Payload's stock tab
 * passes its own `doc-tab` for color; the Studio tab keeps the label on one
 * line and takes its colors from `studio-stock-views.css`.
 */
const TAB_BASE_CLASS = "whitespace-nowrap";

/** Payload's own document tabs, keyed by the view path Payload passes in. */
const DOCUMENT_TABS: Record<
  string,
  { href: string; label: (t: Translate) => string; versionCount?: true }
> = {
  "/": { href: "", label: (t) => t("general:edit") },
  "/versions": {
    href: "/versions",
    label: (t) => t("version:versions"),
    versionCount: true,
  },
  "/api": { href: "/api", label: () => "API" },
};

/**
 * Payload `views.edit.<view>.tab.Component` for Studio documents (see
 * `document-tabs.ts`). Payload's stock tab puts its link straight inside the
 * tab list's `<ul>`, which is not a valid list; this draws the same link,
 * label and version count inside an `<li>`. The link keeps Payload's own
 * active-tab and locale handling.
 */
export function StudioDocumentTab({ path, req }: DocumentTabServerProps) {
  const tab = DOCUMENT_TABS[path];
  if (!tab) return null;
  return (
    <li className="flex">
      <DocumentTabLink
        adminRoute={req.payload.config.routes.admin}
        baseClass={TAB_BASE_CLASS}
        href={tab.href}
        isActive={false}
      >
        <span className="flex items-center gap-1">
          {tab.label(req.i18n.t)}
          {tab.versionCount ? (
            <>
              {" "}
              <VersionsPill />
            </>
          ) : null}
        </span>
      </DocumentTabLink>
    </li>
  );
}
