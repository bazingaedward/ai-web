import { useStore } from "@nanostores/react";
import { subscriptionStore } from "~/lib/stores/subscription";

interface UsageLimitProps {
	feature: "conversations" | "projects" | "exports";
	used: number;
	limit?: number;
}

const FEATURE_LIMITS = {
	free: {
		conversations: 5,
		projects: 3,
		exports: 0,
	},
	pro: {
		conversations: -1, // unlimited
		projects: -1, // unlimited
		exports: -1, // unlimited
	},
	team: {
		conversations: -1, // unlimited
		projects: -1, // unlimited
		exports: -1, // unlimited
	},
};

export function UsageLimit({ feature, used, limit }: UsageLimitProps) {
	const subscription = useStore(subscriptionStore);

	const actualLimit = limit ?? FEATURE_LIMITS[subscription.plan][feature];
	const isUnlimited = actualLimit === -1;
	const percentage = isUnlimited
		? 0
		: Math.min((used / actualLimit) * 100, 100);
	const isNearLimit = percentage >= 80;
	const isAtLimit = percentage >= 100;

	if (isUnlimited) {
		return (
			<div className="flex items-center justify-between p-4 bg-bolt-elements-bg-depth-1 rounded-lg border border-bolt-elements-borderColor">
				<div>
					<h3 className="font-medium text-bolt-elements-textPrimary capitalize">
						{feature}
					</h3>
					<p className="text-sm text-bolt-elements-textSecondary">
						{used.toLocaleString()} used
					</p>
				</div>
				<div className="text-right">
					<p className="text-sm font-medium text-green-500">Unlimited</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-between p-4 bg-bolt-elements-bg-depth-1 rounded-lg border border-bolt-elements-borderColor">
			<div className="flex-1">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-medium text-bolt-elements-textPrimary capitalize">
						{feature}
					</h3>
					<span
						className={`text-sm font-medium ${
							isAtLimit
								? "text-red-500"
								: isNearLimit
									? "text-orange-500"
									: "text-bolt-elements-textSecondary"
						}`}
					>
						{used.toLocaleString()} / {actualLimit.toLocaleString()}
					</span>
				</div>
				<div className="w-full bg-bolt-elements-bg-depth-3 rounded-full h-2">
					<div
						className={`h-2 rounded-full transition-all duration-300 ${
							isAtLimit
								? "bg-red-500"
								: isNearLimit
									? "bg-orange-500"
									: "bg-accent-500"
						}`}
						style={{ width: `${percentage}%` }}
					/>
				</div>
				{isAtLimit && (
					<p className="text-xs text-red-500 mt-1">
						Limit reached. Upgrade to continue.
					</p>
				)}
			</div>
		</div>
	);
}

interface FeatureGateProps {
	feature: "conversations" | "projects" | "exports";
	used: number;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function FeatureGate({
	feature,
	used,
	children,
	fallback,
}: FeatureGateProps) {
	const subscription = useStore(subscriptionStore);

	const limit = FEATURE_LIMITS[subscription.plan][feature];
	const isUnlimited = limit === -1;
	const hasAccess = isUnlimited || used < limit;

	if (hasAccess) {
		return <>{children}</>;
	}

	return <>{fallback}</>;
}
