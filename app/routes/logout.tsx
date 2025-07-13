import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createClient } from "~/lib/supabase.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const response = new Response();
	const supabaseUrl = (context.cloudflare.env as any).SUPABASE_URL as string;
	const supabaseAnonKey = (context.cloudflare.env as any)
		.SUPABASE_ANON_KEY as string;

	const supabase = createClient(
		request,
		response,
		supabaseUrl,
		supabaseAnonKey,
	);

	const { error } = await supabase.auth.signOut();

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/login",
			...Object.fromEntries(response.headers.entries()),
		},
	});
}
