precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

uniform float uBlurRadius;
uniform float uPixelNum;

varying float outputSize;
varying vec3 outputCol;
varying vec3 outputVel;

varying float debug;

mat2 getRotationMatrix(vec2 dir) {
    float angle = atan(dir.y, dir.x);
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

void main() {
    // vec2 uv = floor(vec2(gl_PointCoord.x, 1.-gl_PointCoord.y)*uPixelNum)/uPixelNum;
    vec2 uv = vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y);

    vec2 arrowDir = normalize(outputVel.xy);

    mat2 rot = getRotationMatrix(arrowDir);

    vec2 centeredUV = uv - vec2(0.5, 0.5);
    vec2 rotatedUV = rot * centeredUV;

    float lineWidth = 0.1;
    float alpha = smoothstep(lineWidth, 0.0, abs(rotatedUV.y));

    gl_FragColor = vec4(outputCol, alpha);
}
