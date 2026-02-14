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

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#include "./includes/aniTex.glsl"

#value uBoidsTexture:0
uniform sampler2D uBoidsTexture;
#value uBoidsTexture1:1
uniform sampler2D uBoidsTexture1;


uniform float uEmitterTexSize;
uniform float uAspect;

out float vGeneration;
out vec2 vLinVel;
out float vAniType;
out float vFrame;
out float vActiveState;
out float vDebug;

vec2 getEmitterCoord(float particleID, float gridSize) {
    vec2 uv = vec2(mod(particleID,gridSize), floor(particleID/gridSize))/gridSize;
    uv += vec2(1.0/gridSize*0.5);    //  offset to center of pixel
    return uv;
}

float getAniType(vec2 vel) {
    float index = 0.0;
    if (vel.y != 0.0) {
        index = (vel.y > 0.0) ? 3.0 : 2.0;
    }
    else if (vel.x != 0.0) {
        index = (vel.x > 0.0) ? 0.0 : 1.0;
    }
    return index;
}

void main()
{
    // aniTex
    float numFrames = _uAniTexNumFrames;
    float aniFps = _uAniTexFps;

//    float frame = mod(floor(aFrameLife*aniFps) , numFrames);

    float particleID = float(gl_InstanceID);
    vec2 emitterUV = getEmitterCoord(particleID, uEmitterTexSize);

    vec2 pos = vec2(texture(uBoidsTexture,emitterUV).x / uAspect, texture(uBoidsTexture,emitterUV).y);
    vec2 vel = vec2(texture(uBoidsTexture,emitterUV).z / uAspect, texture(uBoidsTexture,emitterUV).w);
    float activeState = texture(uBoidsTexture1,emitterUV).x;
    float aniType = getAniType(vel);
    float distToGoal = texture(uBoidsTexture1,emitterUV).y;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(pos, 0, 1);
    gl_PointSize = 100.0;

    vGeneration = 0.0;
    vLinVel = vel;
    vAniType = aniType;
    vFrame = 0.0;
    vActiveState = activeState;
    vDebug = distToGoal;
}
