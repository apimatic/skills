To enable API Copilot for your portal, you need a Copilot key from APIMatic first. If you don't have one yet, contact your Customer onboarding team or reach out to support@apimatic.io to obtain it.

Once you have the key, the easiest way to configure it is through the interactive CLI wizard. Run this from your project root (the directory that contains the `src/` folder — not from inside `src/`):

```
apimatic portal copilot
```

The wizard will prompt you for:

1. Your APIMatic subscription (Copilot) key
2. An optional welcome message to display when users open the chat

After the wizard completes, it automatically writes the `apiCopilotConfig` block to your `src/APIMATIC-BUILD.json`. No manual JSON editing is needed.

---

**If you prefer to configure it manually**, add `apiCopilotConfig` as a **top-level key** in `src/APIMATIC-BUILD.json` — at the same level as `generatePortal`, not nested inside it:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": { },
  "apiCopilotConfig": {
    "key": "<your-copilot-key-here>",
    "welcomeMessage": "Welcome to the Developer Portal!\n\nStart by asking API Copilot questions like:\n\n- `How do I authenticate?`\n- `What endpoints are available?`",
    "isEnabled": true
  }
}
```

Field details:
- `key` — the authentication key from APIMatic. Required.
- `welcomeMessage` — Markdown string shown when users open the chat. Optional but recommended. Use `\n` for line breaks inside the JSON string. Include 3–5 example prompts as backtick-wrapped inline code in a list to guide users.
- `isEnabled` — set to `true` to enable. Set to `false` (keeping the same key) to disable later without removing the config.

**Important note:** API Copilot can only be active on one portal at a time. Enabling it here will disable it on any other portal associated with the same APIMatic account.

---

After configuring (via wizard or manual edit), regenerate the portal to apply the change. Check if your local dev server is running:

```
node {skill_dir}/scripts/serve.mjs status
```

If it is running, the portal will regenerate automatically. If not, start it:

```
node {skill_dir}/scripts/serve.mjs start --input ./
```

Once the portal regenerates, open it in your browser. You should see the API Copilot chat button in the portal UI.

**Indexing time:** Even after a successful portal generation, it may take up to 30 minutes for API Copilot to be fully operational. The chat interface becomes fully responsive once background indexing of your API specification completes.
