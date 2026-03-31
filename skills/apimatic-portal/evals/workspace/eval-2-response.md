Since your project already has a `src/` folder, you are on **Path B** (existing project). Here is exactly what to run.

## Step 1: Check if a server is already running

Before starting a new instance, check whether one is already active from a previous session:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs status
```

- If the output contains `Running (PID ...)`, a server is already live. You can open http://localhost:3000 directly — no need to start another one.
- If the output says `No server running`, continue to Step 2.

## Step 2: Start the local dev server with hot reload

Run this from any directory — the `--input` flag points to your project root (the directory that **contains** `src/`, not `src/` itself):

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs start --input ~/my-portal/
```

The script streams `apimatic portal serve` output live so you see build progress in real time. Once the portal is ready, you will see a line like:

```
Portal is ready: Local: http://localhost:3000
Hot reload is active. Edit files in src/ and the portal will update automatically.
Server will auto-stop after 30 minutes of inactivity.
```

Your portal is then running at **http://localhost:3000**.

Hot reload is active — any changes you save to files under `src/` will trigger an automatic regeneration. Refresh your browser after a few seconds to see the updates.

## Important notes

- **Always run commands from the project root** (`~/my-portal/`), never from inside `src/`. Running from inside `src/` is a common mistake and will cause the command to fail.
- The server auto-stops after 30 minutes of inactivity.

## Useful follow-up commands

Check server status and recent logs at any time:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs status
```

Stop the server when you are done:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs stop
```

---

> Portal server is running. It will stop automatically after 30 minutes of inactivity. To stop it now, tell me: **"shut down the portal"**
