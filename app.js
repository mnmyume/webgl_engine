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
camera.setPosition([5, 5, 5]);
camera.updateProjection();
camera.updateView();

//uniform size: [1,10]

//attribute:
    // X, Y, Z         U, V


//Point ==> Quad
//POS           UV 0,1,
//POS           UV 0,0,
//POS           UV 1,0,


//POS           UV 0,1,
//POS           UV 1,0,
//POS           UV 1,1,

//genParticle(minX,maxX,minY,maxY,minZ,maxZ)
// P0x = Math.random()*(maxX-minX);
// P0,    0, 0,
// P0,     1, 0,
// P0,     1, 1,
// P0,    0, 1,

// P1,    0, 0,
// P1,     1, 0,
// P1,     1, 1,
// P1,    0, 1,


// P2,    0, 0,
// P2,     1, 0,
// P2,     1, 1,
// P2,    0, 1,


const shape = new Shape({
    data: {
        vertice: [ 
            // top
             -1.0, 1.0, -1.0,
             -1.0, 1.0, 1.0,
             1.0, 1.0, 1.0,
             -1.0, 1.0, -1.0,
             1.0, 1.0, 1.0,
             1.0, 1.0, -1.0,

             // left
             -1.0, -1.0, 1.0,
             -1.0, 1.0, 1.0,
             -1.0, -1.0, -1.0,
             -1.0, -1.0, -1.0,
             -1.0, 1.0, 1.0,
             -1.0, 1.0, -1.0,

             // right
             1.0, 1.0, 1.0,
             1.0, -1.0, 1.0,
             1.0, -1.0, -1.0,
             1.0, 1.0, 1.0,
             1.0, -1.0, -1.0,
             1.0, 1.0, -1.0,

             // front
             1.0, -1.0, 1.0,
             1.0, 1.0, 1.0,
             -1.0, -1.0, 1.0,
             -1.0, 1.0, 1.0,
             -1.0, -1.0, 1.0,
             1.0, 1.0, 1.0,

             // back
             1.0, 1.0, -1.0,
             1.0, -1.0, -1.0,
             -1.0, -1.0, -1.0,
             1.0, 1.0, -1.0,
             -1.0, -1.0, -1.0,
             -1.0, 1.0, -1.0,

             // bottom
             -1.0, -1.0, 1.0,
             -1.0, -1.0, -1.0,
             1.0, -1.0, 1.0,
             1.0, -1.0, 1.0,
             -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0
        ],

        uvs: [
            0, 0,
            1, 0,
            1, 1,
            0, 1
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

    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    material.draw(gl, camera, transform);

    shape.draw(gl, shader);

    requestAnimationFrame(draw);
}

draw();
