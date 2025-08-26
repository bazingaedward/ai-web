import type { ActionFunctionArgs } from "@remix-run/node";
import { createServerClient } from "@supabase/ssr";

/**
 * 创建用于 webhook 的 Supabase 客户端
 * 使用服务角色密钥来绕过 RLS 策略，因为 webhook 请求没有用户会话
 */
export function createWebhookSupabaseClient(
	context: ActionFunctionArgs["context"],
) {
	const cloudflareContext = context as unknown as {
		cloudflare?: { env?: Record<string, unknown> };
	};
	const env = cloudflareContext?.cloudflare?.env as Record<string, unknown>;

	const supabaseUrl = env.SUPABASE_URL as string;
	const supabaseAnonKey = env.SUPABASE_ANON_KEY as string;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Supabase webhook credentials not configured");
	}

	// 使用服务角色密钥创建 Supabase 客户端
	// 这允许我们在没有用户会话的情况下访问数据库并绕过 RLS
	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			// Webhooks 不需要 cookie 处理
			get() {
				return undefined;
			},
			set() {},
			remove() {},
		},
	});
}
