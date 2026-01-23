<script lang="ts">
	// No JS required for the animation; it's all CSS keyframes.
	// If you want deterministic variation per reload, set a fixed seed and
	// use it to swap classes/colors.
  
	const COLORS = {
	  a: '#7c3aed', // violet
	  b: '#06b6d4', // cyan
	  c: '#f97316', // orange
	  d: '#22c55e'  // green
	};
  </script>
  
  <svelte:head>
	<title>Flotschili</title>
	<meta name="description" content="SvelteKit page with an animated, blurred SVG background." />
  </svelte:head>
  
  <div class="page">
	<!-- Background lives behind everything, never captures pointer events -->
	<div class="bg" aria-hidden="true">
	  <!-- Base gradient wash -->
	  <div class="wash"></div>
  
	  <!-- SVG Layer 1 (large, slow) -->
	  <svg class="layer layer1" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
		<defs>
		  <filter id="blur1" x="-40%" y="-40%" width="180%" height="180%">
			<feGaussianBlur stdDeviation="55" />
		  </filter>
		</defs>
  
		<g filter="url(#blur1)" class="floatA">
		  <path
			class="blob blobA"
			fill={COLORS.a}
			d="M706,175c89,61,144,168,132,276c-12,108-91,218-191,289c-100,71-220,103-322,70
			   c-102-33-186-132-203-247c-17-115,33-246,125-330C339,149,617,114,706,175z"
		  />
		  <circle class="blob blobB" cx="260" cy="320" r="140" fill={COLORS.b} />
		</g>
	  </svg>
  
	  <!-- SVG Layer 2 (medium, slightly faster) -->
	  <svg class="layer layer2" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
		<defs>
		  <filter id="blur2" x="-40%" y="-40%" width="180%" height="180%">
			<feGaussianBlur stdDeviation="45" />
		  </filter>
		</defs>
  
		<g filter="url(#blur2)" class="floatB">
		  <path
			class="blob blobC"
			fill={COLORS.c}
			d="M764,504c-4,122-70,246-176,306c-106,60-251,56-351-8C137,738,75,610,104,491
			   c29-119,149-186,265-262c116-76,228-162,312-118C765,155,768,382,764,504z"
		  />
		  <ellipse class="blob blobD" cx="760" cy="280" rx="170" ry="120" fill={COLORS.d} />
		</g>
	  </svg>
  
	  <!-- SVG Layer 3 (subtle highlight shapes) -->
	  <svg class="layer layer3" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
		<defs>
		  <filter id="blur3" x="-40%" y="-40%" width="180%" height="180%">
			<feGaussianBlur stdDeviation="35" />
		  </filter>
		</defs>
  
		<g filter="url(#blur3)" class="floatC">
		  <circle cx="820" cy="740" r="170" fill={COLORS.b} class="blob blobE" />
		  <circle cx="220" cy="780" r="140" fill={COLORS.a} class="blob blobF" />
		</g>
	  </svg>
  
	  <!-- Optional: grain overlay (pure CSS, no assets) -->
	  <div class="grain"></div>
	</div>
  
	<!-- Your actual page content -->
	<main class="content">
		<div class="centered">
			<img src="/images/oia-uia.gif" alt="oia-uia" />
			<h1>Gugu Gaga</h1>
		</div>

	  <!-- <h1>Faded Animated SVG Background</h1>
	  <p>
		This background is:
		<strong>SVG-based</strong>, <strong>viewport-scaled</strong>, <strong>CSS keyframed</strong>,
		and <strong>blurred</strong> for a soft fade.
	  </p> -->
  
	  <!-- <div class="card">
		<h2>Drop your UI here</h2>
		<p>
		  The background is <code>position: fixed</code> and <code>pointer-events: none</code>,
		  so it stays behind everything.
		</p>
		<button class="btn">Example button</button>
	  </div> -->
	</main>
  </div>
  
  <style>
	/* Make the page take the full viewport so fixed layers behave predictably */
	:global(html, body) {
	  height: 100%;
	}
  
	:global(body) {
	  margin: 0;
	  background: #070814;
	  color: rgba(255, 255, 255, 0.92);
	  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial,
		"Apple Color Emoji", "Segoe UI Emoji";
	}
  
	.page {
	  min-height: 100vh;
	  position: relative;
	  overflow: hidden;
	}
  
	.bg {
	  position: fixed;
	  inset: 0;
	  z-index: -1;
	  pointer-events: none;
  
	  /* Slight color pop; adjust to taste */
	  filter: saturate(1.2) contrast(1.05);
	}
  
	.wash {
	  position: absolute;
	  inset: 0;
	  background:
		radial-gradient(1200px 900px at 20% 15%, rgba(124, 58, 237, 0.22), transparent 55%),
		radial-gradient(900px 700px at 85% 25%, rgba(6, 182, 212, 0.18), transparent 60%),
		radial-gradient(1000px 800px at 70% 85%, rgba(249, 115, 22, 0.14), transparent 60%),
		linear-gradient(180deg, #060614, #050611);
	}
  
	.layer {
	  position: absolute;
	  inset: -10%; /* overscan so blobs stay on-screen while moving */
	  width: 120%;
	  height: 120%;
	  opacity: 0.75;
  
	  /* Blend layers together for a dreamy look */
	  mix-blend-mode: screen;
  
	  /* Helps animation performance */
	  will-change: transform;
	  transform: translateZ(0);
	}
  
	.layer1 { opacity: 0.55; }
	.layer2 { opacity: 0.45; }
	.layer3 { opacity: 0.35; mix-blend-mode: lighten; }
  
	/* Individual blob alpha so overlaps look nicer */
	.blob { opacity: 0.85; }
	.blobB { opacity: 0.65; }
	.blobD { opacity: 0.55; }
  
	/* Keyframed motion: translate/rotate/scale in a slow loop */
	.floatA {
	  transform-origin: 50% 50%;
	  animation: driftA 18s ease-in-out infinite alternate;
	}
  
	.floatB {
	  transform-origin: 50% 50%;
	  animation: driftB 14s ease-in-out infinite alternate;
	}
  
	.floatC {
	  transform-origin: 50% 50%;
	  animation: driftC 16s ease-in-out infinite alternate;
	}
  
	@keyframes driftA {
	  0%   { transform: translate(-2%, -1%) scale(1.05) rotate(-6deg); }
	  40%  { transform: translate(2%, 1%)   scale(1.10) rotate(4deg); }
	  100% { transform: translate(-1%, 3%)  scale(1.06) rotate(10deg); }
	}
  
	@keyframes driftB {
	  0%   { transform: translate(2%, 3%)   scale(1.08) rotate(8deg); }
	  50%  { transform: translate(-3%, -1%) scale(1.02) rotate(-4deg); }
	  100% { transform: translate(1%, -2%)  scale(1.09) rotate(12deg); }
	}
  
	@keyframes driftC {
	  0%   { transform: translate(0%, 2%)   scale(1.00) rotate(-2deg); }
	  60%  { transform: translate(2%, -2%)  scale(1.06) rotate(6deg); }
	  100% { transform: translate(-2%, 1%)  scale(1.03) rotate(-8deg); }
	}
  
	/* Subtle grain/noise overlay (no images). If you dislike it, delete this block. */
	.grain {
	  position: absolute;
	  inset: 0;
	  opacity: 0.08;
	  background-image:
		repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px),
		repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px);
	  mix-blend-mode: overlay;
	  filter: blur(0.2px);
	}
  
	/* Content styling */
	.content {
	  position: relative;
	  max-width: 980px;
	  margin: 0 auto;
	  padding: 72px 20px 96px;
	}
  
	h1 {
	  font-size: clamp(28px, 4vw, 46px);
	  margin: 0 0 12px;
	  letter-spacing: -0.02em;
	}
  
	p {
	  margin: 0 0 18px;
	  line-height: 1.6;
	  color: rgba(255, 255, 255, 0.78);
	}
  
	.card {
	  margin-top: 28px;
	  padding: 18px 18px 16px;
	  border-radius: 16px;
	  background: rgba(10, 12, 26, 0.55);
	  border: 1px solid rgba(255, 255, 255, 0.10);
	  backdrop-filter: blur(10px);
	  -webkit-backdrop-filter: blur(10px);
	}

	.centered {
		display: flex;
		flex-direction: column; /* stack headline and image vertically */
		justify-content: center; /* vertical center */
		align-items: center;     /* horizontal center */
		min-height: 100vh;       /* take full viewport height */
		text-align: center;
	}
  
	.btn {
	  margin-top: 10px;
	  appearance: none;
	  border: 1px solid rgba(255, 255, 255, 0.18);
	  background: rgba(255, 255, 255, 0.08);
	  color: rgba(255, 255, 255, 0.92);
	  padding: 10px 14px;
	  border-radius: 12px;
	  cursor: pointer;
	  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
	}
  
	.btn:hover {
	  transform: translateY(-1px);
	  background: rgba(255, 255, 255, 0.12);
	  border-color: rgba(255, 255, 255, 0.26);
	}
  
	/* Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
	  .floatA, .floatB, .floatC { animation: none; }
	}
  
	/* On small devices, reduce intensity a bit for readability/perf */
	@media (max-width: 520px) {
	  .layer { opacity: 0.55; }
	  .grain { opacity: 0.06; }
	}
  </style>