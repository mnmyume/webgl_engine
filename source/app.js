import Shader from './shader.js';
import Shape from './shape.js';
import Camera from './camera.js';
import Material from './material.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import Time from './time.js';
import StaticEmitter from './staticEmitter.js';
import ParticleMaterial from './particleMaterial.js';

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
let rampTexture = null;
let colorTexture = null;
let posTexture = null;

const time = new Time();

const floatTextures = gl.getExtension('OES_texture_float');
if (!floatTextures) {
    console.error('OES_texture_float is not supported');
}
const floatLinearTextures = gl.getExtension('OES_texture_float_linear');
if (!floatLinearTextures) {
    console.warn('OES_texture_float_linear is not supported, using NEAREST filtering instead of LINEAR');
}
const g_fps = document.getElementById("fps");
if (!g_fps) {
    console.log('fps error')
}
const fpsCounter = new FPSCounter(g_fps);

let g_randSeed = 0;
let g_randRange = Math.pow(2, 32);
function pseudoRandom() {
    return (g_randSeed = (134775813 * g_randSeed + 1) % g_randRange) /
        g_randRange;
}

// init camera
const camera = new Camera({aspect:canvas.width /canvas.height});
camera.setPosition([0, 0, 300]);
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

function generateCirclePos(numParticle, generation) { 
    const posPixels = [];
    const radius = 50;

    for(let row = 0; row < generation; row++) {
        const offset = 2 * Math.PI / generation * row;// Math.random() *
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
function generateCirclePosRandom(numParticle) {
    const posPixels = [];
    const radius = 50;

    for(let i = 0; i < numParticle; i++) {

        // position
        const angle = Math.random() * 2 * Math.PI; 
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        posPixels.push(x, y, 0.0, 0.0);

        // linearVelocity
        // 计算切线方向的单位向量
        const tangentX = Math.sin(angle); // 切线方向的x分量
        const tangentY = -Math.cos(angle);  // 切线方向的y分量

        // 线速度大小，随着角度从0到2π线性增大
        const speed = (angle / (2 * Math.PI)) * 60;

        // linearVelocity，按切线方向，速度大小随着位置逐渐增加
        posPixels.push(tangentX * speed, tangentY * speed, 0.0, 0.0);

        // angularVelocity
        posPixels.push(0.0, 0.0, 0.0, 0.0);
    }

    return posPixels;
}

function initParticles() {

    const particleParams =  {
        numGen: 1,
        rate: 30,
        duration: 50,  
        lifeTime: 10,   // 2
        startSize: 5,  // 50
        endSize: 5,    // 90
        velocity: [0, 0, 0],   // [0, 60, 0]
        velocityRange: [0, 0, 0],    // [15, 15, 15]
        fps: 36
    }
    const numParticle = particleParams.duration * particleParams.rate;

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

    const colorTextureImage = new Image();
    colorTexture = new Texture2D('colorTexture', {
        image: colorTextureImage,
        textureSetting: {
            wrapS:'CLAMP_TO_EDGE',
            wrapT:'CLAMP_TO_EDGE',
            scaleDown:'LINEAR',
            scaleUp:'LINEAR'
        }
    });
    colorTexture.params.image.src = '../resources/fire/7761.png';
    colorTexture.params.image.onload = () => {
        colorTexture.initialize({ gl });
    };

    posTexture = new Texture2D('posTexture');
    // const posPixels = generateCirclePos(numParticle, particleParams.numGen);
    const posPixels = generateCirclePosRandom(numParticle)
    posTexture.createTexture(gl, numParticle * 3, particleParams.numGen, posPixels);

    particleMaterial = new ParticleMaterial({
        shader: particleShader,

        tileSize: 128,
        texWidth: 768,
        texHeight: 768,
        numFrames: 36,

        numParticle, 
        
        ...particleParams,
    })
    particleMaterial.initialize({ gl });
    particleMaterial.setTexture('rampSampler', rampTexture);
    particleMaterial.setTexture('colorSampler', colorTexture);
    particleMaterial.setTexture('posSampler', posTexture);

    particleShape = new StaticEmitter({data: {...particleParams, numParticle: numParticle}}, pseudoRandom);
    particleShape.initialize({ gl });

    drawParticles();
}

function drawParticles() {
    time.update();
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.colorMask(true, true, true, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    particleMaterial.draw(gl, time, camera, particleTransform);

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