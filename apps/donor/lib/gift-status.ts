export function isSettledGift(status: string): boolean {
  return status === "Paid" || status === "Received";
}
