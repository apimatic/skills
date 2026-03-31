#!/usr/bin/env bash
# apimatic-portal skill regression checks
# Verifies QUAL-01 through QUAL-04 are still satisfied after any edits to skill files.
# Run from the repo root: bash skills/apimatic-portal/check.sh
#
# For AI evals (QUAL-03a/03b), see: skills/apimatic-portal/evals/evals.json
# Run those via /skill-creator in the Claude interface.

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PASS=0
FAIL=0

pass() { echo "  PASS  $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL  $1"; FAIL=$((FAIL + 1)); }

separator() { echo ""; echo "--- $1 ---"; }

# ─────────────────────────────────────────────
separator "QUAL-01 — Compatibility is >=20, not >=16"

if grep -r ">=16" "$SKILL_DIR/SKILL.md" "$SKILL_DIR/references/"*.md > /dev/null 2>&1; then
  fail ">=16 still present in skill files (should be >=20)"
else
  pass "No >=16 references found — compatibility is >=20"
fi

if grep -q ">=20" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md contains >=20 in compatibility field"
else
  fail "SKILL.md missing >=20 in compatibility field"
fi

# ─────────────────────────────────────────────
separator "QUAL-02a — CLI audit: all 13 flag gaps filled"

# portal toc new flags (QUAL-02b)
for flag in "expand-endpoints" "expand-models" "expand-webhooks" "expand-callbacks" "force" "destination" "input"; do
  if grep -qF -- "--$flag" "$SKILL_DIR/references/navigation-and-content.md"; then
    pass "navigation-and-content.md: --$flag (toc new)"
  else
    fail "navigation-and-content.md: --$flag missing (toc new)"
  fi
done

# portal serve flags (QUAL-02c)
for flag in "open" "no-reload" "ignore" "port" "auth-key"; do
  if grep -qF -- "--$flag" "$SKILL_DIR/references/navigation-and-content.md"; then
    pass "navigation-and-content.md: --$flag (serve)"
  else
    fail "navigation-and-content.md: --$flag missing (serve)"
  fi
done

# portal generate CI flags (QUAL-02d)
if grep -qF -- "--force" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md: --force (-f) in CI section"
else
  fail "SKILL.md: --force/-f missing from CI section"
fi

if grep -qF -- "--zip" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md: --zip in CI section"
else
  fail "SKILL.md: --zip missing from CI section"
fi

# portal copilot flags (QUAL-02d)
if grep -qF -- "--disable" "$SKILL_DIR/references/copilot-and-ai.md"; then
  pass "copilot-and-ai.md: --disable flag present"
else
  fail "copilot-and-ai.md: --disable flag missing"
fi

# portal recipe new flags (QUAL-02d)
if grep -qF -- "--name" "$SKILL_DIR/references/recipes.md"; then
  pass "recipes.md: --name flag present"
else
  fail "recipes.md: --name flag missing"
fi

# ─────────────────────────────────────────────
separator "QUAL-02b — Flags for portal toc new section present"

if grep -q "Flags for portal toc new" "$SKILL_DIR/references/navigation-and-content.md"; then
  pass "navigation-and-content.md: 'Flags for portal toc new' section exists"
else
  fail "navigation-and-content.md: 'Flags for portal toc new' section missing"
fi

# ─────────────────────────────────────────────
separator "QUAL-02c — Flags for portal serve section present"

if grep -q "Flags for portal serve" "$SKILL_DIR/references/navigation-and-content.md"; then
  pass "navigation-and-content.md: 'Flags for portal serve' section exists"
else
  fail "navigation-and-content.md: 'Flags for portal serve' section missing"
fi

# ─────────────────────────────────────────────
separator "QUAL-02d — Flag sections present in copilot and recipes files"

if grep -q "Flags for portal copilot" "$SKILL_DIR/references/copilot-and-ai.md"; then
  pass "copilot-and-ai.md: 'Flags for portal copilot' section exists"
else
  fail "copilot-and-ai.md: 'Flags for portal copilot' section missing"
fi

if grep -q "Flags for portal recipe new" "$SKILL_DIR/references/recipes.md"; then
  pass "recipes.md: 'Flags for portal recipe new' section exists"
else
  fail "recipes.md: 'Flags for portal recipe new' section missing"
fi

# ─────────────────────────────────────────────
separator "QUAL-03a/03b — AI eval spec integrity (evals.json)"
# Note: actual eval execution requires /skill-creator in Claude interface.
# This check verifies the eval spec is present and structurally sound.

EVALS_FILE="$SKILL_DIR/evals/evals.json"

if [ -f "$EVALS_FILE" ]; then
  pass "evals.json exists at skills/apimatic-portal/evals/evals.json"
else
  fail "evals.json missing — create it to enable /skill-creator evals"
fi

