#version 300 es
#define POSITION_LOCATION 0
#define COLOR_LOCATION 1

precision highp float;
precision highp int;

#buffer pos:quadBuffer, size:2, stride:20, offset:0
layout(location = POSITION_LOCATION) in vec2 pos;

#buffer color:quadBuffer, size:3, stride:20, offset:8
layout(location = COLOR_LOCATION) in vec4 color;

flat out vec4 v_color;


void main()
{
    v_color = color;
    gl_Position = vec4(pos, 0.0, 1.0);
}
