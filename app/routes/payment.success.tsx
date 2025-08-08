import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { getOptionalAuth } from "~/lib/auth.server";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const sessionId = url.searchParams.get("session_id");

	const { session } = await getOptionalAuth({ request, context, params });

	return json({
		sessionId,
		user: session?.user || null,
	});
}

export default function PaymentSuccess() {
	const { sessionId, user } = useLoaderData<typeof loader>();

	return (
		<div className="min-h-screen bg-bolt-elements-background-depth-1 flex items-center justify-center">
			<div className="max-w-md w-full bg-bolt-elements-bg-depth-2 rounded-lg shadow-lg p-8 text-center">
				<div className="mb-6">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<div className="i-ph:check-duotone text-3xl text-green-600" />
					</div>
					<h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">
						Payment Successful!
					</h1>
					<p className="text-bolt-elements-textSecondary">
						Thank you for subscribing to Sharkbook Pro. Your account has been
						upgraded.
					</p>
				</div>

				{sessionId && (
					<div className="mb-6 p-4 bg-bolt-elements-bg-depth-1 rounded-lg">
						<p className="text-sm text-bolt-elements-textSecondary">
							Transaction ID: <span className="font-mono">{sessionId}</span>
						</p>
					</div>
				)}

				<div className="space-y-3">
					<Link
						to="/"
						className="block w-full bg-accent-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-600 transition-colors"
					>
						Start Building
					</Link>
					<Link
						to="/account"
						className="block w-full bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text py-3 px-4 rounded-lg font-medium border border-bolt-elements-borderColor hover:bg-bolt-elements-button-secondary-backgroundHover transition-colors"
					>
						Manage Account
					</Link>
				</div>

				<p className="mt-6 text-xs text-bolt-elements-textTertiary">
					A receipt has been sent to {user?.email}
				</p>
			</div>
		</div>
	);
}
