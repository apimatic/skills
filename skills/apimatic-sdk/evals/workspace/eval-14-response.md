For Docker and CI environments where interactive login isn't an option, the cleanest approach is the **environment variable method** — your API key never touches your shell history, and no login command is required at all.

## Option 1: Environment Variable (Recommended for Docker)

Set the environment variable before running any APIMatic CLI command. The CLI picks it up automatically — no `apimatic auth login` needed.

**In your Dockerfile or docker run command:**

```dockerfile
# Pass the key at runtime — keeps it out of the image and shell history
docker run -e APIMATIC_API_KEY="your_api_key_here" your-image
```

**In a shell script or CI pipeline (Linux/macOS/bash):**

```bash
export APIMATIC_API_KEY="your_api_key_here"
```

The key is set in the current process environment only — it does not appear in your shell history.

**Windows PowerShell:**

```powershell
$env:APIMATIC_API_KEY = "your_api_key_here"
```

Once the variable is set, run generation normally:

```bash
apimatic sdk generate --input=path/to/project --language=<language>
```

## Option 2: Inline Flag on the Generate Command

If you prefer to keep auth tied directly to the generate command, pass the key as a flag:

```bash
apimatic sdk generate --input=path/to/project --language=<language> --auth-key=$APIMATIC_API_KEY
```

## Where to Get Your API Key

Log in to the APIMatic Dashboard, go to **Account > API Keys**, and generate a key from there.

## Which Option to Use?

- **Docker / CI pipeline:** Use the environment variable. Inject it via your CI secret manager (GitHub Actions secrets, GitLab CI variables, AWS Secrets Manager, etc.) so it never appears in logs or image layers.
- **One-off Docker run:** Use `-e APIMATIC_API_KEY=...` on the `docker run` command.
- **Prefer a single command:** Use the `--auth-key` flag directly on `sdk generate`, sourcing from an already-injected env var.

All three approaches keep the key out of your shell history and avoid the need for interactive browser login. No `apimatic auth login` command needed in any of these cases.
