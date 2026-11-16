---
type: llm
---

PASS if the response runs, or gives as the command to run, `apimatic sdk generate` with `--language=typescript` (the CLI v2 form).

FAIL if it uses the CLI v1 form `apimatic sdk:generate` or a `--platform` flag, or generates the SDK with a tool other than the APIMatic CLI.
