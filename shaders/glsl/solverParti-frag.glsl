precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

varying float outputSize;

void main() {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);
    if(outputSize>1.0 && length(p) < 1.0) {
        // gl_FragColor = texture2D(colorSampler, gl_PointCoord);
        gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    } else {
        discard;
    }
}
