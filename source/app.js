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
import { Solver } from './solver.js';
import { genPos, generateCirclePos, generateCirclePosRandom } from './generatorHelper.js';

import { basicVert, basicFrag, particle3dVert, particle2dVert, particleFrag, quadVert, solverFrag} from "../shaders/output.js";

const time = new Time();
const g_fps = document.getElementById("fps");
if (!g_fps) {
    console.log('fps error')
}
const fpsCounter = new FPSCounter(g_fps);

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

function initSimpleQuad(gl, camera) { 

    // init quad shader
    const quadShader = new Shader({
        vertexSource: basicVert,
        fragmentSource: basicFrag,
    });
    quadShader.initialize({ gl });

    // init transform
    const quadTransform = new Transform();
    quadTransform.setPosition(0, 0, 0);

    // init material
    const quadMaterial = new Material({
        shader: quadShader,
    })
    quadMaterial.initialize({ gl });

    // init shape
    let pos = [];
    genQuadWithUV(pos, [0,0,0]);
    const quadShape = new Shape({
        data: pos
    });
    quadShape.initialize({ gl });

    function drawSimpleQuad() {

        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        quadMaterial.preDraw(gl, camera, quadTransform);
    
        quadShape.draw(gl, quadMaterial);

        quadMaterial.postDraw(gl);
    
        if (fpsCounter) {
            fpsCounter.update();
        }
        
        requestAnimationFrame(drawSimpleQuad);
    }

    drawSimpleQuad();
}

function initSolver(gl, camera) {

    const solverShader = new Shader({
        vertexSource: quadVert,
        fragmentSource: solverFrag,
    });
    solverShader.initialize({ gl })

    const solverMaterial = new Material({
        shader: solverShader,
    })
    solverMaterial.initialize({ gl });


    // init quad shader
    const quadShader = new Shader({
        vertexSource: quadVert,
        fragmentSource: basicFrag,
    });
    quadShader.initialize({ gl });

    // init quad transform
    const quadTransform = new Transform();
    quadTransform.setPosition(0, 0, 0);

    // init material
    const quadMaterial = new Material({
        shader: quadShader,
    })
    quadMaterial.initialize({ gl });
    const quadShape = new QuadShape();
    quadShape.initialize({ gl });


    const solver = new Solver({
        shape:quadShape,
        material:solverMaterial
    }
    );
    solver.initialize({gl});

    solver.update(gl);
    // solver.swap();

    function drawScreenQuad() {
        time.update();



        // quadMaterial.setTexture('texture',solver.backBuffer[0]);

        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.colorMask(true, true, true, true);
        debugger;

        quadMaterial.preDraw(gl, time, camera, quadTransform);

        quadShape.draw(gl, quadMaterial);
        quadMaterial.postDraw(gl, time, camera, quadTransform);

        if (fpsCounter) {
            fpsCounter.update();
        }

        requestAnimationFrame(drawScreenQuad);
    }

    drawScreenQuad();
}

function initParticles(gl, camera) {

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
    const particleShader = new Shader({
        vertexSource: particle2dVert,
        fragmentSource: particleFrag,
    });
    particleShader.initialize({ gl });

    // init particle transform
    const particleTransform = new Transform();
    particleTransform.setPosition(0, 0, 0);

    // init particle texture
    // const rampTexture = new Texture2D('rampTexture');
    // rampTexture.setColorRamp(gl,
    //     [1, 1, 0, 1,
    //         1, 0, 0, 1,
    //         0, 0, 0, 1,
    //         0, 0, 0, 0.5,
    //         0, 0, 0, 0
    //     ]);

    const rampTexture = new Texture2D('rampTexture', {
        width:5, height:1,
        data:new Float32Array([1, 1, 0, 1,
            1, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 0.5,
            0, 0, 0, 0
        ])});
    rampTexture.initialize({ gl });

    const colorTextureImage = new Image();
    colorTextureImage.src = '../resources/fire/7761.png';
    const colorTexture = new Texture2D('colorTexture', {
        image: colorTextureImage,
        scaleDown:'LINEAR',
        scaleUp:'LINEAR'
    });
    colorTexture.initialize({ gl });

    const posPixels = generateCirclePosRandom(
        numParticle, particleParams.startSize, particleParams.endSize);
    const initPosValTexture = new Texture2D('initPosValTexture', {
        width: numParticle * 2, height: particleParams.numGen,
        data: new Float32Array(posPixels)
    });
    initPosValTexture.initialize({ gl });

    const particleMaterial = new ParticleMaterial({
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

    const particleShape = new StaticEmitter({
        data: {...particleParams, numParticle: numParticle}
    });
    particleShape.initialize({ gl });

    function drawParticles() {
        time.update();
        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.colorMask(true, true, true, false);
    
        particleMaterial.preDraw(gl, time, camera, particleTransform);
    
        particleShape.draw(gl, particleMaterial);

        particleMaterial.postDraw(gl);
    
        if (fpsCounter) {
            fpsCounter.update();
        }
        
        requestAnimationFrame(drawParticles);
    }

    drawParticles();
}

function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // init camera
    const camera = new Camera({aspect:canvas.width /canvas.height});
    camera.setPosition([0, 0, 300]);
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();

    // initSimpleQuad(gl, camera);
    initSolver(gl, camera);
    // initParticles(gl, camera);
}

main();