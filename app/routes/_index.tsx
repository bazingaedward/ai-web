import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ClientOnly } from "remix-utils/client-only";
import { BaseChat } from "~/components/chat/BaseChat";
import { Chat } from "~/components/chat/Chat.client";
import { Header } from "~/components/header/Header";
import { getOptionalAuth } from "~/lib/auth.server";
import { getUserSubscriptionById } from "~/lib/supabase.server";

export async function loader(args: LoaderFunctionArgs) {
	const { session, supabase } = await getOptionalAuth(args);

	// 使用supabse获取用户订阅信息，查询user_subscription表
	let subscriptionInfo = null;
	if (session?.user) {
		subscriptionInfo = await getUserSubscriptionById(supabase, session.user.id);
	}

	return json({
		user: session?.user || null,
		subscriptionInfo,
	});
}

export default function Index() {
	return (
		<div className="flex flex-col h-full w-full">
			<Header />
			<ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
		</div>
	);
}
