# `lib/pixel` — the rendering pipeline

Everything that turns normal web content into a pixel grid lives here. Nothing in this
folder knows about the actual page content.

## Files

| File | Role |
| --- | --- |
| `PixelStage.svelte` | Wraps the whole site (used in `routes/+layout.svelte`). Owns the fixed stage, grid overlay, settings HUD and keyboard shortcuts. |
| `PixelFilter.svelte` | The pipeline itself: renders one SVG `<filter>` from its props. |
| `HoverFx.svelte` | Canvas with pointer effects (trail, ripple, spotlight), drawn *inside* the stage. |
| `PixelControls.svelte` | The settings UI. Used in both the HUD (`compact`) and the sandbox section. |
| `settings.svelte.ts` | Global reactive settings (`pixel`), defaults, localStorage persistence, URL overrides. |
| `palettes.ts` | Palette definitions and color helpers. |

## How the stage is built

```
<svg defs>            two <filter>s: main + HUD
.stage   (fixed, inset 0, filter: url(#px-main-…))
├─ .scroller   (absolute, overflow-y: auto)   ← page content scrolls here
└─ HoverFx canvas (absolute, mix-blend-mode: difference)
.grid    (fixed overlay, outside the filter)  ← thin gap lines between pixels
.hud     (fixed, own filter with ≤2px pixels) ← settings button + panel
```

Two things to keep in mind:

- **The grid is static because the filter is on the fixed `.stage`, not on the scrolling
  element.** Filter primitive coordinates are relative to the filtered element's box, so
  cells stay put and content moves through them. If you move the filter onto `.scroller`
  or the page, the grid will scroll with the content.
- **Scrolling happens in `.scroller`, not on `body`** (`html, body { overflow: hidden }` in
  `app.css`). Anchor links (`#work`) still work. Anything that listens to window scroll
  has to listen on `.scroller` instead.

`HoverFx` sits inside the stage but outside the scroller, so its drawings stay fixed to the
viewport and still go through the pipeline. That keeps hover effects on the same grid and
palette as everything else.

## The filter graph (`PixelFilter.svelte`)

`s` = pixel size, `r = floor((s - 1) / 2)` = the sample point's offset inside a cell.

1. **Sampling mode** → `src`
   - `detail`: blur widely (σ = max(4, 1.5·s)) to get the surrounding brightness, then
     threshold it into a mask. Light surroundings → `erode` (min-pool, dark wins). Dark
     surroundings → `dilate` (max-pool, light wins). The two are combined through the mask.
     Thin strokes survive in both directions.
   - `soft` / `average`: Gaussian blur (σ = 0.15·s / 0.32·s), roughly anti-aliasing / box filtering.
   - `nearest`: pass-through.
2. **Sample one pixel per cell.** A 1×1 `feFlood` at `(r, r)`, padded to an `s×s` subregion
   and `feTile`d, gives a dot grid. `feComposite in` keeps only `src` under the dots.
3. **Grow dots into blocks.** `feMorphology dilate` with radius `r` gives `2r+1` px blocks.
   That's exactly `s` for odd sizes. For even sizes it's one short, so the result is merged
   with copies shifted by 1px right and down.
4. **Luminance.** `feColorMatrix` with Rec. 709 weights.
5. **Dither (optional).** A 4×4 Bayer matrix of `s×s` flood cells is tiled and added with
   `feComposite arithmetic` (`lum + amt·(bayer − 0.5)`). `amt = strength / (colors − 1)`,
   so the dither spans about one palette band.
6. **Palette.** `feComponentTransfer` with `type="discrete"` per channel and the palette's
   R/G/B values (sorted dark → light) as `tableValues`. That's a stepped gradient map.
   With `opaque`, alpha is forced to 1.

### Gotchas

- `color-interpolation-filters="sRGB"` is required; otherwise blur, arithmetic and
  discrete steps run in linearRGB and the bands land in the wrong places.
- `feComposite arithmetic` works on premultiplied RGBA, so dithering adds alpha on
  transparent areas. Only use dither on opaque layers (the HUD has it off).
- In `detail` mode, the even-size min/max fix uses shifted copies plus `feBlend
  darken/lighten`. Just widening the morphology radius made thick strokes hollow and
  pulled in the transparent area past the element edge.
- The filter id includes all pipeline settings (`px-main-6-detail-mono-…`). Changing the id
  forces every browser to re-resolve the filter, instead of relying on in-place attribute
  updates being picked up.
- Morphology radius `0` disables the primitive, so `r = 0` (size 2) is special-cased.

## Settings (`settings.svelte.ts`)

`pixel` is a single Svelte 5 `$state` class instance. Import it anywhere and read or
write fields directly:

```ts
import { pixel } from '$lib/pixel/settings.svelte';
pixel.setPixelSize(12);
pixel.palette = 'pastel';
```

| Field | Values | Default |
| --- | --- | --- |
| `enabled` | pipeline on/off (bypass) | `true` |
| `pixelSize` | `PIXEL_MIN`–`PIXEL_MAX` (2–32) | `2` |
| `aa` | `detail` · `nearest` · `soft` · `average` | `nearest` |
| `palette` | any key of `palettes` | `ember` |
| `dither`, `ditherStrength` | bool, 0.1–1 | `true`, `1` |
| `grid` | gap-line opacity 0–0.6 | `0` |
| `hover` | `trail` · `ripple` · `spotlight` · `off` | `off` |

Load order on startup: defaults → localStorage (`pixel-settings-v5`) → URL query
(`?px=&palette=&aa=&hover=&dither=0|1&grid=`). Bump the storage key when defaults change
in a way that old saved settings shouldn't override.

`PixelStage` also exposes CSS custom properties to the content:

| Variable | Meaning |
| --- | --- |
| `--px` | current pixel size (e.g. `4px`) |
| `--pal-dark`, `--pal-light` | darkest / lightest palette color |

## Adding a palette

Add an entry to `palettes` in `palettes.ts`. It shows up in the controls and the `p`
shortcut automatically. Order doesn't matter (colors are sorted by luminance). More colors
give smoother gradients but weaker contrast for text. 2–6 colors works well.

## Adding a hover effect

1. Add the name to `hoverModes` in `settings.svelte.ts`.
2. Draw it in `frame()` in `HoverFx.svelte`. Draw in **white**: the canvas uses
   `mix-blend-mode: difference`, so white inverts what's underneath and partial alpha gives
   dithered half-tones.

## Limits

- Hit-testing, selection and accessibility use the unfiltered DOM, so they all keep working.
- SVG filters on HTML are fast in Chromium and Firefox. Safari / iOS performance is
  untested and the main risk; check before relying on large animated areas there.
- The whole viewport is re-filtered every frame while anything animates or scrolls. To
  limit cost, keep animations paused off-screen (see the `IntersectionObserver` in
  `HeroArt`).
