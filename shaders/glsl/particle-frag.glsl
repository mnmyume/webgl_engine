#version 300 es
precision highp float;
precision highp int;


uniform vec3 uColor;
#value uAlpha:1.0
uniform float uAlpha;

in float vGeneration;

out vec4 fragColor;


void main()
{

//    if(vGeneration < 0.0)
//        discard;

    fragColor = vec4(uColor, uAlpha);
}