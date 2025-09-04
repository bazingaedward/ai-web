interface ChatTextareaProps {
	textareaRef?: React.RefObject<HTMLTextAreaElement>;
	input: string;
	onInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onSend: () => void;
	minHeight: number;
	maxHeight: number;
}

export const ChatTextarea: React.FC<ChatTextareaProps> = ({
	textareaRef,
	input,
	onInputChange,
	onSend,
	minHeight,
	maxHeight,
}) => {
	return (
		<textarea
			ref={textareaRef}
			className={
				"w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent"
			}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					if (event.shiftKey) return;
					onSend();
				}
			}}
			value={input}
			onChange={onInputChange}
			style={{
				minHeight,
				maxHeight,
			}}
			placeholder="How can Sharkbook help you today?"
			translate="no"
		/>
	);
};
