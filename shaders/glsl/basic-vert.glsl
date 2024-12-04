#include "./testFolder/aniTex.glsl"


attribute vec3 gridIndex;
attribute vec2 uv;

uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;

varying vec2 vTexCoord;

void main(void) {

    vec3 origin = gridIndex;
    vec3 offset = vec3(uv.x, uv.y, 0);
    vec3 position = origin + offset;

    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);
    vTexCoord = uv;
}
