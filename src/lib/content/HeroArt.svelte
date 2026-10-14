<!--
  Generative backdrop for the hero: soft glowing blobs drifting around, one follows the pointer.
  Smooth gradients are what make the dither + palette mapping shine.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const SCALE = 0.25;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		let w = 0;
		let h = 0;
		let raf = 0;
		let visible = true;
		const pointer = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45 };

		const blobs = Array.from({ length: 7 }, (_, i) => ({
			ox: Math.random(),
			oy: Math.random(),
			ax: 0.25 + Math.random() * 0.3,
			ay: 0.2 + Math.random() * 0.25,
			fx: 0.05 + Math.random() * 0.08,
			fy: 0.04 + Math.random() * 0.07,
			r: 0.18 + Math.random() * 0.22,
			v: 0.35 + (i % 3) * 0.2
		}));

		function resize() {
			const rect = canvas.getBoundingClientRect();
			w = Math.max(1, Math.ceil(rect.width * SCALE));
			h = Math.max(1, Math.ceil(rect.height * SCALE));
			canvas.width = w;
			canvas.height = h;
		}

		function blob(x: number, y: number, r: number, v: number) {
			const g = ctx.createRadialGradient(x, y, 0, x, y, r);
			g.addColorStop(0, `rgba(255,255,255,${v})`);
			g.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.fillStyle = g;
			ctx.fillRect(x - r, y - r, r * 2, r * 2);
		}

		function frame(now: number) {
			raf = requestAnimationFrame(frame);
			if (!visible) return;
			const t = (reduced ? now * 0.15 : now) / 1000;
			const m = Math.min(w, h);

			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, w, h);
			ctx.globalCompositeOperation = 'lighter';

			for (const b of blobs) {
				const x = (b.ox + Math.sin(t * b.fx * 6.28) * b.ax) * w;
				const y = (b.oy + Math.cos(t * b.fy * 6.28) * b.ay) * h;
				blob(x, y, b.r * Math.max(w, h), b.v);
			}

			pointer.x += (pointer.tx - pointer.x) * 0.06;
			pointer.y += (pointer.ty - pointer.y) * 0.06;
			blob(pointer.x * w, pointer.y * h, m * 0.55, 0.9);

			// slow orbiting ring
			ctx.globalCompositeOperation = 'difference';
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = Math.max(2, m * 0.035);
			ctx.beginPath();
			const rr = m * (0.32 + Math.sin(t * 0.7) * 0.04);
			ctx.ellipse(w * 0.5, h * 0.5, rr * 1.4, rr, t * 0.25, 0, Math.PI * 2);
			ctx.stroke();
		}

		const onMove = (e: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			pointer.tx = (e.clientX - rect.left) / rect.width;
			pointer.ty = (e.clientY - rect.top) / rect.height;
		};

		const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		io.observe(canvas);
		const ro = new ResizeObserver(resize);
		ro.observe(canvas);
		addEventListener('pointermove', onMove, { passive: true });
		resize();
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			ro.disconnect();
			removeEventListener('pointermove', onMove);
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
