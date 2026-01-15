#version 300 es
precision highp float;
precision highp int;

#value uTex:0
uniform sampler2D uTex;

uniform vec3 uColor;

in vec2 vUV;

out vec4 fragColor;


void main()
{
//    color = vec4(uColor, 1);
    fragColor = texture(uTex, vUV);
}
