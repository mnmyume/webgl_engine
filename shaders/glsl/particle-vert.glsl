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

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#value uBoidsTexture:0
uniform sampler2D uBoidsTexture;

uniform float uEmitterGridSize;

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
    vec2 emitterUV = getEmitterCoord(particleID, uEmitterGridSize);

    vec2 pos = texture(uBoidsTexture,emitterUV).xy;
    vec2 vel = texture(uBoidsTexture,emitterUV).zw;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(pos, 0, 1);
    gl_PointSize = 10.0;

    vGeneration = 0.0;
    vLinVel = vel;
    vAniType = 0.0;
    vFrame = 0.0;
}
