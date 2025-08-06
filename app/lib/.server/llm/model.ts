import { createOpenAI } from "@ai-sdk/openai";
import { getAPIKey } from "./api-key";

export function getOpenAIModel(env: Env) {
	const openai = createOpenAI({
		apiKey: getAPIKey(env),
	});

	return openai("gpt-4o");
}
