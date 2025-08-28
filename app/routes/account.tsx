import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { getOptionalAuth } from "~/lib/auth.server";
import { PricingModal } from "~/components/ui/PricingModal";
import { redirectToCheckout } from "~/lib/stripe.client";
import { getUserSubscriptionById } from "~/lib/supabase.server";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
	const { session, supabase } = await getOptionalAuth({
		request,
		context,
		params,
	});

	if (!session?.user) {
		throw new Response("Unauthorized", { status: 401 });
	}

	// 使用supabse获取用户订阅信息，查询user_subscription表
	const subscriptionInfo = await getUserSubscriptionById(
		supabase,
		session.user.id,
	);

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
												Current Plan: {subscription.plan}
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
