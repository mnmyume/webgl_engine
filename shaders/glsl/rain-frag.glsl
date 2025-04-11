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
    vec2 uv = vec2(gl_PointCoord.x, 1.-gl_PointCoord.y);
    vec3 rainDir = normalize(outputVel);

    float rainLength = length(outputVel);
    rainLength *= sqrt(rainDir.x*rainDir.x + rainDir.y*rainDir.y);
    rainLength /= 10.0;
    rainLength = clamp(rainLength, .0, .2);
    vec2 origin = vec2(0.5),
         halfSeg = rainLength * vec2(rainDir.xy),
         A = origin + halfSeg,
         B = origin - halfSeg;


    vec2 p = uv - A;
    B -= A;

    float t = clamp(dot(p, B) / dot(B, B), 0., 1.);
    float v = smoothstep(rainHeadSize*(1.-t), .0, length(p - B *t) );
    gl_FragColor = vec4(uv, .0,1.0);
    gl_FragColor += vec4(v,v,v,1.0);
}
