import { useStore } from "@nanostores/react";
import { useChat } from "@ai-sdk/react";
import { useAnimate } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { cssTransition, ToastContainer } from "react-toastify";
import { useMessageParser, useShortcuts, useSnapScroll } from "~/lib/hooks";
import { chatStore } from "~/lib/stores/chat";
import { workbenchStore } from "~/lib/stores/workbench";
import { renderLogger } from "~/utils/logger";
import { BaseChat } from "./BaseChat";
import { useLoaderData } from "@remix-run/react";
import { DefaultChatTransport } from "ai";

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

/**
 * Chat component that handles the chat functionality, including sending messages,
 */
export const ChatImpl = () => {
	useShortcuts();
	const { user } = useLoaderData();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [chatStarted, setChatStarted] = useState(false);
	const [animationScope, animate] = useAnimate();

	const { messages, stop, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			body: {
				hello: 123,
			},
		}),
	});

	console.log(messages, "messages in ChatImpl");

	const [input, setInput] = useState("");

	const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

	const abort = () => {
		stop();
		chatStore.setKey("aborted", true);
		workbenchStore.abortAllActions();
	};

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

	const [messageRef, scrollRef] = useSnapScroll();

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value);
	};

	const send = ({ text }) => {
		// 检测是否登录，如果没有登录直接跳转登录页面/login
		if (!user) {
			window.location.href = "/login";
			return null;
		}

		if (!text) return;

		setChatStarted(true);
		sendMessage?.({ text });
	};

	return (
		<BaseChat
			ref={animationScope}
			textareaRef={textareaRef}
			input={input}
			chatStarted={chatStarted}
			sendMessage={send}
			messageRef={messageRef}
			scrollRef={scrollRef}
			handleInputChange={handleInputChange}
			handleStop={abort}
			messages={messages}
		/>
	);
};
