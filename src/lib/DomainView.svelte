<script lang="ts">
	import type { DomainEntry } from '$lib/datParser';
	import { domainTypeName } from '$lib/datParser';

	interface Props {
		domains: DomainEntry[];
		searchQuery?: string;
	}

	let { domains = [], searchQuery = '' }: Props = $props();

	const filtered = $derived(
		searchQuery.trim()
			? domains.filter((d) =>
					d.value.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: domains
	);

	const typeLabel = (type: number) => {
		const t = domainTypeName(type);
		const map: Record<string, string> = {
			Plain: 'keyword',
			Regex: 'regexp',
			RootDomain: 'domain',
			Full: 'full'
		};
		return map[t] ?? String(type);
	};
</script>

{#if filtered.length === 0}
	<p class="text-sm text-slate-500 dark:text-slate-400">
		{searchQuery ? 'Нет совпадений' : 'Нет доменов'}
	</p>
{:else}
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
				{#each filtered as d, i (`${i}-${d.value}-${d.type}`)}
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
{/if}
