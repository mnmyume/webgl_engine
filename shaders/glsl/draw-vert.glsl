#version 300 es
#define POSITION_LOCATION 0
#define LINEAR_VELOCITY_LOCATION 1

precision highp float;
precision highp int;

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#buffer aPos:particleBuffer, size:3, stride:24, offset:0
layout(location = POSITION_LOCATION) in vec3 aPos;
#buffer aLinVel:particleBuffer, size:3, stride:24, offset:0
layout(location = LINEAR_VELOCITY_LOCATION) in vec3 aLinVel;



out vec2 vUV;
out vec3 vColor;

void main()
{
    vec3 linVel = aLinVel;
    vec3 pos = aPos + linVel * 0.0;

    //    vec3 pos = aVertice;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(pos, 1.0);
    gl_PointSize = 50.0;
    //    vUV = aUV;
}
