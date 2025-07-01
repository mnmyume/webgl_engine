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
import drawVert from "../shaders/glsl/draw-vert.glsl";
import drawFrag from "../shaders/glsl/draw-frag.glsl";



export function initTransFeed(gl, canvas, camera) {

    const time = new Time();

    const particleParams = {
        particleCount: 1,
        duration: 8,
        lifeTime: 8,
        size: 40,
        uBlurRadius: 0.1,
        uPixelNum: 4
    }

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


    // init solver shader
    const solverShader = new Shader({
        vertexSource: emitVert,
        fragmentSource: emitFrag,
    });
    solverShader.initialize({gl});


    // init solver material
    const solverMaterial = new SolverMaterial('emitterMat',{
        shader: solverShader,
    });
    solverMaterial.initialize({gl});


    // init solver shape
    const initData = genInitData(particleParams.particleCount);
    const solverShape = new SolverShape('solverShape', {
        count:6, schema: readAttrSchema(emitVert.input)
    });
    solverShape.initialize({gl});



    // init transform feedback
    const solver = new Solver({
        shape: solverShape,
        material: solverMaterial,
        count: particleParams.particleCount,
    });
    solver.initialize({gl});

    solverShape.update(gl, 'particleBuffer',{material:solverMaterial, solver:solver, data:initData});


    // init render
    const particleShader = new Shader({
        vertexSource: drawVert,
        fragmentSource: drawFrag
    });
    particleShader.initialize({gl});

    const particleMaterial = new Material('particleMat',{
        shader: particleShader,
    });
    particleMaterial.initialize({gl});
    // particleMaterial.setUniform('uCount', particleParams.particleCount);


    const particleShape = new Shape('particleShape',{
        state: 3, count: particleParams.particleCount, vaos: solverShape.VAOS,
        schema: readAttrSchema(drawVert.input)
    });
    // particleShape.initialize({gl});
    // particleShape.update(gl, 'particleBuffer', {material:particleMaterial});
    // const quadData = genQuadUV(10);
    // particleShape.update(gl,'particleBuffer',{material:particleMaterial, data:quadData});

    function drawTransFeed() {


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

        requestAnimationFrame(drawTransFeed);
    }

    drawTransFeed();
}
