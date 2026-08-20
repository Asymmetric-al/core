const LOCAL_CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function currentDisplayDate(): Date {
  return new globalThis.Date();
}

export function parseDisplayDate(value: string | number | Date): Date {
  if (value instanceof Date) {
    return new globalThis.Date(value.getTime());
  }

  if (typeof value === "string") {
    const match = LOCAL_CALENDAR_DATE.exec(value);
    if (match) {
      const year = Number(match[1]);
      const monthIndex = Number(match[2]) - 1;
      const day = Number(match[3]);
      return new globalThis.Date(year, monthIndex, day);
    }
  }

  return new globalThis.Date(value);
}
