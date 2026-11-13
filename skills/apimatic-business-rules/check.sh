#!/usr/bin/env bash
# apimatic-business-rules skill regression checks
# Run from the repo root: bash skills/apimatic-business-rules/check.sh [<project root>...]
#
# With a project root (the directory that contains src/), it also checks that project's src/rules/ and records
# with `rules.mjs check`, which includes that codegen will add business-rules/ to the Context Plugin.

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

# A fresh copy of the example project at $TMP/p.
copy_example() { rm -rf "$TMP/p" && cp -R "$EXAMPLE" "$TMP/p"; }

# Change one record of the copy: a JavaScript expression on `r`, for the record with id $2 in records file $1.
edit_record() {
  node -e '
    const fs = require("fs"); const [file, id, expr] = process.argv.slice(1);
    const lines = fs.readFileSync(file, "utf8").split("\n");
    const i = lines.findIndex((l) => l.trim() && JSON.parse(l).id === id);
    if (i < 0) throw new Error("no record " + id);
    const r = JSON.parse(lines[i]); eval(expr); lines[i] = JSON.stringify(r);
    fs.writeFileSync(file, lines.join("\n"));
  ' "$TMP/p/rules-work/records/$1" "$2" "$3"
}

# A copy of the example project with one change, then `rules.mjs check` on it; the check must fail.
expect_check_fails() {
  local label="$1" change="$2"
  copy_example
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

# An unquoted ": " in the description makes the front matter invalid YAML, and the skill stops loading.
if grep -E "^description: " "$SKILL_DIR/SKILL.md" | cut -c14- | grep -qF ': '; then
  fail "SKILL.md: the description holds \": \", which breaks the front matter"
else
  pass "SKILL.md: the description is plain YAML"
fi

if grep -qE "Node(\.js)? 24" "$SKILL_DIR/SKILL.md"; then
  pass "SKILL.md: requires Node 24"
else
  fail "SKILL.md: Node 24 requirement missing"
fi

for ref in $(grep -ohE "(references|scripts)/[a-z-]+\.(md|mjs)" "$SKILL_DIR/SKILL.md" "$SKILL_DIR"/references/*.md | sort -u); do
  if [ -f "$SKILL_DIR/$ref" ]; then
    pass "$ref exists"
  else
    fail "a skill file names $ref, which does not exist"
  fi
done

if grep -rqE "src/rules/sources|sources/urls" "$SKILL_DIR/SKILL.md" "$SKILL_DIR/references"; then
  fail "the skill still keeps material in src/rules/, which codegen publishes"
else
  pass "nothing but the rule files goes in src/rules/"
fi

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

if (cd "$EXAMPLE" && node "$RULES" spec subscriptions | grep -qE '`cancelSubscription`\)   \(src/spec/openapi\.yaml:[0-9]+\)'); then
  pass "spec points at each operation of a YAML definition"
else
  fail "spec does not point at the operations of a YAML definition"
fi

if (cd "$EXAMPLE" && node "$RULES" quotes > "$TMP/out.txt" 2>&1); then
  pass "quotes finds every quote of the example"
else
  fail "quotes fails on the example:"; cat "$TMP/out.txt"
fi

if (cd "$EXAMPLE" && node "$RULES" check > "$TMP/out.txt" 2>&1) && grep -qF 'codegen: business-rules/ will be added' "$TMP/out.txt"; then
  pass "check passes on the example, and codegen will add business-rules/"
else
  fail "check fails on the example:"; cat "$TMP/out.txt"
fi

copy_example
(cd "$TMP/p" && node "$RULES" write > /dev/null)
if diff -r <(cd "$EXAMPLE/src/rules" && find . -type f | sort | xargs cat | tr -d '\r') <(cd "$TMP/p/src/rules" && find . -type f | sort | xargs cat | tr -d '\r') > /dev/null; then
  pass "write rebuilds the example's src/rules/ unchanged"
else
  fail "write makes a different src/rules/ than the example's"
fi

copy_example
for f in "$TMP"/p/rules-work/records/*.jsonl; do
  node -e 'const fs=require("fs"); const f=process.argv[1]; fs.writeFileSync(f, fs.readFileSync(f,"utf8").split("\n").map(l => l.trim() ? JSON.stringify((({id, ...r}) => r)(JSON.parse(l))) : l).join("\n"))' "$f"
done
(cd "$TMP/p" && node "$RULES" write > /dev/null)
if diff <(cat "$EXAMPLE"/rules-work/records/*.jsonl | tr -d '\r') <(cat "$TMP"/p/rules-work/records/*.jsonl | tr -d '\r') > /dev/null; then
  pass "write gives records without ids the example's ids"
else
  fail "write numbers the example's records differently"
fi

copy_example
head -1 "$EXAMPLE/rules-work/records/subscriptions-and-plans.jsonl" | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8")); delete r.id; r.condition="A second rule"; console.log(JSON.stringify(r))' >> "$TMP/p/rules-work/records/subscriptions-and-plans.jsonl"
(cd "$TMP/p" && node "$RULES" write > /dev/null)
if grep -qF '"id":"createSubscription.5"' "$TMP/p/rules-work/records/subscriptions-and-plans.jsonl"; then
  pass "a new record takes the next free id"
else
  fail "a new record does not take the next free id"
fi

# ─────────────────────────────────────────────
separator "a JSON definition"

mkdir -p "$TMP/json/src/spec" "$TMP/json/rules-work/records"
cat > "$TMP/json/src/spec/api.json" <<'EOF'
{"swagger": "2.0", "info": {"title": "Json Example", "version": "1"},
 "paths": {"/orders": {"post": {"operationId": "CreateOrder", "tags": ["Orders"],
   "description": "Creates an order.\r\nAn order **must** have at least one line; an empty one is refused with 400.",
   "parameters": [{"name": "body", "in": "body", "schema": {"$ref": "#/definitions/Order"}}],
   "responses": {"200": {"description": "OK"}}}}},
 "definitions": {"Order": {"type": "object", "properties": {"Currency": {"type": "string", "description": "Defaults to the store's currency."}}}}}
EOF
if (cd "$TMP/json" && node "$RULES" spec Orders | grep -qF "Defaults to the store's currency."); then
  pass "spec prints the schemas an operation uses, with their descriptions"
else
  fail "spec does not print the schemas an operation uses"
fi

cat > "$TMP/json/rules-work/records/orders.jsonl" <<'EOF'
{"operations": ["CreateOrder"], "on": "-", "does": "errors", "loudness": "loud", "condition": "The order has no lines", "provider_outcome": {"status": 400, "error": null, "effect": null}, "app_must": "Send at least one line.", "sources": [{"kind": "spec", "path": "spec/api.json", "line": null, "quote": "An order must have at least one line; an empty one is refused with 400."}], "conflict": null}
EOF
if (cd "$TMP/json" && node "$RULES" quotes > "$TMP/out.txt" 2>&1); then
  pass "quotes finds a quote in a JSON definition's decoded text"
else
  fail "quotes misses a quote in a JSON definition:"; cat "$TMP/out.txt"
fi

sed -i.bak 's/must have at least one line/must have at least two lines/' "$TMP/json/rules-work/records/orders.jsonl" && rm "$TMP/json/rules-work/records/orders.jsonl.bak"
if (cd "$TMP/json" && node "$RULES" quotes > "$TMP/out.txt" 2>&1); then
  fail "quotes accepts a quote that is not in the JSON definition"
else
  pass "quotes rejects a quote that is not in the JSON definition"
fi

node -e 'const fs=require("fs"), f=process.argv[1], d=JSON.parse(fs.readFileSync(f,"utf8")); d.definitions.Order.description="x".repeat(5000); fs.writeFileSync(f, JSON.stringify(Object.fromEntries(Object.entries(d).sort())))' "$TMP/json/src/spec/api.json"
if (cd "$TMP/json" && node "$RULES" ops > /dev/null 2>&1); then
  pass "ops reads a JSON definition whose keys are sorted"
else
  fail "ops does not read a JSON definition whose keys are sorted"
fi

sed -i.bak 's/"CreateOrder"/"create order"/' "$TMP/json/src/spec/api.json" && rm "$TMP/json/src/spec/api.json.bak"
if (cd "$TMP/json" && node "$RULES" ops > "$TMP/out.txt" 2>&1) || ! grep -qF '`create order`' "$TMP/out.txt"; then
  fail "ops runs with an operationId that rule ids cannot hold"
else
  pass "ops stops on an operationId that rule ids cannot hold"
fi

copy_example
sed -i.bak 's/operationId: cancelSubscription/operationId: createSubscription/' "$TMP/p/src/spec/openapi.yaml" && sed -i.bak 's/"cancelSubscription"/"createSubscription"/' "$TMP"/p/rules-work/records/*.jsonl && rm "$TMP"/p/src/spec/*.bak "$TMP"/p/rules-work/records/*.bak
if (cd "$TMP/p" && node "$RULES" write > /dev/null 2>&1 && node "$RULES" check > /dev/null 2>&1); then
  pass "write and check accept two operations in one area that share an operationId"
else
  fail "check fails on two operations in one area that share an operationId"
fi

# ─────────────────────────────────────────────
separator "merge, sample and review"

copy_example
head -1 "$EXAMPLE/rules-work/records/subscriptions-and-plans.jsonl" | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8")); delete r.id; console.log(JSON.stringify(r))' >> "$TMP/p/rules-work/records/general.jsonl"
(cd "$TMP/p" && node "$RULES" write > /dev/null)
if (cd "$TMP/p" && node "$RULES" merge | grep -qF 'createSubscription.1 ~ createSubscription.5 (the same quote)'); then
  pass "merge lists two groups' records of one rule"
else
  fail "merge does not list two groups' records of one rule"
fi
(cd "$TMP/p" && node "$RULES" merge createSubscription.1 createSubscription.5 > /dev/null && node "$RULES" write > /dev/null)
if grep -qF '"removed":"merged into createSubscription.1"' "$TMP/p/rules-work/records/general.jsonl" && (cd "$TMP/p" && node "$RULES" check > /dev/null 2>&1); then
  pass "merge keeps one record and marks the other removed"
else
  fail "merge did not keep one record and mark the other removed"
fi

copy_example
head -1 "$EXAMPLE/rules-work/records/general.jsonl" | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8")); delete r.id; r.operations=["createSubscription"]; console.log(JSON.stringify(r))' >> "$TMP/p/rules-work/records/subscriptions-and-plans.jsonl"
(cd "$TMP/p" && node "$RULES" write > /dev/null)
if (cd "$TMP/p" && node "$RULES" merge createSubscription.5 every-request.1 > /dev/null 2>&1); then
  fail "merge drops a rule for every request into an operation's rule"
else
  pass "merge keeps a rule for every request rather than an operation's copy"
fi
(cd "$TMP/p" && node "$RULES" merge every-request.1 createSubscription.5 > /dev/null && node "$RULES" write > /dev/null)
if grep -qF '"id":"every-request.1","operations":["every-request"]' "$TMP/p/rules-work/records/general.jsonl" \
  && grep -qF '"removed":"merged into every-request.1"' "$TMP/p/rules-work/records/subscriptions-and-plans.jsonl" \
  && (cd "$TMP/p" && node "$RULES" check > /dev/null 2>&1); then
  pass "a rule for every request absorbs an operation's copy and stays filed alone"
else
  fail "a rule for every request did not absorb an operation's copy"
fi

copy_example
(cd "$TMP/p" && node "$RULES" sample --percent 100 --seed 7 > /dev/null)
if [ "$(grep -c . "$TMP/p/rules-work/sample.jsonl")" = "7" ]; then
  pass "sample picks the share it is asked for"
else
  fail "sample picks the wrong number of records"
fi
cat > "$TMP/p/rules-work/review.jsonl" <<'EOF'
{"id": "createSubscription.1", "verdict": "confirmed", "reason": "The definition states it.", "corrected": null}
{"id": "createSubscription.3", "verdict": "corrected", "reason": "Test.", "corrected": {"app_must": "Send currency for any other currency."}}
{"id": "createSubscription.4", "verdict": "rejected", "reason": "Test.", "corrected": null}
EOF
(cd "$TMP/p" && node "$RULES" review > /dev/null && node "$RULES" write > /dev/null)
if grep -qF 'Send currency for any other currency.' "$TMP/p/src/rules/operations/subscriptions.md" \
  && ! grep -qF 'createSubscription.4`' "$TMP/p/src/rules/operations/subscriptions.md" \
  && [ -f "$TMP/p/rules-work/review-1.jsonl" ] && (cd "$TMP/p" && node "$RULES" check > /dev/null 2>&1); then
  pass "review applies a correction and a rejection"
else
  fail "review did not apply a correction and a rejection"
fi

# ─────────────────────────────────────────────
separator "write and check reject broken projects"

copy_example
echo 'note' > "$TMP/p/src/rules/notes.txt"
if (cd "$TMP/p" && node "$RULES" write > /dev/null 2>&1); then
  fail "write runs with a file of the user's in src/rules/"
else
  pass "write refuses while src/rules/ holds a file it does not write"
fi

expect_check_fails "a file of the user's in src/rules/" "echo 'note' > src/rules/notes.txt"
expect_check_fails "a hand-edited rules.md" "echo 'extra' >> src/rules/rules.md"
expect_check_fails "a rule line in another format" "echo '- Coupons expire after 30 days.' >> src/rules/every-request.md"
expect_check_fails "a rule file that is not what the records make" "sed -i.bak 's#Create the plan#Make the plan#' src/rules/operations/plans.md && rm src/rules/operations/plans.md.bak"
expect_check_fails "a quote that is not in its source" "edit_record general.jsonl every-request.1 'r.sources[0].quote = \"Every request needs two API keys.\"'"
expect_check_fails "a source outside spec/ and content/" "mkdir -p src/notes && echo x > src/notes/a.md && edit_record general.jsonl every-request.1 'r.sources[0].path = \"notes/a.md\"'"
expect_check_fails "a record on an operation the definition does not have" "edit_record subscriptions-and-plans.jsonl createSubscription.3 'r.operations = [\"createInvoice\"]'"
expect_check_fails "an <on> value outside the list" "edit_record general.jsonl every-request.1 'r.on = \"security\"'"
expect_check_fails "a record that write has not numbered" "edit_record general.jsonl background.1 'delete r.id'"
expect_check_fails "no every-request.md, which codegen needs" "rm src/rules/every-request.md"
expect_check_fails "no operations file, which codegen needs" "rm src/rules/operations/*.md"

# ─────────────────────────────────────────────
for project in "$@"; do
  separator "the project at $project"
  if node "$RULES" check --input "$project" > "$TMP/out.txt" 2>&1; then
    pass "check passes: $(grep -E '^[0-9]+ rules? in' "$TMP/out.txt")"
  else
    fail "check fails:"; grep -vE '^warning: ' "$TMP/out.txt" | head -40
  fi
  if grep -qF 'codegen: business-rules/ will be added' "$TMP/out.txt"; then
    pass "codegen will add business-rules/ to the Context Plugin"
  else
    fail "codegen will not add business-rules/ to the Context Plugin"
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
  echo "All checks passed."
  exit 0
fi
