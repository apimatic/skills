---
type: llm
---

PASS if the response runs, or gives as the command to run, `apimatic sdk generate` with `--language=typescript` (the CLI v2 form), and installs the CLI with its major version pinned (`@apimatic/cli@2`) or checks that `apimatic --version` prints `@apimatic/cli/2.`.

FAIL if it installs the CLI without a version (`npm install -g @apimatic/cli`, which installs CLI v1 on Node.js older than 24), uses or offers the CLI v1 form `apimatic sdk:generate` or a `--platform` flag (even as an alternative for older versions), or generates the SDK with a tool other than the APIMatic CLI.
