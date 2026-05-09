export default function Loading() {
  return (
    <div className="flex flex-col gap-10 p-4 pb-20 sm:p-6 lg:p-8">
      <div className="space-y-4 border-b border-border pb-8">
        <div className="h-14 w-72 animate-pulse rounded-2xl bg-muted" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-muted" />
      </div>

      <div className="space-y-8">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="h-4 w-52 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded-full bg-muted" />
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="h-28 animate-pulse rounded-2xl border border-border bg-card"
              key={index}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="h-20 animate-pulse rounded-2xl bg-muted"
                key={index}
              />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-3xl border border-border bg-card" />
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-3xl border border-border bg-card" />
            <div className="h-48 animate-pulse rounded-3xl border border-border bg-card" />
          </div>
        </div>
      </div>
    </div>
  );
}
