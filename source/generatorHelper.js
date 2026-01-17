import { halton, sqrtFloor } from "./mathHelper.js";

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

export function genQuadUVXZ(size){
    const halfSize = 0.5*size;
    return [
        -halfSize,      0,    -halfSize,        0, 0,
        -halfSize,      0,    halfSize,         0, 1,
        halfSize,       0,     halfSize,        1, 1,
        -halfSize,      0,    -halfSize,        0, 0,
        halfSize,       0,    halfSize,         1, 1,
        halfSize,       0,     -halfSize,       1, 0,
    ]
}

export function genQuadUVXY(size){
    const halfSize = 0.5*size;
    return [
        -halfSize,     -halfSize,   0, 0,
        -halfSize,     halfSize,    0, 1,
        halfSize,       halfSize,   1, 1,
        -halfSize,     -halfSize,   0, 0,
        halfSize,      halfSize,    1, 1,
        halfSize,       -halfSize,  1, 0,
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
            const isGoal = (c === goal[0] && r === goal[1]) ? 1 : 0;
            const dist = isGoal ? 0 : Infinity;

            initData.push(dist, isObstacle, isGoal, 0);
        }
    }

    return new Float32Array(initData);
}
