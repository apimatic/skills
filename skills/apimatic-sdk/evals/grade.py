#!/usr/bin/env python3
"""Grade all apimatic-sdk evals against their assertions from evals.json."""

import json
import os

WORKSPACE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspace")
EVALS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "evals.json")

with open(EVALS_FILE) as f:
    evals_data = json.load(f)

def check_assertion(text, assertion):
    t = assertion["type"]
    v = assertion["value"]
    text_lower = text.lower()

    if t == "contains":
        passed = v.lower() in text_lower
        evidence = f"Found '{v}'" if passed else f"NOT FOUND: '{v}'"
    elif t == "contains_any":
        matched = [item for item in v if item.lower() in text_lower]
        passed = len(matched) > 0
        evidence = f"Found: {matched}" if passed else f"NONE FOUND: {v}"
    elif t == "not_contains":
        passed = v.lower() not in text_lower
        evidence = f"Correctly absent: '{v}'" if passed else f"SHOULD NOT CONTAIN: '{v}'"
    elif t == "not_contains_any":
        found = [item for item in v if item.lower() in text_lower]
        passed = len(found) == 0
        evidence = f"Correctly absent" if passed else f"SHOULD NOT CONTAIN: {found}"
    else:
        passed = False
        evidence = f"Unknown assertion type: {t}"

    return passed, evidence

total_assertions = 0
total_passed = 0
results_by_eval = []
failed_evals = []

for eval_item in evals_data["evals"]:
    eval_id = eval_item["id"]
    response_path = os.path.join(WORKSPACE, f"eval-{eval_id}-response.md")

    if not os.path.exists(response_path):
        print(f"\n=== EVAL {eval_id} === MISSING response file: {response_path}")
        failed_evals.append(eval_id)
        continue

    with open(response_path) as f:
        response_text = f.read()

    assertions = eval_item.get("assertions", [])
    results = []
    eval_passed = 0
    for assertion in assertions:
        passed, evidence = check_assertion(response_text, assertion)
        results.append({
            "id": assertion["id"],
            "passed": passed,
            "evidence": evidence
        })
        if passed:
            eval_passed += 1
        total_assertions += 1

    total_passed += eval_passed
    score = f"{eval_passed}/{len(assertions)}"
    status = "PASS" if eval_passed == len(assertions) else "FAIL"
    print(f"\n=== EVAL {eval_id} === {status} ({score})")
    print(f"Prompt: {eval_item['prompt'][:80]}...")
    for r in results:
        mark = "PASS" if r["passed"] else "FAIL"
        print(f"  [{mark}] {r['id']}: {r['evidence']}")

    results_by_eval.append({
        "eval_id": eval_id,
        "status": status,
        "score": score,
        "results": results
    })

print(f"\n{'='*50}")
print(f"TOTAL: {total_passed}/{total_assertions} assertions passed")
if failed_evals:
    print(f"MISSING: evals {failed_evals} had no response file")

# Save grading results
grading_output = os.path.join(WORKSPACE, "grading.json")
with open(grading_output, "w") as f:
    json.dump({
        "total_assertions": total_assertions,
        "total_passed": total_passed,
        "evals": results_by_eval
    }, f, indent=2)
print(f"\nResults saved to {grading_output}")
