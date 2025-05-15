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

    // -- Init Vertex Array
    var vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    // -- Init Buffer
    const vertexPosLocation = 0;
    const vertices = new Float32Array([
        -0.5, -0.5,        0, 0, 0,
        -0.5, 0.5,         0, 1, 0,
        0.5,  0.5,         1, 0, 0,
        -0.5, -0.5,        0, 0, 0,
        0.5,  0.5,         1, 0, 0,
        0.5,  -0.5,        1, 1, 1
    ]);
    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(vertexPosLocation, 3, gl.FLOAT, false, 20, 8);


    // const vertexColorLocation = 1;
    // const colors = new Float32Array([
    //     1.0, 0.5, 0.0,
    //     0.0, 0.5, 1.0
    // ]);
    // const vertexColorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    // gl.enableVertexAttribArray(vertexColorLocation);
    // gl.vertexAttribPointer(vertexColorLocation, 3, gl.FLOAT, false, 0, 0);
    // gl.vertexAttribDivisor(vertexColorLocation, 1);

    gl.bindVertexArray(null);

    // -- Render
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vertexArray);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 2);

    // -- Delete WebGL resources
    gl.deleteBuffer(vertexPosBuffer);
    gl.deleteProgram(program);
    gl.deleteVertexArray(vertexArray);

}


main();