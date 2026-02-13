#version 300 es
#define POSITION_LOCATION 0
#define UV_LOCATION 1

precision highp float;
precision highp int;

layout(std140, column_major) uniform;

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#buffer aPos:quadBuffer, size:2, stride:16, offset:0
layout(location = POSITION_LOCATION) in vec2 aPos;

#buffer aUV:quadBuffer, size:2, stride:16, offset:8
layout(location = UV_LOCATION) in vec2 aUV;

uniform float uAspect;

out vec2 vUV;


void main()
{
    vec2 position = vec2(aPos.x/uAspect, aPos.y);
    vUV = aUV;
    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 0.0, 1.0);
}
