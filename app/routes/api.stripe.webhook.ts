import { json, type ActionFunctionArgs } from "@remix-run/node";
import type Stripe from "stripe";
import { constructWebhookEvent } from "~/lib/stripe.server";
import { createClient } from "~/lib/supabase.server";

// 为 webhook 创建 Supabase 客户端（不需要认证）
function createWebhookSupabaseClient(context: ActionFunctionArgs["context"]) {
	// 尝试从不同的环境变量源获取配置
	const cloudflareContext = context as unknown as {
		cloudflare?: { env?: Record<string, string> };
	};
	const env = cloudflareContext.cloudflare?.env || process.env;

	const supabaseUrl = env.SUPABASE_URL;
	const supabaseAnonKey = env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Supabase credentials not configured");
	}

	// 创建一个空的请求和响应对象用于 webhook
	const request = new Request("http://localhost");
	const response = new Response();

	return createClient(request, response, supabaseUrl, supabaseAnonKey);
}

export async function action({ request, context }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return json({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const signature = request.headers.get("stripe-signature");

		if (!signature) {
			return json({ error: "No stripe signature" }, { status: 400 });
		}

		const payload = await request.text();
		// const endpointSecret = (context.cloudflare.env as Record<string, unknown>)
		// 	.STRIPE_WEBHOOK_SECRET as string;

		const endpointSecret =
			"whsec_bbf58ed1005f40defa7ea0390c1e73a8f869a3d7883711a3fdf1ee853842e720";

		if (!endpointSecret) {
			return json({ error: "Webhook secret not configured" }, { status: 500 });
		}
		let event: Stripe.Event;
		try {
			event = await constructWebhookEvent(payload, signature, endpointSecret);
		} catch (err) {
			console.log(err, "err");
			return json(
				{ error: "Webhook signature verification failed" },
				{ status: 400 },
			);
		}

		switch (event.type) {
			// 表示 支付已成功完成。通常在客户完成付款、资金成功从支付方式扣除后触发。
			case "payment_intent.succeeded": {
				const supabase = createWebhookSupabaseClient(context);
				const paymentIntent = event.data.object as Stripe.PaymentIntent;

				try {
					// 1. 首先插入到 stripe_events 表
					const { error: eventError } = await supabase
						.from("stripe_events")
						.insert({
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

					// 2. 插入到 payments 表
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

					// 3. 标记事件为已处理
					await supabase
						.from("stripe_events")
						.update({
							processed: true,
							processed_at: new Date().toISOString(),
						})
						.eq("id", event.id);

					console.log(
						`Payment intent ${paymentIntent.id} processed successfully`,
					);
				} catch (error) {
					console.error("Error processing payment_intent.succeeded:", error);

					// 记录错误到 stripe_events 表
					await supabase
						.from("stripe_events")
						.update({
							error: error instanceof Error ? error.message : String(error),
						})
						.eq("id", event.id);

					throw error;
				}

				break;
			}

			case "customer.subscription.updated": {
				break;
			}

			case "customer.subscription.deleted": {
				break;
			}

			case "invoice.payment_succeeded": {
				break;
			}

			case "invoice.payment_failed": {
				break;
			}

			default: {
				console.log(`Unhandled event type ${event.type}`);
				break;
			}
		}

		return json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return json({ error: "Webhook handler failed" }, { status: 400 });
	}
}
