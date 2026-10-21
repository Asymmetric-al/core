export function coverageLabel(positive: boolean): string {
  return positive ? "positive" : "negative";
}

export function coverageDouble(value: number): number {
  return value * 2;
}

export function coverageNever(): string {
  return "unexecuted";
}
