import { getShaderSource, createProgram } from '../_utility.js';
import { vsSource, fsSource } from './_shaderSource.js';

export default function main() {

    const canvas = document.getElementById('game-surface');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl2', { antialias: false });
    const isWebGL2 = !!gl;
    if(!isWebGL2) {
        console.log('WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>');
        return;
    }

    // -- Init program
    const program = createProgram(gl, getShaderSource(vsSource), getShaderSource(fsSource));
    gl.useProgram(program);

    // -- Init Buffer
    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    const vertices = new Float32Array([
        -0.3, -0.5,
        0.3, -0.5,
        0.0,  0.5
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const uniformTransformLocation = gl.getUniformBlockIndex(program, 'Transform');
    const uniformMaterialLocation = gl.getUniformBlockIndex(program, 'Material');
    gl.uniformBlockBinding(program, uniformTransformLocation, 0);
    gl.uniformBlockBinding(program, uniformMaterialLocation, 1);

    const uniformTransformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, uniformTransformBuffer);
    const transforms = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        -0.5, 0.0, 0.0, 1.0,

        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.5, 0.0, 0.0, 1.0
    ]);
    gl.bufferData(gl.UNIFORM_BUFFER, transforms, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const uniformMaterialBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, uniformMaterialBuffer);
    const materials = new Float32Array([
        1.0, 0.5, 0.0, 1.0,
        0.0, 0.5, 1.0, 1.0
    ]);
    gl.bufferData(gl.UNIFORM_BUFFER, materials, gl.STATIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    // -- Render
    gl.clearColor(0.3,0.2,0.1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uniformTransformBuffer);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, uniformMaterialBuffer);

    const vertexPosLocation = 0;  // set with GLSL layout qualifier
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, 2);

    // -- Delete WebGL resources
    gl.deleteBuffer(vertexPosBuffer);
    gl.deleteBuffer(uniformTransformBuffer);
    gl.deleteBuffer(uniformMaterialBuffer);
    gl.deleteProgram(program);

}


main();