<script>
  import Grid from '$lib/components/Grid.svelte';
  import { gridStore } from '$lib/stores/gridStore.js';
  import { onMount } from 'svelte';

  let cellSize = 20;
  let showInfo = true;

  // Example usage
  onMount(() => {
    // Wait a bit for grid to initialize, then draw something
    setTimeout(() => {
      // Draw a simple pattern
      gridStore.fillPattern([
        [5, 5], [5, 6], [5, 7],
        [6, 5], [6, 7],
        [7, 5], [7, 6], [7, 7]
      ], 'square');
    }, 1000);
  });

  function clearGrid() {
    gridStore.clearAll();
  }

  function drawRandomPattern() {
    const pattern = [];
    const dimensions = gridStore.getDimensions();
    for (let i = 0; i < 10; i++) {
      pattern.push([
        Math.floor(Math.random() * 20),
        Math.floor(Math.random() * 30)
      ]);
    }
    gridStore.fillPattern(pattern, 'random');
  }
</script>

<svelte:head>
  <title>Minimalistic Grid</title>
</svelte:head>

<Grid {cellSize} {showInfo} />

<!-- Optional controls -->
<div class="controls">
  <button on:click={clearGrid}>Clear</button>
  <button on:click={drawRandomPattern}>Random Pattern</button>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Courier New', monospace;
    overflow: hidden;
  }

  .controls {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 1000;
  }

  button {
    padding: 8px 16px;
    background: white;
    border: 1px solid black;
    cursor: pointer;
    font-family: inherit;
  }

  button:hover {
    background: black;
    color: white;
  }
</style>