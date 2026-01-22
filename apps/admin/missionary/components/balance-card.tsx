import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Wallet } from "lucide-react";

interface BalanceCardProps {
  currentBalance: number;
}

export function BalanceCard({ currentBalance }: BalanceCardProps) {
  return (
    <Card className="border-zinc-100 bg-white shadow-sm h-full flex flex-col rounded-xl">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-100">
            <Wallet className="h-4.5 w-4.5 text-zinc-900" />
          </div>
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Available Funds
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-5 pt-2">
        <div>
          <h3 className="text-4xl font-bold tracking-tighter text-zinc-900">
            ${currentBalance.toLocaleString()}
          </h3>
          <p className="mt-1 text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
            Network Live Status
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-lg border-zinc-100 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 shadow-sm"
          >
            Withdraw
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-lg bg-zinc-900 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-zinc-800 shadow-sm"
          >
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
