<!--
  The rendering pipeline, as an SVG filter applied to live DOM via CSS `filter: url(#id)`.

  SourceGraphic
    → sampling mode              detail pooling / blur / none
    → sample 1 px per cell       grid of dots, `in`-composited with the source
    → dilate dots to full cells  feMorphology (+ 2×2 box convolution for even sizes)
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

	/** Rec. 709 luminance weights, as matrix columns R G B. */
	const LUM = [0.2126, 0.7152, 0.0722];
	const lumRow = (k: number, offset: number) => `${LUM.map((w) => w * k).join(' ')} 0 ${offset}`;
	/** detail: pack each pixel as (L, 1 − L, 1, 1) so one erode yields min L and 1 − max L. */
	const PACK = `${lumRow(1, 0)}  ${lumRow(-1, 1)}  0 0 0 0 1  0 0 0 0 1`;
	/** detail: threshold the surrounding luminance at 128/255 into (light, dark, dark, 1), each 0 or 1. */
	const MASK = `${lumRow(255, -127)}  ${lumRow(-255, 128)}  ${lumRow(-255, 128)}  0 0 0 0 1`;
	/** Final luminance. detail's src is (light·minL, dark·(1 − maxL), dark), so R − G + B picks the pooled tone. */
	const TO_GRAY = $derived(aa === 'detail' ? '1 -1 1 0 0' : `${LUM.join(' ')} 0 0`);

	const s = $derived(Math.max(1, Math.round(size)));
	const r = $derived(Math.floor((s - 1) / 2));
	const even = $derived(s % 2 === 0);
	const blur = $derived(aa === 'average' ? s * 0.32 : aa === 'soft' ? s * 0.15 : 0);
	const poolIn = $derived(even ? 'pack2' : 'pack');

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

		  Perf: in Chromium a result consumed twice costs as if re-rendered per consumer, so the only joins sit on the
		  cheap packed image — never downstream of the blur or the erode.
		-->
		<feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(4, s * 1.5)} edgeMode="duplicate" result="avg" />
		<feColorMatrix in="avg" type="matrix" values={MASK} result="mask" />
		<feColorMatrix in="SourceGraphic" type="matrix" values={PACK} result="pack" />
		<!-- min over the cell; the erode window is [0, 2r], so even sizes pre-min one more column/row -->
		{#if even}
			<feOffset in="pack" dx="-1" dy="0" result="packX" />
			<feBlend in="pack" in2="packX" mode="darken" result="pack1" />
			<feOffset in="pack1" dx="0" dy="-1" result="packY" />
			<feBlend in="pack1" in2="packY" mode="darken" result="pack2" />
		{/if}
		{#if r > 0}
			<feMorphology in={poolIn} operator="erode" radius={r} result="pooled" />
		{/if}
		<!-- multiply by the mask → (light·minL, dark·(1 − maxL), dark); TO_GRAY resolves it -->
		<feComposite in={r > 0 ? 'pooled' : poolIn} in2="mask" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="src" />
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

	<!--
	  grow every dot to fill its cell. Even sizes first widen each dot to 2×2 with a box
	  convolution (exact: every window holds a single dot), so the dilate lands on exactly s.
	-->
	{#if even}
		<feConvolveMatrix
			in="samples"
			order="2"
			kernelMatrix="1 1 1 1"
			divisor="1"
			targetX="1"
			targetY="1"
			edgeMode="none"
			preserveAlpha="false"
			result="samples2"
		/>
	{/if}
	{#if r > 0}
		<feMorphology in={even ? 'samples2' : 'samples'} operator="dilate" radius={r} result="blocks" />
	{:else}
		<feOffset in={even ? 'samples2' : 'samples'} dx="0" dy="0" result="blocks" />
	{/if}

	<!-- to luminance -->
	<feColorMatrix
		in="blocks"
		type="matrix"
		values="{TO_GRAY}  {TO_GRAY}  {TO_GRAY}  0 0 0 1 0"
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
	<feComponentTransfer in="toned" result="mapped">
		<feFuncR type="discrete" tableValues={table(0)} />
		<feFuncG type="discrete" tableValues={table(1)} />
		<feFuncB type="discrete" tableValues={table(2)} />
		{#if opaque}
			<feFuncA type="linear" slope="0" intercept="1" />
		{/if}
	</feComponentTransfer>
	{#if aa === 'detail' && !opaque}
		<!-- detail works on an opaque packed image, so restore the source's coverage -->
		<feComposite in="mapped" in2="SourceGraphic" operator="in" />
	{/if}
</filter>
