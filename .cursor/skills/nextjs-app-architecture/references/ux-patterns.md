# UX patterns

Interaction decisions on top of the architecture: which feedback mechanism to reach for, and the boundary edge-cases that trip agents up. Hook mechanics live in the React / Next docs — linked, not restated. The deeper end-to-end picture is the Building interactive apps guide (installed: `node_modules/next/dist/docs/01-app/02-guides/interactive-apps.md`).

## Choose the feedback mechanism

| Situation                                          | Reach for                                                                           | Key rule                                                                                                                                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mutation unlikely to fail (favorite, vote, follow) | [`useOptimistic`](https://react.dev/reference/react/useOptimistic)                  | Update immediately, roll back on throw. Set it inside a transition; inside `<form action>` React opens the transition for you. Use a reducer for counters.                                |
| No optimistic fit (filters, sort, navigation)      | [`useTransition`](https://react.dev/reference/react/useTransition) + `data-pending` | Put `data-pending` on the pending node; let ancestors react with CSS (`has-data-pending:` for a direct parent, `group-has-data-pending:` further up) so it bubbles without prop drilling. |
| Form field validation ("fix this field")           | [`useActionState`](https://react.dev/reference/react/useActionState)                | Action returns `{ error }`; render inline with `aria-invalid` + `role="alert"`.                                                                                                           |
| Submit disable + spinner                           | [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)        | Call it from a child of `<form>`, not the form component itself.                                                                                                                          |
| One-shot result with no visible change             | toast                                                                               | See below.                                                                                                                                                                                |

### Name the signal when a subtree has more than one pending source

`data-pending` bubbles through CSS, so every descendant that sets it participates. `useLinkStatus` returns `{ pending }`; application code must explicitly render `data-pending={pending || undefined}` on a descendant of the Link. A link contributes to the selector only if that wiring exists, which means `group-has-data-pending:` on a page wrapper also fires for ordinary navigation and dims content that is not being refetched. When a subtree can be pending for more than one reason, give the reason you are reacting to its own attribute (`data-filtering`, `data-saving`) and key the ancestor off that.

```tsx
"use client";

import { useLinkStatus } from "next/link";

// Render this Client Component inside the Link it observes.
export function PendingHint() {
  const { pending } = useLinkStatus();
  return <span aria-hidden="true" data-pending={pending || undefined} />;
}
```

### Two things to get right with `useOptimistic`

- The value reverts as soon as its transition settles, so the work it predicts has to run **inside the same** `startTransition`. Setting the optimistic value in one transition and navigating in another snaps it back before the URL changes.
- A successful mutation must commit its canonical result to the base state or refresh/invalidate the owning data cache so new authoritative props arrive. Otherwise the optimistic value disappears when the transition settles.
- Derive the controls from the optimistic value and the surrounding chrome from the committed one. A slider thumb should follow the drag immediately, but a "Clear all filters" button keyed off that same optimistic value appears while the filter is still in flight.

`useOptimistic(false)` also works as a transition-scoped **pending flag** that resets automatically when the transition settles — handy when you don't need the `data-pending` bubbling.

## Optimistic mutations for interactive apps

For create/update/delete flows where the changed item is visible, prefer one feature-owned optimistic reducer over hand-rolled pending state spread across the board, modal, and list.

```tsx
type OptimisticListAction<TItem> =
  | { type: "create"; item: TItem }
  | { type: "update"; item: TItem }
  | { type: "delete"; id: string }
  | { type: "rollback"; id: string };

const [items, dispatchOptimisticItem] = useOptimistic(
  initialItems,
  optimisticListReducer,
);
```

Use names that describe the app's domain (`dispatchOptimisticPost`, `messageReducer`, `groupReducer`, `eventReducer`) rather than implementation mechanics like `applyOptimisticAction`. The reducer owns the optimistic list shape; components dispatch intent.

For modal creates, apply the optimistic item and close the modal immediately when the local form is valid. If the action fails, roll back and show an error toast. Keeping the modal open with a slow primary button makes the optimistic result feel broken.

For deletes, remove optimistically, then roll back on failure. Do not wait for the server before the item disappears when the user's intent is clear.

### Commit the canonical mutation result

This Client Component keeps the confirmed value as the optimistic base. `save`
is an approved client hook/API transport or real Server Action, never an ordinary
server-only API export. If props/cache own the base instead, update that owner
rather than creating a second local copy.

```tsx
"use client";

import { useOptimistic, useState, useTransition } from "react";

export function OptimisticToggle({
  initialLiked,
  save,
}: {
  initialLiked: boolean;
  save: (next: boolean) => Promise<boolean>;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function toggle() {
    const next = !optimisticLiked;
    startTransition(async () => {
      setError(undefined);
      setOptimisticLiked(next);
      try {
        const canonical = await save(next);
        startTransition(() => setLiked(canonical));
      } catch {
        setError("Unable to save. Please try again.");
      }
    });
  }

  return (
    <>
      <button type="button" disabled={pending} onClick={toggle}>
        {optimisticLiked ? "Unlike" : "Like"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
```

## Forms and validation

Do local validation before submitting when the missing field is already available on the client. Show inline field errors without changing the modal or card's overall geometry. Reserve `useActionState` for server-validated errors or field errors that require the action result.

Use a success page/state instead of a toast when the completed action changes the user's task. For example, after a reservation, checkout, or invite request succeeds, replace the form with a confirmation and a secondary "start another" action; a success toast is redundant.

## Toasts

- **Toast only on error** when an optimistic UI already shows the result — a success toast next to an optimistic checkmark/removal is double feedback, which is noise.
- **Toast on success** only for non-visible side effects (email sent, link copied, file uploaded).
- **Don't toast for routine navigation** — the page change is the feedback.
- **Don't toast inside a server action.** Toasts are client-side; return a result and toast at the call site.

## View transitions: portaled / floating UI

`viewTransitionName: 'none'` does not exclude a portal from capture: it remains in its ancestor/root snapshot. When floating UI needs isolation, give each rendered portal a unique transition name and neutralize the relevant group/old/new animations with the existing transition policy. A group rule alone does not disable the old/new crossfade. This isolates the snapshot; it does not promise zero capture or preserve interactive behavior during capture. Follow the [canonical React View Transitions skill](../../vercel-react-view-transitions/SKILL.md), including reduced-motion behavior.

## Destructive actions (delete / leave / unsubscribe)

Gate behind a confirmation dialog, and mind two edge cases:

- **Don't `redirect()` inside the action.** It throws, which stops the client from toasting or closing the dialog. Return `{ ok: true }` and navigate with `router.push()`.
- **Don't wrap the whole action call in `useTransition`** inside the dialog — with view transitions on, that animates the background UI behind the dialog. Track pending with `useState` / `useOptimistic(false)` and reserve `startTransition` for the post-success navigation only.

## The action-prop pattern

A reusable design component (`<ToggleGroup>`, `<BottomNav>`, `<SubmitButton>`) can take an action-style prop and own the async coordination (optimistic update, pending, dimming) so consumers pass a plain callback. Convention: an `action` / `*Action` prop signals "triggers a mutation this component coordinates," versus a plain `onChange` / `onClick` — renaming between them is a contract change. Not every such prop is transition-wrapped: a destructive `confirmAction` is awaited _without_ a transition (see above). Transition-wrapping is the default for optimistic/navigation actions, not a rule tied to the name.

## URL-based pagination

Drive the page number through `searchParams`, render each page as its own `<Suspense>` boundary so pages stream independently, and add "load more" with `<Link scroll={false}>`. See linking and navigating (installed: `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`).

```tsx
import { Suspense } from "react";

export function Feed({ page = 1 }: { page?: number }) {
  return (
    <ul>
      {Array.from({ length: page }).map((_, i) => {
        const p = i + 1;
        return p === 1 ? (
          <FeedPage key={p} page={p} />
        ) : (
          <Suspense key={p} fallback={<FeedPageSkeleton />}>
            <FeedPage page={p} />
          </Suspense>
        );
      })}
    </ul>
  );
}
```

The first page can render in the parent boundary; later pages get their own fallbacks so "load more" streams only the newly requested page. If the URL update should preserve scroll, use `<Link scroll={false}>` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`).

## Global client state

For truly global client state (audio player, cart, system-reactive theme), wrap a [context provider](https://react.dev/reference/react/createContext) at the root; the provider is `'use client'` but `children` stays server-rendered, and only leaf components read the context. **Don't push server data into it** — server data stays in queries; client state is for ephemeral UI (open menus, playback position, optimistic drafts). See the live-data decision in `references/components.md`.
