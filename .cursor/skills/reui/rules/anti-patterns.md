# Anti-patterns

Read this at the Check step, after the self-checks in [quality.md](./quality.md). Each entry: an `Incorrect:` line, then its `Correct:` fix. Detector: the self-check that prints it (C1 to C4), or `visual` when reading finds it. Source: the pilot run that wrote it, or `default` (a training-data habit).

## Pairs

### 1. Stagger on every row (Detector: C2; source: run-08)

Incorrect: `transition={{ delay: i * 0.05 }}` on all 50 rows of a table
Correct: 1 stagger of at most 6 items, `staggerChildren: 0.05`, never on table rows

### 2. Transition everything on a card (Detector: C1; source: runs 10, 15)

Incorrect: `className="rounded-xl border transition-all duration-300 hover:shadow-lg"`
Correct: `transition-colors` for a hover color; a lift is `transform` over a static shadow

### 3. Raw palette for a state (Detector: C3; source: runs 08, 15)

Incorrect: `<span className="text-green-600">Active</span>`
Correct: `<Badge variant="success-light">Active</Badge>`

### 4. Animated table rows (Detector: C1; source: runs 01, 08, 17)

Incorrect: `<motion.tr whileHover={{ backgroundColor: "var(--muted)" }}>`
Correct: `data-grid` rows, which already hover; never animate rows with motion/react

### 5. Hover scale on the default spring (Detector: C1; source: runs 01, 10)

Incorrect: `<motion.div whileHover={{ scale: 1.03 }}>` with no `transition`
Correct: CSS first: `transition-colors` for hover, `transition-transform active:scale-[0.98] motion-reduce:transition-none` for press

### 6. Entrance from scale 0 (Detector: C1; source: runs 10, 15)

Incorrect: `<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>`
Correct: `initial={{ opacity: 0, scale: 0.95 }}`: start at scale 0.95 or more and move 8px or less

### 7. Hand-built modal or toast (Detector: C4; source: run-15)

Incorrect: `<div className="fixed inset-0 z-50 bg-black/50">` as a modal
Correct: `Dialog`, `AlertDialog` for a destructive confirm, `sonner` for toasts; a palette: `<CommandDialog><Command><CommandInput /><CommandList>`, as `CommandDialog` holds no `Command`

### 8. Native select (Detector: C4; source: run-15)

Incorrect: `<select>` with `<option>` children
Correct: the shadcn `Select`, or `NativeSelect` when the native control is wanted

### 9. Hand-rolled table (Detector: C4; source: run-17)

Incorrect: `<table>` with mapped `<tr>` rows
Correct: `data-grid`: a `useTable({ features: dataGridFeatures })` instance passed as `table={table}`, columns typed `ColumnDef<DataGridFeatures, Order>[]`

### 10. Button inside a clickable wrapper (Detector: visual; source: run-02)

Incorrect: `<motion.button><Button>Save</Button></motion.button>`
Correct: the `Button` alone: 1 interactive element, and it already has a press state

### 11. Radix asChild on Base UI (Detector: C4; source: run-17, judge)

Incorrect: `<DialogTrigger asChild><Button>Open</Button></DialogTrigger>`
Correct: `<DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>` on base-nova; a link: `<Button nativeButton={false} render={<Link href="/x" />}>`

### 12. Component defined inside render (Detector: visual; source: Haiku runs, judge)

Incorrect: `const Row = () => <div />` inside the page component
Correct: declare `Row` at module scope and pass it props, so React keeps its state

### 13. A panel inside a panel (Detector: visual; source: run-05)

Incorrect: `<FramePanel><Card>...</Card></FramePanel>`, or a Card inside a Card
Correct: FramePanels for both, or Cards for the KPIs and a Frame for the table; never a Card inside a Frame

### 14. Small badges (Detector: visual; source: runs 03, 04, 06, 07, 10, 13, 16, 18)

Incorrect: `<Badge variant="success-light" size="sm">Paid</Badge>`
Correct: `<Badge variant="success-light">Paid</Badge>` with `size` left off

### 15. A colored circle behind every KPI icon (Detector: visual; source: default)

Incorrect: `<div className="rounded-full bg-blue-100 p-2">` around each KPI icon
Correct: the number leads; at most 1 `text-muted-foreground` icon

### 16. Gradient text (Detector: visual; source: default)

Incorrect: `bg-linear-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent` on a heading
Correct: `text-foreground` and `tracking-tight`; color carries meaning, not decoration

### 17. A dot or check for the current item (Detector: visual; source: default)

Incorrect: a dot or a `Check` icon beside the active nav item
Correct: `bg-muted` (`dark:bg-muted/50`) plus `aria-current`

### 18. framer-motion (Detector: C4; source: default)

Incorrect: `import { motion } from "framer-motion"`
Correct: `import { motion } from "motion/react"`

### 19. Clock or randomness in render (Detector: C4; source: default, near run-05)

Incorrect: `const [id] = useState(() => Math.random())`
Correct: `useId()` for ids; read the clock in an effect or an event handler

### 20. Placeholder data (Detector: visual; source: default)

Incorrect: "John Doe", "Acme Inc" and round figures like `$1,000`
Correct: specific, plausible data: "Mara Lind", `$1,284.50`, 37 open orders

## Your training data is out of date

| Old habit                     | In this stack                                                   |
| ----------------------------- | --------------------------------------------------------------- |
| `framer-motion`               | `motion/react`                                                  |
| `<DataGrid data columns>`     | `useTable({ features: dataGridFeatures })` plus `table={table}` |
| A fixed div modal             | `Dialog` or `AlertDialog`                                       |
| A hand-built toast            | `sonner`                                                        |
| `w-5 h-5`                     | `size-5`                                                        |
| never `space-y-4` in new code | `flex flex-col gap-4`                                           |
| `asChild`                     | `render` on base-nova                                           |
