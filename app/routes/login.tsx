import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData, useActionData, redirect } from "@remix-run/react";
import { createClient } from "~/lib/supabase.server";
import * as Label from "@radix-ui/react-label";
import * as Separator from "@radix-ui/react-separator";

type ActionData = {
	error?: string;
	message?: string;
};

type LoaderData = {
	urlError?: string;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");

	if (code) {
		const response = new Response();
		const supabaseUrl = context.cloudflare.env.SUPABASE_URL as string;
		const supabaseAnonKey = context.cloudflare.env.SUPABASE_ANON_KEY as string;

		const supabase = createClient(
			request,
			response,
			supabaseUrl,
			supabaseAnonKey,
		);

		try {
			// 使用 exchangeCodeForSession 处理 PKCE 流程
			const { data } = await supabase.auth.exchangeCodeForSession(code);

			// 确保 session 创建成功
			if (data.session) {
				// 确保 cookie 正确设置
				const headers = new Headers(response.headers);
				headers.set("Location", "/");

				return new Response(null, {
					status: 302,
					headers,
				});
			}

			return redirect("/login?error=Failed to create session");
		} catch (err) {
			return redirect(
				`/login?error=${encodeURIComponent("OAuth callback failed")}`,
			);
		}
	}

	// 检查 URL 错误参数并显示用户友好的错误消息
	const error = url.searchParams.get("error");
	if (error) {
		return json({ urlError: error });
	}

	return json({});
}

export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData();
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const action = formData.get("action") as string;

	const response = new Response();
	const supabaseUrl = context.cloudflare.env.SUPABASE_URL as string;
	const supabaseAnonKey = context.cloudflare.env.SUPABASE_ANON_KEY as string;

	const supabase = createClient(
		request,
		response,
		supabaseUrl,
		supabaseAnonKey,
	);

	if (action === "google") {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${new URL(request.url).origin}/login`,
				},
			});

			if (error) {
				return json({ error: error.message }, { status: 400 });
			}

			if (data.url) {
				const headers = new Headers(response.headers);
				headers.set("Location", data.url);

				return new Response(null, {
					status: 302,
					headers,
				});
			}

			return json({ error: "Failed to get OAuth URL" }, { status: 400 });
		} catch (err) {
			console.error("Unexpected error during Google OAuth initiation:", err);
			return json({ error: "OAuth initiation failed" }, { status: 500 });
		}
	}

	if (action === "login") {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return json({ error: error.message }, { status: 400 });
		}

		return new Response(null, {
			status: 302,
			headers: new Headers({
				Location: "/",
				...Object.fromEntries(response.headers.entries()),
			}),
		});
	}

	if (action === "signup") {
		const { error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			return json({ error: error.message }, { status: 400 });
		}

		return json({ message: "Check your email for verification link" });
	}

	return json({ error: "Invalid action" }, { status: 400 });
}

export default function Auth() {
	const actionData = useActionData<ActionData>();
	const loaderData = useLoaderData<LoaderData>();

	// 合并来自 action 和 loader 的错误消息
	const displayError =
		actionData?.error ||
		(loaderData?.urlError ? decodeURIComponent(loaderData.urlError) : null);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-white">
						Welcome to Beaver.AI
					</h2>
					<p className="mt-2 text-sm text-gray-400">
						Sign in to your account or create a new one
					</p>
				</div>

				{displayError && (
					<div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
						{displayError}
					</div>
				)}

				{actionData?.message && (
					<div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
						{actionData.message}
					</div>
				)}

				<div className="bg-gray-800 rounded-lg p-8 space-y-6 border border-gray-700">
					{/* Google Login Button */}
					<Form method="post">
						<button
							type="submit"
							name="action"
							value="google"
							className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-600 rounded-lg text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors font-medium"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continue with Google
						</button>
					</Form>

					<div className="relative">
						<Separator.Root className="bg-gray-600 h-px w-full" />
						<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 text-sm text-gray-400">
							or
						</span>
					</div>

					{/* Email/Password Form */}
					<Form method="post" className="space-y-4">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label.Root
									htmlFor="email"
									className="text-sm font-medium text-gray-300"
								>
									Email address
								</Label.Root>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your email"
								/>
							</div>
							<div className="space-y-2">
								<Label.Root
									htmlFor="password"
									className="text-sm font-medium text-gray-300"
								>
									Password
								</Label.Root>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your password"
								/>
							</div>
						</div>

						<div className="flex space-x-3">
							<button
								type="submit"
								name="action"
								value="login"
								className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors font-medium"
							>
								Sign In
							</button>
							<button
								type="submit"
								name="action"
								value="signup"
								className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors font-medium"
							>
								Sign Up
							</button>
						</div>
					</Form>
				</div>

				<p className="text-center text-sm text-gray-400">
					By signing in, you agree to our Terms of Service and Privacy Policy
				</p>
			</div>
		</div>
	);
}
