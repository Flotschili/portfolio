import { palettes, type PaletteId } from './palettes';

/**
 * How the color of one big pixel is chosen from the content underneath it.
 *  - detail:  the cell's minority tone wins (thin strokes survive, dark or light — best for text)
 *  - nearest: take the single content pixel at the cell center (crunchy, aliased)
 *  - soft:    light blur first, then sample (softens thin lines)
 *  - average: blur ≈ cell size, then sample (approximates a box average)
 */
export const aaModes = ['detail', 'nearest', 'soft', 'average'] as const;
export type AAMode = (typeof aaModes)[number];

export const hoverModes = ['trail', 'ripple', 'spotlight', 'off'] as const;
export type HoverMode = (typeof hoverModes)[number];

export const defaults = {
	enabled: true,
	pixelSize: 2,
	aa: 'soft' as AAMode,
	palette: 'ember' as PaletteId,
	dither: true,
	ditherStrength: 1,
	grid: 0,
	hover: 'off' as HoverMode
};

export const PIXEL_MIN = 2;
export const PIXEL_MAX = 32;

const STORAGE_KEY = 'pixel-settings-v5';

class PixelSettings {
	enabled = $state(defaults.enabled);
	pixelSize = $state(defaults.pixelSize);
	aa = $state<AAMode>(defaults.aa);
	palette = $state<PaletteId>(defaults.palette);
	dither = $state(defaults.dither);
	ditherStrength = $state(defaults.ditherStrength);
	/** Opacity of the gap lines between pixels (0 = seamless). */
	grid = $state(defaults.grid);
	hover = $state<HoverMode>(defaults.hover);

	setPixelSize(n: number) {
		this.pixelSize = Math.round(Math.min(PIXEL_MAX, Math.max(PIXEL_MIN, n)));
	}

	cyclePalette(dir = 1) {
		const ids = Object.keys(palettes) as PaletteId[];
		const i = ids.indexOf(this.palette);
		this.palette = ids[(i + dir + ids.length) % ids.length];
	}

	reset() {
		Object.assign(this, defaults);
	}

	toJSON() {
		const { enabled, pixelSize, aa, palette, dither, ditherStrength, grid, hover } = this;
		return { enabled, pixelSize, aa, palette, dither, ditherStrength, grid, hover };
	}

	load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const data = JSON.parse(raw);
			for (const key of Object.keys(defaults) as (keyof typeof defaults)[]) {
				if (typeof data[key] === typeof defaults[key]) (this as any)[key] = data[key];
			}
		} catch {
			/* storage unavailable — keep defaults */
		}
		this.applyQuery(new URLSearchParams(location.search));
		if (!(this.palette in palettes)) this.palette = defaults.palette;
		if (!aaModes.includes(this.aa)) this.aa = defaults.aa;
		if (!hoverModes.includes(this.hover)) this.hover = defaults.hover;
		this.setPixelSize(this.pixelSize);
	}

	/** Shareable overrides, e.g. `?px=10&palette=pastel&aa=nearest&dither=0` */
	applyQuery(q: URLSearchParams) {
		if (q.has('px')) this.pixelSize = Number(q.get('px')) || defaults.pixelSize;
		if (q.has('palette')) this.palette = q.get('palette') as PaletteId;
		if (q.has('aa')) this.aa = q.get('aa') as AAMode;
		if (q.has('hover')) this.hover = q.get('hover') as HoverMode;
		if (q.has('dither')) this.dither = q.get('dither') !== '0';
		if (q.has('grid')) this.grid = Number(q.get('grid')) || 0;
	}

	save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this));
		} catch {
			/* ignore */
		}
	}
}

export const pixel = new PixelSettings();
