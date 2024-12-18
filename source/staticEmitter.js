import Shape from './shape.js';

const UV_IDX = 0;
const LIFE_TIME_IDX = 2;
const FRAME_START_IDX = 3;
const START_TIME_IDX = 4;
const START_SIZE_IDX = 5;
const END_SIZE_IDX = 6;
const SPIN_START_IDX = 7;
const SPIN_SPEED_IDX = 8;
const PARTICLE_ID_IDX = 9;
const COLOR_MULT_IDX = 10;
const LAST_IDX = 14;

const CORNERS_ = [
    [-0.5, -0.5], 
    [+0.5, -0.5],
    [+0.5, +0.5],

    [-0.5, -0.5], 
    [+0.5, +0.5],
    [-0.5, +0.5]
];

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
        spinStart: 0,
        spinStartRange: 0,
        spinSpeed: 0,
        spinSpeedRange: 0,
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
            let pSpinStart = data.spinStart + plusMinus(data.spinStartRange);
            let pSpinSpeed = data.spinSpeed + plusMinus(data.spinSpeedRange);
            let pStartSize = data.startSize + plusMinus(data.startSizeRange);
            let pEndSize = data.endSize + plusMinus(data.endSizeRange);
        
            // make each corner of the particle
            for (var jj = 0; jj < 6; ++jj) {
                var offset0 = LAST_IDX * jj;
                var offset1 = offset0 + 1;
                var offset2 = offset0 + 2;
                var offset3 = offset0 + 3;

                bufferSubData[UV_IDX + offset0] = CORNERS_[jj][0];
                bufferSubData[UV_IDX + offset1] = CORNERS_[jj][1];

                bufferSubData[LIFE_TIME_IDX + offset0] = pLifeTime;

                bufferSubData[FRAME_START_IDX + offset0] = pFrameStart;

                bufferSubData[START_TIME_IDX + offset0] = pStartTime;

                bufferSubData[START_SIZE_IDX + offset0] = pStartSize; 

                bufferSubData[END_SIZE_IDX + offset0] = pEndSize;

                bufferSubData[SPIN_START_IDX + offset0] = pSpinStart;

                bufferSubData[SPIN_SPEED_IDX + offset0] = pSpinSpeed;

                bufferSubData[PARTICLE_ID_IDX + offset0] = ii;

                bufferSubData[COLOR_MULT_IDX + offset0] = pColorMult[0];
                bufferSubData[COLOR_MULT_IDX + offset1] = pColorMult[1];
                bufferSubData[COLOR_MULT_IDX + offset2] = pColorMult[2];
                bufferSubData[COLOR_MULT_IDX + offset3] = pColorMult[3];
            }

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
            material.dataLocation.attributes['uv'], 
            2, gl.FLOAT, false, stride,
            sizeofFloat * UV_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['uv']);

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
            material.dataLocation.attributes['spinStart'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * SPIN_START_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['spinStart']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['spinSpeed'], 
            1, gl.FLOAT, false, stride,
            sizeofFloat * SPIN_SPEED_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['spinSpeed']);

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
        gl.drawArrays(gl.TRIANGLES, 0, this.data.numParticle * 6);

        gl.disableVertexAttribArray(material.dataLocation.attributes['uv']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['lifeTime']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['frameStart']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['startTime']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['startSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['endSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['spinStart']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['spinSpeed']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['particleID']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['colorMult']);
        
    };
}