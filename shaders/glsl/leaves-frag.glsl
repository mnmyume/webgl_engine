#version 300 es
precision highp float;
precision highp int;

#include "./includes/aniTex.glsl"

#value uColorSampler:0
uniform sampler2D uColorSampler;


uniform vec3 uColor;


in float vGeneration;
in vec3 vLinVel;
in float vFrame;


out vec4 fragColor;


mat2 rotateVelMatrix(vec2 vel) {

    vec2 col1 = normalize(vec2(vel.x, -vel.y));
    vec2 col2 = normalize(vec2(vel.y, vel.x));

    return mat2(col1, col2);
}

vec2 rotateUV(vec2 uv, mat2 rot) {
    vec2 centeredUV = uv - vec2(0.5, 0.5);
    vec2 rotatedUV = rot * centeredUV;
    vec2 finalUV = rotatedUV + vec2(0.5);

    return finalUV;
}


void main()
{

    if(vGeneration < 0.0)
        discard;


    float tileSize = _ANI_TEX_0.z;

    ivec2 aniTexCoord = _GEN_ANI_TEX_UV(uColorSampler, tileSize, vFrame);

    vec2 localUV = vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y);

    mat2 rot = rotateVelMatrix(vLinVel.xy);
    vec2 rotatedLocalUV = rotateUV(localUV, rot);

    ivec2 finalUV = ivec2(rotatedLocalUV) + aniTexCoord;

    fragColor = texelFetch(uColorSampler, finalUV, 0);

}