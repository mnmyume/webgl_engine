export class ParticleStateIds {
    static BLEND = 0;
    static ADD = 1;
    static BLEND_PREMULTIPLY = 2;
    static BLEND_NO_ALPHA = 3;
    static SUBTRACT = 4;
    static INVERSE = 5;
}

const CORNERS_ = [
    [-0.5, -0.5],
    [+0.5, -0.5],
    [+0.5, +0.5],
    [-0.5, +0.5]
];

export class ParticleSystem {
    constructor(gl, opt_clock, opt_randomFunction) {
        this.gl = gl;
        this.drawables_ = [];

        const blendFuncs = {};
        blendFuncs[ParticleStateIds.BLEND] = {
            src: gl.SRC_ALPHA,
            dest: gl.ONE_MINUS_SRC_ALPHA
        };
        blendFuncs[ParticleStateIds.ADD] = {
            src: gl.SRC_ALPHA,
            dest: gl.ONE
        };
        blendFuncs[ParticleStateIds.BLEND_PREMULTIPLY] = {
            src: gl.ONE,
            dest: gl.ONE_MINUS_SRC_ALPHA
        };
        blendFuncs[ParticleStateIds.BLEND_NO_ALPHA] = {
            src: gl.SRC_COLOR,
            dest: gl.ONE_MINUS_SRC_COLOR
        };
        blendFuncs[ParticleStateIds.SUBTRACT] = {
            src: gl.SRC_ALPHA,
            dest: gl.ONE_MINUS_SRC_ALPHA,
            eq: gl.FUNC_REVERSE_SUBTRACT
        };
        blendFuncs[ParticleStateIds.INVERSE] = {
            src: gl.ONE_MINUS_DST_COLOR,
            dest: gl.ONE_MINUS_SRC_COLOR
        };
        this.blendFuncs_ = blendFuncs;

        const pixelBase = [0, 0.20, 0.70, 1, 0.70, 0.20, 0, 0];
        const pixels = [];
        for (let yy = 0; yy < 8; ++yy) {
            for (let xx = 0; xx < 8; ++xx) {
                const pixel = pixelBase[xx] * pixelBase[yy];
                pixels.push(pixel, pixel, pixel, pixel);
            }
        }
        const colorTexture = this.createTextureFromFloats(8, 8, pixels);

        const rampTexture = this.createTextureFromFloats(2, 1, [1, 1, 1, 1, 1, 1, 1, 0]);

        this.now_ = new Date();
        this.timeBase_ = new Date();
        if (opt_clock) {
            this.timeSource_ = opt_clock;
        } else {
            this.timeSource_ = ParticleSystem.createDefaultClock_(this);
        }

        this.randomFunction_ = opt_randomFunction || (() => Math.random());

        this.singleParticleArray_ = new Float32Array(4 * LAST_IDX);

        this.defaultColorTexture = colorTexture;
        this.defaultRampTexture = rampTexture;
    }

    static createDefaultClock_(particleSystem) {
        return function() {
            const now = particleSystem.now_;
            const base = particleSystem.timeBase_;
            return (now.getTime() - base.getTime()) / 1000.0;
        };
    }

