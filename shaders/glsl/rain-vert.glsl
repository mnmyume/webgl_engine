// uniform
uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;

#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

uniform float uGeneCount;
uniform float uPartiCount;
uniform float uMAXCOL;

#value uDataSlot0:0
uniform sampler2D uDataSlot0;
#value uDataSlot1:1
uniform sampler2D uDataSlot1;
#value uDataSlot2:2
uniform sampler2D uDataSlot2;
#value uDataSlot3:3
uniform sampler2D uDataSlot3;

// attribute
#buffer aParticleID:partiBuffer, size:1, stride:4, offset:0
attribute float aParticleID;

varying float vSize;
varying vec3 vColor;
varying vec3 vVel;

varying float vDebug;

const float NUM_COMPONENTS = 1.0;
float pidPixels(float pid){
    return  pid*NUM_COMPONENTS;
}
float pidPixelsOffset(float pid, float offset){
    return  pid*NUM_COMPONENTS + offset + 0.5;
}

vec2 getSolverCoord(float pid, float uMAXCOL){
    vec2 uv =  vec2(mod(pid,uMAXCOL), floor(pid/uMAXCOL)) / uMAXCOL;
    uv += vec2(1.0/uMAXCOL*0.5); //offset to center of pixel
    return uv;
}

void main() {
    // read position from texture
    vec2 solverCoord = getSolverCoord(aParticleID, uMAXCOL);

    //  vDebug = solverCoord.x;

    vec3 position = texture2D(uDataSlot0, solverCoord).xyz;
    vec3 velocity = texture2D(uDataSlot1, solverCoord).xyz;

    vSize = texture2D(uDataSlot0, solverCoord).w;
    vColor = texture2D(uDataSlot3, solverCoord).rgb;
    vVel = velocity;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position,1);
    gl_PointSize = vSize;
}
