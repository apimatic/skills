For CI pipelines, you do not need browser-based login at all. The APIMatic CLI supports API key authentication directly in the build command, which is the recommended approach for GitHub Actions and other CI environments.

## Running the Portal Build in CI

Use `apimatic portal generate` with the `--auth-key` flag to authenticate and build in a single step — no interactive login required:

```bash
apimatic portal generate --auth-key=YOUR_API_KEY
```

This builds the portal output and writes the generated files to `./portal/` by default.

If you need the output in a specific directory (for example, to deploy to a hosting provider), use the `--destination` flag:

```bash
apimatic portal generate --auth-key=YOUR_API_KEY --destination=./dist/portal
```

For repeated CI builds where the destination directory may already exist from a previous run, add `--force` to overwrite it:

```bash
apimatic portal generate --auth-key=YOUR_API_KEY --destination=./dist/portal --force
```

## Setting Up the GitHub Actions Workflow

**Step 1 — Store the API key as a repository secret**

In your GitHub repository, go to Settings > Secrets and variables > Actions, then create a new secret named `APIMATIC_API_KEY` with the value of the key you retrieved from APIMatic Dashboard > Account > API Keys.

**Step 2 — Add the build step to your workflow**

Here is a minimal but complete GitHub Actions workflow that installs the CLI and generates the portal:

```yaml
name: Build APIMatic Portal

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install APIMatic CLI
        run: npm install -g @apimatic/cli

      - name: Build portal
        run: apimatic portal generate --auth-key=${{ secrets.APIMATIC_API_KEY }} --force

      - name: Upload portal artifact
        uses: actions/upload-artifact@v4
        with:
          name: portal
          path: ./portal/
```

Note: `apimatic portal generate` must be run from the project root — the directory that contains your `src/` folder. If your portal project is in a subdirectory, add a `working-directory` to the step:

```yaml
      - name: Build portal
        working-directory: ./my-portal-project
        run: apimatic portal generate --auth-key=${{ secrets.APIMATIC_API_KEY }} --force
```

## Alternative: Environment Variable Instead of a Flag

If your tooling or scripts prefer environment variables over CLI flags, you can export `APIMATIC_API_KEY` and omit the `--auth-key` flag entirely:

```yaml
      - name: Build portal
        env:
          APIMATIC_API_KEY: ${{ secrets.APIMATIC_API_KEY }}
        run: apimatic portal generate --force
```

Both approaches are equivalent. The `--auth-key` flag approach is generally clearer in CI logs and makes the authentication source explicit.

## Summary of the Relevant Flags

| Flag | Purpose |
|------|---------|
| `--auth-key=KEY` | Authenticate with an API key — no browser login needed |
| `--destination=PATH` | Write generated files to a specific output directory (default: `./portal/`) |
| `--force` / `-f` | Overwrite the destination if it already exists — required for repeated builds |
| `--zip` | Download output as a `.zip` archive instead of a directory |

A complete working sample workflow is also available at: github.com/apimatic/sample-docs-as-code-portal
