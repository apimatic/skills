Setting the SDK project name is a CodeGen setting — specifically `ProjectName` in `APIMATIC-META.json`. Since you're already authenticated, here's what to do:

**Step 1: Open your APIMATIC-META.json**

Open the file at:

```
./payments/src/spec/APIMATIC-META.json
```

**Step 2: Add the ProjectName setting**

Locate the `CodeGenSettings` object and add (or update) the `ProjectName` key:

```json
{
  "CodeGenSettings": {
    "ProjectName": "PaymentsSDK"
  }
}
```

Save the file.

**Step 3: Regenerate the SDK**

From the `./payments/` directory (the one that contains `src/`), run:

```
apimatic sdk generate --input=./payments --language=java
```

That's it — the project name is baked into the generation config, so every future regeneration will use `PaymentsSDK` automatically.
