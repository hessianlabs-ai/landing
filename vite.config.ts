import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const REQUIRED = ["VITE_API_URL", "VITE_APP_URL"];

export default defineConfig(({ command, mode }) => {
	// Development falls back to localhost; a production build must know where
	// the API and the dashboard live.
	const env = loadEnv(mode, ".", "VITE_");
	const missing = REQUIRED.filter((name) => !env[name]);
	if (command === "build" && mode === "production" && missing.length) {
		throw new Error(`Set ${missing.join(" and ")} to build (see .env.example)`);
	}
	return {
		server: { port: 3002 },
		resolve: { tsconfigPaths: true },
		plugins: [tailwindcss(), tanstackStart(), viteReact()],
	};
});
