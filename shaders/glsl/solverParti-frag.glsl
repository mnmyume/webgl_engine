precision mediump float;

#value colorSampler:3
uniform sampler2D colorSampler;

varying float outputPercentLife;

void main(void) {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);
    if(outputPercentLife >= 0.0 && length(p) < 1.0) {
    // gl_FragColor = texture2D(colorSampler, gl_PointCoord);
         gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    } else {
        discard;
    }
}
