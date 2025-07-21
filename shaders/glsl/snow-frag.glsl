#version 300 es
precision highp float;
precision highp int;


uniform vec3 uColor;
#value uRadius:0.8
uniform float uRadius;
#value uBlurRadius:0.1
uniform float uBlurRadius;
#value uPixelNum:8
uniform float uPixelNum;


in float vGeneration;


out vec4 fragColor;


void main()
{

//     vec2 p = 2.0 * (gl_PointCoord - 0.5);
    float pixelNum = uPixelNum / 2.0;
    vec2 p = floor((2.0 * (gl_PointCoord - 0.5))*pixelNum)/pixelNum;
    float dist = length(p);

    if( dist > uRadius || vGeneration < 0.0 ) {
        discard;
    } else {
        float alpha = dist < uBlurRadius ? 1.0 : smoothstep(1.0, uBlurRadius, dist);
        fragColor = vec4(uColor, alpha);
    }
}