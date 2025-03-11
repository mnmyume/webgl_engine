import Shader from './shader.js';
import Shape from './shape.js';
import ScreenQuad from './screenQuad.js';
import StaticEmitter from './staticEmitter.js';
import PartiShape from './partiShape.js';
import Camera from './camera.js';
import Material from './material.js';
import _particleMaterial from './_particleMaterial.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import Time from './time.js';
import Solver from './solver.js';
import { genPartiInfo, genRectHaltonPos, testGenPos, testGenVel, generateCirclePos, generateCirclePosVelRandom, genUVData, genQuadWithUV, } from './generatorHelper.js';
import { readAttrSchema } from './shapeHelper.js';
import { basicVert, basicFrag, particle3dVert, particle2dVert, particleFrag, screenQuadFrag, screenQuadVert, solverFrag, solverPartiVert, solverPartiFrag, obstacleVert, obstacleFrag} from "../shaders/output.js";

const time = new Time();
const g_fps = document.getElementById("fps");
if (!g_fps) { console.log('fps error') };
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
    quadMaterial.uniforms['size'].value = 80;

    // init shape
    let pos = [];
    genQuadWithUV(pos, [0,0,0]);
    const quadShape = new Shape(
        'quad',
        {count:6, schema:readAttrSchema(basicVert.attribute)}
    );
    quadShape.initialize({ gl });
    quadShape.update(gl, 'quadBuffer', pos)

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
        rate: 1,
        duration: 1,
        lifeTime: 10,
        size: 15,
    }
    // const partiCount = partiParams.duration * partiParams.rate;
    const partiCount = 10;
    // set emitter grid
    const gridWidth = 200;
    const gridHeight = 200;
    const gridCorner = [0,0];
    const groundHeight = 0;

    // ----------------------------------------
    // init screen quad shader
    const screenQuadShader = new Shader({
        vertexSource: screenQuadVert,
        fragmentSource: screenQuadFrag });
    screenQuadShader.initialize({ gl });

    // init screen quad transform
    const screenQuadTransform = new Transform();
    screenQuadTransform.setPosition(0, 0, 0);

    // init screen quad material
    const screenQuadMaterial = new Material({
        shader: screenQuadShader });
    screenQuadMaterial.initialize({ gl });

    // init screen quad shape
    const screenQuadShape = new ScreenQuad(
        'screenQuad',
        {count:6, schema:readAttrSchema(screenQuadVert.attribute)});
    screenQuadShape.initialize({ gl });
    screenQuadShape.update(gl, 'quadBuffer')

    // -----------------------------------------------
    // init obstacle shader
    const obstacleShader = new Shader({
        vertexSource: obstacleVert,
        fragmentSource: obstacleFrag });
    obstacleShader.initialize({ gl });

    // init obstacle transform
    const obstacleTransform = new Transform();
    obstacleTransform.setPosition(0, 0, 0);

    // init obstacle material
    const obstacleMaterial = new Material({
        shader: obstacleShader });
    obstacleMaterial.initialize({ gl });
    obstacleMaterial.setUniform('worldSize', [canvas.width,canvas.height]);

    // init obstacle shape
    const obstacleShape = new Shape(
        'obstacle', 
        {count:1, 
         schema:readAttrSchema(obstacleVert.attribute),
         state:3});
    obstacleShape.initialize({ gl });
    obstacleShape.update(gl, 'obstacleBuffer', [0,0])

    // -----------------------------------------------
    // init solver shader
    const solverShader = new Shader({
        vertexSource: screenQuadVert, 
        fragmentSource: solverFrag });
    solverShader.initialize({ gl });

    // init solver material
    const solverMaterial = new Material({
        shader: solverShader })
    solverMaterial.initialize({ gl });

    // init solver
    const solver = new Solver({
        shape:[screenQuadShape, obstacleShape],
        material:[solverMaterial, obstacleMaterial],
        width: partiCount, height: partiParams.geneCount,
        screenWidth: canvas.width, screenHeight: canvas.height });
    solver.initialize({gl});

    const fbWidth = solver.width;
    const fbHeight = solver.height;

    solver.backBuffer.textures[0].setData(gl, genRectHaltonPos(gridWidth, gridHeight, gridCorner, fbWidth, fbHeight, partiParams.size));
    // solver.backBuffer.textures[1].setData(gl, testGenVel(fbWidth,fbHeight));
    // solver.backBuffer.textures[2].setData(gl, genPartiInfo(partiCount, partiParams.geneCount, partiCount, partiParams.duration));

    solverMaterial.setUniform('grid', [gridWidth, gridHeight, ...gridCorner]);
    solverMaterial.setUniform('worldSize', [canvas.width, canvas.height]);
    solverMaterial.setUniform('resolution', [fbWidth, fbHeight]);
    solverMaterial.setUniform('duration', partiParams.duration);
    solverMaterial.setUniform('partiCount', partiCount);
    solverMaterial.setUniform('geneCount', partiParams.geneCount);
    solverMaterial.setUniform('lifeTime',partiParams.lifeTime);

    //--------------------------------------------------
    // init particle shader
    const partiShader = new Shader({
        vertexSource: solverPartiVert,
        fragmentSource: solverPartiFrag });
    partiShader.initialize({ gl });

    // init particle transform
    const partiTransform = new Transform();
    partiTransform.setPosition(0, 0, 0);

    // init particle texture
    const colorTextureImage = new Image();
    colorTextureImage.src = '../resources/whiteCircle.jpg';
    colorTextureImage.onload = _=>{
    const colorTexture = new Texture2D('colorTexture', {
        image: colorTextureImage,
        scaleDown:'LINEAR',
        scaleUp:'LINEAR' });
    colorTexture.initialize({ gl });

    // init particle material
    const partiMaterial = new Material({
        shader: partiShader });
    partiMaterial.initialize({ gl });
    partiMaterial.setUniform('geneCount', partiParams.geneCount);
    partiMaterial.setUniform('partiCount', partiCount)

    partiMaterial.setTexture('colorSampler', colorTexture);

    // init particle shape
    const partiShape = new PartiShape(
        'particle',
        {count:partiCount, 
         schema:readAttrSchema(solverPartiVert.attribute),
         state:3 });
    partiShape.initialize({ gl });
    partiShape.update(gl, 'partiBuffer');

    // -----------------------------------------
    // init emitter quad shader
    const emitterQuadShader = new Shader({
        vertexSource: basicVert,
        fragmentSource: basicFrag });
    emitterQuadShader.initialize({ gl });

    // init emitter quad transform
    const emitterQuadTransform = new Transform();
    emitterQuadTransform.setPosition(0, 0, 0);

    //init emitter quad material
    const emitterQuadMaterial = new Material({
        shader: emitterQuadShader });
    emitterQuadMaterial.initialize({ gl });
    emitterQuadMaterial.setUniform('size', gridWidth);

    // init emitter quad shape
    let emitterQuadData = [];
    genQuadWithUV(emitterQuadData, [gridCorner[0], gridHeight, gridCorner[1]]);
    const emitterQuadShape = new Shape(
        'emitterQuad',
        {count:6, schema:readAttrSchema(basicVert.attribute)});
    emitterQuadShape.initialize({ gl });
    emitterQuadShape.update(gl, 'quadBuffer', emitterQuadData);

    // -----------------------------------------------------
    // init ground quad shader
    const groundQuadShader = new Shader({
        vertexSource: basicVert,
        fragmentSource: basicFrag });
    groundQuadShader.initialize({ gl });

    // init emitter quad transform
    const groundQuadTransform = new Transform();
    groundQuadTransform.setPosition(0, 0, 0);

    //init emitter quad material
    const groundQuadMaterial = new Material({
        shader: groundQuadShader });
    groundQuadMaterial.initialize({ gl });
    groundQuadMaterial.setUniform('size', gridWidth);

    // init emitter quad shape
    let groundQuadData = [];
    genQuadWithUV(groundQuadData, [gridCorner[0], groundHeight, gridCorner[1]]);
    const groundQuadShape = new Shape(
        'groundQuad',
        {count:6, schema:readAttrSchema(basicVert.attribute)});
    groundQuadShape.initialize({ gl });
    groundQuadShape.update(gl, 'quadBuffer', groundQuadData);    

    // solver.addObstacles(gl);
    function drawSolver() {

        const t0 = performance.now();

        time.update();
        solverMaterial.setUniform('time', time.ElapsedTime);

        solver.update(gl);
        //
        // gl.viewport(0, 0, canvas.width, canvas.height);
        //
        // gl.clearColor(0, 0, 0, 1.0);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.colorMask(true, true, true, true);
        //
        // partiMaterial.setTexture('posSampler', solver.frontBuffer.textures[0]);
        // partiMaterial.setTexture('velSampler', solver.frontBuffer.textures[1]);
        // partiMaterial.setTexture('propertySampler', solver.frontBuffer.textures[2]);
        //
        // // draw screen quad
        // screenQuadMaterial.preDraw(gl, camera, screenQuadTransform);
        // screenQuadShape.draw(gl, screenQuadMaterial);
        // screenQuadMaterial.postDraw(gl);
        //
        // // draw particles
        // partiMaterial.preDraw(gl,  camera, partiTransform);
        // partiShape.draw(gl, partiMaterial);
        // partiMaterial.postDraw(gl);
        //
        // // gl.enable(gl.BLEND);
        // // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        // // gl.blendEquation(gl.FUNC_ADD);
        //
        // // draw emitter quad
        // emitterQuadMaterial.preDraw(gl, camera, emitterQuadTransform);
        // emitterQuadShape.draw(gl, emitterQuadMaterial);
        // emitterQuadMaterial.postDraw(gl);
        // //draw ground quad
        // groundQuadMaterial.preDraw(gl, camera, groundQuadTransform);
        // groundQuadShape.draw(gl, groundQuadMaterial);
        // groundQuadMaterial.postDraw(gl);
        //
        // // gl.disable(gl.BLEND);
        //
        // if (fpsCounter) {
        //     fpsCounter.update();
        // }
        //
        // const t1 = performance.now();
        // console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
        // solverMaterial.setUniform('deltaTime', (t1 - t0)/1000);

        requestAnimationFrame(drawSolver);
    }

    drawSolver();

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

        const particleMaterial = new _particleMaterial({
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

        const particleMaterial = new _particleMaterial({
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