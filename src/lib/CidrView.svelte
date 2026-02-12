<script lang="ts">
	import type { CidrEntry } from '$lib/datParser';
	import { cidrToString } from '$lib/datParser';

	interface Props {
		cidrs: CidrEntry[];
		searchQuery?: string;
	}

	let { cidrs = [], searchQuery = '' }: Props = $props();

	const strings = $derived(cidrs.map((c) => cidrToString(c.ip, c.prefix)));
	const filtered = $derived(
		searchQuery.trim()
			? strings.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
			: strings
	);
</script>

{#if filtered.length === 0}
	<p class="text-sm text-slate-500 dark:text-slate-400">
		{searchQuery ? 'Нет совпадений' : 'Нет CIDR'}
	</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full min-w-[280px] text-left text-sm">
			<thead>
				<tr class="border-b border-slate-200 dark:border-slate-700">
					<th class="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">CIDR</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as cidrStr, i (i)}
					<tr class="border-b border-slate-100 dark:border-slate-800">
						<td class="py-2 font-mono text-slate-800 dark:text-slate-200">
							{cidrStr}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
