#version 300 es
#define POSITION_LOCATION 0
#define GENERATION_LOCATION 1
#define SIZE_LOCATION 2
#define FRAME_LIFE_LOCATION 3
#define ANI_TYPE_LOCATION 4

precision highp float;
precision highp int;

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#buffer aPos:mapBuffer, size:3, stride:28, offset:0
layout(location = POSITION_LOCATION) in vec3 aPos;

#buffer aGeneration:mapBuffer, size:1, stride:28, offset:12
layout(location = GENERATION_LOCATION) in float aGeneration;

#buffer aSize:mapBuffer, size:1, stride:28, offset:16
layout(location = SIZE_LOCATION) in float aSize;

#buffer aFrameLife:mapBuffer, size:1, stride:28, offset:20
layout(location = FRAME_LIFE_LOCATION) in float aFrameLife;

#buffer aAniType:mapBuffer, size:1, stride:28, offset:24
layout(location = ANI_TYPE_LOCATION) in float aAniType;

out float vGeneration;

void main()
{

    vec3 pos = aPos;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(pos, 1.0);
    gl_PointSize = 10.0;

    vGeneration = aGeneration;
}
