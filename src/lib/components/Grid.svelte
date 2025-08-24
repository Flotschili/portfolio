<script>
  import { onMount, onDestroy } from 'svelte';
  import { gridStore } from '$lib/stores/gridStore.js';
  import { GridManager } from '$lib/utils/gridUtils.js';

  export let cellSize = 20;
  export let showInfo = true;

  let container;
  let gridManager;
  let gridInfo = { rows: 0, cols: 0 };
  let hoveredCell = null;

  onMount(() => {
    gridManager = new GridManager(container, {
      cellSize,
      showInfo,
      onCellHover: (cellData) => {
        hoveredCell = cellData;
      },
      onCellLeave: () => {
        hoveredCell = null;
      }
    });

    gridStore.setGridManager(gridManager);
    gridInfo = gridManager.getGridInfo();

    const handleResize = () => {
      gridManager.init();
      gridInfo = gridManager.getGridInfo();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  onDestroy(() => {
    gridStore.setGridManager(null);
  });
</script>

{#if showInfo && hoveredCell}
  <div class="info" style="top: 10px; left: 10px;">
    {hoveredCell.key} ({hoveredCell.col}, {hoveredCell.row})
  </div>
{/if}

<div
  bind:this={container}
  class="grid-container"
  style="--cell-size: {cellSize}px; --cols: {gridInfo.cols}; --rows: {gridInfo.rows};"
>
</div>

<style>
  .grid-container {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    gap: 1px;
    background-color: black;
    padding: 1px;
  }

  .info {
    position: fixed;
    background: rgba(255, 255, 255, 0.9);
    padding: 5px 10px;
    font-size: 12px;
    border: 1px solid black;
    z-index: 1000;
    font-family: 'Courier New', monospace;
  }

  :global(.grid-cell) {
    background-color: white;
    transition: background-color 0.1s ease;
    cursor: crosshair;
  }

  :global(.grid-cell:hover) {
    background-color: black;
  }

  :global(.grid-cell.permanent-fill) {
    background-color: black !important;
  }
</style>