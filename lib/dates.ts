import { formatInTimeZone } from "date-fns-tz";
export function formatDate(
  value: Date | string,
  timezone: string,
  format = "MMM d, yyyy",
) {
  return formatInTimeZone(new Date(value), timezone, format);
}
