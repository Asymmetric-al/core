import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Wallet } from "lucide-react";
import * as React from "react";

interface BalanceCardProps {
  currentBalance: number;
}

export function BalanceCard({ currentBalance }: BalanceCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
            <Wallet className="size-4.5 text-foreground" />
          </div>
          <CardTitle className="text-xs uppercase tracking-widest">
            Available Funds
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-5 pt-2">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight text-foreground tabular-nums wrap-anywhere sm:text-4xl">
            ${currentBalance.toLocaleString()}
          </h3>
          <p className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Network Live Status
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">
            Withdraw
          </Button>
          <Button size="sm">History</Button>
        </div>
      </CardContent>
    </Card>
  );
}
