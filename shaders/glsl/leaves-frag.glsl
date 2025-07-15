#version 300 es
precision highp float;
precision highp int;


#value uColorSampler:0
uniform sampler2D uColorSampler;


uniform vec3 uColor;


in float vGeneration;
in vec3 vLinVel;
in vec3 vAcc;

in vec4 _ANI_TEX_UV;


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

    vec2 localUV = vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y);

    vec2 aniTexCoord = _ANI_TEX_UV.xy;
    float texColNum = _ANI_TEX_UV.z;
    float texRowNum = _ANI_TEX_UV.w;

    mat2 rot = rotateVelMatrix(vLinVel.xy);
    vec2 rotatedLocalUV = rotateUV(localUV, rot);

    vec2 finalUV = rotatedLocalUV / vec2(texColNum, texRowNum) + aniTexCoord;

    fragColor = texture(uColorSampler, finalUV);
//    vec4 texColor = texture(uColorSampler, finalUV);
//    float accLength = length(vAcc);
//    float accDir = sign(vAcc.x);
//    vec4 blendColor = vec4(0);
//    if(accDir > 0.0)
//        blendColor = vec4(accLength,0,0,1);
//    else
//        blendColor = vec4(0,accLength,0,1);
//
//    float blendFactor = 0.5;
//    fragColor = mix(texColor, blendColor, blendFactor);
}