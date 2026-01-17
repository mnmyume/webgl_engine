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

#include "./includes/aniTex.glsl"

#value uBoidsTexture:0
uniform sampler2D uBoidsTexture;

uniform float uEmitterTexSize;
uniform float uAspect;

out float vGeneration;
out vec2 vLinVel;
out float vAniType;
out float vFrame;

vec2 getEmitterCoord(float particleID, float gridSize) {
    vec2 uv = vec2(mod(particleID,gridSize), floor(particleID/gridSize))/gridSize;
    uv += vec2(1.0/gridSize*0.5);    //  offset to center of pixel
    return uv;
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

    gl_Position = vec4(pos, 0, 1);
    gl_PointSize = 10.0;

    vGeneration = 0.0;
    vLinVel = vel;
    vAniType = 0.0;
    vFrame = 0.0;
}
