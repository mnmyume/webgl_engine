precision mediump float;

#value colorSampler:2
uniform sampler2D colorSampler;

varying float outputPercentLife;

void main(void) {

    if(outputPercentLife > 0.0) {
        gl_FragColor = texture2D(colorSampler, gl_PointCoord);
    } else {
        discard;
    }
}
