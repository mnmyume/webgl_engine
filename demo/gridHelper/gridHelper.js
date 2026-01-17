import Shader from "../../source/shader.js";
import Transform from "../../source/transform.js";
import Material from "../../source/material.js";
import Shape from "../../source/shape.js";
import Texture2D from "../../source/texture2d.js";
import Solver from "../../source/solver.js";
import SolverMaterial from "../../source/solverMaterial.js";
import SolverShape from "../../source/solverShape.js";
import FrameSolver from "../../source/frameSolver.js";
import {readAttrSchema} from "../../source/shapeHelper.js";

import quadVert from "../../shaders/glsl/quad-vert.glsl";
import quadFrag from "../../shaders/glsl/quad-frag.glsl";
import screenQuadVert from "../../shaders/glsl/background-vert.glsl";
import screenQuadFrag from "../../shaders/glsl/background-frag.glsl";
import wavefrontFrag from "./_wavefront-frag.glsl";
import gradientFrag from "../../shaders/glsl/gradient-frag.glsl";


const canvas = document.getElementById('2dCanvas');
const glCanvas = document.getElementById("glCanvas");
const ctx = canvas.getContext('2d');
const gl = glCanvas.getContext('webgl2');

const GRID_SIZE = 32;
const CELL_SIZE = canvas.width / GRID_SIZE;

let grid = [];
let currentMode = null; // 'obstacle' or 'end'
let endCell = null;

function exportMapConfig() {
    if (!endCell) {
        alert("Cannot export: Please select an 'end' cell first.");
        return;
    }

    const obstacles = [];

    // Iterate through the grid to find all obstacles
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            // We verify it's an obstacle
            if (grid[r][c].type === 'obstacle') {
                // Normalize coordinates (0.0 to 1.0)
                // c = x-axis, r = y-axis
                obstacles.push([
                    c,
                    r
                ]);
            }
        }
    }

    // Construct the data object
    const mapData = {
        gridSize: GRID_SIZE,
        goal: [
            endCell.c,
            endCell.r
        ],
        obstacles: obstacles
    };

    // Convert to JSON and create a download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData, null, 2));
    const downloadAnchor = document.createElement('a');

    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "grid_config.json");

    document.body.appendChild(downloadAnchor); // Required for Firefox
    downloadAnchor.click();
    downloadAnchor.remove();
}

// --- Initialization ---

function initGrid() {
    grid = [];

    for (let r = 0; r < GRID_SIZE; r++) {
        let row = [];
        for (let c = 0; c < GRID_SIZE; c++) {

            let cellType = 'empty';

            // Boundary
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

    ctx.fillStyle = 'gainsboro';
    ctx.font = '13px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (cell.type === 'end') {
        ctx.fillText('e', centerX, centerY);
    } else if (cell.distance !== null) {    // && cell.type === 'empty'
        const text = cell.distance === Infinity ? '∞' : cell.distance;
        ctx.fillText(text, centerX, centerY);
    }

    // --- Arrow Drawing ---
    if (cell.vec) {
        const endX = centerX - cell.vec.x;
        const endY = centerY - cell.vec.y;

        drawArrow(ctx, centerX, centerY, endX, endY);
    }
}

function drawArrow(ctx, fromx, fromy, tox, toy) {
    const headlen = 8;      // Size of the arrow tip
    const fixedLength = 20; // Fixed visual length in frameData (fits in cell)

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

    // --- wavefront init ---

    const wavefrontShader = new Shader({
        vertexSource: screenQuadVert,
        fragmentSource: wavefrontFrag,
    });
    wavefrontShader.initialize({gl});

    const wavefrontMaterial = new Material('wavefrontMaterial',{
        shader: wavefrontShader,
    });
    wavefrontMaterial.initialize({gl});

    const wavefrontShape = new Shape('wavefrontShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    wavefrontShape.initialize({gl});

    const wavefrontSolver = new FrameSolver('wavefrontSolver', {
        shape: wavefrontShape, material: wavefrontMaterial,
        width: GRID_SIZE, height: GRID_SIZE,
        screenWidth: glCanvas.width, screenHeight: glCanvas.height,
        mode:1,
    });
    wavefrontSolver.initialize({gl});

    wavefrontMaterial.setUniform('uGridSize', GRID_SIZE);

    const wavefrontTexture = new Texture2D('wavefrontTexture', {
        width: GRID_SIZE, height: GRID_SIZE,
        scaleDown: 'LINEAR', scaleUp: 'LINEAR',
    })
    wavefrontTexture.initialize({gl});
    wavefrontMaterial.setTexture('uWavefrontTexture', wavefrontTexture);

    wavefrontSolver.Mode = FrameSolver.MODE.init;

    // --- gradient init ---

    const gradientShader = new Shader({
        vertexSource: screenQuadVert,
        fragmentSource: gradientFrag,
    });
    gradientShader.initialize({gl});

    const gradientMaterial = new Material('gradientMaterial', {
        shader: gradientShader,
    });
    gradientMaterial.initialize({gl});

    const gradientShape = new Shape('gradientShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    gradientShape.initialize({gl});

    const gradientSolver = new FrameSolver('gradientSolver', {
        shape: gradientShape, material: gradientMaterial,
        width: GRID_SIZE, height: GRID_SIZE,
        screenWidth: glCanvas.width, screenHeight: glCanvas.height,
        mode:1,
    });
    gradientSolver.initialize({gl});

    gradientMaterial.setUniform('uGridSize', GRID_SIZE);


    draw();

    function runWavefront() {

        if (!endCell) {
            alert("Please select an 'end' cell first.");
            return;
        }

        wavefrontTexture.setData(gl, genInitData(GRID_SIZE))
        wavefrontMaterial.setUniform('uGoal', [endCell.c, endCell.r]);

        wavefrontSolver.update(gl);

        const frameData = wavefrontSolver.readFrameBuffer(gl);

        for(let i=0; i<GRID_SIZE; i++)
            for (let j=0; j<GRID_SIZE; j++) {
                grid[i][j].distance = frameData[4*(i*GRID_SIZE+j)];
            }

        if (wavefrontSolver.Mode === FrameSolver.MODE.init) {
            wavefrontSolver.Mode = FrameSolver.MODE.play;
        }

        draw();

        requestAnimationFrame(runWavefront);
    }

    function runGradient() {

        if (!endCell) {
            alert("Please select an 'end' cell first.");
            return;
        }

        gradientMaterial.setTexture('uWavefrontTexture', wavefrontSolver.frontBuffer.textures[0]);

        gradientSolver.update(gl);

        const frameData = gradientSolver.readFrameBuffer(gl);

        for(let i=0; i<GRID_SIZE; i++)
            for (let j=0; j<GRID_SIZE; j++) {
                if (grid[i][j].type !== 'end')
                    grid[i][j].vec = { x: frameData[4*(i*GRID_SIZE+j)], y: frameData[4*(i*GRID_SIZE+j)+1] };
            }

        draw();

        requestAnimationFrame(runGradient);
    }

    document.getElementById('btn-obstacle').addEventListener('click', () => setMode('obstacle', 'btn-obstacle'));
    document.getElementById('btn-end').addEventListener('click', () => setMode('end', 'btn-end'));
    document.getElementById('btn-export').addEventListener('click', () => exportMapConfig());
    document.getElementById('btn-wavefront').addEventListener('click', () =>runWavefront());
    document.getElementById('btn-gradient').addEventListener('click', () => runGradient());
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
