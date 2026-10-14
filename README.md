# flotschi.dev — pixel playground

SvelteKit (Svelte 5) static site. The whole page is live HTML rendered through a
**pixel pipeline**: an SVG filter applied to a viewport-fixed stage, so content scrolls
*through* a static pixel grid.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in ./build
```

## Where things live

| What | File |
| --- | --- |
| Page content (plain HTML/CSS) | `src/routes/+page.svelte` |
| Projects list | `src/lib/content/projects.ts` |
| Fonts, base colors, text sizes | `src/app.css` |
| Color palettes | `src/lib/pixel/palettes.ts` |
| Defaults (pixel size, sampling, …) | `src/lib/pixel/settings.svelte.ts` |
| The pipeline (SVG filter) | `src/lib/pixel/PixelFilter.svelte` |
| Fixed stage / grid / settings HUD | `src/lib/pixel/PixelStage.svelte` |
| Pointer effects | `src/lib/pixel/HoverFx.svelte` |

**Author content in grayscale.** The pipeline converts to luminance and gradient-maps it
onto the active palette, so brightness is what matters, not hue.

Use `var(--small)` for small text: it grows with the pixel size so labels stay legible.

## Pipeline

```
DOM → sampling (detail | nearest | soft | average) → 1 sample per cell → grow to cell
    → luminance → ordered Bayer dither (optional) → palette gradient map
```

- **detail**: per cell, the minority tone of the surroundings wins (min-pool in light areas,
  max-pool in dark areas). Thin strokes survive both ways, so it's the best mode for text.
- **nearest**: point sample at the cell center. Crunchy and aliased.
- **soft / average**: blur, then sample. Approximates anti-aliasing / box filtering.

## Controls

Settings HUD bottom-right, the sandbox section, or keys:
`[` `]` size · `p` palette · `a` sampling · `d` dither · `h` hover effect · `b` bypass.

URL overrides for sharing: `?px=10&palette=pastel&aa=nearest&dither=0&grid=0.3&hover=spotlight`
