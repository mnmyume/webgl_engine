precision mediump float;

#value colorSampler:2
uniform sampler2D colorSampler;

varying float teststartTime;

void main(void) {

    vec4 color = vec4(0.14, 0.62, 1, 0.6);
    gl_FragColor = vec4(0, teststartTime, 0, 1);
    // gl_FragColor = texture2D(colorSampler, gl_PointCoord);
    
}
