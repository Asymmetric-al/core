# Plan 005: Client resilience papercuts — chart-load error states and unmount-safe timers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a661bfb9..HEAD -- "apps/donor/app/(dashboard)/donor-dashboard/history/page-client.tsx" "apps/donor/app/(public)/financials/financials-client.tsx" apps/missionary/app/feed/worker-feed-page-client.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `a661bfb9`, 2026-06-11

## Why this matters

Three small, confirmed defects in client components:

1. Two donor pages lazy-load Recharts in an effect and swallow load failures
   with `console.error` only — if the chunk fails to load (flaky network,
   deploy skew), the chart area shows a loading placeholder **forever** with
   no message and no retry.
- The missionary feed's follower-request item schedules a 1.5s + 0.4s
   `setTimeout` chain after a successful API call with no cleanup — if the
   item unmounts first (navigation, list refresh), the timers still fire and
   call `setStatus`/`onResolve` on an unmounted component.

Each fix is small and mechanical; they are bundled because all three are
client-resilience fixes with the same verification gates.

## Current state

- `apps/donor/app/(dashboard)/donor-dashboard/history/page-client.tsx`
  lines 476–498 (inside the page component; there is a
  `rechartsModule` state at lines 466–468):

```ts
useEffect(() => {
  let isMounted = true;

  importRechartsModule()
    .then((module) => {
      if (isMounted) {
        setRechartsModule({
          Bar: module.Bar,
          BarChart: module.BarChart,
          Cell: module.Cell,
          ResponsiveContainer: module.ResponsiveContainer,
          Tooltip: module.Tooltip,
        });
      }
    })
    .catch((error) => {
      console.error("Failed to load Recharts for donor history:", error);
    });

  return () => {
    isMounted = false;
  };
}, []);
```

- `apps/donor/app/(public)/financials/financials-client.tsx` lines 46–68:
  identical pattern (loads `Cell`, `Pie`, `PieChart`, `ResponsiveContainer`,
  `Tooltip`).

- In both files, find where `rechartsModule` is consumed (search
  `rechartsModule` in each file) to see what currently renders while it is
  `null` — that null-render is what would become permanent on failure.

- `apps/missionary/app/feed/worker-feed-page-client.tsx` lines 142–173
  (`FollowerRequestItem`):

```ts
const [status, setStatus] = useState<
  "pending" | "processing" | "approved" | "ignored" | "collapsing"
>("pending");

const handleAction = async (action: "approve" | "ignore") => {
  setStatus("processing");

  try {
    const res = await fetch(`/api/follower-requests/${request.id}`, {
      method: "PATCH",
      ...
    });

    if (!res.ok) throw new Error("Failed to update request");

    setStatus(action === "approve" ? "approved" : "ignored");

    setTimeout(() => {
      setStatus("collapsing");
      setTimeout(() => {
        onResolve(request.id, action === "approve");
      }, 400);
    }, 1500);
  } catch (error) {
    console.error("Error resolving request:", error);
    setStatus("pending");
    toast.error("Failed to update request");
  }
};
```

- Test exemplars using React Testing Library (jsdom is configured):
  `tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx`.

## Commands you will need

| Purpose   | Command                                                                       | Expected on success |
| --------- | ----------------------------------------------------------------------------- | ------------------- |
| Install   | `bun install`                                                                 | exit 0              |
| Typecheck | `bunx turbo run typecheck --filter=@asym/donor --filter=@asym/missionary-app` | exit 0              |
| Lint      | `bunx turbo run lint --filter=@asym/donor --filter=@asym/missionary-app`      | exit 0              |
| Tests     | `bunx vitest run tests/unit/apps`                                             | all pass            |
| Format    | `bun run format:check`                                                        | exit 0              |

## Scope

**In scope** (the only files you should modify/create):

- `apps/donor/app/(dashboard)/donor-dashboard/history/page-client.tsx`
- `apps/donor/app/(public)/financials/financials-client.tsx`
- `apps/missionary/app/feed/worker-feed-page-client.tsx` (only
  `FollowerRequestItem`)
- `tests/unit/apps/missionary/follower-request-item.test.tsx` (create —
  optional, see Test plan)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- `importRechartsModule` itself and any shared chart components.
- Other `setTimeout` usages elsewhere in `worker-feed-page-client.tsx` — only
  `FollowerRequestItem`'s handler is in this plan.
- Anything else in these three large files (they are known hotspots; surgical
  diffs only).

## Git workflow

- Branch: `advisor/005-client-resilience`
- Commit style: conventional commits, e.g.
  `fix(donor): surface chart-load failures instead of endless skeleton`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a failure state to both Recharts loaders

