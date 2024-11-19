import Shader from './shader.js';
import Shape from './shape.js';
import Camera from './camera.js';
import Material from './material.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import StaticEmitter from './staticemitter.js';
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
let particleTransform = null;
let particleMaterial = null;
let particleShape = null;
let particleSystem = null;
let rampTexture = null;
let colorTexture = null;

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
camera.setPosition([0, 0, -300]);
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

    let posArray = genPos();
    let outArray = [];
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

    // init particle transform
    particleTransform = new Transform();
    particleTransform.setPosition(0, 0, 0);

    // init particle texture
    rampTexture = new Texture2D('rampTexture');
    rampTexture.setColorRamp(gl,
        [1, 1, 0, 1,
            1, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 0.5,
            0, 0, 0, 0
        ]);

    colorTexture = new Texture2D('colorTexture');
    const pixelBase = [0, 0.20, 0.70, 1, 0.70, 0.20, 0, 0];
    const pixels = [];
    for (let yy = 0; yy < 8; ++yy) {
        for (let xx = 0; xx < 8; ++xx) {
            const pixel = pixelBase[xx] * pixelBase[yy];
            pixels.push(pixel, pixel, pixel, pixel);
        }
    }
    colorTexture.createTextureFromFloats(gl, 8, 8, pixels);

    // init particle material
    particleMaterial = new Material({
        shader: particleShader,
        timeRange: 2
    })
    particleMaterial.initialize({ gl });
    particleMaterial.setTexture('rampSampler', rampTexture);
    particleMaterial.setTexture('colorSampler', colorTexture);

    particleShape = new StaticEmitter({
        data:{
            numParticles: 20,
            lifeTime: 2,
            startSize: 50,
            endSize: 90,
            velocity: [0, 60, 0],
            velocityRange: [15, 15, 15],
            spinSpeedRange: 4
        }},
        pseudoRandom
    )
    particleShape.initialize({ gl });

    drawParticles();
}

function drawParticles() {
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.colorMask(true, true, true, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    particleMaterial.draw(gl, camera, particleTransform);

    particleShape.draw(gl, particleMaterial);

    if (fpsCounter) {
        fpsCounter.update();
    }
    
    requestAnimationFrame(drawParticles);
}

function main() {

    // initSimpleQuad();
    initParticles();
}

main();