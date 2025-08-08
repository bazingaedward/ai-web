import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { constructWebhookEvent } from "~/lib/stripe.server";

interface Env {
	STRIPE_WEBHOOK_SECRET: string;
}

export async function action({ request, context }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return json({ error: "Method not allowed" }, { status: 405 });
	}

	const signature = request.headers.get("stripe-signature");
	const env = context.env as Record<string, unknown>;
	const endpointSecret = env.STRIPE_WEBHOOK_SECRET as string;

	if (!signature || !endpointSecret) {
		return json(
			{ error: "Missing signature or endpoint secret" },
			{ status: 400 },
		);
	}

	try {
		const payload = await request.text();
		const event = await constructWebhookEvent(
			payload,
			signature,
			endpointSecret,
		);

		// Handle the event
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Record<string, unknown>;
				console.log("Payment successful for session:", session.id);

				if (session.mode === "subscription" && session.subscription) {
					const subscriptionId = session.subscription as string;
					const customerId = session.customer as string;

					console.log(
						`Subscription created: ${subscriptionId} for customer: ${customerId}`,
					);
				}
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as unknown as Record<
					string,
					unknown
				>;
				const customerId = subscription.customer as string;

				console.log(
					`Subscription updated: ${subscription.id} for customer: ${customerId}`,
				);
				// TODO: Update in database when supabase integration is complete
				break;
			}

			case "customer.subscription.deleted": {
				const canceledSubscription = event.data.object as unknown as Record<
					string,
					unknown
				>;
				const canceledCustomerId = canceledSubscription.customer as string;

				console.log(
					`Subscription canceled: ${canceledSubscription.id} for customer: ${canceledCustomerId}`,
				);
				// TODO: Cancel in database when supabase integration is complete
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return json({ received: true });
	} catch (error: unknown) {
		console.error("Webhook error:", error);
		return json({ error: "Webhook handler failed" }, { status: 400 });
	}
}
