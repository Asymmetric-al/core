import {
  parseCmsPublicErrorResponse,
  parseCmsPublicPageResponse,
  parseCmsPublicUpdatesResponse,
  type CmsPublicErrorCode,
  type CmsPublicPage,
  type CmsPublicUpdate,
} from "@asym/api/cms/public";
import { headers } from "next/headers";

export type CmsPage = CmsPublicPage;
export type CmsUpdate = CmsPublicUpdate;

export class CmsFetchError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: CmsPublicErrorCode,
  ) {
    super(message);
    this.name = "CmsFetchError";
  }
}

function getCmsBaseUrl() {
  return process.env.CMS_BASE_URL ?? "http://127.0.0.1:3030";
}

async function getForwardedHost(hostOverride?: string) {
  if (hostOverride) {
    return hostOverride;
  }

  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3005"
  );
}

async function readResponseBody(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchCmsJSON<T>(
  path: string,
  parser: (value: unknown) => {
    success: boolean;
    data?: T;
  },
  hostOverride?: string,
): Promise<T> {
  const cmsURL = getCmsBaseUrl();
  const tenantHost = await getForwardedHost(hostOverride);

  const response = await fetch(`${cmsURL}${path}`, {
    cache: "no-store",
    headers: {
      "x-forwarded-host": tenantHost,
    },
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    const parsedError = parseCmsPublicErrorResponse(body);
    if (parsedError.success) {
      throw new CmsFetchError(
        parsedError.data.error.message,
        response.status,
        parsedError.data.error.code,
      );
    }

    throw new CmsFetchError(
      `CMS request failed with status ${response.status}.`,
      response.status,
      "UPSTREAM_FAILURE",
    );
  }

  const parsed = parser(body);
  if (!parsed.success || parsed.data === undefined) {
    throw new CmsFetchError(
      "CMS response did not match the shared contract.",
      502,
      "INVALID_RESPONSE",
    );
  }

  return parsed.data;
}

export async function fetchPublishedCmsPage(
  slugSegments: string[],
  hostOverride?: string,
) {
  const normalizedSlug = slugSegments.length ? slugSegments.join("/") : "home";
  const encodedSlug = normalizedSlug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  try {
    const payload = await fetchCmsJSON(
      `/api/cms/public/pages/${encodedSlug}`,
      parseCmsPublicPageResponse,
      hostOverride,
    );

    return payload.page;
  } catch (error) {
    if (error instanceof CmsFetchError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function fetchPublishedCmsUpdates(
  limit = 5,
  hostOverride?: string,
) {
  const payload = await fetchCmsJSON(
    `/api/cms/public/updates?limit=${encodeURIComponent(String(limit))}`,
    parseCmsPublicUpdatesResponse,
    hostOverride,
  );

  return payload.updates;
}

export function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const root = (value as { root?: { children?: unknown[] } }).root;
  if (!root?.children?.length) {
    return "";
  }

  const collectText = (node: unknown): string => {
    if (!node || typeof node !== "object") {
      return "";
    }

    const typedNode = node as {
      text?: string;
      children?: unknown[];
      type?: string;
    };

    const ownText = typeof typedNode.text === "string" ? typedNode.text : "";
    const nestedText = Array.isArray(typedNode.children)
      ? typedNode.children.map((child) => collectText(child)).join(" ")
      : "";

    if (typedNode.type === "linebreak") {
      return "\n";
    }

    return `${ownText} ${nestedText}`.trim();
  };

  return root.children
    .map((child) => collectText(child))
    .join("\n")
    .trim();
}
