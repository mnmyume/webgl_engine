#version 300 es
precision highp float;
precision highp int;


uniform vec3 uColor;
#value uPixelNum:8
uniform float uPixelNum;
#value uRainHeadSize:0.16
uniform float uRainHeadSize;


in float vGeneration;
in vec3 vLinVel;


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

    vec2 uv = floor(vec2(gl_PointCoord.x, 1.-gl_PointCoord.y)*uPixelNum)/uPixelNum;

    vec3 rainDir = normalize(vLinVel);

    float rainLength = length(vLinVel);
    rainLength = clamp(rainLength, .0, .4);
    vec2 origin = vec2(0.5),
    halfSeg = rainLength * vec2(rainDir.xy),
    A = origin + halfSeg,
    B = origin - halfSeg;


    vec2 p = uv - A;
    B -= A;

    float t = clamp(dot(p, B) / dot(B, B), 0., 1.);
    float v = smoothstep(uRainHeadSize*(1.-t), .0, length(p - B *t) );
    fragColor = vec4(v,v,v,0.2);
}