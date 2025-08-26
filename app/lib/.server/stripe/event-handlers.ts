import type { ActionFunctionArgs } from "@remix-run/node";
import type Stripe from "stripe";
import { createWebhookSupabaseClient } from "./webhook-client";
import { processPaymentIntentSucceeded } from "./payment-processor";
import {
	createUserSubscription,
	updateUserSubscription,
	getUserSubscriptionByCustomerId,
} from "./subscription";

export async function handleCheckoutSessionCompleted(
	event: Stripe.Event,
	context: ActionFunctionArgs["context"],
) {
	// 处理 checkout.session.completed 事件
	const session = event.data.object as Stripe.Checkout.Session;

	try {
		// 获取supabase client
		const supabase = createWebhookSupabaseClient(context);

		// 从 metadata 中获取用户 ID（webhook 上下文中没有用户会话）
		const userId = session.metadata?.userId;
		const priceId = session.metadata?.priceId;
		const customerId = session.customer as string;
		const subscriptionId = session.subscription as string;

		if (!userId) {
			console.error("User ID not found in checkout session metadata");
			throw new Error("User ID is required for checkout session processing");
		}

		if (!customerId) {
			console.error("Customer ID not found in checkout session");
			throw new Error(
				"Customer ID is required for checkout session processing",
			);
		}

		// 根据价格 ID 确定订阅计划
		let plan: "pro" | "team" = "pro"; // 默认为 pro
		if (priceId?.includes("team")) {
			plan = "team";
		}

		// 检查是否已存在该客户的订阅记录
		let existingSubscription = null;
		try {
			existingSubscription = await getUserSubscriptionByCustomerId(
				supabase,
				customerId,
			);
		} catch (error) {
			console.log("No existing subscription found, will create new one");
		}

		if (existingSubscription) {
			// 更新现有订阅
			await updateUserSubscription(supabase, userId, {
				subscription_id: subscriptionId,
				status: "active",
				plan: plan,
			});
			console.log(
				`Updated subscription for user ${userId}, customer ${customerId}`,
			);
		} else {
			// 创建新的订阅记录
			await createUserSubscription(supabase, {
				user_id: userId,
				customer_id: customerId,
				subscription_id: subscriptionId,
				status: "active",
				plan,
			});
			console.log(
				`Created new subscription for user ${userId}, customer ${customerId}`,
			);
		}
	} catch (error) {
		console.error("Error handling checkout.session.completed:", error);
		throw error;
	}
}

export interface WebhookEventHandler {
	type: string;
	handler: (
		event: Stripe.Event,
		context: ActionFunctionArgs["context"],
	) => Promise<void>;
}

/**
 * 处理 payment_intent.succeeded 事件
 */
export async function handlePaymentIntentSucceeded(
	event: Stripe.Event,
	context: ActionFunctionArgs["context"],
) {
	const supabase = createWebhookSupabaseClient(context);
	const paymentIntent = event.data.object as Stripe.PaymentIntent;

	const result = await processPaymentIntentSucceeded(
		supabase,
		event,
		paymentIntent,
	);

	if (!result.success) {
		throw new Error(result.error);
	}
}

/**
 * 处理 invoice.payment_succeeded 事件
 */
export async function handleInvoicePaymentSucceeded(
	event: Stripe.Event,
	context: ActionFunctionArgs["context"],
) {
	const supabase = createWebhookSupabaseClient(context);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const invoice = event.data.object as any;

	try {
		const customerId = invoice.customer as string;
		const subscriptionId = invoice.subscription as string | null;

		if (subscriptionId) {
			// 查找现有订阅记录
			const existingSubscription = await getUserSubscriptionByCustomerId(
				supabase,
				customerId,
			);

			if (existingSubscription) {
				// 更新订阅状态为活跃（支付成功）
				await updateUserSubscription(supabase, existingSubscription.user_id, {
					status: "active",
					current_period_start: invoice.period_start
						? new Date(invoice.period_start * 1000)
						: undefined,
					current_period_end: invoice.period_end
						? new Date(invoice.period_end * 1000)
						: undefined,
				});
				console.log(
					`Updated subscription status to active for customer ${customerId} after successful payment`,
				);
			} else {
				console.log(`No subscription record found for customer ${customerId}`);
			}
		}
	} catch (error) {
		console.error("Error handling invoice.payment_succeeded:", error);
		throw error;
	}
}

/**
 * 处理 customer.subscription.created 事件
 */
