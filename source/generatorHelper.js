import { halton, sqrtFloor } from "./mathHelper.js";
import { $assert, isNum } from "./common/commonHelper.js";
import { vec2, vec3, mat2, mat3 } from "./common/lib/math/index.js";
Math.maxInt = 65535, Math.minInt = -65535;

export function genInitData(count, stride) {

    const initData = new Float32Array(count * stride);

    return initData;
}

export function genRectHaltonPos(scale, corner, MAXCOL, minSize, maxSize, duration, gridConfig) {

    const localXStart = corner[0];
    const localYStart = corner[1];
    const targetCount = MAXCOL * MAXCOL;

    const obstacleSet = new Set();
    let gridSize = 1;

    if (gridConfig) {
        gridSize = gridConfig.gridSize;
        if (gridConfig.obstacles) {
            for (const [obsX, obsY] of gridConfig.obstacles) {
                const flippedY = (gridSize - 1) - obsY;
                obstacleSet.add(`${obsX},${flippedY}`);
            }
        }
    }

    const posPixels = [];
    let validParticlesFound = 0;
    let seedIndex = 0;
    let safetyCounter = 0;
    const MAX_ATTEMPTS = targetCount * 50;

    while (validParticlesFound < targetCount) {

        if (safetyCounter++ > MAX_ATTEMPTS) {
            console.warn("Could not find enough valid positions. Map might be full.");
            break;
        }

        const haltonX = halton(2, seedIndex);
        const haltonY = halton(3, seedIndex);

        const gridX = Math.floor(haltonX * gridSize);
        const gridY = Math.floor(haltonY * gridSize);

        if (obstacleSet.has(`${gridX},${gridY}`)) {
            seedIndex++;
            continue;
        }

        const localX = localXStart + haltonX * scale;
        const localY = localYStart + haltonY * scale;
        const size = minSize + Math.random() * (maxSize - minSize);

        const startTime = validParticlesFound * duration / targetCount;

        posPixels.push(localX, localY, size, startTime);

        validParticlesFound++;
        seedIndex++;
    }

    return new Float32Array(posPixels);
}

export function genQuadUVXZ(size) {
    const halfSize = 0.5 * size;
    return [
        -halfSize, 0, -halfSize, 0, 0,
        -halfSize, 0, halfSize, 0, 1,
        halfSize, 0, halfSize, 1, 1,
        -halfSize, 0, -halfSize, 0, 0,
        halfSize, 0, halfSize, 1, 1,
        halfSize, 0, -halfSize, 1, 0,
    ]
}

export function genQuadUVXY(size) {
    const halfSize = 0.5 * size;
    return [
        -halfSize, -halfSize, 0, 0,
        -halfSize, halfSize, 0, 1,
        halfSize, halfSize, 1, 1,
        -halfSize, -halfSize, 0, 0,
        halfSize, halfSize, 1, 1,
        halfSize, -halfSize, 1, 0,
    ]
}

export function genWavefrontInitData(gridSize) {
    const initData = [];

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            initData.push(Infinity, 0, 0, 0);
        }
    }

    return new Float32Array(initData);
}

export function genWavefrontInitDataJSON(config) {
    const { gridSize, goal, obstacles } = config;
    const initData = [];

    const obstacleSet = new Set();
    obstacles.forEach(([x, y]) => {
        obstacleSet.add(`${x},${y}`);
    });


    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {

            const isObstacle = obstacleSet.has(`${c},${r}`) ? 1 : 0;
            const isGoal = (c === Math.floor(goal[0]) && r === Math.floor(goal[1])) ? 1 : 0;
            const dist = isGoal ? 0 : Infinity;

            initData.push(dist, isObstacle, isGoal, 0);
        }
    }

    return new Float32Array(initData);
}

export function genWavefrontDataClick(config, clickPos) {
    const { gridSize, obstacles } = config;
    const initData = [];

    const obstacleSet = new Set();
    obstacles.forEach(([x, y]) => {
        obstacleSet.add(`${x},${y}`);
    });

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {

            const isGoal = (clickPos && c === Math.floor(clickPos.x) && r === Math.floor(clickPos.y));
            const isObstacle = obstacleSet.has(`${c},${r}`) ? 1 : 0;
            const dist = isGoal ? 0 : Infinity;

            initData.push(dist, isObstacle, 0, 1);
        }
    }

    return new Float32Array(initData);
}

