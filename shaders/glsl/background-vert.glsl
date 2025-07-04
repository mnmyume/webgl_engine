#version 300 es
precision highp float;
precision highp int;

out vec2 vUV;

void main()
{
    vec2 vertice = vec2(2.f * float(uint(gl_VertexID) % 2u) - 1.f, 2.f * float(uint(gl_VertexID) / 2u) - 1.f);
    
    gl_Position = vec4(vertice, 0.0, 1.0);

    vUV = vertice;
}