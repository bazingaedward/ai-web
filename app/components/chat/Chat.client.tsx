import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { cssTransition, ToastContainer } from "react-toastify";
import { useShortcuts, useSnapScroll } from "~/lib/hooks";
import { $chatStore, updateChatStore } from "~/lib/stores/chat";
import { renderLogger } from "~/utils/logger";
import { BaseChat } from "./BaseChat";
import { useLoaderData } from "@remix-run/react";
import { DefaultChatTransport } from "ai";
import { useStore } from "@nanostores/react";
import { workbenchStore } from "~/lib/stores/workbench";

const toastAnimation = cssTransition({
	enter: "animated fadeInRight",
	exit: "animated fadeOutRight",
});

export function Chat() {
	renderLogger.trace("Chat");

	return (
		<>
			<ChatImpl />
			<ToastContainer
				closeButton={({ closeToast }) => {
					return (
						<button className="Toastify__close-button" onClick={closeToast}>
							<div className="i-ph:x text-lg" />
						</button>
					);
				}}
				icon={({ type }) => {
					/**
					 * @todo Handle more types if we need them. This may require extra color palettes.
					 */
					switch (type) {
						case "success": {
							return (
								<div className="i-ph:check-bold text-bolt-elements-icon-success text-2xl" />
							);
						}
						case "error": {
							return (
								<div className="i-ph:warning-circle-bold text-bolt-elements-icon-error text-2xl" />
							);
						}
					}

					return undefined;
				}}
				position="bottom-right"
				pauseOnFocusLoss
				transition={toastAnimation}
			/>
		</>
	);
}

export const ChatImpl = () => {
	useShortcuts();
	const { user } = useLoaderData();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const chat = useStore($chatStore);
	const [messageRef, scrollRef] = useSnapScroll();

	const { messages, stop, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});

	const TEXTAREA_MAX_HEIGHT = chat.started ? 400 : 200;

	useEffect(() => {
		const textarea = textareaRef.current;

		if (textarea) {
			textarea.style.height = "auto";

			const scrollHeight = textarea.scrollHeight;

			textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
			textarea.style.overflowY =
				scrollHeight > TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
		}
	}, [textareaRef]);

	const send = ({ text }) => {
		// 检测是否登录，如果没有登录直接跳转登录页面/login
		if (!user) {
			window.location.href = "/login";
			return null;
		}

		if (!text) return;

		sendMessage?.({ text });
		updateChatStore({
			started: true,
			input: "",
		});
	};

	const handleStop = () => {
		stop();
		updateChatStore({
			aborted: true,
			input: "",
		});
		workbenchStore.abortAllActions();
	};

	return (
		<BaseChat
			textareaRef={textareaRef}
			sendMessage={send}
			messageRef={messageRef}
			scrollRef={scrollRef}
			messages={messages}
			handleStop={handleStop}
		/>
	);
};
