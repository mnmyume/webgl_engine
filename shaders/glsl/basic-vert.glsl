uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;

attribute vec3 vertex;
attribute vec2 uv;

varying vec2 vUV;

void main(void) {
    float size = 10.0;
    vec3 offset = size * vec3(uv.x, uv.y, 0);
    vec3 position = vertex + offset;

    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);
    vUV = uv;
}
