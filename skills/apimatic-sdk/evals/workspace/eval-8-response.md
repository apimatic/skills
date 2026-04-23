The `apimatic --version` command not found error typically means the npm global binary directory is not in your system PATH, even though the package was installed successfully. Let's fix that.

**Step 1: Fix the PATH issue**

First, find where npm installs global binaries:

```
npm config get prefix
```

This will print a directory path (e.g., `/usr/local` on macOS/Linux, or `C:\Users\YourName\AppData\Roaming\npm` on Windows).

If the npm prefix's `bin` folder is missing from your PATH, add it:

On macOS/Linux (bash/zsh):
```bash
export PATH="$(npm config get prefix)/bin:$PATH"
```

To make it permanent, add that line to your `~/.bashrc` or `~/.zshrc`, then reload with `source ~/.bashrc`.

On Windows PowerShell:
```powershell
$env:PATH = "$(npm config get prefix)" + ";" + $env:PATH
```

After updating PATH, verify the CLI is working:
```
apimatic --version
```

If that still fails, try reinstalling:
```
npm install -g @apimatic/cli
apimatic --version
```

Once `apimatic --version` returns a version number, you're good. Let me know when that's confirmed and we'll move on to authentication and Python SDK generation.
