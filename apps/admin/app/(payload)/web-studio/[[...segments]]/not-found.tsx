import config from "@payload-config";
import { generatePageMetadata } from "@payloadcms/next/views";
import { connection } from "next/server";

import type { Metadata } from "next";

import { WebStudioNotFoundView } from "@/src/cms-ui/web-studio/flows/WebStudioNotFoundView";

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

const NotFound = async () => {
  await connection();
  return <WebStudioNotFoundView />;
};

export default NotFound;
