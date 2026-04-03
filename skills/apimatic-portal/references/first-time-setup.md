# First-Time Setup: Guided Onboarding (Path A)

Use this path when no build directory (`src/`) exists yet. **You run every command directly** — do not ask the user to run CLI commands unless your attempt fails.

---

## Step A1: Check Node.js

Run `node --version` and read the output.

- v20.x.x or higher → proceed to Step A2
- Lower than v20, or command not found → stop and output exactly: "Node.js 20 or higher is required. Please install it from https://nodejs.org/en/download/ then come back." Do not proceed.

---

## Step A2: Install the APIMatic CLI

Before installing, use AskUserQuestion:

```
question: "APIMatic CLI needs to be installed globally. OK to run: npm install -g @apimatic/cli?"
options:
  - "Yes, go ahead"
  - "No, I'll install it myself"
```

- "Yes" → run `npm install -g @apimatic/cli`, then run `apimatic --version`
  - Version string appears in output → proceed to Step A3
  - Command not found or error → retry with elevated privileges (`sudo npm install -g @apimatic/cli` on macOS/Linux, or platform equivalent). If that also fails, stop and output exactly: "The install did not complete. Please open a terminal with Administrator privileges and run: `npm install -g @apimatic/cli`. Verify with `apimatic --version`, then come back here." Do not proceed.
- "No" → output: "When you're ready, run `npm install -g @apimatic/cli`, verify with `apimatic --version`, and come back here." Do not proceed until the user returns and confirms.

---

## Step A3: Authenticate

Run `apimatic auth login`. The command opens a browser OAuth flow.

Because you cannot observe whether the user completed browser sign-in, use AskUserQuestion:

Output first: "A browser window has opened. Please complete sign-in, then come back here."

```
question: "Have you completed sign-in in the browser?"
options:
  - "Yes, I signed in"
  - "No, the browser didn't open"
  - "I got an error"
```

- "Yes" → run `apimatic auth status` and read the output
  - Output contains an email address → proceed to Step A4
  - No email in output → output: "Sign-in may not have completed. Please try again, or use the API key fallback: `apimatic auth login --auth-key=YOUR_API_KEY`. Your API key is at: APIMatic Dashboard > Account > API Keys."
- "No" or "I got an error" → output: "Use `apimatic auth login --auth-key=YOUR_API_KEY` instead. Your API key is at: APIMatic Dashboard > Account > API Keys." Then run `apimatic auth status`. If still no email → stop: "Authentication failed. Do not proceed until authenticated."

---

## Step A4: Create the project and start the portal

First check whether a server is already running to avoid stale port conflicts:

```
node {skill_dir}/scripts/serve.mjs status
```

Where `{skill_dir}` is the absolute path to the directory containing this skill file.

If a running process is detected in the output, ask the user whether to reuse it or stop and restart — do not blindly start a second instance.

If no server is running, create the project directory and run the quickstart wizard:

```
mkdir my-portal
cd my-portal
apimatic quickstart
```

Replace `my-portal` with the user's preferred project name. `apimatic quickstart` is an interactive wizard — **step aside once it starts**. The CLI handles all prompts directly with the user. Do not intercept or answer the wizard prompts on the user's behalf. The wizard will scaffold `src/` with `APIMATIC-BUILD.json`, `spec/`, `content/`, and `static/`, then generate the portal.

After the wizard completes, start the server:

```
node {skill_dir}/scripts/serve.mjs start --input ./
```

The script streams `apimatic portal serve` output live and exits once the local URL is detected. When a URL appears, output the **server briefing** below verbatim.

**If the script exits with code 1 or times out (120s) without a URL:** prompt the user to run the command manually:

"The server manager did not start. Please run `apimatic portal serve` yourself, then tell me what URL appears in the terminal."

Use AskUserQuestion:

```
question: "Is the server running? What URL do you see?"
options:
  - "Yes — http://localhost:3000"
  - "Yes — different port"
  - "No — I got an error"
```

---

## Server Briefing — output this verbatim when the server is confirmed running

```
Your portal is live at: http://localhost:3000

Hot reloading is active. Every time you save a file in src/, the portal
regenerates automatically. This typically takes 15–60 seconds depending
on portal size. The browser will refresh once it is ready.

What you can do now:
- Open http://localhost:3000 in your browser to view the portal
- Edit src/APIMATIC-BUILD.json to change theme, navigation, or features
- Add .md files to src/content/ to create new pages

The server is tracked via PID (scripts/serve.pid).
It will stop automatically after 30 minutes of inactivity.
To stop it now, tell me: "shut down the portal"
```

At the end of every subsequent response while the server is running, append:

> Portal server is running. It will stop automatically after 30 minutes of inactivity. To stop it now, tell me: **"shut down the portal"**

Read `references/build-directory.md` to understand the directory structure and `APIMATIC-BUILD.json` that quickstart creates.
