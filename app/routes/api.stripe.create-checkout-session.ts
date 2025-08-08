import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { getOptionalAuth } from "~/lib/auth.server";
import {
	createCheckoutSession,
	createCustomer,
	getCustomerByEmail,
} from "~/lib/stripe.server";

export async function action({ request, context }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return json({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const { session } = await getOptionalAuth({ request, context, params: {} });

		if (!session?.user) {
			return json({ error: "Authentication required" }, { status: 401 });
		}

		const body = (await request.json()) as { priceId: string };
		const { priceId } = body;

		if (!priceId) {
			return json({ error: "Price ID is required" }, { status: 400 });
		}

		const userEmail = session.user.email;
		const userName =
			session.user.user_metadata?.name || session.user.user_metadata?.full_name;

		if (!userEmail) {
			return json({ error: "User email is required" }, { status: 400 });
		}

		// Check if customer already exists
		let customer = await getCustomerByEmail(userEmail);

		// Create customer if doesn't exist
		if (!customer) {
			customer = await createCustomer(userEmail, userName);
		}

		// Create checkout session
		const checkoutSession = await createCheckoutSession({
			customerId: customer.id,
			customerEmail: userEmail,
			priceId,
			successUrl: `${new URL(request.url).origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${new URL(request.url).origin}/payment/canceled`,
		});

		return json({ sessionId: checkoutSession.id });
	} catch (error) {
		console.error("Stripe checkout error:", error);
		return json(
			{ error: "Failed to create checkout session" },
			{ status: 500 },
		);
	}
}
