import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import { defaultTheme, ProgressBar, RootProvider } from "@payloadcms/ui";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { getClientConfig } from "@payloadcms/ui/utilities/getClientConfig";
import { getRequestHighContrast } from "@payloadcms/ui/utilities/getRequestHighContrast";
import { headers as nextHeaders } from "next/headers";
import Link from "next/link";
import {
  createLocalReq,
  executeAuthStrategies,
  getAccessResults,
  getLocalI18n,
  getPayload,
  getRequestLanguage,
  parseCookies,
} from "payload";
import { applyLocaleFiltering, PREFERENCE_KEYS } from "payload/shared";
import "@/src/styles/payloadStyles.css";

import { importMap } from "./web-studio/importMap";

import type { Theme } from "@payloadcms/ui";
import type {
  LanguageOptions,
  PayloadRequest,
  ServerFunctionClient,
} from "payload";

import {
  assertPayloadDatabaseConfiguration,
  PayloadDatabaseConfigurationError,
} from "@/src/cms/payload-database-config";
import { NextRouterAdapter } from "@/src/cms/payload-next-router-adapter";

type Props = {
  children: React.ReactNode;
};

type PayloadConfig = Awaited<typeof config>;

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";

  try {
    return await handleServerFunctions({
      ...args,
      config,
      importMap,
    });
  } catch (cause: unknown) {
    const name =
      typeof args === "object" &&
      args !== null &&
      "name" in args &&
      typeof (args as { name: unknown }).name === "string"
        ? (args as { name: string }).name
        : "unknown";

    // Payload UI catches server-function failures and does `console.error(_err)`.
    // A rejection with `undefined` surfaces as a useless "undefined" in the Next overlay.
    if (cause === undefined) {
      throw new Error(
        `[Payload] Server function "${name}" failed: rejection was undefined (often dev-only: streaming / Turbopack / aborted RSC). Check the dev server terminal for the underlying stack.`,
      );
    }

    throw cause;
  }
};

/**
 * Block: the Payload admin resolves auth, access rules and nav preferences
 * before it can render `children` at all, so there is nothing to lift into a
 * static shell — a boundary here would only produce an empty one.
 */
export const instant = false;

/** The shell can never hold segment data here, so don't spend a prefetch on it. */
export const prefetch = "force-disabled";

export default function PayloadLayout({ children }: Props) {
  return <PayloadEmbeddedLayout>{children}</PayloadEmbeddedLayout>;
}

async function PayloadEmbeddedLayout({ children }: Props) {
  try {
    assertPayloadDatabaseConfiguration();
  } catch (cause) {
    if (cause instanceof PayloadDatabaseConfigurationError) {
      console.error(cause);
      return <WebStudioDatabaseConfigurationError error={cause} />;
    }

    throw cause;
  }

  const headerStore = await nextHeaders();
  const parsedCookies = parseCookies(headerStore);
  const payload = await getPayload({
    config,
    cron: true,
    importMap,
  });
  const languageCode = getRequestLanguage({
    config: payload.config,
    cookies: parsedCookies,
    headers: headerStore,
  });
  const i18n = await getLocalI18n({
    config: payload.config,
    language: languageCode,
  });
  const { responseHeaders, user } = await executeAuthStrategies({
    headers: headerStore,
    payload,
  });
  const req = await createLocalReq(
    {
      req: {
        headers: headerStore,
        host: headerStore.get("host") ?? undefined,
        i18n,
        responseHeaders,
        user,
      },
    },
    payload,
  );
  const permissions = await getAccessResults({ req });
  const clientConfig = getClientConfig({
    config: payload.config,
    i18n: req.i18n,
    importMap,
    user: req.user as never,
  });

  await applyLocaleFiltering({
    clientConfig,
    config: payload.config,
    req,
  });

  return (
    <RootProvider
      RouterAdapter={NextRouterAdapter}
      config={clientConfig}
      dateFNSKey={req.i18n.dateFNSKey}
      fallbackLang={payload.config.i18n.fallbackLanguage ?? "en"}
      highContrastMode={getRequestHighContrast({
        config: payload.config,
        cookies: parsedCookies,
        headers: headerStore,
      })}
      isNavOpen={(await getPayloadNavPreference(req))?.open ?? true}
      languageCode={languageCode}
      languageOptions={buildLanguageOptions(payload.config)}
      locale={req.locale ?? undefined}
      permissions={permissions}
      serverFunction={serverFunction}
      theme={getPayloadTheme({
        config: payload.config,
        cookies: parsedCookies,
        headers: headerStore,
      })}
      translations={req.i18n.translations}
      user={req.user}
    >
      <style>{`@layer payload-default, payload;`}</style>
      <ProgressBar />
      {renderPayloadProviders({
        children,
        permissions,
        req,
      })}
      <div id="portal" />
    </RootProvider>
  );
}

