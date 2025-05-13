import { getShaderSource, createProgram } from '../_utility.js';
import { vsRenderSource, fsRenderSource,
         vsRenderCentroidSource, fsRenderCentroidSource,
         vsSplashSource, fsSplashSource } from './_shaderSource.js';


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
    const canvasSize = {
        x: canvas.width,
        y: canvas.height
    };

    const VIEWPORTS = {
        LEFT: 0,
        RIGHT: 1,
        MAX: 2
    };

    const viewport = new Array(VIEWPORTS.MAX);

    viewport[VIEWPORTS.LEFT] = {
        x: 0,
        y: canvasSize.y - canvasSize.x / 2,
        width: canvasSize.x / 2,
        height: canvasSize.x / 2
    };

    viewport[VIEWPORTS.RIGHT] = {
        x: canvasSize.x / 2,
        y: canvasSize.y - canvasSize.x / 2,
        width: canvasSize.x / 2,
        height: canvasSize.x / 2
    };


    // -- Init program
    const PROGRAM = {
        TEXTURE: 0,
        TEXTURE_CENTROID: 1,
        SPLASH: 2,
        MAX: 3
    };

    const programs = [
        createProgram(gl, getShaderSource(vsRenderSource), getShaderSource(fsRenderSource)),
        createProgram(gl, getShaderSource(vsRenderCentroidSource), getShaderSource(fsRenderCentroidSource)),
        createProgram(gl, getShaderSource(vsSplashSource), getShaderSource(fsSplashSource))
    ];
    const mvpLocationTextures = [
        gl.getUniformLocation(programs[PROGRAM.TEXTURE], 'MVP'),
        gl.getUniformLocation(programs[PROGRAM.TEXTURE_CENTROID], 'MVP')
    ];
    const mvpLocation = gl.getUniformLocation(programs[PROGRAM.SPLASH], 'MVP');
    const diffuseLocation = gl.getUniformLocation(programs[PROGRAM.SPLASH], 'diffuse');


    // -- Init primitive data
    const vertexCount = 3;
    const scaleFactor = 0.1;
    const positions = new Float32Array([
        scaleFactor * 0.0, scaleFactor * 0.8,
        scaleFactor * -0.8, scaleFactor * -0.4,
        scaleFactor * 1.0, scaleFactor * -0.8,
    ]);

    const data = new Float32Array([
        0.0, 0.0, 1.0
    ]);


    // -- Init buffers
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const vertexDataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    // Draw the rect texture
    // This can be discarded when gl_VertexID is available
    const textureVertexPositions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0,  1.0,
        1.0,  1.0,
        -1.0,  1.0,
        -1.0, -1.0
    ]);
    const texVertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texVertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureVertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const textureVertexTexCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const texVertexTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texVertexTexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureVertexTexCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    // -- Init Texture
    // used for draw framebuffer storage
    const FRAMEBUFFER_SIZE = {
        x: canvas.width,
        y: canvas.height
    };
    const textures = [gl.createTexture(), gl.createTexture()];

    for (let i = 0; i < VIEWPORTS.MAX; ++i) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }


    // -- Init Frame Buffers
    const FRAMEBUFFER = {
        RENDERBUFFER: 0,
        RENDERBUFFER_CENTROID: 1,
        COLORBUFFER: 2,
        COLORBUFFER_CENTROID: 3
    };
    const framebuffers = [
        gl.createFramebuffer(),
        gl.createFramebuffer(),
        gl.createFramebuffer(),
        gl.createFramebuffer()
    ];


    // non-centroid
    const colorRenderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, colorRenderbuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[FRAMEBUFFER.RENDERBUFFER]);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorRenderbuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // centroid
    const colorRenderbufferCentroid = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, colorRenderbufferCentroid);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[FRAMEBUFFER.RENDERBUFFER_CENTROID]);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorRenderbufferCentroid);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    // -- Init VertexArray
    const vertexArrays = [
        gl.createVertexArray(),
        gl.createVertexArray(),
        gl.createVertexArray()
    ];

    const vertexPosLocation = 0;
    const vertexDataLocation = 6;

    gl.bindVertexArray(vertexArrays[PROGRAM.TEXTURE]);
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(vertexDataLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.vertexAttribPointer(vertexDataLocation, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    gl.bindVertexArray(vertexArrays[PROGRAM.TEXTURE_CENTROID]);
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(vertexDataLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.vertexAttribPointer(vertexDataLocation, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    gl.bindVertexArray(vertexArrays[PROGRAM.SPLASH]);

    gl.enableVertexAttribArray(vertexPosLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texVertexPosBuffer);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const vertexTexLocation = 1;
    gl.enableVertexAttribArray(vertexTexLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texVertexTexBuffer);
    gl.vertexAttribPointer(vertexTexLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);


    // -- Render

    // Pass 1
    const IDENTITY = mat4.create();
    for (let i = 0; i < VIEWPORTS.MAX; ++i) {
        // color buffers
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i+2]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[i], 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // render buffers
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i]);
        gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 1]);
        gl.useProgram(programs[i]);
        gl.bindVertexArray(vertexArrays[i]);

        gl.uniformMatrix4fv(mvpLocationTextures[i], false, IDENTITY);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Blit framebuffers, no Multisample texture 2d in WebGL 2
        // centroid will only work with multisample
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffers[i]);

        // color buffers
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffers[i + 2]);
        gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
        gl.blitFramebuffer(
            0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
            0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
            gl.COLOR_BUFFER_BIT, gl.NEAREST
        );

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    }


    // Pass 2
    gl.useProgram(programs[PROGRAM.SPLASH]);

    gl.bindVertexArray(vertexArrays[PROGRAM.SPLASH]);

    var scaleVector3 = vec3.create();
    var invScaleFactor = 0.8 / scaleFactor;
    vec3.set(scaleVector3, invScaleFactor, invScaleFactor, invScaleFactor);
    var mvp = mat4.create();
    mat4.scale(mvp, IDENTITY, scaleVector3);

    for (let i = 0; i < VIEWPORTS.MAX; ++i) {
        gl.uniform1i(diffuseLocation, i);

        gl.activeTexture(gl.TEXTURE0+i);
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);

        gl.viewport(viewport[i].x, viewport[i].y, viewport[i].width, viewport[i].height);
        gl.uniformMatrix4fv(mvpLocation, false, mvp);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }


    // -- Delete WebGL resources
    gl.deleteBuffer(texVertexPosBuffer);
    gl.deleteBuffer(texVertexTexBuffer);
    gl.deleteBuffer(vertexPositionBuffer);
    gl.deleteBuffer(vertexDataBuffer);

    gl.deleteTexture(textures[PROGRAM.TEXTURE]);
    gl.deleteTexture(textures[PROGRAM.TEXTURE_CENTROID]);

    gl.deleteRenderbuffer(colorRenderbuffer);
    gl.deleteRenderbuffer(colorRenderbufferCentroid);

    gl.deleteFramebuffer(framebuffers[FRAMEBUFFER.RENDERBUFFER]);
    gl.deleteFramebuffer(framebuffers[FRAMEBUFFER.COLORBUFFER]);

    gl.deleteFramebuffer(framebuffers[FRAMEBUFFER.RENDERBUFFER_CENTROID]);
    gl.deleteFramebuffer(framebuffers[FRAMEBUFFER.COLORBUFFER_CENTROID]);

    gl.deleteVertexArray(vertexArrays[PROGRAM.TEXTURE]);
    gl.deleteVertexArray(vertexArrays[PROGRAM.TEXTURE_CENTROID]);
    gl.deleteVertexArray(vertexArrays[PROGRAM.SPLASH]);

    gl.deleteProgram(programs[PROGRAM.TEXTURE]);
    gl.deleteProgram(programs[PROGRAM.TEXTURE_CENTROID]);
    gl.deleteProgram(programs[PROGRAM.SPLASH]);
}


main();