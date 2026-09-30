/** Worker story copy shared by the server page and the client tab view. */
export function WorkerStory({ description }: { description: string }) {
  return (
    <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed font-light">
      <blockquote className="font-medium text-xl text-foreground leading-relaxed mb-8 border-l-4 border-emerald-500 pl-6 italic not-prose">
        &quot;{description}&quot;
      </blockquote>
      <h3>The Mission</h3>
      <p>
        We are committed to long-term sustainable change. By partnering with
        local leaders and utilizing indigenous resources, we ensure that every
        project has community buy-in and lasting impact. Your support
        doesn&apos;t just provide temporary relief; it builds a foundation for
        the future.
      </p>
      <p>
        From organizing community health workshops to overseeing construction
        projects, our days are filled with the hard but rewarding work of
        transformation. We believe that true change happens in the context of
        relationship.
      </p>

      <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
          <h4 className="font-semibold text-foreground mb-2">Direct Impact</h4>
          <p className="text-sm text-muted-foreground">
            100% of your program donation goes directly to the field account
            after processing fees.
          </p>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
          <h4 className="font-semibold text-foreground mb-2">Accountability</h4>
          <p className="text-sm text-muted-foreground">
            We conduct quarterly site visits and financial audits to ensure
            integrity.
          </p>
        </div>
      </div>
    </div>
  );
}
