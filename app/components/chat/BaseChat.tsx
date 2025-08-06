import type { CoreMessage } from "ai";
import React, { type RefCallback } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { Menu } from "~/components/sidebar/Menu.client";
import { Workbench } from "~/components/workbench/Workbench.client";
import { classNames } from "~/utils/classNames";
import { Messages } from "./Messages.client";
import { SendButton } from "./SendButton.client";

import styles from "./BaseChat.module.scss";

interface BaseChatProps {
	textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
	messageRef?: RefCallback<HTMLDivElement> | undefined;
	scrollRef?: RefCallback<HTMLDivElement> | undefined;
	showChat?: boolean;
	chatStarted?: boolean;
	isStreaming?: boolean;
	messages?: CoreMessage[];
	enhancingPrompt?: boolean;
	promptEnhanced?: boolean;
	input?: string;
	handleStop?: () => void;
	sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
	handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	enhancePrompt?: () => void;
}

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
	(
		{
			textareaRef,
			messageRef,
			scrollRef,
			chatStarted = false,
			isStreaming = false,
			messages,
			input = "",
			sendMessage,
			handleInputChange,
			handleStop,
		},
		ref,
	) => {
		const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

		const send = () => {
			sendMessage?.({ text: input });
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
									<textarea
										ref={textareaRef}
										className={
											"w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent"
										}
										onKeyDown={(event) => {
											if (event.key === "Enter") {
												if (event.shiftKey) return;
												send();
											}
										}}
										value={input}
										onChange={(event) => {
											handleInputChange?.(event);
										}}
										style={{
											minHeight: TEXTAREA_MIN_HEIGHT,
											maxHeight: TEXTAREA_MAX_HEIGHT,
										}}
										placeholder="How can Sharkbook help you today?"
										translate="no"
									/>
									<ClientOnly>
										{() => (
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
