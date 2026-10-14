<!--
  Pointer effects. Lives *inside* the filtered stage (but outside the scroller), so
  whatever it draws is pixelated, palette-mapped and locked to the same static grid.
  Drawing in white with `mix-blend-mode: difference` inverts the content underneath.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { pixel } from './settings.svelte';

	let canvas: HTMLCanvasElement;

	type Blob = { x: number; y: number; t: number };
	type Ring = { x: number; y: number; t: number };

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const SCALE = 0.5; // the pipeline pixelates anyway — render at half res
		let w = 0;
		let h = 0;
		let raf = 0;

		const trail: Blob[] = [];
		const rings: Ring[] = [];
		const cursor = { x: -999, y: -999, sx: -999, sy: -999, inside: false };

		function resize() {
			w = innerWidth;
			h = innerHeight;
			canvas.width = Math.ceil(w * SCALE);
			canvas.height = Math.ceil(h * SCALE);
		}

		function move(x: number, y: number) {
			if (!cursor.inside) {
				cursor.sx = x;
				cursor.sy = y;
			}
			cursor.x = x;
			cursor.y = y;
			cursor.inside = true;
			const last = trail[trail.length - 1];
			if (!last || Math.hypot(last.x - x, last.y - y) > 6) trail.push({ x, y, t: performance.now() });
		}

		const onPointerMove = (e: PointerEvent) => move(e.clientX, e.clientY);
		const onTouchMove = (e: TouchEvent) => {
			const t = e.touches[0];
			if (t) move(t.clientX, t.clientY);
		};
		const onDown = (e: PointerEvent) => {
			move(e.clientX, e.clientY);
			rings.push({ x: e.clientX, y: e.clientY, t: performance.now() });
		};
		const onLeave = () => (cursor.inside = false);

		function frame(now: number) {
			raf = requestAnimationFrame(frame);
			ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = ctx.strokeStyle = '#fff';

			const mode = pixel.hover;
			const s = pixel.pixelSize;

			// trail (also used lightly by ripple)
			const life = mode === 'trail' ? 700 : 350;
			while (trail.length && now - trail[0].t > life) trail.shift();
			if (mode === 'trail' || mode === 'ripple') {
				const base = Math.max(18, s * 3.5) * (mode === 'ripple' ? 0.5 : 1);
				for (const p of trail) {
					const k = 1 - (now - p.t) / life;
					ctx.globalAlpha = k;
					ctx.beginPath();
					ctx.arc(p.x, p.y, base * (0.4 + 0.6 * k), 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// click / tap rings — always on unless hover is off
			const ringLife = 1100;
			while (rings.length && now - rings[0].t > ringLife) rings.shift();
			if (mode !== 'off') {
				for (const r of rings) {
					const k = (now - r.t) / ringLife;
					ctx.globalAlpha = 1 - k;
					ctx.lineWidth = Math.max(4, s * 1.5) * (1 - k * 0.6);
					ctx.beginPath();
					ctx.arc(r.x, r.y, 10 + k * Math.max(w, h) * 0.35, 0, Math.PI * 2);
					ctx.stroke();
				}
			}

			if (mode === 'spotlight' && cursor.inside) {
				cursor.sx += (cursor.x - cursor.sx) * 0.18;
				cursor.sy += (cursor.y - cursor.sy) * 0.18;
				const R = Math.max(90, s * 14);
				const g = ctx.createRadialGradient(cursor.sx, cursor.sy, 0, cursor.sx, cursor.sy, R);
				g.addColorStop(0, 'rgba(255,255,255,1)');
				g.addColorStop(0.45, 'rgba(255,255,255,0.85)');
				g.addColorStop(1, 'rgba(255,255,255,0)');
				ctx.globalAlpha = 1;
				ctx.fillStyle = g;
				ctx.fillRect(cursor.sx - R, cursor.sy - R, R * 2, R * 2);
			}
			ctx.globalAlpha = 1;
		}

		resize();
		addEventListener('resize', resize);
		addEventListener('pointermove', onPointerMove, { passive: true });
		addEventListener('pointerdown', onDown, { passive: true });
		addEventListener('touchmove', onTouchMove, { passive: true });
		document.documentElement.addEventListener('pointerleave', onLeave);
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			removeEventListener('resize', resize);
			removeEventListener('pointermove', onPointerMove);
			removeEventListener('pointerdown', onDown);
			removeEventListener('touchmove', onTouchMove);
			document.documentElement.removeEventListener('pointerleave', onLeave);
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
		pointer-events: none;
		mix-blend-mode: difference;
		z-index: 10;
	}
</style>
