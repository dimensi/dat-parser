<script lang="ts">
import type { CidrEntry } from "$lib/datParser";
import { cidrToString } from "$lib/datParser";

interface Props {
	cidrs: CidrEntry[];
	searchQuery?: string;
}

let { cidrs = [], searchQuery = "" }: Props = $props();

const PAGE_SIZES = [100, 200, 500] as const;
let pageSize = $state(200);
let currentPage = $state(1);

const strings = $derived(cidrs.map((c) => cidrToString(c.ip, c.prefix)));
const filtered = $derived(
	searchQuery.trim()
		? strings.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
		: strings,
);

const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
const page = $derived(Math.min(currentPage, totalPages));
const slice = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

$effect(() => {
	searchQuery;
	cidrs.length;
	currentPage = 1;
});
</script>

{#if filtered.length === 0}
	<p class="text-sm text-slate-500 dark:text-slate-400">
		{searchQuery ? 'Нет совпадений' : 'Нет CIDR'}
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
			<table class="w-full min-w-[280px] text-left text-sm">
				<thead>
					<tr class="border-b border-slate-200 dark:border-slate-700">
						<th class="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">CIDR</th>
					</tr>
				</thead>
				<tbody>
					{#each slice as cidrStr, i (`${(page - 1) * pageSize + i}-${cidrStr}`)}
						<tr class="border-b border-slate-100 dark:border-slate-800">
							<td class="py-2 font-mono text-slate-800 dark:text-slate-200">
								{cidrStr}
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