function WebStudioDatabaseConfigurationError({
  error,
}: {
  error: PayloadDatabaseConfigurationError;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 text-zinc-950">
      <section className="w-full max-w-[520px] rounded-lg border border-zinc-200 bg-white p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
          Web Studio
        </p>
        <h1 className="mb-3 text-2xl font-semibold">
          Payload database configuration needs attention
        </h1>
        <p className="m-0 text-sm leading-6 text-zinc-600">{error.message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            href="/"
          >
            Dashboard
          </Link>
          <Link
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800"
            href="/web-studio"
          >
            Retry
          </Link>
        </div>
      </section>
    </main>
  );
}

function buildLanguageOptions(payloadConfig: PayloadConfig): LanguageOptions {
  return Object.entries(
    payloadConfig.i18n.supportedLanguages || {},
  ).reduce<LanguageOptions>((acc, [language, languageConfig]) => {
    if (Object.keys(payloadConfig.i18n.supportedLanguages).includes(language)) {
      acc.push({
        label: languageConfig.translations.general.thisLanguage,
        value: language as LanguageOptions[number]["value"],
      });
    }

    return acc;
  }, []);
}

async function getPayloadNavPreference(req: PayloadRequest) {
  if (!req.user?.collection) {
    return null;
  }

  const result = await req.payload.find({
    collection: "payload-preferences",
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        {
          key: {
            equals: PREFERENCE_KEYS.NAV,
          },
        },
        {
          "user.relationTo": {
            equals: req.user.collection,
          },
        },
        {
          "user.value": {
            equals: req.user.id,
          },
        },
      ],
    },
  });

  return result.docs[0]?.value as { open?: boolean } | null | undefined;
}

function getPayloadTheme({
  config: payloadConfig,
  cookies,
  headers,
}: {
  config: PayloadConfig;
  cookies: ReturnType<typeof parseCookies>;
  headers: Headers;
}): Theme {
  const acceptedThemes = new Set<Theme>(["dark", "light"]);
  if (
    payloadConfig.admin.theme !== "all" &&
    acceptedThemes.has(payloadConfig.admin.theme)
  ) {
    return payloadConfig.admin.theme;
  }

  const themeCookie = cookies.get(
    `${payloadConfig.cookiePrefix || "payload"}-theme`,
  );
  const themeFromCookie = themeCookie;
  if (acceptedThemes.has(themeFromCookie as Theme)) {
    return themeFromCookie as Theme;
  }

  const themeFromHeader = headers.get("Sec-CH-Prefers-Color-Scheme");
  if (acceptedThemes.has(themeFromHeader as Theme)) {
    return themeFromHeader as Theme;
  }

  return defaultTheme;
}

function renderPayloadProviders({
  children,
  permissions,
  req,
}: {
  children: React.ReactNode;
  permissions: Awaited<ReturnType<typeof getAccessResults>>;
  req: PayloadRequest;
}) {
  const providers = req.payload.config.admin.components?.providers;
  if (!Array.isArray(providers) || providers.length === 0) {
    return children;
  }

  return renderNestedPayloadProviders({
    children,
    permissions,
    providers,
    req,
  });
}

function renderNestedPayloadProviders({
  children,
  permissions,
  providers,
  req,
}: {
  children: React.ReactNode;
  permissions: Awaited<ReturnType<typeof getAccessResults>>;
  providers: NonNullable<PayloadConfig["admin"]["components"]>["providers"];
  req: PayloadRequest;
}): React.ReactNode {
  if (!providers?.length) {
    return children;
  }

  return RenderServerComponent({
    clientProps: {
      children:
        providers.length > 1
          ? renderNestedPayloadProviders({
              children,
              permissions,
              providers: providers.slice(1),
              req,
            })
          : children,
    },
    Component: providers[0],
    importMap,
    serverProps: {
      i18n: req.i18n,
      payload: req.payload,
      permissions,
      user: req.user,
    },
  });
}
