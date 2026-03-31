# Copilot and AI Reference

This file covers API Copilot CLI setup via the interactive wizard and LLMs.txt generation configuration in `APIMATIC-BUILD.json`.

---

## API Copilot

API Copilot adds a chat interface to the developer portal, allowing visitors to ask questions about the API documentation directly within the portal.

### Prerequisites

API Copilot requires a unique Copilot key. Contact your Customer onboarding team or reach out to <support@apimatic.io> to get the Copilot key.

### apiCopilotConfig JSON structure

> **Critical:** `apiCopilotConfig` is a **top-level key** in `APIMATIC-BUILD.json` — at the same level as `generatePortal`. It must **never** be placed inside `generatePortal`. Placing it inside `generatePortal` will cause it to be silently ignored.

Add `apiCopilotConfig` as a **top-level key** in `APIMATIC-BUILD.json`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": { },
  "apiCopilotConfig": {
    "key": "<api-copilot-key-goes-here>",
    "welcomeMessage": "Welcome to the Developer Portal!\n\nStart by asking API Copilot questions like:\n\n- `How do I retrieve user playlists?`\n- `How to fetch the most played songs from a user's history?`",
    "isEnabled": true
  }
}
```

**Field explanations:**

- `key` — the authentication key provided by APIMatic's team. Required. Must match exactly.
- `welcomeMessage` — a Markdown-formatted string shown when users open the copilot chat. Use
  `\n` for newlines inside the JSON string. Include assistive prompts (see below). Optional but
  recommended.
- `isEnabled` — set to `true` to enable. To disable, set to `false` (keep the same `key`) and
  regenerate the portal.

### Welcome message and assistive prompts

The welcome message is shown when a user starts a new chat session. Include 3–5 assistive
prompts as inline code elements in an unordered list to guide users:

```
Welcome to the Spotify Web API Developer Portal!

Explore the following prompts and harness the power of the Spotify Web API with API Copilot's assistance!

- `How to create a new playlist and add the 10 most popular Taylor Swift songs?`
- `How do I get the primary genre or category I listen to most, based on my top 50 tracks?`
- `How to add the song "Mockingbird" by Eminem to my current playback queue?`
- `Which endpoints are available only for Spotify Premium users?`
```

In the JSON string, encode this using `\n` for line breaks. Keep prompts as backtick-wrapped
inline code inside a markdown list.

### Enable API Copilot via CLI wizard

Run the copilot wizard from the project root (the directory containing `src/`):

```
apimatic portal copilot
```

This is an interactive wizard — run the command and then step aside. The CLI handles all prompts
directly with the user. The wizard will ask:

- Whether to use the APIMatic subscription key for copilot
- An optional welcome message to display in the copilot chat interface

The wizard updates `APIMATIC-BUILD.json` automatically. After the wizard completes, start the
local server to verify:

```bash
apimatic portal serve
```

**Note:** API Copilot can only be active on one portal at a time. Configuring it for the current
portal disables it on any other portal associated with the same APIMatic account.

### Flags for portal copilot

- `--input=<value>` : Path to the parent directory containing the `src` directory. Defaults to `./`.
- `--disable` : Marks the API Copilot as disabled in the `APIMATIC-BUILD.json` configuration.
- `--auth-key=<value>` : Override current authentication state with an authentication key.

### Multiple portals and environments

If you have multiple portals or environments (staging, production):

- Use a **different `key`** in `apiCopilotConfig` for each environment's build file.
- For multiple portals, assign separate keys for each portal in their respective build files.

### Background indexing time

API Copilot resources are generated in the background. Even after a successful portal generation
response, it may take **up to 30 minutes** for API Copilot to be fully operational, depending on
the size of the API specification. The chat interface becomes fully responsive once indexing
completes.

---

## LLMs.txt Generation

LLMs.txt is a standardized format that makes API documentation machine-readable for large language models. APIMatic can generate two LLMs.txt files automatically during portal builds.

### Configuration

- [ ] Ask the user the baseURL where this Portal will be hosted. For running locally, a localhost URL is acceptable.
- [ ] Add `baseUrl` and `llmsContextGeneration` to the `generatePortal` object in `APIMATIC-BUILD.json`:

```json
{
  "generatePortal": {
    "baseUrl": "https://your-production-domain.com",
    "llmsContextGeneration": {
      "enable": true
    }
  }
}
```

**Field explanations:**

- `baseUrl` — the public URL where the portal is deployed. APIMatic uses this to generate absolute URLs in the `llms.txt` index. Set this to the production domain.
- `llmsContextGeneration.enable` — set to `true` to generate `llms.txt` and `llms-full.txt` during portal builds. Set to `false` or omit to skip generation.

**Important:** Set `baseUrl` to the production domain (for example, `https://docs.your-company.com`), not `http://localhost:3000`. Using a localhost URL in production builds produces broken links in the generated `llms.txt` files that LLMs cannot resolve.

### Generated Files

After running `apimatic portal generate` or `apimatic portal serve`, two files are written to the portal root:

- `/llms.txt` — a summary index containing one-sentence descriptions and absolute links to each portal page. Optimized for LLMs that need a quick overview.
- `/llms-full.txt` — the complete documentation content combined into a single markdown file. Used by LLMs that can process large context windows.

### Verification

After building and deploying the portal, verify the files are accessible:

- Navigate to `https://your-portal-url/llms.txt`
- Navigate to `https://your-portal-url/llms-full.txt`

During local development, verify with:

- `http://localhost:3000/llms.txt`
- `http://localhost:3000/llms-full.txt`

If either file returns a 404, confirm that `llmsContextGeneration.enable` is set to `true` in `APIMATIC-BUILD.json` and that the portal was rebuilt after adding the configuration.
