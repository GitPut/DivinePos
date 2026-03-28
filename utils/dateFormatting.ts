export function parseDate(
  date: { seconds: string | number } | Date | string
): Date | null {
  if (typeof date === "string") {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  } else if (date instanceof Date) {
    return date;
  } else if (date && typeof date === "object" && "seconds" in date) {
    if (typeof date.seconds === "string") {
      return new Date((parseFloat(date.seconds ?? "0") || 0) * 1000);
    } else {
      return new Date((date.seconds ?? 0) * 1000);
    }
  }
  return null;
}
