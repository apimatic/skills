export default function CreateAndTrackAnOrder(workflowCtx, portal) {
  return {
    "Step 1": {
      name: "Introduction",
      stepCallback: async () => {
        return workflowCtx.showContent(`
## Create and Track an Order

In this recipe you will:
1. Create a new order with your desired items
2. Retrieve the order to confirm it was saved
3. Submit payment for the order

You will need valid API credentials to complete each step.
        `);
      },
    },

    "Step 2": {
      name: "Create Order",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description: `
## Create an Order

Submit a new order with your desired items and quantity.
          `,
          endpointPermalink: "$e/Orders/CreateOrder",
          args: {
            body: {
              items: [{ productId: "prod-001", quantity: 2 }],
              shippingAddress: "123 Main St, Springfield, USA"
            }
          },
          verify: (response, setError) => {
            if (response.StatusCode === 201) return true;
            setError("Failed to create order. Check your request and try again.");
            return false;
          },
        });
      },
    },

    "Step 3": {
      name: "Retrieve Order",
      stepCallback: async (stepState) => {
        const orderId = stepState?.["Step 2"]?.data?.id;

        return workflowCtx.showEndpoint({
          description: `
## Retrieve the Order

Fetch the order you just created to confirm it was saved correctly.
          `,
          endpointPermalink: "$e/Orders/GetOrder",
          args: {
            path: { orderId: orderId }
          },
          verify: (response, setError) => {
            if (response.StatusCode === 200) return true;
            setError("Could not retrieve order. Please try again.");
            return false;
          },
        });
      },
    },

    "Step 4": {
      name: "Submit Payment",
      stepCallback: async (stepState) => {
        const orderId = stepState?.["Step 2"]?.data?.id;

        return workflowCtx.showEndpoint({
          description: `
## Submit Payment

Pay for the order using a test card token.
          `,
          endpointPermalink: "$e/Payments/CreatePayment",
          args: {
            body: {
              orderId: orderId,
              cardToken: "tok_test_visa"
            }
          },
          verify: (response, setError) => {
            if (response.StatusCode === 200) {
              const paymentId = response?.body?.paymentId;
              portal.setConfig((defaultConfig) => ({
                ...defaultConfig,
                auth: {
                  ...defaultConfig.auth,
                  bearerAuth: {
                    ...defaultConfig.auth.bearerAuth,
                    AccessToken: paymentId,
                  },
                },
              }));
              return true;
            }
            setError("Payment failed. Check your card token and try again.");
            return false;
          },
        });
      },
      showConfettiAnimation: true,
      nextRecipe: {
        name: "Explore Order History",
        link: "page:recipes/ExploreOrderHistory",
      },
    },
  };
}
