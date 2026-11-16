#!/usr/bin/env bash
# A CLI v2 portal project in the empty workspace: the apimatic-portal example apimatic.json and pages, and the
# apimatic-business-rules example API definition.
set -euo pipefail
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mkdir -p src/spec
cp "$PLUGIN_ROOT/skills/apimatic-portal/examples/apimatic.json" src/apimatic.json
cp -R "$PLUGIN_ROOT/skills/apimatic-portal/examples/content" src/content
cp "$PLUGIN_ROOT/skills/apimatic-business-rules/examples/project/src/spec/openapi.yaml" src/spec/openapi.yaml
