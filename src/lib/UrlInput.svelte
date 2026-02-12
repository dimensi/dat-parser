<script lang="ts">
	import { DEFAULT_ZKEEN_URL } from '$lib/datParser';

	interface Props {
		loading?: boolean;
		onLoad: (url: string) => void;
	}

	let { loading = false, onLoad }: Props = $props();

	let inputUrl = $state(DEFAULT_ZKEEN_URL);

	function submit() {
		const u = inputUrl.trim();
		if (u) onLoad(u);
	}
</script>

<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
	<input
		type="url"
		class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
		placeholder="https://..."
		bind:value={inputUrl}
		disabled={loading}
		onkeydown={(e) => e.key === 'Enter' && submit()}
	/>
	<button
		type="button"
		class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
		disabled={loading}
		onclick={submit}
	>
		{loading ? 'Загрузка…' : 'Загрузить'}
	</button>
</div>
