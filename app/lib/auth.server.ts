import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { createClient } from "~/lib/supabase.server";

export async function getSupabaseClient(
	request: Request,
	context: LoaderFunctionArgs["context"],
) {
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
	return { supabase, response };
}
/**
 * chat id usage
 * @param args
 * @returns
 */
export async function requireAuth({ request, context }: LoaderFunctionArgs) {
	const { supabase, response } = await getSupabaseClient(request, context);

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
