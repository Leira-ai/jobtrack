export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions,
  timeZone?: string,
) {
  return new Intl.DateTimeFormat("id-ID", {
    ...(options ?? { day: "numeric", month: "short", year: "numeric" }),
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