export function getMouseScreenPos(event, canvas) {
    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return [mouseX, mouseY];
}

export function getMouseGridPosition(event, canvas, gridSize) {
    const [mouseX, mouseY] = getMouseScreenPos(event, canvas);

    const normX = mouseX / rect.width;
    const normY = mouseY / rect.height;

    const gridX = Math.floor(normX * gridSize);
    const gridY = Math.floor(normY * gridSize);

    if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
        return null;
    }

    return { x: gridX, y: gridY };
}

export function col2Array(str) {
    const digitStr = str.match(/rgb[a]?\(([\d.,\s]+)\)/)[1];
    $assert(digitStr);

    const [r, g, b, a] = digitStr.split(',').map(ele => Number(ele));
    return [r / 255, g / 255, b / 255, a];

}

export function SET_TEXCOL_BY_BOUNDARY(out, boundaryArr, width, height, settingCol = 'rgba(255,255,255,1)', scale = 1) {
    const [r, g, b, a] = col2Array(settingCol);
    for (let boundary of boundaryArr) {
        if (boundary === null) continue;
        for (let row = boundary[1]; row < Math.min(boundary[1] + (boundary[3] ?? 1), height); row++)
            for (let col = boundary[0]; col < Math.min(boundary[0] + (boundary[2] ?? 1), width); col++) {

                const index = row * width + col;
                out[index * 4] = r;
                out[index * 4 + 1] = g;
                out[index * 4 + 2] = b;

                //ATTN: blockValue being mul with 10.0 in shader grid-frag.glsl
                out[index * 4 + 3] = a * scale;
            }
    }
}

export function world2Boundary(startPos, endPos, gridNum, gridUnitSize) {
    const start = [0, 0],
        end = [0, 0];

    screen2Index(start, startPos, gridNum, 'isometric', gridUnitSize);
    screen2Index(end, endPos, gridNum, 'isometric', gridUnitSize);

    const boundary = [0, 0, 0, 0];
    $selection2Boundary(boundary, [start, end]);
    return boundary;
}

export function screen2Index(out, pos, gridNum, mode = 'isometric', GRID_UNIT_SIZE = 1) {
    $assert(pos);
    let local = [0, 0];

    iso2Local(local, pos, GRID_UNIT_SIZE);

    let [x, y] = local;
    [out[0], out[1]] = [Math.floor(x), Math.floor(y)];
    out[0] = out[0].clamp(0, gridNum[0]);
    out[1] = out[1].clamp(0, gridNum[1]);
    $assert(isNum(out[0]));
}

export function $selection2Boundary(boundary, selection) {
    $assert(Array.isArray(selection[0]))
    let minCOL = Math.maxInt, minROW = Math.maxInt, maxCOL = 0, maxROW = 0;
    for (let [col, row] of selection) {
        minCOL = Math.min(minCOL, col);
        minROW = Math.min(minROW, row);
        maxCOL = Math.max(maxCOL, col);
        maxROW = Math.max(maxROW, row);
    }
    boundary[0] = minCOL,
        boundary[1] = minROW,
        boundary[2] = maxCOL - minCOL + 1,
        boundary[3] = maxROW - minROW + 1;
}

function iso2Local(out, input, GRID_UNIT_SIZE = 1) {

    //ISO_MAT(s) mat3(vec3(float(s)*0.5,-float(s)*0.25,0.0),vec3(-float(s)*0.5,-float(s)*0.25,0.0),vec3(0.0, 0.0, 1.0))
    //The inverse matrix of  ISO_MAT(2)

    const invISO = [0, 0, 0, 0];

    invISO[0] = 0.5 * GRID_UNIT_SIZE, invISO[2] = -0.5 * GRID_UNIT_SIZE,
        invISO[1] = -0.25 * GRID_UNIT_SIZE, invISO[3] = -0.25 * GRID_UNIT_SIZE;

    mat2.invert(invISO, invISO);
    // invISO[0] = 0.5,     invISO[2] = -1,
    // invISO[1] = -0.5,    invISO[3] = -1;
    vec2.transformMat2(out, input, invISO);
}
