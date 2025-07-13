import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { requireAuth } from "~/lib/auth.server";
import { default as IndexRoute } from "./_index";

export async function loader(args: LoaderFunctionArgs) {
	// 聊天页面需要用户登录
	const { session } = await requireAuth(args);

	return json({
		id: args.params.id,
		user: session.user,
	});
}

export default IndexRoute;
