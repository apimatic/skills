# Subscriptions

## `POST /subscriptions` (`createSubscription`)

- **loud**, state/errors: The customer already has an active subscription to the same plan → 409 "subscription_exists". **Do:** Look up the customer's subscriptions first and change the existing one instead of creating a second. *(code `rules/sources/SubscriptionService.cs:8-9`; `createSubscription.1`)*
- **loud**, order/-: The plan has no price in the request's currency → 422 "no price for currency". **Do:** Create the plan's price in that currency before subscribing anyone to it. Also: `createPlanPrice`. *(text `rules/sources/billing-notes.txt:5-6`; `createSubscription.2`)*
- **silent**, -/values: A subscription is created after the 28th of a month → The first renewal is on the 1st of the next month. **Do:** Show the renewal date the response returns, never one computed in the app. *(url `rules/sources/urls/docs.example.com-billing-cycles.md`; `createSubscription.3`)*

## `POST /subscriptions/{id}/cancel` (`cancelSubscription`)

- **silent**, state/side-effects: The subscription is cancelled with at_period_end true → It stays active, and is charged, until the period ends. **Do:** Tell the customer the access end date from the response. **Conflict:** billing-notes.txt says cancelling is immediate; the rule follows the code. *(code `rules/sources/SubscriptionService.cs:18-21`; text `rules/sources/billing-notes.txt:8`; `cancelSubscription.1`)*
