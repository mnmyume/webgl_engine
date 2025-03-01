uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
uniform mat4 _uni_modelMat;
uniform float size;

attribute vec3 vertex;
attribute vec2 uv;

varying vec2 vUV;

void main(void) {

    vec3 offset = size * vec3(uv.x, 0, uv.y);
    vec3 position = vertex + offset;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 1.0);
    vUV = uv;
}
