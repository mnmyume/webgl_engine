precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

varying float outputSize;
varying vec3 outputCol;
varying float debug;

void main() {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);

    if(outputSize>1.0 && length(p) < 1.0) {
        gl_FragColor = vec4(outputCol, 1.0);
    } else {
        discard;
    }
}
