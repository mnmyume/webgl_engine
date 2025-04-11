precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

uniform float blurRadius;

varying float outputSize;
varying vec3 outputCol;
varying float debug;

float segment(vec2 p, vec2 a, vec2 b) {
    p -= a;
    b -= a;
    return length(p - b * clamp(dot(p, b) / dot(b, b), 0.0, 1.0));
}

void main() {
    vec2 uv = gl_PointCoord.xy;
    float rainHeadSize = 0.02;
    float rainLength = 1.0;
    vec3 rainDir = normalize(vec3(-1, -1, 0));

    // rainLength *= sqrt(rainDir.x*rainDir.x + rainDir.y*rainDir.y);
    vec2 origin = vec2(0.5),
         halfSeg = rainLength * vec2(rainDir.xy),
         A = origin + halfSeg,
         B = origin - halfSeg;

    float d = segment(uv, A, B);
    float line = smoothstep(0.01,0.0,d);

    gl_FragColor = vec4(vec3(line),1);
    // gl_FragColor = vec4(1);
}
