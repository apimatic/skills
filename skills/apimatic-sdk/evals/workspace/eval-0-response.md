Great! Let's get your Python SDK generated. Since this is your first time using the APIMatic CLI, we'll go through setup together.

## Step 1: Check prerequisites

Before anything else, make sure you have **Node.js 20 or later** installed. Run this to check:

```
node --version
```

If you don't have Node.js, download it from https://nodejs.org (choose the LTS version).

Once Node.js is confirmed, install the APIMatic CLI globally:

```
npm install -g @apimatic/cli
```

Then verify it installed correctly:

```
apimatic --version
```

If you see a version number, you're good to go. Let me know when that's done.

---

## Step 2: Authenticate with APIMatic

You'll need a free APIMatic account. If you don't have one yet, sign up at https://app.apimatic.io.

First, check if you're already authenticated:

```
apimatic auth status
```

If it doesn't show an account email, run this to log in via your browser:

```
apimatic auth login
```

A browser window will open. Complete sign-in there, then come back here and let me know when you're done.

After you confirm, we'll verify it worked:

```
apimatic auth status
```

It should show your account email. If browser login doesn't work, you can use an API key instead — generate one at APIMatic Dashboard > Account > API Keys, then run:

```
apimatic auth login --auth-key=YOUR_API_KEY
```

---

## Step 3: A couple of quick questions before we generate

Your input directory is `~/my-api-project/` and the language is **Python** — both already known. I just need two more things:

1. **Destination:** Do you have a specific folder where you'd like the SDK to be placed, or should I use the default location? (The default would be `~/my-api-project/sdk/python/`.)

2. **Customization:** Would you like to set up change tracking so any customizations you make to the SDK survive future regenerations? If yes, I'll add `--track-changes` to the generate command.

---

## Step 4: Generate the SDK

Once auth is confirmed and those questions are answered, the generate command will look like this:

```
apimatic sdk generate --input=~/my-api-project --language=python
```

Or with a custom destination:

```
apimatic sdk generate --input=~/my-api-project --language=python --destination=~/path/to/sdk-output
```

Note: `--input` points to `~/my-api-project/` — the folder containing `src/`, not the spec file itself.

---

**Summary of what I still need from you:**

1. Confirm Node.js is installed and the CLI installs successfully.
2. Complete browser sign-in and confirm when done.
3. Default destination or a custom path?
4. Change tracking — yes or no?

Once those are answered, your Python SDK will be ready to go.
