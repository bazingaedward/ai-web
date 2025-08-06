import { type ActionFunctionArgs } from "@remix-run/cloudflare";
import { streamText } from "~/lib/.server/llm/stream-text";
import { stripIndents } from "~/utils/stripIndent";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function action(args: ActionFunctionArgs) {
	return enhancerAction(args);
}

async function enhancerAction({ context, request }: ActionFunctionArgs) {
	const { message } = await request.json<{ message: string }>();

	try {
		const result = await streamText(
			[
				{
					role: "user",
					content: stripIndents`
          I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

          IMPORTANT: Only respond with the improved prompt and nothing else!

          <original_prompt>
            ${message}
          </original_prompt>
        `,
				},
			],
			context.cloudflare.env,
		);

		const transformStream = new TransformStream({
			transform(chunk, controller) {
				// 在 AI SDK v5 中，直接处理文本块
				const text = decoder.decode(chunk);
				controller.enqueue(encoder.encode(text));
			},
		});

		const transformedStream = result.toAIStream().pipeThrough(transformStream);

		return new Response(transformedStream, {
			status: 200,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.log(error);

		throw new Response(null, {
			status: 500,
			statusText: "Internal Server Error",
		});
	}
}
