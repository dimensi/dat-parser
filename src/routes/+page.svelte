<script lang="ts">
	import FileDropZone from '$lib/FileDropZone.svelte';
	import UrlInput from '$lib/UrlInput.svelte';
	import CategoryList from '$lib/CategoryList.svelte';
	import DomainView from '$lib/DomainView.svelte';
	import CidrView from '$lib/CidrView.svelte';
	import {
		parseDatFileAuto,
		loadFromUrl,
		type DatFileResult,
		type GeoSiteEntry,
		type DomainEntry
	} from '$lib/datParser';

	let fileData = $state<DatFileResult | null>(null);
	let selectedCategory = $state<string | null>(null);
	let searchQuery = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	const entries = $derived(fileData?.data?.entry ?? []);
	const selectedEntry = $derived(
		selectedCategory
			? entries.find((e) => e.countryCode === selectedCategory) ?? null
			: null
	);
	const domains = $derived(
		fileData?.kind === 'geosite'
			? ((selectedEntry as GeoSiteEntry)?.domain ?? []) as DomainEntry[]
			: []
	);
	const cidrs = $derived(
		fileData?.kind === 'geoip' ? (selectedEntry?.cidr ?? []) : []
	);

	async function handleFile(file: File) {
		error = null;
		try {
			const buffer = await file.arrayBuffer();
			const result = parseDatFileAuto(buffer);
			fileData = result;
			selectedCategory = result.data.entry?.[0]?.countryCode ?? null;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	async function handleLoadUrl(url: string) {
		error = null;
		loading = true;
		try {
			let buffer: ArrayBuffer;
			try {
				const data = await loadFromUrl(url);
				fileData = { kind: 'geosite', data };
				selectedCategory = data.entry?.[0]?.countryCode ?? null;
				return;
			} catch (e) {
				const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
				const res = await fetch(proxyUrl);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				buffer = await res.arrayBuffer();
			}
			const result = parseDatFileAuto(buffer);
			fileData = result;
			selectedCategory = result.data.entry?.[0]?.countryCode ?? null;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	function selectCategory(code: string) {
		selectedCategory = code;
	}
</script>

<div class="mx-auto max-w-6xl space-y-8 px-4 py-8">
	<header class="space-y-2">
		<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
			XKeen DAT Parser
		</h1>
		<p class="text-sm text-slate-600 dark:text-slate-400">
			Просмотр категорий и доменов (GeoSite) или CIDR (GeoIP) из .dat файлов
		</p>
	</header>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
			Загрузить .dat файл
		</h2>
		<div class="grid gap-6 sm:grid-cols-2">
			<div class="space-y-2">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">
					Локальный файл
				</p>
				<FileDropZone onFile={handleFile} disabled={loading} />
			</div>
			<div class="space-y-2">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">
					По URL
				</p>
				<UrlInput loading={loading} onLoad={handleLoadUrl} />
			</div>
		</div>
		{#if error}
			<div
				class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
				role="alert"
			>
				{error}
			</div>
		{/if}
	</section>

	{#if fileData?.data?.entry?.length}
		<section class="grid gap-6 lg:grid-cols-[240px_1fr]">
			<div class="space-y-2">
				<h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
					Категории
				</h2>
				<CategoryList
					entries={entries}
					selected={selectedCategory}
					onSelect={selectCategory}
				/>
			</div>
			<div class="min-w-0 space-y-4">
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
						{fileData.kind === 'geosite' ? 'Домены' : 'CIDR'}
						{#if selectedCategory}
							<span class="font-mono text-sky-600 dark:text-sky-400">
								{selectedCategory}
							</span>
						{/if}
					</h2>
					<input
						type="search"
						class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
						placeholder={fileData.kind === 'geosite' ? 'Поиск по доменам…' : 'Поиск по CIDR…'}
						bind:value={searchQuery}
					/>
				</div>
				{#if fileData.kind === 'geosite'}
					<DomainView domains={domains} searchQuery={searchQuery} />
				{:else}
					<CidrView cidrs={cidrs} searchQuery={searchQuery} />
				{/if}
			</div>
		</section>
	{:else if !loading && !error}
		<p class="text-sm text-slate-500 dark:text-slate-400">
			Загрузите .dat файл (GeoSite или GeoIP) или введите URL.
		</p>
	{/if}
</div>
