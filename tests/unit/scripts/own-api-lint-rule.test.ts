import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";

import { noDirectOwnApiCall } from "../../../tooling/eslint-config/own-api.mjs";

/**
 * The own-API lint rule (plan 5.2, "Calls from a page to the app's own API
 * carry the tenant too"; WP2b, AL-2675): page code reaches the app's `/api`
 * routes only through `ownApiFetch`, which sends the document's tenant and
 * assignment. Every other way of reaching an own-API path is refused.
 */

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

const call = [{ messageId: "call" }] as const;
const navigation = [{ messageId: "navigation" }] as const;

ruleTester.run("own-api/no-direct-call", noDirectOwnApiCall, {
  valid: [
    // The wrapper itself, and every call through it.
    "export async function ownApiFetch(path: string, init?: RequestInit) { return fetch(path, init); }",
    'import { ownApiFetch } from "@asym/database/own-api"; ownApiFetch("/api/admin/funds?limit=200");',
    // Other origins and other paths.
    'fetch("https://api.cloudinary.com/v1_1/demo/image/upload", { method: "POST" });',
    'import { cmsURL } from "./config"; fetch(`${cmsURL}/api/cms/public/updates`);',
    'fetch("/web-studio/api/pages");',
    'fetch("/apiary");',
    'fetch("/_next/data/x.json");',
    // An address the module cannot see is out of the rule's sight.
    'import { createUrl } from "./create-url"; fetch(createUrl, { method: "POST" });',
    "export async function load(url: string) { return fetch(url); }",
    // A local or imported `fetch` is not the global one.
    'const fetch = (path: string) => path; fetch("/api/admin/funds");',
    'import { fetch } from "undici"; fetch("/api/admin/funds");',
    // Navigations to page addresses, and a non-transport `open`.
    'const link = <a href="/donor-dashboard/history">History</a>;',
    "const [open, setOpen] = [false, (value: boolean) => value]; setOpen(!open);",
    'window.open("https://example.org/help");',
    // Test doubles that name an own-API path are not calls.
    'page.route("**/api/admin/member-care/dashboard", handler);',
  ],
  invalid: [
    { code: 'fetch("/api/admin/funds?limit=200");', errors: call },
    {
      code: "fetch(`/api/admin/contributions?${params}`, { signal });",
      errors: call,
    },
    { code: 'window.fetch("/api/posts");', errors: call },
    { code: 'globalThis.fetch("/api/posts");', errors: call },
    { code: 'self.fetch("/api/posts");', errors: call },
    { code: 'await fetch("/api");', errors: call },
    // Followed through the module.
    {
      code: 'const PLATFORM_OWNERS_URL = "/api/admin/users?limit=100"; fetch(PLATFORM_OWNERS_URL);',
      errors: call,
    },
    {
      code: 'const url = id ? `/api/pdf-templates/${id}` : "/api/pdf-templates"; fetch(url, { method: "PUT" });',
      errors: call,
    },
    {
      code: 'let path = "/api/a"; path = other; fetch(path);',
      errors: call,
    },
    {
      code: 'async function getJson(url: string) { const response = await fetch(url); return response.json(); } getJson("/api/admin/posts?limit=100");',
      errors: call,
    },
    {
      code: 'const getJson = async <T,>(url: string): Promise<T> => (await fetch(url)).json(); void getJson("/api/admin/comments");',
      errors: call,
    },
    {
      code: 'const send = useCallback((path: string) => fetch(path), []); send("/api/posts");',
      errors: call,
    },
    {
      code: 'function load(path = "/api/profile") { return fetch(path); }',
      errors: call,
    },
    {
      code: 'fetch(new URL("/api/posts", window.location.origin));',
      errors: call,
    },
    {
      code: 'fetch(new URL("/api/posts", window.location.origin).toString());',
      errors: call,
    },
    { code: 'fetch("/api/missionary/tasks/" + id);', errors: call },
    {
      code: 'fetch(("/api/posts" as string), { method: "POST" });',
      errors: call,
    },
    // Every other transport.
    { code: 'navigator.sendBeacon("/api/vitals", body);', errors: call },
    { code: 'new EventSource("/api/admin/stream");', errors: call },
    { code: 'fetch(new Request("/api/posts"));', errors: call },
    {
      code: 'const xhr = new XMLHttpRequest(); xhr.open("POST", "/api/upload/image");',
      errors: call,
    },
    // Navigations carry no header.
    {
      code: "window.open(`/api/admin/contribution-operations/receipt-snapshots/${id}`);",
      errors: navigation,
    },
    {
      code: 'location.assign("/api/donor/statements/2026");',
      errors: navigation,
    },
    {
      code: 'window.location.href = "/api/donor/statements/2026";',
      errors: navigation,
    },
    {
      code: "const link = <a href={`/api/donor/statements/${year}`}>Statement</a>;",
      errors: navigation,
    },
    {
      code: 'const link = <a href="/api/admin/crm/reports/export?slice=donors">Export</a>;',
      errors: navigation,
    },
  ],
});
