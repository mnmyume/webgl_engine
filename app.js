// import { mat4 } from 'gl-matrix';
import Shader from './shader.js';
import Shape from './shape.js';
import Camera from './camera.js';
import Material from './material.js';
import vertexShaderSource from './shaders/vertexShader.js';
import fragmentShaderSource from './shaders/fragmentShader.js';
import Texture2D from './texture2d.js';
import Transform from './transform.js';

const canvas = document.getElementById('game-surface');
const gl = canvas.getContext('webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);


const camera = new Camera({aspect:canvas.width /canvas.height});
camera.setPosition([0, 0, 5]);
camera.updateProjection();
camera.updateView();


const shape = new Shape({
    data: {
        vertice: [ 
            // X, Y, Z         U, V
            // Top
            -1.0, -1.0,  0.0,    0, 0, //5*4 = 20Byte
            1.0, -1.0,  0.0,     1, 0,
            1.0, 1.0,   0.0,     1, 1,
            -1.0, 1.0,   0.0,    0, 1,

        ],
        indice: [
            0,1,2,
            0,2,3
        ],
    }
});

const shader = new Shader({
    vertexSource: vertexShaderSource,
    fragmentSource: fragmentShaderSource,
    initValues:{uTexture:0}
});

shader.initialize(gl);
shape.initialize({ gl });

const texture = new Texture2D();
texture.initialize(gl, './resources/crate.png');

const transform = new Transform();
transform.setPosition(0, 0, 0);

const material = new Material({
    shader: shader,
    texture: texture,  
})

material.initialize({gl});

material.setTexture('uTexture',texture);

function draw() {





    gl.clearColor(0.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    material.draw(gl, camera, transform);

    shape.draw(gl, shader);


    requestAnimationFrame(draw);
}

draw();
