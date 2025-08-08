import { useState } from "react";
import { useStore } from "@nanostores/react";
import { PricingModal } from "./PricingModal";
import { subscriptionStore } from "~/lib/stores/subscription";
import { redirectToCheckout } from "~/lib/stripe.client";

interface UpgradePromptProps {
	feature: string;
	description: string;
	className?: string;
}

export function UpgradePrompt({
	feature,
	description,
	className,
}: UpgradePromptProps) {
	const [isPricingOpen, setIsPricingOpen] = useState(false);
	const subscription = useStore(subscriptionStore);

	const handleSubscribe = async (priceId?: string) => {
		if (!priceId) return;

		try {
			await redirectToCheckout({ priceId });
		} catch (error) {
			console.error("Subscription error:", error);
		}
	};

	// Don't show if user is already on a paid plan
	if (subscription.plan !== "free") {
		return null;
	}

	return (
		<>
			<div
				className={`bg-gradient-to-r from-accent-500/10 to-accent-600/10 border border-accent-500/20 rounded-lg p-6 ${className}`}
			>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">
							Unlock {feature}
						</h3>
						<p className="text-bolt-elements-textSecondary mb-4">
							{description}
						</p>
						<div className="flex items-center gap-2 text-sm text-accent-600">
							<div className="i-ph:crown-duotone" />
							<span>Available with Pro plan</span>
						</div>
					</div>
					<div className="i-ph:crown-duotone text-2xl text-accent-500 ml-4" />
				</div>

				<div className="flex gap-3 mt-6">
					<button
						onClick={() => setIsPricingOpen(true)}
						className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-medium"
					>
						Upgrade to Pro
					</button>
					<button
						onClick={() => setIsPricingOpen(true)}
						className="px-4 py-2 text-accent-600 border border-accent-500/30 rounded-lg hover:bg-accent-50/10 transition-colors font-medium"
					>
						View Plans
					</button>
				</div>
			</div>

			<PricingModal
				isOpen={isPricingOpen}
				onClose={() => setIsPricingOpen(false)}
				onSubscribe={handleSubscribe}
			/>
		</>
	);
}

interface FeatureLockedProps {
	feature: string;
	children: React.ReactNode;
}

export function FeatureLocked({ feature, children }: FeatureLockedProps) {
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
		<>
			<div className="relative">
				{/* Blurred content */}
				<div className="filter blur-sm pointer-events-none opacity-60">
					{children}
				</div>

				{/* Overlay */}
				<div className="absolute inset-0 flex items-center justify-center bg-bolt-elements-background-depth-1/80 rounded-lg">
					<div className="text-center p-6 max-w-sm">
						<div className="i-ph:lock-duotone text-3xl text-accent-500 mx-auto mb-3" />
						<h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">
							{feature} Locked
						</h3>
						<p className="text-bolt-elements-textSecondary text-sm mb-4">
							Upgrade to Pro to unlock this feature and get unlimited access.
						</p>
						<button
							onClick={() => setIsPricingOpen(true)}
							className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-medium"
						>
							Upgrade Now
						</button>
					</div>
				</div>
			</div>

			<PricingModal
				isOpen={isPricingOpen}
				onClose={() => setIsPricingOpen(false)}
				onSubscribe={handleSubscribe}
			/>
		</>
	);
}
