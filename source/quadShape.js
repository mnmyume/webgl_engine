

export default class QuadShape {
    constructor(params = {}) {
        this.vertice = null;
        this.verticeBuffer = null;
    }

    initialize({ gl }) {
        this.verticeBuffer = gl.createBuffer();
        this.setData();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertice, gl.STATIC_DRAW); 
    }

    setData() {
        this.vertice = new Float32Array([
            -1,-1,      1,-1,       -1,1,
            -1,1,       1,-1,       1,1
        ]);
    }

    draw(gl, material) {

        const sizeofFloat = 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['quad'],
            3, gl.FLOAT, false, sizeofFloat * 2,0);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['quad']);

            
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.disableVertexAttribArray(
            material.dataLocation.attributes['quad']);
    }
}
