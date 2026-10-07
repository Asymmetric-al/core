export interface RevenueDataPoint {
  name: string;
  revenue: number;
  donors?: number;
}

export interface WeeklyDataPoint {
  day: string;
  amount: number;
}
