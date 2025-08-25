import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { createClient } from "~/lib/supabase.server";

/**
 * chat id usage
 * @param args
 * @returns
 */
export async function requireAuth({ request, context }: LoaderFunctionArgs) {
	const response = new Response();

	// 从环境变量获取 Supabase 配置
	const supabaseUrl = context.cloudflare.env.SUPABASE_URL;
	const supabaseAnonKey = context.cloudflare.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Supabase credentials not configured");
	}

	const supabase = createClient(
		request,
		response,
		supabaseUrl,
		supabaseAnonKey,
	);

	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error || !session) {
		throw redirect("/login");
	}

	return { session, supabase, response };
}

export async function getOptionalAuth(args: LoaderFunctionArgs) {
	const { request } = args;
	const response = new Response();

	const supabaseUrl = args.context.cloudflare.env.SUPABASE_URL;
	const supabaseAnonKey = args.context.cloudflare.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		return { session: null, supabase: null, response };
	}

	const supabase = createClient(
		request,
		response,
		supabaseUrl,
		supabaseAnonKey,
	);
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		return { session, supabase, response };
	} catch (error) {
		console.error("Error fetching session:", error);
		return { session: null, supabase, response };
	}
}
