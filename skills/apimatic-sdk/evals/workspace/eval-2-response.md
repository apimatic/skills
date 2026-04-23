Great news — since you have your OpenAPI spec ready but no project directory yet, we just need to scaffold the project structure before generating the SDK. Here's exactly what to do, step by step.

## Before You Start: Prerequisites

Make sure you have the following in place:

1. **Node.js 20 or later** — download from https://nodejs.org if needed. Verify with:
   ```
   node --version
   ```

2. **APIMatic CLI installed globally:**
   ```
   npm install -g @apimatic/cli
   ```
   Verify it's working:
   ```
   apimatic --version
   ```

3. **An APIMatic account** — free trial available at https://app.apimatic.io.

## Step 1: Authenticate with APIMatic

First, check if you're already logged in:

```
apimatic auth status
```

If it shows your account email, you're good — skip ahead to Step 2.

If not, run the browser-based login. After it opens a browser window, complete sign-in there, then come back and confirm you're done. Afterward, verify with `apimatic auth status`.

If browser login doesn't work (e.g., headless environment), use an API key instead:

```
apimatic auth login --auth-key=YOUR_API_KEY
```

API keys can be generated at: APIMatic Dashboard > Account > API Keys.

## Step 2: Set Up Your Project Directory

Since you don't have a project directory yet, I need one more piece of information: **where would you like to set up the project directory?** Give me a path, or I'll use the current directory.

Once I know the location, I'll set up this structure for you:

```
your-project/
└── src/
    └── spec/
        ├── openapi.yaml          (your existing spec, copied in)
        └── APIMATIC-META.json    (downloaded automatically)
```

Here are the commands (replace `./my-sdk-project` with your chosen path):

**On macOS/Linux:**
```bash
mkdir -p ./my-sdk-project/src/spec
cp ./openapi.yaml ./my-sdk-project/src/spec/
```

**On Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path ".\my-sdk-project\src\spec"
Copy-Item ".\openapi.yaml" -Destination ".\my-sdk-project\src\spec\"
```

## Step 3: Generate the Go SDK

From inside your project directory (the folder that contains `src/`):

```
cd my-sdk-project
apimatic sdk generate --language=go
```

The SDK will be generated at `my-sdk-project/sdk/go` by default. If you want it somewhere else, add `--destination=path/to/output`.

## Step 4: Customization (Optional)

If you plan to customize the SDK after generation, let me know now and I'll add the `--track-changes` flag so your changes can be safely saved and reapplied across future regenerations.

---

**To get started, just confirm:**
1. Where you'd like the project directory set up (or confirm the current directory is fine)
2. Whether you're already authenticated, or need to log in first
3. Whether you want to customize the SDK after generating it

Once I have those answers, I'll walk you through each command.
