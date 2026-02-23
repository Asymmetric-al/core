import { headers } from "next/headers";

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: unknown;
  updatedAt?: string;
};

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

async function fetchCmsJSON<T>(
  path: string,
  hostOverride?: string,
): Promise<T | null> {
  const cmsURL = getCmsBaseUrl();
  const tenantHost = await getForwardedHost(hostOverride);

  const response = await fetch(`${cmsURL}${path}`, {
    headers: {
      "x-forwarded-host": tenantHost,
    },
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export async function fetchPublishedCmsPage(
  slugSegments: string[],
  hostOverride?: string,
) {
  const normalizedSlug = slugSegments.length ? slugSegments.join("/") : "home";
  const payload = await fetchCmsJSON<{ page: CmsPage }>(
    `/api/cms/public/pages/${normalizedSlug}`,
    hostOverride,
  );

  return payload?.page ?? null;
}

export async function fetchPublishedCmsUpdates(
  limit = 5,
  hostOverride?: string,
) {
  const payload = await fetchCmsJSON<{
    updates: Array<Record<string, unknown>>;
  }>(`/api/cms/public/updates?limit=${limit}`, hostOverride);

  return payload?.updates ?? [];
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
