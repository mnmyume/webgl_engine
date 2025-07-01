import Shader from "../source/shader.js";
import Time from "../source/time.js";
import Transform from "../source/transform.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import Texture2D from "../source/texture2d.js";
import Solver from "../source/solver.js";
import SolverMaterial from "../source/solverMaterial.js";
import SolverShape from "../source/solverShape.js";

import { readAttrSchema } from "../source/shapeHelper.js";
import {genAngVel, genLinVel, genQuadUV, genRectHaltonPos, genInitData} from "../source/generatorHelper.js";

import vaoQuadVert from "../shaders/glsl/quad-vert.glsl";
import vaoQuadFrag from "../shaders/glsl/quad-frag.glsl";
import emitVert from "../shaders/glsl/emit-vert.glsl";
import emitFrag from "../shaders/glsl/emit-frag.glsl";
import snowVert from "../shaders/glsl/snow-vert.glsl";
import snowFrag from "../shaders/glsl/snow-frag.glsl";
import {sqrtFloor} from "../source/mathHelper.js";



export function initSnow(gl, canvas, camera) {

    const time = new Time();
    const MAXGENSIZE = 2;
    const particleParams = {
        particleCount: 1,
        duration: 8,
        lifeTime: 8,
        size: 40,
        uBlurRadius: 0.1,
        uPixelNum: 4,
        emitterSize: 16,
        emitterHeight: 40
    }
    const MAXCOL = sqrtFloor(particleParams.particleCount);

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

    const gridCorner = [-particleParams.emitterSize/2, -particleParams.emitterSize/2];
    const emitterTransform = new Transform();
    emitterTransform.translate(0, particleParams.emitterHeight, 0);


    // init solver
    const solverShader = new Shader({
        vertexSource: emitVert,
        fragmentSource: emitFrag,
    });
    solverShader.initialize({gl});


    const solverMaterial = new SolverMaterial('emitterMat',{
        shader: solverShader,
    });
    solverMaterial.initialize({gl});


    const initData = genInitData(particleParams.particleCount);
    const solverShape = new SolverShape('solverShape', {
        count:6, schema: readAttrSchema(emitVert.input)
    });
    solverShape.initialize({gl});


    const solver = new Solver({
        shape: solverShape,
        material: solverMaterial,
        count: particleParams.particleCount,
    });
    solver.initialize({gl});

    solverShape.update(gl, 'particleBuffer',{material:solverMaterial, solver:solver, data:initData});


    const emitterSlot0 = [];
    for (let genIndex = 0; genIndex < MAXGENSIZE; genIndex++) {
        const emitterTexture = new Texture2D('emitterTexture', {
            width: MAXCOL, height: MAXCOL,
            scaleDown: 'NEAREST',
            // data: texDataArr[genIndex],
            scaleUp: 'NEAREST'
        });
        emitterTexture.initialize({gl});
        emitterTexture.setData(gl, genRectHaltonPos(particleParams.emitterSize, gridCorner, MAXCOL, particleParams.size, particleParams.duration));
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


    // init render
    const particleShader = new Shader({
        vertexSource: snowVert,
        fragmentSource: snowFrag
    });
    particleShader.initialize({gl});

    const particleMaterial = new Material('particleMat',{
        shader: particleShader,
    });
    particleMaterial.initialize({gl});
    // particleMaterial.setUniform('uCount', particleParams.particleCount);


    const particleShape = new Shape('particleShape',{
        state: 3, count: particleParams.particleCount, vaos: solverShape.VAOS,
        schema: readAttrSchema(snowVert.input)
    });
    // particleShape.initialize({gl});
    // particleShape.update(gl, 'particleBuffer', {material:particleMaterial});
    // const quadData = genQuadUV(10);
    // particleShape.update(gl,'particleBuffer',{material:particleMaterial, data:quadData});

    function drawSnow() {


        time.update();
        solverMaterial.setUniform('uTime', time.ElapsedTime);
        solverMaterial.setUniform('uDeltaTime', time.Interval);

        solver.update(gl);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // render
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);

        particleMaterial.preDraw(gl, camera);
        particleShape.draw(gl, particleMaterial);
        particleMaterial.postDraw(gl);

        gl.disable(gl.BLEND);

        requestAnimationFrame(drawSnow);
    }

    drawSnow();
}
