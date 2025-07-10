#version 300 es
#define POSITION_LOCATION 0
#define LINEAR_VELOCITY_LOCATION 1
#define ANGULAR_VELOCITY_LOCATION 2
#define GENERATION_LOCATION 3
#define SIZE_LOCATION 4

precision highp float;
precision highp int;

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;



#buffer aPos:particleBuffer, size:3, stride:40, offset:0
layout(location = POSITION_LOCATION) in vec3 aPos;

#buffer aLinVel:particleBuffer, size:3, stride:40, offset:12
layout(location = LINEAR_VELOCITY_LOCATION) in vec3 aLinVel;

#buffer aAngVel:particleBuffer, size:2, stride:40, offset:24
layout(location = ANGULAR_VELOCITY_LOCATION) in vec2 aAngVel;

#buffer aGeneration:particleBuffer, size:1, stride:40, offset:32
layout(location = GENERATION_LOCATION) in float aGeneration;

#buffer aSize:particleBuffer, size:1, stride:40, offset:36
layout(location = SIZE_LOCATION) in float aSize;

out vec3 vLinVel;

void main()
{

    vec3 pos = aPos;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(pos, 1.0);
    gl_PointSize = aSize;

    vLinVel = aLinVel;

}
