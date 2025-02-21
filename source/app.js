import Shader from './shader.js';
import Shape from './shape.js';
import ScreenQuad from './screenQuad.js';
import StaticEmitter from './staticEmitter.js';
import PartiShape from './partiShape.js';
import ObstacleShape from './obstacleShape.js';
import Camera from './camera.js';
import Material from './material.js';
import ParticleMaterial from './particleMaterial.js';
import PartiMaterial from './partiMaterial.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import Time from './time.js';
import Solver from './solver.js';
import { genRectHaltonPos, testGenRandPos, testGenPos, testGenVel, genUVData, genQuadWithUV, generateCirclePos, generateCirclePosVelRandom } from './generatorHelper.js';

import { basicVert, basicFrag, particle3dVert, particle2dVert, particleFrag, screenQuadVert, solverFrag, solverPartiVert, solverPartiFrag, obstacleVert, obstacleFrag} from "../shaders/output.js";

const time = new Time();
const g_fps = document.getElementById("fps");
if (!g_fps) {
    console.log('fps error')
}
const fpsCounter = new FPSCounter(g_fps);

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

function initSolver(gl, canvas, camera) {

    // set params
    const partiParams = {
        geneCount: 16,
        rate: 10,
        duration: 10,
        lifeTime: 10,
        size: 15,
    }
    const partiCount = partiParams.duration * partiParams.rate;
    
    const gridWidth = 200;
    const gridHeight = 200;
    const gridCorner = [0,0];

    // ----------------------------------------
    // init quad shader
    const quadShader = new Shader({
        vertexSource: screenQuadVert,
        fragmentSource: basicFrag,
    });
    quadShader.initialize({ gl });

    // init quad transform
    const quadTransform = new Transform();
    quadTransform.setPosition(0, 0, 0);

    // init quad material
    const quadMaterial = new Material({
        shader: quadShader,
    });
    quadMaterial.initialize({ gl });

    // init quad shape
    const quadShape = new ScreenQuad();
    quadShape.initialize({ gl });

    // -----------------------------------------------
    // init obstacle shader
    const obstacleShader = new Shader({
        vertexSource: obstacleVert,
        fragmentSource: obstacleFrag,
    });
    obstacleShader.initialize({ gl });

    // init obstacle transform
    const obstacleTransform = new Transform();
    obstacleTransform.setPosition(0, 0, 0);

    // init obstacle material
    const obstacleMaterial = new Material({
        shader: obstacleShader,
    });
    obstacleMaterial.initialize({ gl });
    obstacleMaterial.uniforms['worldSize'].value = [canvas.width,canvas.height];

    // init obstacle shape
    const obstacleShape = new ObstacleShape({
        obstacleCount: 1, 
        data: new Float32Array([0,0])
    });
    obstacleShape.initialize({ gl });

    // -----------------------------------------------
    // init solver shader
    const solverShader = new Shader({
        vertexSource: screenQuadVert,     // quadVert
        fragmentSource: solverFrag, // solverFrag
    });
    solverShader.initialize({ gl });

    // init solver material
    const solverMaterial = new Material({
        shader: solverShader,
    })
    solverMaterial.initialize({ gl });

    // init solver
    const solver = new Solver({
        shape:[quadShape, obstacleShape],
        material:[solverMaterial, obstacleMaterial],
        width: partiCount, height: partiParams.geneCount,
        screenWidth: canvas.width, screenHeight: canvas.height
    }
    );
    solver.initialize({gl});

    const fbWidth = solver.width;
    const fbHeight = solver.height;

    solver.backBuffer.textures[0].setData(gl, genRectHaltonPos(gridWidth, gridHeight, gridCorner, fbWidth, fbHeight, partiParams.size));
    solver.backBuffer.textures[1].setData(gl, testGenVel(fbWidth,fbHeight));

    solverMaterial.uniforms['worldSize'].value = [canvas.width, canvas.height];
    solverMaterial.uniforms['resolution'].value = [fbWidth, fbHeight];
    solverMaterial.uniforms['grid'].value = [gridWidth, gridHeight, ...gridCorner];

    //--------------------------------------------------
    // init particle shader
    const partiShader = new Shader({
        vertexSource: solverPartiVert,
        fragmentSource: solverPartiFrag,
    });
    partiShader.initialize({ gl });

    // init transform
    const partiTransform = new Transform();
    partiTransform.setPosition(0, 0, 0);

    // init texture
    const colorTextureImage = new Image();
    colorTextureImage.src = '../resources/whiteCircle.jpg';
    colorTextureImage.onload = _=>{
    const colorTexture = new Texture2D('colorTexture', {
        image: colorTextureImage,
        scaleDown:'LINEAR',
        scaleUp:'LINEAR'
    });
    colorTexture.initialize({ gl });

    // init material
    const partiMaterial = new PartiMaterial({
        shader: partiShader,
        partiCount,
        ...partiParams,
    })
    partiMaterial.initialize({ gl });
    partiMaterial.setTexture('colorSampler', colorTexture);

    // init shape
    const partiShape = new StaticEmitter({
        data: {...partiParams, partiCount: partiCount}
    });
    partiShape.initialize({ gl });

    // solver.addObstacles(gl);
    function drawScreenQuad() {


        time.update();
        solverMaterial.uniforms['time'].value = time.ElapsedTime;

        solver.update(gl);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.colorMask(true, true, true, true);

        quadMaterial.setTexture('texture', solver.frontBuffer.textures[3]);

        partiMaterial.setTexture('posSampler', solver.frontBuffer.textures[0]);
        partiMaterial.setTexture('velSampler', solver.frontBuffer.textures[1]);

        // draw screen quad
        quadMaterial.preDraw(gl, camera, quadTransform);
        quadShape.draw(gl, quadMaterial);
        quadMaterial.postDraw(gl);

        // draw particles
        partiMaterial.preDraw(gl, time, camera, partiTransform);
        partiShape.draw(gl, partiMaterial);
        partiMaterial.postDraw(gl);

        if (fpsCounter) {
            fpsCounter.update();
        }

        requestAnimationFrame(drawScreenQuad);
    }

    drawScreenQuad();
    }
}

