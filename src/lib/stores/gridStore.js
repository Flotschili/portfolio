import { writable } from 'svelte/store';

function createGridStore() {
    const { subscribe, set, update } = writable({
        gridManager: null,
        filledCells: new Set(),
        patterns: []
    });

    return {
        subscribe,
        setGridManager: (manager) => update(state => ({ ...state, gridManager: manager })),

        fillCell: (row, col, permanent = false) => update(state => {
            if (state.gridManager) {
                state.gridManager.fillCell(row, col, permanent);
                if (permanent) {
                    state.filledCells.add(`R${row}C${col}`);
                }
            }
            return state;
        }),

        clearCell: (row, col) => update(state => {
            if (state.gridManager) {
                state.gridManager.clearCell(row, col);
                state.filledCells.delete(`R${row}C${col}`);
            }
            return state;
        }),

        fillPattern: (coordinates, name) => update(state => {
            if (state.gridManager) {
                state.gridManager.fillPattern(coordinates);
                state.patterns.push({ name, coordinates });
                coordinates.forEach(([row, col]) => {
                    state.filledCells.add(`R${row}C${col}`);
                });
            }
            return state;
        }),

        clearAll: () => update(state => {
            if (state.gridManager) {
                state.gridManager.clearAll();
                state.filledCells.clear();
                state.patterns = [];
            }
            return state;
        }),

        getDimensions: () => update(state => {
            if (state.gridManager) {
                return {
                    width: state.gridManager.rows,
                    height: state.gridManager.cols
                };
            }
            return { width: 0, height: 0 };
        })
    };
}

export const gridStore = createGridStore();