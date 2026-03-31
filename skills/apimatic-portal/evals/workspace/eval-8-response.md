The install succeeded but your shell can't find the `apimatic` binary. This is a PATH issue — npm's global `bin` directory is not on your shell's PATH. Here is how to fix it:

**Step 1: Find where npm installs global binaries**

```bash
npm config get prefix
```

This prints something like `/usr/local` or `/Users/yourname/.nvm/versions/node/v20.x.x` or `/Users/yourname/.npm-global`. The actual `bin` folder is that path with `/bin` appended.

**Step 2: Check whether that bin directory is in your PATH**

```bash
echo $PATH
```

Look for the directory from Step 1 in the output. If it is missing, that is the root cause.

**Step 3: Add the npm global bin directory to your PATH**

The exact fix depends on your shell and Node.js setup.

**Option A — You installed Node.js via nvm (most common on macOS)**

```bash
npm config get prefix
```

The prefix will be something like `/Users/yourname/.nvm/versions/node/v20.x.x`. Add the `bin` subpath to your shell profile:

```bash
# Add this line to ~/.zshrc (or ~/.bashrc if using bash)
export PATH="$(npm config get prefix)/bin:$PATH"
```

Then reload:

```bash
source ~/.zshrc
```

**Option B — You installed Node.js via Homebrew or the official installer**

The global prefix is typically `/usr/local` and `/usr/local/bin` is usually already on PATH. In this case the issue is likely a permissions problem — try reinstalling with `sudo`:

```bash
sudo npm install -g @apimatic/cli
```

Then verify:

```bash
apimatic --version
```

**Option C — You used a custom npm global prefix**

If you configured a custom prefix (e.g. `~/.npm-global`), add it:

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
source ~/.zshrc
```

**Verify the fix**

After applying the appropriate fix, confirm the binary is reachable:

```bash
which apimatic
apimatic --version
```

You should see a version string like `@apimatic/cli/x.y.z ...`. Once that works you are ready to continue.

---

**If `apimatic --version` still fails after the PATH fix:**

Run this to confirm the package actually installed:

```bash
npm list -g @apimatic/cli
```

If it is not listed, the original install failed silently. Re-run:

```bash
npm install -g @apimatic/cli
```

Watch for any errors in the output (network errors, permission denied, etc.) and share them so I can help diagnose further.
