import Shape from './shape.js';

const UV_LIFE_TIME_FRAME_START_IDX = 0;
const POSITION_START_TIME_IDX = 4;
const VELOCITY_START_SIZE_IDX = 8;
const ACCELERATION_END_SIZE_IDX = 12;
const SPIN_START_SPEED_INDEX_IDX = 16;
const COLOR_MULT_IDX = 20;
const LAST_IDX = 24;

const CORNERS_ = [
    [-0.5, -0.5], // triangle 1
    [+0.5, -0.5],
    [+0.5, +0.5],

    [-0.5, -0.5], // triangle 2
    [+0.5, +0.5],
    [-0.5, +0.5]
];

export default class StaticEmitter extends Shape {
    static DEFAULT_DATA = {
        numParticles: 1,
        frameStart: 0,
        frameStartRange: 0,
        startTime: 0,
        lifeTime: 1,
        lifeTimeRange: 0,
        startSize: 1,
        startSizeRange: 0,
        endSize: 1,
        endSizeRange: 0,
        position: [0, 0, 0],
        positionRange: [0, 0, 0],
        velocity: [0, 0, 0],
        velocityRange: [0, 0, 0],
        acceleration: [0, 0, 0],
        accelerationRange: [0, 0, 0],
        spinStart: 0,
        spinStartRange: 0,
        spinSpeed: 0,
        spinSpeedRange: 0,
        colorMult: [1, 1, 1, 1],
        colorMultRange: [0, 0, 0, 0]
    };
    particleBuffer = null;
    singleParticleArray = new Float32Array(6 * LAST_IDX);

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
        let numParticles = data.numParticles;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            (numParticles + 1) * this.singleParticleArray.byteLength,
            gl.STATIC_DRAW);

        this.createParticles(
            gl, 
            0,
            numParticles,
            data
        )
    };

    createParticles(gl, firstParticleIndex, numParticles, parameters) {
        let singleParticleArray = this.singleParticleArray;
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

        for (let ii = 0; ii < numParticles; ++ii) {
            let pLifeTime = parameters.lifeTime;
            let pStartTime = ii * parameters.lifeTime / numParticles;
            let pFrameStart = parameters.frameStart + plusMinus(parameters.frameStartRange);
            let pPosition = addVector(parameters.position, plusMinusVector(parameters.positionRange));
            let pVelocity = addVector(parameters.velocity, plusMinusVector(parameters.velocityRange)); 
            let pAcceleration = addVector(parameters.acceleration, plusMinusVector(parameters.accelerationRange)); 
            let pColorMult = addVector(parameters.colorMult, plusMinusVector(parameters.colorMultRange));
            let pSpinStart = parameters.spinStart + plusMinus(parameters.spinStartRange);
            let pSpinSpeed = parameters.spinSpeed + plusMinus(parameters.spinSpeedRange);
            let pStartSize = parameters.startSize + plusMinus(parameters.startSizeRange);
            let pEndSize = parameters.endSize + plusMinus(parameters.endSizeRange);  
        
            // make each corner of the particle
            for (var jj = 0; jj < 6; ++jj) {
                var offset0 = LAST_IDX * jj;
                var offset1 = offset0 + 1;
                var offset2 = offset0 + 2;
                var offset3 = offset0 + 3;

                singleParticleArray[UV_LIFE_TIME_FRAME_START_IDX + offset0] = CORNERS_[jj][0];
                singleParticleArray[UV_LIFE_TIME_FRAME_START_IDX + offset1] = CORNERS_[jj][1];
                singleParticleArray[UV_LIFE_TIME_FRAME_START_IDX + offset2] = pLifeTime;
                singleParticleArray[UV_LIFE_TIME_FRAME_START_IDX + offset3] = pFrameStart;

                singleParticleArray[POSITION_START_TIME_IDX + offset0] = pPosition[0];
                singleParticleArray[POSITION_START_TIME_IDX + offset1] = pPosition[1];
                singleParticleArray[POSITION_START_TIME_IDX + offset2] = pPosition[2];
                singleParticleArray[POSITION_START_TIME_IDX + offset3] = pStartTime;

                singleParticleArray[VELOCITY_START_SIZE_IDX + offset0] = pVelocity[0];
                singleParticleArray[VELOCITY_START_SIZE_IDX + offset1] = pVelocity[1];
                singleParticleArray[VELOCITY_START_SIZE_IDX + offset2] = pVelocity[2];
                singleParticleArray[VELOCITY_START_SIZE_IDX + offset3] = pStartSize;

                singleParticleArray[ACCELERATION_END_SIZE_IDX + offset0] = pAcceleration[0];
                singleParticleArray[ACCELERATION_END_SIZE_IDX + offset1] = pAcceleration[1];
                singleParticleArray[ACCELERATION_END_SIZE_IDX + offset2] = pAcceleration[2];
                singleParticleArray[ACCELERATION_END_SIZE_IDX + offset3] = pEndSize;

                singleParticleArray[SPIN_START_SPEED_INDEX_IDX + offset0] = pSpinStart;
                singleParticleArray[SPIN_START_SPEED_INDEX_IDX + offset1] = pSpinSpeed;
                singleParticleArray[SPIN_START_SPEED_INDEX_IDX + offset2] = ii;
                singleParticleArray[SPIN_START_SPEED_INDEX_IDX + offset3] = 0;

                singleParticleArray[COLOR_MULT_IDX + offset0] = pColorMult[0];
                singleParticleArray[COLOR_MULT_IDX + offset1] = pColorMult[1];
                singleParticleArray[COLOR_MULT_IDX + offset2] = pColorMult[2];
                singleParticleArray[COLOR_MULT_IDX + offset3] = pColorMult[3];
            }

            gl.bufferSubData(gl.ARRAY_BUFFER,
                singleParticleArray.byteLength * (ii + firstParticleIndex),
                singleParticleArray);
        }
    };

    draw(gl, material) {

        const sizeofFloat = 4;
        const stride = sizeofFloat * LAST_IDX;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['uvLifeTimeFrameStart'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * UV_LIFE_TIME_FRAME_START_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['uvLifeTimeFrameStart']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['positionStartTime'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * POSITION_START_TIME_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['positionStartTime']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['velocityStartSize'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * VELOCITY_START_SIZE_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['velocityStartSize']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['accelerationEndSize'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * ACCELERATION_END_SIZE_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['accelerationEndSize']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['spinStartSpeedIndex'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * SPIN_START_SPEED_INDEX_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['spinStartSpeedIndex']);

        gl.vertexAttribPointer(
            material.dataLocation.attributes['colorMult'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * COLOR_MULT_IDX);
        gl.enableVertexAttribArray(
            material.dataLocation.attributes['colorMult']);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, this.data.numParticles * 6);

        gl.disableVertexAttribArray(material.dataLocation.attributes['uvLifeTimeFrameStart']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['positionStartTime']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['velocityStartSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['accelerationEndSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['spinStartSpinSpeed']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['colorMult']);
        
    };
}