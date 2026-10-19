import {
	QueryClient,
	queryOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";

import { API_URL } from "./env";

/*
 * The public part of the HessianLabs REST API (no key needed), typed by
 * hand. Shapes follow the API's /v1/openapi.json; keep them in step when the
 * catalog changes.
 */

export type Continent = "EU" | "NA" | "SA" | "AS" | "OC" | "AF";

export interface Provider {
	id: string;
	name: string;
	website: string;
	category: "cloud" | "gpu";
	/** Simulated only: no live adapter exists yet. */
	preview: boolean;
	mode: "live" | "sandbox";
	/** Users can connect their own account for it. */
	connectable: boolean;
	regions: number;
	plans: number;
	fromHourlyMicros: number | null;
}

export interface CatalogPlan {
	/** Globally unique: `${provider}:${slug}` */
	id: string;
	provider: string;
	providerName: string;
	preview: boolean;
	name: string;
	vcpu: number;
	memoryGb: number;
	diskGb: number;
	transferTb: number;
	cpuType: "shared" | "dedicated";
	arch: "x86" | "arm";
	gpu: {
		model: string;
		count: number;
		vramGb: number;
		totalVramGb: number;
	} | null;
	/** Lowest price across the matching regions. */
	priceHourlyMicros: number;
	priceMonthlyMicros: number;
	regions: {
		id: string;
		city: string;
		country: string;
		continent: Continent;
		priceHourlyMicros: number;
	}[];
}

export interface PlanFilters {
	providers?: string[];
	continents?: Continent[];
	minVcpu?: number;
	minMemoryGb?: number;
	maxHourlyUsd?: number;
	cpuType?: "shared" | "dedicated";
	arch?: "x86" | "arm";
	kind?: "cpu" | "gpu" | "any";
	gpuModels?: string[];
	minVramGb?: number;
}

export interface PlanSearch {
	filters?: PlanFilters;
	sort?: "price" | "vcpu" | "memory";
	limit?: number;
}

export interface PlanResults {
	total: number;
	plans: CatalogPlan[];
	updatedAt: string;
}

export type LlmPrecision = "fp16" | "fp8" | "int8" | "int4";

export interface LlmModel {
	id: string;
	name: string;
	paramsB: number;
	precision: LlmPrecision;
	vramGb: number;
}

export interface LlmSizing {
	model: string;
	paramsB: number;
	precision: LlmPrecision;
	vramGb: number;
	plans: CatalogPlan[];
}

export interface Meta {
	/** HessianLabs's fee as a percentage of each server's list price. */
	feePercent: number;
	topup: {
		feePercent: number;
		feeMinMicros: number;
		minUsd: number;
		maxUsd: number;
	};
}

async function request<T>(path: string, body?: unknown): Promise<T> {
	const res = await fetch(
		`${API_URL}/v1${path}`,
		body === undefined
			? undefined
			: {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				},
	);
	if (!res.ok) throw new Error(`${path} answered ${res.status}`);
	return (await res.json()) as T;
}

type Options<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

const read = <T>(path: string) => ({
	queryOptions: (opts: Options<T> = {}) =>
		queryOptions({
			...opts,
			queryKey: [path],
			queryFn: () => request<T>(path),
		}),
});

const send = <I, T>(path: string) => ({
	queryOptions: ({ input, ...opts }: Options<T> & { input: I }) =>
		queryOptions({
			...opts,
			queryKey: [path, input],
			queryFn: () => request<T>(path, input),
		}),
});

export const api = {
	meta: read<Meta>("/meta"),
	catalog: {
		providers: read<Provider[]>("/providers"),
		plans: send<PlanSearch, PlanResults>("/plans/search"),
		llmModels: read<LlmModel[]>("/llm/models"),
		sizeLlm: send<{ model: string; precision?: LlmPrecision }, LlmSizing>(
			"/llm/size",
		),
	},
};

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { staleTime: 60 * 1000 } },
	});
}
