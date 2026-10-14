<!--
  Front page. Plain HTML + CSS — everything here is fed through the pixel pipeline
  by the layout, so write it like a normal web page.
-->
<script lang="ts">
	import HeroArt from '$lib/content/HeroArt.svelte';
	import DrawPad from '$lib/content/DrawPad.svelte';
	import PixelControls from '$lib/pixel/PixelControls.svelte';
	import { projects } from '$lib/content/projects';

	const ramp = Array.from({ length: 16 }, (_, i) => Math.round((i / 15) * 255));
	const specimen = 'Every pixel passes through the grid.';
	const sizes = [72, 44, 28, 18, 13, 10, 8, 6];
</script>

<svelte:head>
	<title>flotschi — pixel playground</title>
	<meta name="description" content="Portfolio & pixel playground of Flotschi." />
</svelte:head>

<!-- ─── hero ─────────────────────────────────────────────── -->
<header class="hero">
	<HeroArt />
	<div class="hero-corner tl">flotschi.dev</div>
	<div class="hero-corner tr">dev / design / play</div>
	<h1>flot<br />schi</h1>
	<div class="hero-corner bl">v0.1 — prototype</div>
	<div class="hero-corner br">scroll ↓</div>
</header>

<!-- ─── marquee ──────────────────────────────────────────── -->
<div class="marquee" aria-hidden="true">
	<div class="track">
		{#each Array(2) as _}
			<span>PIXELS ✦ GRIDS ✦ PALETTES ✦ DITHER ✦ CODE ✦ PLAY ✦&nbsp;</span>
		{/each}
	</div>
</div>

<main>
	<!-- ─── intro (subtle portfolio info) ───────────────────── -->
	<section class="wrap intro">
		<p class="lede">
			Hi, I'm <strong>Flotschi</strong> — I build interfaces and small odd things on the web.
			This page is a toy first and a portfolio second. Move your cursor around.
		</p>
	</section>

	<!-- ─── specimen: how content reacts to the grid ─────────── -->
	<section class="wrap specimen">
		<h2 class="label">01 — specimen</h2>
		<div class="type">
			{#each sizes as px}
				<p style:font-size="{px}px">{specimen}</p>
			{/each}
		</div>

		<div class="ramp">
			{#each ramp as v}
				<div style:background="rgb({v},{v},{v})"></div>
			{/each}
		</div>
		<div class="gradient"></div>

		<div class="shapes" aria-hidden="true">
			<div class="shape circle"></div>
			<div class="shape square"></div>
			<div class="shape rings"></div>
			<div class="shape stripes"></div>
		</div>
	</section>

	<!-- ─── sandbox ──────────────────────────────────────────── -->
	<section class="wrap sandbox" id="sandbox">
		<h2 class="label">02 — sandbox</h2>
		<div class="sandbox-grid">
			<div>
				<h3>Tune the pipeline</h3>
				<p class="muted">Everything on this page is rendered through these settings.</p>
				<PixelControls />
			</div>
			<div>
				<h3>Draw something</h3>
				<p class="muted">Soft brushes, hard pixels.</p>
				<DrawPad />
			</div>
		</div>
	</section>

	<!-- ─── work ─────────────────────────────────────────────── -->
	<section class="wrap work" id="work">
		<h2 class="label">03 — selected work</h2>
		<ul>
			{#each projects as p}
				<li>
					<a href={p.href ?? '#work'}>
						<span class="year">{p.year}</span>
						<span class="title">{p.title}</span>
						<span class="tags">{p.tags.join(' · ')}</span>
						<span class="blurb">{p.blurb}</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<!-- ─── about / contact ─────────────────────────────────── -->
	<section class="wrap about" id="about">
		<h2 class="label">04 — about</h2>
		<div class="about-grid">
			<p>
				Software developer based in Austria. I like interfaces that feel like instruments,
				constraints that force ideas, and pixels that are allowed to be pixels.
			</p>
			<dl>
				<dt>now</dt>
				<dd>building realtime UIs</dd>
				<dt>stack</dt>
				<dd>typescript, svelte, canvas, shaders</dd>
				<dt>elsewhere</dt>
				<dd><a href="https://github.com/Flotschili">github</a></dd>
				<dt>mail</dt>
				<dd>hello@flotschi.dev</dd>
			</dl>
		</div>
	</section>
</main>

<footer class="wrap">
	<span>© 2026 flotschi</span>
	<span>rendered live through an svg filter</span>
</footer>

<style>
	.wrap {
		width: var(--wrap);
		margin-inline: auto;
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--small);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		border-bottom: 2px solid var(--ink);
		padding-bottom: 0.5rem;
		margin-bottom: 2rem;
	}

	.muted {
		color: #555;
		margin-top: 0.3rem;
	}

	section {
		padding-block: clamp(4rem, 10vw, 8rem);
	}

	/* hero */
	.hero {
		position: relative;
		height: 100dvh;
		min-height: 30rem;
		background: #000;
		color: #fff;
		overflow: hidden;
		display: grid;
		place-items: center;
	}
	.hero h1 {
		position: relative;
		font-size: clamp(5rem, 24vw, 22rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 0.8;
		text-align: center;
		color: #fff;
		/* solid outline so the title reads over every tone of the art behind it */
		text-shadow:
			0.035em 0 #000, -0.035em 0 #000, 0 0.035em #000, 0 -0.035em #000,
			0.025em 0.025em #000, -0.025em 0.025em #000, 0.025em -0.025em #000, -0.025em -0.025em #000,
			0.06em 0.07em #000;
		user-select: none;
	}
	.hero-corner {
		position: absolute;
		font-family: var(--font-mono);
		font-size: calc(var(--small) * 1.3);
		font-weight: 700;
		mix-blend-mode: difference;
	}
	.tl { top: 1.5rem; left: 1.5rem; }
	.tr { top: 1.5rem; right: 1.5rem; }
	.bl { bottom: 1.5rem; left: 1.5rem; }
	.br { bottom: 1.5rem; right: 1.5rem; }

	/* marquee */
	.marquee {
		overflow: hidden;
		background: var(--ink);
		color: var(--paper);
		border-block: 4px solid var(--ink);
		white-space: nowrap;
	}
	.track {
		display: inline-flex;
		animation: slide 22s linear infinite;
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 8vw, 6rem);
		font-weight: 700;
		line-height: 1.2;
	}
	@keyframes slide {
		to { transform: translateX(-50%); }
	}

	/* intro */
	.lede {
		font-size: clamp(1.6rem, 1rem + 3vw, 3.2rem);
		line-height: 1.2;
		max-width: 22em;
		margin: 0;
	}

	/* specimen */
	.type p {
		margin: 0 0 0.3em;
		line-height: 1.1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: clip;
	}
	.ramp {
		display: grid;
		grid-template-columns: repeat(16, 1fr);
		height: 5rem;
		margin-top: 3rem;
	}
	.gradient {
		height: 5rem;
		background: linear-gradient(90deg, #000, #fff);
		margin-top: 0.5rem;
	}
	.shapes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 1.5rem;
		margin-top: 3rem;
	}
	.shape {
		aspect-ratio: 1;
	}
	.circle {
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #fff, #000 70%);
		border: 3px solid #000;
	}
	.square {
		background: #000;
		animation: spin 12s linear infinite;
		scale: 0.7;
	}
	.rings {
		border-radius: 50%;
		background: repeating-radial-gradient(circle, #000 0 6px, #fff 6px 14px);
		animation: pulse 4s ease-in-out infinite alternate;
	}
	.stripes {
		background: repeating-linear-gradient(45deg, #000 0 5px, #fff 5px 13px);
		animation: spin 30s linear infinite reverse;
		border-radius: 30%;
	}
	@keyframes spin {
		to { rotate: 1turn; }
	}
	@keyframes pulse {
		from { scale: 0.75; }
		to { scale: 1; }
	}

	/* sandbox */
	.sandbox-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
		gap: 3rem;
	}
	.sandbox-grid > * {
		min-width: 0;
	}
	.sandbox h3 {
		font-size: 1.6rem;
	}
	.sandbox h3 + p {
		margin-bottom: 1.5rem;
	}

	/* work */
	.work ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.work a {
		display: grid;
		grid-template-columns: 4rem 1fr auto;
		gap: 0.2rem 1.5rem;
		padding: 1.4rem 0.8rem;
		border-bottom: 2px solid var(--ink);
		text-decoration: none;
		transition: background 0.15s, color 0.15s, padding 0.25s;
	}
	.work a:hover,
	.work a:focus-visible {
		background: var(--ink);
		color: var(--paper);
		padding-left: 1.6rem;
		outline: none;
	}
	.year,
	.tags {
		font-family: var(--font-mono);
		font-size: var(--small);
		align-self: center;
	}
	.title {
		font-size: clamp(1.5rem, 1rem + 2vw, 2.6rem);
		font-weight: 700;
		line-height: 1.1;
	}
	.blurb {
		grid-column: 2 / -1;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s;
	}
	.work a:hover .blurb,
	.work a:focus-visible .blurb {
		max-height: 6rem;
	}
	@media (max-width: 40rem) {
		.work a {
			grid-template-columns: 1fr;
		}
		.blurb {
			grid-column: auto;
			max-height: none;
		}
	}

	/* about */
	.about-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: 2rem 4rem;
	}
	.about-grid p {
		font-size: 1.4rem;
		margin: 0;
	}
	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem 1.5rem;
		margin: 0;
		font-family: var(--font-mono);
	}
	dt {
		color: #666;
	}
	dd {
		margin: 0;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 2rem 6rem;
		border-top: 2px solid var(--ink);
		font-family: var(--font-mono);
		font-size: var(--small);
	}

	@media (prefers-reduced-motion: reduce) {
		.track,
		.square,
		.rings,
		.stripes {
			animation-duration: 120s;
		}
	}
</style>
