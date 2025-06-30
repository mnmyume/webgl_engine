#version 300 es
#define POSITION_LOCATION 0
#define LINEAR_VELOCITY_LOCATION 1
#define VERTICE_LOCATION 2
#define UV_LOCATION 3

precision highp float;
precision highp int;

//#buffer aPos:particleBuffer, size:3, stride:24, offset:0
//layout(location = POSITION_LOCATION) in vec3 aPos;
//#buffer aLinVel:particleBuffer, size:3, stride:24, offset:0
//layout(location = LINEAR_VELOCITY_LOCATION) in vec3 aLinVel;


#buffer aVertice:particleBuffer, size:3, stride:20, offset:0
layout(location = VERTICE_LOCATION) in vec3 aVertice;
#buffer aUV:particleBuffer, size:2, stride:20, offset:12
layout(location = UV_LOCATION) in vec2 aUV;

vec3 vertice[6] = vec3[6](
    vec3(-0.5, 0, -0.5),
    vec3(-0.5, 0,  0.5),
    vec3( 0.5, 0,  0.5),
    vec3(-0.5, 0, -0.5),
    vec3( 0.5, 0,  0.5),
    vec3( 0.5, 0, -0.5)
);

out vec2 vUV;
out vec3 vColor;

void main()
{
//    vec3 linVel = aLinVel;
//    vec3 pos = vec3(vertice[gl_VertexID] + aPos) + linVel*0.0;

    vec3 pos = aVertice;

    gl_Position = vec4(pos, 1.0);
    vUV = aUV;
}
