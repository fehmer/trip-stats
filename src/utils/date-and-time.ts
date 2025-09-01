export function formatDate(date: Date | string | undefined): string {
  if (date === undefined) return "";
  const d = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: undefined,
    timeZone: undefined,
  };

  return new Intl.DateTimeFormat(undefined, options).format(d);
}

/**
 * Converts a duration in seconds to a human-readable string like "4h 23m".
 *
 * @param seconds - Duration in seconds
 * @returns A formatted string like "1h 5m", "3m 10s", etc.
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  if (h === 0 && m === 0) parts.push(`${s}s`); // Only include seconds if no hours or minutes

  return parts.join(" ");
}
