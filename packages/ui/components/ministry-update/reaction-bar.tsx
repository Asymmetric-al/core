"use client";

/**
 * Ministry Update engagement — the shared reaction bar.
 *
 * One component renders the reactions (love/prayer/fire) and the comment
 * affordance for a Ministry Update on every surface:
 *
 * - `appearance="chip"` reproduces the missionary feed treatment: emoji
 *   chips with a particle burst on activation, a rolling count, and an
 *   active glow.
 * - `appearance="quiet"` reproduces the donor feed treatment: minimal
 *   icon + count buttons.
 *
 * `prefers-reduced-motion` disables the particle burst and every
 * scale/rotate keyframe; active state stays visible through color and fill
 * (invariant I4). `readOnly` renders static accessible text with zero
 * network activity and no provider requirements (invariant I3).
 */

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion as m,
  useReducedMotion,
} from "@asym/lib/motion";
import { Flame, HandHeart, Heart, MessageCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { CommentsDialog } from "./comments-dialog";
import { httpEngagementTransport } from "./engagement-transport";
import { REACTION_KINDS, toEngagementSnapshot } from "./normalize";
import { recordLocalComment, useEngagement } from "./use-engagement";

import type { EngagementTransport } from "./engagement-transport";
import type {
  MinistryUpdateSnapshotInput,
  ReactionKind,
  ReactionState,
} from "./normalize";
import type {
  EngagementErrorContext,
  UseEngagementOptions,
} from "./use-engagement";

/** How the comment affordance behaves. */
type CommentsMode =
  | "dialog"
  | "hidden"
  | { onOpen: (updateId: string) => void };

/** Props for {@link ReactionBar}. */
export interface ReactionBarProps {
  /** The Ministry Update row, in any supported wire dialect. */
  update: MinistryUpdateSnapshotInput;
  /** Which reactions to render; defaults to all three. */
  reactions?: readonly ReactionKind[];
  /**
   * Comment affordance: `"dialog"` (default) opens the module-owned
   * comments dialog (requires a `QueryClientProvider` above once opened),
   * `{ onOpen }` delegates presentation to the caller, and `"hidden"`
   * removes the affordance entirely.
   */
  comments?: CommentsMode;
  /** Visual treatment; defaults to `"chip"`. */
  appearance?: "chip" | "quiet";
  /**
   * Render static, accessible engagement text: no interactive elements, no
   * network activity, and no provider requirements.
   */
  readOnly?: boolean;
  /** Persistence seam; defaults to the HTTP transport. */
  transport?: EngagementTransport;
  /** Forwarded to {@link useEngagement}: fires on shared snapshot changes. */
  onChange?: UseEngagementOptions["onChange"];
  /**
   * Forwarded to {@link useEngagement}: replaces the default error toast
   * after a failed (and rolled-back) toggle.
   */
  onError?: (error: unknown, context: EngagementErrorContext) => void;
  /** Extra classes for the bar container. */
  className?: string;
}

interface ReactionVisualConfig {
  emoji: string;
  label: string;
  pluralNoun: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
  fillWhenActive: boolean;
  activeText: string;
  chipActiveBg: string;
  chipHoverBg: string;
  glowColor: string;
}

const REACTION_VISUALS: Record<ReactionKind, ReactionVisualConfig> = {
  love: {
    emoji: "❤️",
    label: "Love",
    pluralNoun: "loves",
    icon: Heart,
    fillWhenActive: true,
    activeText: "text-rose-600",
    chipActiveBg: "bg-rose-50/80",
    chipHoverBg: "hover:bg-rose-50",
    glowColor: "rgba(225, 29, 72, 0.2)",
  },
  prayer: {
    emoji: "🙏",
    label: "Pray",
    pluralNoun: "prayers",
    icon: HandHeart,
    fillWhenActive: false,
    activeText: "text-primary",
    chipActiveBg: "bg-primary/10",
    chipHoverBg: "hover:bg-primary/10",
    glowColor: "rgba(79, 70, 229, 0.2)",
  },
  fire: {
    emoji: "🔥",
    label: "Fire",
    pluralNoun: "fires",
    icon: Flame,
    fillWhenActive: true,
    activeText: "text-amber-600",
    chipActiveBg: "bg-amber-50/80",
    chipHoverBg: "hover:bg-amber-100",
    glowColor: "rgba(217, 119, 6, 0.2)",
  },
};

const PARTICLE_COUNT = 8;
const PARTICLE_LIFETIME_MS = 1500;

interface Particle {
  id: number;
  offsetX: number;
  offsetRotate: number;
}

/** Celebratory emoji burst on activation (skipped under reduced motion). */
function FloatingEmoji({
  emoji,
  offsetX,
  offsetRotate,
}: {
  emoji: string;
  offsetX: number;
  offsetRotate: number;
}): React.JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95, y: 0, x: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.95, 1.4, 1.1, 0.85],
        y: [-20, -100],
        x: offsetX,
        rotate: offsetRotate,
      }}
      transition={{ duration: 1.0, ease: "easeOut", times: [0, 0.2, 0.8, 1] }}
      className="pointer-events-none absolute z-50 text-2xl drop-shadow-md"
      aria-hidden="true"
    >
      {emoji}
    </m.div>
  );
}

