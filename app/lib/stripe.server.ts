import Stripe from "stripe";

// TODO: Replace with your actual Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-07-30.basil",
});

export interface CreateSubscriptionParams {
	customerId?: string;
	customerEmail: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
}

export async function createCheckoutSession({
	customerId,
	customerEmail,
	priceId,
	successUrl,
	cancelUrl,
}: CreateSubscriptionParams) {
	const sessionParams: Stripe.Checkout.SessionCreateParams = {
		payment_method_types: ["card"],
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: "subscription",
		success_url: successUrl,
		cancel_url: cancelUrl,
		allow_promotion_codes: true,
		billing_address_collection: "auto",
		metadata: {
			priceId,
		},
	};

	if (customerId) {
		sessionParams.customer = customerId;
	} else {
		sessionParams.customer_email = customerEmail;
	}

	const session = await stripe.checkout.sessions.create(sessionParams);
	return session;
}

export async function createCustomer(email: string, name?: string) {
	const customer = await stripe.customers.create({
		email,
		name,
	});
	return customer;
}

export async function getCustomerByEmail(email: string) {
	const customers = await stripe.customers.list({
		email,
		limit: 1,
	});

	return customers.data[0] || null;
}

export async function getSubscription(subscriptionId: string) {
	return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
	return await stripe.subscriptions.cancel(subscriptionId);
}

export async function getCustomerSubscriptions(customerId: string) {
	return await stripe.subscriptions.list({
		customer: customerId,
		status: "active",
	});
}

export async function constructWebhookEvent(
	payload: string | Buffer,
	signature: string,
	endpointSecret: string,
) {
	return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
}

export { stripe };
