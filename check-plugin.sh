#!/usr/bin/env bash
# Plugin packaging checks: the manifests that make this repository an agent plugin.
# Run from anywhere: bash check-plugin.sh
#
# The repository root is the plugin, and it is its own marketplace:
#   plugin.json                       the portable manifest (https://agent-plugins.org, spec 1.0.0), read first by
#                                     VS Code, GitHub Copilot CLI, Cursor and Codex; Codex's display fields live in
#                                     its extensions["com.openai"].interface
#   .claude-plugin/plugin.json        Claude Code's manifest (Claude Code does not read the root plugin.json)
#   .cursor-plugin/plugin.json        Cursor's own format, for Cursor builds without Agent Plugins support
#   .codex-plugin/plugin.json         Codex's own format, for Codex builds without Agent Plugins support
#   .claude-plugin/marketplace.json   the marketplace for Claude Code, VS Code and Copilot CLI (Codex reads it too)
#   .agents/plugins/marketplace.json  the marketplace for Codex, with the policy and category its docs ask for
#
# For behavior with Claude, run the eval suite in evals/ (see MAINTAINING.md).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Probe rather than `command -v`: Windows ships a python3 stub that only opens the Store.
PY=""
for candidate in python3 python; do
  if "$candidate" -c "import sys" > /dev/null 2>&1; then PY="$candidate"; break; fi
done
if [ -z "$PY" ]; then echo "python3 (or python) is required"; exit 1; fi

STATUS=0
"$PY" -I - "$ROOT" <<'PYEOF' || STATUS=1
import json, os, re, sys

root = sys.argv[1]
passed = failed = 0

def ok(msg):
    global passed; passed += 1; print(f"  PASS  {msg}")

def bad(msg):
    global failed; failed += 1; print(f"  FAIL  {msg}")

def check(cond, msg):
    ok(msg) if cond else bad(msg)

def load(rel):
    path = os.path.join(root, rel)
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        bad(f"{rel}: missing"); return None
    except json.JSONDecodeError as e:
        bad(f"{rel}: not valid JSON ({e})"); return None
    if not isinstance(data, dict):
        bad(f"{rel}: not a JSON object"); return None
    ok(f"{rel}: valid JSON object")
    return data

print("\n--- Manifests parse ---")
portable = load("plugin.json")
claude = load(".claude-plugin/plugin.json")
cursor = load(".cursor-plugin/plugin.json")
codex = load(".codex-plugin/plugin.json")
claude_mkt = load(".claude-plugin/marketplace.json")
codex_mkt = load(".agents/plugins/marketplace.json")
if None in (portable, claude, cursor, codex, claude_mkt, codex_mkt):
    print(f"\n{passed} passed, {failed} failed"); sys.exit(1)

print("\n--- plugin.json follows Agent Plugins 1.0.0 (schemas/1.0.0/plugin.schema.json) ---")
SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
ALLOWED = {"$schema", "name", "version", "description", "author", "homepage", "repository", "license", "keywords", "extensions"}
NAME = re.compile(r"^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$")
check(portable.get("$schema") == SCHEMA, f"$schema is {SCHEMA} (Codex accepts only 1.0.0)")
extra = sorted(set(portable) - ALLOWED)
check(not extra, "only the spec's top-level fields" + (f" (unexpected: {', '.join(extra)})" if extra else ""))
name = portable.get("name")
check(isinstance(name, str) and 1 <= len(name) <= 64 and NAME.match(name) is not None, "name matches the spec's name rule")
for key in ("version", "description", "homepage", "repository", "license"):
    if key in portable:
        check(isinstance(portable[key], str), f"{key} is a string")
author = portable.get("author", {})
check(isinstance(author, dict) and set(author) <= {"name", "email", "url"} and all(isinstance(v, str) for v in author.values()),
      "author has only string name, email and url")
kw = portable.get("keywords", [])
check(isinstance(kw, list) and all(isinstance(k, str) for k in kw), "keywords is a list of strings")
ext = portable.get("extensions", {})
check(isinstance(ext, dict) and all(isinstance(v, dict) for v in ext.values()), "every extensions value is an object")
check(all(re.match(r"^[a-z0-9-]+(\.[a-z0-9-]+)+$", k) for k in ext), "extensions keys are reverse-domain namespaces")
for unsupported in ("mcp.json", "hooks", "commands", "agents"):
    check(not os.path.exists(os.path.join(root, unsupported)), f"no {unsupported} at the root (the plugin ships skills only)")

print("\n--- Every host's manifest agrees ---")
manifests = {"plugin.json": portable, ".claude-plugin/plugin.json": claude, ".cursor-plugin/plugin.json": cursor, ".codex-plugin/plugin.json": codex}
for key in ("name", "version", "description", "homepage", "repository", "keywords"):
    values = {rel: m.get(key) for rel, m in manifests.items()}
    same = len({json.dumps(v) for v in values.values()}) == 1
    check(same, f"{key} is the same in all four manifests" + ("" if same else f": {values}"))
