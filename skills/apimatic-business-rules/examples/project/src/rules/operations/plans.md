# Plans

## `POST /plans/{plan_id}/prices` (`createPlanPrice`)

- **loud**, order/-: The plan has no price in the request's currency → 422 "no price for currency". **Do:** Create the plan's price in that currency before subscribing anyone to it. Also: `createSubscription`. *(docs `content/guides/billing.md`; `createSubscription.2`)*
