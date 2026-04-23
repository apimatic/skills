Browser sign-in opens a browser window and completes the OAuth flow, but the session token sometimes doesn't get written back to the CLI before you check. Since `apimatic auth status` isn't showing your email, the browser auth didn't fully complete.

The most reliable fix is to use an API key instead. Here's how:

**Step 1: Get your API key**

Go to your APIMatic Dashboard, then navigate to Account > API Keys and copy your key.

**Step 2: Log in using the API key**

Run this command, replacing `YOUR_API_KEY` with the key you copied:

```
apimatic auth login --auth-key=YOUR_API_KEY
```

**Step 3: Confirm it worked**

```
apimatic auth status
```

This should now show your account email.

---

If you'd prefer to set a key without running a login command, you can use an environment variable instead:

**macOS / Linux / bash / zsh:**
```bash
export APIMATIC_API_KEY=YOUR_API_KEY
```

**Windows PowerShell:**
```powershell
$env:APIMATIC_API_KEY = "YOUR_API_KEY"
```

**Windows Command Prompt:**
```
set APIMATIC_API_KEY=YOUR_API_KEY
```

Once the environment variable is set, the CLI will pick it up automatically with no separate login step needed.

---

If neither approach works, check that your APIMatic account is active and that you have internet access to apimatic.io. Let me know once authentication is confirmed and I can continue from there.
