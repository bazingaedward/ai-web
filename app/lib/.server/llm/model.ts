import { createOpenAI } from "@ai-sdk/openai";
import { getAPIKey } from "./api-key";

export const MODEL_NAME = "gpt-4o";

export function getOpenAIModel(env: Env) {
	const openai = createOpenAI({
		apiKey: getAPIKey(env),
	});

	return openai(MODEL_NAME);
}
