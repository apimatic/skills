Since you're already authenticated, let's move straight to generating your Go SDK.

You've provided everything I need:

- **Input directory:** `./multi-version-api/` (already has a `src/` folder)
- **Language:** Go
- **API version:** v2

**Step 1: Navigate to your project root**

Make sure you're in the directory that contains the `src/` folder (not inside `src/` itself):

```
cd multi-version-api
```

**Step 2: Run the generate command**

```
apimatic sdk generate --input=./multi-version-api --language=go --api-version=v2
```

Or, if you're already inside `multi-version-api/`:

```
apimatic sdk generate --language=go --api-version=v2
```

The SDK will be generated at `./multi-version-api/sdk/v2/go/` by default.

---

**If you run into any issues:**

- **SDK already exists at that location:** The CLI will let you know. Just say the word and I'll re-run the command with `--force` to overwrite it.
- **Authentication error:** Run `apimatic auth status` to check, then let me know if it shows your account email.
- **Any other error:** Share the message and I'll help you resolve it.
