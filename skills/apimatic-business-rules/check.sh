#!/usr/bin/env bash
# apimatic-business-rules skill regression checks
# Run from the repo root: bash skills/apimatic-business-rules/check.sh

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES="$SKILL_DIR/scripts/rules.mjs"
EXAMPLE="$SKILL_DIR/examples/project"
PASS=0
FAIL=0

pass() { echo "  PASS  $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL  $1"; FAIL=$((FAIL + 1)); }
separator() { echo ""; echo "--- $1 ---"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# A copy of the example project with one change, then `rules.mjs check` on it; the check must fail.
expect_check_fails() {
  local label="$1" change="$2"
  rm -rf "$TMP/p" && cp -R "$EXAMPLE" "$TMP/p"
  (cd "$TMP/p" && eval "$change")
  if (cd "$TMP/p" && node "$RULES" check > "$TMP/out.txt" 2>&1); then
    fail "check accepts $label"
  else
    pass "check rejects $label"
  fi
}

# ─────────────────────────────────────────────
separator "SKILL.md"

if grep -qE "^name: apimatic-business-rules$" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md: name matches the folder"
else
  fail "SKILL.md: name is not apimatic-business-rules"
fi

if grep -qE "Node(\.js)? 24" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md: requires Node 24"
else
  fail "SKILL.md: Node 24 requirement missing"
fi

for ref in $(grep -oE "(references|scripts)/[a-z-]+\.(md|mjs)" "$SKILL_DIR/SKILL.md" | sort -u); do
  if [ -f "$SKILL_DIR/$ref" ]; then
    pass "SKILL.md: $ref exists"
  else
    fail "SKILL.md: names $ref, which does not exist"
  fi
done

# ─────────────────────────────────────────────
separator "rules.mjs on the example project"

if node --check "$RULES" 2> /dev/null; then
  pass "rules.mjs parses"
else
  fail "rules.mjs does not parse"
fi

if (cd "$EXAMPLE" && node "$RULES" ops | grep -qF '## `POST /plans/{plan_id}/prices` (`createPlanPrice`)'); then
  pass "ops lists the example's operations with their headings"
else
  fail "ops does not list the example's operations"
fi

mkdir -p "$TMP/new/src" && cp -R "$EXAMPLE/src/spec" "$TMP/new/src/"
if (cd "$TMP/new" && node "$RULES" ops | grep -qF '(`createSubscription`)'); then
  pass "ops works on a project with no src/rules/ yet"
else
  fail "ops needs src/rules/ to exist"
fi

if (cd "$EXAMPLE" && node "$RULES" check > "$TMP/out.txt" 2>&1); then
  pass "check passes on the example"
else
  fail "check fails on the example:"; cat "$TMP/out.txt"
fi

cp -R "$EXAMPLE" "$TMP/fresh"
(cd "$TMP/fresh" && node "$RULES" index > /dev/null)
if diff -q <(tr -d '\r' < "$TMP/fresh/src/rules/rules.md") <(tr -d '\r' < "$EXAMPLE/src/rules/rules.md") > /dev/null; then
  pass "index rebuilds the example's rules.md unchanged"
else
  fail "index writes a different rules.md than the example's"
fi

# ─────────────────────────────────────────────
separator "check rejects broken folders"

expect_check_fails "material left outside sources/" "echo 'note' > src/rules/new-notes.txt"
expect_check_fails "a hand-edited rules.md" "echo 'extra' >> src/rules/rules.md"
expect_check_fails "a rule line in another format" "echo '- Coupons expire after 30 days.' >> src/rules/every-request.md"
expect_check_fails "an <on> value outside the list" "sed -i.bak 's#\*\*loud\*\*, auth/-#**loud**, security/-#' src/rules/every-request.md && rm src/rules/every-request.md.bak"
expect_check_fails "an operation the spec does not have" "sed -i.bak 's#POST /plans/{plan_id}/prices#POST /plans/{plan_id}/costs#' src/rules/operations/plans.md && rm src/rules/operations/plans.md.bak"
expect_check_fails "an operation in the wrong area file" "mv src/rules/operations/plans.md src/rules/operations/billing.md"
expect_check_fails "a source file that does not exist" "rm src/rules/sources/SubscriptionService.cs"
expect_check_fails "one id with two conditions" "sed -i.bak 's#The plan has no price in#The plan has no prices in#' src/rules/operations/plans.md && rm src/rules/operations/plans.md.bak"

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
  echo "All checks passed."
  exit 0
fi