    createTextureFromFloats(width, height, pixels, opt_texture) {
        const gl = this.gl;
        let texture = opt_texture || gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const data = new Uint8Array(pixels.length);
        for (let i = 0; i < pixels.length; i++) {
            const t = pixels[i] * 255.;
            data[i] = t;
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        return texture;
    }

    createParticleEmitter(opt_texture, opt_clock) {
        const emitter = new ParticleEmitter(this, opt_texture, opt_clock);
        this.drawables_.push(emitter);
        return emitter;
    }

    draw(material) {
        this.now_ = new Date();
        const gl = this.gl;
        gl.depthMask(false);
        gl.enable(gl.DEPTH_TEST);

        for (let ii = 0; ii < this.drawables_.length; ++ii) {
            this.drawables_[ii].draw(gl, material);
        }
    }
}

const ParticleSpec = function() {
    // The number of particles to emit
    this.numParticles = 1;

    // The number of frames in the particle texture
    this.numFrames = 1;

    // The frame duration at which to animate the particle texture in seconds per frame 
    this.frameDuration = 1;

    // The initial frame to display for a particular particle
    this.frameStart = 0;

    // The frame start range
    this.frameStartRange = 0;

    // The life time of the entire particle system
    // To make a particle system be continuous set this to match the lifeTime
    this.timeRange = 99999999;

    // The startTime of a particle
    this.startTime = null;

    // The lifeTime of a particle
    this.lifeTime = 1;

    // The lifeTime range
    this.lifeTimeRange = 0;

    // The starting size of a particle
    this.startSize = 1;

    // The starting size range
    this.startSizeRange = 0;

    // The ending size of a particle
    this.endSize = 1;

    // The ending size range
    this.endSizeRange = 0;
    
    // The starting position of a particle in local space
    this.position = [0, 0, 0];

    // The starting position range
    this.positionRange = [0, 0, 0];

    // The velocity of a particle in local space
    this.velocity = [0, 0, 0];

    // The velocity range
    this.velocityRange = [0, 0, 0];

    // The acceleration of a particle in local space
    this.acceleration = [0, 0, 0];

    // The acceleration range
    this.accelerationRange = [0, 0, 0];

    // The starting spin value for a particle in radians
    this.spinStart = 0;

    // The spin start range
    this.spinStartRange = 0;

    // The spin speed of a particle in radians
    this.spinSpeed = 0;

    // The spin speed range
    this.spinSpeedRange = 0;

    // The color multiplier of a particle
    this.colorMult = [1, 1, 1, 1];

    // The color multiplier range
    this.colorMultRange = [0, 0, 0, 0];

    // The orientation of a particle
    this.orientation = [0, 0, 0, 1];
}

const UV_LIFE_TIME_FRAME_START_IDX = 0;
const POSITION_START_TIME_IDX = 4;
const VELOCITY_START_SIZE_IDX = 8;
const ACCELERATION_END_SIZE_IDX = 12;
const SPIN_START_SPIN_SPEED_IDX = 16;
const ORIENTATION_IDX = 20;
const COLOR_MULT_IDX = 24;
const LAST_IDX = 28;
// TODO: change to my vertex shader attribute index

export class ParticleEmitter {
    constructor(particleSystem, opt_texture, opt_clock) {
        opt_clock = opt_clock || particleSystem.timeSource_;
        this.gl = particleSystem.gl;
        const gl = this.gl;
        this.singleParticleArray_ = new Float32Array(4 * LAST_IDX);
        this.createdParticles_ = false;
        this.numParticles_ = 0;
        this.rampTexture_ = particleSystem.defaultRampTexture;
        this.colorTexture_ = opt_texture || particleSystem.defaultColorTexture;
        this.particleSystem = particleSystem;
        this.timeSource_ = opt_clock;
        this.translation_ = [0, 0, 0];
        this.setState(ParticleStateIds.BLEND);
        this.particleBuffer_ = gl.createBuffer();
        this.indexBuffer_ = gl.createBuffer();
    }

    setTranslation(x, y, z) {
        this.translation_[0] = x;
        this.translation_[1] = y;
        this.translation_[2] = z;
    }

    setState(stateId) {
        this.blendFunc_ = this.particleSystem.blendFuncs_[stateId];
    }

    setColorRamp(colorRamp) {
        const width = colorRamp.length / 4;
        if (width % 1 !== 0) {
            throw 'colorRamp must have multiple of 4 entries';
        }

        const gl = this.gl;
        if (this.rampTexture_ === this.particleSystem.defaultRampTexture) {
            this.rampTexture_ = null;
        }

        this.rampTexture_ = this.particleSystem.createTextureFromFloats(width, 1, colorRamp, this.rampTexture_);
    }

    validateParameters(parameters) {
        const defaults = new ParticleSpec();
        for (const key in parameters) {
            if (typeof defaults[key] === 'undefined') {
                throw `unknown particle parameter "${key}"`;
            }
        }
        for (const key in defaults) {
            if (typeof parameters[key] === 'undefined') {
                parameters[key] = defaults[key];
            }
        }
    }