check(all(m.get("author", {}).get("name") == author.get("name") for m in manifests.values()), "author.name is the same in all four manifests")
for rel in (".claude-plugin/plugin.json", ".cursor-plugin/plugin.json"):
    check("skills" not in manifests[rel], f"{rel} declares no skills path (skills/ is found by default)")
check(codex.get("skills") == "./skills/", ".codex-plugin/plugin.json points skills at ./skills/")
check("displayName" not in cursor, ".cursor-plugin/plugin.json has no displayName (not a Cursor field)")

print("\n--- Codex interface ---")
iface = ext.get("com.openai", {}).get("interface")
check(isinstance(iface, dict), 'plugin.json has extensions["com.openai"].interface')
iface = iface or {}
check(codex.get("interface") == iface, ".codex-plugin/plugin.json interface equals the one in plugin.json")
for key in ("displayName", "shortDescription", "longDescription", "developerName", "category"):
    check(isinstance(iface.get(key), str) and iface.get(key), f"interface.{key} is set")
check(len(iface.get("displayName", "")) <= 30, "interface.displayName is at most 30 characters")
check(len(iface.get("shortDescription", "")) <= 30, "interface.shortDescription is at most 30 characters")
check(len(iface.get("defaultPrompt", [])) <= 3, "interface.defaultPrompt has at most 3 prompts")

print("\n--- Marketplaces ---")
check(claude_mkt.get("name") == codex_mkt.get("name"), "both marketplace files have the same name")
check(isinstance(claude_mkt.get("owner", {}).get("name"), str), ".claude-plugin/marketplace.json has owner.name")
for rel, mkt, want in ((".claude-plugin/marketplace.json", claude_mkt, "./"),
                       (".agents/plugins/marketplace.json", codex_mkt, {"source": "local", "path": "./"})):
    plugins = mkt.get("plugins", [])
    check(len(plugins) == 1 and plugins[0].get("name") == name, f"{rel} lists exactly the plugin {name}")
    check(plugins and plugins[0].get("source") == want, f"{rel} points at the repository root")
entry = claude_mkt["plugins"][0] if claude_mkt.get("plugins") else {}
check(entry.get("description") == portable.get("description"), ".claude-plugin/marketplace.json description equals the manifests'")
centry = codex_mkt["plugins"][0] if codex_mkt.get("plugins") else {}
check({"installation", "authentication"} <= set(centry.get("policy", {})) and "category" in centry,
      ".agents/plugins/marketplace.json entry has policy.installation, policy.authentication and category")
# VS Code and Copilot CLI take the first of these that exists, so any of them would hide .claude-plugin/marketplace.json.
for shadow in ("marketplace.json", ".plugin/marketplace.json", ".github/plugin/marketplace.json", ".plugin/plugin.json"):
    check(not os.path.exists(os.path.join(root, shadow)), f"no {shadow} (it would shadow the shared marketplace or manifest)")

print("\n--- Skills follow the Agent Skills format ---")
skills_dir = os.path.join(root, "skills")
for d in sorted(os.listdir(skills_dir)):
    skill_md = os.path.join(skills_dir, d, "SKILL.md")
    if not os.path.isfile(skill_md):
        continue
    with open(skill_md, encoding="utf-8") as f:
        text = f.read()
    m = re.match(r"^---\n(.*?)\n---\n", text.replace("\r\n", "\n"), re.S)
    if not m:
        bad(f"skills/{d}/SKILL.md: no YAML frontmatter"); continue
    fm = dict(re.findall(r"^([A-Za-z_-]+):\s*(.*)$", m.group(1), re.M))
    sname, sdesc = fm.get("name", ""), fm.get("description", "")
    check(sname == d, f"skills/{d}: name matches its directory")
    check(re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", sname) is not None and len(sname) <= 64, f"skills/{d}: name is lowercase words joined by single hyphens, at most 64")
    check(0 < len(sdesc) <= 1024, f"skills/{d}: description is 1 to 1024 characters ({len(sdesc)})")

print(f"\n{passed} passed, {failed} failed")
sys.exit(1 if failed else 0)
PYEOF

echo ""
echo "--- claude plugin validate --strict ---"
if command -v claude > /dev/null 2>&1; then
  if claude plugin validate "$ROOT" --strict > /dev/null 2>&1; then
    echo "  PASS  claude plugin validate --strict"
  else
    echo "  FAIL  claude plugin validate --strict"
    claude plugin validate "$ROOT" --strict || true
    STATUS=1
  fi
else
  echo "  SKIP  claude is not installed"
fi

exit $STATUS
