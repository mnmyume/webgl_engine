#version 300 es
#define POSITION_LOCATION 0
#define LINEAR_VELOCITY_LOCATION 1

precision highp float;
precision highp int;

#define GEN_SIZE 2

#value uEmitterSlot0:[0,1]
uniform sampler2D uEmitterSlot0[GEN_SIZE];    // posX, posZ, size, startTime
#value uEmitterSlot1:[2,3]
uniform sampler2D uEmitterSlot1[GEN_SIZE];    // linVelX, linVelY, linVelZ, _empty
#value uEmitterSlot2:[4,5]
uniform sampler2D uEmitterSlot2[GEN_SIZE];    // angVelX, angVelZ, _empty, _empty

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
uniform float uMAXCOL;

// uFieldParams


// transform feedback params
#buffer aPos:particleBuffer, size:3, stride:24, offset:0
layout(location = POSITION_LOCATION) in vec3 aPos;

#buffer aLinVel:particleBuffer, size:3, stride:24, offset:12
layout(location = LINEAR_VELOCITY_LOCATION) in vec3 aLinVel;

out vec3 vPos;
out vec3 vLinVel;


vec2 getEmitterCoord(float particleID, float MAXCOL) {
    vec2 uv = vec2(mod(particleID,MAXCOL), floor(particleID/MAXCOL))/MAXCOL;
    uv += vec2(1.0/MAXCOL*0.5);    //  offset to center of pixel
    return uv;
}


vec3 updatePos(vec3 pos, vec3 linVel) {
    return pos = pos + linVel * uDeltaTime;
}


void main()
{

    vec3 pos, linVel;
    vec2 angVel;
    float size;

    float particleID = float(gl_InstanceID);
    vec2 emitterUV = getEmitterCoord(particleID, uMAXCOL);

    float startTime = texture(uEmitterSlot0[0], emitterUV).w;
    float localTime = uTime - startTime > 0.0 ? mod(uTime - startTime, uLifeTime) : 0.0;
    float percentLife = localTime / uLifeTime;

//    int lastGene = int(texture(uDataSlot1, uv).w);
    int lastGene = -1;
    int generation = uTime - startTime > 0.0 ? int(mod(floor((uTime - startTime)/uLifeTime), float(GEN_SIZE))) : -1;

    bool emit = generation!=lastGene;
//    if(emit || uState == 1){
    if(uState == 1){
        vec2 emitterPos = vec2(0,0);

        if(generation == 0){
            size = texture(uEmitterSlot0[0], emitterUV).z;
            emitterPos = texture(uEmitterSlot0[0], emitterUV).xy;
            linVel = texture(uEmitterSlot1[0], emitterUV).xyz;
        }else if(generation == 1){
            size = texture(uEmitterSlot0[1], emitterUV).z;
            emitterPos = texture(uEmitterSlot0[1], emitterUV).xy;
            linVel = texture(uEmitterSlot1[1], emitterUV).xyz;
        }

        pos = (uEmitterTransform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
        linVel = vec3(0);
    }
    else{

        pos = aPos;
        vec3 oldVel = aLinVel;
        size = texture(uEmitterSlot0[0], emitterUV).z;

//        float gravitySwitcher = uFieldParams[0].x;
//        vec3 gravity = uFieldParams[0].yzw;
//        float vortexSwitcher = uFieldParams[1].x;
//        float vortexScalar = uFieldParams[1].y;
//        float noiseSwitcher = uFieldParams[2].x;
//        vec3 noiseScalar = uFieldParams[2].yzw;
//        float dampSwitcher = uFieldParams[3].x;
//        float dampScalar = uFieldParams[3].y;
//
//        if(gravitySwitcher == 1.0) {
//            linVel = gravityField(oldVel, gravity);
//        }
//        if(vortexSwitcher == 1.0) {
//            linVel += vortexField(pos, vortexScalar);
//        }
//        if(noiseSwitcher == 1.0) {
//            linVel  += noiseField(pos, noiseScalar);
//        }
//        if(dampSwitcher == 1.0){
//            linVel = oldVel + damp(linVel-oldVel, dampScalar, uDeltaTime);
//        }

        pos = updatePos(pos, oldVel);
        linVel = vec3(-20);
    }

    gl_Position = vec4(pos, 1.0);

    vPos = pos;
    vLinVel = linVel;
}