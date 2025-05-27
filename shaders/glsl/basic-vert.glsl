uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;


// uniform MVP
// attr pos, uv
// varying uv
#buffer aVertex:quadBuffer, size:3, stride:20, offset:0
attribute vec3 aVertex;

#buffer aUV:quadBuffer, size:2, stride:20, offset:12
attribute vec2 aUV;

varying vec2 vUV;

void main(void) {

    vec3 position = aVertex;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 1.0);
    vUV = aUV;
}