if [ -f "$EVALS_FILE" ]; then
  EVAL_COUNT=$(python3 -c "import json,sys; d=json.load(open('$EVALS_FILE')); print(len(d['evals']))" 2>/dev/null || echo "0")
  if [ "$EVAL_COUNT" -ge 4 ]; then
    pass "evals.json: $EVAL_COUNT eval cases (expected >=4)"
  else
    fail "evals.json: only $EVAL_COUNT eval cases (expected >=4 covering auth/quickstart/serve/generate)"
  fi

  ASSERTION_COUNT=$(python3 -c "import json,sys; d=json.load(open('$EVALS_FILE')); print(sum(len(e['assertions']) for e in d['evals']))" 2>/dev/null || echo "0")
  if [ "$ASSERTION_COUNT" -ge 15 ]; then
    pass "evals.json: $ASSERTION_COUNT total assertions (expected >=15)"
  else
    fail "evals.json: only $ASSERTION_COUNT assertions (expected >=15)"
  fi

  # Check the 4 required workflows are covered by prompt content
  PROMPTS=$(python3 -c "import json; d=json.load(open('$EVALS_FILE')); [print(e['prompt']) for e in d['evals']]" 2>/dev/null || echo "")
  if echo "$PROMPTS" | grep -qi "auth login\|authentication\|log in"; then
    pass "evals.json: auth workflow covered"
  else
    fail "evals.json: auth workflow not covered"
  fi
  if echo "$PROMPTS" | grep -qi "quickstart\|from scratch"; then
    pass "evals.json: quickstart workflow covered"
  else
    fail "evals.json: quickstart workflow not covered"
  fi
  if echo "$PROMPTS" | grep -qi "portal serve\|dev server\|hot reload"; then
    pass "evals.json: portal serve workflow covered"
  else
    fail "evals.json: portal serve workflow not covered"
  fi
  if echo "$PROMPTS" | grep -qi "portal generate\|CI\|GitHub Actions"; then
    pass "evals.json: portal generate/CI workflow covered"
  else
    fail "evals.json: portal generate/CI workflow not covered"
  fi
fi

echo ""
echo "  To run the AI evals: stage skills/apimatic-portal/ to .claude/skills/ and run /skill-creator in Claude"

# ─────────────────────────────────────────────
separator "QUAL-04 — metadata.status is stable"

if grep -qF "status: stable" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md: metadata.status is stable"
else
  fail "SKILL.md: metadata.status is NOT stable (skill not yet promoted)"
fi

# ─────────────────────────────────────────────
separator "QUAL-05 — scripts/ directory and Python scripts present"

if [ -f "$SKILL_DIR/scripts/serve.mjs" ]; then
  pass "scripts/serve.mjs exists"
else
  fail "scripts/serve.mjs missing — create it to enable background portal server management"
fi

if [ -f "$SKILL_DIR/scripts/auth-login.mjs" ]; then
  pass "scripts/auth-login.mjs exists"
else
  fail "scripts/auth-login.mjs missing — create it to enable non-blocking auth login"
fi

# ─────────────────────────────────────────────
separator "QUAL-06 — evals.json has at least 11 eval cases"

EVAL_COUNT=$(python3 -c "import json,sys; data=json.load(open('$SKILL_DIR/evals/evals.json')); print(len(data['evals']))" 2>/dev/null)
if [ -n "$EVAL_COUNT" ] && [ "$EVAL_COUNT" -ge 11 ]; then
  pass "evals.json has $EVAL_COUNT evals (>= 11 required)"
else
  fail "evals.json has ${EVAL_COUNT:-unknown} evals — need at least 11 (7 existing + 4 onboarding path)"
fi

# ─────────────────────────────────────────────
separator "QUAL-07 — Path A contains deterministic onboarding flow markers"

ONBOARDING_MARKERS=("node --version" "npm install -g" "serve.mjs start" "AskUserQuestion")
for marker in "${ONBOARDING_MARKERS[@]}"; do
  if grep -qF "$marker" "$SKILL_DIR/references/first-time-setup.md" 2>/dev/null; then
    pass "first-time-setup.md: Path A contains '$marker'"
  else
    fail "first-time-setup.md: Path A missing '$marker' — deterministic onboarding flow may be incomplete"
  fi
done

if grep -qF "shut down the portal" "$SKILL_DIR/references/first-time-setup.md" 2>/dev/null; then
  pass "first-time-setup.md: shutdown reminder present"
else
  fail "first-time-setup.md: shutdown reminder 'shut down the portal' missing from server briefing"
fi

if grep -qF "first-time-setup.md" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md: references first-time-setup.md in Path A"
else
  fail "SKILL.md: Path A does not reference first-time-setup.md"
fi

# ─────────────────────────────────────────────
separator "All reference files reachable from SKILL.md"

REFS=("first-time-setup.md" "build-directory.md" "copilot-and-ai.md" "dynamic-configurations.md" "navigation-and-content.md" "recipes.md" "seo-and-discovery.md" "theme-and-appearance.md")
for ref in "${REFS[@]}"; do
  if [ -f "$SKILL_DIR/references/$ref" ]; then
    pass "references/$ref exists"
  else
    fail "references/$ref missing"
  fi
done

# ─────────────────────────────────────────────
echo ""
echo "════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed"
echo "════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "REGRESSION DETECTED — $FAIL check(s) failed. Review output above."
  exit 1
else
  echo "All checks passed. Skill is production-ready."
  exit 0
fi