interface ReactionButtonProps {
  kind: ReactionKind;
  state: ReactionState;
  reduceMotion: boolean;
  onToggle: () => void;
}

/** Rich chip treatment (missionary feed): burst, count roll, active glow. */
function ChipReactionButton({
  kind,
  state,
  reduceMotion,
  onToggle,
}: ReactionButtonProps): React.JSX.Element {
  const config = REACTION_VISUALS[kind];
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      for (const timeout of timeouts) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const handleClick = () => {
    const activating = !state.mine;
    if (activating && !reduceMotion) {
      const burst: Particle[] = Array.from(
        { length: PARTICLE_COUNT },
        (_, index) => ({
          id: Date.now() + index,
          offsetX: (Math.random() - 0.5) * 80,
          offsetRotate: (Math.random() - 0.5) * 90,
        }),
      );
      setParticles((previous) => [...previous, ...burst]);
      const timeout = setTimeout(() => {
        setParticles((previous) =>
          previous.filter(
            (particle) => !burst.some((b) => b.id === particle.id),
          ),
        );
      }, PARTICLE_LIFETIME_MS);
      timeoutsRef.current.push(timeout);
    }
    onToggle();
  };

  const countOrLabel = state.count > 0 ? state.count : config.label;

  return (
    <div className="relative">
      <AnimatePresence>
        {particles.map((particle) => (
          <FloatingEmoji
            key={particle.id}
            emoji={config.emoji}
            offsetX={particle.offsetX}
            offsetRotate={particle.offsetRotate}
          />
        ))}
      </AnimatePresence>
      <m.button
        type="button"
        aria-pressed={state.mine}
        data-active={state.mine ? "" : undefined}
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.1,
                y: -4,
                boxShadow: `0 12px 24px -8px ${config.glowColor}`,
              }
        }
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        onClick={handleClick}
        className={cn(
          "group relative flex h-10 items-center gap-2.5 overflow-hidden rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-[background-color,color,box-shadow,border-color] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]",
          state.mine
            ? cn(
                config.chipActiveBg,
                config.activeText,
                "shadow-lg ring-1 ring-black/5",
              )
            : cn(
                "border border-border bg-background text-muted-foreground hover:text-foreground",
                config.chipHoverBg,
              ),
        )}
      >
        {reduceMotion ? (
          <span
            className="relative z-10 select-none text-lg"
            aria-hidden="true"
          >
            {config.emoji}
          </span>
        ) : (
          <m.div
            className="relative z-10 select-none text-lg"
            aria-hidden="true"
            animate={
              state.mine ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}
            }
            transition={{ duration: 0.4 }}
          >
            {config.emoji}
          </m.div>
        )}

        <span className="sr-only">{config.label}</span>

        {reduceMotion ? (
          <span className="relative z-10 min-w-[1ch] tabular-nums">
            {countOrLabel}
          </span>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={state.count}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative z-10 min-w-[1ch] tabular-nums"
            >
              {countOrLabel}
            </m.span>
          </AnimatePresence>
        )}

        {state.mine &&
          (reduceMotion ? (
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent"
              aria-hidden="true"
            />
          ) : (
            <m.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent"
              aria-hidden="true"
            />
          ))}
      </m.button>
    </div>
  );
}

/** Quiet treatment (donor feed): minimal icon + count. */
function QuietReactionButton({
  kind,
  state,
  reduceMotion,
  onToggle,
}: ReactionButtonProps): React.JSX.Element {
  const config = REACTION_VISUALS[kind];
  const Icon = config.icon;
  const fillActive = state.mine && config.fillWhenActive;

  return (
    <m.button
      type="button"
      aria-pressed={state.mine}
      data-active={state.mine ? "" : undefined}
      whileTap={reduceMotion ? undefined : { scale: 0.85 }}
      onClick={onToggle}
      className={cn(
        "group flex items-center gap-2 rounded-full px-3 py-2 transition-colors duration-150 hover:bg-muted/60",
        state.mine
          ? config.activeText
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-5 transition-transform duration-150",
          fillActive && "fill-current",
          state.mine
            ? "scale-110"
            : "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110",
        )}
        strokeWidth={fillActive ? 0 : 1.5}
      />
      <span className="sr-only">{config.label}</span>
      <span className="text-xs font-semibold tabular-nums">{state.count}</span>
    </m.button>
  );
}

