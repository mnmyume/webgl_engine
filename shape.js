export default class Shape {
    static RENDERSTATE = { triangle: 1, line: 2 };

    constructor(params = {}) {
        this.data = params.data ?? { vertice: [] };
        this.state = params.state ?? Shape.RENDERSTATE.triangle;
        this.verticeBuffer = null;
        this.vertice = null;
        this.uvBuffer = null;
        // this.texCoordBuffer = null;
        // this.texCoord = null;
    }

    initialize({ gl }) {
        this.verticeBuffer = gl.createBuffer();

        // Set data
        this.setData(this.data);

        // Bind buffers and upload data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertice, gl.STATIC_DRAW);
    }

    setData(data) {
        this.vertice = new Float32Array(data.vertice);
        // if (data.texCoord) {
        //     this.texCoord = new Float32Array(data.texCoord);
        // }
    }

    draw(gl, material) {

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.vertexAttribPointer(
            material.dataLocation.attributes['gridIndex'], 
            3, 
            gl.FLOAT, 
            false, 
            5 * Float32Array.BYTES_PER_ELEMENT, 
            0
        );
        gl.enableVertexAttribArray(material.dataLocation.attributes['gridIndex']);

        // Bind the uv buffer
        gl.vertexAttribPointer(
            material.dataLocation.attributes['uv'],
            2,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(material.dataLocation.attributes['uv']);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.vertice.length);

        
    }
}
