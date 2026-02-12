<script lang="ts">
import type { DomainEntry } from "$lib/datParser";
import { domainTypeName } from "$lib/datParser";

interface Props {
	domains: DomainEntry[];
	searchQuery?: string;
}

let { domains = [], searchQuery = "" }: Props = $props();

const PAGE_SIZES = [100, 200, 500] as const;
let pageSize = $state(200);
let currentPage = $state(1);

const filtered = $derived(
	searchQuery.trim()
		? domains.filter((d) =>
				d.value.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: domains,
);

const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
const page = $derived(Math.min(currentPage, totalPages));
const slice = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

$effect(() => {
	searchQuery;
	domains.length;
	currentPage = 1;
});

const typeLabel = (type: number) => {
	const t = domainTypeName(type);
	const map: Record<string, string> = {
		Plain: "keyword",
		Regex: "regexp",
		RootDomain: "domain",
		Full: "full",
	};
	return map[t] ?? String(type);
};
</script>

{#if filtered.length === 0}
	<p class="text-sm text-slate-500 dark:text-slate-400">
		{searchQuery ? 'Нет совпадений' : 'Нет доменов'}
	</p>
{:else}
	<div class="space-y-2">
		<div class="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
			<span>Строк на странице:</span>
			{#each PAGE_SIZES as size}
				<button
					type="button"
					class="rounded px-2 py-1 {pageSize === size
						? 'bg-sky-100 font-medium text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'
						: 'hover:bg-slate-100 dark:hover:bg-slate-800'}"
					onclick={() => {
						pageSize = size;
						currentPage = 1;
					}}
				>
					{size}
				</button>
			{/each}
			<span class="ml-auto">
				Страница {page} из {totalPages} · всего {filtered.length.toLocaleString()}
			</span>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full min-w-[320px] text-left text-sm">
				<thead>
					<tr class="border-b border-slate-200 dark:border-slate-700">
						<th class="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Домен</th>
						<th class="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Тип</th>
						<th class="py-2 font-medium text-slate-600 dark:text-slate-400">Атрибуты</th>
					</tr>
				</thead>
				<tbody>
					{#each slice as d, i (`${(page - 1) * pageSize + i}-${d.value}-${d.type}`)}
						<tr class="border-b border-slate-100 dark:border-slate-800">
							<td class="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
								{d.value}
							</td>
							<td class="py-2 pr-4 text-slate-600 dark:text-slate-400">
								{typeLabel(d.type)}
							</td>
							<td class="py-2 text-slate-500 dark:text-slate-500">
								{#if d.attribute?.length}
									{d.attribute.map((a) => `@${a.key}`).join(' ')}
								{:else}
									—
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
				disabled={page <= 1}
				onclick={() => (currentPage = page - 1)}
			>
				Назад
			</button>
			<button
				type="button"
				class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
				disabled={page >= totalPages}
				onclick={() => (currentPage = page + 1)}
			>
				Вперёд
			</button>
		</div>
	</div>
{/if}
