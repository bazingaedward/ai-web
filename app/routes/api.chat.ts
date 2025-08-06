import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { createClient } from "~/lib/supabase.server";
import {
	streamText,
	type Messages,
	type StreamingOptions,
} from "~/lib/.server/llm/stream-text";
import { insertTokenUsage } from "~/lib/token-usage.server";
import { MODEL_NAME } from "~/lib/.server/llm/model";

export async function action({ request, context }: ActionFunctionArgs) {
	const { messages } = await request.json<{
		messages: Messages;
	}>();

	try {
		const options: StreamingOptions = {
			toolChoice: "none",
		};

		const result = await streamText(messages, context.cloudflare.env, options);

		// 获取当前用户的认证信息
		const response = new Response();
		const supabase = createClient(
			request,
			response,
			context.cloudflare.env.SUPABASE_URL,
			context.cloudflare.env.SUPABASE_ANON_KEY,
		);
		const {
			data: { session },
		} = await supabase.auth.getSession();

		// 计算token的使用情况
		result.usage.then(({ inputTokens, outputTokens }) => {
			if (!inputTokens || !outputTokens) return;
			const price = (inputTokens * 0.005 + outputTokens * 0.015) / 1000;

			// 只有在用户已登录的情况下才记录 token 使用情况
			if (session?.user?.id) {
				insertTokenUsage(
					{
						userId: session.user.id,
						modelName: MODEL_NAME,
						inputTokens,
						outputTokens,
						price,
					},
					context.cloudflare.env.SUPABASE_URL,
					context.cloudflare.env.SUPABASE_ANON_KEY,
					request,
				);
			}
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error(error);
		throw new Response(null, {
			status: 500,
			statusText: "Internal Server Error",
		});
	}
}
