# UX patterns

Interaction decisions on top of the architecture: which feedback mechanism to reach for, and the boundary edge-cases that trip agents up. Hook mechanics live in the React / Next docs — linked, not restated. The deeper end-to-end picture is the Building interactive apps guide (installed: `node_modules/next/dist/docs/01-app/02-guides/interactive-apps.md`).

## Choose the feedback mechanism

| Situation                                                              | Reach for                                                                                                                                                        | Key rule                                                                                                                                                                                                                |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mutation unlikely to fail (favorite, vote, follow)                     | [`useOptimistic`](https://react.dev/reference/react/useOptimistic)                                                                                               | Update immediately, roll back on throw. Set it inside a transition; inside `<form action>` React opens the transition for you. Use a reducer for counters.                                                              |
| No optimistic fit (filters, sort, navigation)                          | [`useTransition`](https://react.dev/reference/react/useTransition) + `data-pending`                                                                              | Put `data-pending` on the pending node; let ancestors react with CSS (`has-data-pending:` for a direct parent, `group-has-data-pending:` further up) so it bubbles without prop drilling.                               |
| Errors only the action can find (validation, moderation, a taken slot) | [`useActionState`](https://react.dev/reference/react/useActionState)                                                                                             | Action returns `{ error }` plus the submitted values; render inline with `aria-invalid` + `role="alert"`.                                                                                                               |
| Submit disable + spinner                                               | [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)                                                                                     | Call it from a child of `<form>`, not the form component itself.                                                                                                                                                        |
| One-shot result with no visible change                                 | toast                                                                                                                                                            | See below.                                                                                                                                                                                                              |
| Selections that live in the URL (filters, wizard steps)                | `useOptimistic(draft)` + `router.replace` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`) inside `startTransition` | The URL is the source of truth; the optimistic draft keeps the control responsive until the server confirms the new search params. Submit the final draft to the action through hidden inputs and re-validate it there. |

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

## Pending states

Every click that starts a write or a navigation shows its pending state on the thing that was clicked, without changing the layout around it.

- **Item pickers** (a seat, a slot, a time). While the chosen item's write is pending, disable the whole group, fade the other items to about 50%, and keep the chosen one solid with `aria-busy`. No spinner inside the item and no cursor change. A status line under the group says what is happening, then what was chosen.
- **Nudges are inline.** A Continue pressed before a required pick turns that status line into the instruction and resets when the pick is made. The button stays enabled; a disabled button hides the reason.
- **Expected failures are inline.** When the write fails for a reason the user can act on (the item was just taken), show it on the same status line and clear the optimistic value. Toasts are for failures with no place in the layout.
- **`useActionState` outside a form.** Its dispatch is a plain call, so wrap it: `startTransition(() => dispatch(value))`. Otherwise `isPending` and the optimistic value appear only when the action settles, which reads as a frozen click.
- **Optimistic values inside an action.** A `setState` inside an async action is held until the action finishes. Use `useOptimistic` for anything that must show while the action runs.
- **Indicators keep their size.** A spinner that appears inside a button must not widen it; see CLS prevention in `references/pages-suspense.md`.

## Forms

Validate locally before submitting when the missing field is already on the client, and show field errors inline without changing the card's geometry. Reserve `useActionState` for errors that need the action result. When a completed action changes the user's task (a reservation, a checkout), replace the form with the confirmation instead of toasting.

### Keep the draft when the action rejects it

React resets a `<form action>` when the action finishes, whatever it returns, so an error result also clears the fields. See [`<form>`](https://react.dev/reference/react-dom/components/form). Return the submitted values with the error and read them back as `defaultValue`:

```tsx
const INITIAL = { body: "", error: null as string | null, sent: 0 };

const [{ body, error, sent }, send] = useActionState(
  async (state: typeof INITIAL, formData: FormData) => {
    const result = await sendReply(formData);
    if (!result.ok)
      return {
        ...state,
        body: String(formData.get("body") ?? ""),
        error: result.error,
      };
    return { body: "", error: null, sent: state.sent + 1 };
  },
  INITIAL,
);

<form action={send} key={sent}>
  <textarea defaultValue={body} name="body" />
</form>;
```

The reset only covers native fields. State inside client fields (picked recipients, an expanded Cc row) survives it, so key the form on a success counter in the action state to clear those after a send. Run the call-site work that belongs to the result (a toast, closing a panel) inside the action, where the result is in hand, instead of mirroring it into `useState`.

### Search and filter forms

A plain `<form method="get">` uses native browser navigation. Use a client navigation when the interaction should preserve the App Router experience:

- **Defaults come from the URL.** Read `useSearchParams()` in the client form and key the `<form>` on `params.toString()`, so the fields follow the URL and remount with fresh `defaultValue`s. The form then lives in the route shell and renders at once on navigation. A form that takes its defaults from a `searchParams.then()` sits inside the URL boundary and re-skeletons on every search.
- **Prefetch while the user is still choosing.** On `onChange`, build the destination URL and call `router.prefetch(href)`.
- **Submit in a transition.** `onSubmit` prevents the default and runs `startTransition(() => router.push(href))`. The submit button's `useFormStatus` spinner already reflects that transition; don't add a second one.
- **Fade the current results.** Render the results as children of the form's client shell under `data-pending={isPending ? '' : undefined}` with `transition-opacity data-pending:opacity-60`. The old results stay on screen, dimmed, until the new ones commit.

`next/form` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/form.md`) gives a string-action form client navigation and prefetching. Put `useFormStatus` in a child button for pending feedback; use the client shell when the current results should dim.

## Toasts

- **Toast only on error** when an optimistic UI already shows the result. A success toast next to an optimistic checkmark is double feedback.
- **Toast on success** only for side effects with no visible result (email sent, link copied).
- **Don't toast for navigation.** The page change is the feedback.
- **Don't toast inside a server action.** Return a result and toast at the call site.
- **Don't toast a nudge or an expected in-page failure.** Use the component's status line (see Pending states).

## Destructive actions (delete / leave / unsubscribe)

Gate behind a confirmation dialog whose confirm button owns the pending state, toast `error` from the result, and navigate away only after `{ ok: true }`. Mind two edge cases:

- **Don't use `redirect()` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`) inside an action when the click/dialog caller must toast, close, or do other success work.** `redirect()` terminates that action path. Return `{ ok: true }` and navigate with `router.push()`. (Form actions are different — see `references/queries-actions.md`.)
- **Don't wrap the whole action call in `useTransition`** inside the dialog — with view transitions on, that animates the background UI behind the dialog. Track pending with `useState` / `useOptimistic(false)` and reserve `startTransition` for the post-success navigation only.

## Blocking a write in flight

Reserve a full-screen blocker for a write that must not be double-submitted or abandoned (confirm, pay), rather than ordinary link navigation. While it is pending, replace the action buttons with the progress indicator so nothing is left to click.

If the blocker participates in a route transition, render it from a layout that survives the navigation and verify the exact animation in the browser. Follow the official React [`<ViewTransition>` reference](https://react.dev/reference/react/ViewTransition) and the companion [React View Transitions skill](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-view-transitions) for transition mechanics; this skill only decides where the persistent UI belongs.

## Leaving a finished flow

Redirect from the completing action with `RedirectType.replace` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`), so the final step is replaced by the result page instead of sitting one swipe behind it. Don't add an "already done, redirect to the result" check unless the product must forbid repeating the flow.

## View transitions: portaled / floating UI

Portals and floating UI need explicit testing during route transitions. Keep the architecture decision here: persistent overlays belong in a surviving layout. Follow the official React [`<ViewTransition>` reference](https://react.dev/reference/react/ViewTransition) and the companion [React View Transitions skill](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-view-transitions) for naming, portal handling, stacking, and animation details.

`viewTransitionName: 'none'` does not exclude a portal from capture: it remains in its ancestor/root snapshot. When floating UI needs isolation, give each rendered portal a unique transition name and neutralize the relevant group/old/new animations with the existing transition policy. A group rule alone does not disable the old/new crossfade. This isolates the snapshot; it does not promise zero capture or preserve interactive behavior during capture. Follow the [canonical React View Transitions skill](../../vercel-react-view-transitions/SKILL.md), including reduced-motion behavior.

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
