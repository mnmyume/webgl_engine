export default class Shape {
    static RENDERSTATE = { triangle: 1, line: 2 };

    constructor(params = {}) {
        this.data = params.data ?? { vertice: [], uvs: [] };
        this.state = params.state ?? Shape.RENDERSTATE.triangle;
        this.verticeBuffer = null;
        this.uvsBuffer = null;
        this.vertice = null;
        this.uvs = null;
    }

    initialize({ gl }) {
        this.verticeBuffer = gl.createBuffer();
        this.uvsBuffer = gl.createBuffer();

        // Set data
        this.setData(this.data);

        // Bind buffers and upload data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertice, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    }

    setData(data) {
        this.vertice = new Float32Array(data.vertice);
        if (data.uvs) {
            this.uvs = new Float32Array(data.uvs);
        }
    }

    draw(gl, material) {

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.vertexAttribPointer(
            material.dataLocation.attributes['aPosition'], 
            3, 
            gl.FLOAT, 
            false, 
            3 * Float32Array.BYTES_PER_ELEMENT, 
            0
        );
        gl.enableVertexAttribArray(material.dataLocation.attributes['aPosition']);

        // Bind the uvs buffer
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
        // gl.vertexAttribPointer(
        //     material.dataLocation.attributes['aTexCoord'],
        //     2,
        //     gl.FLOAT,
        //     false,
        //     2 * 4,
        //     0
        // );
        // gl.enableVertexAttribArray(material.dataLocation.attributes['aTexCoord']);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.vertice.length);

        
    }
}
