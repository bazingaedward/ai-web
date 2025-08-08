import type { LinksFunction } from "@remix-run/cloudflare";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import tailwindReset from "@unocss/reset/tailwind-compat.css?url";
import { createHead } from "remix-island";

import reactToastifyStyles from "react-toastify/dist/ReactToastify.css?url";
import globalStyles from "./styles/index.scss?url";
import xtermStyles from "@xterm/xterm/css/xterm.css?url";

import "virtual:uno.css";

export const links: LinksFunction = () => [
	{
		rel: "icon",
		href: "/favicon.ico",
		type: "image/x-icon",
	},
	{
		rel: "icon",
		href: "/favicon.png",
		type: "image/png",
	},
	{
		rel: "apple-touch-icon",
		href: "/favicon.png",
		sizes: "180x180",
	},
	{ rel: "stylesheet", href: reactToastifyStyles },
	{ rel: "stylesheet", href: tailwindReset },
	{ rel: "stylesheet", href: globalStyles },
	{ rel: "stylesheet", href: xtermStyles },
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com",
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
	},
];

export function meta() {
	return [
		{
			name: "build-time",
			content: new Date().toISOString(),
		},
		{
			title: "AI Web - Your AI Assistant",
		},
		{
			name: "description",
			content: "AI-powered web development assistant",
		},
		{
			name: "author",
			content: "AI Web",
		},
		{
			name: "robots",
			content: "index,follow",
		},
	];
}

export const Head = createHead(() => (
	<>
		<meta charSet="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<Meta />
		<Links />
	</>
));

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<ScrollRestoration />
			<Scripts />
		</>
	);
}

export default function App() {
	return <Outlet />;
}
