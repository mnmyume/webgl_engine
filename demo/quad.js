import {sqrtFloor} from "../source/mathHelper.js";
import Transform from "../source/transform.js";
import Shader from "../source/shader.js";
// import {
//     basicVert, basicFrag,
//     vaoQuadVert, vaoQuadFrag
// } from "../shaders/output.js";


import vaoQuadVert from "../shaders/glsl/vaoQuad-vert.glsl"
import vaoQuadFrag from "../shaders/glsl/vaoQuad-frag.glsl"
import testTransformFeedback from "../shaders/glsl/testTransformFeedback.glsl"
import Material from "../source/material.js";
import ScreenQuad from "../source/screenQuad.js";
import {readAttrSchema} from "../source/shapeHelper.js";
import Solver from "../source/solver.js";
import Texture2D from "../source/texture2d.js";
import {genAngVel, genLinVel, genQuadUV, genQuad, genRectHaltonPos} from "../source/generatorHelper.js";
import PartiShape from "../source/partiShape.js";
import Shape from "../source/shape.js";


export function initWebgl2Quad(gl, camera) {
    const quadParams = {
        quadSize: 10,
        quadColor: [1, 0, 1]
    }



    // init quad shader
    const quadShader = new Shader({
        vertexSource: vaoQuadVert,
        fragmentSource: vaoQuadFrag,
    });
    quadShader.initialize({gl});

    // init transform
    const quadTransform = new Transform();
    quadTransform.setPosition(0, 0, 0);
    // quadTransform.scale(quadParams.quadSize, quadParams.quadSize, quadParams.quadSize);

    // init material
    const quadMaterial = new Material('quadMat',{
        shader: quadShader,
    })
    quadMaterial.initialize({gl});
    // quadMaterial.setUniform('uColor', quadParams.quadColor);

    // init quad shape
    const quadData = genQuad(1);
    const quadShape = new Shape(
        'quad',
        {count: 6, schema: readAttrSchema(vaoQuadVert.input)});
    quadShape.initialize({gl});
    quadShape.update(gl, 'quadBuffer', {material:quadMaterial, data:quadData});

    function drawSimpleQuad() {

        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        quadMaterial.preDraw(gl, camera, quadTransform);

        quadShape.draw(gl, quadMaterial);

        quadMaterial.postDraw(gl);

        requestAnimationFrame(drawSimpleQuad);
    }

    drawSimpleQuad();
}
