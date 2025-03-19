uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#buffer vertex:quadBuffer, size:3, stride:20, offset:0
attribute vec3 vertex;

#buffer uv:quadBuffer, size:2, stride:20, offset:12
attribute vec2 uv;

varying vec2 vUV;

void main(void) {

    vec3 position = vertex;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 1.0);
    vUV = uv;
}
