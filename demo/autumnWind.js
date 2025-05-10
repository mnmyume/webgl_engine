import {sqrtFloor} from "../source/mathHelper.js";
import Transform from "../source/transform.js";
import Shader from "../source/shader.js";
import {
    arrowFrag,
    arrowVert, basicFrag,
    basicVert,
    screenQuadFrag,
    screenQuadVert,
    solverFrag,
    solverPartiVert
} from "../shaders/output.js";
import Material from "../source/material.js";
import ScreenQuad from "../source/screenQuad.js";
import {readAttrSchema} from "../source/shapeHelper.js";
import Solver from "../source/solver.js";
import Texture2D from "../source/texture2d.js";
import {genAngVel, genLinVel, genQuad, genRectHaltonPos} from "../source/generatorHelper.js";
import PartiShape from "../source/partiShape.js";
import Shape from "../source/shape.js";

export function autumn(gl, canvas, camera) {

    const MAXGENSIZE = 2;
    const partiParams = {
        geneCount: MAXGENSIZE,
        rate: 1,
        duration: 8,
        lifeTime: 8,
        size: 40,
        uBlurRadius: 0.1,
        uPixelNum: 4
    }
    // const partiCount = partiParams.duration * partiParams.rate;
    const partiCount = 1;

    const solverParams = {
        gravitySwitcher: 1,
        gravity: [0, -10, 0],
        vortexSwitcher: 1,
        vortexScalar: 1/1000,
        noiseSwitcher: 1,
        noiseScalar: [0.3, 0.3, 0.3],
        dampSwitcher: 1,
        dampScalar: 0.8
    }
    window.solverParams = solverParams;
    // set framebuffer size
    const MAXCOL = sqrtFloor(partiCount);
    const fbWidth = MAXCOL;
    const fbHeight = MAXCOL;

    // set emitter grid
    const emitterSize = 16;
    const emitterHeight = 40;
    const emitterHalfSize = emitterSize / 2;
    const gridCorner = [-emitterHalfSize, -emitterHalfSize];

    // emitter transform
    const emitterTransform = new Transform();
    emitterTransform.translate(0, emitterHeight, 0);

    // ----------------------------------------
    // init screen quad shader
    const screenQuadShader = new Shader({
        vertexSource: screenQuadVert,
        fragmentSource: screenQuadFrag
    });
    screenQuadShader.initialize({gl});
    // init screen quad transform
    const screenQuadTransform = new Transform();
    screenQuadTransform.setPosition(0, 0, 0);
    // init screen quad material
    const screenQuadMaterial = new Material('screenQuadMat',{
        shader: screenQuadShader
    });
    screenQuadMaterial.initialize({gl});
    screenQuadMaterial.setUniform('uCanvas', [canvas.width, canvas.height]);

    // init screen quad shape
    const screenQuadShape = new ScreenQuad(
        'screenQuad',
        {count: 6, schema: readAttrSchema(screenQuadVert.attribute)});
    screenQuadShape.initialize({gl});
    screenQuadShape.update(gl, 'quadBuffer')

    // -----------------------------------------------
    // init obstacle shader
    // const obstacleShader = new Shader({
    //     vertexSource: obstacleVert,
    //     fragmentSource: obstacleFrag });
    // obstacleShader.initialize({ gl });
    //
    // // init obstacle material
    // const obstacleMaterial = new Material({
    //     shader: obstacleShader });
    // obstacleMaterial.initialize({ gl });
    // obstacleMaterial.setUniform('uWorldSize', [canvas.width,canvas.height]);

    // init obstacle shape
    // const obstacleShape = new Shape(
    //     'obstacle',
    //     {count:1,
    //      schema:readAttrSchema(obstacleVert.attribute),
    //      state:3});
    // obstacleShape.initialize({ gl });
    // obstacleShape.update(gl, 'obstacleBuffer', [0,0]);

    // -----------------------------------------------
    // init solver shader
    const solverShader = new Shader({
        vertexSource: screenQuadVert,
        fragmentSource: solverFrag
    });
    solverShader.initialize({gl});

    // init solver material
    const solverMaterial = new Material('solverMat',{
        shader: solverShader
    })
    solverMaterial.initialize({gl});

    // init solver
    const solver = new Solver({
        shape: [screenQuadShape],    // obstacleShape
        material: [solverMaterial],  // obstacleMaterial
        width: fbWidth, height: fbHeight,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode: 1, loop: false
    });
    solver.initialize({gl});
    window.solver = solver;
    const emitterSlot0 = [];
    for (let genIndex = 0; genIndex < MAXGENSIZE; genIndex++) {
        const emitterTexture = new Texture2D('emitterTexture', {
            width: MAXCOL, height: MAXCOL,
            scaleDown: 'NEAREST',
            // data: texDataArr[genIndex],
            scaleUp: 'NEAREST'
        });
        emitterTexture.initialize({gl});
        emitterTexture.setData(gl, genRectHaltonPos(emitterSize, gridCorner, MAXCOL, partiParams.size, partiParams.duration));
        emitterSlot0.push(emitterTexture);
    }
    solverMaterial.setTexture('uEmitterSlot0', emitterSlot0);
    // solverMaterial.setTexture('uEmitterSlot0[0]', emitterSlot0[0]);

    const emitterSlot1 = [];
    for (let genIndex = 0; genIndex < MAXGENSIZE; genIndex++) {
        const emitterTexture = new Texture2D('emitterTexture', {
            width: MAXCOL, height: MAXCOL,
            scaleDown: 'NEAREST',
            // data: texDataArr[genIndex],
            scaleUp: 'NEAREST'
        });
        emitterTexture.initialize({gl});
        emitterTexture.setData(gl, genLinVel(MAXCOL));
        emitterSlot1.push(emitterTexture);
    }
    solverMaterial.setTexture('uEmitterSlot1', emitterSlot1);
    // solverMaterial.setTexture('uEmitterSlot1[0]', emitterSlot1[0]);

    const emitterSlot2 = [];
    for (let genIndex = 0; genIndex < MAXGENSIZE; genIndex++) {
        const emitterTexture = new Texture2D('emitterTexture', {
            width: MAXCOL, height: MAXCOL,
            scaleDown: 'NEAREST',
            // data: texDataArr[genIndex],
            scaleUp: 'NEAREST'
        });
        emitterTexture.initialize({gl});
        emitterTexture.setData(gl, genAngVel(MAXCOL));
        emitterSlot1.push(emitterTexture);
    }
    solverMaterial.setTexture('uEmitterSlot2', emitterSlot2);
    // solverMaterial.setTexture('uEmitterSlot2[0]', emitterSlot2[0]);


    solverMaterial.setUniform('uGrid', [emitterSize, emitterHeight, ...gridCorner]);
    solverMaterial.setUniform('uWorldSize', [canvas.width, canvas.height]);
    solverMaterial.setUniform('uResolution', [fbWidth, fbHeight]);
    solverMaterial.setUniform('uDuration', partiParams.duration);
    solverMaterial.setUniform('uPartiCount', partiCount);
    solverMaterial.setUniform('uGeneCount', partiParams.geneCount);
    solverMaterial.setUniform('uLifeTime', partiParams.lifeTime);
    solverMaterial.setUniform('uMAXCOL', MAXCOL);
    solverMaterial.setUniform('uEmitterTransform', emitterTransform.matrix);


    //--------------------------------------------------
    // init particle shader
    const partiShader = new Shader({
        vertexSource: arrowVert,
        fragmentSource: arrowFrag
    });
    partiShader.initialize({gl});


    // init particle texture
    const colTexImg = new Image();
    colTexImg.src = '../resources/arrow2.png';
    colTexImg.onload = _ => { // TODO
        const colorTexture = new Texture2D('colorTexture', {
            image: colTexImg,
            scaleDown: 'LINEAR',
            scaleUp: 'LINEAR'
        });
        colorTexture.initialize({gl});


        // init particle material
        const partiMaterial = new Material('partiMat',{
            shader: partiShader
        });
        partiMaterial.initialize({gl});
        partiMaterial.setUniform('uGeneCount', partiParams.geneCount);
        partiMaterial.setUniform('uPartiCount', partiCount);
        partiMaterial.setUniform('uMAXCOL', MAXCOL);
        partiMaterial.setUniform('uBlurRadius', partiParams.uBlurRadius);
        partiMaterial.setUniform('uPixelNum', partiParams.uPixelNum);

        partiMaterial.setTexture('uColorSampler', colorTexture);
        // init particle shape
        const partiShape = new PartiShape(
            'particle',
            {
                count: partiCount,
                schema: readAttrSchema(solverPartiVert.attribute),
                state: 3
            });
        partiShape.initialize({gl});
        partiShape.update(gl, 'partiBuffer');

        // -----------------------------------------
        // init emitter quad shader
        const emitterQuadShader = new Shader({
            vertexSource: basicVert,
            fragmentSource: basicFrag
        });
        emitterQuadShader.initialize({gl});

        // init emitter quad transform
        const emitterQuadTransform = new Transform();
        emitterQuadTransform.setPosition(0, emitterHeight, 0);
        emitterQuadTransform.scale(15, 15, 15);

        //init emitter quad material
        const emitterQuadMaterial = new Material('emitterQuadMat',{
            shader: emitterQuadShader
        });
        emitterQuadMaterial.initialize({gl});
        emitterQuadMaterial.setUniform('uColor', [0, 1, 0]);

        // init emitter quad shape
        const emitterQuadData = genQuad(1);
        const emitterQuadShape = new Shape(
            'emitterQuad',
            {count: 6, schema: readAttrSchema(basicVert.attribute)});
        emitterQuadShape.initialize({gl});
        emitterQuadShape.update(gl, 'quadBuffer', emitterQuadData);

        // -----------------------------------------------------
        // init ground quad shader
        const groundQuadShader = new Shader({
            vertexSource: basicVert,
            fragmentSource: basicFrag
        });
        groundQuadShader.initialize({gl});

        // init ground quad transform
        const groundQuadTransform = new Transform();

        //init ground quad material
        const groundQuadMaterial = new Material('groundQuadMat',{
            shader: groundQuadShader
        });
        groundQuadMaterial.initialize({gl});
        groundQuadMaterial.setUniform('uColor', [1, 0, 0]);

        // init ground quad shape
        const groundQuadData = genQuad(1.0);
        const groundQuadShape = new Shape(
            'groundQuad',
            {count: 6, schema: readAttrSchema(basicVert.attribute)});
        groundQuadShape.initialize({gl});
        groundQuadShape.update(gl, 'quadBuffer', groundQuadData);

        // solver.addObstacles(gl);

        function drawSolver() {

            const fieldParams = [];
            fieldParams[0] = [ solverParams.gravitySwitcher, ...solverParams.gravity ];
            fieldParams[1] = [ solverParams.vortexSwitcher, solverParams.vortexScalar, 0, 0 ];
            fieldParams[2] = [ solverParams.noiseSwitcher, ...solverParams.noiseScalar ];
            fieldParams[3] = [ solverParams.dampSwitcher, solverParams.dampScalar, 0, 0 ];
            solverMaterial.setUniform('uFieldParams', fieldParams.flat());
            // solverMaterial.setUniform('uFieldParams[0]', fieldParams[0]);
            // solverMaterial.setUniform('uFieldParams[1]', fieldParams[1]);
            // solverMaterial.setUniform('uFieldParams[2]', fieldParams[2]);
            // solverMaterial.setUniform('uFieldParams[3]', fieldParams[3]);

            time.update();
            solverMaterial.setUniform('uTime', time.ElapsedTime);
            solverMaterial.setUniform('uDeltaTime', time.Interval);
            solverMaterial.setUniform('uState', solver.mode);

            solver.update(gl);

            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearColor(1, 1, 1, 1.0);
            gl.colorMask(true, true, true, true);

            partiMaterial.setTexture('uDataSlot0', solver.frontBuffer.textures[0]);
            partiMaterial.setTexture('uDataSlot1', solver.frontBuffer.textures[1]);
            partiMaterial.setTexture('uDataSlot2', solver.frontBuffer.textures[2]);
            partiMaterial.setTexture('uDataSlot3', solver.frontBuffer.textures[3]);

            // draw screen quad
            screenQuadMaterial.preDraw(gl, camera, screenQuadTransform);
            screenQuadShape.draw(gl, screenQuadMaterial);
            screenQuadMaterial.postDraw(gl);

            // draw particles
            // gl.enable(gl.BLEND);
            // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            // gl.blendEquation(gl.FUNC_ADD);

            partiMaterial.preDraw(gl, camera);
            partiShape.draw(gl, partiMaterial);
            partiMaterial.postDraw(gl);

            gl.disable(gl.BLEND);

            // draw emitter quad
            emitterQuadMaterial.setTexture('uTex', emitterSlot0[0]);
            emitterQuadMaterial.preDraw(gl, camera, emitterQuadTransform);
            emitterQuadShape.draw(gl, emitterQuadMaterial);
            emitterQuadMaterial.postDraw(gl);

            // draw ground quad
            groundQuadMaterial.preDraw(gl, camera, groundQuadTransform);
            groundQuadShape.draw(gl, groundQuadMaterial);
            groundQuadMaterial.postDraw(gl);


            // console.log(`Call to doSomething took ${time.FPS} milliseconds.`);
            solverMaterial.setUniform('uDeltaTime', time.Interval);

            if (solver.Mode === Solver.MODE.init) {
                solver.Mode = Solver.MODE.play;
            }

            requestAnimationFrame(drawSolver);
        }


        drawSolver();

    }
}
