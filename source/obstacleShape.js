import Shape from './shape.js'

export default class ObstacleShape extends Shape {
    constructor(params = {}) {
        super(params);
        this.obstacleCount = params.obstacleCount || null;
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
            material.dataLocation.attributes['vert'],
            2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['vert']);
    
        gl.drawArrays(gl.POINTS, 0, this.obstacleCount);

        gl.disableVertexAttribArray(
            material.dataLocation.attributes['vert']);
    }
}
