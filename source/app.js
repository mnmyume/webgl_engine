import Shader from './shader.js';
import Shape from './shape.js';
import QuadShape from './quadShape.js';
import Camera from './camera.js';
import Material from './material.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import Time from './time.js';
import StaticEmitter from './staticEmitter.js';
import ParticleMaterial from './particleMaterial.js';
import {genPos, generateCirclePos, generateCirclePosRandom} from './generatorHelper.js';

import { basicVert, basicFrag, particle3dVert, particle2dVert, particleFrag } from "../shaders/output.js";
import {quad} from "../shaders/glsl/index.js";

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
let initPosValTexture = null;

const time = new Time();

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

function initSolver(gl) {

    // init quad shader
    const quadShader = new Shader({
        vertexSource: quad,
        fragmentSource: basicFrag,
    });
    quadShader.initialize({ gl });


    // init material
    const quadMaterial = new Material({
        shader: quadShader,
    })
    quadMaterial.initialize({ gl });


    const quadShape = new QuadShape();
    quadShape.initialize({ gl });

    function drawScreenQuad() {

        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.colorMask(true, true, true, false);

        quadMaterial.draw(gl, camera, quadTransform);

        quadShape.draw(gl, quadMaterial);

        if (fpsCounter) {
            fpsCounter.update();
        }

        requestAnimationFrame(drawScreenQuad);
    }

    drawScreenQuad();
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

    const particleParams =  {
        numGen: 1,
        rate: 60,
        duration: 20,  
        lifeTime: 10,   // 2
        startSize: 70,  // 50
        endSize: 150,    // 90
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

    initPosValTexture = new Texture2D('initPosValTexture');
    // const posPixels = generateCirclePos(numParticle, particleParams.numGen);
    const posPixels = generateCirclePosRandom(
        numParticle, particleParams.startSize, particleParams.endSize);
    initPosValTexture.createTexture(gl, numParticle * 2, particleParams.numGen, posPixels);

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
    particleMaterial.setTexture('generatorSampler', initPosValTexture);

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

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);



    // initSimpleQuad();
    // initParticles();
    initSolver(gl);
}

main();