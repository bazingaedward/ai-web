import { json, type ActionFunctionArgs } from "@remix-run/node";
import type Stripe from "stripe";
import { constructWebhookEvent } from "~/lib/stripe.server";
import {
	handleCheckoutSessionCompleted,
	handleInvoicePaymentSucceeded,
	handlePaymentIntentSucceeded,
	handleSubscriptionCreated,
	handleSubscriptionDeleted,
	handleSubscriptionUpdated,
} from "~/lib/.server/stripe/event-handlers";

export async function action({ request, context }: ActionFunctionArgs) {
	const cloudflareContext = context as unknown as {
		cloudflare?: { env?: Record<string, unknown> };
	};
	const env = cloudflareContext?.cloudflare?.env as Record<string, unknown>;

	if (request.method !== "POST") {
		return json({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const signature = request.headers.get("stripe-signature");

		if (!signature) {
			return json({ error: "No stripe signature" }, { status: 400 });
		}

		const payload = await request.text();

		// stripe cli test webhook： stripe listen --forward-to localhost:3001/api/stripe/webhook
		const endpointSecret = (env.STRIPE_WEBHOOK_SECRET ||
			process.env.STRIPE_CLI_WEBHOOK_SECRET) as string;

		if (!endpointSecret) {
			return json({ error: "Webhook secret not configured" }, { status: 500 });
		}
		let event: Stripe.Event;
		try {
			event = await constructWebhookEvent(
				payload,
				signature,
				endpointSecret,
				env,
			);
		} catch (err) {
			return json(
				{
					error: `Webhook signature verification failed: ${endpointSecret}`,
					err: err?.toString(),
				},
				{ status: 500 },
			);
		}

		switch (event.type) {
			case "checkout.session.completed": {
				// 处理 checkout.session.completed 事件
				await handleCheckoutSessionCompleted(event, context);
				break;
			}
			// 表示 支付已成功完成。通常在客户完成付款、资金成功从支付方式扣除后触发。
			// case "payment_intent.succeeded": {
			// 	handlePaymentIntentSucceeded(event, context);
			// 	break;
			// }
			// case "invoice.payment_succeeded": {
			// 	handleInvoicePaymentSucceeded(event, context);
			// 	break;
			// }
			// case "customer.subscription.created": {
			// 	handleSubscriptionCreated(event, context);
			// 	break;
			// }
			// case "customer.subscription.updated": {
			// 	handleSubscriptionUpdated(event, context);
			// 	break;
			// }
			// case "customer.subscription.deleted": {
			// 	handleSubscriptionDeleted(event, context);
			// 	break;
			// }
		}

		return json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return json({ error: "Webhook handler failed" }, { status: 400 });
	}
}
