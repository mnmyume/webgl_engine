import { halton } from "./mathHelper.js";

export function genPartiInfo(partiCount, geneCount, duration) {
    const posPixels = [];  
    const deltaTime = duration / partiCount;

    for (let row = 0; row < geneCount; row++) {
        for (let col = 0; col < partiCount; col++) {
            const px = col; // particle ID  
            const py = deltaTime * col;    // startTime  
            posPixels.push(px, py, 0, 0);  
        }
    }

    return new Float32Array(posPixels);  
}

export function genRectHaltonPos(width, height, corner, fbWidth, fbHeight, size) {
    const posPixels = [];
    
    const xStart = corner[0];  
    const zStart = corner[1];  

    for (let row = 0; row < fbHeight; row++) {
        for (let col = 0; col < fbWidth; col++) {
            const haltonX = halton(2, row * fbWidth + col);  
            const haltonZ = halton(3, row * fbWidth + col);  
            const px = xStart + haltonX * width;  
            const pz = zStart + haltonZ * width;  
            posPixels.push(px, height, pz, size);  
        }
    }

    return new Float32Array(posPixels);  
}

export function testGenVel(fbWidth,fbHeight) {
    const posPixels = [];

    for(let row = 0; row < fbHeight; row++)
        for(let col = 0; col < fbWidth; col++){
            const vx = 5*(Math.random() * 2 - 1); // Random value between -1 and 1
            const vy = 100*(-Math.random()); // Random value between -1 and 0

            // posPixels.push(vx, vy, 0, 1);
            posPixels.push(0,0,0,1)
        }

    return new Float32Array(posPixels);
}

export function testGenPos(fbWidth,fbHeight) {
    const posPixels = [];

    for(let row = 0; row < fbHeight; row++)
        for(let col = 0; col < fbWidth; col++)
            posPixels.push(0, 0, 0, 1);

    return new Float32Array(posPixels);
}

export function generateCirclePos(partiCount, generation) { 
    const posPixels = [];
    const radius = 50;

    for(let row = 0; row < generation; row++) {
        const offset = 2 * Math.PI / generation * row;  // Math.random() *
        for (let col = 0; col < partiCount; col++) {
            const angle = 2 * Math.PI / (partiCount) * col;
            const x = radius * Math.cos(angle + offset);
            const y = radius * Math.sin(angle + offset);

            posPixels.push(x, y, 0.0, 0.0);
        }
    }

    return posPixels;
}

// 0--duration(1s)
// 0 -1000ms (delta: 66.7) ==== rate:60 i++ (0-60)
// Math.Random()*2*PI ==> x,y
// startTime: i*66.7/1000
export function generateCirclePosVelRandom(partiCount, startSize, endSize) {
    const posPixels = [];
    const radius = 50;

    for(let i = 0; i < partiCount; i++) {

        // position
        const angle = Math.random() * 2 * Math.PI; 
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        posPixels.push(x, y, 0.0, startSize);

        // linearVelocity
        const tangentX = Math.sin(angle); 
        const tangentY = -Math.cos(angle);  
        const
            speedLength = 0,
            speed = (angle / (2 * Math.PI)) * speedLength;

        posPixels.push(tangentX * speed, tangentY * speed, 0.0, endSize);

    }

    return posPixels;
}

export function genUVData(width, height) {
    let uvArray = [];
    for (var y=0; y<height; ++y) {
        for (var x=0; x<width; ++x) {
          uvArray.push(x/width);
          uvArray.push(y/height);
        }
    }

    return new Float32Array(uvArray);
}

export function genQuadWithUV(out, index) {
    const uvCoordinates = [
        [0, 0],
        [0, 1],
        [1, 1],
        [0, 0],
        [1, 1],
        [1, 0]
    ];

    for (let i = 0; i < uvCoordinates.length; i++) {
        const uv = uvCoordinates[i];
        out.push(...index, ...uv);
    }
}
