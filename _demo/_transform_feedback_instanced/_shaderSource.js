export { vsEmitSource, fsEmitSource, vsDrawSource, fsDrawSource };

const vsEmitSource = `
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

layout(location = OFFSET_LOCATION) in vec2 a_offset;
layout(location = ROTATION_LOCATION) in float a_rotation;

out vec2 v_offset;
out float v_rotation;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
    float theta = M_2PI * rand(vec2(u_time, a_rotation + a_offset.x + a_offset.y));
    
    float cos_r = cos(a_rotation);
    float sin_r = sin(a_rotation);
    mat2 rot = mat2(
        cos_r, sin_r,
        -sin_r, cos_r
    );
            
    vec2 p = WANDER_CIRCLE_R * vec2(cos(theta), sin(theta)) + vec2(WANDER_CIRCLE_OFFSET, 0.0);
    vec2 move = normalize(rot * p);
    v_rotation = atan(move.y, move.x);

    v_offset = a_offset + MOVE_DELTA * move;

    // wrapping at edges
    v_offset = vec2 ( 
        v_offset.x > MAP_HALF_LENGTH ? - MAP_HALF_LENGTH : ( v_offset.x < - MAP_HALF_LENGTH ? MAP_HALF_LENGTH : v_offset.x ) , 
        v_offset.y > MAP_HALF_LENGTH ? - MAP_HALF_LENGTH : ( v_offset.y < - MAP_HALF_LENGTH ? MAP_HALF_LENGTH : v_offset.y )
        );

    gl_Position = vec4(v_offset, 0.0, 1.0);
}
`;

const fsEmitSource = `
#version 300 es
precision highp float;
precision highp int;

void main()
{
}
`;

const vsDrawSource = `
#version 300 es
#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1
#define POSITION_LOCATION 2
#define COLOR_LOCATION 3

precision highp float;
precision highp int;

layout(location = POSITION_LOCATION) in vec2 a_position;
layout(location = ROTATION_LOCATION) in float a_rotation;
layout(location = OFFSET_LOCATION) in vec2 a_offset;
layout(location = COLOR_LOCATION) in vec3 a_color;

out vec3 v_color;

void main()
{
    v_color = a_color;

    float cos_r = cos(a_rotation);
    float sin_r = sin(a_rotation);
    mat2 rot = mat2(
        cos_r, sin_r,
        -sin_r, cos_r
    );
    gl_Position = vec4(rot * a_position + a_offset, 0.0, 1.0);
}
`;

const fsDrawSource = `
#version 300 es
#define ALPHA 0.9

precision highp float;
precision highp int;

in vec3 v_color;

out vec4 color;

void main()
{
    color = vec4(v_color * ALPHA, ALPHA);
}
`;