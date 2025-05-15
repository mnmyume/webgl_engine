export { vsSource, fsSource };


const vsSource = `
#version 300 es
precision highp float;
precision highp int;
        
void main()
{
    gl_Position = vec4(2.f * float(uint(gl_VertexID) % 2u) - 1.f, 2.f * float(uint(gl_VertexID) / 2u) - 1.f, 0.0, 1.0);
}
`;

const fsSource = `
#version 300 es
precision highp float;
precision highp int;

uniform sampler2D diffuse;

uniform vec2 u_imageSize;

out vec4 color;

void main()
{
    color = texture(diffuse, vec2(gl_FragCoord.x, u_imageSize.y - gl_FragCoord.y) / u_imageSize);
}
`;