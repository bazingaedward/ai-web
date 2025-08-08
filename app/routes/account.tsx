import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { getOptionalAuth } from "~/lib/auth.server";
import {
	getCustomerByEmail,
	getCustomerSubscriptions,
} from "~/lib/stripe.server";
import { PricingModal } from "~/components/ui/PricingModal";
import { redirectToCheckout } from "~/lib/stripe.client";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
	const { session } = await getOptionalAuth({ request, context, params });

	if (!session?.user) {
		throw new Response("Unauthorized", { status: 401 });
	}

	let subscriptionInfo = null;

	if (!session.user.email) {
		throw new Response("User email is required", { status: 400 });
	}

	try {
		const customer = await getCustomerByEmail(session.user.email);
		if (customer) {
			const subscriptions = await getCustomerSubscriptions(customer.id);
			if (subscriptions.data.length > 0) {
				const subscription = subscriptions.data[0] as unknown as Record<
					string,
					unknown
				>;
				const items = subscription.items as Record<string, unknown>;
				const dataArray = items?.data as Array<Record<string, unknown>>;
				const firstItem = dataArray?.[0];
				const price = firstItem?.price as Record<string, unknown>;

				subscriptionInfo = {
					id: subscription.id as string,
					status: subscription.status as string,
					currentPeriodEnd: new Date(
						(subscription.current_period_end as number) * 1000,
					),
					cancelAtPeriodEnd: subscription.cancel_at_period_end as boolean,
					plan: (price?.lookup_key as string) || "unknown",
				};
			}
		}
	} catch (error: unknown) {
		console.error("Error fetching subscription:", error);
	}

	return json({
		user: session.user,
		subscription: subscriptionInfo,
	});
}

export default function Account() {
	const { user, subscription } = useLoaderData<typeof loader>();
	const [isPricingOpen, setIsPricingOpen] = useState(false);

	const handleSubscribe = async (priceId?: string) => {
		if (!priceId) return;

		try {
			await redirectToCheckout({ priceId });
		} catch (error) {
			console.error("Subscription error:", error);
		}
	};

	return (
		<div className="min-h-screen bg-bolt-elements-background-depth-1">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="mb-8">
					<Link
						to="/"
						className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-4"
					>
						<div className="i-ph:arrow-left mr-2" />
						Back to Chat
					</Link>
					<h1 className="text-3xl font-bold text-bolt-elements-textPrimary">
						Account Settings
					</h1>
					<p className="text-bolt-elements-textSecondary mt-2">
						Manage your account and subscription
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Profile Section */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-bolt-elements-bg-depth-2 rounded-lg border border-bolt-elements-borderColor p-6">
							<h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">
								Profile Information
							</h2>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-bolt-elements-textSecondary mb-2">
										Name
									</label>
									<p className="text-bolt-elements-textPrimary">
										{user.user_metadata?.name ||
											user.user_metadata?.full_name ||
											"Not provided"}
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-bolt-elements-textSecondary mb-2">
										Email
									</label>
									<p className="text-bolt-elements-textPrimary">{user.email}</p>
								</div>
							</div>
						</div>

						{/* Subscription Section */}
						<div className="bg-bolt-elements-bg-depth-2 rounded-lg border border-bolt-elements-borderColor p-6">
							<h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">
								Subscription
							</h2>
							{subscription ? (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-bolt-elements-textPrimary font-medium">
												Current Plan:{" "}
												{subscription.plan.charAt(0).toUpperCase() +
													subscription.plan.slice(1)}
											</p>
											<p className="text-bolt-elements-textSecondary text-sm">
												Status: {subscription.status}
											</p>
										</div>
										<div
											className={`px-3 py-1 rounded-full text-sm font-medium ${
												subscription.status === "active"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{subscription.status === "active" ? "Active" : "Inactive"}
										</div>
									</div>
									<div>
										<p className="text-bolt-elements-textSecondary text-sm">
											{subscription.cancelAtPeriodEnd
												? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
												: `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
										</p>
									</div>
								</div>
							) : (
								<div className="text-center py-4">
									<p className="text-bolt-elements-textSecondary mb-4">
										You're currently on the free plan
									</p>
									<button
										onClick={() => setIsPricingOpen(true)}
										className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors"
									>
										Upgrade to Pro
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Quick Actions */}
					<div className="space-y-6">
						<div className="bg-bolt-elements-bg-depth-2 rounded-lg border border-bolt-elements-borderColor p-6">
							<h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">
								Quick Actions
							</h3>
							<div className="space-y-3">
								<button
									onClick={() => setIsPricingOpen(true)}
									className="w-full text-left p-3 rounded-lg hover:bg-bolt-elements-bg-depth-1 transition-colors"
								>
									<div className="i-ph:credit-card mb-1" />
									<p className="font-medium text-bolt-elements-textPrimary">
										View Plans
									</p>
									<p className="text-sm text-bolt-elements-textSecondary">
										Compare pricing options
									</p>
								</button>

								<Link
									to="/logout"
									className="block w-full text-left p-3 rounded-lg hover:bg-bolt-elements-bg-depth-1 transition-colors"
								>
									<div className="i-ph:sign-out mb-1" />
									<p className="font-medium text-bolt-elements-textPrimary">
										Sign Out
									</p>
									<p className="text-sm text-bolt-elements-textSecondary">
										Sign out of your account
									</p>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Pricing Modal */}
			<PricingModal
				isOpen={isPricingOpen}
				onClose={() => setIsPricingOpen(false)}
				onSubscribe={handleSubscribe}
			/>
		</div>
	);
}
