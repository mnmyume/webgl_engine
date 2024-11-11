import Shader from './shader.js';
import Shape from './shape.js';
import Camera from './camera.js';
import Material from './material.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import { ParticleStateIds, ParticleSystem } from './particle.js';

import SHADER_STRINGS from '../shaders/particleShader.js';

const canvas = document.getElementById('game-surface');
const gl = canvas.getContext('webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const fps = document.getElementById("fps");
if (!fps) {
    console.log('fps error')
}
const fpsCounter = new FPSCounter(fps);

let g_randSeed = 0;
let g_randRange = Math.pow(2, 32);
function pseudoRandom() {
    return (g_randSeed = (134775813 * g_randSeed + 1) % g_randRange) /
        g_randRange;
}

// init camera
const camera = new Camera({aspect:canvas.width /canvas.height});
camera.setPosition([0, 0, -600]);
camera.updateProjection();
camera.updateView();
camera.updateViewInverse();
import {basicVert,basicFrag} from "../shaders/output.js";
// init shader
const shader = new Shader({
    vertexSource: basicVert,
    fragmentSource: basicFrag,
});
shader.initialize({ gl });

// init texture
const image = new Image();
image.src = './resources/particle-anim.png';
const texture = new Texture2D('anim', {
    image: image 
});
texture.initialize({ gl });

// init transform
const transform = new Transform();
transform.setPosition(0, 0, 0);

// init material
const material = new Material({
    shader: shader,
})
material.initialize({ gl });
// material.setTexture('uTexture',texture);

let posArray = [];
const startX = -8;
const startY = -8;
const spacing = 2;
function genPos(){
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
        [0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0]
    ];

    for (let i = 0; i < uvCoordinates.length; i++) {
        const uv = uvCoordinates[i];
        out.push(...index, ...uv);
    }
}

let outArray = [];
posArray = genPos();
for (let pos of posArray) {
    genQuadWithUV(outArray, pos);
}

const shape = new Shape({
    data: {
        vertice: outArray
    }
});

// init particle system
const particleSystem = new ParticleSystem(gl, null, pseudoRandom);
function setupFlame() {
    const emitter = particleSystem.createParticleEmitter();
    emitter.setTranslation(0, 0, 0);
    emitter.setState(ParticleStateIds.ADD);
    emitter.setColorRamp(
        [1, 1, 0, 1,
            1, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 0.5,
            0, 0, 0, 0
        ]);
    emitter.setParameters({
        numParticles: 20,
        lifeTime: 2,
        timeRange: 2,
        startSize: 50,
        endSize: 90,
        velocity: [0, 60, 0],
        velocityRange: [15, 15, 15],
        spinSpeedRange: 4
    });
}

function setupSmoke() {
    const emitter = particleSystem.createParticleEmitter();
    emitter.setTranslation(500, 0, 0);
    emitter.setState(ParticleStateIds.BLEND);
    emitter.setColorRamp(
        [0, 0, 0, 1,
            0, 0, 0, 0
        ]);
    emitter.setParameters({
        numParticles: 20,
        lifeTime: 2,
        timeRange: 2,
        startSize: 100,
        endSize: 150,
        velocity: [0, 200, 0],
        velocityRange: [20, 0, 20],
        spinSpeedRange: 4
    });
}

function setupAnim() {
    const emitter = particleSystem.createParticleEmitter();
    emitter.setTranslation(300, 0, 0);
    emitter.setColorRamp(
        [1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 0
        ]);
    emitter.setParameters({
        numParticles: 20,
        numFrames: 8,
        frameDuration: 0.25,
        frameStartRange: 8,
        lifeTime: 2,
        timeRange: 2,
        startSize: 50,
        endSize: 90,
        positionRange: [10, 10, 10],
        velocity: [0, 200, 0],
        velocityRange: [75, 15, 75],
        acceleration: [0, -150, 0],
        spinSpeedRange: 1
    });
}

function draw() {

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.colorMask(true, true, true, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    material.draw(gl, camera, transform);

    particleSystem.draw(material);

    if (fpsCounter) {
        fpsCounter.update();
    }
    
    requestAnimationFrame(draw);
}

// main
setupFlame();
// setupAnim();



draw();


//initSimpleQuad()
//initParticle()