import { fetchPublishedCmsUpdates } from "@/lib/cms/client";
import { makeDisplayDate } from "@/lib/dates";

/**
 * The only request-time read on the home route: `fetchPublishedCmsUpdates`
 * resolves the tenant from `await headers()` (see `@/lib/cms/client`). Kept in
 * its own component so the caller can wrap just this section in `<Suspense>`
 * and leave the rest of the page in the static shell.
 */
export async function LatestMinistryUpdates() {
  const latestUpdates = await fetchPublishedCmsUpdates(3);

  if (!latestUpdates.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
          From Site Studio
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
          Latest Ministry Updates
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {latestUpdates.map((update) => (
          <article
            key={String(update.id)}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-[transform,box-shadow] duration-200 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md"
          >
            <p className="text-xs font-medium text-zinc-500">
              {typeof update.publishedAt === "string"
                ? makeDisplayDate(update.publishedAt).toLocaleDateString()
                : "Published"}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-zinc-900">
              {String(update.title ?? "Untitled update")}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
              {String(update.excerpt ?? "No summary provided.")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
