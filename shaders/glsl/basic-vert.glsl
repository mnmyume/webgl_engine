uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
uniform mat4 _uni_modelMat;

attribute vec3 vertex;
attribute vec2 uv;

varying vec2 vUV;

void main(void) {
    float size = 10.0;
    vec3 offset = size * vec3(uv.x, uv.y, 0);
    vec3 position = vertex + offset;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 1.0);
    vUV = uv;
}
