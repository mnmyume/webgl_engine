import {sqrtFloor} from "../source/mathHelper.js";
import Transform from "../source/transform.js";
import Shader from "../source/shader.js";
import {
    basicVert, basicFrag,
    vaoQuadVert, vaoQuadFrag
} from "../shaders/output.js";
import Material from "../source/material.js";
import ScreenQuad from "../source/screenQuad.js";
import {readAttrSchema} from "../source/shapeHelper.js";
import Solver from "../source/solver.js";
import Texture2D from "../source/texture2d.js";
import {genAngVel, genLinVel, genQuad, genRectHaltonPos} from "../source/generatorHelper.js";
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

}