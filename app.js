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

const camera = new Camera();
camera.setPosition(0, 0, 5);
camera.updateProjection();
camera.updateView();


const shape = new Shape({
    data: {
        vertice: [ 
            // X, Y, Z         U, V
            // Top
            -1.0, 1.0, -1.0,   0, 0,
            -1.0, 1.0, 1.0,    0, 1,
            1.0, 1.0, 1.0,     1, 1,
            1.0, 1.0, -1.0,    1, 0,
    
            // Left
            -1.0, 1.0, 1.0,    0, 0,
            -1.0, -1.0, 1.0,   1, 0,
            -1.0, -1.0, -1.0,  1, 1,
            -1.0, 1.0, -1.0,   0, 1,
    
            // Right
            1.0, 1.0, 1.0,    1, 1,
            1.0, -1.0, 1.0,   0, 1,
            1.0, -1.0, -1.0,  0, 0,
            1.0, 1.0, -1.0,   1, 0,
    
            // Front
            1.0, 1.0, 1.0,    1, 1,
            1.0, -1.0, 1.0,    1, 0,
            -1.0, -1.0, 1.0,    0, 0,
            -1.0, 1.0, 1.0,    0, 1,
    
            // Back
            1.0, 1.0, -1.0,    0, 0,
            1.0, -1.0, -1.0,    0, 1,
            -1.0, -1.0, -1.0,    1, 1,
            -1.0, 1.0, -1.0,    1, 0,
    
            // Bottom
            -1.0, -1.0, -1.0,   1, 1,
            -1.0, -1.0, 1.0,    1, 0,
            1.0, -1.0, 1.0,     0, 0,
            1.0, -1.0, -1.0,    0, 1,
        ],
        indice: [
            // Top
            0, 1, 2,
            0, 2, 3,
    
            // Left
            5, 4, 6,
            6, 4, 7,
    
            // Right
            8, 9, 10,
            8, 10, 11,
    
            // Front
            13, 12, 14,
            15, 14, 12,
    
            // Back
            16, 17, 18,
            16, 18, 19,
    
            // Bottom
            21, 20, 22,
            22, 20, 23
        ],
        normals: [
            // Define cube normals here
        ],
        uvs: [
            // Define cube UVs here
        ]
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

    material.draw(gl, camera, transform);

    shape.draw(gl, shader);


    requestAnimationFrame(draw);
}

draw();
