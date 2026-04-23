Great — since you're already authenticated and have your `src/` folder set up at `./python-api/`, you're in a good spot to move quickly. Here's what we'll do: generate the Python SDK with change tracking enabled so your custom utility functions are preserved across future regenerations.

**Step 1: Generate the Python SDK with change tracking**

Navigate to your project root (the directory that contains `src/`) and run:

```
cd ./python-api
apimatic sdk generate --language=python --track-changes
```

This generates the SDK at `./python-api/sdk/python/` by default and initializes change tracking. Every future regeneration will automatically reapply your customizations.

If an SDK already exists at that destination, the CLI will warn you. If that happens, let me know — I'll add `--force` to overwrite it, or we can pick a different destination.

**Step 2: Add your custom utility functions**

Once generation completes, follow these guidelines when adding your utility code:

- Add custom logic in a **new file** where possible — new files are never overwritten on regeneration. For example, create `./python-api/sdk/python/utils.py` for your helpers.
- Avoid editing generated files directly.
- If you must edit a generated file, add your changes at the top or bottom to reduce merge conflicts.

Make your customizations now, then let me know when you're done.

**Step 3: Save your customizations**

Once your utilities are in place, run:

```
apimatic sdk save-changes --language=python --input=./python-api
```

This captures exactly what you changed or added and stores it in the source tree. From this point on, every time you run `sdk generate` for Python, your customizations will be reapplied automatically — no manual re-editing needed.
