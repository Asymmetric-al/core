import config from "@payload-config";
import { NotFoundPage, generatePageMetadata } from "@payloadcms/next/views";
import { connection } from "next/server";

import { importMap } from "../importMap";

import type { Metadata } from "next";

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

const NotFound = async ({ params, searchParams }: Args) => {
  await connection();
  return NotFoundPage({ config, importMap, params, searchParams });
};

export default NotFound;
