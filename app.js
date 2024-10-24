import Shader from './shader.js';
import Shape from './shape.js';

import vertexShaderSource from './shaders/vertexShader.js';
import fragmentShaderSource from './shaders/fragmentShader.js';
import { Material } from './material.js';

const canvas = document.getElementById('webgl');
const gl = canvas.getContext('webgl');

//
// create shader
//
const shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
let program = shader.getProgram();

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);

//
// create buffer
//
const boxVertices = [
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
];

const boxIndices = [
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
];

let box = new Shape(gl);
box.initialize(boxVertices, boxIndices);

let vertPosition = gl.getAttribLocation(gl.program, 'vertPosition');
let vertTexCoord = gl.getAttribLocation(gl.program, 'vertTexCoord');
gl.vertexAttribPointer(
  vertPosition,   // Attribute location
  3,    // Number of elements per attribute
  gl.FLOAT, // Type of attribute
  gl.FALSE, 
  5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
  0 // offset
);
gl.vertexAttribPointer(
  vertTexCoord,   // Attribute location
  2,    // Number of elements per attribute
  gl.FLOAT, // Type of attribute
  gl.FALSE, 
  5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
  3 * Float32Array.BYTES_PER_ELEMENT // offset
);
gl.enableVertexAttribArray(vertPosition);
gl.enableVertexAttribArray(vertTexCoord);

//
// create texture
//
let boxTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, boxTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texImage2D(
	gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
	gl.UNSIGNED_BYTE,
	document.getElementById('crate-image')
);
// gl.bindTexture(gl.TEXTURE_2D, null);

// active program
// shader.use();

let material = new Material(gl, gl.program);

material.initialize();

// let mWorld = gl.getUniformLocation(gl.program, 'mWorld');
// let mView = gl.getUniformLocation(gl.program, 'mView');
// let mProj = gl.getUniformLocation(gl.program, 'mProj');

let worldMatrix = new Float32Array(16);
let viewMatrix = new Float32Array(16);
let projMatrix = new Float32Array(16);
mat4.identity(worldMatrix);
mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

material.draw(worldMatrix, viewMatrix, projMatrix);

// gl.uniformMatrix4fv(mWorld, gl.FALSE, worldMatrix);
// gl.uniformMatrix4fv(mView, gl.FALSE, viewMatrix);
// gl.uniformMatrix4fv(mProj, gl.FALSE, projMatrix);

let xRotationMatrix = new Float32Array(16);
let yRotationMatrix = new Float32Array(16);

//
// Main render loop
//
var identityMatrix = new Float32Array(16);
mat4.identity(identityMatrix);
var angle = 0;
var loop = function () {
	angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
	mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
	mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
	material.draw(worldMatrix, viewMatrix, projMatrix);
  // gl.uniformMatrix4fv(mWorld, gl.FALSE, worldMatrix);

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.activeTexture(gl.TEXTURE0);
	gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
  
	requestAnimationFrame(loop);
};
requestAnimationFrame(loop);