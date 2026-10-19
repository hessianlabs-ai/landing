/** `$0.0123` for sub-cent amounts, `$12.34` otherwise. Money is micro-USD. */
export function formatUsd(
	micros: number,
	opts: { precise?: boolean } = {},
): string {
	const usd = micros / 1_000_000;
	const abs = Math.abs(usd);
	const digits = opts.precise || (abs > 0 && abs < 0.1) ? 4 : 2;
	return `${usd < 0 ? "-" : ""}$${abs.toFixed(digits)}`;
}

export const flag = (country: string) =>
	country
		.toUpperCase()
		.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