In each of the two donor files:

1. Add alongside the existing module state:

```ts
const [rechartsFailed, setRechartsFailed] = useState(false);
```

- In the `.catch`, keep the `console.error` and add
   `if (isMounted) setRechartsFailed(true);`.

- Where the component currently renders its loading placeholder while
   `rechartsModule` is `null` (find the `rechartsModule` consumers in each
   file), render a quiet failure message instead when `rechartsFailed` is
   true — match each page's existing empty/error styling (both files have
   muted text classes; copy a nearby pattern, e.g. the zinc muted-text
   classes already used on those pages):

```tsx
{rechartsFailed ? (
  <p className="text-sm text-zinc-500">
    The chart couldn't load. Refresh the page to try again.
  </p>
) : ( ...existing placeholder/chart render... )}
```

Keep the donor app's visual conventions — do not import new UI components
for this.

**Verify**: `bunx turbo run typecheck --filter=@asym/donor` → exit 0;
`grep -n "rechartsFailed" "apps/donor/app/(dashboard)/donor-dashboard/history/page-client.tsx" "apps/donor/app/(public)/financials/financials-client.tsx"`
→ at least 3 hits per file (state, catch, render).

### Step 2: Make FollowerRequestItem timers unmount-safe

In `apps/missionary/app/feed/worker-feed-page-client.tsx`, inside
`FollowerRequestItem`:

1. Add a ref to collect timer ids and an unmount cleanup:

```ts
const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

useEffect(() => {
  return () => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
  };
}, []);
```

(Add `useRef`/`useEffect` to the existing React imports if missing.)

- Store both timeouts:

```ts
const collapseTimer = setTimeout(() => {
  setStatus("collapsing");
  const resolveTimer = setTimeout(() => {
    onResolve(request.id, action === "approve");
  }, 400);
  timersRef.current.push(resolveTimer);
}, 1500);
timersRef.current.push(collapseTimer);
```

- Double-submit guard: read the JSX below line 175 and confirm the
   approve/ignore buttons are disabled (or hidden) whenever
   `status !== "pending"`. If they are not, add `disabled={status !== "pending"}`
   to both buttons. If they already are, state that in your report and change
   nothing.

**Verify**: `bunx turbo run typecheck --filter=@asym/missionary-app` → exit 0
and `bunx turbo run lint --filter=@asym/missionary-app` → exit 0.

### Step 3: Tests and full verification

**Verify**: `bunx vitest run tests/unit/apps` → all pass;
`bun run format:check` → exit 0.

## Test plan

- Optional but preferred: `tests/unit/apps/missionary/follower-request-item.test.tsx`
  using React Testing Library + `vi.useFakeTimers()`, modeled structurally on
  `tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx`:
  render `FollowerRequestItem`, mock `fetch` to resolve ok, click approve,
  unmount before advancing timers, then `vi.runAllTimers()` and assert
  `onResolve` was **not** called and no error was thrown.
  `FollowerRequestItem` is module-private — if exporting it for tests would
  change the file's public surface in a way lint forbids, skip the test file
  and note that in your report (the cleanup is still verified by typecheck +
  review).
- The Recharts error-state change is presentational; no component test
  required. Existing suites must keep passing: `bunx vitest run tests/unit/apps`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Both donor files contain `rechartsFailed` state set in their `.catch`
- [ ] `grep -n "clearTimeout" apps/missionary/app/feed/worker-feed-page-client.tsx`
      returns at least 1 match
- [ ] `bunx turbo run typecheck --filter=@asym/donor --filter=@asym/missionary-app` exits 0
- [ ] `bunx turbo run lint --filter=@asym/donor --filter=@asym/missionary-app` exits 0
- [ ] `bunx vitest run tests/unit/apps` exits 0
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts above don't match the live code (drift).
- The `rechartsModule` consumers turn out to render charts through a shared
  component whose props you'd have to change (the fix must stay inside the
  two page files).
- `FollowerRequestItem`'s status machine is consumed by animation variants
  in a way that clearing timers on unmount breaks an exit animation
  contract (check the `AnimatePresence`/`motion` usage around the component
  before assuming; if the parent relies on `onResolve` always firing, report
  it).

## Maintenance notes

- If more pages adopt the lazy-Recharts pattern, extract a
  `useRechartsModule()` hook with built-in error state instead of a third
  copy — deferred until a third call site exists.
- Reviewer should scrutinize: no behavior change when the chunk loads
  normally, and the timer refs don't retain the component after unmount.
