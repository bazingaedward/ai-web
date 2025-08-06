import { createClient } from "~/lib/supabase.server";

export interface TokenUsageData {
	userId: string;
	modelName: string;
	inputTokens: number;
	outputTokens: number;
	price: number;
}

/**
 * 插入token使用记录到数据库
 */
export async function insertTokenUsage(
	data: TokenUsageData,
	supabaseUrl: string,
	supabaseAnonKey: string,
	request: Request,
) {
	const response = new Response();
	const supabase = createClient(
		request,
		response,
		supabaseUrl,
		supabaseAnonKey,
	);

	const { error } = await supabase.from("token_usage").insert({
		user_id: data.userId,
		model_name: data.modelName,
		input_tokens: data.inputTokens,
		output_tokens: data.outputTokens,
		price: data.price,
	});

	if (error) {
		console.error("Failed to insert token usage:", error);
		throw new Error(`Failed to record token usage: ${error.message}`);
	}

	return { success: true };
}

/**
 * 获取用户的token使用历史
 */
export async function getUserTokenUsage(
	supabaseUrl: string,
	supabaseAnonKey: string,
	request: Request,
	limit = 100,
) {
	const response = new Response();
	const supabase = createClient(
		request,
		response,
		supabaseUrl,
		supabaseAnonKey,
	);

	const { data, error } = await supabase
		.from("token_usage")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) {
		console.error("Failed to fetch token usage:", error);
		throw new Error(`Failed to fetch token usage: ${error.message}`);
	}

	return data;
}
