import { formatCurrency } from "@asym/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

import type { DashboardStats } from "@asym/api/reads/dashboard-stats";

type AdminDashboardStatsSectionProps = {
  stats: DashboardStats;
};

type StatCard = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

export function AdminDashboardStatsSection({
  stats,
}: AdminDashboardStatsSectionProps) {
  const cards: StatCard[] = [
    {
      id: "total-donors",
      label: "Total Donors",
      value: stats.totalDonors.toLocaleString(),
      hint: "Tenant-wide donor profiles",
    },
    {
      id: "total-missionaries",
      label: "Total Missionaries",
      value: stats.totalMissionaries.toLocaleString(),
      hint: "Active missionary records",
    },
    {
      id: "month-donation-count",
      label: "Donations This Month",
      value: stats.totalDonationsThisMonth.toLocaleString(),
      hint: "Settled since month start",
    },
    {
      id: "month-revenue",
      label: "Revenue This Month",
      value: formatCurrency(stats.revenueThisMonth),
      hint: "Sum of settled donation amounts",
    },
    {
      id: "active-funds",
      label: "Active Funds",
      value: stats.activeFundsCount.toLocaleString(),
      hint: "Funds marked active",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-2">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="gap-1 border-zinc-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <CardHeader className="space-y-0 p-0">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.5 p-0 pt-1.5">
            <p className="text-lg font-bold tabular-nums leading-none tracking-tight text-foreground">
              {card.value}
            </p>
            <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">
              {card.hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
