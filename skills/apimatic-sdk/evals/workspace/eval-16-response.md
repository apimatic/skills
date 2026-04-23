Since you want no documentation files in the generated SDK, the right approach is to set `DisableDocs: true` in your `APIMATIC-META.json` before generating — this ensures docs are never produced in the first place, rather than removing them after the fact.

**Step 1: Update APIMATIC-META.json**

Open `./my-api/src/spec/APIMATIC-META.json` and add `DisableDocs: true` under `CodeGenSettings`:

```json
{
  "CodeGenSettings": {
    "DisableDocs": true
  }
}
```

If `CodeGenSettings` already exists in the file, just add `"DisableDocs": true` inside it alongside any other settings already there.

**Step 2: Generate the SDK**

From the `./my-api/` directory (the one that contains `src/`), run:

```
apimatic sdk generate --input=./my-api --language=typescript
```

That's it. The SDK will be generated at `./my-api/sdk/typescript/` with no README or other documentation files included.

If you'd like to put the SDK somewhere else, add `--destination=your/preferred/path` to the command. Let me know if you run into any issues.
