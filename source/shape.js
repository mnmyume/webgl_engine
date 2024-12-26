const VERTEX_IDX = 0;
const UV_IDX = 3;
const LAST_IDX = 5;

export default class Shape {
    constructor(params = {}) {
        this.data = params.data;
        this.vertice = null;
        this.verticeBuffer = null;
    }

    initialize({ gl }) {
        this.verticeBuffer = gl.createBuffer();
        this.setData(this.data);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertice, gl.STATIC_DRAW); 
    }

    setData(data) {
        this.vertice = new Float32Array(data);
    }

    draw(gl, material) {

        const sizeofFloat = 4;
        const stride = sizeofFloat * LAST_IDX;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.vertexAttribPointer(
            material.dataLocation.attributes['vertex'],
            3, gl.FLOAT, false, stride, 
            sizeofFloat * VERTEX_IDX
        );
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['vertex']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['uv'],
            2, gl.FLOAT, false, stride,
            sizeofFloat * UV_IDX
        );
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['uv']);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.disableVertexAttribArray(
            material.dataLocation.attributes['vertex']);
        gl.disableVertexAttribArray(
            material.dataLocation.attributes['uv']);
    }
}
