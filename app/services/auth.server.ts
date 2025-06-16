import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import type { User } from "~/models/user.server";

import { isDev } from "~/utils/env";

const SESSION_SECRET = "your-session-secret-here"; // Replace with your actual session secret

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		maxAge: 60,
		path: "/",
		sameSite: "lax",
		secrets: [SESSION_SECRET],
		secure: true,
	},
});

export function getAuthenticator(env: Record<string, string>) {
	const authenticator = new Authenticator<User>(sessionStorage);

	authenticator.use(
		new GoogleStrategy(
			{
				clientID: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				callbackURL: isDev()
					? "http://localhost:5173/auth/google/callback"
					: "https://bolt-efz.pages.dev/auth/google/callback",
				scope: ["profile", "email"],
			},
			async ({ profile }) => {
				// Save user profile to the session or database
				const userInfo = {
					id: profile.id,
					name: profile.displayName,
					email: profile.emails?.[0]?.value || "",
					avatar: profile.photos?.[0]?.value || "",
				};

				console.log("User Info:", userInfo);

				await env.USER_LOGIN.put("user", JSON.stringify(userInfo));
				return userInfo;
			},
		),
		"google",
	);

	return {
		authenticator,
		sessionStorage,
	};
}
