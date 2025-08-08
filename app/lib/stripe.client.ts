import { loadStripe } from "@stripe/stripe-js";

let stripePromise: ReturnType<typeof loadStripe>;

export const getStripe = () => {
	if (!stripePromise) {
		stripePromise = loadStripe(window.ENV?.STRIPE_PUBLISHABLE_KEY || "");
	}
	return stripePromise;
};

export interface SubscriptionData {
	priceId: string;
}

export async function redirectToCheckout(data: SubscriptionData) {
	try {
		const response = await fetch("/api/stripe/create-checkout-session", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("Failed to create checkout session");
		}

		const responseData = (await response.json()) as { sessionId: string };
		const { sessionId } = responseData;
		const stripe = await getStripe();

		if (!stripe) {
			throw new Error("Stripe failed to load");
		}

		const { error } = await stripe.redirectToCheckout({
			sessionId,
		});

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error redirecting to checkout:", error);
		throw error;
	}
}
