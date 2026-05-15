import { defineConfig, loadEnv } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
// import vueJsx from "@vitejs/plugin-vue-jsx";
import unocss from "unocss/vite";
import vueSetupExtend from "vite-plugin-vue-setup-extend";
// import viteCompression from "vite-plugin-compression";
import mockDevServerPlugin from "vite-plugin-mock-dev-server";
import removeConsole from "vite-plugin-remove-console";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import { createHtmlPlugin } from "vite-plugin-html";
import { fileURLToPath, URL } from "node:url";
import { enableCDN } from "/@/utils/cdn";
import viewport from "postcss-mobile-forever";
import autoprefixer from "autoprefixer";

// 当前工作目录路径
const root = process.cwd();

// https://cn.vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, root); // 加载环境变量
	const { VITE_API_URL, VITE_BASE_API, VITE_BARREL } = env;
	return {
		plugins: [
			vue(),
			// vueJsx(),
			unocss(),
			vueSetupExtend(), // 允许 setup 语法糖上添加组件名属性
			// viteCompression(), // 生产环境 gzip 压缩资源
			mockDevServerPlugin(), // 开发环境的 Mock 服务
			enableCDN(env.VITE_CDN_DEPS), // 是否启用 CDN 加速
			removeConsole({ includes: ["log", "warn", "info"] }), // 生产环境移除指定的 console 语句
			// vant 组件自动按需引入
			Components({
				dts: "src/types/components.d.ts", // 生成的 d.ts 文件路径
				resolvers: [VantResolver()], // 指定解析器
			}),
			// 自动注册 Svg Icon 组件
			createSvgIconsPlugin({
				iconDirs: [path.resolve(root, "src/icons/svg")], // 指定图标文件夹
				symbolId: "icon-[dir]-[name]", // 指定 symbolId 格式
			}),
			// 控制是否注入 ERUDA 调试工具至 index.html
			createHtmlPlugin({
				inject: {
					data: {
						ENABLE_ERUDA: env.VITE_ENABLE_ERUDA || "false",
					},
				},
			}),
		],
		base: command === "serve" ? "/" : env.VITE_PUBLIC_PATH,
		resolve: {
			alias: {
				"/@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		server: {
			hmr: true, // 热更新
			open: true, // 自动打开浏览器
			host: "0.0.0.0",
			port: env.VITE_DEV_PORT as any,
			proxy: {
				"/mock": { target: "" }, // Mock 专用: https://github.com/pengzhanbo/vite-plugin-mock-dev-server
				[VITE_BASE_API]: {
					target: VITE_API_URL,
					ws: true,
					changeOrigin: true,
				},
				[VITE_BARREL]: {
					target: VITE_API_URL,
					ws: true,
					changeOrigin: true,
				},
			},
		},
		css: {
			postcss: {
				plugins: [
					autoprefixer(),
					viewport({
						appSelector: "#app",
						viewportWidth: 375,
						maxDisplayWidth: 600,
					}),
				],
			},
		},
		build: {
			outDir: "dist",
			rollupOptions: {
				output: {
					chunkFileNames: "static/js/[name]-[hash].js",
					entryFileNames: "static/js/[name]-[hash].js",
					assetFileNames: "static/[ext]/[name]-[hash].[ext]",
					manualChunks(id) {
						if (id.includes("node_modules")) {
							return id.toString().split("node_modules/")[1].split("/")[0].toString();
						}
					},
				},
			},
		},
		define: {
			__PROJ_VERSION__: JSON.stringify(process.env.npm_package_version),
			__PROJ_NAME__: JSON.stringify(process.env.npm_package_name),
		},
	};
});
