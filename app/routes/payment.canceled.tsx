import { Link } from "@remix-run/react";

export default function PaymentCanceled() {
	return (
		<div className="min-h-screen bg-bolt-elements-background-depth-1 flex items-center justify-center">
			<div className="max-w-md w-full bg-bolt-elements-bg-depth-2 rounded-lg shadow-lg p-8 text-center">
				<div className="mb-6">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<div className="i-ph:x-duotone text-3xl text-red-600" />
					</div>
					<h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">
						Payment Canceled
					</h1>
					<p className="text-bolt-elements-textSecondary">
						Your payment was canceled. No charges were made to your account.
					</p>
				</div>

				<div className="space-y-3">
					<Link
						to="/"
						className="block w-full bg-accent-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-600 transition-colors"
					>
						Continue with Free Plan
					</Link>
					<button
						onClick={() => window.history.back()}
						className="block w-full bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text py-3 px-4 rounded-lg font-medium border border-bolt-elements-borderColor hover:bg-bolt-elements-button-secondary-backgroundHover transition-colors"
					>
						Try Again
					</button>
				</div>

				<p className="mt-6 text-xs text-bolt-elements-textTertiary">
					You can upgrade to Pro anytime from your account settings.
				</p>
			</div>
		</div>
	);
}
