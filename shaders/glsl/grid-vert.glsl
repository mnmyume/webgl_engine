#version 300 es
precision mediump float;
precision mediump int;
#include "./includes/canvas-mode-transform.glsl"
#define VERTEX_LOCATION 0
#define UV_LOCATION 1

#buffer aVertex:gridBuffer size:2 stride:16 offset:0
layout(location = VERTEX_LOCATION) in vec2 aVertex;

#buffer aUV:gridBuffer size:2 stride:16 offset:8
layout(location = UV_LOCATION) in vec2 aUV;


#value uGridMode:1024  //1024 regular, 2048 iso
uniform int uGridMode;

#value uUnitSize:1
uniform float uUnitSize;

uniform mat4 _uni_viewMat;
uniform mat4 _uni_projMat;

#value depth:-100.5
uniform float depth;


out vec2 vVertex;
out vec2 vUV;


void main(void) {

    mat3 isoMat = GET_CANVAS_MAT(uGridMode,uUnitSize);
    vec2 vertex = vec2(aVertex.x, aVertex.y);
    gl_Position = _uni_projMat * _uni_viewMat * vec4(isoMat*vec3(vertex, depth), 1.0);
    vVertex = vertex;
    vUV = aUV;

}
