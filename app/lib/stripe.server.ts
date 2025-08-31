import Stripe from "stripe";

// Stripe 单例缓存，基于 env 对象
const stripeCache = new WeakMap();

export function getStripe(env: object): Stripe {
	if (!env) throw new Error("env is required for Stripe initialization");
	let stripe = stripeCache.get(env);
	if (!stripe) {
		// 默认去env的STRIPE_SECRET_KEY，没有则去process.env
		const secretKey =
			(env as Record<string, string>).STRIPE_SECRET_KEY ||
			process.env.STRIPE_SECRET_KEY;
		if (!secretKey) throw new Error("STRIPE_SECRET_KEY is missing");
		stripe = new Stripe(secretKey, {
			apiVersion: "2025-07-30.basil",
		});
		stripeCache.set(env, stripe);
	}
	return stripe;
}

export interface CreateSubscriptionParams {
	customerId?: string;
	customerEmail: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	userId: string;
}

export async function createCheckoutSession(
	{
		customerId,
		customerEmail,
		priceId,
		successUrl,
		cancelUrl,
		userId,
	}: CreateSubscriptionParams,
	env: object = process.env,
) {
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
			userId,
		},
	};

	if (customerId) {
		sessionParams.customer = customerId;
	} else {
		sessionParams.customer_email = customerEmail;
	}

	const stripe = getStripe(env);
	const session = await stripe.checkout.sessions.create(sessionParams);
	return session;
}

export async function createCustomer(
	email: string,
	name?: string,
	env: object = process.env,
) {
	const stripe = getStripe(env);
	const customer = await stripe.customers.create({
		email,
		name,
	});
	return customer;
}

export async function getCustomerByEmail(
	email: string,
	env: object = process.env,
) {
	const stripe = getStripe(env);
	const customers = await stripe.customers.list({
		email,
		limit: 1,
	});
	return customers.data[0] || null;
}

export async function getSubscription(
	subscriptionId: string,
	env: object = process.env,
) {
	const stripe = getStripe(env);
	return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(
	subscriptionId: string,
	env: object = process.env,
) {
	const stripe = getStripe(env);
	return await stripe.subscriptions.cancel(subscriptionId);
}

export async function getCustomerSubscriptions(
	customerId: string,
	env: object = process.env,
) {
	const stripe = getStripe(env);
	return await stripe.subscriptions.list({
		customer: customerId,
		status: "active",
	});
}

export async function constructWebhookEvent(
	payload: string | Buffer,
	signature: string,
	endpointSecret: string,
	env: object,
) {
	const stripe = getStripe(env);

	return stripe.webhooks.constructEventAsync(
		payload,
		signature,
		endpointSecret,
	);
}
