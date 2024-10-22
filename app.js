import initShaders from './initShaders.js'

import Shape from './shape.js';
import vertexShader from './shaders/vertexShader.js';
import fragmentShader from './shaders/fragmentShader.js';

const canvas = document.getElementById('webgl');
const gl = canvas.getContext('webgl');

const vertices = [
  -0.5, -0.5,
   0.5, -0.5,
   0.0,  0.5
];

const shape = new Shape(gl, vertices, vertexShader, fragmentShader);
shape.initialize();
shape.draw();