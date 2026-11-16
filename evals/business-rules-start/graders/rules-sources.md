---
type: llm
---

The workspace is empty, so the response may stop and ask where the APIMatic project is; that is fine.

PASS if the response says the rules are written to the `src/rules/` folder of an APIMatic project, and that they come from the project's API definition (`src/spec/`) and docs (`src/content/`).

FAIL if it proposes taking rules from anywhere else (calling the live API, the web, or what it knows about the API), or writes rules without having read a definition or docs.
