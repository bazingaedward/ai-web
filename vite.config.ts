import {
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
	vitePlugin as remix,
} from "@remix-run/dev";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { optimizeCssModules } from "vite-plugin-optimize-css-modules";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => {
	return {
		define: {
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
		// logLevel: "error",
		build: {
			target: "esnext",
		},
		plugins: [
			nodePolyfills({
				include: ["path", "buffer"],
			}),
			config.mode !== "test" && remixCloudflareDevProxy(),
			remix({
				future: {
					v3_fetcherPersist: true,
					v3_lazyRouteDiscovery: true,
					v3_relativeSplatPath: true,
					v3_singleFetch: false,
					v3_throwAbortReason: true,
				},
			}),
			UnoCSS(),
			tsconfigPaths(),
			config.mode === "production" && optimizeCssModules({ apply: "build" }),
		],
		server: {
			port: 3000,
		},
	};
});
