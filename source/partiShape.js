import Shape from './shape.js'

export default class PartiShape extends Shape {
    constructor(params = {}) {
        super(params);
    }

    initialize({ gl }) {
        super.initialize({ gl });
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
            2, gl.FLOAT, false, sizeofFloat * 2, 0);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['quad']);
    
        gl.drawArrays(gl.POINTS, 0, 1);

        gl.disableVertexAttribArray(
            material.dataLocation.attributes['quad']);
    }
}
