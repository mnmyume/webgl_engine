export default class Shape {
    static RENDERSTATE = { triangle: 1, line: 2 };

    constructor(params = {}) {
        this.data = params.data ?? { vertice: [], indice: [] };
        this.state = params.state ?? Shape.RENDERSTATE.triangle;
        this.verticeBuffer = null;
        this.indiceBuffer = null;
        this.vertice = null;
        this.indice = null;
    }

    initialize({ gl }) {
        this.verticeBuffer = gl.createBuffer();
        this.indiceBuffer = gl.createBuffer();

        // Set data
        this.setData(this.data);

        // Bind buffers and upload data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertice, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indice, gl.STATIC_DRAW);
    }

    setData(data) {
        this.vertice = new Float32Array(data.vertice);
        if (data.indice) {
            this.indice = new Uint16Array(data.indice);
        }
    }

    draw(gl, material) {
        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.vertexAttribPointer(material.dataLocation.attributes['aVertexPosition'], 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(material.dataLocation.attributes['aVertexPosition']);

        // Bind the index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        gl.drawElements(gl.TRIANGLES, this.indice.length, gl.UNSIGNED_SHORT, 0);
    }
}
