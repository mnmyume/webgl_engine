import Shader from './shader.js';
import Shape from './shape.js';
import Camera from './camera.js';
import Material from './material.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import { ParticleStateIds, ParticleSystem } from './particle.js';
import { basicVert, basicFrag, particle3dVert, particle2dVert, particleFrag } from "../shaders/output.js";

const canvas = document.getElementById('game-surface');
const gl = canvas.getContext('webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// definite
let quadShader = null;
let quadImage = null;
let quadTexture = null;
let quadTransform = null;
let quadMaterial = null;
let quadShape = null; 

let particleShader = null;
let particleImage = null;
let particleTexture = null;
let particleTransform = null;
let particleMaterial = null;
let particleShape = null;
let particleSystem = null;

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
camera.setPosition([0, 0, -100]);
camera.updateProjection();
camera.updateView();
camera.updateViewInverse();

function genPos() {
    let posArray = [];
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

function initSimpleQuad() { 

    // init quad shader
    quadShader = new Shader({
        vertexSource: basicVert,
        fragmentSource: basicFrag,
    });
    quadShader.initialize({ gl });

    // init texture
    quadImage = new Image();
    quadImage.src = '../resources/crate.png';
    quadTexture = new Texture2D('crate', {
        image: quadImage 
    });
    quadTexture.initialize({ gl });

    // init transform
    quadTransform = new Transform();
    quadTransform.setPosition(0, 0, 0);

    // init material
    quadMaterial = new Material({
        shader: quadShader,
    })
    quadMaterial.initialize({ gl });
    // quadMaterial.setTexture('uTexture', quadTexture); 

    let outArray = [];
    let posArray = genPos();
    for (let pos of posArray) {
        genQuadWithUV(outArray, pos);
    }

    quadShape = new Shape({
        data: {
            vertice: outArray
        }
    });
    quadShape.initialize({ gl });

    drawSimpleQuad();
}

function drawSimpleQuad() {

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.colorMask(true, true, true, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    quadMaterial.draw(gl, camera, quadTransform);

    quadShape.draw(gl, quadMaterial);

    if (fpsCounter) {
        fpsCounter.update();
    }
    
    requestAnimationFrame(drawSimpleQuad);
}

function initParticles() {

    // init particle shader
    particleShader = new Shader({
        vertexSource: particle2dVert,
        fragmentSource: particleFrag,
    });
    particleShader.initialize({ gl });

    // init particle texture
    particleImage = new Image();
    particleImage.src = '../resources/particle-anim.png';
    particleTexture = new Texture2D('anim', {
        image: particleImage 
    });
    particleTexture.initialize({ gl });

    // init particle transform
    particleTransform = new Transform();
    particleTransform.setPosition(0, 0, 0);

    // init particle material
    particleMaterial = new Material({
        shader: particleShader,
    })
    particleMaterial.initialize({ gl });

    particleSystem = new ParticleSystem(gl, null, pseudoRandom);

    setupFlame();
    // setupAnim();

    drawParticles();
}

function drawParticles() {
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.colorMask(true, true, true, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    particleMaterial.draw(gl, camera, particleTransform);

    particleSystem.draw(particleMaterial);

    if (fpsCounter) {
        fpsCounter.update();
    }
    
    requestAnimationFrame(drawParticles);
}

function main() {

    initSimpleQuad();
    // initParticles();
}

main();