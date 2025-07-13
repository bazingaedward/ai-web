// 环境变量类型定义
export interface Env {
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
}

// Supabase 客户端类型
export interface SupabaseClient {
	auth: {
		getSession(): Promise<{ data: { session: any }; error: any }>;
		signInWithPassword(credentials: {
			email: string;
			password: string;
		}): Promise<{ error: any }>;
		signUp(credentials: { email: string; password: string }): Promise<{
			error: any;
		}>;
		signOut(): Promise<{ error: any }>;
		exchangeCodeForSession(code: string): Promise<{ error: any }>;
	};
}

// Cookie 选项类型
export interface CookieOptions {
	path?: string;
	maxAge?: number;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: "Lax" | "Strict" | "None";
}