    createParticles_(firstParticleIndex, numParticles, parameters, opt_perParticleParamSetter) {
        let singleParticleArray = this.particleSystem.singleParticleArray_;
        const gl = this.gl;

        // Set the globals
        this.timeRange_ = parameters.timeRange;
        this.numFrames_ = parameters.numFrames;
        this.frameDuration_ = parameters.frameDuration;

        let random = this.particleSystem.randomFunction_;

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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer_);

        for (let ii = 0; ii < numParticles; ++ii) {
            if (opt_perParticleParamSetter) {
                opt_perParticleParamSetter(ii, parameters);
            }

            let pLifeTime = parameters.lifeTime;
            let pStartTime = (parameters.startTime === null) ?
                (ii * parameters.lifeTime / numParticles) : parameters.startTime;
            let pFrameStart = 
                parameters.frameStart + plusMinus(parameters.frameStartRange);
            let pPosition = addVector(
                parameters.position, plusMinusVector(parameters.positionRange));
            let pVelocity = addVector(
                parameters.velocity, plusMinusVector(parameters.velocityRange)); 
            let pAcceleration = addVector(
                parameters.acceleration, plusMinusVector(parameters.accelerationRange)); 
            let pColorMult = addVector(
                parameters.colorMult, plusMinusVector(parameters.colorMultRange));
            let pSpinStart = parameters.spinStart + plusMinus(parameters.spinStartRange);
            let pSpinSpeed = parameters.spinSpeed + plusMinus(parameters.spinSpeedRange);
            let pStartSize = parameters.startSize + plusMinus(parameters.startSizeRange);
            let pEndSize = parameters.endSize + plusMinus(parameters.endSizeRange);
            let pOrientation = parameters.orientation;    
            
            // make each corner of the particle
            for (var jj = 0; jj < 4; ++jj) {
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
    
                singleParticleArray[SPIN_START_SPIN_SPEED_IDX + offset0] = pSpinStart;
                singleParticleArray[SPIN_START_SPIN_SPEED_IDX + offset1] = pSpinSpeed;
                singleParticleArray[SPIN_START_SPIN_SPEED_IDX + offset2] = 0;
                singleParticleArray[SPIN_START_SPIN_SPEED_IDX + offset3] = 0;

                singleParticleArray[ORIENTATION_IDX + offset0] = pOrientation[0];
                singleParticleArray[ORIENTATION_IDX + offset1] = pOrientation[1];
                singleParticleArray[ORIENTATION_IDX + offset2] = pOrientation[2];
                singleParticleArray[ORIENTATION_IDX + offset3] = pOrientation[3];
    
                singleParticleArray[COLOR_MULT_IDX + offset0] = pColorMult[0];
                singleParticleArray[COLOR_MULT_IDX + offset1] = pColorMult[1];
                singleParticleArray[COLOR_MULT_IDX + offset2] = pColorMult[2];
                singleParticleArray[COLOR_MULT_IDX + offset3] = pColorMult[3];
            }

            gl.bufferSubData(gl.ARRAY_BUFFER,
                singleParticleArray.byteLength * (ii + firstParticleIndex),
                singleParticleArray);
        }

        this.createdParticles_ = true;
    };

