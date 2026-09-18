"use client";

import { useMemo, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * False on the server and during the hydration render, true once the client
 * owns the tree. Backed by useSyncExternalStore, so the switch never produces
 * a hydration mismatch and never flashes after paint the way an effect would.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export interface LocaleFormatEnvironment {
  /** BCP 47 locale, or `undefined` for the browser default. */
  locale: string | undefined;
  /** IANA time zone, or `undefined` for the browser default. */
  timeZone: string | undefined;
}

/**
 * Deterministic environment used for the server render and the matching
 * hydration render, so both produce identical text regardless of the host's
 * locale or time zone.
 */
export const SERVER_FORMAT_ENVIRONMENT: LocaleFormatEnvironment = {
  locale: "en-US",
  timeZone: "UTC",
};

const BROWSER_FORMAT_ENVIRONMENT: LocaleFormatEnvironment = {
  locale: undefined,
  timeZone: undefined,
};

export type DateInput = Date | string | number;

export interface LocaleFormatters {
  /** True once formatting reflects the visitor's own locale and time zone. */
  readonly hydrated: boolean;
  /** Same output shape as `Date#toLocaleDateString()` unless options are given. */
  formatDate(value: DateInput, options?: Intl.DateTimeFormatOptions): string;
  /** Same output shape as `Date#toLocaleString()` unless options are given. */
  formatDateTime(
    value: DateInput,
    options?: Intl.DateTimeFormatOptions,
  ): string;
  /** Same output shape as `Date#toLocaleTimeString()` unless options are given. */
  formatTime(value: DateInput, options?: Intl.DateTimeFormatOptions): string;
  /** A cached formatter for callers that already own an options object. */
  dateTimeFormat(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
}

const DATE_DEFAULTS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

const TIME_DEFAULTS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};

const DATE_TIME_DEFAULTS: Intl.DateTimeFormatOptions = {
  ...DATE_DEFAULTS,
  ...TIME_DEFAULTS,
};

// Intl.DateTimeFormat construction is expensive; reuse per environment/options.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getDateTimeFormat(
  environment: LocaleFormatEnvironment,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const resolved: Intl.DateTimeFormatOptions = {
    ...options,
    timeZone: options.timeZone ?? environment.timeZone,
  };
  const key = JSON.stringify([environment.locale ?? null, resolved]);
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(environment.locale, resolved);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatWith(
  environment: LocaleFormatEnvironment,
  value: DateInput,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(value);
  // Mirror Date#toLocale*String(), which never throws on invalid input.
  if (Number.isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return getDateTimeFormat(environment, options).format(date);
}

/** Build formatters bound to one environment (exported for tests and non-hook callers). */
export function createLocaleFormatters(
  environment: LocaleFormatEnvironment,
  hydrated: boolean,
): LocaleFormatters {
  return {
    hydrated,
    formatDate: (value, options) =>
      formatWith(environment, value, options ?? DATE_DEFAULTS),
    formatDateTime: (value, options) =>
      formatWith(environment, value, options ?? DATE_TIME_DEFAULTS),
    formatTime: (value, options) =>
      formatWith(environment, value, options ?? TIME_DEFAULTS),
    dateTimeFormat: (options) => getDateTimeFormat(environment, options),
  };
}

const SERVER_FORMATTERS = createLocaleFormatters(
  SERVER_FORMAT_ENVIRONMENT,
  false,
);
const BROWSER_FORMATTERS = createLocaleFormatters(
  BROWSER_FORMAT_ENVIRONMENT,
  true,
);

/**
 * Locale- and time-zone-aware date formatting that is safe to call during
 * render. The server render and the hydration render use a fixed
 * en-US/UTC environment (identical text on both sides); the very next client
 * render switches to the visitor's locale and time zone.
 */
export function useLocaleFormat(): LocaleFormatters {
  const hydrated = useIsHydrated();
  return useMemo(
    () => (hydrated ? BROWSER_FORMATTERS : SERVER_FORMATTERS),
    [hydrated],
  );
}
