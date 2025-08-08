import { useStore } from "@nanostores/react";
import { subscriptionStore } from "~/lib/stores/subscription";

interface SubscriptionBadgeProps {
	className?: string;
}

export function SubscriptionBadge({ className }: SubscriptionBadgeProps) {
	const subscription = useStore(subscriptionStore);

	const getBadgeColor = () => {
		switch (subscription.plan) {
			case "pro":
				return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white";
			case "team":
				return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white";
			default:
				return "bg-bolt-elements-bg-depth-3 text-bolt-elements-textSecondary border border-bolt-elements-borderColor";
		}
	};

	const getPlanLabel = () => {
		switch (subscription.plan) {
			case "pro":
				return "Pro";
			case "team":
				return "Team";
			default:
				return "Free";
		}
	};

	const getIcon = () => {
		switch (subscription.plan) {
			case "pro":
				return "i-ph:crown-duotone";
			case "team":
				return "i-ph:users-three-duotone";
			default:
				return "i-ph:user-duotone";
		}
	};

	return (
		<div
			className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor()} ${className}`}
		>
			<div className={getIcon()} />
			<span>{getPlanLabel()}</span>
		</div>
	);
}

export function SubscriptionStatus() {
	const subscription = useStore(subscriptionStore);

	if (subscription.plan === "free") {
		return (
			<div className="bg-bolt-elements-bg-depth-2 border border-bolt-elements-borderColor rounded-lg p-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-medium text-bolt-elements-textPrimary">
							Free Plan
						</h3>
						<p className="text-sm text-bolt-elements-textSecondary">
							Limited features and usage
						</p>
					</div>
					<SubscriptionBadge />
				</div>
			</div>
		);
	}

	return (
		<div className="bg-bolt-elements-bg-depth-2 border border-bolt-elements-borderColor rounded-lg p-4">
			<div className="flex items-center justify-between mb-3">
				<div>
					<h3 className="font-medium text-bolt-elements-textPrimary">
						{subscription.plan === "pro" ? "Pro Plan" : "Team Plan"}
					</h3>
					<p className="text-sm text-bolt-elements-textSecondary">
						{subscription.isActive
							? "Active subscription"
							: "Inactive subscription"}
					</p>
				</div>
				<SubscriptionBadge />
			</div>

			{subscription.currentPeriodEnd && (
				<div className="text-sm text-bolt-elements-textSecondary">
					{subscription.cancelAtPeriodEnd ? (
						<span className="text-orange-500">
							Cancels on {subscription.currentPeriodEnd.toLocaleDateString()}
						</span>
					) : (
						<span>
							Renews on {subscription.currentPeriodEnd.toLocaleDateString()}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