    allocateParticles_(numParticles) {
        if (this.numParticles_ != numParticles) {
            const gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer_);
            gl.bufferData(gl.ARRAY_BUFFER,
                (numParticles + 1) * this.particleSystem.singleParticleArray_.byteLength,
                gl.DYNAMIC_DRAW);
            
            let indices = new Uint16Array(6 * numParticles);
            let idx = 0;
            for (let ii = 0; ii < numParticles; ++ii) {
                // Make 2 triangles for the quad.
                let startIndex = ii * 4;
                indices[idx++] = startIndex + 0;
                indices[idx++] = startIndex + 1;
                indices[idx++] = startIndex + 2;
                indices[idx++] = startIndex + 0;
                indices[idx++] = startIndex + 2;
                indices[idx++] = startIndex + 3;
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,
                this.indexBuffer_);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                indices,
                gl.STATIC_DRAW);
            this.numParticles_ = numParticles;
        }
    }

    setParameters (parameters, opt_perParticleParamSetter) {
        this.validateParameters(parameters);

        let numParticles = parameters.numParticles;

        this.allocateParticles_(numParticles);
        this.createParticles_(
            0,
            numParticles,
            parameters,
            opt_perParticleParamSetter);
    }

    draw (gl, material) {
        if (!this.createdParticles_) {
            return;
        }

        // Set up blend function
        gl.enable(gl.BLEND);
        var blendFunc = this.blendFunc_;
        gl.blendFunc(blendFunc.src, blendFunc.dest);
        if (blendFunc.eq) {
            gl.blendEquation(blendFunc.eq);
        } else {
            gl.blendEquation(gl.FUNC_ADD);
        }

        gl.uniform1f(material.dataLocation.uniforms["timeRange"], this.timeRange_);
        gl.uniform1f(material.dataLocation.uniforms["numFrames"], this.numFrames_);
        gl.uniform1f(material.dataLocation.uniforms["frameDuration"], this.frameDuration_);

        // compute and set time
        let curTime = this.timeSource_(); 
        gl.uniform1f(material.dataLocation.uniforms["time"], curTime);
        
        // TODO: Set up textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.rampTexture_);
        gl.uniform1i(material.dataLocation.uniforms["rampSampler"], 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture_);
        gl.uniform1i(material.dataLocation.uniforms["colorSampler"], 1);
        gl.activeTexture(gl.TEXTURE0);

        // Set up vertex attributes
        const sizeofFloat = 4;
        const stride = sizeofFloat * LAST_IDX;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer_);

        gl.vertexAttribPointer(material.dataLocation.attributes['uvLifeTimeFrameStart'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * UV_LIFE_TIME_FRAME_START_IDX);
        gl.enableVertexAttribArray(material.dataLocation.attributes['uvLifeTimeFrameStart']);

        gl.vertexAttribPointer(material.dataLocation.attributes['positionStartTime'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * POSITION_START_TIME_IDX);
        gl.enableVertexAttribArray(material.dataLocation.attributes['positionStartTime']);

        gl.vertexAttribPointer(material.dataLocation.attributes['velocityStartSize'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * VELOCITY_START_SIZE_IDX);
        gl.enableVertexAttribArray(material.dataLocation.attributes['velocityStartSize']);

        gl.vertexAttribPointer(material.dataLocation.attributes['accelerationEndSize'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * ACCELERATION_END_SIZE_IDX);
        gl.enableVertexAttribArray(material.dataLocation.attributes['accelerationEndSize']);

        gl.vertexAttribPointer(material.dataLocation.attributes['spinStartSpinSpeed'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * SPIN_START_SPIN_SPEED_IDX);
        gl.enableVertexAttribArray(material.dataLocation.attributes['spinStartSpinSpeed']);

        if(material.dataLocation.attributes['orientation']){
            gl.vertexAttribPointer(material.dataLocation.attributes['orientation'], 
                4, gl.FLOAT, false, stride,
                sizeofFloat * ORIENTATION_IDX);
            gl.enableVertexAttribArray(material.dataLocation.attributes['orientation']);
        }

        gl.vertexAttribPointer(material.dataLocation.attributes['colorMult'], 
            4, gl.FLOAT, false, stride,
            sizeofFloat * COLOR_MULT_IDX);
        gl.enableVertexAttribArray(material.dataLocation.attributes['colorMult']);
        
        // TODO: draw without indexBuffer
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer_);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_);
        gl.drawElements(gl.TRIANGLES, this.numParticles_ * 6,
            gl.UNSIGNED_SHORT, 0);

        gl.disableVertexAttribArray(material.dataLocation.attributes['uvLifeTimeFrameStart']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['positionStartTime']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['velocityStartSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['accelerationEndSize']);
        gl.disableVertexAttribArray(material.dataLocation.attributes['spinStartSpinSpeed']);
        if(material.dataLocation.attributes['orientation']){
            gl.disableVertexAttribArray(material.dataLocation.attributes['orientation']);
        }
        gl.disableVertexAttribArray(material.dataLocation.attributes['colorMult']);
    }
}
