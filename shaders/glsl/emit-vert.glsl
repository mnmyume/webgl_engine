#version 300 es
#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1

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


    gl_Position = vec4(1.0, 0.0, 0.0, 1.0);
}