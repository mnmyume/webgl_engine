const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 4;
const CELL_SIZE = canvas.width / GRID_SIZE;

let grid = [];
let currentMode = null; // 'obstacle' or 'end'
let endCell = null;

// --- Initialization ---

function initGrid() {
    grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        let row = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            row.push({
                r: r,
                c: c,
                type: 'empty', // 'empty', 'obstacle', 'end'
                distance: null
            });
        }
        grid.push(row);
    }
}

// --- Drawing Functions ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            drawCell(grid[r][c]);
        }
    }
}

function drawCell(cell) {
    const x = cell.c * CELL_SIZE;
    const y = cell.r * CELL_SIZE;

    // Fill based on type
    if (cell.type === 'obstacle') {
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    } else if (cell.type === 'end') {
        ctx.fillStyle = '#336699'; // A nice blue
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    }

    // Draw border
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

    // Draw content (distance or 'e')
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;

    if (cell.type === 'end') {
        ctx.fillText('e', centerX, centerY);
    } else if (cell.distance !== null && cell.type !== 'obstacle') {
        ctx.fillText(cell.distance, centerX, centerY);
    }
}

// --- BFS Algorithm ---

function runBFS() {
    if (!endCell) {
        alert("Please select an 'end' cell first.");
        return;
    }

    // Reset distances
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            grid[r][c].distance = null;
        }
    }

    // Initialize Queue with the end cell for reverse BFS
    let queue = [];
    grid[endCell.r][endCell.c].distance = 0;
    queue.push(grid[endCell.r][endCell.c]);

    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    while (queue.length > 0) {
        let current = queue.shift();

        for (let [dr, dc] of directions) {
            let nr = current.r + dr;
            let nc = current.c + dc;

            if (isValid(nr, nc)) {
                let neighbor = grid[nr][nc];
                // If not visited and not an obstacle
                if (neighbor.distance === null && neighbor.type !== 'obstacle') {
                    neighbor.distance = current.distance + 1;
                    queue.push(neighbor);
                }
            }
        }
    }
    draw();
}

function isValid(r, c) {
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

// --- Event Listeners ---

function handleCanvasClick(e) {
    if (!currentMode) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);

    if (!isValid(r, c)) return;

    const clickedCell = grid[r][c];

    if (currentMode === 'obstacle') {
        if (clickedCell.type === 'end') {
            endCell = null;
        }
        clickedCell.type = clickedCell.type === 'obstacle' ? 'empty' : 'obstacle';
    } else if (currentMode === 'end') {
        if (endCell) {
            grid[endCell.r][endCell.c].type = 'empty';
        }
        clickedCell.type = 'end';
        endCell = { r, c };
    }

    // Reset BFS results on grid change
    for(let i=0; i<GRID_SIZE; i++) {
        for(let j=0; j<GRID_SIZE; j++) {
            grid[i][j].distance = null;
        }
    }

    draw();
}

function setMode(mode, btnId) {
    currentMode = mode;
    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
    if (btnId) {
        document.getElementById(btnId).classList.add('active');
    }
}

document.getElementById('btn-obstacle').addEventListener('click', () => setMode('obstacle', 'btn-obstacle'));
document.getElementById('btn-end').addEventListener('click', () => setMode('end', 'btn-end'));
document.getElementById('btn-bfs').addEventListener('click', runBFS);
canvas.addEventListener('click', handleCanvasClick);

// --- Start ---
initGrid();
draw();