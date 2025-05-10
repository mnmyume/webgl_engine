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

export function test(gl, canvas, camera) {

    const MAXGENSIZE = 1;
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

    const emitterSlot0 = [];
    for (let genIndex = 0; genIndex < MAXGENSIZE; genIndex++) {
        const emitterTexture = new Texture2D('emitterTexture', {
            width: 2, height: 2,
            scaleDown: 'NEAREST',
            // data: texDataArr[genIndex],
            scaleUp: 'NEAREST'
        });
        emitterTexture.initialize({gl});
        emitterTexture.setData(gl,new Float32Array([
            0.5,0.5,0.0,1,
            0,0.5,0.0,1,
            0.5,0,0.0,1,
            0,0,0.0,1,
        ]));// genRectHaltonPos(emitterSize, gridCorner, MAXCOL, partiParams.size, partiParams.duration)
        emitterSlot0.push(emitterTexture);
    }


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


    const colTexImg = new Image();
    colTexImg.src = '../resources/arrow2.png';
    colTexImg.onload = _ => { // TODO
        const colorTexture = new Texture2D('colorTexture', {
            image: colTexImg,
            scaleDown: 'LINEAR',
            scaleUp: 'LINEAR'
        });
        colorTexture.initialize({gl});
        emitterQuadMaterial.setTexture('uTex', colorTexture);
        emitterQuadMaterial.setTexture('uTex', emitterSlot0[0]);
    }



    function drawSolver() {



        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(1, 1, 1, 1.0);
        gl.colorMask(true, true, true, true);

        // draw screen quad
        screenQuadMaterial.preDraw(gl, camera, screenQuadTransform);
        screenQuadShape.draw(gl, screenQuadMaterial);
        screenQuadMaterial.postDraw(gl);


        // draw emitter quad
        emitterQuadMaterial.preDraw(gl, camera, emitterQuadTransform);
        emitterQuadShape.draw(gl, emitterQuadMaterial);
        emitterQuadMaterial.postDraw(gl);


        requestAnimationFrame(drawSolver);
    }


    drawSolver();



}
