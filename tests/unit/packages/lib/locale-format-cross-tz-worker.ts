/**
 * Separate-process worker. Intl's default time zone is process-wide, so UTC
 * SSR and America/Los_Angeles hydrate cannot share a Vitest worker.
 *
 * Usage:
 *   TZ=UTC bun <this> --mode=ssr
 *   TZ=America/Los_Angeles bun <this> --mode=hydrate --html='<div>...</div>'
 */
import { JSDOM } from "jsdom";
import { createElement, type ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import {
  createLocaleFormatters,
  useLocaleFormat,
} from "../../../../packages/lib/hooks/use-locale-format";
import { useTimeAgo } from "../../../../packages/lib/hooks/use-time-ago";

const INSTANT = "2026-01-06T05:00:00.000Z";
const DATE_ONLY = "2026-01-05";

export interface LocaleFormatProbeTexts {
  hydrated: string;
  instantDate: string;
  instantDateTime: string;
  dateOnly: string;
  timeAgo: string;
  timeAgoDateOnly: string;
}

function Probe() {
  const { formatDate, formatDateTime, hydrated } = useLocaleFormat();
  const timeAgo = useTimeAgo(INSTANT);
  const timeAgoDateOnly = useTimeAgo(DATE_ONLY);

  return createElement("div", { id: "probe" }, [
    createElement(
      "span",
      { id: "hydrated", key: "hydrated" },
      String(hydrated),
    ),
    createElement(
      "span",
      { id: "instant-date", key: "instant-date" },
      formatDate(INSTANT),
    ),
    createElement(
      "span",
      { id: "instant-datetime", key: "instant-datetime" },
      formatDateTime(INSTANT),
    ),
    createElement(
      "span",
      { id: "date-only", key: "date-only" },
      formatDate(DATE_ONLY),
    ),
    createElement("span", { id: "time-ago", key: "time-ago" }, timeAgo),
    createElement(
      "span",
      { id: "time-ago-date-only", key: "time-ago-date-only" },
      timeAgoDateOnly,
    ),
  ]);
}

function readTexts(root: ParentNode): LocaleFormatProbeTexts {
  const text = (id: string) => root.querySelector(`#${id}`)?.textContent ?? "";
  return {
    hydrated: text("hydrated"),
    instantDate: text("instant-date"),
    instantDateTime: text("instant-datetime"),
    dateOnly: text("date-only"),
    timeAgo: text("time-ago"),
    timeAgoDateOnly: text("time-ago-date-only"),
  };
}

function parseArgs(argv: string[]) {
  const args: { mode: string; html: string } = {
    html: process.env.LOCALE_FORMAT_SSR_HTML ?? "",
    mode: "",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === "--mode") {
      args.mode = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (part.startsWith("--mode=")) {
      args.mode = part.slice("--mode=".length);
    }
  }
  return args;
}

function installDom(body = '<div id="root"></div>') {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, {
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
  const { window } = dom;
  Object.assign(globalThis, {
    window,
    document: window.document,
    navigator: window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  return window.document;
}

async function renderSsr() {
  const html = renderToString(createElement(Probe) as ReactElement);
  const document = installDom(`<div id="root">${html}</div>`);
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("SSR worker missing #root");
  }
  return {
    html,
    texts: readTexts(root),
    resolvedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tz: process.env.TZ ?? "",
  };
}

async function hydrateFromSsr(html: string) {
  const document = installDom(`<div id="root">${html}</div>`);
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("hydrate worker missing #root");
  }

  const initialTexts = readTexts(root);
  const recoverableErrors: string[] = [];

  await new Promise<void>((resolve, reject) => {
    try {
      hydrateRoot(root, createElement(Probe) as ReactElement, {
        onRecoverableError(error) {
          recoverableErrors.push(
            error instanceof Error ? error.message : String(error),
          );
        },
      });
      setTimeout(resolve, 50);
    } catch (error) {
      reject(error);
    }
  });

  return {
    afterTexts: readTexts(root),
    initialTexts,
    recoverableErrors,
    resolvedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tz: process.env.TZ ?? "",
  };
}

function visitorFormatters() {
  const formatters = createLocaleFormatters(
    { locale: "en-US", timeZone: "America/Los_Angeles" },
    true,
  );
  return {
    dateOnly: formatters.formatDate(DATE_ONLY),
    dateOnlyExplicitLa: formatters.formatDate(DATE_ONLY, {
      timeZone: "America/Los_Angeles",
    }),
    instantDate: formatters.formatDate(INSTANT),
    instantDateTime: formatters.formatDateTime(INSTANT),
    instantTime: formatters.formatTime(INSTANT),
    resolvedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

async function main() {
  const { mode, html } = parseArgs(process.argv.slice(2));

  if (mode === "ssr") {
    process.stdout.write(`${JSON.stringify(await renderSsr())}\n`);
    return;
  }

  if (mode === "hydrate") {
    if (!html) {
      throw new Error("hydrate mode requires --html");
    }
    process.stdout.write(`${JSON.stringify(await hydrateFromSsr(html))}\n`);
    return;
  }

  if (mode === "visitor") {
    process.stdout.write(`${JSON.stringify(visitorFormatters())}\n`);
    return;
  }

  throw new Error(`Unknown mode: ${mode || "(missing)"}`);
}

if (import.meta.main) {
  await main();
}
