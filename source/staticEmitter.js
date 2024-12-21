import Shape from './shape.js';

const LIFE_TIME_IDX = 0;
const FRAME_START_IDX = 1;
const START_TIME_IDX = 2;
const START_SIZE_IDX = 3;
const END_SIZE_IDX = 4;
const PARTICLE_ID_IDX = 5;
const COLOR_MULT_IDX = 6;
const LAST_IDX = 10;

export default class StaticEmitter extends Shape {
    static DEFAULT_DATA = {
        duration: 999,
        rate: 10, 
        numParticle: 1,
        frameStart: 0,
        frameStartRange: 0,
        startTime: 0,
        lifeTime: 1,
        lifeTimeRange: 0,
        startSize: 1,
        startSizeRange: 0,
        endSize: 1,
        endSizeRange: 0,
        colorMult: [1, 1, 1, 1],
        colorMultRange: [0, 0, 0, 0]
    };
    particleBuffer = null;
    bufferSubData = new Float32Array(6 * LAST_IDX);

    constructor(params = {}, opt_randomFunction) {
        super(params);
        this.data = {
            ...StaticEmitter.DEFAULT_DATA,  
            ...params.data,         
        };
        this.randomFunction_ = opt_randomFunction || (() => Math.random());
    }

    initialize({ gl }) {
        
        this.particleBuffer = gl.createBuffer();

        // Set data
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
        let random = this.randomFunction_;

        let addVector = function(a, b) {
            let r = [];
            let aLength = a.length;
            for(let i = 0; i < aLength; ++i)
                r[i] = a[i] + b[i];
            return r;
        }
        
        let plusMinus = function(range) {
            return (random() - 0.5) * range * 2;
        };

        let plusMinusVector = function(range) {
            let v = [];
            for (let ii = 0; ii < range.length; ++ii) {
                v.push(plusMinus(range[ii]));
            }
            return v;
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);

        for (let ii = 0; ii < numParticle; ++ii) {
            let pLifeTime = data.lifeTime;
            let pStartTime = data.duration / numParticle * ii;
            let pFrameStart = data.frameStart + plusMinus(data.frameStartRange);
            let pColorMult = addVector(data.colorMult, plusMinusVector(data.colorMultRange));
            let pStartSize = data.startSize + plusMinus(data.startSizeRange);
            let pEndSize = data.endSize + plusMinus(data.endSizeRange);
        
            var offset0 = 0;
            var offset1 = offset0 + 1;
            var offset2 = offset0 + 2;
            var offset3 = offset0 + 3;

            bufferSubData[LIFE_TIME_IDX + offset0] = pLifeTime;

            bufferSubData[FRAME_START_IDX + offset0] = pFrameStart;

            bufferSubData[START_TIME_IDX + offset0] = pStartTime;

            bufferSubData[START_SIZE_IDX + offset0] = pStartSize; 

            bufferSubData[END_SIZE_IDX + offset0] = pEndSize;

            bufferSubData[PARTICLE_ID_IDX + offset0] = ii;

            bufferSubData[COLOR_MULT_IDX + offset0] = pColorMult[0];
            bufferSubData[COLOR_MULT_IDX + offset1] = pColorMult[1];
            bufferSubData[COLOR_MULT_IDX + offset2] = pColorMult[2];
            bufferSubData[COLOR_MULT_IDX + offset3] = pColorMult[3];
            
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
            material.dataLocation.attributes['lifeTime'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * LIFE_TIME_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['lifeTime']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['frameStart'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * FRAME_START_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['frameStart']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['startTime'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * START_TIME_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['startTime']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['startSize'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * START_SIZE_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['startSize']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['endSize'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * END_SIZE_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['endSize']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['particleID'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * PARTICLE_ID_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['particleID']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['colorMult'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * COLOR_MULT_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['colorMult']);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
        gl.drawArrays(gl.POINTS, 0, this.data.numParticle);

        gl.disableVertexAttribArray(material.dataLocation.attributes['lifeTime']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['frameStart']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['startTime']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['startSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['endSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['particleID']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['colorMult']);
        
    };
}