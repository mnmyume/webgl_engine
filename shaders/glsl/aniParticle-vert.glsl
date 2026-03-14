#version 300 es
precision highp float;
precision highp int;

#include "./includes/canvas-mode-transform.glsl"

#define UV_LOCATION 1

#buffer aUV:charBuffer, size:2, stride:8, offset:0
layout(location = UV_LOCATION) in vec2 aUV;

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#value uBoidsTexture0:0
uniform sampler2D uBoidsTexture0;
#value uBoidsTexture1:1
uniform sampler2D uBoidsTexture1;

uniform float uEmitterTexSize;
uniform float uParticleSize;

#value uAniFPS:16.0
uniform float uAniFPS;
uniform float uTime;

#value uTexBoundarySize:[160,360]
uniform vec2 uTexBoundarySize;

#value uTexCellSize:48
uniform float uTexCellSize;

#value uPosition:[0,0]
uniform vec2 uPosition;
#value uDepth:-2.0
uniform float uDepth;


#value uPixelOffsetY:32.0
uniform float uPixelOffsetY;

#value uScale:1.0
uniform float uScale;

#value uAniSeq:14
uniform float uAniSeq;

#value uOffset:[0,0,0]
uniform vec3 uOffset;


#value uCanvasMode:256
uniform int uCanvasMode;

#value uUnitSize:1
uniform float uUnitSize;

out vec2 vUV;
out vec4 vTexBoundary;

vec2 getEmitterCoord(float particleID, float gridSize) {
    vec2 uv = vec2(mod(particleID,gridSize), floor(particleID/gridSize))/gridSize;
    uv += vec2(1.0/gridSize*0.5);    //  offset to center of pixel
    return uv;
}

float getAniType(vec2 vel) {
    // 0: Up-Left, 1: Down-Right, 2: Down-Left, 3: Up-Right

    if (length(vel.x) >= length(vel.y)) {
        return (vel.x >= 0.0) ? 1.0 : 0.0;
    } else {
        return (vel.y > 0.0) ? 2.0 : 3.0;
    }
}

void main()
{
    float particleID = float(gl_InstanceID);
    vec2 emitterUV = getEmitterCoord(particleID, uEmitterTexSize);

    vec4 boidsData0 = texture(uBoidsTexture0,emitterUV);
    vec4 boidsData1 = texture(uBoidsTexture1,emitterUV);
    vec2 pos = boidsData0.xy;
    vec2 vel = boidsData0.zw;
    float frameLife = boidsData1.y;
    float aniType = getAniType(vel);

    int aniIndexX = int(uTime*uAniFPS*uTexBoundarySize.x);
    int aniIndexY = int(aniType*uTexBoundarySize.y);
    vTexBoundary = vec4(aniIndexX,aniIndexY,uTexBoundarySize.x,uTexBoundarySize.y);

    vec2 texIndex = vTexBoundary.xy;
    vec2 texSize  = vTexBoundary.zw*uScale;
    vec2 offset = vec2(0,uPixelOffsetY/uTexCellSize*uUnitSize*uScale);
    vec3 position = CANVAS_TRANSFORM(uCanvasMode|MODE_CHAR, uUnitSize, vec3(pos, uDepth), aUV,texSize,offset);

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 1);

    vUV = vec2(aUV.x, 1.0-aUV.y);
}
