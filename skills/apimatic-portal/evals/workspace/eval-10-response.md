I'll stop the portal server now.

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs stop
```

Output:

```
Process 93439 already stopped. Removing stale PID file.
```

The portal server has been stopped. The process was no longer active, so the script cleaned up the stale PID file as well.

If you want to start the server again in the future, run:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs start --input ./
```

Run that command from your project root (the directory that contains `src/`).
