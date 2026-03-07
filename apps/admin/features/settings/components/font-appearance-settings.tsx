"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { cn } from "@asym/ui/lib/utils";
import { CheckIcon, TypeIcon } from "lucide-react";

import { type FontPairing, useFontPairing } from "@/lib/font-provider";

interface FontPairingMeta {
  id: FontPairing;
  name: string;
  tagline: string;
  description: string;
  heading: string;
  body: string;
  mono: string;
  mood: string[];
  sampleText: string;
  headingStyle: React.CSSProperties;
  bodyStyle: React.CSSProperties;
  monoStyle: React.CSSProperties;
}

const FONT_PAIRINGS: FontPairingMeta[] = [
  {
    id: "product",
    name: "Product",
    tagline: "Warm clarity, built for apps",
    description:
      "Plus Jakarta Sans brings warmth and personality to headings. Inter handles dense data with surgical precision. The go-to for product-led SaaS.",
    heading: "Plus Jakarta Sans",
    body: "Inter",
    mono: "JetBrains Mono",
    mood: ["Default", "Professional", "Friendly"],
    sampleText: "The mission dashboard at a glance",
    headingStyle: { fontFamily: "var(--font-plus-jakarta-sans, var(--font-inter))" },
    bodyStyle: { fontFamily: "var(--font-inter)" },
    monoStyle: { fontFamily: "var(--font-jetbrains-mono, var(--font-geist-mono))" },
  },
  {
    id: "modern-clean",
    name: "Modern Clean",
    tagline: "Neutral precision for data-dense UIs",
    description:
      "Inter everywhere—one font family with perfect optical sizing for dense interfaces. Geist Mono keeps code blocks crisp and readable.",
    heading: "Inter",
    body: "Inter",
    mono: "Geist Mono",
    mood: ["Neutral", "Data-Dense", "SaaS"],
    sampleText: "The mission dashboard at a glance",
    headingStyle: { fontFamily: "var(--font-inter)" },
    bodyStyle: { fontFamily: "var(--font-inter)" },
    monoStyle: { fontFamily: "var(--font-geist-mono)" },
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Vercel-style — one font for everything",
    description:
      "Geist for everything. Ultra-clean, modern, and unmistakably Vercel. Perfect when you want the UI to disappear and the content to lead.",
    heading: "Geist",
    body: "Geist",
    mono: "Geist Mono",
    mood: ["Minimal", "Modern", "Developer"],
    sampleText: "The mission dashboard at a glance",
    headingStyle: { fontFamily: "var(--font-geist, var(--font-inter))" },
    bodyStyle: { fontFamily: "var(--font-geist, var(--font-inter))" },
    monoStyle: { fontFamily: "var(--font-geist-mono)" },
  },
];

function FontCard({
  pairing,
  selected,
  onSelect,
}: {
  pairing: FontPairingMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col text-left w-full rounded-xl border-2 bg-card transition-all duration-200 overflow-hidden",
        "hover:border-foreground/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-foreground shadow-md"
          : "border-border/60"
      )}
    >
      {/* Preview panel */}
      <div
        className={cn(
          "px-5 pt-5 pb-4 flex flex-col gap-3 transition-colors duration-200",
          selected ? "bg-foreground/[0.03]" : "bg-card"
        )}
      >
        {/* Heading sample */}
        <div
          className="text-[1.35rem] font-bold leading-tight tracking-[-0.025em] text-foreground"
          style={pairing.headingStyle}
        >
          {pairing.sampleText}
        </div>

        {/* Body sample */}
        <p
          className="text-[0.8125rem] text-muted-foreground leading-[1.6]"
          style={pairing.bodyStyle}
        >
          Overview · Contributors · Reports · Analytics
        </p>

        {/* Mono sample */}
        <div
          className="text-[0.6875rem] text-muted-foreground/70 bg-muted/60 rounded-md px-2.5 py-1.5 w-fit"
          style={pairing.monoStyle}
        >
          GET /api/contributions/summary
        </div>
      </div>

      <Separator />

      {/* Metadata */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-foreground">
              {pairing.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {pairing.tagline}
            </span>
          </div>

          {/* Selected checkmark */}
          <div
            className={cn(
              "shrink-0 flex size-6 items-center justify-center rounded-full border-2 transition-all duration-200 mt-0.5",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border/60 bg-transparent group-hover:border-foreground/40"
            )}
          >
            {selected && <CheckIcon className="size-3" strokeWidth={3} />}
          </div>
        </div>

        {/* Font stack labels */}
        <div className="flex flex-col gap-1.5">
          <FontStackRow label="Heading" name={pairing.heading} style={pairing.headingStyle} />
          <FontStackRow label="Body" name={pairing.body} style={pairing.bodyStyle} />
          <FontStackRow label="Mono" name={pairing.mono} style={pairing.monoStyle} mono />
        </div>

        {/* Mood tags */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {pairing.mood.map((tag) => (
            <Badge
              key={tag}
              variant={tag === "Default" ? "default" : "secondary"}
              className="text-[10px] h-4 px-1.5 font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
}

function FontStackRow({
  label,
  name,
  style,
  mono = false,
}: {
  label: string;
  name: string;
  style: React.CSSProperties;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 w-10 shrink-0">
        {label}
      </span>
      <span
        className={cn(
          "text-xs text-muted-foreground",
          mono && "font-mono"
        )}
        style={style}
      >
        {name}
      </span>
    </div>
  );
}

export function FontAppearanceSettings() {
  const { font, setFont } = useFontPairing();

  const selected = FONT_PAIRINGS.find((p) => p.id === font) ?? FONT_PAIRINGS[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Section header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/5 border border-border/60">
            <TypeIcon className="size-4 text-foreground/60" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Font Pairing
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose the typeface system for your dashboard. Changes apply instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Font picker grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FONT_PAIRINGS.map((pairing) => (
          <FontCard
            key={pairing.id}
            pairing={pairing}
            selected={font === pairing.id}
            onSelect={() => setFont(pairing.id)}
          />
        ))}
      </div>

      {/* Live preview strip */}
      <div className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            Live Preview — {selected?.name}
          </span>
          <span className="text-[10px] text-muted-foreground/50">
            Heading · Body · Code
          </span>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3
              className="text-2xl font-bold tracking-tight text-foreground"
              style={selected?.headingStyle}
            >
              Mission Control Dashboard
            </h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed"
              style={selected?.bodyStyle}
            >
              Manage contributions, missionaries, and ministry operations from
              one unified platform. Real-time updates keep your team aligned.
            </p>
          </div>
          <div
            className="text-xs bg-muted/60 rounded-lg px-3 py-2 text-muted-foreground/80"
            style={selected?.monoStyle}
          >
            {`const dashboard = await getDashboardSummary({ orgId, period: "month" });`}
          </div>
        </div>
      </div>

      {/* Persistence note */}
      <p className="text-xs text-muted-foreground/60">
        Your font preference is saved locally to this browser. Other team members keep their own preference.
      </p>
    </div>
  );
}
