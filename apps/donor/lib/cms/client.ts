import { buildPublicCmsReadPath } from "@asym/lib/cms/public-page";

import type {
  PublicCmsPage,
  PublicCmsPageReadResult,
} from "@asym/lib/cms/public-page";

const RETIRED_PUBLIC_CMS_PAGE_RESULT: PublicCmsPageReadResult = {
  status: "not-found",
  statusCode: 404,
  error: "Public CMS reads are retired until WP7.",
};

export function buildPublicCmsPagePath(slugSegments: string[]) {
  return buildPublicCmsReadPath({ kind: "page", slugSegments });
}

export function getPublicCmsBaseUrl() {
  return process.env.CMS_BASE_URL ?? "http://127.0.0.1:3030";
}

type PublicCmsUpdate = Record<string, unknown>;

type PublicCmsUpdatesReadResult =
  | {
      status: "found";
      statusCode: 200;
      updates: PublicCmsUpdate[];
    }
  | {
      status: "unavailable";
      statusCode: number;
      error: string;
    };

export async function fetchPublishedCmsPageResult(
  _slugSegments: string[],
  _hostOverride?: string,
): Promise<PublicCmsPageReadResult> {
  return RETIRED_PUBLIC_CMS_PAGE_RESULT;
}

type PublishedCmsPageRouteState =
  | {
      status: "found";
      page: PublicCmsPage;
    }
  | {
      status: "not-found";
    }
  | {
      status: "unavailable";
      error: string;
    };

export function resolvePublishedCmsPageRouteState(
  result: PublicCmsPageReadResult,
): PublishedCmsPageRouteState {
  if (result.status === "found") {
    return {
      status: "found",
      page: result.page,
    };
  }

  if (result.status === "unavailable") {
    return {
      status: "unavailable",
      error: result.error,
    };
  }

  return { status: "not-found" };
}

export async function fetchPublishedCmsUpdates(
  _limit = 5,
  _hostOverride?: string,
): Promise<PublicCmsUpdate[]> {
  return [];
}

export async function fetchPublishedCmsUpdatesResult(
  _limit = 5,
  _hostOverride?: string,
): Promise<PublicCmsUpdatesReadResult> {
  return {
    status: "found",
    statusCode: 200,
    updates: [],
  };
}

export async function fetchPublishedMissionaryGivingPageResult(
  _missionaryId: string,
  _hostOverride?: string,
): Promise<PublicCmsPageReadResult> {
  return RETIRED_PUBLIC_CMS_PAGE_RESULT;
}

export async function fetchPublishedProjectPageResult(
  _slug: string,
  _hostOverride?: string,
): Promise<PublicCmsPageReadResult> {
  return RETIRED_PUBLIC_CMS_PAGE_RESULT;
}
