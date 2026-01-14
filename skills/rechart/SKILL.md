# Recharts — Skill
**Name:** `recharts`
**Purpose:** Build responsive, readable charts with Recharts using correct data mapping and composition.
Use this skill whenever creating charts with Recharts.

**Applies when:** Using `LineChart`, `BarChart`, `AreaChart`, `PieChart`, `ResponsiveContainer`.
**Do not use when:** Charts are not built with Recharts.

## Rules
- **Always responsive:** Wrap charts in `ResponsiveContainer` and ensure a fixed height parent.
- **Explicit data model:** Normalize data and use stable `dataKey` values.
- **Pick the simplest chart:** Use `LineChart` for trends, `BarChart` for comparisons, `AreaChart` for cumulative/volume, `PieChart` for part-to-whole.
- **Interactivity:** Add `Tooltip`; add `Legend` when multiple series exist.
- **Performance:** Disable animation for large/static dashboards and reduce point count.

## Workflow
1. Define the data shape and stable keys.
2. Choose the simplest chart that answers the question.
3. Wrap in `ResponsiveContainer` with a height.
4. Add axes, tooltip, and legend as needed.
5. Disable animation or aggregate data for large sets.

## Checklists

### Implementation checklist
- [ ] Chart is wrapped in `ResponsiveContainer`
- [ ] X/Y axes are present when needed
- [ ] Tooltip shows correct units
- [ ] `dataKey` matches field names

### Review checklist
- [ ] Animations disabled for large datasets
- [ ] Colors are accessible

## Minimal examples

### Line chart (trend)
```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export function SalesChart({ data }: { data: Array<{ month: string; sales: number }> }) {
  return (
    <div style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Custom tooltip
```tsx
type TooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ name?: string; value?: number | string }>;
};

export function CustomTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-white p-2 text-sm shadow">
      <div className="font-medium">{label}</div>
      <ul className="mt-1 space-y-0.5">
        {payload.map((p, i) => (
          <li key={i}>
            {p.name}: {p.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Common mistakes / pitfalls
- Missing `ResponsiveContainer` or fixed-height parent
- Mismatched `dataKey` values
- Over-animating large dashboards
- Rendering too many points without aggregation
