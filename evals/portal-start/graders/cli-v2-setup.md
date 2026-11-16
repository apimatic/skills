---
type: llm
---

PASS if the response's setup steps require Node.js 24 or later and install APIMatic CLI v2 with the major version pinned (`@apimatic/cli@2`), or check that `apimatic --version` prints `@apimatic/cli/2.`.

FAIL if it installs the CLI without a version (`npm install -g @apimatic/cli`), tells the user to create `APIMATIC-BUILD.json` or `toc.yml`, or gives a Node.js requirement lower than 24.