function initBlastParticle(gl, camera) {

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
    const partiCount = particleParams.duration * particleParams.rate;

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
    colorTextureImage.onload = _=>{
        const colorTexture = new Texture2D('colorTexture', {
            image: colorTextureImage,
            scaleDown:'LINEAR',
            scaleUp:'LINEAR'
        });
        colorTexture.initialize({ gl });

        const posPixels = generateCirclePosVelRandom(
            partiCount, particleParams.startSize, particleParams.endSize);
        const initPosVelTexture = new Texture2D('initPosVelTexture', {
            width: partiCount * 2, height: particleParams.numGen,
            data: new Float32Array(posPixels)
        });
        initPosVelTexture.initialize({ gl });

        const particleMaterial = new ParticleMaterial({
            shader: particleShader,
            tileSize: 128,
            texWidth: 768,
            texHeight: 768,
            numFrames: 36,
            partiCount,
            ...particleParams,
        })
        particleMaterial.initialize({ gl });
        particleMaterial.setTexture('rampSampler', rampTexture);
        particleMaterial.setTexture('colorSampler', colorTexture);
        particleMaterial.setTexture('generatorSampler', initPosVelTexture);

        const particleShape = new StaticEmitter({
            data: {...particleParams, partiCount: partiCount}
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



}








function initSnowParticle(gl, camera) {

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
    const partiCount = particleParams.duration * particleParams.rate;

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
    colorTextureImage.onload = _=>{
        const colorTexture = new Texture2D('colorTexture', {
            image: colorTextureImage,
            scaleDown:'LINEAR',
            scaleUp:'LINEAR'
        });
        colorTexture.initialize({ gl });

        const posPixels = generateCirclePosVelRandom(
            partiCount, particleParams.startSize, particleParams.endSize);
        const initPosVelTexture = new Texture2D('initPosVelTexture', {
            width: partiCount * 2, height: particleParams.numGen,
            data: new Float32Array(posPixels)
        });
        initPosVelTexture.initialize({ gl });

        const particleMaterial = new ParticleMaterial({
            shader: particleShader,
            tileSize: 128,
            texWidth: 768,
            texHeight: 768,
            numFrames: 36,
            partiCount,
            ...particleParams,
        })
        particleMaterial.initialize({ gl });
        particleMaterial.setTexture('rampSampler', rampTexture);
        particleMaterial.setTexture('colorSampler', colorTexture);
        particleMaterial.setTexture('generatorSampler', initPosVelTexture);

        const particleShape = new StaticEmitter({
            data: {...particleParams, partiCount: partiCount}
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



}


function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl');
    canvas.width = window.innerWidth;   
    canvas.height = window.innerHeight; 
    gl.viewport(0, 0, canvas.width, canvas.height);

    // init camera
    const camera = new Camera({aspect: canvas.width/canvas.height});
    // camera.setPosition([0, 0, 800]);
    const r = 800,
        cos45 = Math.cos(45*Math.PI/180),
        sin35 = Math.sin(35*Math.PI/180);
    camera.setPosition([r*cos45, r*sin35, r*cos45]);
    // camera.setPosition([0, 0, 800]);
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();

    // initSimpleQuad(gl, camera);
    initSolver(gl, canvas, camera);
    // initBlastParticle(gl, camera);
}

main();