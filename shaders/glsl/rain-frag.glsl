precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

uniform float blurRadius;

varying float outputSize;
varying vec3 outputCol;
varying vec3 outputVel;

varying float debug;



float rainHeadSize = 0.02;

void main() {
    vec2 uv = gl_PointCoord.xy;
    float rainLength = length(outputVel);
    vec3 rainDir = normalize(outputVel);

    rainLength *= sqrt(rainDir.x*rainDir.x + rainDir.y*rainDir.y);
    vec2 origin = vec2(0.5),
         halfSeg = rainLength * vec2(rainDir.xy),
         A = origin + halfSeg,
         B = origin - halfSeg;


    vec2 p = uv - A;
    B -= A;

    float t = clamp(dot(p, B) / dot(B, B), 0., 1.);
    float v = smoothstep(rainHeadSize*(1.-t), .0, length(p - B *t) );
    gl_FragColor = vec4(v);
}
