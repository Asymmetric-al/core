import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp } from 'lucide-react'

interface FundingProgressProps {
  monthlySupport: number
  monthlyGoal: number
  percentFunded: number
}

export function FundingProgress({ monthlySupport, monthlyGoal, percentFunded }: FundingProgressProps) {
  const remaining = monthlyGoal - monthlySupport
  return (
    <Card className="border-zinc-100 bg-white shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Target className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1">Funding Goal</CardTitle>
            <p className="text-lg font-bold text-zinc-900 tracking-tighter">Monthly Progress</p>
          </div>
        </div>
        <Badge className="bg-zinc-900 text-white border-0 font-bold px-2 py-0.5 rounded-md text-[10px]">
          {percentFunded}%
        </Badge>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold tracking-tighter text-zinc-900">
              ${monthlySupport.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">of ${monthlyGoal.toLocaleString()}</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all duration-1000 ease-out"
              style={{ width: `${percentFunded}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-zinc-50/50 p-2.5 border border-zinc-100">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Remaining</p>
              <p className="mt-0.5 text-sm font-bold text-zinc-900 tracking-tight">${remaining.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-zinc-50/50 p-2.5 border border-zinc-100">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Trend</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-zinc-900 tracking-tight">
                <TrendingUp className="h-3 w-3" /> +12%
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50/50 p-2.5 border border-zinc-100">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Days Left</p>
              <p className="mt-0.5 text-sm font-bold text-zinc-900 tracking-tight">16</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
