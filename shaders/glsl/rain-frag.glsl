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
    rainLength = smoothstep(0.0, 0.85, rainLength);
    vec2 halfSeg = rainLength * rainDir.xy * 0.5;
    vec2 origin = vec2(0.5, 0.5);

    // vec2(0.15), vec2(0.85)
    vec2 A = origin + halfSeg;
    vec2 B = origin - halfSeg;


    vec2 p = uv - A;
    vec2 segment = B - A;

    float t = clamp(dot(p, segment) / dot(segment, segment), 0., 1.);
    float v = smoothstep(uRainHeadSize*(1.0-t), 0.0, length(p - segment *t) );
    fragColor = vec4(v,v,v,0.2);
}