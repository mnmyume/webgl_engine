#include "./testFolder/aniTex.glsl"
#extension GL_OES_texture_float : enable
//https://registry.khronos.org/OpenGL/extensions/OES/OES_texture_float.txt
#extension GL_OES_texture_float_linear : enable

// uniform
uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

uniform float time;
uniform float lifeTime;
uniform float geneCount;
uniform float partiCount;
uniform float MAXCOL;

#value dataSlot0:0
uniform sampler2D dataSlot0;
#value dataSlot1:1
uniform sampler2D dataSlot1;
#value dataSlot2:2
uniform sampler2D dataSlot2;
#value dataSlot3:3
uniform sampler2D dataSlot3;

// attribute
#buffer particleID:partiBuffer, size:1, stride:4, offset:0
attribute float particleID;

varying float outputSize;
varying vec3 outputCol;

varying float debug;

const float NUM_COMPONENTS = 1.0;
float pidPixels(float pid){
    return  pid*NUM_COMPONENTS;
}
float pidPixelsOffset(float pid, float offset){
    return  pid*NUM_COMPONENTS + offset + 0.5;
}

vec2 getSolverCoord(float pid, float MAXCOL){
    vec2 uv =  vec2(mod(pid,MAXCOL), floor(pid/MAXCOL)) / MAXCOL;
    uv += vec2(1.0/MAXCOL*0.5); // offset to center of pixel
    return uv;
}

void main() {

    // read position from texture
    vec2 solverCoord = getSolverCoord(particleID, MAXCOL);

    vec3 position = texture2D(dataSlot0, solverCoord).xyz;
    float startTime = texture2D(dataSlot2, solverCoord).w;

    // aniTex
    float texWidth = _ANI_TEX_0.x;
    float texHeight = _ANI_TEX_0.y;
    float tileSize = _ANI_TEX_0.z;
    float numFrames = _ANI_TEX_0.w;
    float frameDuration = 1.0 / _ANI_TEX_0_FPS;

    float localTime = mod(time - startTime, lifeTime) ;
    float percentLife = localTime / lifeTime;
    float frame = mod(floor(localTime / frameDuration), numFrames);



    _GEN_ANI_TEX_UV(texWidth, texHeight, tileSize, frame);

    outputSize = texture2D(dataSlot0, solverCoord).w;
    outputCol = texture2D(dataSlot2, solverCoord).xyz;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position,1);
    gl_PointSize = outputSize;
}
