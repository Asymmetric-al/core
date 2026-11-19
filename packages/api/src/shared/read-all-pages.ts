/**
 * Reads every row a query matches, a page at a time, until a page comes back
 * empty (council round 2 on WP2a, R2). Each page starts after the rows
 * already received, so a server that returns fewer rows than a page asks for
 * (the Data API's `max_rows`, a dashboard setting on hosted Supabase) cannot
 * cut the result. `page(from, to)` must order by a unique key and apply
 * `.range(from, to)`.
 */
export async function readAllPages<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = READ_ALL_PAGE_SIZE,
): Promise<T[]> {
  const rows: T[] = [];
  for (let pages = 0; pages < MAX_PAGES; pages += 1) {
    const { data, error } = await page(rows.length, rows.length + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return rows;
    rows.push(...data);
  }
  throw new Error(
    `readAllPages: more than ${MAX_PAGES} pages; is the query ranged?`,
  );
}

/** Rows asked for per page; under the Data API's default `max_rows` (1,000). */
export const READ_ALL_PAGE_SIZE = 500;

/** A query that ignores its range would never come back empty. */
const MAX_PAGES = 10_000;
