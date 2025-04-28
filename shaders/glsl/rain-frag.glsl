precision mediump float;

#value uColorSampler:1
uniform sampler2D uColorSampler;

uniform float uBlurRadius;
uniform float uPixelNum;

varying float vSize;
varying vec3 vColor;
varying vec3 vVel;

varying float vDebug;

float rainHeadSize = 0.16;

void main() {
    vec2 uv = floor(vec2(gl_PointCoord.x, 1.-gl_PointCoord.y)*uPixelNum)/uPixelNum;

    vec3 rainDir = normalize(vVel);

    float rainLength = length(vVel);
    rainLength = clamp(rainLength, .0, .4);
    vec2 origin = vec2(0.5),
         halfSeg = rainLength * vec2(rainDir.xy),
         A = origin + halfSeg,
         B = origin - halfSeg;


    vec2 p = uv - A;
    B -= A;

    float t = clamp(dot(p, B) / dot(B, B), 0., 1.);
    float v = smoothstep(rainHeadSize*(1.-t), .0, length(p - B *t) );
    gl_FragColor = vec4(v,v,v,0.2);
}
