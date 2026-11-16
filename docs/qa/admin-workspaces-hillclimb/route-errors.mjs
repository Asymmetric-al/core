// Match route boundaries, not ordinary failed lookups or validation notices.
// Sources: apps/admin/app/(app)/error.tsx, global-error.tsx, and not-found.tsx.
const ROUTE_ERROR_HEADING =
  /^(?:This page couldn['’]t load|Something went wrong|Page not found)[.!]?$/i;
const NEXT_APPLICATION_ERROR =
  /^Application error:\s+a (?:client|server)-side exception\b/i;

export function findRouteErrorHeadings(headings) {
  return [
    ...new Set(headings.map((heading) => heading.replace(/\s+/g, " ").trim())),
  ].filter(
    (heading) =>
      ROUTE_ERROR_HEADING.test(heading) || NEXT_APPLICATION_ERROR.test(heading),
  );
}

export async function readRouteErrorHeadings(page) {
  // getByRole excludes hidden headings, including inactive responsive chrome.
  return findRouteErrorHeadings(
    await page.getByRole("heading").allTextContents(),
  );
}
