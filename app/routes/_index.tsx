import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ClientOnly } from "remix-utils/client-only";
import { BaseChat } from "~/components/chat/BaseChat";
import { Chat } from "~/components/chat/Chat.client";
import { Header } from "~/components/header/Header";
import { getOptionalAuth } from "~/lib/auth.server";

export async function loader(args: LoaderFunctionArgs) {
	const { session } = await getOptionalAuth(args);

	return json({
		user: session?.user || null,
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
