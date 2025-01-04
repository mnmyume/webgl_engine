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

export function testGenPos(width=512,height=512) {
    const posPixels = [];

    for(let row = 0 ; row<height;row++)
        for(let col = 0 ; col<width;col++)
            posPixels.push(50.0, 0.0, 0.0, 1.0);

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
export function generateCirclePosRandom(numParticle, startSize, endSize) {
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
        const speed = (angle / (2 * Math.PI)) * 60;

        posPixels.push(tangentX * speed, tangentY * speed, 0.0, endSize);

    }

    return posPixels;
}