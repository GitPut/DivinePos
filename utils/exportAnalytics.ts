/**
 * Export data to CSV file download.
 */
export function exportToCSV(headers: string[], rows: string[][], filename: string): void {
  const escapeCsv = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get date range for a period filter.
 */
export function getDateRange(period: string): { start: string; end: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const end = fmt(now);

  switch (period) {
    case "Today": return { start: end, end };
    case "This Week": {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return { start: fmt(start), end };
    }
    case "This Month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: fmt(start), end };
    }
    case "This Year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: fmt(start), end };
    }
    case "Last 30 Days": {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { start: fmt(start), end };
    }
    case "Last 90 Days": {
      const start = new Date(now);
      start.setDate(now.getDate() - 90);
      return { start: fmt(start), end };
    }
    default: return { start: "2020-01-01", end };
  }
}

/**
 * Filter stats days by date range.
 */
export function filterDays(
  days: Record<string, any>,
  start: string,
  end: string
): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (const [date, data] of Object.entries(days)) {
    if (date >= start && date <= end) {
      filtered[date] = data;
    }
  }
  return filtered;
}
