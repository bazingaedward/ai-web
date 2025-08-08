import { json } from "@remix-run/cloudflare";

// Handle .well-known directory requests
// This includes Chrome DevTools and other browser-specific requests
// like /.well-known/appspecific/com.chrome.devtools.json

export function loader() {
	// Return 404 for well-known requests that we don't support
	return json({ error: "Not found" }, { status: 404 });
}

export default function WellKnown() {
	return null;
}
