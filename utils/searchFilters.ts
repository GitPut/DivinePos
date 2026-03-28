import { CustomerProp, TransListStateItem } from "types";
import { parseDate } from "./dateFormatting";

interface DateRange {
  startDate: string;
  endDate: string;
}

export function searchCustomersByDate({
  startDate,
  endDate,
  customers,
}: DateRange & { customers: CustomerProp[] }): CustomerProp[] | undefined {
  if (!startDate || !endDate) return undefined;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return customers.filter((item) => {
    if (!item.createdAt) return false;
    const itemDate = new Date(item.createdAt.seconds * 1000);
    return itemDate >= start && itemDate <= end;
  });
}

export function searchTransactionsByDate({
  startDate,
  endDate,
  transactions,
}: DateRange & { transactions: TransListStateItem[] }): TransListStateItem[] | undefined {
  if (!startDate || !endDate) return undefined;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return transactions?.filter((item) => {
    const itemDate = parseDate(item.date);
    if (!itemDate) return false;
    return itemDate >= start && itemDate <= end;
  });
}
