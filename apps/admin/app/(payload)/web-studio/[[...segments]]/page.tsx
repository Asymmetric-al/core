import { DocumentScopeProvider } from "@asym/database/document-scope";
import config from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { connection } from "next/server";

import { importMap } from "../importMap";

import type { Metadata } from "next";

import { requireWebStudioAccess } from "@/src/cms/web-studio-access";

/** Block: sibling of the preview route, and the Payload admin cannot prerender (see `(payload)/layout.tsx`). */
export const instant = false;

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: Args): Promise<Metadata> => {
  await connection();
  return generatePageMetadata({ config, params, searchParams });
};

const Page = async ({ params, searchParams }: Args) => {
  await connection();
  // Every render asks the gate, a client navigation included: the layout
  // does not render again then. Rendered for another organization than the
  // open document's, the page shows nothing and reloads (AL-2675, council C1).
  const { segments } = await params;
  // Next passes no segments at Web Studio's home.
  const path = Array.isArray(segments) ? segments : [];
  const access = await requireWebStudioAccess(
    ["/web-studio", ...path.map(encodeURIComponent)].join("/"),
  );
  return (
    <DocumentScopeProvider scope={access.scope}>
      {await RootPage({ config, importMap, params, searchParams })}
    </DocumentScopeProvider>
  );
};

export default Page;
