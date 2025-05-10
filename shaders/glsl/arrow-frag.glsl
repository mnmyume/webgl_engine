precision mediump float;

#value uColorSampler:4
uniform sampler2D uColorSampler;

uniform float uBlurRadius;
uniform float uPixelNum;

varying float vSize;
varying vec3 vColor;
varying vec3 vVel;

varying float vDebug;

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

void main() {
    // vec2 uv = floor(vec2(gl_PointCoord.x, 1.-gl_PointCoord.y)*uPixelNum)/uPixelNum;
    vec2 uv = vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y);

    mat2 rot = rotateVelMatrix(vVel.xy);

    vec2 rotUV = rotateUV(uv, rot);

    gl_FragColor = texture2D(uColorSampler, rotUV);
}
