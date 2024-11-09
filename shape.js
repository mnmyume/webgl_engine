export default class Shape {
    static RENDERSTATE = { triangle: 1, line: 2 };

    constructor(params = {}) {
        this.data = params.data ?? { vertice: [] };
        this.state = params.state ?? Shape.RENDERSTATE.triangle;
        this.verticeBuffer = null;
        this.vertice = null;
    }

    initialize({ gl }) {
        this.verticeBuffer = gl.createBuffer();

        // Set data
        this.setData(this.data);

        // Bind buffers and upload data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertice, gl.STATIC_DRAW); // DYNAMIC_DRAW
    }

    setData(data) {
        this.vertice = new Float32Array(data.vertice);
        // if (data.velocity) {
        //     this.velocity = new Float32Array(data.velocity);
        // }
    }

    draw(gl, material, emitter) {

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.vertexAttribPointer(
            material.dataLocation.attributes['position'], 
            3, 
            gl.FLOAT, 
            false, 
            8 * Float32Array.BYTES_PER_ELEMENT, 
            0
        );
        gl.enableVertexAttribArray(material.dataLocation.attributes['position']);

        // uv
        gl.vertexAttribPointer(
            material.dataLocation.attributes['uv'],
            2,
            gl.FLOAT,
            false,
            8 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(material.dataLocation.attributes['uv']);

        // velocity
        gl.vertexAttribPointer(
            material.dataLocation.attributes['velocity'],
            3,
            gl.FLOAT,
            false,
            8 * Float32Array.BYTES_PER_ELEMENT,
            5 * Float32Array.BYTES_PER_ELEMENT
        )
        gl.enableVertexAttribArray(material.dataLocation.attributes['velocity']);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.vertice.length);
        
    }
}
