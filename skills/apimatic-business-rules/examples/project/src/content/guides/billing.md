---
title: Billing
---

# Billing

## Authentication

Every request needs an API key in the `Authorization` header. A missing or revoked key gets `401` with the code `invalid_api_key`.

## Prices and currencies

A plan can only be sold in the currencies it has a price for. Subscribing a customer to a plan that has no price in the request's currency is refused with `422` and the message "no price for currency". Add the price first, with the plan prices endpoint.

## Cancelling

Cancelling a subscription is immediate.

## Renewals

When a renewal payment fails, the subscription becomes `past_due` and the payment is retried on days 3, 5 and 7. If every retry fails, the subscription is cancelled and the `subscription.cancelled` webhook is sent.

## Billing cycles

Subscriptions created after the 28th of a month have their first renewal on the 1st of the next month.
