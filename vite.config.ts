import {
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
	vitePlugin as remixVitePlugin,
} from "@remix-run/dev";
import UnoCSS from "unocss/vite";
import { defineConfig, type ViteDevServer } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { optimizeCssModules } from "vite-plugin-optimize-css-modules";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => {
	return {
		define: {
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
		logLevel: "error",
		build: {
			target: "esnext",
		},
		plugins: [
			nodePolyfills({
				include: ["path", "buffer"],
			}),
			config.mode !== "test" && remixCloudflareDevProxy(),
			remixVitePlugin({
				// serverPlatform: "cloudflare",
				// serverModuleFormat: "esm",
			}),
			UnoCSS(),
			tsconfigPaths(),
			config.mode === "production" && optimizeCssModules({ apply: "build" }),
		],
	};
});
