import nextEnv from "@next/env";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

export function localReminderConfig() {
  nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
  const secret = process.env.CRON_SECRET;
  const port = Number(process.env.PORT || 3000);
  if (!secret) throw new Error("Set CRON_SECRET in .env before starting reminders.");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
  return { secret, port, url: `http://localhost:${port}/api/reminders` };
}

export async function runReminderOnce(config, signal, fetchRequest = fetch) {
  const response = await fetchRequest(config.url, {
    headers: { Authorization: `Bearer ${config.secret}` },
    redirect: "error",
    signal: AbortSignal.any([signal, AbortSignal.timeout(120_000)]),
  });
  if (response.status === 401 || response.status === 503) {
    throw new Error("Reminder authorization failed. Check CRON_SECRET and restart the server.");
  }
  if (response.status === 409) return null;
  if (!response.ok) throw new Error(`Reminder request failed (HTTP ${response.status}).`);
  const result = await response.json();
  if (!result.success) throw new Error("Reminder job did not complete successfully.");
  return result;
}

export async function runReminderLoop(config, signal) {
  console.log("[reminders] Checking every 5 minutes while this process is running.");
  while (!signal.aborted) {
    let wait = 5 * 60_000;
    try {
      const result = await runReminderOnce(config, signal);
      if (result) {
        console.log(`[reminders] Appointment emails: ${result.reservationReminders.sent}; review emails: ${result.reviewReminders.sent}.`);
      }
    } catch (error) {
      if (signal.aborted) break;
      console.error(`[reminders] ${error.message} Retrying in 10 seconds.`);
      wait = 10_000;
    }
    try {
      await delay(wait, undefined, { signal });
    } catch {
      break;
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const controller = new AbortController();
  process.on("SIGINT", () => controller.abort());
  process.on("SIGTERM", () => controller.abort());
  await runReminderLoop(localReminderConfig(), controller.signal);
}
