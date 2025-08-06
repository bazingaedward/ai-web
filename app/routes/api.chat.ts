import { type ActionFunctionArgs } from "@remix-run/cloudflare";
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from "~/lib/.server/llm/constants";
import { CONTINUE_PROMPT } from "~/lib/.server/llm/prompts";
import {
	streamText,
	type Messages,
	type StreamingOptions,
} from "~/lib/.server/llm/stream-text";
import SwitchableStream from "~/lib/.server/llm/switchable-stream";

export async function action({ request, context }: ActionFunctionArgs) {
	const { messages } = await request.json<{ messages: Messages }>();

	const stream = new SwitchableStream();

	try {
		const options: StreamingOptions = {
			toolChoice: "none",
			// onFinish: async ({ text: content, finishReason }) => {
			// 	// 这里的content就是最终的内容
			// 	if (finishReason !== "length") {
			// 		return stream.close();
			// 	}

			// 	if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
			// 		throw Error("Cannot continue message: Maximum segments reached");
			// 	}

			// 	const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

			// 	console.log(
			// 		`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`,
			// 	);

			// 	messages.push({ role: "assistant", content });
			// 	messages.push({ role: "user", content: CONTINUE_PROMPT });

			// 	const result = await streamText(
			// 		messages,
			// 		context.cloudflare.env,
			// 		options,
			// 	);

			// 	return stream.switchSource(result.toAIStream());
			// },
		};

		const result = streamText(messages, context.cloudflare.env, options);

		// console.log(result, "result");

		// stream.switchSource(result.toAIStream());

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error(error);
		throw new Response(null, {
			status: 500,
			statusText: "Internal Server Error",
		});
	}
}
