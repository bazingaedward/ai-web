import { getAuthenticator } from "~/services/auth.server";

export const loader = async ({ request, context }) => {
	const { authenticator } = getAuthenticator(context.cloudflare.env);
	return authenticator.authenticate("google", request, {
		successRedirect: "/",
		failureRedirect: "/login",
	});
};
