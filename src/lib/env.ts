/** Public URLs, fixed at build time (see .env.example). */

const trim = (url: string) => url.replace(/\/$/, "");

/** The HessianLabs API: REST under /v1, MCP at /mcp. */
export const API_URL = trim(
	import.meta.env.VITE_API_URL ?? "http://localhost:3000",
);
export const MCP_URL = `${API_URL}/mcp`;

/** The dashboard: sign-in, sign-up and everything behind them. */
export const APP_URL = trim(
	import.meta.env.VITE_APP_URL ?? "http://localhost:3001",
);
export const appUrl = (path: string) => `${APP_URL}${path}`;
