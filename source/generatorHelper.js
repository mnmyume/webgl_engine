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

function halton(base, index) {
    let result = 0.0;
    let digitWeight = 1.0;
    
    while (index > 0) {
        digitWeight = digitWeight / base;
        let nominator = index - Math.floor(index / base) * base;  // mod
        result += nominator * digitWeight;
        index = Math.floor(index / base);  
    }
    
    return result;
}


export function genRectHaltonPos(width, height, corner, fbWidth, fbHeight) {
    const posPixels = [];
    
    const xStart = corner[0];  
    const zStart = corner[1];  

    const stepX = width / fbWidth;  
    const stepZ = width / fbHeight;  

    for (let row = 0; row < fbHeight; row++) {
        for (let col = 0; col < fbWidth; col++) {
            const haltonX = halton(2, row * fbWidth + col);  
            const haltonZ = halton(3, row * fbWidth + col);  
            const px = xStart + col * stepX + haltonX * stepX;  
            const pz = zStart + row * stepZ + haltonZ * stepZ;  
            posPixels.push(px, height, pz, 1);  
        }
    }

    return new Float32Array(posPixels);  
}

export function genRectGridPos(width, height, corner, fbWidth, fbHeight) {
    const posPixels = [];
    
    const stepX = width / (fbWidth - 1);  
    const stepY = height / (fbHeight - 1);  

    const xStart = corner[0];  
    const yStart = corner[1];  
    
    for (let row = 0; row < fbHeight; row++) {
        for (let col = 0; col < fbWidth; col++) {
            const px = xStart + col * stepX;  
            const pz = yStart + row * stepY;  
            posPixels.push(px, 0, pz, 1);  
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

            posPixels.push(vx, vy, 0, 1);
        }

    return new Float32Array(posPixels);
}

export function testGenRandPos(width,height,fbWidth,fbHeight) {
    const posPixels = [];

    for(let row = 0; row < fbHeight; row++)
        for(let col = 0; col < fbWidth; col++){
            const px = (Math.random() * 2 - 1) * width/2;
            const py = (Math.random() * 2 - 1) * height/2;
            posPixels.push(px, py, 0, 1);
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

export function generateCirclePos(numParticle, generation) { 
    const posPixels = [];
    const radius = 50;

    for(let row = 0; row < generation; row++) {
        const offset = 2 * Math.PI / generation * row;  // Math.random() *
        for (let col = 0; col < numParticle; col++) {
            const angle = 2 * Math.PI / (numParticle) * col;
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
export function generateCirclePosVelRandom(numParticle, startSize, endSize) {
    const posPixels = [];
    const radius = 50;

    for(let i = 0; i < numParticle; i++) {

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

