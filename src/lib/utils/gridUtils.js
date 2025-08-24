export class GridManager {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            cellSize: 20,
            showInfo: true,
            onCellHover: null,
            onCellLeave: null,
            ...options
        };
        this.cells = new Map();
        this.rows = 0;
        this.cols = 0;

        this.init();
    }

    init() {
        this.calculateGridDimensions();
        this.createGrid();
        this.setupEventListeners();
    }

    calculateGridDimensions() {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        this.cols = Math.floor(containerWidth / this.options.cellSize);
        this.rows = Math.floor(containerHeight / this.options.cellSize);
    }

    createGrid() {
        this.container.innerHTML = '';
        this.cells.clear();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.createCell(row, col);
                this.container.appendChild(cell);

                const key = this.getCellKey(row, col);
                this.cells.set(key, cell);
            }
        }
    }

    createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.key = this.getCellKey(row, col);

        return cell;
    }

    getCellKey(row, col) {
        return `R${row}C${col}`;
    }

    setupEventListeners() {
        this.container.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                const cellData = {
                    row: parseInt(e.target.dataset.row),
                    col: parseInt(e.target.dataset.col),
                    key: e.target.dataset.key
                };

                if (this.options.onCellHover) {
                    this.options.onCellHover(cellData);
                }
            }
        });

        this.container.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                if (this.options.onCellLeave) {
                    this.options.onCellLeave();
                }
            }
        });
    }

    // API methods
    getCellByCoordinates(row, col) {
        const key = this.getCellKey(row, col);
        return this.cells.get(key);
    }

    getCellByKey(key) {
        return this.cells.get(key);
    }

    fillCell(row, col, permanent = false) {
        const cell = this.getCellByCoordinates(row, col);
        if (cell) {
            cell.style.backgroundColor = 'black';
            if (permanent) {
                cell.classList.add('permanent-fill');
            }
        }
    }

    clearCell(row, col) {
        const cell = this.getCellByCoordinates(row, col);
        if (cell) {
            cell.style.backgroundColor = 'white';
            cell.classList.remove('permanent-fill');
        }
    }

    fillPattern(coordinates) {
        coordinates.forEach(([row, col]) => {
            this.fillCell(row, col, true);
        });
    }

    clearAll() {
        this.cells.forEach(cell => {
            cell.style.backgroundColor = 'white';
            cell.classList.remove('permanent-fill');
        });
    }

    getGridInfo() {
        return {
            rows: this.rows,
            cols: this.cols,
            totalCells: this.rows * this.cols,
            cellSize: this.options.cellSize
        };
    }
}