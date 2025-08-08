import { atom } from "nanostores";

export interface SubscriptionInfo {
	isActive: boolean;
	plan: "free" | "pro" | "team";
	customerId?: string;
	subscriptionId?: string;
	currentPeriodEnd?: Date;
	cancelAtPeriodEnd?: boolean;
}

export const subscriptionStore = atom<SubscriptionInfo>({
	isActive: false,
	plan: "free",
});

export function updateSubscription(info: Partial<SubscriptionInfo>) {
	subscriptionStore.set({
		...subscriptionStore.get(),
		...info,
	});
}

export function setSubscriptionPlan(plan: SubscriptionInfo["plan"]) {
	subscriptionStore.set({
		...subscriptionStore.get(),
		plan,
		isActive: plan !== "free",
	});
}
