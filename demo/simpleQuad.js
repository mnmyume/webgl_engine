import Shader from "../source/shader.js";
import {basicFrag, basicVert} from "../shaders/output.js";
import Transform from "../source/transform.js";
import Material from "../source/material.js";
import {genQuad} from "../source/generatorHelper.js";
import Shape from "../source/shape.js";
import {readAttrSchema} from "../source/shapeHelper.js";


export function initSimpleQuad(gl, camera) {

    const quadParams = {
        quadSize: 10,
        quadColor: [1, 0, 1]
    }

    // init quad shader
    const quadShader = new Shader({
        vertexSource: basicVert,
        fragmentSource: basicFrag,
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
    quadMaterial.setUniform('uColor', quadParams.quadColor);

    // init quad shape
    const quadData = genQuad(quadParams.quadSize);
    const quadShape = new Shape(
        'quad',
        {count: 6, schema: readAttrSchema(basicVert.attribute)});
    quadShape.initialize({gl});
    quadShape.update(gl, 'quadBuffer', quadData);

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