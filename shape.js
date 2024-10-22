import initShaders from './initShaders.js'

class Shape {
  constructor(gl, vertices, vertexShader, fragmentShader) {
    this.gl = gl;
    this.vertices = vertices;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.buffer = null;
  }

  initialize() {
    // Initialize shaders
    if (!initShaders(this.gl, this.vertexShader, this.fragmentShader)) {
      console.error("Failed to initialize shaders.");
      return;
    }

    // Create vertex buffer
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);

    const FSIZE = this.vertices.BYTES_PER_ELEMENT;

    // Set the vertex position attribute
    const a_position = this.gl.getAttribLocation(this.gl.program, 'a_position');
    this.gl.vertexAttribPointer(a_position, 2, this.gl.FLOAT, false, 2 * FSIZE, 0);
    this.gl.enableVertexAttribArray(a_position);
  }

  draw() {
    // Clear the canvas
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Draw the shape (assuming triangle)
    const n = this.vertices.length / 2; // Number of vertices
    this.gl.drawArrays(this.gl.TRIANGLES, 0, n);
  }
}

export default Shape;
