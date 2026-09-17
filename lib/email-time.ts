export const EMAIL_TIME_ZONE = "Europe/Belgrade";

export function emailDate(date: Date) {
  return date.toLocaleDateString("en-GB", { timeZone: EMAIL_TIME_ZONE });
}

export function emailTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    timeZone: EMAIL_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}
