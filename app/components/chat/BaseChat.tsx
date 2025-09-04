import type { CoreMessage } from "ai";
import React, { type RefCallback } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { Menu } from "~/components/sidebar/Menu.client";
import { Workbench } from "~/components/workbench/Workbench.client";
import { classNames } from "~/utils/classNames";
import { Messages } from "./Messages.client";
import { SendButton } from "./SendButton.client";
import { ChatTextarea } from "./ChatTextarea";

import styles from "./BaseChat.module.scss";
import { $chatStore, updateChatStore } from "~/lib/stores/chat";
import { useStore } from "@nanostores/react";

interface BaseChatProps {
	textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
	messageRef?: RefCallback<HTMLDivElement> | undefined;
	scrollRef?: RefCallback<HTMLDivElement> | undefined;
	showChat?: boolean;
	isStreaming?: boolean;
	messages?: CoreMessage[];
	enhancingPrompt?: boolean;
	promptEnhanced?: boolean;
	handleStop?: () => void;
	sendMessage?: (message: { text: string }) => void;
	enhancePrompt?: () => void;
}

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
	(
		{
			textareaRef,
			messageRef,
			scrollRef,
			isStreaming = false,
			messages,
			sendMessage,
			handleStop,
		},
		ref,
	) => {
		const chat = useStore($chatStore);
		const chatStarted = chat.started;
		const input = chat.input;
		const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

		const send = () => {
			sendMessage?.({ text: input });
		};

		const handleInputChange = (
			event: React.ChangeEvent<HTMLTextAreaElement>,
		) => {
			updateChatStore({
				input: event.target.value,
			});
		};

		return (
			<div
				ref={ref}
				className={classNames(
					styles.BaseChat,
					"relative flex h-full w-full overflow-hidden bg-bolt-elements-background-depth-1",
				)}
			>
				<ClientOnly>{() => <Menu />}</ClientOnly>
				<div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
					<div
						className={classNames(
							styles.Chat,
							"flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full",
						)}
					>
						{!chatStarted && (
							<div id="intro" className="mt-[26vh] max-w-chat mx-auto">
								<h1 className="text-5xl text-center font-bold text-bolt-elements-textPrimary mb-2">
									Where ideas begin
								</h1>
								<p className="mb-4 text-center text-bolt-elements-textSecondary">
									Bring ideas to life in seconds or get help on existing
									projects.
								</p>
							</div>
						)}
						<div
							className={classNames("pt-6 px-6", {
								"h-full flex flex-col": chatStarted,
							})}
						>
							{/* Messages */}
							<ClientOnly>
								{() => {
									return chatStarted ? (
										<Messages
											ref={messageRef}
											className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
											messages={messages}
											isStreaming={isStreaming}
										/>
									) : null;
								}}
							</ClientOnly>

							{/* Textarea */}
							<div
								className={classNames(
									"relative w-full max-w-chat mx-auto z-prompt",
									{
										"sticky bottom-0": chatStarted,
									},
								)}
							>
								<div
									className={classNames(
										"shadow-sm border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden",
									)}
								>
									<ClientOnly>
										{() => (
											<>
												<ChatTextarea
													textareaRef={textareaRef}
													input={input}
													onInputChange={handleInputChange}
													onSend={send}
													minHeight={TEXTAREA_MIN_HEIGHT}
													maxHeight={TEXTAREA_MAX_HEIGHT}
												/>

												<SendButton
													show={input.length > 0 || isStreaming}
													isStreaming={isStreaming}
													onClick={() => {
														if (isStreaming) {
															handleStop?.();
															return;
														}
														send();
													}}
												/>
											</>
										)}
									</ClientOnly>
									<div className="flex justify-between text-sm p-4 pt-2">
										{input.length > 3 ? (
											<div className="text-xs text-bolt-elements-textTertiary">
												Use <kbd className="kdb">Shift</kbd> +{" "}
												<kbd className="kdb">Return</kbd> for a new line
											</div>
										) : null}
									</div>
								</div>
								<div className="bg-bolt-elements-background-depth-1 pb-6">
									{/* Ghost Element */}
								</div>
							</div>
						</div>
					</div>
					<ClientOnly>
						{() => (
							<Workbench chatStarted={chatStarted} isStreaming={isStreaming} />
						)}
					</ClientOnly>
				</div>
			</div>
		);
	},
);
