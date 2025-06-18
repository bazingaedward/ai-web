import { useStore } from "@nanostores/react";
import { ClientOnly } from "remix-utils/client-only";
import { chatStore } from "~/lib/stores/chat";
import { classNames } from "~/utils/classNames";
import { HeaderActionButtons } from "./HeaderActionButtons.client";
import { useLoaderData, useNavigate } from "@remix-run/react";
import React, { useState } from "react";

export type UserInfo = {
	id: string;
	name: string;
	email: string;
	avatar: string;
};

export function Header() {
	const chat = useStore(chatStore);
	const userInfo = useLoaderData() as UserInfo;
	const [showSignIn, setShowSignIn] = useState(false);
	const navigate = useNavigate();
	const onGoogleLogin = () => {
		navigate("/auth/google");
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
						Beaver.AI
					</a>
				</div>
				{userInfo ? (
					<div className="flex items-center gap-2 ml-auto mr-4">
						<img
							loading="lazy"
							crossOrigin="anonymous"
							src={userInfo.avatar}
							alt="User avatar"
							className="w-8 h-8 rounded-full "
						/>
						<span className="c-white">{userInfo.name || ""}</span>
					</div>
				) : (
					<div>
						<button
							className="ml-auto bg-transparent  mr-4 px-4 py-2 border border-white  text-white rounded hover:bg-accent-dark transition"
							onClick={() => setShowSignIn(true)}
						>
							Sign In
						</button>
						{showSignIn && (
							<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] relative">
									<button
										className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
										onClick={() => setShowSignIn(false)}
										aria-label="Close"
									>
										&times;
									</button>

									<img
										src="/google_signin.png"
										alt="signin"
										onClick={onGoogleLogin}
									/>
								</div>
							</div>
						)}
					</div>
				)}
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
		</header>
	);
}
