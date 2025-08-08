import { useStore } from "@nanostores/react";
import { ClientOnly } from "remix-utils/client-only";
import { chatStore } from "~/lib/stores/chat";
import { classNames } from "~/utils/classNames";
import { HeaderActionButtons } from "./HeaderActionButtons.client";
import { useLoaderData, useNavigate } from "@remix-run/react";
import * as Avatar from "@radix-ui/react-avatar";
import { useState } from "react";
import { PricingModal } from "~/components/ui/PricingModal";
import { redirectToCheckout } from "~/lib/stripe.client";

export type UserInfo = {
	id: string;
	name: string;
	email: string;
};

type LoaderData = {
	user: {
		id: string;
		email: string;
		user_metadata: {
			name?: string;
			avatar_url?: string;
			full_name?: string;
			picture?: string;
		};
	} | null;
};

export function Header() {
	const chat = useStore(chatStore);
	const navigate = useNavigate();
	const { user } = useLoaderData<LoaderData>();
	const [isPricingOpen, setIsPricingOpen] = useState(false);

	// 从 Supabase user 对象构造 userInfo
	const userInfo: UserInfo | null = user
		? {
				id: user.id,
				name:
					user.user_metadata?.name ||
					user.user_metadata?.full_name ||
					user.email.split("@")[0],
				email: user.email,
			}
		: null;

	const handleSubscribe = async (priceId?: string) => {
		if (!priceId) return;

		try {
			await redirectToCheckout({ priceId });
		} catch (error) {
			console.error("Subscription error:", error);
			// You could show a toast notification here
		}
	};

	return (
		<header
			className={classNames(
				"flex items-center bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]",
				{
					"border-transparent": !chat.started,
					"border-bolt-elements-borderColor": chat.started,
				},
			)}
		>
			<div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer justify-between w-full">
				<div className="inline-flex items-center gap-2">
					<div className="i-ph:sidebar-simple-duotone text-xl" />

					<a
						href="/"
						className="text-2xl font-semibold text-accent flex items-center"
					>
						Sharkbook
					</a>

					<div className="mr-3">
						<div
							onClick={() => setIsPricingOpen(true)}
							className="px-4 py-2  text-white text-sm font-medium "
						>
							Pricing
						</div>
					</div>
				</div>

				{/* Pricing Button */}
				<div className="flex items-center gap-4">
					{userInfo ? (
						<div className="flex items-center gap-3">
							<Avatar.Root className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white text-sm font-medium overflow-hidden">
								<Avatar.Image
									className="w-full h-full object-cover"
									src={
										user?.user_metadata?.avatar_url ||
										user?.user_metadata?.picture
									}
									alt={userInfo.name}
								/>
								<Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gray-600 text-white text-sm font-medium">
									{userInfo.name.charAt(0).toUpperCase()}
								</Avatar.Fallback>
							</Avatar.Root>
							<span className="text-white text-sm font-medium">
								{userInfo.name}
							</span>
							<button
								type="button"
								onClick={() => navigate("/logout")}
								className="px-3 py-1.5 text-xs bg-gray-800 text-white rounded-md hover:bg-gray-700 border border-gray-600 transition-colors font-medium"
								title="Logout"
							>
								Logout
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => navigate("/login")}
							className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 border border-gray-600 transition-colors font-medium"
						>
							Login
						</button>
					)}
				</div>
			</div>

			{chat.started && (
				<ClientOnly>
					{() => (
						<div className="mr-1">
							<HeaderActionButtons />
						</div>
					)}
				</ClientOnly>
			)}

			{/* Pricing Modal */}
			<PricingModal
				isOpen={isPricingOpen}
				onClose={() => setIsPricingOpen(false)}
				onSubscribe={handleSubscribe}
			/>
		</header>
	);
}
