import { createClient } from "~/lib/supabase.server";
import type {
	UserSubscription,
	CreateUserSubscriptionParams,
	UpdateUserSubscriptionParams,
} from "~/models/subscription.server";

export async function createUserSubscription(
	supabase: ReturnType<typeof createClient>,
	params: CreateUserSubscriptionParams,
): Promise<UserSubscription> {
	const { data, error } = await supabase
		.from("user_subscriptions")
		.insert({
			user_id: params.user_id,
			customer_id: params.customer_id,
			subscription_id: params.subscription_id,
			status: params.status,
			plan: params.plan,
			current_period_start: params.current_period_start?.toISOString(),
			current_period_end: params.current_period_end?.toISOString(),
			cancel_at_period_end: params.cancel_at_period_end || false,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create user subscription: ${error.message}`);
	}

	return {
		...data,
		current_period_start: data.current_period_start
			? new Date(data.current_period_start)
			: undefined,
		current_period_end: data.current_period_end
			? new Date(data.current_period_end)
			: undefined,
		created_at: new Date(data.created_at),
		updated_at: new Date(data.updated_at),
	};
}

export async function updateUserSubscription(
	supabase: ReturnType<typeof createClient>,
	userId: string,
	params: UpdateUserSubscriptionParams,
): Promise<UserSubscription> {
	const updateData: any = {
		updated_at: new Date().toISOString(),
	};

	if (params.subscription_id !== undefined)
		updateData.subscription_id = params.subscription_id;
	if (params.status !== undefined) updateData.status = params.status;
	if (params.plan !== undefined) updateData.plan = params.plan;
	if (params.current_period_start !== undefined) {
		updateData.current_period_start = params.current_period_start.toISOString();
	}
	if (params.current_period_end !== undefined) {
		updateData.current_period_end = params.current_period_end.toISOString();
	}
	if (params.cancel_at_period_end !== undefined) {
		updateData.cancel_at_period_end = params.cancel_at_period_end;
	}

	const { data, error } = await supabase
		.from("user_subscriptions")
		.update(updateData)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update user subscription: ${error.message}`);
	}

	return {
		...data,
		current_period_start: data.current_period_start
			? new Date(data.current_period_start)
			: undefined,
		current_period_end: data.current_period_end
			? new Date(data.current_period_end)
			: undefined,
		created_at: new Date(data.created_at),
		updated_at: new Date(data.updated_at),
	};
}

export async function getUserSubscription(
	supabase: ReturnType<typeof createClient>,
	userId: string,
): Promise<UserSubscription | null> {
	const { data, error } = await supabase
		.from("user_subscriptions")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) {
		if (error.code === "PGRST116") {
			// No rows found
			return null;
		}
		throw new Error(`Failed to get user subscription: ${error.message}`);
	}

	return {
		...data,
		current_period_start: data.current_period_start
			? new Date(data.current_period_start)
			: undefined,
		current_period_end: data.current_period_end
			? new Date(data.current_period_end)
			: undefined,
		created_at: new Date(data.created_at),
		updated_at: new Date(data.updated_at),
	};
}

export async function getUserSubscriptionByCustomerId(
	supabase: ReturnType<typeof createClient>,
	customerId: string,
): Promise<UserSubscription | null> {
	const { data, error } = await supabase
		.from("user_subscriptions")
		.select("*")
		.eq("customer_id", customerId)
		.single();

	if (error) {
		if (error.code === "PGRST116") {
			return null;
		}
		throw new Error(`Failed to get user subscription: ${error.message}`);
	}

	return {
		...data,
		current_period_start: data.current_period_start
			? new Date(data.current_period_start)
			: undefined,
		current_period_end: data.current_period_end
			? new Date(data.current_period_end)
			: undefined,
		created_at: new Date(data.created_at),
		updated_at: new Date(data.updated_at),
	};
}
