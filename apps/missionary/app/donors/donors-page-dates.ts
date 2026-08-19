export function currentDisplayDate(): Date {
  return new globalThis.Date();
}

export function parseDisplayDate(value: string | number | Date): Date {
  return new globalThis.Date(value);
}
