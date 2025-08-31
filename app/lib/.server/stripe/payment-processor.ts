import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export interface PaymentProcessorResult {
	success: boolean;
	paymentIntentId: string;
	error?: string;
}

/**
 * 处理支付成功事件
 */
export async function processPaymentIntentSucceeded(
	supabase: SupabaseClient,
	event: Stripe.Event,
	paymentIntent: Stripe.PaymentIntent,
): Promise<PaymentProcessorResult> {
	try {
		// 1. 首先插入到 stripe_events 表
		await insertStripeEvent(supabase, event);

		// 2. 插入到 payments 表
		await insertPaymentRecord(supabase, paymentIntent);

		// 3. 标记事件为已处理
		await markEventAsProcessed(supabase, event.id);

		console.log(`Payment intent ${paymentIntent.id} processed successfully`);

		return {
			success: true,
			paymentIntentId: paymentIntent.id,
		};
	} catch (error) {
		console.error("Error processing payment_intent.succeeded:", error);

		// 记录错误到 stripe_events 表
		await recordEventError(supabase, event.id, error);

		return {
			success: false,
			paymentIntentId: paymentIntent.id,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 插入 Stripe 事件记录
 */
async function insertStripeEvent(
	supabase: SupabaseClient,
	event: Stripe.Event,
) {
	const { error: eventError } = await supabase.from("stripe_events").insert({
		id: event.id,
		type: event.type,
		api_version: event.api_version || null,
		livemode: event.livemode,
		stripe_created: new Date(event.created * 1000).toISOString(),
		request_id: event.request?.id || null,
		data: event,
		processed: false,
	});

	if (eventError) {
		console.error("Failed to insert stripe_events:", eventError);
		// 如果是重复插入，不抛出错误（幂等性）
		if (!eventError.message.includes("duplicate key")) {
			throw eventError;
		}
	}
}

/**
 * 插入支付记录
 */
async function insertPaymentRecord(
	supabase: SupabaseClient,
	paymentIntent: Stripe.PaymentIntent,
) {
	// 获取 latest_charge 信息
	const latestChargeId = paymentIntent.latest_charge as string;
	let charge: Stripe.Charge | null = null;
	let paymentMethodDetails = null;

	// 如果有 latest_charge，尝试从数据中获取详细信息
	if (latestChargeId && typeof latestChargeId === "string") {
		// 这里可能需要额外的 API 调用来获取 charge 详情
		// 或者从 expanded 数据中获取
		if (
			typeof paymentIntent.latest_charge === "object" &&
			paymentIntent.latest_charge !== null
		) {
			charge = paymentIntent.latest_charge as Stripe.Charge;
			paymentMethodDetails = charge.payment_method_details;
		}
	}

	const paymentData = {
		payment_intent_id: paymentIntent.id,
		status: "succeeded" as const,
		amount: paymentIntent.amount,
		currency: paymentIntent.currency,
		customer_id: (paymentIntent.customer as string) || null,
		invoice_id: null, // PaymentIntent 类型中没有 invoice 字段
		subscription_id: null, // 可以从 invoice 或其他地方获取
		payment_method_id: (paymentIntent.payment_method as string) || null,
		payment_method_type: paymentMethodDetails?.type || null,
		card_brand: paymentMethodDetails?.card?.brand || null,
		card_last4: paymentMethodDetails?.card?.last4 || null,
		receipt_url: charge?.receipt_url || null,
		charge_id: latestChargeId || null,
		metadata: paymentIntent.metadata || null,
		description: paymentIntent.description || null,
		pi_created_at: new Date(paymentIntent.created * 1000).toISOString(),
		user_id: null, // 需要根据业务逻辑设置
		email: null, // PaymentIntent 类型中没有 receipt_email 字段
		statement_descriptor: paymentIntent.statement_descriptor || null,
	};

	const { error: paymentError } = await supabase
		.from("payments")
		.upsert(paymentData, {
			onConflict: "payment_intent_id",
		});

	if (paymentError) {
		console.error("Failed to insert payments:", paymentError);
		throw paymentError;
	}
}

/**
 * 标记事件为已处理
 */
async function markEventAsProcessed(supabase: SupabaseClient, eventId: string) {
	await supabase
		.from("stripe_events")
		.update({
			processed: true,
			processed_at: new Date().toISOString(),
		})
		.eq("id", eventId);
}

/**
 * 记录事件错误
 */
async function recordEventError(
	supabase: SupabaseClient,
	eventId: string,
	error: unknown,
) {
	await supabase
		.from("stripe_events")
		.update({
			error: error instanceof Error ? error.message : String(error),
		})
		.eq("id", eventId);
}
