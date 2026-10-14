<!--
  Wraps the whole site. Content scrolls inside `.scroller`, while `.stage` (which carries
  the filter) stays fixed to the viewport — so the pixel grid never moves.
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import PixelFilter from './PixelFilter.svelte';
	import PixelControls from './PixelControls.svelte';
	import HoverFx from './HoverFx.svelte';
	import { aaModes, hoverModes, pixel } from './settings.svelte';
	import { sortedPalette, toHex } from './palettes';

	let { children }: { children: Snippet } = $props();

	let mounted = $state(false);
	let hudOpen = $state(false);

	// A fresh id whenever the pipeline changes forces every browser to re-resolve the filter.
	const key = $derived(
		[pixel.pixelSize, pixel.aa, pixel.palette, pixel.dither, pixel.ditherStrength].join('-').replace(/\./g, '_')
	);
	const mainId = $derived(`px-main-${key}`);
	const hudId = $derived(`px-hud-${key}`);
	const hudSize = $derived(Math.min(pixel.pixelSize, 2));

	const pal = $derived(sortedPalette(pixel.palette));
	const dark = $derived(toHex(pal[0]));
	const light = $derived(toHex(pal[pal.length - 1]));
	// thin gap lines look heavy on tiny pixels — fade them in with size
	const gridAlpha = $derived(pixel.grid * Math.min(1, (pixel.pixelSize - 1) / 5));

	onMount(() => {
		pixel.load();
		mounted = true;
	});

	$effect(() => {
		if (mounted) pixel.save();
	});

	$effect(() => {
		document.documentElement.style.background = dark;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark);
	});

	function cycle<T>(list: readonly T[], v: T): T {
		return list[(list.indexOf(v) + 1) % list.length];
	}

	function onKey(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		if (t.closest('input:not([type=range]), textarea, select, [contenteditable]')) return;
		switch (e.key) {
			case '[': case '-': pixel.setPixelSize(pixel.pixelSize - 1); break;
			case ']': case '+': pixel.setPixelSize(pixel.pixelSize + 1); break;
			case 'p': pixel.cyclePalette(); break;
			case 'P': pixel.cyclePalette(-1); break;
			case 'a': pixel.aa = cycle(aaModes, pixel.aa); break;
			case 'd': pixel.dither = !pixel.dither; break;
			case 'h': pixel.hover = cycle(hoverModes, pixel.hover); break;
			case 'b': pixel.enabled = !pixel.enabled; break;
			case 'Escape': hudOpen = false; break;
			default: return;
		}
	}
</script>

<svelte:window onkeydown={onKey} />

<svg class="defs" aria-hidden="true" width="0" height="0">
	<defs>
		<PixelFilter
			id={mainId}
			size={pixel.pixelSize}
			aa={pixel.aa}
			palette={pixel.palette}
			dither={pixel.dither}
			ditherStrength={pixel.ditherStrength}
			opaque
		/>
		<PixelFilter id={hudId} size={hudSize} aa="detail" palette={pixel.palette} />
	</defs>
</svg>

<div
	class="stage"
	style:filter={pixel.enabled ? `url(#${mainId})` : 'none'}
	style:--pal-dark={dark}
	style:--pal-light={light}
	style:--px="{pixel.pixelSize}px"
>
	<div class="scroller">
		{@render children()}
	</div>
	<HoverFx />
</div>

{#if pixel.enabled && gridAlpha > 0}
	<div
		class="grid"
		aria-hidden="true"
		style:--s="{pixel.pixelSize}px"
		style:--c={dark}
		style:opacity={gridAlpha}
	></div>
{/if}

<div class="hud" style:filter={pixel.enabled ? `url(#${hudId})` : 'none'}>
	{#if hudOpen}
		<div class="panel" role="dialog" aria-label="Pixel pipeline settings">
			<PixelControls compact />
		</div>
	{/if}
	<button class="toggle" onclick={() => (hudOpen = !hudOpen)} aria-expanded={hudOpen}>
		{hudOpen ? '× close' : `▦ ${pixel.pixelSize}px`}
	</button>
</div>

<style>
	.defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}

	.stage {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: var(--paper);
		/* keep the filter on its own compositing layer */
		will-change: filter;
	}

	.scroller {
		position: absolute;
		inset: 0;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: none;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: var(--ink) var(--paper);
	}

	.grid {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 50;
		background-image:
			linear-gradient(to right, var(--c) 1px, transparent 1px),
			linear-gradient(to bottom, var(--c) 1px, transparent 1px);
		background-size: var(--s) var(--s);
	}

	.hud {
		position: fixed;
		right: max(12px, env(safe-area-inset-right));
		bottom: max(12px, env(safe-area-inset-bottom));
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		max-width: calc(100vw - 24px);
		/* a bit of padding so the HUD's own pixel grid has room at the edges */
		padding: 3px;
	}

	.panel {
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--ink);
		padding: 1rem;
		width: min(30rem, calc(100vw - 30px));
		max-height: 70dvh;
		overflow: auto;
	}

	.toggle {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
		color: var(--paper);
		background: var(--ink);
		border: 3px solid var(--ink);
		padding: 0.45em 0.8em;
		cursor: pointer;
	}
	.toggle:hover {
		background: var(--paper);
		color: var(--ink);
	}
</style>
