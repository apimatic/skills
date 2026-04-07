#!/usr/bin/env node
/**
 * APIMatic portal dev server manager.
 *
 * Usage (run from any directory — the project root is passed via --input):
 *   node serve.mjs start [--port 3000] [--input ./]
 *   node serve.mjs status
 *   node serve.mjs stop
 *   node serve.mjs watch
 *
 * `start` streams the CLI output live so the user sees build progress and
 * errors in real time. It exits once the local URL is detected (server ready)
 * or if the process dies. The server keeps running in the background via
 * detached: true + unref().
 *
 * Auto-retry: if a port is in use, tries the next port up to 3 times.
 * Auto-stop: a watchdog process stops the server after 30 min of agent inactivity.
 *
 * No external dependencies — Node.js built-ins only.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PID_FILE = path.join(SCRIPT_DIR, "serve.pid");
const LOG_FILE = path.join(SCRIPT_DIR, "serve.log");
const HEARTBEAT_FILE = path.join(SCRIPT_DIR, "serve.heartbeat");
const WATCHDOG_SCRIPT = path.join(SCRIPT_DIR, "watchdog.mjs");

const STARTUP_MARKERS = ["Local:", "localhost:", "http://"];
const STARTUP_TIMEOUT_MS = 120_000;
const MAX_PORT_RETRIES = 3;

// ── helpers ────────────────────────────────────────────────────────────────

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readPid() {
  if (!fs.existsSync(PID_FILE)) return null;
  const raw = fs.readFileSync(PID_FILE, "utf8").trim();
  const pid = parseInt(raw.split("\n")[0], 10);
  return isNaN(pid) ? null : pid;
}

function readWatchdogPid() {
  if (!fs.existsSync(PID_FILE)) return null;
  const lines = fs.readFileSync(PID_FILE, "utf8").trim().split("\n");
  if (lines.length < 2) return null;
  const pid = parseInt(lines[1], 10);
  return isNaN(pid) ? null : pid;
}

/** Throws on failure — used in start() where write errors should abort. */
function touchHeartbeat() {
  fs.writeFileSync(HEARTBEAT_FILE, String(Date.now()));
}

/** Silent best-effort — used in status() and watch() where write errors should not abort. */
function safeTouchHeartbeat() {
  try { fs.writeFileSync(HEARTBEAT_FILE, String(Date.now())); } catch { /* best effort */ }
}

/** Safe unlink — ignores missing file or permission errors. */
function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch { /* best effort */ }
}

function printLogTail(n = 15) {
  if (!fs.existsSync(LOG_FILE)) {
    console.log("(no log file yet)");
    return;
  }
  try {
    const lines = fs.readFileSync(LOG_FILE, "utf8").split("\n");
    const tail = lines.slice(-n - 1, -1);
    console.log(tail.join("\n").trimEnd());
  } catch {
    console.log("(log file could not be read)");
  }
}

// ── commands ───────────────────────────────────────────────────────────────

