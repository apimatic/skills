Running the APIMatic CLI non-interactively in GitHub Actions is straightforward — you skip browser-based login entirely and pass your API key directly to the generate command. Here's how to set it up.

## Prerequisites

Make sure these are in place before configuring the workflow:

- **Node.js >= 20** available in your runner (the `actions/setup-node` action handles this)
- **An APIMatic API key** stored as a GitHub Actions secret (e.g., `APIMATIC_API_KEY`)
- **Your project repository** contains a `src/` folder with your API spec inside `src/spec/`

API keys can be generated at: APIMatic Dashboard > Account > API Keys.

---

## GitHub Actions Workflow

Create a file at `.github/workflows/generate-sdk.yml` in your repository:

```yaml
name: Generate PHP SDK

on:
  push:
    branches:
      - main  # or whichever branch(es) you want to trigger generation

jobs:
  generate-sdk:
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

      - name: Generate PHP SDK
        run: |
          apimatic sdk generate \
            --input=. \
            --language=php \
            --auth-key=${{ secrets.APIMATIC_API_KEY }} \
            --force
```

---

## Key Points

**No login command needed.** Passing `--auth-key` directly to `sdk generate` is all that's required in a CI environment.

**`--input` points to the directory containing `src/`**, not to the spec file itself. In the example above, `.` means the root of the checked-out repository — adjust this if your project lives in a subdirectory.

**`--force` allows repeated builds.** On the first run, the SDK is generated fresh. On every subsequent push, `--force` tells the CLI to overwrite the existing output rather than stopping with an error.

**The API key stays secret.** GitHub Actions injects `${{ secrets.APIMATIC_API_KEY }}` as an environment value at runtime — it is never written to logs or exposed in the workflow file.

---

## Troubleshooting

- **Authentication error:** Verify the secret name in your repository settings matches exactly what you used in the workflow.
- **`apimatic` command not found:** Make sure the install step runs before the generate step and that Node.js is set up correctly.
- **Missing `src/` folder or spec file:** The CLI expects your API spec at `src/spec/` inside the directory you pass to `--input`. Double-check that path.
- **SDK already exists error (without `--force`):** Add `--force` to the generate command as shown above.