function CommentsButton({
  appearance,
  count,
  onOpen,
}: {
  appearance: "chip" | "quiet";
  count: number;
  onOpen: () => void;
}): React.JSX.Element {
  if (appearance === "chip") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex h-10 items-center gap-2.5 rounded-2xl border border-border bg-background px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <MessageCircle aria-hidden className="size-4" strokeWidth={1.5} />
        <span className="sr-only">Comments</span>
        <span className="min-w-[1ch] tabular-nums">{count}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground"
    >
      <MessageCircle
        aria-hidden
        className="size-5 transition-transform [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110"
        strokeWidth={1.5}
      />
      <span className="sr-only">Comments</span>
      <span className="text-xs font-semibold tabular-nums">{count}</span>
    </button>
  );
}

type StaticReactionBarProps = Pick<ReactionBarProps, "update" | "className"> & {
  reactions: readonly ReactionKind[];
  showComments: boolean;
};

/**
 * Read-only rendering (invariant I3): static accessible text, zero network,
 * no interactive elements, and no provider requirements.
 */
function StaticReactionBar({
  update,
  reactions,
  showComments,
  className,
}: StaticReactionBarProps): React.JSX.Element {
  const snapshot = toEngagementSnapshot(update);

  return (
    <div
      data-slot="reaction-bar"
      data-read-only=""
      className={cn(
        "flex items-center gap-4 text-sm text-muted-foreground",
        className,
      )}
    >
      {reactions.map((kind) => {
        const config = REACTION_VISUALS[kind];
        const state = snapshot[kind];
        return (
          <span
            key={kind}
            className={cn(
              "inline-flex items-center gap-1.5 tabular-nums",
              state.mine && cn(config.activeText, "font-semibold"),
            )}
          >
            <span aria-hidden="true">{config.emoji}</span>
            <span>{state.count}</span>
            <span className="sr-only">{config.pluralNoun}</span>
          </span>
        );
      })}
      {showComments && (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <MessageCircle aria-hidden className="size-4" strokeWidth={1.5} />
          <span>{snapshot.commentCount}</span>
          <span className="sr-only">comments</span>
        </span>
      )}
    </div>
  );
}

type InteractiveReactionBarProps = Pick<
  ReactionBarProps,
  "update" | "onChange" | "onError" | "className"
> & {
  reactions: readonly ReactionKind[];
  comments: CommentsMode;
  appearance: "chip" | "quiet";
  transport: EngagementTransport;
};

function InteractiveReactionBar({
  update,
  reactions,
  comments,
  appearance,
  transport,
  onChange,
  onError,
  className,
}: InteractiveReactionBarProps): React.JSX.Element {
  const { snapshot, toggle } = useEngagement(update, {
    transport,
    onChange,
    onError,
  });
  const reduceMotion = useReducedMotion() === true;
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [commentsMounted, setCommentsMounted] = React.useState(false);

  const openComments = () => {
    if (comments === "hidden") {
      return;
    }
    if (typeof comments === "object") {
      comments.onOpen(snapshot.updateId);
      return;
    }
    // Mount the dialog (and its react-query usage) only once the viewer
    // actually opens comments; fetching is lazy behind `enabled: open`.
    setCommentsMounted(true);
    setCommentsOpen(true);
  };

  const ReactionButton =
    appearance === "chip" ? ChipReactionButton : QuietReactionButton;

  return (
    <LazyMotion features={domAnimation}>
      <div
        data-slot="reaction-bar"
        className={cn(
          "flex items-center",
          appearance === "chip" ? "gap-3" : "gap-2",
          className,
        )}
      >
        {reactions.map((kind) => (
          <ReactionButton
            key={kind}
            kind={kind}
            state={snapshot[kind]}
            reduceMotion={reduceMotion}
            onToggle={() => toggle(kind)}
          />
        ))}
        {comments !== "hidden" && (
          <CommentsButton
            appearance={appearance}
            count={snapshot.commentCount}
            onOpen={openComments}
          />
        )}
      </div>
      {comments === "dialog" && commentsMounted && (
        <CommentsDialog
          updateId={snapshot.updateId}
          transport={transport}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
          onCommentAdded={() => recordLocalComment(snapshot.updateId)}
        />
      )}
    </LazyMotion>
  );
}

/**
 * The shared engagement bar for a Ministry Update: reactions plus the
 * comment affordance, with identical counts, viewer state, and persistence
 * on every surface.
 *
 * Interactive by default; every interactive toggle persists through the
 * transport (there is intentionally no way to render interactive reactions
 * without transport-backed persistence). Pass `readOnly` for a static,
 * provider-free rendering with zero network activity.
 */
export function ReactionBar({
  update,
  reactions = REACTION_KINDS,
  comments = "dialog",
  appearance = "chip",
  readOnly = false,
  transport = httpEngagementTransport,
  onChange,
  onError,
  className,
}: ReactionBarProps): React.JSX.Element {
  if (readOnly) {
    return (
      <StaticReactionBar
        update={update}
        reactions={reactions}
        showComments={comments !== "hidden"}
        className={className}
      />
    );
  }
  return (
    <InteractiveReactionBar
      update={update}
      reactions={reactions}
      comments={comments}
      appearance={appearance}
      transport={transport}
      onChange={onChange}
      onError={onError}
      className={className}
    />
  );
}
