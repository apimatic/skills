Since you have your OpenAPI spec ready and are starting from scratch, you are on Path A: First-Time Setup. Here is how to get your APIMatic portal running.

## Step 1: Verify Node.js

The APIMatic portal toolchain requires Node.js 20 or higher. Check your version:

```
node --version
```

- v20.x.x or higher: proceed to Step 2.
- Lower than v20, or command not found: install Node.js from https://nodejs.org/en/download/ and come back. Do not proceed until Node.js 20 is available.

## Step 2: Install the APIMatic CLI

Install the APIMatic CLI globally:

```
npm install -g @apimatic/cli
```

Verify the installation succeeded:

```
apimatic --version
```

If the version string appears, the CLI is ready. If the command is not found, try `sudo npm install -g @apimatic/cli`.

## Step 3: Authenticate with APIMatic

Run:

```
apimatic auth login
```

This opens a browser OAuth flow. If you do not have an account yet, create a free trial at https://app.apimatic.io.

A browser window will open. Complete sign-in in the browser, then come back here and confirm.

After confirming, verify authentication succeeded:

```
apimatic auth status
```

The output should show your account email. If it does not, use the API key fallback:

```
apimatic auth login --auth-key=YOUR_API_KEY
```

Your API key is available at: APIMatic Dashboard > Account > API Keys.

Do not continue until `apimatic auth status` shows your email.

## Step 4: Create the project and run the quickstart wizard

Create a project directory and launch the quickstart:

```
mkdir my-portal
cd my-portal
apimatic quickstart
```

You can rename `my-portal` to any name you prefer.

Once the wizard starts, step aside — the CLI handles all prompts directly with you. The wizard prompts you for details like your API specification file path and project name. When asked for the spec path, provide:

```
~/projects/petstore.yaml
```

The wizard will scaffold the complete `src/` directory — `APIMATIC-BUILD.json`, `spec/`, `content/`, and `static/` — and generate your portal automatically. Do not interrupt it.

The resulting directory structure looks like this:

```
my-portal/
└── src/
    ├── APIMATIC-BUILD.json
    ├── content/
    │   ├── toc.yml
    │   └── guides/
    ├── spec/
    │   ├── APIMATIC-META.json
    │   └── petstore.yaml
    └── static/
        └── images/
```

## Step 5: Start the local dev server

After the wizard completes, start the preview server from your project root (the directory that contains `src/`):

```
apimatic portal serve
```

Once you see a URL like `http://localhost:3000` in the terminal, your portal is live.

```
Your portal is live at: http://localhost:3000

Hot reloading is active. Every time you save a file in src/, the portal
regenerates automatically. This typically takes 15–60 seconds depending
on portal size. The browser will refresh once it is ready.

What you can do now:
- Open http://localhost:3000 in your browser to view the portal
- Edit src/APIMATIC-BUILD.json to change theme, navigation, or features
- Add .md files to src/content/ to create new pages

The server will stop automatically after 30 minutes of inactivity.
To stop it now, tell me: "shut down the portal"
```

## What you can do next

Once the portal is running, here are common configuration tasks:

| Goal | How |
|------|-----|
| Change colors, fonts, theme | Edit `portalSettings.theme` in `src/APIMATIC-BUILD.json` |
| Add custom documentation pages | Create `.md` files in `src/content/guides/`, then run `apimatic portal toc new` |
| Configure navigation order | Edit `src/content/toc.yml` |
| Enable SEO (sitemap, robots.txt) | Add `baseUrl` and `indexable: {}` to `generatePortal` in `APIMATIC-BUILD.json` |
| Add API Copilot (AI assistant) | Run `apimatic portal copilot` — the wizard handles all configuration prompts |
| Build for production / CI | Run `apimatic portal generate --auth-key=YOUR_KEY` |

Let me know when the portal is up, or tell me if you hit any issues during the wizard or server startup.
