---
description: A business-rules request loads apimatic-business-rules, which takes rules only from src/spec/ and src/content/.
tags: [trigger, business-rules]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

My API's docs describe rules the OpenAPI schema can't express, like fields that are required only in some cases and actions that are refused in some states. Write those business rules down for my APIMatic Context Plugin.
