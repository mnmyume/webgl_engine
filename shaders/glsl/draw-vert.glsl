#version 300 es
#define POSITION_LOCATION 0
#define LINEAR_VELOCITY_LOCATION 1

precision highp float;
precision highp int;

#buffer a_pos:particleBuffer, size:3, stride:24, offset:0
layout(location = POSITION_LOCATION) in vec3 a_pos;
#buffer a_linVel:particleBuffer, size:3, stride:24, offset:0
layout(location = LINEAR_VELOCITY_LOCATION) in vec3 a_linVel;

vec3 vertice[6] = vec3[6](
    vec3(-0.5, 0, -0.5),
    vec3(-0.5, 0,  0.5),
    vec3( 0.5, 0,  0.5),
    vec3(-0.5, 0, -0.5),
    vec3( 0.5, 0,  0.5),
    vec3( 0.5, 0, -0.5)
);

out vec3 v_color;

void main()
{
    vec3 linVel = a_linVel;
    vec3 pos = vec3(vertice[gl_VertexID] + a_pos) + linVel*0.0;

    gl_Position = vec4(pos, 1.0);
}