// import { mat4 } from 'gl-matrix';
import Shader from './shader.js';
import Shape from './shape.js';
import Camera from './camera.js';
import Material from './material.js';
import vertexShaderSource from './shaders/vertexShader.js';
import fragmentShaderSource from './shaders/fragmentShader.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';

const canvas = document.getElementById('game-surface');
const gl = canvas.getContext('webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);


const camera = new Camera({aspect:canvas.width /canvas.height});
camera.setPosition([0, 0, 50]);
camera.updateProjection();
camera.updateView();

//uniform size: [1,10]

//attribute:
    // X, Y, Z         U, V


//Point ==> Quad
//POS           UV 0,1,
//POS           UV 0,0,
//POS           UV 1,0,


//POS           UV 0,1,
//POS           UV 1,0,
//POS           UV 1,1,

//genParticle(minX,maxX,minY,maxY,minZ,maxZ)
// P0x = Math.random()*(maxX-minX);
// P0,    0, 0,
// P0,     1, 0,
// P0,     1, 1,
// P0,    0, 1,

// P1,    0, 0,
// P1,     1, 0,
// P1,     1, 1,
// P1,    0, 1,


// P2,    0, 0,
// P2,     1, 0,
// P2,     1, 1,
// P2,    0, 1,

function generatePos() {
    const posArray = [];
    const startX = -8;
    const startY = -8;
    const spacing = 2;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const posX = startX + j * spacing;
            const posY = startY + i * spacing;

            posArray.push([posX, posY, -1.0]);
        }
    }

    return posArray;
}

function genQuadWithUV(out, index) {
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

let posArray = [];
let outArray = [];
posArray = generatePos();
for (let pos of posArray) {
    genQuadWithUV(outArray, pos);
}

const shape = new Shape({
    data: {
        vertice: outArray
    }
});

const shader = new Shader({
    vertexSource: vertexShaderSource,
    fragmentSource: fragmentShaderSource,
    initValues:{uTexture:0}
});

shader.initialize(gl);
shape.initialize({ gl });

const texture = new Texture2D();
texture.initialize(gl, './resources/crate.png');

const transform = new Transform();
transform.setPosition(0, 0, 0);

const material = new Material({
    shader: shader,
    texture: texture,  
})

material.initialize({gl});

material.setTexture('uTexture',texture);

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

const cellSizes = [];
const posCount = posArray.length; // 假设有64个 POS
for (let i = 0; i < posCount; i++) {
    cellSizes[i] = getRandomArbitrary(1, 10);
}


function draw() {

    gl.clearColor(0.5, 0.7, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let i = 0; i < posArray.length; i++) {
        material.uniforms.uCellSize.value = cellSizes[i];
        material.draw(gl, camera, transform);
    }

    shape.draw(gl, material);

    requestAnimationFrame(draw);
}

draw();
