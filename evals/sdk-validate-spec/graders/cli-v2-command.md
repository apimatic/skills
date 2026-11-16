---
type: llm
---

PASS if the response runs, or gives as the command to run, `apimatic api validate` (the CLI v2 form), pointed at the project or the definition (for example `--input=`, `--file=`, or run from the directory that contains `src/`).

FAIL if it uses the CLI v1 form `apimatic api:validate`, or validates the definition with a tool other than the APIMatic CLI.
