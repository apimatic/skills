# Subscriptions

## `POST /subscriptions` (`createSubscription`)

- **loud**, state/errors: The customer already has an active subscription to the same plan → 409 "subscription_exists". **Do:** Look up the customer's subscriptions first, and change the existing one instead of creating a second. *(spec `spec/openapi.yaml`; `createSubscription.1`)*
- **loud**, order/-: The plan has no price in the request's currency → 422 "no price for currency". **Do:** Create the plan's price in that currency before subscribing anyone to it. Also: `createPlanPrice`. *(docs `content/guides/billing.md`; `createSubscription.2`)*
- **silent**, -/values: currency is not sent → The customer's currency is used. **Do:** Send currency when the subscription must be billed in a currency other than the customer's. *(spec `spec/openapi.yaml`; `createSubscription.3`)*
- **silent**, -/values: A subscription is created after the 28th of a month → The first renewal is on the 1st of the next month. **Do:** Show the renewal date the response returns, never one computed in the app. *(docs `content/guides/billing.md`; `createSubscription.4`)*

## `POST /subscriptions/{id}/cancel` (`cancelSubscription`)

- **silent**, state/side-effects: The subscription is cancelled with at_period_end true → It stays active, and is charged, until the current period ends. **Do:** Tell the customer the date the subscription ends, from the response. **Conflict:** The Billing guide says cancelling is immediate; the record follows the API definition, which describes at_period_end. *(spec `spec/openapi.yaml`; docs `content/guides/billing.md`; `cancelSubscription.1`)*
