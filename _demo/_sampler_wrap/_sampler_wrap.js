import { getShaderSource, createProgram, loadImage } from '../_utility.js';
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

    // -- Divide viewport

    const windowSize = {
        x: canvas.width,
        y: canvas.height
    };

    const Corners = {
        TOP_LEFT: 0,
        TOP_RIGHT: 1,
        BOTTOM_RIGHT: 2,
        BOTTOM_LEFT: 3,
        MAX: 4
    };

    const viewport = new Array(Corners.MAX);

    viewport[Corners.BOTTOM_LEFT] = {
        x: 0,
        y: 0,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.BOTTOM_RIGHT] = {
        x: windowSize.x / 2,
        y: 0,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.TOP_RIGHT] = {
        x: windowSize.x / 2,
        y: windowSize.y / 2,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.TOP_LEFT] = {
        x: 0,
        y: windowSize.y / 2,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };


    // -- Initialize program

    const program = createProgram(gl, getShaderSource(vsSource), getShaderSource(fsSource));

    const uniformMvpLocation = gl.getUniformLocation(program,"mvp");
    const uniformDiffuseLocation = gl.getUniformLocation(program,"diffuse");

    // -- Initialize buffer

    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0,  1.0,
        1.0,  1.0,
        -1.0,  1.0,
        -1.0, -1.0
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const vertexTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    const texcoords = new Float32Array([
        -2.0,  2.0,
        2.0,  2.0,
        2.0, -2.0,
        2.0, -2.0,
        -2.0, -2.0,
        -2.0,  2.0
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    // -- Initilize vertex array

    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    const vertexPosLocation = 0; // set with GLSL layout qualifier
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const vertexTexLocation = 4; // set with GLSL layout qualifier
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.vertexAttribPointer(vertexTexLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexTexLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);


    // -- Initialize samplers

    const samplers = new Array(Corners.MAX);

    for (let i = 0; i < Corners.MAX; ++i) {
        samplers[i] = gl.createSampler();
        gl.samplerParameteri(samplers[i], gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.samplerParameteri(samplers[i], gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    gl.samplerParameteri(samplers[Corners.TOP_LEFT], gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.samplerParameteri(samplers[Corners.TOP_RIGHT], gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.samplerParameteri(samplers[Corners.BOTTOM_RIGHT], gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.samplerParameteri(samplers[Corners.BOTTOM_LEFT], gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    gl.samplerParameteri(samplers[Corners.TOP_LEFT], gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.samplerParameteri(samplers[Corners.TOP_RIGHT], gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.samplerParameteri(samplers[Corners.BOTTOM_RIGHT], gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.samplerParameteri(samplers[Corners.BOTTOM_LEFT], gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    // -- Load texture then render

    const imageUrl = './Di-3d.png';
    let texture;
    loadImage(imageUrl, function(image) {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0, // Level of details
            gl.RGBA, // Format
            gl.RGBA,
            gl.UNSIGNED_BYTE, // Size of each channel
            image
        );

        gl.generateMipmap(gl.TEXTURE_2D);
        render();
    });


    function render() {
        // Clear color buffer
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Bind program
        gl.useProgram(program);

        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        gl.uniformMatrix4fv(uniformMvpLocation, false, matrix);
        gl.uniform1i(uniformDiffuseLocation, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.bindVertexArray(vertexArray);

        for (let i = 0; i < Corners.MAX; ++i) {
            gl.viewport(viewport[i].x, viewport[i].y, viewport[i].z, viewport[i].w);

            gl.bindSampler(0, samplers[i]);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1);
        }

        // -- Clean up

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(vertexTexBuffer);
        for (let j = 0; j < samplers.length; ++j) {
            gl.deleteSampler(samplers[j]);
        }
        gl.deleteVertexArray(vertexArray);
        gl.deleteTexture(texture);
        gl.deleteProgram(program);
    }

}


main();