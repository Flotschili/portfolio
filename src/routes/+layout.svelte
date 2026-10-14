<script lang="ts">
	import '../app.css';
	import PixelStage from '$lib/pixel/PixelStage.svelte';

	let { children } = $props();
</script>

<PixelStage>
	{@render children()}
</PixelStage>
