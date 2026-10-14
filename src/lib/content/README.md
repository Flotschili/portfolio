# `lib/content` — page content

The page itself is `src/routes/+page.svelte`. It's plain HTML and CSS, and the layout feeds
all of it through the pixel pipeline. This folder holds the pieces it uses:

| File | Role |
| --- | --- |
| `projects.ts` | Project list for the "selected work" section. Edit this to change projects. |
| `HeroArt.svelte` | Animated canvas behind the hero title (drifting glow blobs + orbiting ring; one blob follows the pointer). |
| `DrawPad.svelte` | Sketch pad in the sandbox section (soft grayscale brush). |

## Writing content for the grid

The pipeline throws away hue and keeps **brightness**, which it then maps onto the active
palette. A few rules follow from that:

- **Work in grayscale.** `#000` / `#fff` / grays (`--ink`, `--paper`, `--mid` in
  `app.css`). A colored element only matters through its luminance.
- **Contrast beats detail.** Thin strokes on mid-gray backgrounds vanish. Black on white
  or white on black survives best.
- **Size is relative to the pixel size.** A glyph needs roughly 6–7 cells of cap height to
  read. For small labels use `font-size: var(--small)`, which grows with `--px`. Big
  display type is where the grid looks best.
- **Gradients are a feature.** Smooth gradients (`HeroArt`, the specimen ramp) turn into
  dithered palette bands. Large flat areas stay clean.
- **Avoid `mix-blend-mode: difference` for important text.** Over mid-gray it lands on the
  same gray and disappears. The hero title uses a white fill with a black `text-shadow`
  outline instead.
- **Animation is fine.** Moving content passing through the static grid is the point
  (see the marquee and spinning shapes). Pause canvas loops when off-screen.

## Page structure (`routes/+page.svelte`)

| Section | id | Notes |
| --- | --- | --- |
| Hero | — | `HeroArt` + title + four corner labels |
| Marquee | — | CSS `slide` animation; the text is repeated twice for a seamless loop |
| Intro | — | One-paragraph lede, the subtle "who" |
| 01 specimen | — | Type sizes, gray ramp, gradient, animated shapes; shows how content reacts to settings |
| 02 sandbox | `#sandbox` | `PixelControls` + `DrawPad` |
| 03 selected work | `#work` | Rendered from `projects.ts`; rows invert and reveal the blurb on hover |
| 04 about | `#about` | Text + `dl` of facts/links |

## Changing fonts

Fonts are self-hosted via `@fontsource` and wired up in `src/app.css`:

```css
--font-display: 'Space Grotesk Variable', system-ui, sans-serif;
--font-body:    'Space Grotesk Variable', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;
```

To switch: `npm install @fontsource/<font>`, change the `@import` lines at the top of
`app.css`, and update the variables. Bold, simple sans faces survive pixelation better
than thin or high-contrast serifs.

## Adding a project

```ts
// projects.ts
{
	year: '2026',
	title: 'New Thing',
	tags: ['svelte', 'webgl'],
	blurb: 'One or two sentences.',
	href: 'https://…' // optional; without it the row links to #work
}
```

## Adding a section

Add a `<section class="wrap" id="…">` with an `<h2 class="label">NN — name</h2>` to
`+page.svelte`. `.wrap` gives the centered column and `section` gives the vertical
rhythm. Put reusable or scripted pieces in this folder as components.
