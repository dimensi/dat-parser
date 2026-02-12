<script lang="ts">
	interface Props {
		onFile: (file: File) => void;
		disabled?: boolean;
	}

	let { onFile, disabled = false }: Props = $props();

	let dragging = $state(false);

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (disabled) return;
		const file = e.dataTransfer?.files?.[0];
		if (file) onFile(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled) dragging = true;
	}

	function handleDragLeave() {
		dragging = false;
	}

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) onFile(file);
		input.value = '';
	}
</script>

<div
	class="rounded-xl border-2 border-dashed transition-colors {dragging
		? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30'
		: 'border-slate-300 dark:border-slate-600'} {disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLElement).click()}
>
	<label class="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 px-4 py-6">
		<input
			type="file"
			accept=".dat"
			class="sr-only"
			onchange={handleChange}
			disabled={disabled}
		/>
		<span class="text-4xl" aria-hidden="true">📁</span>
		<span class="text-sm font-medium text-slate-600 dark:text-slate-400">
			Перетащите .dat файл сюда или нажмите для выбора
		</span>
	</label>
</div>
