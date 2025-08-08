import { json } from "@remix-run/cloudflare";

// Catch-all route for handling unmatched routes
// This includes browser requests like:
// - /.well-known/appspecific/com.chrome.devtools.json
// - /favicon.ico (if not found in public)
// - Any other unmatched URLs

export function loader() {
	// Return 404 status without causing error logs
	return json(null, { status: 404 });
}

export default function CatchAll() {
	return (
		<div className="min-h-screen bg-bolt-elements-background-depth-1 flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-bolt-elements-textPrimary mb-4">
					404
				</h1>
				<p className="text-bolt-elements-textSecondary mb-6">Page not found</p>
				<a
					href="/"
					className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
				>
					Go Home
				</a>
			</div>
		</div>
	);
}
