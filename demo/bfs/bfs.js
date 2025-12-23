const canvas = document.getElementById('gridCanvas');
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
    } else if (cell.distance !== null && cell.type !== 'obstacle') {
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
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude === 0) return;

    // 2. Determine Color (Green -> Red) based on magnitude
    // We clamp the magnitude at 5.0 for the color scale
    const maxMag = 5;
    const ratio = Math.min(magnitude / maxMag, 1);
    const hue = 120 * (1 - ratio); // 120=Green, 0=Red
    const color = `hsl(${hue}, 100%, 40%)`;

    // 3. Normalize the vector to the fixed visual length
    const angle = Math.atan2(dy, dx);
    const endX = fromx + Math.cos(angle) * fixedLength;
    const endY = fromy + Math.sin(angle) * fixedLength;

    // 4. Draw the Arrow
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(endX, endY);

    // Draw the arrowhead tips
    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
}

// --- BFS Algorithm ---

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

function runGradient() {
    // 1. Check if BFS has been run (distances exist)
    if (!endCell || grid[endCell.r][endCell.c].distance === null) {
        alert("Please run BFS first to calculate distances.");
        return;
    }

    // 2. Iterate grid to calculate derivatives
    // We stop at GRID_SIZE - 1 because we need a right/bottom neighbor
    for (let r = 0; r < GRID_SIZE - 1; r++) {
        for (let c = 0; c < GRID_SIZE - 1; c++) {

            let cell = grid[r][c];

            // Skip obstacles or unvisited cells
            if (cell.type === 'obstacle' || cell.type === 'end' || cell.distance === null) {
                cell.vec = null;
                continue;
            }

            let rightCell = grid[r][c + 1];
            let bottomCell = grid[r + 1][c];

            // Get distances (treat null neighbor as infinity/very high to force gradient away)
            // Obstacles already have high distance (2*GRID_SIZE) from initGrid
            let dCurrent = cell.distance;
            let dRight = rightCell.distance !== null ? rightCell.distance : 999;
            let dBottom = bottomCell.distance !== null ? bottomCell.distance : 999;

            // Calculate Gradient: (df/dx, df/dy)
            let dx = rightCell.distance !== null ? rightCell.distance - dCurrent : 0;
            let dy = bottomCell.distance !== null ? bottomCell.distance - dCurrent : 0;

            // Store vector in the cell
            cell.vec = { x: dx, y: dy };
        }
    }

    draw(); // Redraw the grid with vectors
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
document.getElementById('btn-gradient').addEventListener('click', runGradient);
canvas.addEventListener('click', handleCanvasClick);

// --- Start ---
initGrid();
draw();