import Shader from "../../source/shader.js";
import Transform from "../../source/transform.js";
import Material from "../../source/material.js";
import Shape from "../../source/shape.js";
import Texture2D from "../../source/texture2d.js";
import Solver from "../../source/solver.js";
import SolverMaterial from "../../source/solverMaterial.js";
import SolverShape from "../../source/solverShape.js";
import {readAttrSchema} from "../../source/shapeHelper.js";

import quadVert from "../../shaders/glsl/quad-vert.glsl";
import quadFrag from "../../shaders/glsl/quad-frag.glsl";
import bkgVert from "../../shaders/glsl/background-vert.glsl";
import bkgFrag from "../../shaders/glsl/background-frag.glsl";
import wavefrontFrag from "../../shaders/glsl/wavefront-frag.glsl";
import FrameSolver from "../../source/frameSolver.js";



const canvas = document.getElementById('2dCanvas');
const glCanvas = document.getElementById("glCanvas");
const ctx = canvas.getContext('2d');
const gl = glCanvas.getContext('webgl2');

const GRID_SIZE = 16;
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

function genInitData(gridSize) {
    const initData = [];

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            initData.push(Infinity, grid[r][c].type === 'obstacle' ? 1 : 0, 0, 0);
        }
    }

    return new Float32Array(initData);
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

    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (cell.type === 'end') {
        ctx.fillText('e', centerX, centerY);
    } else if (cell.distance !== null) {    // && cell.type === 'empty'
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

// --- Start ---

function main() {

    initGrid();

    const wavefrontShader = new Shader({
        vertexSource: bkgVert,
        fragmentSource: wavefrontFrag,
    });
    wavefrontShader.initialize({gl});

    const wavefrontMaterial = new Material('wavefrontMaterial',{
        shader: wavefrontShader,
    });
    wavefrontMaterial.initialize({gl});

    const wavefrontShape = new Shape('wavefrontShape', {
        count:6, schema: readAttrSchema(bkgVert.input)
    });
    wavefrontShape.initialize({gl});

    const wavefrontSolver = new FrameSolver({
        shape: wavefrontShape, material: wavefrontMaterial,
        width: GRID_SIZE, height: GRID_SIZE,
        screenWidth: glCanvas.width, screenHeight: glCanvas.height,
        mode:1,
    })
    wavefrontSolver.initialize({gl});

    wavefrontMaterial.setUniform('uGridSize', GRID_SIZE);

    const wavefrontTexture = new Texture2D('wavefrontTexture', {
        width: GRID_SIZE, height: GRID_SIZE,
        scaleDown: 'LINEAR', scaleUp: 'LINEAR',
    })
    wavefrontTexture.initialize({gl});
    wavefrontMaterial.setTexture('uWavefrontTexture', wavefrontTexture);

    wavefrontSolver.Mode = FrameSolver.MODE.init;

    draw();

    function runWavefront() {

        if (!endCell) {
            alert("Please select an 'end' cell first.");
            return;
        }

        wavefrontTexture.setData(gl, genInitData(GRID_SIZE))
        wavefrontMaterial.setUniform('uGoal', [endCell.c, endCell.r]);

        wavefrontSolver.update(gl);

        const pixels = wavefrontSolver.pixels;

        for(let i=1; i<GRID_SIZE-1; i++)
            for (let j=1; j<GRID_SIZE-1; j++) {
                grid[i][j].distance = pixels[4*(i*GRID_SIZE+j)];
            }

        if (wavefrontSolver.Mode === FrameSolver.MODE.init) {
            wavefrontSolver.Mode = FrameSolver.MODE.play;
        }

        draw();

        requestAnimationFrame(runWavefront);
    }

    document.getElementById('btn-obstacle').addEventListener('click', () => setMode('obstacle', 'btn-obstacle'));
    document.getElementById('btn-end').addEventListener('click', () => setMode('end', 'btn-end'));
    document.getElementById('btn-wavefront').addEventListener('click', () =>runWavefront());
    document.getElementById('btn-gradient').addEventListener('click', () => runGradient);
    canvas.addEventListener('click', handleCanvasClick);
}

// This listens to EVERY click on the page and tells you exactly what got hit
// window.addEventListener('click', (e) => {
//     console.log("------------------------------");
//     console.log("TARGET HIT:", e.target);
//     console.log("ID:", e.target.id);
//     console.log("Pointer Events:", getComputedStyle(e.target).pointerEvents);
//     console.log("Z-Index:", getComputedStyle(e.target).zIndex);
// }, true);

main();
