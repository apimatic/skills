Before logging in, let's make sure the APIMatic CLI is installed. Run:

```
apimatic --version
```

If that command fails with "command not found", install the CLI first:

```
npm install -g @apimatic/cli
```

Then verify the install succeeded with `apimatic --version` before continuing.

---

## Logging in

I've launched the browser-based login flow for you. A browser window has opened. Complete sign-in in the browser, then confirm here when done.

(The auth launcher ran `apimatic auth login` as a detached process so your terminal is not blocked while you complete the OAuth flow.)

---

## After you confirm sign-in

Once you confirm sign-in is complete, I'll verify the session with:

```
apimatic auth status
```

The output should show your account email address, confirming authentication succeeded.

---

## Fallback: API key authentication

If the browser window did not open, or you are in a CI/headless environment, use API key authentication instead.

**Option 1 — CLI flag:**

```
apimatic auth login --auth-key=YOUR_API_KEY
```

**Option 2 — Environment variable (no login command needed):**

```
export APIMATIC_API_KEY=YOUR_API_KEY
```

API keys are generated at: **APIMatic Dashboard > Account > API Keys**.

---

## If authentication fails

If neither method works, check the following:

- Your APIMatic account is active at app.apimatic.io
- Your API key is copied correctly (no leading/trailing spaces)
- You have internet access to apimatic.io

Do not proceed to building your portal until authentication is confirmed — all portal commands require a valid session.

---

Please confirm in the browser and let me know when you are done, or let me know if you hit any errors.
