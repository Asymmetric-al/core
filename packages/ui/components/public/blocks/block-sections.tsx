import { renderPublicCmsPageContent } from "@asym/lib/cms/public-page-renderer";

import type {
  CallToActionBlockData,
  FaqBlockData,
  HeroBlockData,
  ImpactStatsBlockData,
  MediaFeatureBlockData,
  RichTextBlockData,
  TestimonialBlockData,
} from "./block-data";
import type { PublicBlockSurface } from "./surface";

/**
 * The section each layout block renders as. Server-safe: no hooks and no
 * browser APIs, so a server page renders them directly. A field left empty
 * is left out, so a half-filled draft never announces an empty heading.
 */

export interface PublicBlockSectionProps<TData> {
  data: TData;
  surface: PublicBlockSurface;
  /** Unique within the page; prefixes keys of repeated items. */
  blockKey: string;
}

export function HeroSection({
  data,
  surface,
}: PublicBlockSectionProps<HeroBlockData>) {
  const image = surface.renderMedia({
    media: data.backgroundImage,
    slot: "banner",
  });

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      {image}
      <div className="space-y-4 p-6">
        {data.eyebrow ? (
          <p className="text-sm font-medium text-muted-foreground">
            {data.eyebrow}
          </p>
        ) : null}
        {data.headline ? (
          <h2 className="text-3xl font-semibold tracking-tight">
            {data.headline}
          </h2>
        ) : null}
        {data.subheading ? (
          <p className="max-w-3xl text-muted-foreground">{data.subheading}</p>
        ) : null}
        {data.primaryAction
          ? surface.renderAction({
              ...data.primaryAction,
              emphasis: "primary",
              openInNewTab: false,
            })
          : null}
      </div>
    </section>
  );
}

export function RichTextSection({
  data,
  blockKey,
}: PublicBlockSectionProps<RichTextBlockData>) {
  const body = renderPublicCmsPageContent(data.body, blockKey);

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      {data.heading ? (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {data.heading}
        </h2>
      ) : null}
      {body ? <div className="prose prose-zinc max-w-none">{body}</div> : null}
    </section>
  );
}

export function MediaFeatureSection({
  data,
  surface,
}: PublicBlockSectionProps<MediaFeatureBlockData>) {
  const image = surface.renderMedia({ media: data.media, slot: "feature" });

  return (
    <section className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 md:flex-row md:items-center">
      <div className="min-w-0 space-y-3 md:flex-1">
        {data.title ? (
          <h2 className="text-2xl font-semibold tracking-tight">
            {data.title}
          </h2>
        ) : null}
        {data.body ? (
          <p className="text-muted-foreground">{data.body}</p>
        ) : null}
      </div>
      {image ? (
        <figure className="space-y-2 md:w-96 md:shrink-0">
          {image}
          {data.mediaCaption ? (
            <figcaption className="text-xs text-muted-foreground">
              {data.mediaCaption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </section>
  );
}

export function CallToActionSection({
  data,
  surface,
}: PublicBlockSectionProps<CallToActionBlockData>) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {data.headline ? (
            <h2 className="text-2xl font-semibold tracking-tight">
              {data.headline}
            </h2>
          ) : null}
          {data.copy ? (
            <p className="text-muted-foreground">{data.copy}</p>
          ) : null}
        </div>
        {data.action
          ? surface.renderAction({
              ...data.action,
              emphasis: "secondary",
              openInNewTab: data.openInNewTab,
            })
          : null}
      </div>
    </section>
  );
}

export function FaqSection({
  data,
  blockKey,
}: PublicBlockSectionProps<FaqBlockData>) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      {data.heading ? (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {data.heading}
        </h2>
      ) : null}
      <div className="space-y-4">
        {data.items.map((item, index) => (
          <div key={`${blockKey}-item-${index}`} className="space-y-1">
            {item.question ? (
              <h3 className="font-semibold">{item.question}</h3>
            ) : null}
            {item.answer ? (
              <p className="text-muted-foreground">{item.answer}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ImpactStatsSection({
  data,
  blockKey,
}: PublicBlockSectionProps<ImpactStatsBlockData>) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      {data.heading ? (
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">
          {data.heading}
        </h2>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {data.items.map((item, index) => (
          <div key={`${blockKey}-stat-${index}`} className="space-y-1">
            {item.value ? (
              <p className="text-3xl font-semibold">{item.value}</p>
            ) : null}
            {item.label ? (
              <p className="text-sm font-medium">{item.label}</p>
            ) : null}
            {item.description ? (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialSection({
  data,
}: PublicBlockSectionProps<TestimonialBlockData>) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      {data.quote ? (
        <blockquote className="text-xl leading-relaxed">
          “{data.quote}”
        </blockquote>
      ) : null}
      {data.attribution || data.role ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {data.attribution ? (
            <span className="font-semibold">{data.attribution}</span>
          ) : null}
          {data.attribution && data.role ? ", " : null}
          {data.role ? <span>{data.role}</span> : null}
        </p>
      ) : null}
    </section>
  );
}
