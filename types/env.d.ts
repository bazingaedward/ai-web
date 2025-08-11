/// <reference types="@remix-run/cloudflare" />

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		env: {
			STRIPE_SECRET_KEY: string;
			// 其他 env...
		};
	}
}
