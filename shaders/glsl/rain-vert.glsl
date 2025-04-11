// uniform
uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;

#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

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
varying vec3 outputVel;

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
    uv += vec2(1.0/MAXCOL*0.5); //offset to center of pixel
    return uv;
}

void main() {
    // read position from texture
    vec2 posTexCoord = getSolverCoord(particleID, MAXCOL);

    //  debug = posTexCoord.x;

    vec3 position = texture2D(dataSlot0, posTexCoord).xyz;
    vec3 velocity = texture2D(dataSlot1, posTexCoord).xyz;

    outputSize = texture2D(dataSlot0, posTexCoord).w;
    outputCol = texture2D(dataSlot2, posTexCoord).rgb;
    outputVel = velocity;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position,1);
    gl_PointSize = outputSize;
}
