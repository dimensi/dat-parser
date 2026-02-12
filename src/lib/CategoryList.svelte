<script lang="ts">
	/** GeoSiteEntry | GeoIPEntry — both have countryCode and domain[] or cidr[]. */
	type CategoryEntry = { countryCode: string; domain?: unknown[]; cidr?: unknown[] };

	interface Props {
		entries: CategoryEntry[];
		selected: string | null;
		onSelect: (countryCode: string) => void;
		/** Filter categories by name (optional). */
		categoryFilter?: string;
	}

	let { entries, selected, onSelect, categoryFilter = '' }: Props = $props();

	const fullList = $derived(
		entries
			.filter((e) => e.countryCode)
			.map((e) => ({
				code: e.countryCode,
				count: e.domain?.length ?? e.cidr?.length ?? 0
			}))
			.sort((a, b) => a.code.localeCompare(b.code))
	);

	const list = $derived(
		categoryFilter.trim()
			? fullList.filter((item) =>
					item.code.toLowerCase().includes(categoryFilter.toLowerCase())
				)
			: fullList
	);
</script>

{#if fullList.length === 0}
	<p class="text-sm text-slate-500 dark:text-slate-400">Нет категорий</p>
{:else}
	{#if list.length === 0}
		<p class="text-sm text-slate-500 dark:text-slate-400">
			Нет категорий по запросу «{categoryFilter}»
		</p>
	{:else}
		<ul class="flex flex-col gap-1" role="list">
		{#each list as { code, count } (code)}
			<li>
				<button
					type="button"
					class="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors {selected === code
						? 'bg-sky-100 font-medium text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'
						: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}"
					onclick={() => onSelect(code)}
				>
					<span class="font-mono">{code}</span>
					<span class="ml-2 text-slate-500 dark:text-slate-400">({count})</span>
				</button>
			</li>
		{/each}
	</ul>
	{/if}
{/if}
