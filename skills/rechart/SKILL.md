---
name: recharts
description: Use this skill whenever building **React charts** with **Recharts** (`LineChart`, `BarChart`, `AreaChart`, `PieChart`, `ResponsiveContainer`). citeturn2view0
---

# Recharts — Skill

**Name:** `recharts`

Use this skill whenever building **React charts** with **Recharts** (`LineChart`, `BarChart`, `AreaChart`, `PieChart`, `ResponsiveContainer`). citeturn2view0

---

## Goal

Ship **correct, responsive, readable** charts with minimal Recharts glue code.

Priorities:
1. Correct chart composition (axes / grid / tooltip)
2. Responsive sizing
3. Data mapping correctness (`dataKey`)
4. Performance with large datasets

---

## Core principles

### 1) Always be responsive
- Wrap charts in `ResponsiveContainer`
- Provide explicit `width` and `height` (or a parent with a fixed height)

### 2) Keep the data model explicit
- Normalize inputs into a stable array of objects
- Use consistent keys and `dataKey` for every series

### 3) Choose the simplest chart that answers the question
- Trend over time → `LineChart`
- Compare categories → `BarChart`
- Cumulative/volume → `AreaChart`
- Part-to-whole → `PieChart` citeturn2view0

### 4) Interactivity is not optional for dashboards
- Add `Tooltip`
- Add `Legend` when multiple series exist

### 5) Performance defaults
- Disable animations for large/static dashboards: `isAnimationActive={false}`
- Limit point count (aggregate / bucket) before rendering

---

## Review checklist

- [ ] Chart is wrapped in `ResponsiveContainer`
- [ ] X/Y axes are present and labeled when needed
- [ ] Tooltip works and shows the right units
- [ ] `dataKey` matches actual field names
- [ ] Animations disabled for large datasets
- [ ] Colors are accessible (contrast / color-blind safe)

---

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

---

## How to apply this skill

When implementing a chart:
1. Define the data shape and keys first
2. Pick the simplest chart type
3. Add `ResponsiveContainer`, axes, and tooltip
4. Validate `dataKey`s against real data
5. Turn off animation if performance matters
