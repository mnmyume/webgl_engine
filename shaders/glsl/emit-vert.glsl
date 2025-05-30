#version 300 es
#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1

#define M_2PI 6.28318530718
#define MAP_HALF_LENGTH 1.01
#define WANDER_CIRCLE_R 0.01
#define WANDER_CIRCLE_OFFSET 0.04
#define MOVE_DELTA 0.001

precision highp float;
precision highp int;

uniform float u_time;

#buffer a_offset:emitBuffer, size:2, stride:12, offset:0
layout(location = OFFSET_LOCATION) in vec2 a_offset;

#buffer a_rotation:emitBuffer, size:1, stride:12, offset:8
layout(location = ROTATION_LOCATION) in float a_rotation;

out vec2 v_offset;
out float v_rotation;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{


    gl_Position = vec4(v_offset, 0.0, 1.0);
}