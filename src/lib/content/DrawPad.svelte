<!-- A soft-brush sketch pad. Paint in grayscale, watch it come out as pixels. -->
<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let tone = $state(0); // 0 = ink, 1 = paper
	let brush = $state(28);
	let last: { x: number; y: number } | null = null;

	function clear() {
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// a starter gradient so there's something to look at
		const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
		g.addColorStop(0, '#000');
		g.addColorStop(1, '#fff');
		ctx.fillStyle = g;
		ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
	}

	function pos(e: PointerEvent) {
		const r = canvas.getBoundingClientRect();
		return {
			x: ((e.clientX - r.left) / r.width) * canvas.width,
			y: ((e.clientY - r.top) / r.height) * canvas.height
		};
	}

	function dab(x: number, y: number) {
		const v = Math.round(tone * 255);
		const g = ctx.createRadialGradient(x, y, 0, x, y, brush);
		g.addColorStop(0, `rgba(${v},${v},${v},0.5)`);
		g.addColorStop(1, `rgba(${v},${v},${v},0)`);
		ctx.fillStyle = g;
		ctx.fillRect(x - brush, y - brush, brush * 2, brush * 2);
	}

	function down(e: PointerEvent) {
		canvas.setPointerCapture(e.pointerId);
		last = pos(e);
		dab(last.x, last.y);
	}

	function move(e: PointerEvent) {
		if (!last) return;
		const p = pos(e);
		const d = Math.hypot(p.x - last.x, p.y - last.y);
		const steps = Math.max(1, Math.ceil(d / (brush * 0.25)));
		for (let i = 1; i <= steps; i++) {
			dab(last.x + ((p.x - last.x) * i) / steps, last.y + ((p.y - last.y) * i) / steps);
		}
		last = p;
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		clear();
	});
</script>

<div class="pad">
	<canvas
		bind:this={canvas}
		width="640"
		height="400"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={() => (last = null)}
		onpointercancel={() => (last = null)}
	></canvas>
	<div class="tools">
		<button class:on={tone === 0} onclick={() => (tone = 0)}>ink</button>
		<button class:on={tone === 0.5} onclick={() => (tone = 0.5)}>gray</button>
		<button class:on={tone === 1} onclick={() => (tone = 1)}>erase</button>
		<input type="range" min="6" max="80" bind:value={brush} aria-label="brush size" />
		<button onclick={clear}>clear</button>
	</div>
</div>

<style>
	.pad {
		display: grid;
		gap: 0.6rem;
	}
	canvas {
		width: 100%;
		aspect-ratio: 16 / 10;
		border: 3px solid var(--ink);
		touch-action: none;
		cursor: crosshair;
		display: block;
		background: #fff;
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
		font-family: var(--font-mono);
		font-size: var(--small);
		font-weight: 700;
	}
	input {
		flex: 1 1 6rem;
		accent-color: var(--ink);
	}
	button {
		font: inherit;
		background: var(--paper);
		color: var(--ink);
		border: 2px solid var(--ink);
		padding: 0.2em 0.6em;
		cursor: pointer;
	}
	/* active = heavy border + marker; avoids thin light-on-dark text, which ink sampling eats */
	button.on {
		border-width: 4px;
		padding: calc(0.2em - 2px) calc(0.6em - 2px);
	}
	button.on::before {
		content: '■ ';
	}
</style>
