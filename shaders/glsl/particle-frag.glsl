#version 300 es
precision highp float;
precision highp int;

#include "./includes/aniTex.glsl"

#value uColorSampler:2
uniform sampler2D uColorSampler;

uniform vec3 uColor;
#value shrink:0.88
uniform float shrink;

in float vAniType;
in float vFrameLife;

out vec4 fragColor;


mat2 rotateVelMatrix(vec2 vel) {

    vec2 col1 = normalize(vec2(vel.x, -vel.y));
    vec2 col2 = normalize(vec2(vel.y, vel.x));

    return mat2(col1, col2);
}

vec2 rotateUV(vec2 uv, mat2 rot) {
    vec2 centeredUV = uv - vec2(0.5, 0.5);
    centeredUV *= shrink;
    vec2 rotatedUV = rot * centeredUV;
    vec2 finalUV = rotatedUV + vec2(0.5);

    return finalUV;
}

bool outTriangle(vec2 uv) {
    if (uv.x < 0.1 || uv.x > 9.0) {
        return true;
    }
    float halfBase = 0.3;
    float progress = 1.0 - uv.x;
    float left = 0.5 - halfBase * progress;
    float right = 0.5 + halfBase * progress;

    bool isOutTriangle = uv.y < left || uv.y > right;
    return isOutTriangle;
}

void main()
{
    // animation texture
    vec2 finalUV = _GEN_ANI_TEX_UV(gl_PointCoord, uColorSampler, vAniType, vFrameLife);

    vec4 color = texture(uColorSampler, finalUV);

    if(color.a<0.9)
        discard;
    fragColor = color;
}