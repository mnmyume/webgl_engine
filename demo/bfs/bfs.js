const canvas = document.getElementById('2dCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 8;
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

            // Determine if the cell is on the boundary
            let cellType = 'empty';

            // Check top, bottom, left, and right edges
            if (r === 0 || r === GRID_SIZE - 1 || c === 0 || c === GRID_SIZE - 1) {
                cellType = 'obstacle';
            }

            row.push({
                r: r,
                c: c,
                type: cellType,
                // If obstacle, set specific distance, else keep it null
                distance: cellType === 'obstacle' ? Infinity : null,
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

    // --- Backgrounds ---
    if (cell.type === 'obstacle') {
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    } else if (cell.type === 'end') {
        ctx.fillStyle = '#336699';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    }

    // --- Border ---
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

    // --- Text Content ---
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;

    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (cell.type === 'end') {
        ctx.fillText('e', centerX, centerY);
    } else if (cell.type === 'empty' && cell.distance !== null) {
        ctx.fillText(cell.distance, centerX, centerY);
    }

    // --- Arrow Drawing ---
    if (cell.vec) {
        // Multiplier to make the arrow visible (since gradient is usually just 1 or -1)
        const scale = 15;

        const endX = centerX - cell.vec.x;
        const endY = centerY - cell.vec.y;

        drawArrow(ctx, centerX, centerY, endX, endY);
    }
}

function drawArrow(ctx, fromx, fromy, tox, toy) {
    const headlen = 8;      // Size of the arrow tip
    const fixedLength = 20; // Fixed visual length in pixels (fits in cell)

    // 1. Calculate the vector and original magnitude
    const dx = tox - fromx;
    const dy = toy - fromy;

    // 3. Normalize the vector to the fixed visual length
    const angle = Math.atan2(dy, dx);
    const endX = fromx - Math.cos(angle) * fixedLength;
    const endY = fromy - Math.sin(angle) * fixedLength;

    // 4. Draw the Arrow
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(endX, endY);

    // Draw the arrowhead tips
    ctx.lineTo(endX + headlen * Math.cos(angle - Math.PI / 6), endY + headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX + headlen * Math.cos(angle + Math.PI / 6), endY + headlen * Math.sin(angle + Math.PI / 6));

    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 3;
    ctx.stroke();
}


// --- Shortest Path Algorithm ---

function runBFS() {
    if (!endCell) {
        alert("Please select an 'end' cell first.");
        return;
    }

    // Reset distances
    for (let r = 1; r < GRID_SIZE-1; r++) {
        for (let c = 1; c < GRID_SIZE-1; c++) {
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

function runWavefront() {
    if (!endCell) {
        alert("Please select an 'end' cell first.");
        return;
    }

    // 1. Reset distances
    for (let r = 1; r < GRID_SIZE - 1; r++) {
        for (let c = 1; c < GRID_SIZE - 1; c++) {
            grid[r][c].distance = null;
        }
    }

    // 2. Initialize the first wave
    let currentWave = [];

    // Set start distance
    grid[endCell.r][endCell.c].distance = 0;
    currentWave.push(grid[endCell.r][endCell.c]);

    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    // 3. Process waves layer by layer
    while (currentWave.length > 0) {
        let nextWave = []; // Accumulate neighbors for the next layer here

        for (let i = 0; i < currentWave.length; i++) {
            let current = currentWave[i];

            for (let [dr, dc] of directions) {
                let nr = current.r + dr;
                let nc = current.c + dc;

                if (isValid(nr, nc)) {
                    let neighbor = grid[nr][nc];

                    // If not visited and not an obstacle
                    if (neighbor.distance === null && neighbor.type !== 'obstacle') {
                        // Assign distance (current wave + 1)
                        neighbor.distance = current.distance + 1;

                        // Add to next wave layer
                        nextWave.push(neighbor);
                    }
                }
            }
        }

        // Move to the next wave
        currentWave = nextWave;
    }

    // 4. Draw the final result once the propagation is complete
    draw();
}

function runGradient() {
    // 1. Check if BFS has been run (distances exist)
    if (!endCell || grid[endCell.r][endCell.c].distance === null) {
        alert("Please run BFS first to calculate distances.");
        return;
    }

    // Define all 8 possible directions (Cardinal + Diagonal)
    const directions = [
        { dr: -1, dc: 0 },  // N
        { dr: -1, dc: 1 },  // NE
        { dr: 0,  dc: 1 },  // E
        { dr: 1,  dc: 1 },  // SE
        { dr: 1,  dc: 0 },  // S
        { dr: 1,  dc: -1 }, // SW
        { dr: 0,  dc: -1 }, // W
        { dr: -1, dc: -1 }  // NW
    ];

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            let cell = grid[r][c];

            // Skip obstacles, unvisited cells, or the goal (distance 0)
            if (cell.type === 'obstacle' || cell.distance === null || cell.distance === 0) {
                cell.vec = null;
                continue;
            }

            // Start assuming the current cell is the best option
            let minDistance = cell.distance;
            let bestDir = { x: 0, y: 0 };

            // 2. Iterate through all 8 neighbors to find the smallest distance
            for (let { dr, dc } of directions) {
                let nr = r + dr;
                let nc = c + dc;

                if (isValid(nr, nc)) {
                    let neighbor = grid[nr][nc];

                    // Check if neighbor is visited and has a smaller distance
                    // (Note: Obstacles usually have distance: null, so they are skipped here)
                    if (neighbor.distance !== null && neighbor.distance < minDistance) {
                        minDistance = neighbor.distance;
                        bestDir = { x: dc, y: dr }; // Point towards this neighbor
                    }
                }
            }

            // Store the vector pointing to the "downhill" neighbor
            cell.vec = bestDir;
        }
    }

    draw(); // Redraw the grid with the new vectors
}

function isValid(r, c) {
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

// --- Event Listeners ---

function handleCanvasClick(e) {
    debugger;
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
    for(let i=1; i<GRID_SIZE-1; i++) {
        for(let j=1; j<GRID_SIZE-1; j++) {
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
document.getElementById('btn-wavefront').addEventListener('click', runWavefront);
document.getElementById('btn-gradient').addEventListener('click', runGradient);
canvas.addEventListener('click', handleCanvasClick);

// --- Start ---
initGrid();
draw();