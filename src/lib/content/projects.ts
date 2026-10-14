/** Example projects — replace with real ones. */
export type Project = {
	year: string;
	title: string;
	tags: string[];
	blurb: string;
	href?: string;
};

export const projects: Project[] = [
	{
		year: '2026',
		title: 'Pixel Pipeline',
		tags: ['svelte', 'svg filters', 'art'],
		blurb: 'This website. Live DOM rendered through a static, palette-mapped pixel grid.'
	},
	{
		year: '2025',
		title: 'Trail Atlas',
		tags: ['maps', 'gpx', 'data viz'],
		blurb: 'Hiking tours rendered as elevation ribbons. Placeholder description.'
	},
	{
		year: '2025',
		title: 'Dispatch Console',
		tags: ['realtime', 'ui', 'typescript'],
		blurb: 'Interface work for time-critical operations. Placeholder description.'
	},
	{
		year: '2024',
		title: 'Oia Uia',
		tags: ['animation', 'gif', 'meme'],
		blurb: 'A spinning cat, preserved for history. Placeholder description.'
	}
];
