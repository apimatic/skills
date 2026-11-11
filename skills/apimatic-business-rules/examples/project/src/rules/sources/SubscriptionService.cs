namespace ExampleBilling.Api;

public class SubscriptionService
{
    // POST /subscriptions
    public Result Create(CreateSubscription req)
    {
        if (_subs.ActiveFor(req.CustomerId, req.PlanId) != null)
            return Result.Conflict("subscription_exists");
        _log.Info($"subscription for {req.CustomerId}");
        return Result.Created(_subs.Add(req));
    }

    // POST /subscriptions/{id}/cancel
    public Result Cancel(string id, CancelRequest req)
    {
        var sub = _subs.Get(id);
        if (req.AtPeriodEnd)
        {
            sub.CancelAt = sub.CurrentPeriodEnd; // stays active, and is charged, until the period ends
            return Result.Ok(sub);
        }
        sub.Cancel(DateTime.UtcNow);
        return Result.Ok(sub);
    }
}
