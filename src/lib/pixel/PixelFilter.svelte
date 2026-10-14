<!--
  The rendering pipeline, as an SVG filter applied to live DOM via CSS `filter: url(#id)`.

  SourceGraphic
    → sampling mode              detail pooling / blur / none
    → sample 1 px per cell       grid of dots, `in`-composited with the source
    → dilate dots to full cells  feMorphology (+ 1px merge for even sizes)
    → luminance                  feColorMatrix
    → (optional) ordered dither  4×4 Bayer tile, added arithmetically
    → palette gradient map       feComponentTransfer, discrete

  Primitive coordinates are relative to the filtered element's box, so if that element
  is fixed to the viewport the grid is fixed too — content scrolls *through* it.
-->
<script lang="ts">
	import { sortedPalette, type PaletteId } from './palettes';
	import type { AAMode } from './settings.svelte';

	interface Props {
		id: string;
		size: number;
		aa?: AAMode;
		palette?: PaletteId;
		dither?: boolean;
		ditherStrength?: number;
		/** Force output fully opaque (use for full-screen layers). */
		opaque?: boolean;
	}

	let {
		id,
		size,
		aa = 'nearest',
		palette = 'mono',
		dither = false,
		ditherStrength = 0.6,
		opaque = false
	}: Props = $props();

	const BAYER = [
		[0, 8, 2, 10],
		[12, 4, 14, 6],
		[3, 11, 1, 9],
		[15, 7, 13, 5]
	];

	const s = $derived(Math.max(1, Math.round(size)));
	const r = $derived(Math.floor((s - 1) / 2));
	const even = $derived(s % 2 === 0);
	const blur = $derived(aa === 'average' ? s * 0.32 : aa === 'soft' ? s * 0.15 : 0);

	const colors = $derived(sortedPalette(palette));
	const table = (ch: 0 | 1 | 2) => colors.map((c) => c[ch].toFixed(4)).join(' ');
	const ditherAmt = $derived(ditherStrength / Math.max(1, colors.length - 1));

	const bayerCells = $derived(
		BAYER.flatMap((row, y) =>
			row.map((v, x) => ({ x: x * s, y: y * s, g: Math.round(((v + 0.5) / 16) * 255) }))
		)
	);
</script>

<filter
	{id}
	x="0"
	y="0"
	width="100%"
	height="100%"
	filterUnits="objectBoundingBox"
	primitiveUnits="userSpaceOnUse"
	color-interpolation-filters="sRGB"
>
	{#if aa === 'detail'}
		<!--
		  Detail pooling: the minority tone of the surroundings wins. Cells in light areas take their darkest
		  pixel (min-pool), cells in dark areas their lightest (max-pool) — so thin strokes survive
		  whether they're dark-on-light or light-on-dark.
		-->
		<feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(4, s * 1.5)} edgeMode="duplicate" result="avg" />
		<feColorMatrix
			in="avg"
			type="matrix"
			values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.2126 0.7152 0.0722 0 0"
			result="avgLum"
		/>
		<feComponentTransfer in="avgLum" result="lightMask">
			<feFuncA type="discrete" tableValues="0 1" />
		</feComponentTransfer>
		<!-- min/max over the cell; the window is [0, 2r], so even sizes need one more column/row -->
		<feMorphology in="SourceGraphic" operator="erode" radius={Math.max(r, 0.001)} result={even ? 'lo0' : 'lo'} />
		<feMorphology in="SourceGraphic" operator="dilate" radius={Math.max(r, 0.001)} result={even ? 'hi0' : 'hi'} />
		{#if even}
			<feOffset in="lo0" dx="-1" dy="0" result="loX" />
			<feBlend in="lo0" in2="loX" mode="darken" result="lo1" />
			<feOffset in="lo1" dx="0" dy="-1" result="loY" />
			<feBlend in="lo1" in2="loY" mode="darken" result="lo" />
			<feOffset in="hi0" dx="-1" dy="0" result="hiX" />
			<feBlend in="hi0" in2="hiX" mode="lighten" result="hi1" />
			<feOffset in="hi1" dx="0" dy="-1" result="hiY" />
			<feBlend in="hi1" in2="hiY" mode="lighten" result="hi" />
		{/if}
		<feComposite in="lo" in2="lightMask" operator="in" result="loPart" />
		<feComposite in="hi" in2="lightMask" operator="out" result="hiPart" />
		<feMerge result="src">
			<feMergeNode in="loPart" />
			<feMergeNode in="hiPart" />
		</feMerge>
	{:else if blur > 0}
		<feGaussianBlur in="SourceGraphic" stdDeviation={blur} edgeMode="duplicate" result="src" />
	{:else}
		<feOffset in="SourceGraphic" dx="0" dy="0" result="src" />
	{/if}

	<!-- one sample dot per cell, tiled over the whole element -->
	<feFlood flood-color="#000" flood-opacity="1" x={r} y={r} width="1" height="1" result="dot" />
	<feComposite in="dot" in2="dot" operator="over" x="0" y="0" width={s} height={s} result="cell" />
	<feTile in="cell" result="dots" />
	<feComposite in="src" in2="dots" operator="in" result="samples" />

	<!-- grow every dot to fill its cell -->
	{#if r > 0}
		<feMorphology in="samples" operator="dilate" radius={r} result="grown" />
	{:else}
		<feOffset in="samples" dx="0" dy="0" result="grown" />
	{/if}
	{#if even}
		<feOffset in="grown" dx="1" dy="0" result="gx" />
		<feMerge result="growx">
			<feMergeNode in="grown" />
			<feMergeNode in="gx" />
		</feMerge>
		<feOffset in="growx" dx="0" dy="1" result="gy" />
		<feMerge result="blocks">
			<feMergeNode in="growx" />
			<feMergeNode in="gy" />
		</feMerge>
	{:else}
		<feOffset in="grown" dx="0" dy="0" result="blocks" />
	{/if}

	<!-- to luminance -->
	<feColorMatrix
		in="blocks"
		type="matrix"
		values="0.2126 0.7152 0.0722 0 0
		        0.2126 0.7152 0.0722 0 0
		        0.2126 0.7152 0.0722 0 0
		        0      0      0      1 0"
		result="lum"
	/>

	{#if dither}
		{#each bayerCells as c (c.x + ':' + c.y)}
			<feFlood
				flood-color="rgb({c.g},{c.g},{c.g})"
				x={c.x}
				y={c.y}
				width={s}
				height={s}
				result="b{c.x}_{c.y}"
			/>
		{/each}
		<feMerge x="0" y="0" width={s * 4} height={s * 4} result="bayerTile">
			{#each bayerCells as c (c.x + ':' + c.y)}
				<feMergeNode in="b{c.x}_{c.y}" />
			{/each}
		</feMerge>
		<feTile in="bayerTile" result="bayer" />
		<feComposite
			in="lum"
			in2="bayer"
			operator="arithmetic"
			k1="0"
			k2="1"
			k3={ditherAmt}
			k4={-ditherAmt / 2}
			result="toned"
		/>
	{:else}
		<feOffset in="lum" dx="0" dy="0" result="toned" />
	{/if}

	<!-- gradient-map into the palette -->
	<feComponentTransfer in="toned">
		<feFuncR type="discrete" tableValues={table(0)} />
		<feFuncG type="discrete" tableValues={table(1)} />
		<feFuncB type="discrete" tableValues={table(2)} />
		{#if opaque}
			<feFuncA type="linear" slope="0" intercept="1" />
		{/if}
	</feComponentTransfer>
</filter>
