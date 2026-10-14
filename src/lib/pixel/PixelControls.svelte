<script lang="ts">
	import { palettes, type PaletteId } from './palettes';
	import { aaModes, hoverModes, pixel, PIXEL_MAX, PIXEL_MIN } from './settings.svelte';

	let { compact = false }: { compact?: boolean } = $props();

	const paletteIds = Object.keys(palettes) as PaletteId[];
</script>

<div class="controls" class:compact>
	<label class="row">
		<span class="k">pixel</span>
		<input
			type="range"
			min={PIXEL_MIN}
			max={PIXEL_MAX}
			step="1"
			value={pixel.pixelSize}
			oninput={(e) => pixel.setPixelSize(+e.currentTarget.value)}
		/>
		<span class="v">{pixel.pixelSize}px</span>
	</label>

	<div class="row">
		<span class="k">sampling</span>
		<div class="seg">
			{#each aaModes as m}
				<button class:on={pixel.aa === m} onclick={() => (pixel.aa = m)}>{m}</button>
			{/each}
		</div>
	</div>

	<div class="row">
		<span class="k">palette</span>
		<div class="seg">
			{#each paletteIds as id}
				<button class:on={pixel.palette === id} onclick={() => (pixel.palette = id)}>
					{palettes[id].label}
				</button>
			{/each}
		</div>
	</div>

	<div class="row">
		<span class="k">dither</span>
		<div class="seg">
			<button class:on={pixel.dither} onclick={() => (pixel.dither = !pixel.dither)}>
				{pixel.dither ? 'bayer' : 'off'}
			</button>
		</div>
		{#if pixel.dither}
			<input
				type="range"
				min="0.1"
				max="1"
				step="0.05"
				bind:value={pixel.ditherStrength}
				aria-label="dither strength"
			/>
		{/if}
	</div>

	<label class="row">
		<span class="k">grid</span>
		<input type="range" min="0" max="0.6" step="0.02" bind:value={pixel.grid} />
		<span class="v">{Math.round(pixel.grid * 100)}%</span>
	</label>

	<div class="row">
		<span class="k">hover</span>
		<div class="seg">
			{#each hoverModes as m}
				<button class:on={pixel.hover === m} onclick={() => (pixel.hover = m)}>{m}</button>
			{/each}
		</div>
	</div>

	<div class="row">
		<span class="k">pipeline</span>
		<div class="seg">
			<button class:on={pixel.enabled} onclick={() => (pixel.enabled = !pixel.enabled)}>
				{pixel.enabled ? 'on' : 'bypassed'}
			</button>
			<button onclick={() => pixel.reset()}>reset</button>
		</div>
	</div>

	{#if !compact}
		<p class="keys">
			keys: <kbd>[</kbd><kbd>]</kbd> size · <kbd>p</kbd> palette · <kbd>a</kbd> sampling ·
			<kbd>d</kbd> dither · <kbd>h</kbd> hover · <kbd>b</kbd> bypass
		</p>
	{/if}
</div>

<style>
	.controls {
		display: grid;
		gap: 0.9rem;
		font-family: var(--font-mono);
		font-size: max(0.95rem, var(--small));
		font-weight: 700;
	}
	.compact {
		gap: 0.6rem;
		font-size: 0.95rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.8rem;
	}
	.k {
		width: 6.5em;
		flex: none;
		opacity: 0.7;
	}
	.v {
		min-width: 3.5em;
		text-align: right;
	}
	input[type='range'] {
		flex: 1 1 8rem;
		min-width: 6rem;
		accent-color: var(--ink);
	}
	.seg {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	button {
		font: inherit;
		color: var(--ink);
		background: var(--paper);
		border: 2px solid var(--ink);
		padding: 0.2em 0.6em;
		cursor: pointer;
	}
	button:hover {
		background: #c8c8c8;
	}
	/* active = heavy border + marker; avoids thin light-on-dark text, which ink sampling eats */
	button.on {
		border-width: 4px;
		padding: calc(0.2em - 2px) calc(0.6em - 2px);
	}
	button.on::before {
		content: '■ ';
	}
	.keys {
		margin: 0;
		opacity: 0.7;
		font-size: 0.85em;
		line-height: 1.8;
	}
	kbd {
		font: inherit;
		border: 1.5px solid currentColor;
		padding: 0 0.3em;
		margin: 0 0.1em;
	}
</style>
