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
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.id} className="border-zinc-200 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
