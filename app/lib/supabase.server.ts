import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(
	request: Request,
	response: Response,
	supabaseUrl: string,
	supabaseAnonKey: string,
) {
	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return getCookie(request, name);
			},
			set(name: string, value: string, options: Record<string, any>) {
				setCookie(response, name, value, options);
			},
			remove(name: string, options: Record<string, any>) {
				setCookie(response, name, "", { ...options, maxAge: 0 });
			},
		},
	});
}

function getCookie(request: Request, name: string): string | undefined {
	const cookies = request.headers.get("Cookie");
	if (!cookies) return undefined;

	const cookie = cookies
		.split(";")
		.find((c) => c.trim().startsWith(`${name}=`));

	return cookie ? cookie.split("=")[1] : undefined;
}

function setCookie(
	response: Response,
	name: string,
	value: string,
	options: Record<string, any> = {},
) {
	// 确保 cookie 设置正确，特别是对于认证 cookies
	let cookie = `${name}=${value}`;

	const path = options.path || "/";
	cookie += `; Path=${path}`;

	if (options.httpOnly !== false) cookie += "; HttpOnly";

	const sameSite = options.sameSite || "lax";
	cookie += `; SameSite=${sameSite}`;

	if (options.secure) cookie += "; Secure";
	if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
	if (options.expires) cookie += `; Expires=${options.expires}`;

	response.headers.append("Set-Cookie", cookie);
}

/**
 * 获取用户订阅信息
 * @param supabase
 * @param userId
 * @returns
 */
export async function getUserSubscriptionById(
	supabase: SupabaseClient,
	userId: string,
) {
	// 使用supabse获取用户订阅信息，查询user_subscription表
	const { data: subscriptionInfo } = await supabase
		.from("user_subscriptions")
		.select("status,plan")
		.eq("user_id", userId)
		.single();

	return subscriptionInfo;
}
