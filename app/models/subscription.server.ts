export interface UserSubscription {
	id: string;
	user_id: string;
	customer_id: string;
	subscription_id?: string;
	status: "active" | "inactive" | "canceled" | "past_due";
	plan: "free" | "pro" | "team";
	current_period_start?: Date;
	current_period_end?: Date;
	cancel_at_period_end: boolean;
	created_at: Date;
	updated_at: Date;
}

export interface CreateUserSubscriptionParams {
	user_id: string;
	customer_id: string;
	subscription_id?: string;
	status: UserSubscription["status"];
	plan: UserSubscription["plan"];
	current_period_start?: Date;
	current_period_end?: Date;
	cancel_at_period_end?: boolean;
}

export interface UpdateUserSubscriptionParams {
	subscription_id?: string;
	status?: UserSubscription["status"];
	plan?: UserSubscription["plan"];
	current_period_start?: Date;
	current_period_end?: Date;
	cancel_at_period_end?: boolean;
}
