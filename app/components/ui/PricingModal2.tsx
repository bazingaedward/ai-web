import { memo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "./IconButton";
import { classNames } from "~/utils/classNames";

interface PricingTier {
	name: string;
	price: string;
	description: string;
	features: string[];
	buttonText: string;
	popular?: boolean;
	priceId?: string;
}

const pricingTiers: PricingTier[] = [
	{
		name: "Free",
		price: "$0",
		description: "Perfect for getting started",
		features: [
			"5 AI conversations per day",
			"Basic code generation",
			"Standard templates",
			"Community support",
		],
		buttonText: "Get Started",
	},
	{
		name: "Pro",
		price: "$20",
		description: "Best for individual developers",
		features: [
			"Unlimited AI conversations",
			"Advanced code generation",
			"Premium templates",
			"Priority support",
			"Export projects",
			"Custom themes",
		],
		buttonText: "Upgrade to Pro",
		popular: true,
		priceId: "price_pro_monthly",
	},
	{
		name: "Team",
		price: "Custom",
		description: "Perfect for teams and organizations",
		features: [
			"Everything in Pro",
			"Team collaboration",
			"Advanced analytics",
			"SSO integration",
			"Dedicated support",
			"Custom integrations",
		],
		buttonText: "Contact Sales",
	},
];

interface PricingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubscribe?: (priceId?: string) => void;
}

export const PricingModal = memo(
	({ isOpen, onClose, onSubscribe }: PricingModalProps) => {
		const [isLoading, setIsLoading] = useState<string | null>(null);

		const handleSubscribe = async (tier: PricingTier) => {
			if (tier.name === "Free") {
				return;
			}

			if (tier.name === "Team") {
				window.open(
					"mailto:sales@sharkbook.ai?subject=Team Plan Inquiry",
					"_blank",
				);
				return;
			}

			if (tier.priceId) {
				setIsLoading(tier.priceId);
				try {
					await onSubscribe?.(tier.priceId);
				} catch (error) {
					console.error("Subscription error:", error);
				} finally {
					setIsLoading(null);
				}
			}
		};

		return (
			<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
				<Dialog.Portal>
					<Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
					<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-bolt-elements-bg-depth-2 rounded-lg border border-bolt-elements-borderColor shadow-lg z-50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-bolt-elements-borderColor">
							<Dialog.Title className="text-2xl font-bold text-bolt-elements-textPrimary">
								Choose Your Plan
							</Dialog.Title>
							<Dialog.Close asChild>
								<IconButton
									icon="i-ph:x-duotone"
									className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
								/>
							</Dialog.Close>
						</div>

						<Dialog.Description className="px-6 pt-2 pb-6 text-center text-bolt-elements-textSecondary">
							Select the perfect plan for your needs. Upgrade or downgrade at
							any time.
						</Dialog.Description>

						<div className="px-6 pb-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{pricingTiers.map((tier) => (
									<div
										key={tier.name}
										className={classNames(
											"relative rounded-xl border-2 p-6 transition-all duration-200",
											{
												"border-accent-500 bg-accent-50/5 scale-105":
													tier.popular,
												"border-bolt-elements-borderColor bg-bolt-elements-bg-depth-1 hover:border-accent-300":
													!tier.popular,
											},
										)}
									>
										{tier.popular && (
											<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
												<span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
													Most Popular
												</span>
											</div>
										)}

										<div className="text-center">
											<h3 className="text-xl font-bold text-bolt-elements-textPrimary mb-2">
												{tier.name}
											</h3>
											<div className="mb-2">
												<span className="text-3xl font-bold text-bolt-elements-textPrimary">
													{tier.price}
												</span>
												{tier.price !== "Custom" && tier.price !== "$0" && (
													<span className="text-bolt-elements-textSecondary">
														/month
													</span>
												)}
											</div>
											<p className="text-bolt-elements-textSecondary mb-6">
												{tier.description}
											</p>
										</div>

										<ul className="space-y-3 mb-6">
											{tier.features.map((feature, index) => (
												<li key={index} className="flex items-center text-sm">
													<div className="i-ph:check-duotone text-green-500 mr-3 flex-shrink-0" />
													<span className="text-bolt-elements-textPrimary">
														{feature}
													</span>
												</li>
											))}
										</ul>

										<button
											onClick={() => handleSubscribe(tier)}
											disabled={isLoading === tier.priceId}
											className={classNames(
												"w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
												{
													"bg-accent-500 hover:bg-accent-600 text-white":
														tier.popular,
													"bg-bolt-elements-button-secondary-background hover:bg-bolt-elements-button-secondary-backgroundHover text-bolt-elements-button-secondary-text border border-bolt-elements-borderColor":
														!tier.popular,
													"opacity-50 cursor-not-allowed":
														isLoading === tier.priceId,
												},
											)}
										>
											{isLoading === tier.priceId ? (
												<div className="flex items-center justify-center">
													<div className="i-svg-spinners:ring-resize mr-2" />
													Processing...
												</div>
											) : (
												tier.buttonText
											)}
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="px-6 pb-6 text-center">
							<p className="text-sm text-bolt-elements-textSecondary">
								All plans include our core AI features. Cancel anytime.
							</p>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		);
	},
);
