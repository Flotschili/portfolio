/**
 * Color palettes for the pixel pipeline.
 *
 * Every palette is a "gradient map": the pipeline converts each pixel to
 * luminance and then picks the palette color for that brightness band.
 * Order doesn't matter — colors are sorted dark → light automatically.
 *
 * Add your own palette here and it shows up in the settings.
 */
export const palettes = {
	mono: { label: 'Mono', colors: ['#000000', '#ffffff'] },
	gray: { label: 'Gray', colors: ['#000000', '#555555', '#aaaaaa', '#ffffff'] },
	pastel: {
		label: 'Pastel',
		colors: ['#3b3552', '#9d8ec7', '#f2a7bf', '#a7d8e8', '#c9f0d1', '#fff6e6']
	},
	gameboy: { label: 'Handheld', colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'] },
	ember: { label: 'Ember', colors: ['#1a0b14', '#7a1f3d', '#e2543e', '#f7b267', '#fff1d6'] }
} satisfies Record<string, { label: string; colors: string[] }>;

export type PaletteId = keyof typeof palettes;

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
	const h = hex.replace('#', '');
	const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
	const n = parseInt(full, 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function luminance([r, g, b]: RGB) {
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Palette colors as normalized RGB, sorted dark → light. */
export function sortedPalette(id: PaletteId): RGB[] {
	return palettes[id].colors.map(hexToRgb).sort((a, b) => luminance(a) - luminance(b));
}

export function toHex([r, g, b]: RGB) {
	return '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}
