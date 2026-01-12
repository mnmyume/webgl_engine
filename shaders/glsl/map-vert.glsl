#version 300 es
#define POSITION_LOCATION 0
#define LINEAR_VELOCITY_LOCATION 1
#define ACCELERATION_LOCATION 2
#define GENERATION_LOCATION 3
#define SIZE_LOCATION 4
#define FRAME_LIFE_LOCATION 5
#define ANI_TYPE_LOCATION 6

precision highp float;
precision highp int;

#define GEN_SIZE 2

#value uEmitterTexture:0
uniform sampler2D uEmitterTexture;  // posX, posZ, size, startTime

#value uGradientTexture:1
uniform sampler2D uGradientTexture; // direction.xy, distance.z, obstacle.w

#value uDeltaTime:0.01666
uniform float uDeltaTime;

#value uEmitterTransform:mat4(1.0)
uniform mat4 uEmitterTransform;
#value uEmitterInverseTransform:mat4(1.0)
uniform mat4 uEmitterInverseTransform;

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

#buffer aPos:particleBuffer, size:3, stride:52, offset:0
layout(location = POSITION_LOCATION) in vec3 aPos;

#buffer aLinVel:particleBuffer, size:3, stride:52, offset:12
layout(location = LINEAR_VELOCITY_LOCATION) in vec3 aLinVel;

#buffer aAcc:particleBuffer, size:3, stride:52, offset:24
layout(location = ACCELERATION_LOCATION) in vec3 aAcc;

#buffer aGeneration:particleBuffer, size:1, stride:52, offset:36
layout(location = GENERATION_LOCATION) in float aGeneration;

#buffer aSize:particleBuffer, size:1, stride:52, offset:40
layout(location = SIZE_LOCATION) in float aSize;

#buffer aFrameLife:particleBuffer, size:1, stride:52, offset:44
layout(location = FRAME_LIFE_LOCATION) in float aFrameLife;

#buffer aAniType:particleBuffer, size:1, stride:52, offset:48
layout(location = ANI_TYPE_LOCATION) in float aAniType;

out vec3 vPos;
out vec3 vLinVel;
out vec3 vAcc;
out float vGeneration;
out float vSize;
out float vFrameLife;
out float vAniType;


vec2 getEmitterCoord(float particleID, float gridSize) {
    vec2 uv = vec2(mod(particleID,gridSize), floor(particleID/gridSize))/gridSize;
    uv += vec2(1.0/gridSize*0.5);    //  offset to center of pixel
    return uv;
}

vec2 getGradientCoord(vec2 pos, float emitterSize) {
    vec2 uv = (pos + vec2(emitterSize/2.0))/vec2(emitterSize);
    return uv;
}

vec3 updatePos(vec3 pos, vec3 linVel) {
    return pos = pos + linVel * uDeltaTime;
}

void main()
{

    vec3 pos = aPos;
    vec3 linVel = aLinVel;
    vec3 acc = aAcc;
    float size = aSize;
    float frameLife = aFrameLife;
    float aniType = aAniType;

    float particleID = float(gl_InstanceID);
    vec2 emitterUV = getEmitterCoord(particleID, uEmitterGridSize);

    vec2 gridPos = vec2(pos.x, pos.y);
    vec2 gradientUV = getGradientCoord(gridPos, uEmitterSize);

    aniType = texture(uEmitterTexture, emitterUV).w;

    float startTime = texture(uEmitterTexture, emitterUV).w;
    float localTime = uTime - startTime > 0.0 ? mod(uTime - startTime, uLifeTime) : 0.0;
    float percentLife = localTime / uLifeTime;

    float lastGene = aGeneration;
    float generation = uTime - startTime > 0.0 ? mod(floor((uTime - startTime)/uLifeTime), float(GEN_SIZE)) : -1.0;
//
//    bool emit = generation!=lastGene && generation!=-1.0;

    if(uState == 1){
        vec2 emitterPos = vec2(0,0);
        size = texture(uEmitterTexture, emitterUV).z;
        emitterPos = texture(uEmitterTexture, emitterUV).xy;
        pos = vec3(emitterPos.x, emitterPos.y, 0);
    }
    else if(uState == 2) {
        linVel = vec3(texture(uGradientTexture,gradientUV).x, texture(uGradientTexture,gradientUV).y, 0.0);
        pos = updatePos(pos, linVel);

//        float accFrameOffset = uAccFactor * acc.x / uAccDivisor;
        frameLife = mod(frameLife, uLifeTime);
        frameLife = (frameLife < 0.0) ? frameLife + 1.0 : frameLife;
    }

    gl_Position = vec4(pos, 1.0);

    vPos = pos;
    vLinVel = linVel;
    vAcc =  acc;
    vSize = size;
    vGeneration = generation;
    vFrameLife = frameLife;
    vAniType = aniType;
}
