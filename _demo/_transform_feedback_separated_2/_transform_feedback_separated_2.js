import { getShaderSource, createProgram, initProgram } from '../_utility.js';
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

    // -- Declare variables for the particle system

    const NUM_PARTICLES = 1000;
    const ACCELERATION = -1.0;

    const appStartTime = Date.now();
    let currentSourceIdx = 0;

    const program = initProgram(gl, vsSource, fsSource);

    // Get uniform locations for the draw program
    const drawTimeLocation = gl.getUniformLocation(program, 'u_time');
    const drawAccelerationLocation = gl.getUniformLocation(program, 'u_acceleration');
    const drawColorLocation = gl.getUniformLocation(program, 'u_color');

    // -- Initialize particle data

    const particlePositions = new Float32Array(NUM_PARTICLES * 2);
    const particleVelocities = new Float32Array(NUM_PARTICLES * 2);
    const particleSpawntime = new Float32Array(NUM_PARTICLES);
    const particleLifetime = new Float32Array(NUM_PARTICLES);
    const particleIDs = new Float32Array(NUM_PARTICLES);

    const POSITION_LOCATION = 0;
    const VELOCITY_LOCATION = 1;
    const SPAWNTIME_LOCATION = 2;
    const LIFETIME_LOCATION = 3;
    const ID_LOCATION = 4;
    const NUM_LOCATIONS = 5;

    for (let p = 0; p < NUM_PARTICLES; ++p) {
        particlePositions[p * 2] = 0.0;
        particlePositions[p * 2 + 1] = 0.0;
        particleVelocities[p * 2] = 0.0;
        particleVelocities[p * 2 + 1] = 0.0;
        particleSpawntime[p] = 0.0;
        particleLifetime[p] = 0.0;
        particleIDs[p] = p;
    }

    // -- Init Vertex Arrays and Buffers
    const particleVAOs = [gl.createVertexArray(), gl.createVertexArray()];

    // Transform feedback objects track output buffer state
    const particleTransformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

    const particleVBOs = new Array(particleVAOs.length);

    for (let i = 0; i < particleVAOs.length; ++i) {
        particleVBOs[i] = new Array(NUM_LOCATIONS);

        // Set up input
        gl.bindVertexArray(particleVAOs[i]);

        particleVBOs[i][POSITION_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][POSITION_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, particlePositions, gl.STREAM_COPY);
        gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(POSITION_LOCATION);

        particleVBOs[i][VELOCITY_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][VELOCITY_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, particleVelocities, gl.STREAM_COPY);
        gl.vertexAttribPointer(VELOCITY_LOCATION, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(VELOCITY_LOCATION);

        particleVBOs[i][SPAWNTIME_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][SPAWNTIME_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, particleSpawntime, gl.STREAM_COPY);
        gl.vertexAttribPointer(SPAWNTIME_LOCATION, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(SPAWNTIME_LOCATION);

        particleVBOs[i][LIFETIME_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][LIFETIME_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, particleLifetime, gl.STREAM_COPY);
        gl.vertexAttribPointer(LIFETIME_LOCATION, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(LIFETIME_LOCATION);

        particleVBOs[i][ID_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][ID_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, particleIDs, gl.STATIC_READ);
        gl.vertexAttribPointer(ID_LOCATION, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(ID_LOCATION);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Set up output
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, particleTransformFeedbacks[i]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, particleVBOs[i][POSITION_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, particleVBOs[i][VELOCITY_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, particleVBOs[i][SPAWNTIME_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 3, particleVBOs[i][LIFETIME_LOCATION]);

    }

    gl.useProgram(program);
    gl.uniform4f(drawColorLocation, 0.0, 1.0, 1.0, 1.0);
    gl.uniform2f(drawAccelerationLocation, 0.0, ACCELERATION);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    function render() {

        const time = Date.now() - appStartTime;
        const destinationIdx = (currentSourceIdx + 1) % 2;

        // Set the viewport
        gl.viewport(0, 0, canvas.width, canvas.height - 10);

        // Clear color buffer
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Toggle source and destination VBO
        const sourceVAO = particleVAOs[currentSourceIdx];
        const destinationTransformFeedback = particleTransformFeedbacks[destinationIdx];

        gl.bindVertexArray(sourceVAO);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destinationTransformFeedback);

        // NOTE: The following four lines shouldn't be necessary, but are required to work in ANGLE
        // due to a bug in its handling of transform feedback objects.
        // https://bugs.chromium.org/p/angleproject/issues/detail?id=2051
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, particleVBOs[destinationIdx][POSITION_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, particleVBOs[destinationIdx][VELOCITY_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, particleVBOs[destinationIdx][SPAWNTIME_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 3, particleVBOs[destinationIdx][LIFETIME_LOCATION]);

        // Set uniforms
        gl.uniform1f(drawTimeLocation, time);

        // Draw particles using transform feedback
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
        gl.endTransformFeedback();

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

}


main();