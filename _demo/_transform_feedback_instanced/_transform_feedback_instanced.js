import { getShaderSource, createProgram } from '../_utility.js';
import { vsEmitSource, fsEmitSource, vsDrawSource, fsDrawSource } from './_shaderSource.js';


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

    // -- Init Program

    var PROGRAM_TRANSFORM = 0;
    var PROGRAM_DRAW = 1;

    var programs = initPrograms();


    // -- Initialize data
    var NUM_INSTANCES = 1000;

    var currentSourceIdx = 0;

    const NUM_VERT = 3;
    const floatsPerOffset = 2;
    const floatsPerRotation = 1;
    const floatsPerPosition = 2;
    const floatsPerColor = 3;

    const floatsPerInstance =
        floatsPerOffset +
        floatsPerRotation +
        floatsPerPosition +
        floatsPerColor;

    let instanceArray = [];

    for (let i = 0; i < NUM_INSTANCES; ++i) {

        instanceArray.push(
            Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2 * Math.PI,  0.015,  0.0,   1, 0, 0,
            Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2 * Math.PI, -0.010,  0.010, 1, 0, 0,
            Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2 * Math.PI, -0.010, -0.010, 1, 0, 0,
        );
    }

    const instanceData = new Float32Array(instanceArray);


    // -- Init Vertex Array
    var OFFSET_LOCATION = 0;
    var ROTATION_LOCATION = 1;
    var POSITION_LOCATION = 2;      // this is vertex position of the instanced geometry
    var COLOR_LOCATION = 3;
    var NUM_LOCATIONS = 4;

    var drawTimeLocation = gl.getUniformLocation(programs[PROGRAM_DRAW], 'u_time');

    var vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];

    // Transform feedback objects track output buffer state
    var transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

    var vertexBuffers = new Array(vertexArrays.length);

    for (var va = 0; va < vertexArrays.length; ++va) {
        gl.bindVertexArray(vertexArrays[va]);
        // vertexBuffers[va] = new Array(NUM_LOCATIONS);
        vertexBuffers[va] = gl.createBuffer();

        // vertexBuffers[va][OFFSET_LOCATION] = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][OFFSET_LOCATION]);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va]);
        gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.STREAM_COPY);
        gl.vertexAttribPointer(OFFSET_LOCATION, 2, gl.FLOAT, false, 32, 0);
        gl.enableVertexAttribArray(OFFSET_LOCATION);

        // vertexBuffers[va][ROTATION_LOCATION] = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][ROTATION_LOCATION]);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va]);
        gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.STREAM_COPY);
        gl.vertexAttribPointer(ROTATION_LOCATION, 1, gl.FLOAT, false, 32, 8);
        gl.enableVertexAttribArray(ROTATION_LOCATION);

        // vertexBuffers[va][POSITION_LOCATION] = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][POSITION_LOCATION]);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va]);
        gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 32, 12);
        gl.enableVertexAttribArray(POSITION_LOCATION);

        // vertexBuffers[va][COLOR_LOCATION] = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][COLOR_LOCATION]);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va]);
        gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(COLOR_LOCATION, 3, gl.FLOAT, false, 32, 20);
        gl.enableVertexAttribArray(COLOR_LOCATION);
        // gl.vertexAttribDivisor(COLOR_LOCATION, 1); // attribute used once per instance

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Set up output
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedbacks[va]);
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertexBuffers[va][OFFSET_LOCATION]);
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertexBuffers[va][ROTATION_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertexBuffers[va]);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    }

    render();


    function initPrograms() {

        // Setup program for transform feedback shaders
        function createShader(gl, source, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        var vshaderTransform = createShader(gl, getShaderSource(vsEmitSource), gl.VERTEX_SHADER);
        var fshaderTransform = createShader(gl, getShaderSource(fsEmitSource), gl.FRAGMENT_SHADER);

        var programTransform = gl.createProgram();
        gl.attachShader(programTransform, vshaderTransform);
        gl.deleteShader(vshaderTransform);
        gl.attachShader(programTransform, fshaderTransform);
        gl.deleteShader(fshaderTransform);

        var varyings = ['v_offset', 'v_rotation'];
        gl.transformFeedbackVaryings(programTransform, varyings, gl.INTERLEAVED_ATTRIBS);
        gl.linkProgram(programTransform);

        // check
        var log = gl.getProgramInfoLog(programTransform);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(vshaderTransform);
        if (log) {
            console.log(log);
        }

        // Setup program for draw shader
        var programDraw = createProgram(gl, getShaderSource(vsDrawSource), getShaderSource(fsDrawSource));

        var programs = [programTransform, programDraw];
        return programs;
    }

    function transform() {
        var programTransform = programs[PROGRAM_TRANSFORM];
        var destinationIdx = (currentSourceIdx + 1) % 2;

        // Toggle source and destination VBO
        var sourceVAO = vertexArrays[currentSourceIdx];

        var destinationTransformFeedback = transformFeedbacks[destinationIdx];

        gl.useProgram(programTransform);

        gl.bindVertexArray(sourceVAO);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destinationTransformFeedback);

        // NOTE: The following two lines shouldn't be necessary, but are required to work in ANGLE
        // due to a bug in its handling of transform feedback objects.
        // https://bugs.chromium.org/p/angleproject/issues/detail?id=2051
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertexBuffers[destinationIdx][OFFSET_LOCATION]);
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertexBuffers[destinationIdx][ROTATION_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertexBuffers[destinationIdx]);

        // Attributes per-vertex when doing transform feedback needs setting to 0 when doing transform feedback
        gl.vertexAttribDivisor(OFFSET_LOCATION, 0);
        gl.vertexAttribDivisor(ROTATION_LOCATION, 0);

        // Turn off rasterization - we are not drawing
        gl.enable(gl.RASTERIZER_DISCARD);

        // Update position and rotation using transform feedback
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, NUM_INSTANCES);
        gl.endTransformFeedback();

        // Restore state
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.useProgram(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;
    }

    function render() {
        // Rotate triangles
        transform();

        // Set the viewport
        gl.viewport(0, 0, canvas.width, canvas.height - 10);

        // Clear color buffer
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindVertexArray(vertexArrays[currentSourceIdx]);

        // Attributes per-instance when drawing sets back to 1 when drawing instances
        gl.vertexAttribDivisor(OFFSET_LOCATION, 1);
        gl.vertexAttribDivisor(ROTATION_LOCATION, 1);

        gl.useProgram(programs[PROGRAM_DRAW]);

        // Enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        // Set uniforms
        var time = Date.now();
        gl.uniform1f(drawTimeLocation, time);

        // gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, NUM_INSTANCES);
        gl.drawArrays(gl.TRIANGLES, 0, NUM_INSTANCES*3);
        requestAnimationFrame(render);
    }

}


main();