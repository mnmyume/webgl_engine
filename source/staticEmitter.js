import Shape from './shape.js';

const START_TIME_IDX = 0;
const PARTICLE_ID_IDX = 1;
const LAST_IDX = 2;

export default class StaticEmitter extends Shape {
    static DEFAULT_DATA = {
        duration: 999,
        rate: 10, 
        numParticle: 1,
        startTime: 0,
    };
    particleBuffer = null;
    bufferSubData = new Float32Array(LAST_IDX);

    constructor(params = {}) {
        super(params);
        this.data = {
            ...StaticEmitter.DEFAULT_DATA,  
            ...params.data,         
        };
    }

    initialize({ gl }) {
        
        this.particleBuffer = gl.createBuffer();

        this.setData(gl, this.data);

    };

    setData(gl, data) {
        let numParticle = data.numParticle;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            (numParticle + 1) * this.bufferSubData.byteLength,
            gl.STATIC_DRAW);

        this.createParticles(
            gl, 
            0,
            numParticle,
            data
        )
    };

    createParticles(gl, firstParticleIndex, numParticle) {
        const bufferSubData = this.bufferSubData;
        const data = this.data;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);

        for (let ii = 0; ii < numParticle; ++ii) {
            let pStartTime = data.duration / numParticle * ii;

            bufferSubData[START_TIME_IDX] = pStartTime;

            bufferSubData[PARTICLE_ID_IDX] = ii;
            
            gl.bufferSubData(gl.ARRAY_BUFFER,
                bufferSubData.byteLength * (ii + firstParticleIndex),
                bufferSubData);
        }
    };

    draw(gl, material) {

        const sizeofFloat = 4;
        const stride = sizeofFloat * LAST_IDX;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['startTime'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * START_TIME_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['startTime']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['particleID'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * PARTICLE_ID_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['particleID']);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
        gl.drawArrays(gl.POINTS, 0, this.data.numParticle);

        gl.disableVertexAttribArray(material.dataLocation.attributes['startTime']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['particleID']);
        
    };
}