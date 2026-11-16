#!/usr/bin/env bash
# Copies the apimatic-business-rules example project (src/ and rules-work/) into the empty workspace.
set -euo pipefail
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cp -R "$PLUGIN_ROOT/skills/apimatic-business-rules/examples/project/." .
