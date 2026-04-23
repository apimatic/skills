Great — since you're already authenticated and plan to customize the SDK afterwards, I'll generate your Java SDK with change tracking enabled. That way your customizations will be preserved across future regenerations.

First, verify your authentication is still active:

```
apimatic auth status
```

Once that confirms your account, run the following from inside `./my-java-api/` (the directory that contains your `src/` folder):

```
apimatic sdk generate --language=java --track-changes
```

The `--track-changes` flag initializes change tracking so that any customizations you make can be saved and automatically reapplied every time you regenerate. The SDK will be generated at `./my-java-api/sdk/java/` by default.

---

**Before you start customizing, keep these tips in mind:**

- Add custom logic in a **new file** where possible — new files are never overwritten on regeneration.
- Avoid editing generated files directly.
- If you must edit a generated file, add your changes at the **top or bottom** to reduce merge conflicts.

---

**Once you've made your customizations**, save them so they survive future regenerations:

```
apimatic sdk save-changes --language=java --input=./my-java-api
```

This captures the diff between the plain generated output and your modified version. From that point on, every time you run `sdk generate`, your customizations are reapplied automatically.

Make your customizations now, then let me know when you're ready to save them.
