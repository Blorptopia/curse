import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, type ConfigEnv } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ENTRYPOINTS = [
	"index.html",
	"game.html",
	"game-over.html"
];


const config = defineConfig({
	mode: "mpa",
	plugins: [cloudflare()],
});

function createInputFiles(): Record<string, string> {
	const inputs: Record<string, string> = {};
	for (const [index, entrypoint] of ENTRYPOINTS.entries()) {
		inputs[index.toString()] = resolve(__dirname, entrypoint);
	}
	return inputs;
}

export default defineConfig((env: ConfigEnv) => {
	if (env.mode === "production") {
		return {
			...config,
			build: {
				rollupOptions: {
					input: createInputFiles()
				}
			}
		}
	}
	return config;
});
