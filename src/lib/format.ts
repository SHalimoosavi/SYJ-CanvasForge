import dayjs from "dayjs";

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : decimals)} ${units[exponent]}`;
}

export function formatTimestamp(timestamp: number): string {
  return dayjs(timestamp).format("MMM D, YYYY h:mm A");
}

export function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.round((Date.now() - timestamp) / 1000);
  if (diffSeconds < 5) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return dayjs(timestamp).format("MMM D, YYYY");
}
