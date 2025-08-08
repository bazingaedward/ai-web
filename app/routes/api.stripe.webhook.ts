import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { constructWebhookEvent } from "~/lib/stripe.server";

export async function action({ request, context }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return json({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const signature = request.headers.get("stripe-signature");

		if (!signature) {
			return json({ error: "No stripe signature" }, { status: 400 });
		}

		const payload = await request.text();
		const endpointSecret = (context.env as Record<string, unknown>)
			.STRIPE_WEBHOOK_SECRET as string;

		if (!endpointSecret) {
			return json({ error: "Webhook secret not configured" }, { status: 500 });
		}

		const event = await constructWebhookEvent(
			payload,
			signature,
			endpointSecret,
		);

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object;
				console.log("Checkout session completed:", session.id);

				if (session.mode === "subscription" && session.customer) {
					// Handle subscription creation
					console.log(
						"New subscription created for customer:",
						session.customer,
					);
				}
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object;
				console.log("Subscription updated:", subscription.id);
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object;
				console.log("Subscription cancelled:", subscription.id);
				break;
			}

			case "invoice.payment_succeeded": {
				const invoice = event.data.object;
				console.log("Payment succeeded:", invoice.id);
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object;
				console.log("Payment failed:", invoice.id);
				break;
			}

			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		return json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return json({ error: "Webhook handler failed" }, { status: 400 });
	}
}
