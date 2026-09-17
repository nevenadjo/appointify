import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { localReminderConfig, runReminderLoop } from "./reminders.mjs";

const require = createRequire(import.meta.url);
const config = localReminderConfig();
const controller = new AbortController();
const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--port", String(config.port)], {
  stdio: "inherit",
  windowsHide: true,
});

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  controller.abort();
  if (server.exitCode === null && server.pid) {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    } else {
      server.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
server.on("error", (error) => {
  console.error(`Cannot start development server: ${error.message}`);
  process.exitCode = 1;
  stop();
});
server.on("exit", (code) => {
  if (!stopping) process.exitCode = code ?? 1;
  controller.abort();
});

// The worker retries while Next.js compiles; it never overlaps its own requests.
await runReminderLoop(config, controller.signal);
