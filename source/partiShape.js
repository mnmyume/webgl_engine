import Shape from './shape.js'

export default class PartiShape extends Shape {
    constructor(params = {}) {
        super(params);
        this.partiCount = params.partiCount || null;
    }

    initialize({ gl }) {
        super.initialize({ gl });
    }

    setData(data) {
        this.vertice = data;
        
    }

    draw(gl, material) {
        const sizeofFloat = 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['aUV'],
            2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['aUV']);
    
        gl.drawArrays(gl.POINTS, 0, this.partiCount);

        gl.disableVertexAttribArray(
            material.dataLocation.attributes['aUV']);
    }
}
