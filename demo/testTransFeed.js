import Shader from "../source/shader.js";
import Transform from "../source/transform.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import Texture2D from "../source/texture2d.js";
import TransformFeedback from "../source/transformFeedback.js";
import EmitterMaterial from "../source/emitterMaterial.js";

import { readAttrSchema } from "../source/shapeHelper.js";
import { genQuadUV } from "../source/generatorHelper.js";

import vaoQuadVert from "../shaders/glsl/vaoQuad-vert.glsl";
import vaoQuadFrag from "../shaders/glsl/vaoQuad-frag.glsl";
import emitVert from "../shaders/glsl/emit-vert.glsl";
import emitFrag from "../shaders/glsl/emit-frag.glsl";
import drawVert from "../shaders/glsl/draw-vert.glsl";
import drawFrag from "../shaders/glsl/draw-frag.glsl";



export function initTransFeed(gl, canvas, camera) {

    const particleParams = {
        particleCount: 1000
    }


    // init emit shader
    const emitShader = new Shader({
        vertexSource: emitVert,
        fragmentSource: emitFrag,
    });
    emitShader.initialize({gl});


    // init emit material
    const emitMaterial = new EmitterMaterial('emitterMat',{
        shader: emitShader,
    });
    emitMaterial.initialize({gl});


    // init transform feedback
    const transformFeedback = new TransformFeedback('transformFeedback',{
        transformProgram: emitMaterial.shaderProgram,

    });
    transformFeedback.initialize({gl});




    function drawTransFeed() {

        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        requestAnimationFrame(drawTransFeed);
    }

    drawTransFeed();
}
