// import { mat4 } from 'gl-matrix';
import Shader from './shader.js';
import Shape from './shape.js';
import Camera from './camera.js';
import Material from './material.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';
import FPSCounter from './fpscounter.js';
import { ParticleStateIds, ParticleSystem, ParticleEmitter } from './particle.js';

import vertexShaderSource from './shaders/particleVert2d.js';
import fragmentShaderSource from './shaders/particleFrag.js';

const canvas = document.getElementById('game-surface');
const gl = canvas.getContext('webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const camera = new Camera({aspect:canvas.width /canvas.height});
camera.setPosition([0, 0, -300]);
camera.updateProjection();
camera.updateView();
camera.updateViewInverse();

const shader = new Shader({
    vertexSource: vertexShaderSource,
    fragmentSource: fragmentShaderSource,
});
shader.initialize(gl);

const texture = new Texture2D();
texture.initialize(gl, './resources/crate.png');

const transform = new Transform();
transform.setPosition(0, 0, 0);

const material = new Material({
    shader: shader,
    texture: texture,  
})
material.initialize({gl});
// material.setTexture('uTexture',texture);

const particleSystem = new ParticleSystem(gl, null, pseudoRandom);

const fps = document.getElementById("fps");
if (!fps) {
    console.log('fps error')
}
const fpsCounter = new FPSCounter(fps);

let g_randSeed = 0;
let g_randRange = Math.pow(2, 32);
function pseudoRandom() {
    return (g_randSeed = (134775813 * g_randSeed + 1) % g_randRange) /
        g_randRange;
}

function setupFlame() {
    const emitter = particleSystem.createParticleEmitter();
    emitter.setTranslation(0, 0, 0);
    emitter.setState(ParticleStateIds.ADD);
    emitter.setColorRamp(
        [1, 1, 0, 1,
            1, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 0.5,
            0, 0, 0, 0
        ]);
    emitter.setParameters({
        numParticles: 20,
        lifeTime: 2,
        timeRange: 2,
        startSize: 50,
        endSize: 90,
        velocity: [0, 60, 0],
        velocityRange: [15, 15, 15],
        spinSpeedRange: 4
    });
}

function draw() {

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.colorMask(true, true, true, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    material.draw(gl, camera, transform);

    particleSystem.draw(material);

    if (fpsCounter) {
        fpsCounter.update();
    }
    
    requestAnimationFrame(draw);
}


setupFlame();

draw();