function start(port, inputPath, retryCount = 0) {
  // Guard: already running
  const pid = readPid();
  if (pid && isRunning(pid)) {
    console.log(`Already running (PID ${pid}). Server URL: http://localhost:${port}`);
    console.log("Use 'node serve.mjs status' to check logs or 'node serve.mjs stop' to stop.");
    return;
  }

  // Guard: input path must exist
  if (!fs.existsSync(inputPath)) {
    console.error(`ERROR: Input path not found: "${inputPath}"`);
    console.error("Make sure you are running from the project root (the directory that contains src/).");
    console.error("Example: node serve.mjs start --input ./");
    console.error('Manual fallback: cd into your project root and run "apimatic portal serve".');
    process.exit(1);
  }

  // Set up log stream and PID file — abort if the scripts dir is not writable
  let logStream;
  try {
    safeUnlink(PID_FILE);
    logStream = fs.createWriteStream(LOG_FILE, { flags: "w" });
  } catch (err) {
    console.error(`ERROR: Cannot write to scripts directory: ${err.message}`);
    console.error(`Path: ${SCRIPT_DIR}`);
    console.error("Fix: check that you have write permission to that directory.");
    console.error('Manual fallback: run "apimatic portal serve" yourself in the project root.');
    process.exit(1);
  }

  // Use pipe stdio so we can read output in real time AND write it to the log.
  // The process is spawned with detached:true so it outlives this script.
  const child = spawn(
    "apimatic",
    ["portal", "serve", `--port=${port}`, `--input=${inputPath}`],
    {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  // Handle spawn errors (e.g. apimatic not on PATH)
  child.on("error", (err) => {
    logStream.end();
    safeUnlink(PID_FILE);
    safeUnlink(HEARTBEAT_FILE);
    if (err.code === "ENOENT") {
      console.error("ERROR: 'apimatic' command not found.");
      console.error("The APIMatic CLI is not installed or not on your PATH.");
      console.error("Fix: npm install -g @apimatic/cli");
      console.error("Then verify: apimatic --version");
      console.error('Manual fallback: once installed, run "apimatic portal serve" in the project root.');
    } else {
      console.error(`ERROR: Failed to start server process: ${err.message}`);
      console.error('Manual fallback: run "apimatic portal serve" yourself in the project root.');
    }
    process.exit(1);
  });

  try {
    fs.writeFileSync(PID_FILE, String(child.pid));
    touchHeartbeat();
  } catch (err) {
    console.error(`ERROR: Cannot write PID/heartbeat files: ${err.message}`);
    console.error(`Path: ${SCRIPT_DIR}`);
    console.error("Fix: check that you have write permission to that directory.");
    console.error('Manual fallback: run "apimatic portal serve" yourself in the project root.');
    try { child.kill(); } catch { /* best effort */ }
    process.exit(1);
  }

  console.log(`Starting APIMatic portal server (PID ${child.pid})...`);
  console.log("Streaming output from apimatic portal serve:\n");

  let urlFound = false;
  let exited = false;
  let portInUse = false;

  function handleChunk(chunk) {
    const text = chunk.toString();
    logStream.write(text);
    process.stdout.write(text);

    // Detect port-in-use early so the exit handler can retry
    if (text.includes("EADDRINUSE")) portInUse = true;

    if (!urlFound) {
      for (const marker of STARTUP_MARKERS) {
        if (text.includes(marker)) {
          urlFound = true;
          for (const line of text.split("\n")) {
            if (line.includes(marker)) {
              console.log(`\nPortal is ready: ${line.trim()}`);
              break;
            }
          }
          console.log("Hot reload is active. Edit files in src/ and the portal will update automatically.");
          console.log("Server will auto-stop after 30 minutes of inactivity.");
          console.log("To stop: node serve.mjs stop\n");

          child.stdout.removeAllListeners("data");
          child.stderr.removeAllListeners("data");
          child.stdout.pipe(logStream);
          child.stderr.pipe(logStream);
          child.unref();

          // Spawn watchdog to auto-stop the server after 30 min of inactivity
          const watchdog = spawn(
            process.execPath,
            [
              WATCHDOG_SCRIPT,
              `--server-pid=${child.pid}`,
              `--heartbeat=${HEARTBEAT_FILE}`,
            ],
            { detached: true, stdio: "ignore" }
          );

          watchdog.on("error", (err) => {
            console.error(`WARNING: Watchdog failed to start: ${err.message}`);
            console.error("The portal server is running but will NOT auto-stop after 30 minutes.");
            console.error("Remember to stop it manually: node serve.mjs stop");
            // Rewrite PID file with just the server PID
            try { fs.writeFileSync(PID_FILE, String(child.pid)); } catch { /* best effort */ }
          });

          watchdog.unref();
          try {
            fs.writeFileSync(PID_FILE, `${child.pid}\n${watchdog.pid}`);
          } catch { /* best effort — server is already running */ }

          process.exit(0);
        }
      }
    }
  }

  child.stdout.on("data", handleChunk);
  child.stderr.on("data", handleChunk);

  child.on("exit", (code) => {
    exited = true;
    logStream.end();
    if (!urlFound) {
      if (portInUse && retryCount < MAX_PORT_RETRIES) {
        const nextPort = port + 1;
        console.log(`\nPort ${port} is already in use. Retrying on port ${nextPort}...`);
        safeUnlink(PID_FILE);
        safeUnlink(HEARTBEAT_FILE);
        start(nextPort, inputPath, retryCount + 1);
      } else if (portInUse) {
        const triedPorts = Array.from({ length: MAX_PORT_RETRIES + 1 }, (_, i) => port - retryCount + i).join(", ");
        console.error(`\nERROR: Ports ${triedPorts} are all in use.`);
        console.error('Free a port first, or run "apimatic portal serve --port=NNNN" manually in the project root.');
        safeUnlink(PID_FILE);
        safeUnlink(HEARTBEAT_FILE);
        process.exit(1);
      } else {
        console.error(`\nServer process exited (code ${code}) before becoming ready.`);
        console.error("Full output is above. Check the error and retry.");
        console.error('Manual fallback: run "apimatic portal serve" yourself in the project root.');
        safeUnlink(PID_FILE);
        safeUnlink(HEARTBEAT_FILE);
        process.exit(1);
      }
    }
  });

  // Safety timeout
  setTimeout(() => {
    if (!urlFound && !exited) {
      console.log(`\nTimeout after ${STARTUP_TIMEOUT_MS / 1000}s — URL not yet detected.`);
      console.log("The server may still be starting. Check with 'node serve.mjs status'.");
      child.stdout.destroy();
      child.stderr.destroy();
      child.unref();
      logStream.end();
      process.exit(0);
    }
  }, STARTUP_TIMEOUT_MS);
}

function status() {
  safeTouchHeartbeat();
  const pid = readPid();
  if (pid === null) {
    console.log("No server running (no PID file).");
    return;
  }
  if (isRunning(pid)) {
    console.log(`Running (PID ${pid}).`);
    console.log("\nRecent log output:");
    printLogTail(15);
  } else {
    console.log(`Process ${pid} is no longer running. Cleaning stale PID file.`);
    safeUnlink(PID_FILE);
  }
}

function stop() {
  const pid = readPid();
  if (pid === null) {
    console.log("No server running (no PID file).");
    return;
  }

  // Kill watchdog first so it doesn't race to kill the server independently
  const watchdogPid = readWatchdogPid();
  if (watchdogPid) {
    try { process.kill(watchdogPid, "SIGTERM"); } catch { /* already dead */ }
  }

  // Delete heartbeat — signals watchdog to exit cleanly if SIGTERM was missed
  safeUnlink(HEARTBEAT_FILE);

  if (!isRunning(pid)) {
    console.log(`Process ${pid} already stopped. Removing stale PID file.`);
    safeUnlink(PID_FILE);
    return;
  }
  try {
    process.kill(process.platform === "win32" ? pid : -pid, "SIGTERM");
    let waited = 0;
    const waitKill = setInterval(() => {
      waited += 200;
      if (!isRunning(pid)) {
        clearInterval(waitKill);
        safeUnlink(PID_FILE);
        console.log(`Stopped (PID ${pid}).`);
      } else if (waited >= 3000) {
        clearInterval(waitKill);
        try { process.kill(process.platform === "win32" ? pid : -pid, "SIGKILL"); } catch { /* already dead */ }
        safeUnlink(PID_FILE);
        console.log(`Force-killed (PID ${pid}).`);
      }
    }, 200);
  } catch (err) {
    if (err.code === "EPERM") {
      console.error(`ERROR: Permission denied stopping process ${pid}.`);
      console.error("The server may have been started by a different user.");
      console.error(`Manual fix: kill -9 ${pid}`);
    } else {
      console.error(`Error stopping process ${pid}: ${err.message}`);
      console.error("You may need to kill it manually.");
    }
  }
}

// ── watch ──────────────────────────────────────────────────────────────────

function watch() {
  const pid = readPid();
  if (!pid || !isRunning(pid)) {
    console.log("No server running — nothing to watch.");
    process.exit(1);
  }

  if (!fs.existsSync(LOG_FILE)) {
    console.log("Log file not found. Server may still be starting.");
    process.exit(1);
  }

  const WATCH_MARKER = "Portal generated successfully";
  const TIMEOUT_MS = 120_000;
  let offset = fs.statSync(LOG_FILE).size; // start from current end of log
  let elapsed = 0;
  const POLL_MS = 500;
  let heartbeatWarnedOnce = false;

  console.log("Watching for portal regeneration...\n");

  const interval = setInterval(() => {
    elapsed += POLL_MS;

    // Touch heartbeat to keep the watchdog from timing out while we're watching
    try {
      fs.writeFileSync(HEARTBEAT_FILE, String(Date.now()));
    } catch {
      if (!heartbeatWarnedOnce) {
        heartbeatWarnedOnce = true;
        console.error("WARNING: Could not update heartbeat file. Auto-stop timer may fire early.");
      }
    }

    // Read new log output since last tick
    try {
      const stat = fs.statSync(LOG_FILE);
      if (stat.size > offset) {
        const fd = fs.openSync(LOG_FILE, "r");
        const len = stat.size - offset;
        const buf = Buffer.alloc(len);
        fs.readSync(fd, buf, 0, len, offset);
        fs.closeSync(fd);
        offset = stat.size;

        const text = buf.toString();
        // Strip ANSI control sequences and cursor-move codes before printing
        const clean = text.replace(/\x1b\[[0-9;]*[A-Za-z]|\[999D|\[J|\[?25[lh]/g, "");
        if (clean.trim()) process.stdout.write(clean);

        if (text.includes(WATCH_MARKER)) {
          clearInterval(interval);
          console.log("\nPortal regenerated successfully. Refresh your browser to see the changes.");
          process.exit(0);
        }
      }
    } catch {
      // Log file temporarily unavailable — skip this tick silently
    }

    if (elapsed >= TIMEOUT_MS) {
      clearInterval(interval);
      console.log(`\nTimeout after ${TIMEOUT_MS / 1000}s — regeneration still in progress.`);
      process.exit(1);
    }
  }, POLL_MS);
}

// ── CLI entry point ────────────────────────────────────────────────────────

const [, , command, ...rest] = process.argv;

function parseArgs(args) {
  const result = { port: 3000, input: "./" };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--port=")) result.port = parseInt(arg.split("=")[1], 10);
    else if (arg.startsWith("--input=")) result.input = arg.split("=")[1];
    else if (arg === "--port" && args[i + 1]) result.port = parseInt(args[++i], 10);
    else if (arg === "--input" && args[i + 1]) result.input = args[++i];
  }
  return result;
}

switch (command) {
  case "start": {
    const { port, input } = parseArgs(rest);
    start(port, input);
    break;
  }
  case "status":
    status();
    break;
  case "stop":
    stop();
    break;
  case "watch":
    watch();
    break;
  default:
    console.log("Usage: node serve.mjs <start|status|stop|watch> [--port 3000] [--input ./]");
    console.log("       Server auto-stops after 30 minutes of agent inactivity.");
    process.exit(1);
}
