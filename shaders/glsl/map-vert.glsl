#version 300 es
#define POSITION_LOCATION 0
#define SIZE_LOCATION 1
#define GENERATION_LOCATION 2
#define FRAME_LIFE_LOCATION 3
#define ANI_TYPE_LOCATION 4

precision highp float;
precision highp int;

#value uEmitterTexture:0
uniform sampler2D uEmitterTexture;  // posX, posZ, size, startTime

#value uGradientTexture:1
uniform sampler2D uGradientTexture; // gradientX, gradientZ, ___, ___

#value uDeltaTime:0.01666
uniform float uDeltaTime;

#value uEmitterTransform:mat4(1.0)
uniform mat4 uEmitterTransform;

#value uState:0
uniform int uState; // 1: init mode, 2: play mode
#value uLoop:true
uniform bool uLoop;

uniform float uTime;    // game time
uniform float uDuration;
uniform float uLifeTime;
uniform float uCount;
uniform float uEmitterSize;
uniform float uEmitterGridSize;
uniform float uGradientGridSize;

#buffer aPos:mapBuffer, size:3, stride:28, offset:0
layout(location = POSITION_LOCATION) in vec3 aPos;

#buffer aSize:mapBuffer, size:1, stride:28, offset:12
layout(location = SIZE_LOCATION) in float aSize;

#buffer aGeneration:mapBuffer, size:1, stride:28, offset:16
layout(location = GENERATION_LOCATION) in float aGeneration;

#buffer aFrameLife:mapBuffer, size:1, stride:28, offset:20
layout(location = FRAME_LIFE_LOCATION) in float aFrameLife;

#buffer aAniType:mapBuffer, size:1, stride:28, offset:24
layout(location = ANI_TYPE_LOCATION) in float aAniType;

out vec3 vPos;
out float vSize;
out float vGeneration;
out float vFrameLife;
out float vAniType;


vec2 getEmitterCoord(float particleID, float gridSize) {
    vec2 uv = vec2(mod(particleID,gridSize), floor(particleID/gridSize))/gridSize;
    uv += vec2(1.0/gridSize*0.5);    //  offset to center of pixel
    return uv;
}

vec2 getGradientCoord(vec2 pos, float emitterSize) {
    vec2 uv = pos/vec2(emitterSize);
    return uv;
}

vec3 updatePos(vec3 pos, vec3 linVel) {
    return pos = pos + linVel * uDeltaTime;
}


void main()
{

    vec3 pos = aPos;
    float size = aSize;

    float particleID = float(gl_InstanceID);
    vec2 emitterUV = getEmitterCoord(particleID, uEmitterGridSize);
    vec2 gradientUV = getGradientCoord(vec2(pos.x,pos.z), uEmitterSize);

//    float startTime = texture(uEmitterSlot0[0], emitterUV).w;
//    float localTime = uTime - startTime > 0.0 ? mod(uTime - startTime, uLifeTime) : 0.0;
//    float percentLife = localTime / uLifeTime;
//
//    float lastGene = aGeneration;
//    float generation = uTime - startTime > 0.0 ? mod(floor((uTime - startTime)/uLifeTime), float(GEN_SIZE)) : -1.0;
//
//    bool emit = generation!=lastGene && generation!=-1.0;

    if(uState == 1){
        vec2 emitterPos = vec2(0,0);
        size = texture(uEmitterTexture, emitterUV).z;
        emitterPos = texture(uEmitterTexture, emitterUV).xy;
        pos = (uEmitterTransform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
    }
    else if(uState == 2) {
        vec3 vel = vec3(texture(uGradientTexture,gradientUV).x, 0.0, texture(uGradientTexture,gradientUV).y);
        pos = updatePos(pos, vel);

//        float accFrameOffset = uAccFactor * acc.x / uAccDivisor;
//        frameLife = mod(frameLife + accFrameOffset * uLifeTime, uLifeTime);
//        frameLife = (frameLife < 0.0) ? frameLife + 1.0 : frameLife;
    }

    gl_Position = vec4(pos, 1.0);

    vPos = pos;
    vSize = size;
    vGeneration = 0.0;
    vFrameLife = 0.0;
    vAniType = 0.0;
}
