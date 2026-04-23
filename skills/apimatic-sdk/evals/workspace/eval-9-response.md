Great — since you're already authenticated, let's get your customizations saved.

First, I need to check whether change tracking has been initialized for your TypeScript SDK. Look inside your project folder (`./ts-api/`) for a folder called `sdk-source-tree`. Does it exist there?

---

**If `sdk-source-tree` is present (and contains a `.typescript` file):**

Change tracking is already set up. Run this to save your customizations:

```
apimatic sdk save-changes --language=typescript --input=./ts-api
```

That's it. Your extra helper methods are now saved and will be reapplied automatically every time you regenerate.

---

**If `sdk-source-tree` is not present:**

Change tracking hasn't been initialized yet, which means we need to run a fresh generation with `--track-changes` to set it up. However, generating into your current SDK folder would overwrite your existing customizations.

Would you like me to use a temporary folder for the fresh generation, or do you have a preferred destination instead?

- If you provide a path, I'll generate into that path.
- If you're fine with a temporary folder, I'll use `./ts-api/sdk/temp/typescript` and delete it after setup is complete.

Once the fresh generation is done, I'll run `sdk save-changes` pointing at your **original** customized SDK so your helper methods are captured — not the temporary output.