export async function handleSubscriptionCreated(
	event: Stripe.Event,
	context: ActionFunctionArgs["context"],
) {
	const supabase = createWebhookSupabaseClient(context);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const subscription = event.data.object as any;
	console.log("Subscription created:", String(subscription.id));

	try {
		const customerId = subscription.customer as string;
		const subscriptionId = subscription.id as string;

		// 获取订阅的第一个价格项来确定计划
		const subscriptionItem = subscription.items?.data?.[0];
		const priceId = subscriptionItem?.price?.id;

		// 根据价格 ID 确定订阅计划
		let plan: "pro" | "team" = "pro";
		if (priceId?.includes("team")) {
			plan = "team";
		}

		// 检查是否已存在该客户的订阅记录
		let existingSubscription = null;
		try {
			existingSubscription = await getUserSubscriptionByCustomerId(
				supabase,
				customerId,
			);
		} catch (error) {
			console.log("No existing subscription found for customer:", customerId);
		}

		if (existingSubscription) {
			// 更新现有订阅
			await updateUserSubscription(supabase, existingSubscription.user_id, {
				subscription_id: subscriptionId,
				status: subscription.status as
					| "active"
					| "inactive"
					| "canceled"
					| "past_due",
				plan: plan,
				current_period_start: subscription.current_period_start
					? new Date((subscription.current_period_start as number) * 1000)
					: undefined,
				current_period_end: subscription.current_period_end
					? new Date((subscription.current_period_end as number) * 1000)
					: undefined,
				cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
			});
			console.log(
				`Updated subscription for customer ${customerId}, subscription ${subscriptionId}`,
			);
		} else {
			console.log(
				`No existing subscription record found for customer ${customerId}. Cannot create subscription record without user mapping. This subscription may need to be handled manually or through a separate process.`,
			);
		}
	} catch (error) {
		console.error("Error handling subscription.created:", error);
		throw error;
	}
}

/**
 * 处理 customer.subscription.updated 事件
 */
export async function handleSubscriptionUpdated(
	event: Stripe.Event,
	context: ActionFunctionArgs["context"],
) {
	const supabase = createWebhookSupabaseClient(context);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const subscription = event.data.object as any;

	try {
		const customerId = subscription.customer as string;
		const subscriptionId = subscription.id as string;

		// 获取订阅的第一个价格项来确定计划
		const subscriptionItem = subscription.items?.data?.[0];
		const priceId = subscriptionItem?.price?.id;

		// 根据价格 ID 确定订阅计划
		let plan: "pro" | "team" = "pro";
		if (priceId?.includes("team")) {
			plan = "team";
		}

		// 查找现有订阅记录
		const existingSubscription = await getUserSubscriptionByCustomerId(
			supabase,
			customerId,
		);

		if (existingSubscription) {
			// 更新订阅信息
			await updateUserSubscription(supabase, existingSubscription.user_id, {
				subscription_id: subscriptionId,
				status: subscription.status as
					| "active"
					| "inactive"
					| "canceled"
					| "past_due",
				plan: plan,
				current_period_start: subscription.current_period_start
					? new Date((subscription.current_period_start as number) * 1000)
					: undefined,
				current_period_end: subscription.current_period_end
					? new Date((subscription.current_period_end as number) * 1000)
					: undefined,
				cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
			});
			console.log(
				`Updated subscription for customer ${customerId}, subscription ${subscriptionId}`,
			);
		} else {
			console.log(`No subscription record found for customer ${customerId}`);
		}
	} catch (error) {
		console.error("Error handling subscription.updated:", error);
		throw error;
	}
}

/**
 * 处理 customer.subscription.deleted 事件
 */
export async function handleSubscriptionDeleted(
	event: Stripe.Event,
	context: ActionFunctionArgs["context"],
) {
	const supabase = createWebhookSupabaseClient(context);
	const subscription = event.data.object as Stripe.Subscription;

	try {
		const customerId = subscription.customer as string;

		// 查找现有订阅记录
		const existingSubscription = await getUserSubscriptionByCustomerId(
			supabase,
			customerId,
		);

		if (existingSubscription) {
			// 更新订阅状态为取消，并重置为免费计划
			await updateUserSubscription(supabase, existingSubscription.user_id, {
				status: "canceled",
				plan: "free",
				cancel_at_period_end: false,
			});
			console.log(`Canceled subscription for customer ${customerId}`);
		} else {
			console.log(`No subscription record found for customer ${customerId}`);
		}
	} catch (error) {
		console.error("Error handling subscription.deleted:", error);
		throw error;
	}
}
