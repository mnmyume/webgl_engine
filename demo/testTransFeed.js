import Shader from "../source/shader.js";
import Time from "../source/time.js";
import Transform from "../source/transform.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import Texture2D from "../source/texture2d.js";
import Solver from "../source/solver.js";
import EmitterMaterial from "../source/emitterMaterial.js";
import EmitterShape from "../source/emitterShape.js";

import { readAttrSchema } from "../source/shapeHelper.js";
import {genAngVel, genLinVel, genQuadUV, genRectHaltonPos} from "../source/generatorHelper.js";

import vaoQuadVert from "../shaders/glsl/quad-vert.glsl";
import vaoQuadFrag from "../shaders/glsl/quad-frag.glsl";
import emitVert from "../shaders/glsl/emit-vert.glsl";
import emitFrag from "../shaders/glsl/emit-frag.glsl";
import drawVert from "../shaders/glsl/draw-vert.glsl";
import drawFrag from "../shaders/glsl/draw-frag.glsl";



export function initTransFeed(gl, canvas, camera) {

    const time = new Time();

    const particleParams = {
        particleCount: 1000
    }


    // init emitter shader
    const emitterShader = new Shader({
        vertexSource: emitVert,
        fragmentSource: emitFrag,
    });
    emitterShader.initialize({gl});


    // init emitter material
    const emitterMaterial = new EmitterMaterial('emitterMat',{
        shader: emitterShader,
    });
    emitterMaterial.initialize({gl});

    const emitterShape = new EmitterShape('emitterShape', {
        count:6, schema: readAttrSchema(emitVert.attribute)
    });
    emitterShape.initialize({gl});
    emitterShape.update(gl, 'emitBuffer');

    // init transform feedback
    const solver = new Solver({
        shape: emitterShape,
        material: emitterMaterial
    });
    solver.initialize({gl});



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
    emitterMaterial.setTexture('uEmitterSlot0', emitterSlot0);
    // emitterMaterial.setTexture('uEmitterSlot0[0]', emitterSlot0[0]);

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
    emitterMaterial.setTexture('uEmitterSlot1', emitterSlot1);
    // emitterMaterial.setTexture('uEmitterSlot1[0]', emitterSlot1[0]);

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
    emitterMaterial.setTexture('uEmitterSlot2', emitterSlot2);
    // emitterMaterial.setTexture('uEmitterSlot2[0]', emitterSlot2[0]);


    emitterMaterial.setUniform('uCount', particleParams.particleCount);



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
    particleMaterial.setUniform('uCount', particleParams.particleCount);

    const particleShape = new Shape('particleShape',{
        count: 6,
        schema: readAttrSchema(drawVert.attribute)
    })
    particleShape.initialize({gl});
    particleShape.update(gl, 'particleBuffer');

    function drawTransFeed() {


        time.update();
        emitterMaterial.setUniform('uTime', time.ElapsedTime);
        emitterMaterial.setUniform('uDeltaTime', time.Interval);

        solver.update(gl);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(0.3, 0.3, 0.3, 1.0);
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
